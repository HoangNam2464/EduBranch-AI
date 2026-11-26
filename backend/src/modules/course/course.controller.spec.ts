import { Test, TestingModule } from "@nestjs/testing";
import { ParseUUIDPipe } from "@nestjs/common";
import { ROUTE_ARGS_METADATA } from "@nestjs/common/constants";
import { CourseController } from "./course.controller";
import { CourseService } from "./course.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";

describe("CourseController", () => {
  let controller: CourseController;

  const mockCourseService = {
    createCourse: jest.fn(),
    getCoursesByLecturer: jest.fn(),
    getCourseById: jest.fn(),
    getCourseForViewer: jest.fn(),
    updateCourse: jest.fn(),
    archiveCourse: jest.fn(),
    enrollStudentByInviteCode: jest.fn(),
    getInviteCode: jest.fn(),
    getOrGenerateInviteCode: jest.fn(),
    rotateInviteCode: jest.fn(),
    disableInviteCode: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseController],
      providers: [{ provide: CourseService, useValue: mockCourseService }],
    }).compile();

    controller = module.get<CourseController>(CourseController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("POST /api/v1/courses (createCourse)", () => {
    it("should create course using authenticated user ID and return SUCCESS envelope", async () => {
      const dto: CreateCourseDto = {
        name: "Financial Accounting Cases",
        description: "Case-based learning",
        courseCode: "ACC-101",
      };

      const mockCreated = {
        id: "c-1",
        ...dto,
        lecturerId: "lecturer-1",
      };

      mockCourseService.createCourse.mockResolvedValueOnce(mockCreated);

      const response = await controller.createCourse(dto, {
        id: "lecturer-1",
        role: "LECTURER",
      });

      expect(mockCourseService.createCourse).toHaveBeenCalledWith("lecturer-1", dto);
      expect(response).toEqual({
        status: "SUCCESS",
        data: mockCreated,
      });
    });
  });

  describe("GET /api/v1/courses (getMyCourses)", () => {
    it("should return courses belonging to current authenticated lecturer", async () => {
      const mockCourses = [
        { id: "c-1", name: "Course A", lecturer_id: "lecturer-1" },
        { id: "c-2", name: "Course B", lecturer_id: "lecturer-1" },
      ];

      mockCourseService.getCoursesByLecturer.mockResolvedValueOnce(mockCourses);

      const response = await controller.getMyCourses({
        id: "lecturer-1",
        role: "LECTURER",
      });

      expect(mockCourseService.getCoursesByLecturer).toHaveBeenCalledWith("lecturer-1");
      expect(response).toEqual({
        status: "SUCCESS",
        data: mockCourses,
      });
    });
  });

  describe("GET /api/v1/courses/:courseId (getCourse)", () => {
    it("should delegate to getCourseForViewer with courseId and user", async () => {
      const mockCourse = { id: "c-1", name: "Course A", lecturer_id: "lecturer-1" };
      mockCourseService.getCourseForViewer.mockResolvedValueOnce(mockCourse);

      const user = { id: "lecturer-1", role: "LECTURER" };
      const response = await controller.getCourse("c-1", user);

      expect(mockCourseService.getCourseForViewer).toHaveBeenCalledWith("c-1", user);
      expect(response).toEqual({
        status: "SUCCESS",
        data: mockCourse,
      });
    });

    it.each([
      "getCourse",
      "updateCourse",
      "archiveCourse",
      "getInviteCode",
      "rotateInviteCode",
      "disableInviteCode",
    ] as const)("attaches ParseUUIDPipe to :courseId on %s (D)", (method) => {
      const meta = Reflect.getMetadata(ROUTE_ARGS_METADATA, CourseController, method) as Record<string, any>;
      const paramMeta = Object.values(meta).find((entry) => entry.index === 0);
      expect(paramMeta.pipes).toContain(ParseUUIDPipe);
    });
  });

  describe("PUT /api/v1/courses/:courseId (updateCourse)", () => {
    it("should delegate update to courseService with ownership check", async () => {
      const dto: UpdateCourseDto = { name: "New Name" };
      const mockUpdated = { id: "c-1", name: "New Name", lecturer_id: "lecturer-1" };

      mockCourseService.updateCourse.mockResolvedValueOnce(mockUpdated);

      const response = await controller.updateCourse("c-1", dto, {
        id: "lecturer-1",
        role: "LECTURER",
      });

      expect(mockCourseService.updateCourse).toHaveBeenCalledWith("c-1", "lecturer-1", dto);
      expect(response).toEqual({
        status: "SUCCESS",
        data: mockUpdated,
      });
    });
  });

  describe("PATCH /api/v1/courses/:courseId/archive (archiveCourse)", () => {
    it("should delegate archive to courseService with the authenticated lecturer id", async () => {
      const mockArchived = { id: "c-1", is_active: false, active: false };
      mockCourseService.archiveCourse.mockResolvedValueOnce(mockArchived);

      const response = await controller.archiveCourse("c-1", {
        id: "lecturer-1",
        role: "LECTURER",
      });

      expect(mockCourseService.archiveCourse).toHaveBeenCalledWith("c-1", "lecturer-1");
      expect(response).toEqual({
        status: "SUCCESS",
        data: mockArchived,
      });
    });

    it("exposes no delete handler (C1-B: no DELETE /courses/:courseId)", () => {
      expect((controller as unknown as Record<string, unknown>).deleteCourse).toBeUndefined();
    });
  });

  describe("POST /api/v1/courses/enroll (enrollCourse)", () => {
    it("should enroll student using invite code and return SUCCESS envelope", async () => {
      const dto = { inviteCode: "ABC12345" };
      const mockCourse = { id: "c-1", name: "Enrolled Course" };
      mockCourseService.enrollStudentByInviteCode.mockResolvedValueOnce(mockCourse);

      const response = await controller.enrollCourse(dto, {
        id: "student-1",
        role: "STUDENT",
      });

      expect(mockCourseService.enrollStudentByInviteCode).toHaveBeenCalledWith(
        "student-1",
        "ABC12345",
      );
      expect(response).toEqual({
        status: "SUCCESS",
        data: mockCourse,
      });
    });
  });

  describe("Invite Code Management (Lecturer)", () => {
    it("GET :courseId/invite-code returns invite code", async () => {
      mockCourseService.getInviteCode.mockResolvedValueOnce({
        inviteCode: "CODE1234",
        isActive: true,
      });

      const response = await controller.getInviteCode("c-1", {
        id: "lecturer-1",
        role: "LECTURER",
      });

      expect(mockCourseService.getInviteCode).toHaveBeenCalledWith("c-1", "lecturer-1");
      expect(response).toEqual({
        status: "SUCCESS",
        data: { inviteCode: "CODE1234", isActive: true },
      });
    });

    it("POST :courseId/invite-code rotates invite code", async () => {
      mockCourseService.rotateInviteCode.mockResolvedValueOnce({
        inviteCode: "NEWCODE1",
        isActive: true,
      });

      const response = await controller.rotateInviteCode("c-1", {
        id: "lecturer-1",
        role: "LECTURER",
      });

      expect(mockCourseService.rotateInviteCode).toHaveBeenCalledWith("c-1", "lecturer-1");
      expect(response).toEqual({
        status: "SUCCESS",
        data: { inviteCode: "NEWCODE1", isActive: true },
      });
    });

    it("DELETE :courseId/invite-code disables invite code", async () => {
      mockCourseService.disableInviteCode.mockResolvedValueOnce({
        inviteCode: "OLDCODE1",
        isActive: false,
      });

      const response = await controller.disableInviteCode("c-1", {
        id: "lecturer-1",
        role: "LECTURER",
      });

      expect(mockCourseService.disableInviteCode).toHaveBeenCalledWith("c-1", "lecturer-1");
      expect(response).toEqual({
        status: "SUCCESS",
        data: { inviteCode: "OLDCODE1", isActive: false },
      });
    });
  });
});
