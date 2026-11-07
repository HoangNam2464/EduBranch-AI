import { Test, TestingModule } from "@nestjs/testing";
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
    updateCourse: jest.fn(),
    deleteCourse: jest.fn(),
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
    it("should return course details by ID", async () => {
      const mockCourse = { id: "c-1", name: "Course A", lecturer_id: "lecturer-1" };
      mockCourseService.getCourseById.mockResolvedValueOnce(mockCourse);

      const response = await controller.getCourse("c-1", {
        id: "lecturer-1",
        role: "LECTURER",
      });

      expect(mockCourseService.getCourseById).toHaveBeenCalledWith("c-1", "lecturer-1");
      expect(response).toEqual({
        status: "SUCCESS",
        data: mockCourse,
      });
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

  describe("DELETE /api/v1/courses/:courseId (deleteCourse)", () => {
    it("should delegate delete to courseService with ownership check", async () => {
      const mockResult = { message: "Course deleted successfully" };
      mockCourseService.deleteCourse.mockResolvedValueOnce(mockResult);

      const response = await controller.deleteCourse("c-1", {
        id: "lecturer-1",
        role: "LECTURER",
      });

      expect(mockCourseService.deleteCourse).toHaveBeenCalledWith("c-1", "lecturer-1");
      expect(response).toEqual({
        status: "SUCCESS",
        data: mockResult,
      });
    });
  });
});
