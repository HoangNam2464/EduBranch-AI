import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as Minio from "minio";

@Injectable()
export class MinioService implements OnModuleInit {
  private client: Minio.Client;
  private readonly logger = new Logger(MinioService.name);
  private bucket: string;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const endPoint = this.configService.get<string>("MINIO_HOST", "localhost");
    const port = Number(this.configService.get<number>("MINIO_PORT", 9000));
    const accessKey = this.configService.get<string>("MINIO_ROOT_USER", "minioadmin");
    const secretKey = this.configService.get<string>("MINIO_ROOT_PASSWORD", "changeme_minio_password");
    const useSSL = this.configService.get<string>("MINIO_SECURE", "false") === "true";
    this.bucket = this.configService.get<string>("MINIO_BUCKET_MATERIALS", "edubranch-materials");

    this.client = new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });

    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket, "us-east-1");
        this.logger.log(`Created MinIO bucket: ${this.bucket}`);
      } else {
        this.logger.log(`MinIO bucket exists: ${this.bucket}`);
      }
    } catch (error) {
      this.logger.error(`Error initializing MinIO bucket ${this.bucket}:`, error);
    }
  }

  async putObject(
    objectKey: string,
    buffer: Buffer,
    size: number,
    mimeType: string,
  ): Promise<void> {
    await this.client.putObject(this.bucket, objectKey, buffer, size, {
      "Content-Type": mimeType,
    });
    this.logger.log(`Uploaded object to MinIO: ${this.bucket}/${objectKey} (${size} bytes)`);
  }

  getBucketName(): string {
    return this.bucket;
  }
}
