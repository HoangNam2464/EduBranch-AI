import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { MinioService } from "../../common/minio/minio.service";
import { AiClientService } from "../../common/ai-client/ai-client.service";
import { randomUUID } from "crypto";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

@Injectable()
export class MaterialService {
  private readonly logger = new Logger(MaterialService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly minio: MinioService,
    private readonly aiClient: AiClientService,
  ) {}

  async uploadMaterial(
    courseId: string,
    file: Express.Multer.File,
    uploadedBy: string,
  ) {
    if (!file) {
      throw new BadRequestException("No file provided");
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type: ${file.mimetype}. Only PDF and DOCX are allowed.`,
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestException("File exceeds maximum allowed size (50MB)");
    }

    // Verify course exists and belongs to the uploader
    const courseRes = await this.db.query(
      "SELECT id, lecturer_id FROM courses WHERE id = $1",
      [courseId],
    );

    if (courseRes.rows.length === 0) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }

    if (courseRes.rows[0].lecturer_id !== uploadedBy) {
      throw new ForbiddenException("You can only upload materials to your own courses");
    }

    const materialId = randomUUID();
    const safeFilename = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const objectKey = `materials/${courseId}/${materialId}/${safeFilename}`;

    // 1. Upload to MinIO
    await this.minio.putObject(
      objectKey,
      file.buffer,
      file.size,
      file.mimetype,
    );

    // 2. Insert into teaching_materials with PENDING status
    const insertRes = await this.db.query(
      `INSERT INTO teaching_materials (
         id, original_filename, stored_object_key, mime_type, size_bytes,
         course_id, uploaded_by, processing_status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
       RETURNING *`,
      [
        materialId,
        file.originalname,
        objectKey,
        file.mimetype,
        file.size,
        courseId,
        uploadedBy,
      ],
    );

    const material = insertRes.rows[0];

    // 3. Trigger AI Ingestion
    try {
      const aiResult = await this.aiClient.processMaterial({
        material_id: materialId,
        s3_object_key: objectKey,
        course_id: courseId,
        mime_type: file.mimetype,
      });

      // 4. Update status to COMPLETED
      const updateRes = await this.db.query(
        `UPDATE teaching_materials
         SET processing_status = 'COMPLETED',
             chunk_count = $1,
             updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [aiResult.chunk_count, materialId],
      );
      return updateRes.rows[0];
    } catch (err: any) {
      this.logger.error(`AI processing error for material ${materialId}:`, err);
      const updateRes = await this.db.query(
        `UPDATE teaching_materials
         SET processing_status = 'FAILED',
             processing_error = $1,
             updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [err.message || "AI ingestion failed", materialId],
      );
      return updateRes.rows[0];
    }
  }

  /** Throws unless the course exists and is owned by this lecturer (BE-005 ownership gate). */
  private async assertCourseOwner(courseId: string, lecturerId: string) {
    const res = await this.db.query("SELECT lecturer_id FROM courses WHERE id = $1", [courseId]);
    if (res.rows.length === 0) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }
    if (res.rows[0].lecturer_id !== lecturerId) {
      throw new ForbiddenException("You can only access materials of your own courses");
    }
  }

  /** Loads a material and checks that the requesting lecturer owns its course. */
  private async getOwnedMaterial(materialId: string, lecturerId: string) {
    const res = await this.db.query(
      `SELECT m.id, m.original_filename, m.stored_object_key, m.mime_type, m.size_bytes,
              m.course_id, m.uploaded_by, m.processing_status, m.chunk_count, m.processing_error,
              m.uploaded_at, m.updated_at, c.lecturer_id
       FROM teaching_materials m
       JOIN courses c ON c.id = m.course_id
       WHERE m.id = $1`,
      [materialId],
    );
    if (res.rows.length === 0) {
      throw new NotFoundException(`Teaching material ${materialId} not found`);
    }
    const { lecturer_id, ...material } = res.rows[0];
    if (lecturer_id !== lecturerId) {
      throw new ForbiddenException("You can only access materials of your own courses");
    }
    return material;
  }

  async getMaterialsByCourse(courseId: string, lecturerId: string) {
    await this.assertCourseOwner(courseId, lecturerId);
    const res = await this.db.query(
      `SELECT id, original_filename, stored_object_key, mime_type, size_bytes,
              course_id, uploaded_by, processing_status, chunk_count, processing_error,
              uploaded_at, updated_at
       FROM teaching_materials
       WHERE course_id = $1
       ORDER BY uploaded_at DESC`,
      [courseId],
    );
    return res.rows;
  }

  async getMaterialById(materialId: string, lecturerId: string) {
    return this.getOwnedMaterial(materialId, lecturerId);
  }

  /**
   * Deletes a material owned by the lecturer. Chunks are removed by ON DELETE CASCADE.
   * The stored object is removed afterwards; a storage failure is logged, not surfaced,
   * because the database record (the source of truth) is already gone.
   */
  async deleteMaterial(materialId: string, lecturerId: string) {
    const material = await this.getOwnedMaterial(materialId, lecturerId);
    await this.db.query("DELETE FROM teaching_materials WHERE id = $1", [materialId]);
    try {
      await this.minio.removeObject(material.stored_object_key);
    } catch (err: any) {
      this.logger.warn(`Material ${materialId} deleted but object removal failed: ${err?.message}`);
    }
    this.logger.log(`Material deleted: ${materialId} by lecturer ${lecturerId}`);
    return { id: materialId, deleted: true };
  }

  /** Re-runs ingestion for a FAILED (or stuck PENDING) material. */
  async reprocessMaterial(materialId: string, lecturerId: string) {
    const material = await this.getOwnedMaterial(materialId, lecturerId);
    if (material.processing_status === "COMPLETED") {
      throw new BadRequestException("Material is already processed");
    }
    await this.db.query("DELETE FROM document_chunks WHERE material_id = $1", [materialId]);
    await this.db.query(
      `UPDATE teaching_materials
       SET processing_status = 'PENDING', processing_error = NULL, chunk_count = 0, updated_at = NOW()
       WHERE id = $1`,
      [materialId],
    );
    try {
      const aiResult = await this.aiClient.processMaterial({
        material_id: materialId,
        s3_object_key: material.stored_object_key,
        course_id: material.course_id,
        mime_type: material.mime_type,
      });
      const res = await this.db.query(
        `UPDATE teaching_materials
         SET processing_status = 'COMPLETED', chunk_count = $1, updated_at = NOW()
         WHERE id = $2 RETURNING *`,
        [aiResult.chunk_count, materialId],
      );
      return res.rows[0];
    } catch (err: any) {
      this.logger.error(`AI reprocessing error for material ${materialId}:`, err);
      const res = await this.db.query(
        `UPDATE teaching_materials
         SET processing_status = 'FAILED', processing_error = $1, updated_at = NOW()
         WHERE id = $2 RETURNING *`,
        [err?.message || "AI ingestion failed", materialId],
      );
      return res.rows[0];
    }
  }

  /** Source chunks of a material, for the RAG Source Inspector (FE-006). Embeddings are not returned. */
  async getMaterialChunks(materialId: string, lecturerId: string) {
    const material = await this.getOwnedMaterial(materialId, lecturerId);
    const res = await this.db.query(
      `SELECT id, chunk_index, chunk_text, created_at
       FROM document_chunks
       WHERE material_id = $1
       ORDER BY chunk_index ASC`,
      [materialId],
    );
    return {
      material: {
        id: material.id,
        original_filename: material.original_filename,
        processing_status: material.processing_status,
        chunk_count: material.chunk_count,
      },
      chunks: res.rows,
    };
  }
}
