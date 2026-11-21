import { Test, TestingModule } from "@nestjs/testing";
import { CourseService } from "./course.service";
import { DatabaseService } from "../../common/database/database.service";
import {
  ForbiddenException,
  NotFoundException,
  ConflictException,
  GoneException,
  BadRequestException,
} from "@nestjs/common";
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
        expect.stringContaining("WHERE lecturer_id = $1 AND is_active = TRUE"),
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

  describe("archiveCourse (C1-B soft archive, OPD-014: ownership gate, data kept)", () => {
    it("sets is_active = FALSE for the owner and touches no child table", async () => {
      const existingCourse = { id: "c-1", name: "Course", lecturer_id: "lecturer-owner", is_active: true };
      const archived = { ...existingCourse, is_active: false, active: false };

      mockDbService.query
        .mockResolvedValueOnce({ rows: [existingCourse] }) // getCourseById
        .mockResolvedValueOnce({ rows: [archived] }); // UPDATE

      const result = await service.archiveCourse("c-1", "lecturer-owner");

      expect(mockDbService.query).toHaveBeenCalledTimes(2);
      const [sql, params] = mockDbService.query.mock.calls[1];
      expect(sql).toContain("UPDATE courses SET is_active = FALSE, updated_at = NOW() WHERE id = $1");
      expect(params).toEqual(["c-1"]);
      for (const [q] of mockDbService.query.mock.calls) {
        expect(q).not.toMatch(/DELETE|teaching_materials|document_chunks|cases/i);
      }
      expect(result).toEqual(archived);
    });

    it("returns an already archived course without a second UPDATE", async () => {
      const archived = { id: "c-1", lecturer_id: "lecturer-owner", is_active: false };
      mockDbService.query.mockResolvedValueOnce({ rows: [archived] });

      const result = await service.archiveCourse("c-1", "lecturer-owner");

      expect(result).toEqual(archived);
      expect(mockDbService.query).toHaveBeenCalledTimes(1);
    });

    it("throws ForbiddenException for another lecturer and never updates", async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [{ id: "c-1", lecturer_id: "lecturer-owner-A", is_active: true }],
      });

      await expect(service.archiveCourse("c-1", "lecturer-attacker-B")).rejects.toThrow(
        new ForbiddenException("You can only archive your own courses"),
      );
      expect(mockDbService.query).toHaveBeenCalledTimes(1);
    });

    it("throws NotFoundException for an unknown course", async () => {
      mockDbService.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.archiveCourse("missing", "lecturer-owner")).rejects.toThrow(NotFoundException);
    });

    it("has no hard-delete method any more (C1-B: archive replaces delete)", () => {
      expect((service as unknown as Record<string, unknown>).deleteCourse).toBeUndefined();
    });
  });

  describe("Invite Code Management (BE-029)", () => {
    it("getInviteCode returns existing invite code", async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [{ id: "c-1", lecturer_id: "lecturer-1", invite_code: "EXISTING", invite_code_active: true }],
      });

      const result = await service.getInviteCode("c-1", "lecturer-1");
      expect(result).toEqual({ inviteCode: "EXISTING", isActive: true });
    });

    it("getInviteCode returns null without generating or writing when none exists (no side effect, Fix 8)", async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [{ id: "c-1", lecturer_id: "lecturer-1", invite_code: null, invite_code_active: true }],
      });

      const result = await service.getInviteCode("c-1", "lecturer-1");
      expect(result).toEqual({ inviteCode: null, isActive: false });
      expect(mockDbService.query).toHaveBeenCalledTimes(1);
      expect(mockDbService.query).not.toHaveBeenCalledWith(
        expect.stringContaining("UPDATE courses SET invite_code"),
        expect.anything(),
      );
    });

    it("rotateInviteCode generates a new code and activates it", async () => {
      mockDbService.query
        .mockResolvedValueOnce({
          rows: [{ id: "c-1", lecturer_id: "lecturer-1", is_active: true }],
        })
        .mockResolvedValueOnce({ rows: [] });

      const result = await service.rotateInviteCode("c-1", "lecturer-1");
      expect(result.inviteCode).toBeDefined();
      expect(result.isActive).toBe(true);
    });

    it("rotateInviteCode retries on 23505 collision and succeeds (Fix 3)", async () => {
      mockDbService.query
        .mockResolvedValueOnce({
          rows: [{ id: "c-1", lecturer_id: "lecturer-1", is_active: true }],
        })
        .mockRejectedValueOnce({ code: "23505" }) // collision on 1st attempt
        .mockResolvedValueOnce({ rows: [] }); // success on 2nd attempt

      const result = await service.rotateInviteCode("c-1", "lecturer-1");
      expect(result.inviteCode).toBeDefined();
      expect(result.isActive).toBe(true);
      expect(mockDbService.query).toHaveBeenCalledTimes(3);
    });

    it("rotateInviteCode throws ConflictException after retries on 23505 (Fix 3)", async () => {
      mockDbService.query
        .mockResolvedValueOnce({
          rows: [{ id: "c-1", lecturer_id: "lecturer-1", is_active: true }],
        })
        .mockRejectedValue({ code: "23505" }); // all retries collide

      await expect(service.rotateInviteCode("c-1", "lecturer-1")).rejects.toThrow(ConflictException);
    });

    it("rotateInviteCode rejects archived course with ConflictException (409)", async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [{ id: "c-1", lecturer_id: "lecturer-1", is_active: false }],
      });

      await expect(service.rotateInviteCode("c-1", "lecturer-1")).rejects.toThrow(
        new ConflictException("Course is archived"),
      );
    });

    it("rotateInviteCode throws ForbiddenException for non-owner", async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [{ id: "c-1", lecturer_id: "lecturer-other", is_active: true }],
      });

      await expect(service.rotateInviteCode("c-1", "lecturer-attacker")).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("disableInviteCode sets invite_code_active = FALSE", async () => {
      mockDbService.query
        .mockResolvedValueOnce({
          rows: [{ id: "c-1", lecturer_id: "lecturer-1", is_active: true }],
        })
        .mockResolvedValueOnce({ rows: [{ invite_code: "CODE", invite_code_active: false }] });

      const result = await service.disableInviteCode("c-1", "lecturer-1");
      expect(result).toEqual({ inviteCode: "CODE", isActive: false });
    });
  });

  describe("enrollStudentByInviteCode (BE-029)", () => {
    it("throws BadRequestException (400) if code is empty", async () => {
      await expect(service.enrollStudentByInviteCode("student-1", "   ")).rejects.toThrow(
        new BadRequestException("Invite code is required"),
      );
    });

    it("throws NotFoundException (404) if code not found", async () => {
      mockDbService.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.enrollStudentByInviteCode("student-1", "UNKNOWN1")).rejects.toThrow(
        new NotFoundException("Invalid invite code"),
      );
    });

    it("throws ConflictException (409) if course is archived", async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [{ id: "c-archived", is_active: false, invite_code: "CODE1234", invite_code_active: true }],
      });

      await expect(service.enrollStudentByInviteCode("student-1", "CODE1234")).rejects.toThrow(
        new ConflictException("Course is archived"),
      );
    });

    it("throws GoneException (410) if code is disabled/expired", async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [{ id: "c-1", is_active: true, invite_code: "CODE1234", invite_code_active: false }],
      });

      await expect(service.enrollStudentByInviteCode("student-1", "CODE1234")).rejects.toThrow(
        new GoneException("Invite code has expired or is disabled"),
      );
    });

    it("throws ConflictException (409) on race condition when ON CONFLICT DO NOTHING returns no row (Fix 5)", async () => {
      const mockCourse = { id: "c-1", name: "Corporate Law", is_active: true, invite_code_active: true };
      mockDbService.query
        .mockResolvedValueOnce({ rows: [mockCourse] }) // find course by code
        .mockResolvedValueOnce({ rows: [] }); // insert returns no row

      await expect(service.enrollStudentByInviteCode("student-1", "CODE1234")).rejects.toThrow(
        new ConflictException("Already enrolled in this course"),
      );
    });

    it("throws ConflictException (409) if insert raises 23505 unique violation (Fix 5)", async () => {
      const mockCourse = { id: "c-1", name: "Corporate Law", is_active: true, invite_code_active: true };
      mockDbService.query
        .mockResolvedValueOnce({ rows: [mockCourse] }) // find course by code
        .mockRejectedValueOnce({ code: "23505" }); // insert throws 23505

      await expect(service.enrollStudentByInviteCode("student-1", "CODE1234")).rejects.toThrow(
        new ConflictException("Already enrolled in this course"),
      );
    });

    it("inserts enrollment and returns safe course projection without invite code (Fix 2 & 9)", async () => {
      const mockCourse = {
        id: "c-1",
        name: "Corporate Law",
        description: "Desc",
        course_code: "LAW-301",
        lecturer_id: "lec-1",
        active: true,
        is_active: true,
        invite_code: "CODE1234",
        invite_code_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockDbService.query
        .mockResolvedValueOnce({ rows: [mockCourse] }) // find course by code
        .mockResolvedValueOnce({ rows: [{ id: "enrollment-1" }] }); // insert enrollment

      const result = await service.enrollStudentByInviteCode("student-1", "code1234");

      // Verify query used WHERE invite_code = $1 with uppercase code (Fix 9)
      expect(mockDbService.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE invite_code = $1"),
        ["CODE1234"],
      );
      expect(mockDbService.query).toHaveBeenCalledWith(
        expect.stringContaining("ON CONFLICT (course_id, student_id) DO NOTHING"),
        [expect.any(String), "c-1", "student-1"],
      );

      // Verify safe projection does NOT contain invite_code (Fix 2)
      expect((result as any).invite_code).toBeUndefined();
      expect((result as any).invite_code_active).toBeUndefined();
      expect(result.id).toBe("c-1");
      expect(result.name).toBe("Corporate Law");
    });
  });

  describe("getStudentEnrolledCourses & getStudentDashboard (BE-029)", () => {
    it("getStudentEnrolledCourses queries course_enrollments joined with courses", async () => {
      const mockCourses = [{ id: "c-1", name: "Corporate Law", enrolled_at: new Date() }];
      mockDbService.query.mockResolvedValueOnce({ rows: mockCourses });

      const result = await service.getStudentEnrolledCourses("student-1");
      expect(result).toEqual(mockCourses);
      expect(mockDbService.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE ce.student_id = $1 AND c.is_active = TRUE"),
        ["student-1"],
      );
    });

    it("getStudentDashboard returns aggregated enrolled courses, recent cases, and stats (Fix 1: ba.student_id)", async () => {
      const mockCourses = [{ id: "c-1", name: "Corporate Law" }];
      const mockCases = [{ id: "cs-1", title: "Law Case", status: "PUBLISHED" }];
      const mockAttempts = [{ id: "ba-1", is_completed: false }];

      mockDbService.query
        .mockResolvedValueOnce({ rows: mockCourses }) // enrolled courses
        .mockResolvedValueOnce({ rows: mockCases }) // cases
        .mockResolvedValueOnce({ rows: mockAttempts }); // attempts

      const result = await service.getStudentDashboard("student-1");
      expect(result.enrolledCourses).toEqual(mockCourses);
      expect(result.recentCases).toEqual(mockCases);
      expect(result.activeCases).toEqual(mockAttempts);
      expect(result.stats).toEqual({
        totalEnrolled: 1,
        totalActiveCases: 1,
        totalPublishedCases: 1,
      });

      // Verify Fix 1: query uses ba.student_id = $1, NOT ba.user_id
      const queryCalls = mockDbService.query.mock.calls;
      const attemptsCall = queryCalls.find(
        (call: any[]) => typeof call[0] === "string" && call[0].includes("branching_attempts"),
      );
      expect(attemptsCall).toBeDefined();
      expect(attemptsCall[0]).toContain("ba.student_id = $1");
      expect(attemptsCall[0]).not.toContain("ba.user_id");
    });
  });
});
