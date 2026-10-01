import { Test, TestingModule } from '@nestjs/testing';
import { CaseController } from './case.controller';
import { CaseService } from './case.service';

describe('CaseController', () => {
  let controller: CaseController;
  let service: CaseService;

  const mockCaseService = {
    generateCase: jest.fn(),
    getCasesByCourse: jest.fn(),
    getCaseById: jest.fn(),
    updateCase: jest.fn(),
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
    it('should generate a case', async () => {
      const body = { courseId: 'c1', materialIds: ['m1'], topicHint: 'test', numNodes: 5 };
      mockCaseService.generateCase.mockResolvedValue({ id: 'case-1' });

      const result = await controller.generateCase(body, { user: { id: 'lecturer-1' } });
      
      expect(result).toEqual({ status: 'SUCCESS', data: { id: 'case-1' } });
      expect(mockCaseService.generateCase).toHaveBeenCalledWith('c1', 'lecturer-1', body);
    });
  });

  describe('getCasesByCourse', () => {
    it('should call getCasesByCourse with role', async () => {
      mockCaseService.getCasesByCourse.mockResolvedValue([]);
      const result = await controller.getCasesByCourse('c1', { user: {} }, 'STUDENT');
      
      expect(result).toEqual({ status: 'SUCCESS', data: [] });
      expect(mockCaseService.getCasesByCourse).toHaveBeenCalledWith('c1', 'STUDENT');
    });
  });

  describe('getCaseById', () => {
    it('should call getCaseById with role', async () => {
      mockCaseService.getCaseById.mockResolvedValue({ id: 'case-1', status: 'PUBLISHED' });
      const result = await controller.getCaseById('case-1', { user: {} }, 'STUDENT');
      
      expect(result).toEqual({ status: 'SUCCESS', data: { id: 'case-1', status: 'PUBLISHED' } });
      expect(mockCaseService.getCaseById).toHaveBeenCalledWith('case-1', 'STUDENT');
    });

    it('should reject student accessing non-published case if service throws', async () => {
      const { ForbiddenException } = require('@nestjs/common');
      mockCaseService.getCaseById.mockRejectedValue(new ForbiddenException('Students can only access PUBLISHED cases'));
      
      await expect(controller.getCaseById('case-1', { user: {} }, 'STUDENT')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateCaseStatus', () => {
    it('should update case status', async () => {
      mockCaseService.updateCaseStatus.mockResolvedValue({ id: 'case-1', status: 'PUBLISHED' });
      const result = await controller.updateCaseStatus('case-1', { status: 'PUBLISHED' });
      
      expect(result).toEqual({ status: 'SUCCESS', data: { id: 'case-1', status: 'PUBLISHED' } });
      expect(mockCaseService.updateCaseStatus).toHaveBeenCalledWith('case-1', 'PUBLISHED');
    });

    it('should throw if publishing without root node', async () => {
      const { ForbiddenException } = require('@nestjs/common');
      mockCaseService.updateCaseStatus.mockRejectedValue(new ForbiddenException('Cannot publish case without root node'));
      
      await expect(controller.updateCaseStatus('case-1', { status: 'PUBLISHED' })).rejects.toThrow(ForbiddenException);
    });
  });
});
