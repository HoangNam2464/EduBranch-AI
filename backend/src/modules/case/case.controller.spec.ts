import { Test, TestingModule } from '@nestjs/testing';
import { CaseController } from './case.controller';
import { CaseService } from './case.service';
import { ForbiddenException } from '@nestjs/common';

describe('CaseController', () => {
  let controller: CaseController;
  let service: CaseService;

  const mockCaseService = {
    generateCase: jest.fn(),
    getCasesByCourse: jest.fn(),
    getCaseById: jest.fn(),
    updateCase: jest.fn(),
    updateNode: jest.fn(),
    updateCaseStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CaseController],
      providers: [
        {
          provide: CaseService,
          useValue: mockCaseService,
        },
      ],
    }).compile();

    controller = module.get<CaseController>(CaseController);
    service = module.get<CaseService>(CaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generateCase', () => {
    it('should generate a case for lecturer', async () => {
      const body = { courseId: 'c1', materialIds: ['m1'], topicHint: 'test', numNodes: 5 };
      mockCaseService.generateCase.mockResolvedValue({ id: 'case-1' });

      const result = await controller.generateCase(body, { id: 'lecturer-1', role: 'LECTURER' });

      expect(result).toEqual({ status: 'SUCCESS', data: { id: 'case-1' } });
      expect(mockCaseService.generateCase).toHaveBeenCalledWith('c1', 'lecturer-1', body);
    });

    it('should reject student attempting to generate case', async () => {
      const body = { courseId: 'c1', materialIds: ['m1'] };
      await expect(
        controller.generateCase(body, { id: 'student-1', role: 'STUDENT' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getCasesByCourse', () => {
    it('should call getCasesByCourse using authenticated user role', async () => {
      mockCaseService.getCasesByCourse.mockResolvedValue([]);
      const result = await controller.getCasesByCourse('c1', { id: 'student-1', role: 'STUDENT' });

      expect(result).toEqual({ status: 'SUCCESS', data: [] });
      expect(mockCaseService.getCasesByCourse).toHaveBeenCalledWith('c1', 'STUDENT');
    });
  });

  describe('getCaseById', () => {
    it('should call getCaseById using authenticated user identity', async () => {
      mockCaseService.getCaseById.mockResolvedValue({ id: 'case-1', status: 'PUBLISHED' });
      const result = await controller.getCaseById('case-1', { id: 'student-1', role: 'STUDENT' });

      expect(result).toEqual({ status: 'SUCCESS', data: { id: 'case-1', status: 'PUBLISHED' } });
      expect(mockCaseService.getCaseById).toHaveBeenCalledWith('case-1', 'STUDENT', 'student-1');
    });

    it('should reject student accessing non-published case if service throws', async () => {
      mockCaseService.getCaseById.mockRejectedValue(
        new ForbiddenException('Students can only access PUBLISHED cases'),
      );

      await expect(
        controller.getCaseById('case-1', { id: 'student-1', role: 'STUDENT' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateCaseStatus', () => {
    it('should update case status for course lecturer', async () => {
      mockCaseService.updateCaseStatus.mockResolvedValue({ id: 'case-1', status: 'APPROVED' });
      const result = await controller.updateCaseStatus(
        'case-1',
        { status: 'APPROVED' },
        { id: 'lecturer-1', role: 'LECTURER' },
      );

      expect(result).toEqual({ status: 'SUCCESS', data: { id: 'case-1', status: 'APPROVED' } });
      expect(mockCaseService.updateCaseStatus).toHaveBeenCalledWith('case-1', 'lecturer-1', 'APPROVED');
    });

    it('should reject non-lecturer from updating status', async () => {
      await expect(
        controller.updateCaseStatus(
          'case-1',
          { status: 'PUBLISHED' },
          { id: 'student-1', role: 'STUDENT' },
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateNode', () => {
    it('should call updateNode on service for lecturer', async () => {
      const body = {
        situation: 'Updated situation',
        options: [
          { option_text: 'Opt 1', consequence: 'Cons 1', next_node_id: 'node-2' },
          { option_text: 'Opt 2', consequence: 'Cons 2', next_node_id: 'node-3' },
        ],
      };
      mockCaseService.updateNode.mockResolvedValue({ id: 'case-1' });

      const result = await controller.updateNode('case-1', 'node-1', body as any, {
        id: 'lecturer-1',
        role: 'LECTURER',
      });

      expect(result).toEqual({ status: 'SUCCESS', data: { id: 'case-1' } });
      expect(mockCaseService.updateNode).toHaveBeenCalledWith('case-1', 'node-1', 'lecturer-1', body);
    });

    it('should reject non-lecturer from updating node', async () => {
      await expect(
        controller.updateNode('case-1', 'node-1', {} as any, {
          id: 'student-1',
          role: 'STUDENT',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
