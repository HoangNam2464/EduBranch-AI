import { Test, TestingModule } from "@nestjs/testing";
import { StudentController } from "./student.controller";
import { CourseService } from "./course.service";

describe("StudentController (BE-029 / FE-028)", () => {
  let controller: StudentController;

  const mockCourseService = {
    getStudentEnrolledCourses: jest.fn(),
    getStudentDashboard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentController],
      providers: [{ provide: CourseService, useValue: mockCourseService }],
    }).compile();

    controller = module.get<StudentController>(StudentController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("GET /api/v1/student/courses", () => {
    it("should return enrolled courses for the authenticated student", async () => {
      const mockCourses = [
        { id: "c-1", name: "Corporate Law", enrolled_at: new Date() },
      ];
      mockCourseService.getStudentEnrolledCourses.mockResolvedValueOnce(mockCourses);

      const response = await controller.getStudentCourses({
        id: "student-1",
        role: "STUDENT",
      });

      expect(mockCourseService.getStudentEnrolledCourses).toHaveBeenCalledWith("student-1");
      expect(response).toEqual({
        status: "SUCCESS",
        data: mockCourses,
      });
    });
  });

  describe("GET /api/v1/student/dashboard", () => {
    it("should return student dashboard data", async () => {
      const mockDashboard = {
        enrolledCourses: [{ id: "c-1", name: "Corporate Law" }],
        recentCases: [{ id: "cs-1", title: "Merger Case" }],
        activeCases: [],
        stats: { totalEnrolled: 1, totalActiveCases: 0, totalPublishedCases: 1 },
      };
      mockCourseService.getStudentDashboard.mockResolvedValueOnce(mockDashboard);

      const response = await controller.getStudentDashboard({
        id: "student-1",
        role: "STUDENT",
      });

      expect(mockCourseService.getStudentDashboard).toHaveBeenCalledWith("student-1");
      expect(response).toEqual({
        status: "SUCCESS",
        data: mockDashboard,
      });
    });
  });
});
