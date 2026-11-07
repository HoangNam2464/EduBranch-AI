import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { MinioService } from "./minio.service";
import { Readable } from "stream";

describe("MinioService [OPS-002]", () => {
  let service: MinioService;
  let mockMinioClient: any;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const configMap: Record<string, any> = {
        MINIO_HOST: "localhost",
        MINIO_PORT: 9000,
        MINIO_ROOT_USER: "minioadmin",
        MINIO_ROOT_PASSWORD: "miniopassword",
        MINIO_SECURE: "false",
        MINIO_BUCKET_MATERIALS: "edubranch-materials",
      };
      return configMap[key] ?? defaultValue;
    }),
  };

  beforeEach(async () => {
    mockMinioClient = {
      bucketExists: jest.fn().mockResolvedValue(true),
      makeBucket: jest.fn().mockResolvedValue(undefined),
      putObject: jest.fn().mockResolvedValue({ etag: "12345" }),
      getObject: jest.fn().mockResolvedValue(Readable.from(["file-content"])),
      removeObject: jest.fn().mockResolvedValue(undefined),
      statObject: jest.fn().mockResolvedValue({ size: 1024 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinioService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MinioService>(MinioService);
    (service as any).client = mockMinioClient;
    (service as any).bucket = "edubranch-materials";
  });

  describe("AC-1: Secure Bucket Storage", () => {
    it("should verify edubranch-materials bucket exists on initialization", async () => {
      mockMinioClient.bucketExists.mockResolvedValue(true);
      await service.onModuleInit();
      expect(service.getBucketName()).toBe("edubranch-materials");
      expect(mockMinioClient.bucketExists).toHaveBeenCalledWith("edubranch-materials");
    });

    it("should automatically create bucket if it does not exist", async () => {
      mockMinioClient.bucketExists.mockResolvedValue(false);
      await service.onModuleInit();
      expect(mockMinioClient.makeBucket).toHaveBeenCalledWith("edubranch-materials", "us-east-1");
    });

    it("should store buffer file into bucket with content-type", async () => {
      const buffer = Buffer.from("test document content");
      await service.putObject("materials/course-1/key.pdf", buffer, buffer.length, "application/pdf");

      expect(mockMinioClient.putObject).toHaveBeenCalledWith(
        "edubranch-materials",
        "materials/course-1/key.pdf",
        buffer,
        buffer.length,
        { "Content-Type": "application/pdf" },
      );
    });
  });

  describe("AC-2: Non-guessable UUID Object Keys", () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    it("should generate object key containing random UUIDs that cannot be guessed", () => {
      const key1 = service.generateSecureObjectKey("course-101", "syllabus.pdf");
      const key2 = service.generateSecureObjectKey("course-101", "syllabus.pdf");

      expect(key1).not.toEqual(key2);

      const parts = key1.split("/");
      expect(parts[0]).toBe("materials");
      expect(parts[1]).toBe("course-101");
      expect(parts[2]).toMatch(uuidRegex);
      expect(parts[3]).toMatch(/^[0-9a-f-]{36}\.pdf$/i);
    });

    it("should sanitize file extension and course ID to prevent path traversal", () => {
      const key = service.generateSecureObjectKey(
        "course/../../etc/passwd",
        "malicious/file/../../../hack.DOCX",
      );

      expect(key).not.toContain("..");
      expect(key).toMatch(/\.docx$/i);
      expect(key.startsWith("materials/passwd/")).toBe(true);
    });
  });

  describe("AC-3: Streaming Upload & Safe Deletion Cleanup", () => {
    it("should support streaming file upload directly to MinIO", async () => {
      const stream = Readable.from(["chunk 1", "chunk 2"]);
      await service.putStream(
        "materials/c-1/stream.pdf",
        stream,
        14,
        "application/pdf",
      );

      expect(mockMinioClient.putObject).toHaveBeenCalledWith(
        "edubranch-materials",
        "materials/c-1/stream.pdf",
        stream,
        14,
        { "Content-Type": "application/pdf" },
      );
    });

    it("should support getObjectStream for download streaming", async () => {
      const stream = await service.getObjectStream("materials/c-1/stream.pdf");
      expect(stream).toBeDefined();
      expect(mockMinioClient.getObject).toHaveBeenCalledWith(
        "edubranch-materials",
        "materials/c-1/stream.pdf",
      );
    });

    it("should safely remove object on deletion", async () => {
      await service.removeObject("materials/c-1/doc.pdf");
      expect(mockMinioClient.removeObject).toHaveBeenCalledWith(
        "edubranch-materials",
        "materials/c-1/doc.pdf",
      );
    });

    it("should handle deletion errors gracefully without crashing the service", async () => {
      mockMinioClient.removeObject.mockRejectedValue(new Error("MinIO network glitch"));
      await expect(service.removeObject("materials/c-1/doc.pdf")).resolves.not.toThrow();
    });

    it("should verify whether object exists in storage", async () => {
      mockMinioClient.statObject.mockResolvedValue({ size: 500 });
      const exists = await service.objectExists("materials/c-1/doc.pdf");
      expect(exists).toBe(true);

      mockMinioClient.statObject.mockRejectedValue({ code: "NotFound" });
      const notFound = await service.objectExists("materials/c-1/missing.pdf");
      expect(notFound).toBe(false);
    });
  });
});
