import { Test, TestingModule } from '@nestjs/testing';
import { BranchingAttemptController } from './branching-attempt.controller';
import { BranchingAttemptService } from './branching-attempt.service';
import { BadRequestException, ForbiddenException, ParseUUIDPipe, ValidationPipe } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { ChooseOptionDto } from './dto/choose-option.dto';
import { SaveReasoningDto } from './dto/save-reasoning.dto';
import { SubmitReflectionDto } from './dto/submit-reflection.dto';

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

  describe('pipes & DTO validation (D, J)', () => {
    const uuid1 = '11111111-1111-4111-8111-111111111111';
    const uuid2 = '22222222-2222-4222-8222-222222222222';
    const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });

    it.each([
      'startAttempt',
      'getAttemptsByCase',
      'getAttempt',
      'chooseOption',
      'saveRetrospectiveReasoning',
      'submitReflection',
    ] as const)('attaches ParseUUIDPipe to route parameter on %s', (method) => {
      const meta = Reflect.getMetadata(ROUTE_ARGS_METADATA, BranchingAttemptController, method) as Record<string, any>;
      const paramMeta = Object.values(meta).find((entry) => entry.index === 0);
      expect(paramMeta.pipes).toContain(ParseUUIDPipe);
    });

    it('validates ChooseOptionDto without min/max rules', async () => {
      await expect(
        pipe.transform({ nodeId: uuid1, selectedOptionId: uuid2 }, { type: 'body', metatype: ChooseOptionDto }),
      ).resolves.toEqual({ nodeId: uuid1, selectedOptionId: uuid2 });
      await expect(
        pipe.transform({ nodeId: 'bad', selectedOptionId: uuid2 }, { type: 'body', metatype: ChooseOptionDto }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        pipe.transform(
          { nodeId: uuid1, selectedOptionId: uuid2, extra: 'no' },
          { type: 'body', metatype: ChooseOptionDto },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('validates SaveReasoningDto without min/max length rules', async () => {
      await expect(
        pipe.transform({ nodeId: uuid1, reasoningText: 'ok' }, { type: 'body', metatype: SaveReasoningDto }),
      ).resolves.toEqual({ nodeId: uuid1, reasoningText: 'ok' });
      await expect(
        pipe.transform({ nodeId: uuid1, reasoningText: 123 }, { type: 'body', metatype: SaveReasoningDto }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        pipe.transform({ nodeId: 'bad', reasoningText: 'ok' }, { type: 'body', metatype: SaveReasoningDto }),
      ).rejects.toThrow(BadRequestException);
    });

    it('validates SubmitReflectionDto without min/max length rules', async () => {
      await expect(
        pipe.transform({ reflectionText: 'x' }, { type: 'body', metatype: SubmitReflectionDto }),
      ).resolves.toEqual({ reflectionText: 'x' });
      await expect(
        pipe.transform({ reflectionText: 42 }, { type: 'body', metatype: SubmitReflectionDto }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        pipe.transform({ reflectionText: 'x', extra: 1 }, { type: 'body', metatype: SubmitReflectionDto }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
