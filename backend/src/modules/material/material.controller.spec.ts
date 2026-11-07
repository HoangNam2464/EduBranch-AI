import { Test, TestingModule } from "@nestjs/testing";
import { MaterialController } from "./material.controller";
import { MaterialService } from "./material.service";
import { DatabaseService } from "../../common/database/database.service";
import { MinioService } from "../../common/minio/minio.service";
import { AiClientService } from "../../common/ai-client/ai-client.service";
import { ForbiddenException } from "@nestjs/common";

describe("MaterialController", () => {
  let controller: MaterialController;
  let service: MaterialService;

  const mockDb = {
    query: jest.fn(),
  };

  const mockMinio = {
    putObject: jest.fn(),
    removeObject: jest.fn(),
    getBucketName: jest.fn().mockReturnValue("edubranch-materials"),
    generateSecureObjectKey: jest.fn().mockReturnValue("materials/course-123/uuid/file.pdf"),
  };

  const mockAiClient = {
    processMaterial: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
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
          rows: [{ id: courseId, lecturer_id: "lecturer-1" }],
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
        rows: [{ id: courseId, lecturer_id: "lecturer-1" }],
      }).mockResolvedValueOnce({
        rows: [
          {
            id: "mat-1",
            original_filename: "file1.pdf",
            processing_status: "COMPLETED",
          },
        ],
      });

      const response = await controller.getCourseMaterials(courseId, { id: "lecturer-1", role: "LECTURER" });

      expect(response.status).toBe("SUCCESS");
      expect(response.data).toHaveLength(1);
      expect(response.data[0].original_filename).toBe("file1.pdf");
    });

    it("rejects a lecturer who does not own the course", async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: "course-1", lecturer_id: "owner-1" }],
      });

      await expect(
        controller.getCourseMaterials("course-1", { id: "lecturer-2", role: "LECTURER" }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("rejects students from material upload", async () => {
      await expect(
        controller.uploadCourseMaterial("course-1", {} as Express.Multer.File, {
          id: "student-1",
          role: "STUDENT",
        }),
      ).rejects.toThrow(ForbiddenException);
      expect(mockDb.query).not.toHaveBeenCalled();
    });

    it("rejects students from listing materials", async () => {
      await expect(
        controller.getCourseMaterials("course-1", { id: "student-1", role: "STUDENT" }),
      ).rejects.toThrow(ForbiddenException);
      expect(mockDb.query).not.toHaveBeenCalled();
    });
  });

  describe("getMaterialById", () => {
    it("returns details only to the owning lecturer", async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: "mat-1", original_filename: "notes.pdf", lecturer_id: "lecturer-1" }],
      });

      const response = await controller.getMaterialById("mat-1", {
        id: "lecturer-1",
        role: "LECTURER",
      });

      expect(response.data.original_filename).toBe("notes.pdf");
      expect(response.data).not.toHaveProperty("lecturer_id");
    });

    it("rejects a lecturer who does not own the material", async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: "mat-1", lecturer_id: "owner-1" }],
      });

      await expect(
        controller.getMaterialById("mat-1", { id: "lecturer-2", role: "LECTURER" }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("updateMaterial", () => {
    it("renames material metadata for its owner", async () => {
      mockDb.query
        .mockResolvedValueOnce({
          rows: [{ id: "mat-1", stored_object_key: "materials/course/mat-1/file.pdf", lecturer_id: "lecturer-1" }],
        })
        .mockResolvedValueOnce({
          rows: [{ id: "mat-1", original_filename: "renamed.pdf" }],
        });

      const response = await controller.updateMaterial(
        "mat-1",
        { originalFilename: "renamed.pdf" },
        { id: "lecturer-1", role: "LECTURER" },
      );

      expect(response.data.original_filename).toBe("renamed.pdf");
      expect(mockDb.query).toHaveBeenLastCalledWith(expect.stringContaining("UPDATE teaching_materials"), [
        "renamed.pdf",
        "mat-1",
      ]);
      expect(mockMinio.putObject).not.toHaveBeenCalled();
    });

    it("does not update a material owned by another lecturer", async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: "mat-1", lecturer_id: "owner-1" }],
      });

      await expect(
        controller.updateMaterial(
          "mat-1",
          { originalFilename: "renamed.pdf" },
          { id: "lecturer-2", role: "LECTURER" },
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteMaterial", () => {
    it("deletes the stored object and metadata for its owner", async () => {
      mockDb.query
        .mockResolvedValueOnce({
          rows: [{ id: "mat-1", stored_object_key: "materials/course/mat-1/file.pdf", lecturer_id: "lecturer-1" }],
        })
        .mockResolvedValueOnce({ rows: [] });
      mockMinio.removeObject.mockResolvedValueOnce(undefined);

      const response = await controller.deleteMaterial("mat-1", {
        id: "lecturer-1",
        role: "LECTURER",
      });

      expect(response.status).toBe("SUCCESS");
      expect(mockMinio.removeObject).toHaveBeenCalledWith("materials/course/mat-1/file.pdf");
      expect(mockDb.query).toHaveBeenLastCalledWith(
        "DELETE FROM teaching_materials WHERE id = $1",
        ["mat-1"],
      );
    });

    it("does not delete a material owned by another lecturer", async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: "mat-1", stored_object_key: "materials/file.pdf", lecturer_id: "owner-1" }],
      });

      await expect(
        controller.deleteMaterial("mat-1", { id: "lecturer-2", role: "LECTURER" }),
      ).rejects.toThrow(ForbiddenException);
      expect(mockMinio.removeObject).not.toHaveBeenCalled();
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });
  });
});
