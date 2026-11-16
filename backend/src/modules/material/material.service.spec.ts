import { Test, TestingModule } from "@nestjs/testing";
import { ConflictException, ForbiddenException } from "@nestjs/common";
import { MaterialService } from "./material.service";
import { DatabaseService } from "../../common/database/database.service";
import { MinioService } from "../../common/minio/minio.service";
import { AiClientService } from "../../common/ai-client/ai-client.service";

/**
 * MaterialService — upload gate for archived courses (C1-B soft archive, OPD-014, PO 2026-11-16).
 * An archived course keeps its materials but accepts no new upload; ownership is checked first
 * so a non-owner learns nothing about the archive state.
 */
describe("MaterialService.uploadMaterial — archived course (C1-B)", () => {
  let service: MaterialService;

  const mockDbService = { query: jest.fn() };
  const mockMinio = {
    putObject: jest.fn(),
    removeObject: jest.fn(),
    generateSecureObjectKey: jest.fn(),
  };
  const mockAiClient = { processMaterial: jest.fn() };

  const pdf = {
    originalname: "giao-trinh.pdf",
    mimetype: "application/pdf",
    size: 1024,
    buffer: Buffer.from("%PDF-1.4"),
  } as Express.Multer.File;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialService,
        { provide: DatabaseService, useValue: mockDbService },
        { provide: MinioService, useValue: mockMinio },
        { provide: AiClientService, useValue: mockAiClient },
      ],
    }).compile();

    service = module.get<MaterialService>(MaterialService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("rejects an upload to the owner's archived course with 409 and stores nothing", async () => {
    mockDbService.query.mockResolvedValueOnce({
      rows: [{ id: "course-1", lecturer_id: "lecturer-1", is_active: false }],
    });

    await expect(service.uploadMaterial("course-1", pdf, "lecturer-1")).rejects.toThrow(
      new ConflictException("Course is archived"),
    );
    expect(mockDbService.query).toHaveBeenCalledTimes(1);
    expect(mockDbService.query.mock.calls[0][0]).toContain("is_active");
    expect(mockMinio.generateSecureObjectKey).not.toHaveBeenCalled();
    expect(mockMinio.putObject).not.toHaveBeenCalled();
    expect(mockAiClient.processMaterial).not.toHaveBeenCalled();
  });

  it("rolls back the stored object when the course is archived between the check and the insert", async () => {
    mockMinio.generateSecureObjectKey.mockReturnValueOnce("materials/course-1/k/giao-trinh.pdf");
    mockDbService.query
      .mockResolvedValueOnce({ rows: [{ id: "course-1", lecturer_id: "lecturer-1", is_active: true }] })
      .mockResolvedValueOnce({ rows: [] }); // conditional INSERT finds no active course

    await expect(service.uploadMaterial("course-1", pdf, "lecturer-1")).rejects.toThrow(
      new ConflictException("Course is archived"),
    );
    expect(mockDbService.query.mock.calls[1][0]).toContain("FROM courses WHERE id = $6 AND is_active = TRUE");
    expect(mockMinio.removeObject).toHaveBeenCalledWith("materials/course-1/k/giao-trinh.pdf");
    expect(mockAiClient.processMaterial).not.toHaveBeenCalled();
  });

  it("answers 403, not 409, when another lecturer uploads to an archived course", async () => {
    mockDbService.query.mockResolvedValueOnce({
      rows: [{ id: "course-1", lecturer_id: "lecturer-owner-A", is_active: false }],
    });

    await expect(service.uploadMaterial("course-1", pdf, "lecturer-B")).rejects.toThrow(
      ForbiddenException,
    );
  });
});
