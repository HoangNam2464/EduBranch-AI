import { Test, TestingModule } from '@nestjs/testing';
import { BranchingAttemptController } from './branching-attempt.controller';
import { BranchingAttemptService } from './branching-attempt.service';
import { ForbiddenException } from '@nestjs/common';

describe('BranchingAttemptController', () => {
  let controller: BranchingAttemptController;

  const mockService = {
    startAttempt: jest.fn(),
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
  });
});
