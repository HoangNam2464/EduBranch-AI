import { Test, TestingModule } from '@nestjs/testing';
import { BranchingAttemptService } from './branching-attempt.service';
import { DatabaseService } from '../../common/database/database.service';
import { ForbiddenException, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';

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
        .mockResolvedValueOnce({ rows: [{ id: 'student-1' }] }); // resolveStudent
      mockDbClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [] }) // published-only case lookup
        .mockResolvedValueOnce({ rows: [] }) // existence check
        .mockResolvedValueOnce({}); // ROLLBACK

      await expect(service.startAttempt('non-existent-case', 'student-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if case is not PUBLISHED', async () => {
      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ id: 'student-1' }] }); // resolveStudent
      mockDbClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [] }) // published-only lookup rejects DRAFT
        .mockResolvedValueOnce({ rows: [{ id: 'case-1' }] }) // existence check
        .mockResolvedValueOnce({}); // ROLLBACK

      await expect(service.startAttempt('case-1', 'student-1')).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockDbClient.query.mock.calls[1][0]).toContain("status = 'PUBLISHED'");
      expect(mockDbClient.query).not.toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO branching_attempts'), expect.any(Array),
      );
    });

    it.each(['REVIEWED', 'APPROVED'])(
      'should reject direct attempt access for %s cases before reading content',
      async (status) => {
        mockDbService.query
          .mockResolvedValueOnce({ rows: [{ id: 'student-1' }] });
        mockDbClient.query
          .mockResolvedValueOnce({})
          .mockResolvedValueOnce({ rows: [] })
          .mockResolvedValueOnce({ rows: [{ id: 'case-1', status }] })
          .mockResolvedValueOnce({});

        await expect(service.startAttempt('case-1', 'student-1')).rejects.toThrow(ForbiddenException);
        expect(mockDbClient.query.mock.calls[1][0]).toContain("status = 'PUBLISHED'");
        expect(mockDbClient.query.mock.calls[2][0]).toBe('SELECT id FROM cases WHERE id = $1');
      },
    );

    it('should successfully create attempt and increment attempt number', async () => {
      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ id: 'student-1' }] }) // resolveStudent
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
      mockDbClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 'case-1', status: 'PUBLISHED', learning_mode: 'BRANCHING_STUDY', root_node_id: 'n-1' }] })
        .mockResolvedValueOnce({ rows: [{ max_num: '1' }] })
        .mockResolvedValueOnce({}) // INSERT
        .mockResolvedValueOnce({}); // COMMIT

      const result = await service.startAttempt('case-1', 'student-1');
      expect(result).toBeDefined();
      expect(result.attemptNumber).toBe(2);
      expect(result.isCompleted).toBe(false);
      expect(result.currentNode.options[0].next_node_id).toBeUndefined();
      expect(mockDbClient.query.mock.calls[1][0]).toContain('FOR UPDATE');
      expect(mockDbClient.query.mock.calls[3][1]).toEqual([
        expect.any(String), 'student-1', 'case-1', 2, 'n-1',
      ]);
      expect(mockDbClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockDbClient.release).toHaveBeenCalled();
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

    it('does not reveal Journey Review to a student who does not own the completed attempt', async () => {
      mockDbService.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ student_id: 'owner-student', status: 'PUBLISHED' }] });

      await expect(service.getAttempt('completed-attempt', 'intruder-student')).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockDbService.query).not.toHaveBeenCalledWith(
        expect.stringContaining('student_reasoning'), expect.any(Array),
      );
      expect(mockDbService.query).not.toHaveBeenCalledWith(
        expect.stringContaining('case_nodes'), expect.any(Array),
      );
    });
  });

  describe('getJourneyReview', () => {
    const completedAttempt = {
      id: 'att-1',
      case_id: 'case-1',
      student_id: 'student-1',
      attempt_number: 2,
      started_at: '2026-11-19T10:00:00.000Z',
      completed_at: '2026-11-19T10:05:00.000Z',
      outcome_node_id: 'terminal-1',
      case_title: 'Published case',
      outcome_situation: 'The final outcome',
      outcome_node_index: 3,
    };

    it('returns the persisted path in order and unlocks selected consequences only after completion', async () => {
      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ id: 'student-1' }] }) // resolve student
        .mockResolvedValueOnce({ rows: [completedAttempt] }) // authorization + completion gate
        .mockResolvedValueOnce({
          rows: [
            { node_id: 'node-1', node_index: 0, situation: 'First decision', selected_option_id: 'option-1', option_text: 'Scale workers', consequence: 'Capacity improved.', next_node_id: 'node-2', reasoning_text: 'Protect the service.', submitted_at: '2026-11-19T10:01:00.000Z' },
            { node_id: 'node-2', node_index: 2, situation: 'Second decision', selected_option_id: 'option-2', option_text: 'Restore gradually', consequence: 'Traffic stabilized.', next_node_id: 'terminal-1', reasoning_text: null, submitted_at: '2026-11-19T10:03:00.000Z' },
          ],
        }) // persisted traversal
        .mockResolvedValueOnce({
          rows: [
            { node_id: 'node-1', id: 'option-1', option_text: 'Scale workers' },
            { node_id: 'node-1', id: 'option-alt', option_text: 'Stop all payments' },
            { node_id: 'node-2', id: 'option-2', option_text: 'Restore gradually' },
          ],
        }); // alternatives

      const result = await service.getJourneyReview('case-1', 'att-1', 'student-1');

      expect(result.path.map((step) => step.nodeId)).toEqual(['node-1', 'node-2']);
      expect(result.path.map((step) => step.step)).toEqual([1, 2]);
      expect(result.path[0].selectedOption).toEqual({
        id: 'option-1', text: 'Scale workers', consequence: 'Capacity improved.', nextNodeId: 'node-2',
      });
      expect(result.path[0].alternatives).toEqual([{ id: 'option-alt', text: 'Stop all payments' }]);
      expect(result.path[1].selectedOption.consequence).toBe('Traffic stabilized.');
      expect(result.outcome).toEqual({
        nodeId: 'terminal-1', nodeIndex: 3, situation: 'The final outcome', outcomeText: 'Traffic stabilized.',
      });
      expect(mockDbService.query.mock.calls[2][0]).toContain('ORDER BY r.submitted_at ASC, r.id ASC');
    });

    it('rejects an incomplete attempt before querying path or consequences', async () => {
      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ id: 'student-1' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ case_id: 'case-1', student_id: 'student-1', is_completed: false, outcome_node_id: null, status: 'PUBLISHED' }] });

      await expect(service.getJourneyReview('case-1', 'att-1', 'student-1')).rejects.toThrow(ForbiddenException);
      expect(mockDbService.query).toHaveBeenCalledTimes(3);
      expect(mockDbService.query).not.toHaveBeenCalledWith(expect.stringContaining('FROM student_reasoning'), expect.any(Array));
      expect(mockDbService.query).not.toHaveBeenCalledWith(expect.stringContaining('FROM case_options'), expect.any(Array));
    });

    it('rejects another Student and a mismatched Case before querying path data', async () => {
      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ id: 'student-1' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ case_id: 'case-1', student_id: 'owner-student', is_completed: true, outcome_node_id: 'terminal-1', status: 'PUBLISHED' }] });

      await expect(service.getJourneyReview('case-1', 'att-1', 'student-1')).rejects.toThrow(ForbiddenException);
      expect(mockDbService.query).toHaveBeenCalledTimes(3);
      expect(mockDbService.query).not.toHaveBeenCalledWith(expect.stringContaining('FROM student_reasoning'), expect.any(Array));
      expect(mockDbService.query).not.toHaveBeenCalledWith(expect.stringContaining('FROM case_options'), expect.any(Array));
    });

    it('rejects a Case ID that does not match the attempt', async () => {
      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ id: 'student-1' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ case_id: 'case-1', student_id: 'student-1', is_completed: true, outcome_node_id: 'terminal-1', status: 'PUBLISHED' }] });

      await expect(service.getJourneyReview('different-case', 'att-1', 'student-1')).rejects.toThrow(ForbiddenException);
      expect(mockDbService.query).toHaveBeenCalledTimes(3);
    });

    it('rejects persisted path data whose selected option links do not match traversal order', async () => {
      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ id: 'student-1' }] })
        .mockResolvedValueOnce({ rows: [completedAttempt] })
        .mockResolvedValueOnce({ rows: [
          { node_id: 'node-1', node_index: 0, next_node_id: 'wrong-node', submitted_at: '2026-11-19T10:01:00.000Z' },
          { node_id: 'node-2', node_index: 2, next_node_id: 'terminal-1', submitted_at: '2026-11-19T10:03:00.000Z' },
        ] });

      await expect(service.getJourneyReview('case-1', 'att-1', 'student-1')).rejects.toThrow(BadRequestException);
      expect(mockDbService.query).toHaveBeenCalledTimes(3);
      expect(mockDbService.query).not.toHaveBeenCalledWith(expect.stringContaining('FROM case_options'), expect.any(Array));
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

    it('rejects an option outside the current node without writing the path', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ id: 'att-1', case_id: 'case-1', student_id: 'student-1', current_node_id: 'n-1', is_completed: false }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({});

      await expect(service.chooseOption('att-1', 'student-1', {
        nodeId: 'n-1', selectedOptionId: 'option-from-another-node',
      })).rejects.toThrow(BadRequestException);

      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockDbClient.query).not.toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO student_reasoning'), expect.any(Array),
      );
      expect(mockDbClient.query).not.toHaveBeenCalledWith(
        expect.stringContaining('UPDATE branching_attempts'), expect.any(Array),
      );
    });

    it('does not complete an attempt for a null edge unless the current node is terminal', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ id: 'att-1', case_id: 'case-1', student_id: 'student-1', current_node_id: 'n-1', is_completed: false }] })
        .mockResolvedValueOnce({ rows: [{ id: 'opt-1', next_node_id: null }] })
        .mockResolvedValueOnce({}) // reasoning insert, rolled back
        .mockResolvedValueOnce({ rows: [{ is_terminal: false }] })
        .mockResolvedValueOnce({});

      await expect(service.chooseOption('att-1', 'student-1', {
        nodeId: 'n-1', selectedOptionId: 'opt-1',
      })).rejects.toThrow(BadRequestException);

      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockDbClient.query).not.toHaveBeenCalledWith(
        expect.stringContaining('UPDATE branching_attempts'), expect.any(Array),
      );
    });

    it('rolls back the selected option if its target node is invalid for the Case', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ id: 'att-1', case_id: 'case-1', student_id: 'student-1', current_node_id: 'n-1', is_completed: false }] })
        .mockResolvedValueOnce({ rows: [{ id: 'opt-1', next_node_id: 'node-from-another-case' }] })
        .mockResolvedValueOnce({}) // reasoning insert is rolled back
        .mockResolvedValueOnce({ rows: [] }) // target must belong to this Case
        .mockResolvedValueOnce({}); // ROLLBACK

      await expect(service.chooseOption('att-1', 'student-1', {
        nodeId: 'n-1', selectedOptionId: 'opt-1',
      })).rejects.toThrow(BadRequestException);

      expect(mockDbClient.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = $1 AND case_id = $2'),
        ['node-from-another-case', 'case-1'],
      );
      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockDbClient.query).not.toHaveBeenCalledWith(
        expect.stringContaining('UPDATE branching_attempts'), expect.any(Array),
      );
    });

    it('should execute FOR UPDATE transaction and advance node', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({
          rows: [{ id: 'att-1', case_id: 'case-1', student_id: 'student-1', current_node_id: 'n-1', is_completed: false }],
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
      expect(mockDbClient.query).toHaveBeenCalledWith(
        expect.stringContaining('reasoning_text = NULL'),
        expect.arrayContaining([expect.any(String), 'att-1', 'n-1', 'opt-1']),
      );
    });

    it('completes the attempt and records the validated terminal outcome', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 'att-1', case_id: 'case-1', student_id: 'student-1', current_node_id: 'n-1', is_completed: false }] })
        .mockResolvedValueOnce({ rows: [{ id: 'opt-1', next_node_id: 'terminal-1' }] })
        .mockResolvedValueOnce({}) // persist option selection
        .mockResolvedValueOnce({ rows: [{ is_terminal: true }] }) // validated same-Case destination
        .mockResolvedValueOnce({}) // persist outcome and completion timestamp
        .mockResolvedValueOnce({}); // COMMIT

      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ id: 'att-1', student_id: 'student-1', case_id: 'case-1', current_node_id: 'terminal-1', outcome_node_id: 'terminal-1', is_completed: true, completed_at: '2026-11-19T00:00:00.000Z' }] })
        .mockResolvedValueOnce({ rows: [{ reasoning_id: 'reason-1', node_id: 'n-1', selected_option_id: 'opt-1', option_text: 'Finish', consequence: 'Journey outcome', next_node_id: 'terminal-1', situation: 'Decision' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 'terminal-1', situation: 'Terminal outcome', is_terminal: true }] });

      const result = await service.chooseOption('att-1', 'student-1', {
        nodeId: 'n-1', selectedOptionId: 'opt-1',
      });

      const completionUpdate = mockDbClient.query.mock.calls.find(([sql]) =>
        typeof sql === 'string' && sql.includes('outcome_node_id = $1') && sql.includes('is_completed = TRUE'),
      );
      expect(completionUpdate).toBeDefined();
      expect(completionUpdate[1]).toEqual(['terminal-1', 'att-1']);
      expect(completionUpdate[0]).toContain('completed_at = NOW()');
      expect(mockDbClient.query).toHaveBeenCalledWith('COMMIT');
      expect(result.isCompleted).toBe(true);
      expect(result.outcomeNodeId).toBe('terminal-1');
      expect(result.completedAt).toBe('2026-11-19T00:00:00.000Z');
      expect(result.outcomeNode.id).toBe('terminal-1');
      // The completed owner's ordinary attempt read unlocks Journey Review content.
      expect(mockDbService.query.mock.calls[1][0]).toContain('consequence');
    });

    it('rolls back and does not complete when outcome persistence fails', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ id: 'att-1', case_id: 'case-1', student_id: 'student-1', current_node_id: 'n-1', is_completed: false }] })
        .mockResolvedValueOnce({ rows: [{ id: 'opt-1', next_node_id: 'terminal-1' }] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ is_terminal: true }] })
        .mockRejectedValueOnce(new Error('outcome update failed'))
        .mockResolvedValueOnce({}); // ROLLBACK

      await expect(service.chooseOption('att-1', 'student-1', {
        nodeId: 'n-1', selectedOptionId: 'opt-1',
      })).rejects.toThrow('outcome update failed');

      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockDbClient.query).not.toHaveBeenCalledWith('COMMIT');
      expect(mockDbService.query).not.toHaveBeenCalled();
    });
  });

  describe('saveRetrospectiveReasoning', () => {
    it('should throw ForbiddenException if student does not own attempt', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({
          rows: [{ student_id: 'owner-student', is_completed: true, case_status: 'PUBLISHED' }],
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
          rows: [{ student_id: 'student-1', is_completed: true, case_status: 'PUBLISHED' }],
        }) // FOR UPDATE
        .mockResolvedValueOnce({
          rows: [{ id: 'reasoning-1' }],
        }) // check reasoning exists
        .mockResolvedValueOnce({ rows: [{ id: 'reasoning-1' }] }) // UPDATE student_reasoning
        .mockResolvedValueOnce({}); // COMMIT

      const res = await service.saveRetrospectiveReasoning('att-1', 'student-1', {
        nodeId: 'n-1',
        reasoningText: 'Because it was the most viable strategy',
      });

      expect(res.status).toBe('SAVED');
      expect(res.reasoningText).toBe('Because it was the most viable strategy');
      expect(mockDbClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockDbClient.query.mock.calls.find(([sql]) => String(sql).includes('UPDATE student_reasoning'))?.[0])
        .toContain('RETURNING id');
    });

    it('does not report success or persist another field when reasoning update fails', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ student_id: 'student-1', is_completed: true, case_status: 'PUBLISHED' }] })
        .mockResolvedValueOnce({ rows: [{ id: 'reasoning-1' }] })
        .mockRejectedValueOnce(new Error('reasoning write failed'))
        .mockResolvedValueOnce({}); // ROLLBACK

      await expect(service.saveRetrospectiveReasoning('att-1', 'student-1', {
        nodeId: 'n-1', reasoningText: 'A sufficiently detailed explanation',
      })).rejects.toThrow('reasoning write failed');
      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockDbClient.query).not.toHaveBeenCalledWith('COMMIT');
    });

    it('requires a completed published attempt before saving retrospective reasoning', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ student_id: 'student-1', is_completed: false, case_status: 'PUBLISHED' }] })
        .mockResolvedValueOnce({}); // ROLLBACK

      await expect(service.saveRetrospectiveReasoning('att-1', 'student-1', {
        nodeId: 'n-1', reasoningText: 'A sufficiently detailed explanation',
      })).rejects.toThrow(BadRequestException);
      expect(mockDbClient.query).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE student_reasoning'), expect.any(Array));
      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('submitReflection', () => {
    it('should throw BadRequestException if attempt is not completed', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({
          rows: [{ student_id: 'student-1', is_completed: false, reflection_status: 'NOT_STARTED', case_status: 'PUBLISHED' }],
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
          rows: [{ student_id: 'student-1', is_completed: true, reflection_status: 'SUBMITTED', case_status: 'PUBLISHED' }],
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
          rows: [{ student_id: 'student-1', is_completed: true, reflection_status: 'NOT_STARTED', case_status: 'PUBLISHED' }],
        })
        .mockResolvedValueOnce({ rows: [{ reflection_submitted_at: '2026-11-21T00:00:00.000Z' }] }) // UPDATE reflection
        .mockResolvedValueOnce({}); // COMMIT

      const res = await service.submitReflection('att-1', 'student-1', {
        reflectionText: 'Deep retrospective insights',
      });

      expect(res.reflectionStatus).toBe('SUBMITTED');
      expect(res.reflectionText).toBe('Deep retrospective insights');
      expect(res.reflectionSubmittedAt).toBe('2026-11-21T00:00:00.000Z');
      expect(mockDbClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockDbClient.query.mock.calls.find(([sql]) => String(sql).includes('UPDATE branching_attempts'))?.[0])
        .toContain('RETURNING reflection_submitted_at');
    });

    it('rolls back and returns an error when reflection persistence fails', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ student_id: 'student-1', is_completed: true, reflection_status: 'NOT_STARTED', case_status: 'PUBLISHED' }] })
        .mockRejectedValueOnce(new Error('reflection write failed'))
        .mockResolvedValueOnce({}); // ROLLBACK

      await expect(service.submitReflection('att-1', 'student-1', {
        reflectionText: 'The experience changed how I evaluate the tradeoffs.',
      })).rejects.toThrow('reflection write failed');
      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockDbClient.query).not.toHaveBeenCalledWith('COMMIT');
    });

    it('does not commit if the reflection update returns no persisted row', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ student_id: 'student-1', is_completed: true, reflection_status: 'NOT_STARTED', case_status: 'PUBLISHED' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({}); // ROLLBACK

      await expect(service.submitReflection('att-1', 'student-1', {
        reflectionText: 'The experience changed how I evaluate the tradeoffs.',
      })).rejects.toThrow(InternalServerErrorException);
      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockDbClient.query).not.toHaveBeenCalledWith('COMMIT');
    });
  });
});
