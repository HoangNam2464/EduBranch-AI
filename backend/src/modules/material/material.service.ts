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

  async getMaterialsByCourse(courseId: string) {
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

  async getMaterialById(materialId: string) {
    const res = await this.db.query(
      `SELECT id, original_filename, stored_object_key, mime_type, size_bytes,
              course_id, uploaded_by, processing_status, chunk_count, processing_error,
              uploaded_at, updated_at
       FROM teaching_materials
       WHERE id = $1`,
      [materialId],
    );
    if (res.rows.length === 0) {
      throw new NotFoundException(`Teaching material ${materialId} not found`);
    }
    return res.rows[0];
  }
}
