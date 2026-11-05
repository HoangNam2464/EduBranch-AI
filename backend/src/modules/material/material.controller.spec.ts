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
    const courseId = "11111111-1111-1111-1111-111111111111";
    const owner = { id: "lecturer-1", role: "LECTURER" };

    it("should return materials list for the owning lecturer", async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ lecturer_id: "lecturer-1" }] })
        .mockResolvedValueOnce({
          rows: [{ id: "mat-1", original_filename: "file1.pdf", processing_status: "COMPLETED" }],
        });

      const response = await controller.getCourseMaterials(courseId, owner);

      expect(response.status).toBe("SUCCESS");
      expect(response.data).toHaveLength(1);
      expect(response.data[0].original_filename).toBe("file1.pdf");
    });

    it("should forbid listing materials of another lecturer's course", async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ lecturer_id: "lecturer-2" }] });
      await expect(controller.getCourseMaterials(courseId, owner)).rejects.toThrow(
        "You can only access materials of your own courses",
      );
    });

    it("should return 404 for an unknown course", async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      await expect(controller.getCourseMaterials(courseId, owner)).rejects.toThrow("not found");
    });
  });

  describe("material ownership routes", () => {
    const owner = { id: "lecturer-1", role: "LECTURER" };
    const other = { id: "lecturer-2", role: "LECTURER" };
    const row = {
      id: "mat-1",
      original_filename: "file1.pdf",
      stored_object_key: "materials/c1/mat-1/file1.pdf",
      mime_type: "application/pdf",
      course_id: "c1",
      processing_status: "FAILED",
      chunk_count: 0,
      lecturer_id: "lecturer-1",
    };

    beforeEach(() => {
      mockDb.query.mockReset();
      (mockMinio as any).removeObject = jest.fn().mockResolvedValue(undefined);
      mockAiClient.processMaterial.mockReset();
    });

    it("getMaterialById hides lecturer_id and forbids non-owners", async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [row] });
      const res = await controller.getMaterialById("mat-1", owner);
      expect(res.data.id).toBe("mat-1");
      expect((res.data as any).lecturer_id).toBeUndefined();

      mockDb.query.mockResolvedValueOnce({ rows: [row] });
      await expect(controller.getMaterialById("mat-1", other)).rejects.toThrow("own courses");
    });

    it("deleteMaterial deletes the row then removes the stored object", async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [row] }).mockResolvedValueOnce({ rows: [] });
      const res = await controller.deleteMaterial("mat-1", owner);
      expect(res.data).toEqual({ id: "mat-1", deleted: true });
      expect(mockDb.query.mock.calls[1][0]).toContain("DELETE FROM teaching_materials");
      expect((mockMinio as any).removeObject).toHaveBeenCalledWith(row.stored_object_key);
    });

    it("deleteMaterial still succeeds when object removal fails", async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [row] }).mockResolvedValueOnce({ rows: [] });
      (mockMinio as any).removeObject = jest.fn().mockRejectedValue(new Error("minio down"));
      const res = await controller.deleteMaterial("mat-1", owner);
      expect(res.data.deleted).toBe(true);
    });

    it("deleteMaterial forbids non-owners and deletes nothing", async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [row] });
      await expect(controller.deleteMaterial("mat-1", other)).rejects.toThrow("own courses");
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it("reprocessMaterial clears chunks and records COMPLETED on success", async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [row] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ ...row, processing_status: "COMPLETED", chunk_count: 3 }] });
      mockAiClient.processMaterial.mockResolvedValueOnce({ chunk_count: 3 });
      const res = await controller.reprocessMaterial("mat-1", owner);
      expect(mockDb.query.mock.calls[1][0]).toContain("DELETE FROM document_chunks");
      expect(res.data.processing_status).toBe("COMPLETED");
    });

    it("reprocessMaterial records FAILED when ingestion fails again", async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [row] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ ...row, processing_status: "FAILED" }] });
      mockAiClient.processMaterial.mockRejectedValueOnce(new Error("AI down"));
      const res = await controller.reprocessMaterial("mat-1", owner);
      expect(res.data.processing_status).toBe("FAILED");
    });

    it("reprocessMaterial rejects an already processed material", async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ ...row, processing_status: "COMPLETED" }] });
      await expect(controller.reprocessMaterial("mat-1", owner)).rejects.toThrow("already processed");
    });

    it("getMaterialChunks returns ordered chunks without embeddings", async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ ...row, processing_status: "COMPLETED", chunk_count: 2 }] })
        .mockResolvedValueOnce({
          rows: [
            { id: "ch-0", chunk_index: 0, chunk_text: "A" },
            { id: "ch-1", chunk_index: 1, chunk_text: "B" },
          ],
        });
      const res = await controller.getMaterialChunks("mat-1", owner);
      expect(res.data.chunks).toHaveLength(2);
      expect(mockDb.query.mock.calls[1][0]).not.toContain("embedding");
    });
  });
});
