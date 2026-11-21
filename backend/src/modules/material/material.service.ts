import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { AuditService } from "../../common/audit/audit.service";
import { MinioService } from "../../common/minio/minio.service";
import { AiClientService } from "../../common/ai-client/ai-client.service";
import { randomUUID } from "crypto";
import { UpdateMaterialDto } from "./dto/update-material.dto";

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
    @Optional() private readonly audit?: AuditService,
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
      "SELECT id, lecturer_id, is_active FROM courses WHERE id = $1",
      [courseId],
    );

    if (courseRes.rows.length === 0) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }

    if (courseRes.rows[0].lecturer_id !== uploadedBy) {
      throw new ForbiddenException("You can only upload materials to your own courses");
    }

    // C1-B / OPD-014: an archived course keeps its data but accepts no new materials
    if (courseRes.rows[0].is_active === false) {
      throw new ConflictException("Course is archived");
    }

    const materialId = randomUUID();
    const objectKey =
      typeof this.minio.generateSecureObjectKey === "function"
        ? this.minio.generateSecureObjectKey(courseId, file.originalname)
        : `materials/${courseId}/${randomUUID()}/${file.originalname}`;

    // 1. Upload to MinIO (AC-1, AC-2, AC-3)
    await this.minio.putObject(
      objectKey,
      file.buffer,
      file.size,
      file.mimetype,
    );

    // 2. Insert into teaching_materials with PENDING status, only while the course is
    //    still active (C1-B: closes the window between the check above and this insert)
    const insertRes = await this.db.query(
      `INSERT INTO teaching_materials (
         id, original_filename, stored_object_key, mime_type, size_bytes,
         course_id, uploaded_by, processing_status
       )
       SELECT $1, $2, $3, $4, $5, $6, $7, 'PENDING'
       FROM courses WHERE id = $6 AND is_active = TRUE
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

    if (insertRes.rows.length === 0) {
      await this.minio.removeObject(objectKey);
      throw new ConflictException("Course is archived");
    }

    const material = insertRes.rows[0];
    await this.audit?.record({
      type: "MATERIAL_UPLOADED",
      outcome: "SUCCESS",
      actorId: uploadedBy,
      targetId: materialId,
      meta: { courseId, fileName: file.originalname },
    });

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

  async getMaterialsByCourse(courseId: string, requesterId: string) {
    const courseRes = await this.db.query(
      "SELECT id, lecturer_id FROM courses WHERE id = $1",
      [courseId],
    );
    if (courseRes.rows.length === 0) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }
    if (courseRes.rows[0].lecturer_id !== requesterId) {
      throw new ForbiddenException("You can only view materials in your own courses");
    }
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

  async getMaterialById(materialId: string, requesterId: string) {
    const res = await this.db.query(
      `SELECT tm.id, tm.original_filename, tm.stored_object_key, tm.mime_type, tm.size_bytes,
              tm.course_id, tm.uploaded_by, tm.processing_status, tm.chunk_count, tm.processing_error,
              tm.uploaded_at, tm.updated_at, c.lecturer_id
       FROM teaching_materials tm
       JOIN courses c ON c.id = tm.course_id
       WHERE tm.id = $1`,
      [materialId],
    );
    if (res.rows.length === 0) {
      throw new NotFoundException(`Teaching material ${materialId} not found`);
    }
    if (res.rows[0].lecturer_id !== requesterId) {
      throw new ForbiddenException("You can only view materials in your own courses");
    }
    const { lecturer_id, ...material } = res.rows[0];
    return material;
  }

  async deleteMaterial(materialId: string, lecturerId: string) {
    const material = await this.getMaterialById(materialId, lecturerId);
    await this.minio.removeObject(material.stored_object_key);
    await this.db.query("DELETE FROM teaching_materials WHERE id = $1", [materialId]);
    return { message: "Teaching material deleted successfully" };
  }

  async updateMaterial(materialId: string, lecturerId: string, dto: UpdateMaterialDto) {
    await this.getMaterialById(materialId, lecturerId);
    const result = await this.db.query(
      `UPDATE teaching_materials
       SET original_filename = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, original_filename, mime_type, size_bytes, course_id, uploaded_by,
                 processing_status, chunk_count, processing_error, uploaded_at, updated_at`,
      [dto.originalFilename.trim(), materialId],
    );
    return result.rows[0];
  }
}
