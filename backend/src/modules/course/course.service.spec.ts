import { Test, TestingModule } from "@nestjs/testing";
import { CourseService } from "./course.service";
import { DatabaseService } from "../../common/database/database.service";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";

describe("CourseService (EBA-107 / BE-003)", () => {
  let service: CourseService;

  const mockDbService = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        { provide: DatabaseService, useValue: mockDbService },
      ],
    }).compile();

    service = module.get<CourseService>(CourseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createCourse (AC 1 & AC 2: no fallback mocks)", () => {
    it("should insert course with lecturer_id and return created record", async () => {
      const dto: CreateCourseDto = {
        name: "Corporate Law in Practice",
        description: "Experiential case study course",
        courseCode: "LAW-301",
      };

      const mockCourse = {
        id: "course-uuid-1",
        name: dto.name,
        description: dto.description,
        course_code: dto.courseCode,
        lecturer_id: "lecturer-uuid-1",
        active: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDbService.query.mockResolvedValueOnce({ rows: [mockCourse] });

      const result = await service.createCourse("lecturer-uuid-1", dto);

      expect(mockDbService.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO courses"),
        [
          expect.any(String), // UUID
          "Corporate Law in Practice",
          "Experiential case study course",
          "LAW-301",
          "lecturer-uuid-1",
        ],
      );
      expect(result).toEqual(mockCourse);
    });

    it("should handle optional description and courseCode as null", async () => {
      const dto: CreateCourseDto = {
        name: "Basic Economics",
      };

      mockDbService.query.mockResolvedValueOnce({
        rows: [
          {
            id: "course-uuid-2",
            name: "Basic Economics",
            description: null,
            course_code: null,
            lecturer_id: "lecturer-uuid-1",
            active: true,
            is_active: true,
          },
        ],
      });

      await service.createCourse("lecturer-uuid-1", dto);

      expect(mockDbService.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO courses"),
        [expect.any(String), "Basic Economics", null, null, "lecturer-uuid-1"],
      );
    });
  });

  describe("getCoursesByLecturer (AC 3: only courses owned by lecturer)", () => {
    it("should query only courses where lecturer_id matches authenticated lecturer", async () => {
      const mockCourses = [
        {
          id: "c-1",
          name: "Course 1",
          lecturer_id: "lecturer-1",
          active: true,
        },
        {
          id: "c-2",
          name: "Course 2",
          lecturer_id: "lecturer-1",
          active: true,
        },
      ];

      mockDbService.query.mockResolvedValueOnce({ rows: mockCourses });

      const result = await service.getCoursesByLecturer("lecturer-1");

      expect(mockDbService.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE lecturer_id = $1"),
        ["lecturer-1"],
      );
      expect(result).toEqual(mockCourses);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when lecturer has created no courses", async () => {
      mockDbService.query.mockResolvedValueOnce({ rows: [] });

      const result = await service.getCoursesByLecturer("lecturer-new");

      expect(result).toEqual([]);
    });
  });

  describe("getCourseById", () => {
    it("should return course when course ID exists", async () => {
      const mockCourse = {
        id: "c-100",
        name: "Medical Ethics Case Studies",
        lecturer_id: "lecturer-1",
        active: true,
      };

      mockDbService.query.mockResolvedValueOnce({ rows: [mockCourse] });

      const result = await service.getCourseById("c-100");

      expect(result).toEqual(mockCourse);
      expect(mockDbService.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE id = $1"),
        ["c-100"],
      );
    });

    it("should throw NotFoundException when course ID does not exist", async () => {
      mockDbService.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.getCourseById("c-999")).rejects.toThrow(
        new NotFoundException("Course c-999 not found"),
      );
    });
  });

  describe("updateCourse (AC 1 & AC 3: Ownership Gate enforcement)", () => {
    it("should allow course owner (lecturer) to update course details", async () => {
      const existingCourse = {
        id: "c-1",
        name: "Original Name",
        description: "Old Desc",
        course_code: "CS-101",
        lecturer_id: "lecturer-owner",
      };

      const updatedCourse = {
        ...existingCourse,
        name: "Updated Name",
      };

      // 1. getCourseById call inside updateCourse
      mockDbService.query
        .mockResolvedValueOnce({ rows: [existingCourse] })
        // 2. UPDATE query
        .mockResolvedValueOnce({ rows: [updatedCourse] });

      const dto: UpdateCourseDto = { name: "Updated Name" };
      const result = await service.updateCourse("c-1", "lecturer-owner", dto);

      expect(result).toEqual(updatedCourse);
      expect(mockDbService.query).toHaveBeenCalledTimes(2);
    });

    it("should throw ForbiddenException when a different lecturer attempts to update the course", async () => {
      const existingCourse = {
        id: "c-1",
        name: "Original Name",
        lecturer_id: "lecturer-owner-A",
      };

      mockDbService.query.mockResolvedValueOnce({ rows: [existingCourse] });

      const dto: UpdateCourseDto = { name: "Hacked Name" };

      await expect(
        service.updateCourse("c-1", "lecturer-intruder-B", dto),
      ).rejects.toThrow(new ForbiddenException("You can only edit your own courses"));

      // Verify no UPDATE query was executed
      expect(mockDbService.query).not.toHaveBeenCalledWith(
        expect.stringContaining("UPDATE courses"),
        expect.anything(),
      );
    });

    it("should return unchanged course when empty update DTO is supplied", async () => {
      const existingCourse = {
        id: "c-1",
        name: "Original Name",
        lecturer_id: "lecturer-owner",
      };

      mockDbService.query.mockResolvedValueOnce({ rows: [existingCourse] });

      const result = await service.updateCourse("c-1", "lecturer-owner", {});

      expect(result).toEqual(existingCourse);
      expect(mockDbService.query).toHaveBeenCalledTimes(1); // only getCourseById
    });
  });

  describe("deleteCourse (AC 1 & AC 3: Ownership Gate enforcement)", () => {
    it("should allow course owner to delete their own course", async () => {
      const existingCourse = {
        id: "c-1",
        name: "Course to Delete",
        lecturer_id: "lecturer-owner",
      };

      mockDbService.query
        .mockResolvedValueOnce({ rows: [existingCourse] }) // getCourseById
        .mockResolvedValueOnce({ rows: [] }); // DELETE query

      const result = await service.deleteCourse("c-1", "lecturer-owner");

      expect(mockDbService.query).toHaveBeenNthCalledWith(
        2,
        "DELETE FROM courses WHERE id = $1",
        ["c-1"],
      );
      expect(result).toEqual({ message: "Course deleted successfully" });
    });

    it("should throw ForbiddenException when another lecturer attempts to delete the course", async () => {
      const existingCourse = {
        id: "c-1",
        name: "Protected Course",
        lecturer_id: "lecturer-owner-A",
      };

      mockDbService.query.mockResolvedValueOnce({ rows: [existingCourse] });

      await expect(
        service.deleteCourse("c-1", "lecturer-attacker-B"),
      ).rejects.toThrow(new ForbiddenException("You can only delete your own courses"));

      // Verify DELETE query was never called
      expect(mockDbService.query).not.toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM courses"),
        expect.anything(),
      );
    });
  });
});
