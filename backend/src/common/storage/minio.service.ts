import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as Minio from "minio";
import { Readable } from "stream";
import { randomUUID } from "crypto";
import * as path from "path";

export interface UploadOptions {
  mimeType?: string;
  metadata?: Record<string, string>;
}

@Injectable()
export class MinioService implements OnModuleInit {
  private client: Minio.Client;
  private readonly logger = new Logger(MinioService.name);
  private bucket: string;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initClient();
  }

  createClient(): Minio.Client {
    const endPoint = this.configService.get<string>("MINIO_HOST", "localhost");
    const port = Number(this.configService.get<number>("MINIO_PORT", 9000));
    const accessKey = this.configService.get<string>("MINIO_ROOT_USER", "minioadmin");
    const secretKey = this.configService.get<string>("MINIO_ROOT_PASSWORD", "changeme_minio_password");
    const useSSL = this.configService.get<string>("MINIO_SECURE", "false") === "true";

    return new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });
  }

  /**
   * Initializes MinIO client and ensures the default bucket exists.
   */
  async initClient(): Promise<void> {
    this.bucket = this.configService.get<string>("MINIO_BUCKET_MATERIALS", "edubranch-materials");
    if (!this.client) {
      this.client = this.createClient();
    }

    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket, "us-east-1");
        this.logger.log(`Created MinIO bucket: ${this.bucket}`);
      } else {
        this.logger.log(`MinIO bucket verified: ${this.bucket}`);
      }
    } catch (error: any) {
      this.logger.error(`Error initializing MinIO bucket ${this.bucket}: ${error?.message || error}`);
    }
  }

  /**
   * AC-2: Generates a non-guessable, secure UUID-based object key.
   * Format: materials/{courseId}/{folderUUID}/{fileUUID}{ext}
   * Sanitizes courseId and file extension to prevent path traversal.
   */
  generateSecureObjectKey(courseId: string, originalFilename: string): string {
    const folderUuid = randomUUID();
    const fileUuid = randomUUID();
    // Isolate pure basename to prevent any directory traversal injection
    const cleanCourse = path.basename(courseId || "default").replace(/[^a-zA-Z0-9_-]/g, "") || "default";
    const rawExt = path.extname(path.basename(originalFilename || "")).toLowerCase();
    const safeExt = rawExt.replace(/[^a-z0-9.]/g, "");

    return `materials/${cleanCourse}/${folderUuid}/${fileUuid}${safeExt}`;
  }

  /**
   * AC-1: Stores a file buffer in MinIO bucket.
   */
  async putObject(
    objectKey: string,
    buffer: Buffer,
    size: number,
    mimeType: string,
    metadata?: Record<string, string>,
  ): Promise<void> {
    const metaHeaders: Record<string, string> = {
      "Content-Type": mimeType,
      ...(metadata || {}),
    };

    await this.client.putObject(this.bucket, objectKey, buffer, size, metaHeaders);
    this.logger.log(`Uploaded object to MinIO: ${this.bucket}/${objectKey} (${size} bytes)`);
  }

  /**
   * AC-3: Supports streaming file upload directly to MinIO.
   */
  async putStream(
    objectKey: string,
    stream: Readable,
    size?: number,
    mimeType: string = "application/octet-stream",
    metadata?: Record<string, string>,
  ): Promise<void> {
    const metaHeaders: Record<string, string> = {
      "Content-Type": mimeType,
      ...(metadata || {}),
    };

    await this.client.putObject(
      this.bucket,
      objectKey,
      stream,
      size ?? -1,
      metaHeaders,
    );
    this.logger.log(`Uploaded stream to MinIO: ${this.bucket}/${objectKey}`);
  }

  /**
   * AC-3: Streams file object down from MinIO.
   */
  async getObjectStream(objectKey: string): Promise<Readable> {
    return (await this.client.getObject(this.bucket, objectKey)) as unknown as Readable;
  }

  /**
   * AC-3: Safely removes an object from MinIO when deleted.
   */
  async removeObject(objectKey: string): Promise<void> {
    if (!objectKey) return;
    try {
      await this.client.removeObject(this.bucket, objectKey);
      this.logger.log(`Removed object from MinIO: ${this.bucket}/${objectKey}`);
    } catch (error: any) {
      this.logger.warn(`Failed to remove object from MinIO (${objectKey}): ${error?.message || error}`);
    }
  }

  /**
   * Checks if an object exists in the storage bucket.
   */
  async objectExists(objectKey: string): Promise<boolean> {
    try {
      await this.client.statObject(this.bucket, objectKey);
      return true;
    } catch (err: any) {
      if (err?.code === "NotFound" || err?.name === "NotFound") {
        return false;
      }
      return false;
    }
  }

  getBucketName(): string {
    return this.bucket;
  }

  getClient(): Minio.Client {
    return this.client;
  }
}
