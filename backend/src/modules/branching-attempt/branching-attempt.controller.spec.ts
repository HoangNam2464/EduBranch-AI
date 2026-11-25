import { Test, TestingModule } from '@nestjs/testing';
import { BranchingAttemptController } from './branching-attempt.controller';
import { BranchingAttemptService } from './branching-attempt.service';
import { ForbiddenException } from '@nestjs/common';

describe('BranchingAttemptController', () => {
  let controller: BranchingAttemptController;

  const mockService = {
    startAttempt: jest.fn(),
    getJourneyReview: jest.fn(),
    getAttemptsByCase: jest.fn(),
    getAttempt: jest.fn(),
    chooseOption: jest.fn(),
    saveRetrospectiveReasoning: jest.fn(),
    submitReflection: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BranchingAttemptController],
      providers: [
        {
          provide: BranchingAttemptService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<BranchingAttemptController>(BranchingAttemptController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('startAttempt', () => {
    it('should throw ForbiddenException if user is not STUDENT', async () => {
      await expect(
        controller.startAttempt('case-1', { id: 'lecturer-1', role: 'LECTURER' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should pass authenticated student id to service', async () => {
      mockService.startAttempt.mockResolvedValueOnce({ id: 'att-1' });

      const res = await controller.startAttempt('case-1', { id: 'student-1', role: 'STUDENT' });
      expect(mockService.startAttempt).toHaveBeenCalledWith('case-1', 'student-1');
      expect(res.data.id).toBe('att-1');
    });
  });

  describe('getJourneyReview', () => {
    it('rejects non-student callers', async () => {
      await expect(controller.getJourneyReview('case-1', 'att-1', {
        id: 'lecturer-1', role: 'LECTURER',
      })).rejects.toThrow(ForbiddenException);
      expect(mockService.getJourneyReview).not.toHaveBeenCalled();
    });

    it('passes Case, attempt, and authenticated Student identity to the service', async () => {
      mockService.getJourneyReview.mockResolvedValueOnce({ attemptId: 'att-1', path: [] });

      const result = await controller.getJourneyReview('case-1', 'att-1', {
        id: 'student-1', role: 'STUDENT',
      });

      expect(mockService.getJourneyReview).toHaveBeenCalledWith('case-1', 'att-1', 'student-1');
      expect(result.data.attemptId).toBe('att-1');
    });
  });

  describe('chooseOption', () => {
    it('should throw ForbiddenException if user is not STUDENT', async () => {
      await expect(
        controller.chooseOption('att-1', { nodeId: 'n-1', selectedOptionId: 'o-1' }, { id: 'user-1', role: 'LECTURER' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should pass authenticated student id to service', async () => {
      mockService.chooseOption.mockResolvedValueOnce({ id: 'att-1' });

      const res = await controller.chooseOption(
        'att-1',
        { nodeId: 'n-1', selectedOptionId: 'o-1' },
        { id: 'student-1', role: 'STUDENT' },
      );
      expect(mockService.chooseOption).toHaveBeenCalledWith('att-1', 'student-1', {
        nodeId: 'n-1',
        selectedOptionId: 'o-1',
      });
      expect(res.status).toBe('SUCCESS');
    });
  });

  describe('saveRetrospectiveReasoning', () => {
    it('should reject non-student caller', async () => {
      await expect(
        controller.saveRetrospectiveReasoning(
          'att-1',
          { nodeId: 'n-1', reasoningText: 'Why I chose this' },
          { id: 'lect-1', role: 'LECTURER' },
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('passes the decision point and authenticated Student to the service', async () => {
      mockService.saveRetrospectiveReasoning.mockResolvedValueOnce({ status: 'SAVED' });
      const result = await controller.saveRetrospectiveReasoning(
        'att-1',
        { nodeId: 'node-1', reasoningText: 'My retrospective explanation' },
        { id: 'student-1', role: 'STUDENT' },
      );
      expect(mockService.saveRetrospectiveReasoning).toHaveBeenCalledWith('att-1', 'student-1', {
        nodeId: 'node-1', reasoningText: 'My retrospective explanation',
      });
      expect(result.data.status).toBe('SAVED');
    });
  });

  describe('submitReflection', () => {
    it('should reject non-student caller', async () => {
      await expect(
        controller.submitReflection(
          'att-1',
          { reflectionText: 'My reflection' },
          { id: 'lect-1', role: 'LECTURER' },
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('passes the reflection submission to the authenticated Student attempt', async () => {
      mockService.submitReflection.mockResolvedValueOnce({ reflectionStatus: 'SUBMITTED' });
      const result = await controller.submitReflection(
        'att-1',
        { reflectionText: 'My overall reflection' },
        { id: 'student-1', role: 'STUDENT' },
      );
      expect(mockService.submitReflection).toHaveBeenCalledWith('att-1', 'student-1', {
        reflectionText: 'My overall reflection',
      });
      expect(result.data.reflectionStatus).toBe('SUBMITTED');
    });

    it('keeps the previous POST handler as a compatibility alias', async () => {
      mockService.submitReflection.mockResolvedValueOnce({ reflectionStatus: 'SUBMITTED' });
      const result = await controller.submitReflectionLegacy(
        'att-1',
        { reflectionText: 'My overall reflection' },
        { id: 'student-1', role: 'STUDENT' },
      );
      expect(result.data.reflectionStatus).toBe('SUBMITTED');
      expect(mockService.submitReflection).toHaveBeenCalledWith('att-1', 'student-1', {
        reflectionText: 'My overall reflection',
      });
    });
  });
});
