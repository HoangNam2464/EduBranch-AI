import { Test, TestingModule } from '@nestjs/testing';
import { BranchingAttemptService } from './branching-attempt.service';
import { DatabaseService } from '../../common/database/database.service';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('BranchingAttemptService', () => {
  let service: BranchingAttemptService;

  const mockDbClient = {
    query: jest.fn(),
    release: jest.fn(),
  };

  const mockDbService = {
    getClient: jest.fn().mockResolvedValue(mockDbClient),
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchingAttemptService,
        { provide: DatabaseService, useValue: mockDbService },
      ],
    }).compile();

    service = module.get<BranchingAttemptService>(BranchingAttemptService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startAttempt', () => {
    it('should throw ForbiddenException if studentId is missing or invalid', async () => {
      await expect(service.startAttempt('case-1', '')).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if case does not exist', async () => {
      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ id: 'student-1' }] }) // resolveStudent
        .mockResolvedValueOnce({ rows: [] }) // published-only case lookup
        .mockResolvedValueOnce({ rows: [] }); // existence check

      await expect(service.startAttempt('non-existent-case', 'student-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if case is not PUBLISHED', async () => {
      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ id: 'student-1' }] }) // resolveStudent
        .mockResolvedValueOnce({ rows: [] }) // published-only lookup rejects DRAFT
        .mockResolvedValueOnce({ rows: [{ id: 'case-1' }] }); // status-only existence check

      await expect(service.startAttempt('case-1', 'student-1')).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockDbService.query.mock.calls[1][0]).toContain("status = 'PUBLISHED'");
      expect(mockDbService.query).not.toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO branching_attempts'), expect.any(Array),
      );
    });

    it.each(['REVIEWED', 'APPROVED'])(
      'should reject direct attempt access for %s cases before reading content',
      async (status) => {
        mockDbService.query
          .mockResolvedValueOnce({ rows: [{ id: 'student-1' }] })
          .mockResolvedValueOnce({ rows: [] })
          .mockResolvedValueOnce({ rows: [{ id: 'case-1', status }] });

        await expect(service.startAttempt('case-1', 'student-1')).rejects.toThrow(ForbiddenException);
        expect(mockDbService.query.mock.calls[1][0]).toContain("status = 'PUBLISHED'");
        expect(mockDbService.query.mock.calls[2][0]).toBe('SELECT id FROM cases WHERE id = $1');
      },
    );

    it('should successfully create attempt and increment attempt number', async () => {
      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ id: 'student-1' }] }) // resolveStudent
        .mockResolvedValueOnce({
          rows: [{ id: 'case-1', status: 'PUBLISHED', learning_mode: 'BRANCHING_STUDY', root_node_id: 'n-1' }],
        }) // case lookup
        .mockResolvedValueOnce({ rows: [{ max_num: '1' }] }) // previous attempts check
        .mockResolvedValueOnce({ rows: [] }) // insert attempt
        // getAttempt queries:
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'attempt-2',
              case_id: 'case-1',
              student_id: 'student-1',
              attempt_number: 2,
              current_node_id: 'n-1',
              outcome_node_id: null,
              is_completed: false,
              reflection_status: 'NOT_STARTED',
              case_title: 'Business Case',
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] }) // steps
        .mockResolvedValueOnce({ rows: [{ id: 'n-1', situation: 'Situation 1', is_terminal: false, node_index: 0 }] }) // current node
        .mockResolvedValueOnce({ rows: [{ id: 'opt-1', text: 'Option A' }] }); // current node options (no consequence/next_node_id)

      const result = await service.startAttempt('case-1', 'student-1');
      expect(result).toBeDefined();
      expect(result.attemptNumber).toBe(2);
      expect(result.isCompleted).toBe(false);
      expect(result.currentNode.options[0].next_node_id).toBeUndefined();
    });
  });

  describe('getAttemptsByCase published-only access', () => {
    it('lists attempts only after a published-only Case lookup succeeds', async () => {
      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ id: 'student-1' }] })
        .mockResolvedValueOnce({ rows: [{ id: 'case-1' }] })
        .mockResolvedValueOnce({ rows: [{ id: 'att-1', attempt_number: 1 }] });

      const result = await service.getAttemptsByCase('case-1', 'student-1');

      expect(result).toEqual([{ id: 'att-1', attempt_number: 1 }]);
      expect(mockDbService.query.mock.calls[1][0]).toContain("status = 'PUBLISHED'");
      expect(mockDbService.query.mock.calls[2][0]).toContain("c.status = 'PUBLISHED'");
    });

    it.each(['DRAFT', 'REVIEWED', 'APPROVED'])(
      'rejects attempts lookup for an unpublished %s Case',
      async (status) => {
        mockDbService.query
          .mockResolvedValueOnce({ rows: [{ id: 'student-1' }] })
          .mockResolvedValueOnce({ rows: [] })
          .mockResolvedValueOnce({ rows: [{ id: 'case-1', status }] });

        await expect(service.getAttemptsByCase('case-1', 'student-1')).rejects.toThrow(ForbiddenException);
        expect(mockDbService.query.mock.calls[1][0]).toContain("status = 'PUBLISHED'");
        expect(mockDbService.query).toHaveBeenCalledTimes(3);
      },
    );
  });

  describe('getAttempt & Data Masking (P0-SEC-02, P0-DATA-04)', () => {
    it('should throw ForbiddenException if student does not own attempt', async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [{ id: 'att-1', student_id: 'student-owner' }],
      });

      await expect(service.getAttempt('att-1', 'intruder-student')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should reject a direct attempt ID lookup when the Case is not published before loading steps', async () => {
      mockDbService.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ student_id: 'student-1', status: 'APPROVED' }] });

      await expect(service.getAttempt('att-1', 'student-1')).rejects.toThrow(ForbiddenException);
      expect(mockDbService.query.mock.calls[0][0]).toContain("c.status = 'PUBLISHED'");
      expect(mockDbService.query).not.toHaveBeenCalledWith(expect.stringContaining('student_reasoning'), expect.any(Array));
      expect(mockDbService.query).not.toHaveBeenCalledWith(expect.stringContaining('case_nodes'), expect.any(Array));
    });

    it('should hide consequences and next_node_id while attempt is in progress', async () => {
      mockDbService.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'att-1',
              student_id: 'student-1',
              is_completed: false,
              current_node_id: 'n-2',
            },
          ],
        }) // attempt
        .mockResolvedValueOnce({
          rows: [
            {
              reasoning_id: 'r-1',
              node_id: 'n-1',
              selected_option_id: 'opt-1',
              option_text: 'Option 1',
              consequence: 'Secret consequence',
              next_node_id: 'n-2',
              situation: 'Situation 1',
            },
          ],
        }) // steps
        .mockResolvedValueOnce({
          rows: [{ id: 'n-2', situation: 'Sit 2', is_terminal: false, node_index: 1 }],
        }) // current node
        .mockResolvedValueOnce({
          rows: [{ id: 'opt-2', text: 'Option 2' }],
        }); // options

      const result = await service.getAttempt('att-1', 'student-1');
      expect(result.steps[0].consequence).toBeUndefined();
      expect(result.steps[0].otherOptions).toEqual([]);
      expect(result.currentNode.options[0].next_node_id).toBeUndefined();
    });

    it('should reveal consequences when attempt is completed (REVIEW phase)', async () => {
      mockDbService.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'att-1',
              student_id: 'student-1',
              is_completed: true,
              outcome_node_id: 'n-3',
            },
          ],
        }) // attempt
        .mockResolvedValueOnce({
          rows: [
            {
              reasoning_id: 'r-1',
              node_id: 'n-1',
              selected_option_id: 'opt-1',
              option_text: 'Option 1',
              consequence: 'Revealed consequence',
              next_node_id: 'n-2',
              situation: 'Situation 1',
            },
          ],
        }) // steps
        .mockResolvedValueOnce({
          rows: [{ id: 'opt-alt', text: 'Alternative Option' }],
        }) // otherOptions in review phase
        .mockResolvedValueOnce({
          rows: [{ id: 'n-3', situation: 'Outcome Sit', is_terminal: true }],
        }); // outcomeNode

      const result = await service.getAttempt('att-1', 'student-1');
      expect(result.steps[0].consequence).toBe('Revealed consequence');
      expect(result.steps[0].otherOptions.length).toBe(1);
    });
  });

  describe('chooseOption (P0-DATA-04 with FOR UPDATE transaction)', () => {
    it('should throw ForbiddenException if student does not own attempt', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({
          rows: [{ id: 'att-1', student_id: 'owner-student', is_completed: false }],
        }); // FOR UPDATE

      await expect(
        service.chooseOption('att-1', 'intruder-student', { nodeId: 'n-1', selectedOptionId: 'opt-1' }),
      ).rejects.toThrow(ForbiddenException);

      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should throw BadRequestException if attempt is already completed', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({
          rows: [{ id: 'att-1', student_id: 'student-1', is_completed: true }],
        }); // FOR UPDATE

      await expect(
        service.chooseOption('att-1', 'student-1', { nodeId: 'n-1', selectedOptionId: 'opt-1' }),
      ).rejects.toThrow(BadRequestException);

      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should throw BadRequestException if submitted nodeId does not match current_node_id', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({
          rows: [{ id: 'att-1', student_id: 'student-1', is_completed: false, current_node_id: 'n-2' }],
        }); // FOR UPDATE

      await expect(
        service.chooseOption('att-1', 'student-1', { nodeId: 'n-wrong', selectedOptionId: 'opt-1' }),
      ).rejects.toThrow(BadRequestException);

      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('rejects step requests for attempts whose Case is no longer published', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ student_id: 'student-1', status: 'DRAFT' }] });

      await expect(service.chooseOption('att-1', 'student-1', {
        nodeId: 'n-1', selectedOptionId: 'opt-1',
      })).rejects.toThrow(ForbiddenException);

      expect(mockDbClient.query.mock.calls[1][0]).toContain("c.status = 'PUBLISHED'");
      expect(mockDbClient.query).not.toHaveBeenCalledWith(expect.stringContaining('FROM case_options'), expect.any(Array));
      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should execute FOR UPDATE transaction and advance node', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({
          rows: [{ id: 'att-1', student_id: 'student-1', current_node_id: 'n-1', is_completed: false }],
        }) // SELECT ... FOR UPDATE
        .mockResolvedValueOnce({
          rows: [{ id: 'opt-1', option_text: 'Choice A', consequence: 'Cons A', next_node_id: 'n-2' }],
        }) // option check
        .mockResolvedValueOnce({}) // INSERT student_reasoning
        .mockResolvedValueOnce({ rows: [{ is_terminal: false }] }) // next node terminal check
        .mockResolvedValueOnce({}) // UPDATE attempt current_node_id
        .mockResolvedValueOnce({}); // COMMIT

      // getAttempt mock calls:
      mockDbService.query
        .mockResolvedValueOnce({
          rows: [{ id: 'att-1', student_id: 'student-1', current_node_id: 'n-2', is_completed: false }],
        })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 'n-2', situation: 'Next Sit', is_terminal: false }] })
        .mockResolvedValueOnce({ rows: [] });

      const res = await service.chooseOption('att-1', 'student-1', {
        nodeId: 'n-1',
        selectedOptionId: 'opt-1',
      });

      expect(res).toBeDefined();
      expect(mockDbClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockDbClient.query).toHaveBeenCalledWith(
        expect.stringContaining("c.status = 'PUBLISHED' FOR UPDATE OF a"),
        ['att-1'],
      );
      expect(mockDbClient.query).toHaveBeenCalledWith('COMMIT');
    });
  });

  describe('saveRetrospectiveReasoning', () => {
    it('should throw ForbiddenException if student does not own attempt', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({
          rows: [{ student_id: 'owner-student', is_completed: true }],
        }); // FOR UPDATE

      await expect(
        service.saveRetrospectiveReasoning('att-1', 'intruder-student', { nodeId: 'n-1', reasoningText: 'My reasoning' }),
      ).rejects.toThrow(ForbiddenException);

      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should save retrospective reasoning inside transaction', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({
          rows: [{ student_id: 'student-1', is_completed: true }],
        }) // FOR UPDATE
        .mockResolvedValueOnce({
          rows: [{ id: 'reasoning-1' }],
        }) // check reasoning exists
        .mockResolvedValueOnce({}) // UPDATE student_reasoning
        .mockResolvedValueOnce({}); // COMMIT

      const res = await service.saveRetrospectiveReasoning('att-1', 'student-1', {
        nodeId: 'n-1',
        reasoningText: 'Because it was the most viable strategy',
      });

      expect(res.status).toBe('SAVED');
      expect(mockDbClient.query).toHaveBeenCalledWith('COMMIT');
    });
  });

  describe('submitReflection', () => {
    it('should throw BadRequestException if attempt is not completed', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({
          rows: [{ student_id: 'student-1', is_completed: false, reflection_status: 'NOT_STARTED' }],
        });

      await expect(
        service.submitReflection('att-1', 'student-1', { reflectionText: 'Reflection text' }),
      ).rejects.toThrow(BadRequestException);

      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should throw BadRequestException if reflection is already submitted', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({
          rows: [{ student_id: 'student-1', is_completed: true, reflection_status: 'SUBMITTED' }],
        });

      await expect(
        service.submitReflection('att-1', 'student-1', { reflectionText: 'New overwrite' }),
      ).rejects.toThrow(BadRequestException);

      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should successfully submit reflection and commit transaction', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({
          rows: [{ student_id: 'student-1', is_completed: true, reflection_status: 'NOT_STARTED' }],
        })
        .mockResolvedValueOnce({}) // UPDATE reflection
        .mockResolvedValueOnce({}); // COMMIT

      const res = await service.submitReflection('att-1', 'student-1', {
        reflectionText: 'Deep retrospective insights',
      });

      expect(res.reflectionStatus).toBe('SUBMITTED');
      expect(mockDbClient.query).toHaveBeenCalledWith('COMMIT');
    });
  });
});
