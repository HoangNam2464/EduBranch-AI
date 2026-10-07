import { Test, TestingModule } from "@nestjs/testing";
import { MaterialController } from "./material.controller";
import { MaterialService } from "./material.service";
import { DatabaseService } from "../../common/database/database.service";
import { MinioService } from "../../common/minio/minio.service";
import { AiClientService } from "../../common/ai-client/ai-client.service";

describe("MaterialController", () => {
  let controller: MaterialController;
  let service: MaterialService;

  const mockDb = {
    query: jest.fn(),
  };

  const mockMinio = {
    putObject: jest.fn(),
    getBucketName: jest.fn().mockReturnValue("edubranch-materials"),
  };

  const mockAiClient = {
    processMaterial: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaterialController],
      providers: [
        MaterialService,
        { provide: DatabaseService, useValue: mockDb },
        { provide: MinioService, useValue: mockMinio },
        { provide: AiClientService, useValue: mockAiClient },
      ],
    }).compile();

    controller = module.get<MaterialController>(MaterialController);
    service = module.get<MaterialService>(MaterialService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe("uploadCourseMaterial", () => {
    it("should successfully upload and process a valid PDF", async () => {
      const courseId = "11111111-1111-1111-1111-111111111111";
      const mockFile: Express.Multer.File = {
        fieldname: "file",
        originalname: "syllabus.pdf",
        encoding: "7bit",
        mimetype: "application/pdf",
        size: 1024,
        buffer: Buffer.from("dummy pdf content"),
        stream: null as any,
        destination: "",
        filename: "",
        path: "",
      };

      // Mock DB: course found
      mockDb.query
        .mockResolvedValueOnce({
          rows: [{ id: courseId, lecturer_id: "user-123" }],
        })
        // Mock DB: insert teaching_materials
        .mockResolvedValueOnce({
          rows: [
            {
              id: "mat-123",
              original_filename: "syllabus.pdf",
              processing_status: "PENDING",
            },
          ],
        })
        // Mock DB: update status to COMPLETED
        .mockResolvedValueOnce({
          rows: [
            {
              id: "mat-123",
              original_filename: "syllabus.pdf",
              processing_status: "COMPLETED",
              chunk_count: 5,
            },
          ],
        });

      mockMinio.putObject.mockResolvedValueOnce(undefined);
      mockAiClient.processMaterial.mockResolvedValueOnce({
        status: "COMPLETED",
        material_id: "mat-123",
        chunk_count: 5,
      });

      const response = await controller.uploadCourseMaterial(courseId, mockFile, { id: "lecturer-1", role: "LECTURER" });

      expect(response.status).toBe("SUCCESS");
      expect(response.data.processing_status).toBe("COMPLETED");
      expect(response.data.chunk_count).toBe(5);
      expect(mockMinio.putObject).toHaveBeenCalled();
      expect(mockAiClient.processMaterial).toHaveBeenCalled();
    });

    it("should reject unsupported MIME types", async () => {
      const courseId = "11111111-1111-1111-1111-111111111111";
      const mockFile: Express.Multer.File = {
        fieldname: "file",
        originalname: "script.exe",
        encoding: "7bit",
        mimetype: "application/x-msdownload",
        size: 1024,
        buffer: Buffer.from("bad binary"),
        stream: null as any,
        destination: "",
        filename: "",
        path: "",
      };

      await expect(
        controller.uploadCourseMaterial(courseId, mockFile, { id: "lecturer-1", role: "LECTURER" }),
      ).rejects.toThrow("Unsupported file type");
    });
  });

  describe("getCourseMaterials", () => {
    it("should return materials list for a course", async () => {
      const courseId = "11111111-1111-1111-1111-111111111111";
      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: "mat-1",
            original_filename: "file1.pdf",
            processing_status: "COMPLETED",
          },
        ],
      });

      const response = await controller.getCourseMaterials(courseId);

      expect(response.status).toBe("SUCCESS");
      expect(response.data).toHaveLength(1);
      expect(response.data[0].original_filename).toBe("file1.pdf");
    });
  });
});
