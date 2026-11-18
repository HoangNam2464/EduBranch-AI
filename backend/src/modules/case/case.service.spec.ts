import { Test, TestingModule } from '@nestjs/testing';
import { CaseService } from './case.service';
import { DatabaseService } from '../../common/database/database.service';
import { AiClientService } from '../../common/ai-client/ai-client.service';
import { ForbiddenException, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

describe('CaseService', () => {
  let service: CaseService;

  const mockDbClient = {
    query: jest.fn(),
    release: jest.fn(),
  };

  const mockDbService = {
    getClient: jest.fn().mockResolvedValue(mockDbClient),
    query: jest.fn(),
  };

  const mockAiClientService = {
    generateCase: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CaseService,
        { provide: DatabaseService, useValue: mockDbService },
        { provide: AiClientService, useValue: mockAiClientService },
      ],
    }).compile();

    service = module.get<CaseService>(CaseService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    mockDbClient.query.mockReset();
    mockDbClient.release.mockReset();
    mockDbService.query.mockReset();
    mockDbService.getClient.mockReset().mockResolvedValue(mockDbClient);
    mockAiClientService.generateCase.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateCase', () => {
    it('should generate case, start tx, insert nodes and options, commit', async () => {
      mockAiClientService.generateCase.mockResolvedValue({
        title: 'Title',
        description: 'Desc',
        root_node_index: 0,
        nodes: [
          {
            situation: 'Sit 1',
            options: [{ text: 'Opt 1', consequence: 'Cons 1', next_node_index: null }],
          },
        ],
      });

      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ id: 'lecturer-1' }] }) // user check
        .mockResolvedValueOnce({ rows: [{ id: 'course-1' }] }) // course check
        .mockResolvedValueOnce({ rows: [{ id: 'case-1', status: 'DRAFT', lecturer_id: 'lecturer-1' }] }) // getCaseById caseRes
        .mockResolvedValueOnce({ rows: [{ id: 'node-1', node_index: 0 }] }) // getCaseById nodesRes
        .mockResolvedValueOnce({ rows: [{ id: 'opt-1', node_id: 'node-1' }] }); // getCaseById optionsRes
      mockDbClient.query.mockImplementation(async (sql: string) => {
        if (sql.includes('SELECT') && sql.includes('node_count')) {
          return { rows: [{ node_count: '1', root_count: '1', valid_option_count: '1', invalid_target_count: '0' }] };
        }
        return { rows: [] };
      });

      const result = await service.generateCase('course-1', 'lecturer-1', { materialIds: ['m1'] });

      expect(mockDbClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockDbClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO cases'), expect.any(Array));
      expect(mockDbClient.query).toHaveBeenCalledWith(expect.stringContaining("'DRAFT'"), expect.any(Array));
      expect(mockDbClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO case_nodes'), expect.any(Array));
      expect(mockDbClient.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE cases SET root_node_id'), expect.any(Array));
      expect(mockDbClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO case_options'), expect.any(Array));
      expect(mockDbClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockDbClient.query).toHaveBeenCalledWith(expect.stringContaining('node_count'), expect.any(Array));
    });

    it('rolls back the complete transaction when node insertion fails', async () => {
      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ id: 'lecturer-1' }] })
        .mockResolvedValueOnce({ rows: [{ id: 'course-1' }] });
      mockAiClientService.generateCase.mockResolvedValue({
        root_node_index: 0,
        nodes: [{ situation: 'Root', options: [] }],
      });
      mockDbClient.query.mockImplementation(async (sql: string) => {
        if (sql.includes('SELECT is_active')) return { rows: [{ is_active: true }] };
        if (sql.includes('INSERT INTO case_nodes')) throw new Error('node insert failed');
        return { rows: [] };
      });

      await expect(service.generateCase('course-1', 'lecturer-1', { materialIds: ['m1'] }))
        .rejects.toThrow('node insert failed');

      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockDbClient.query).not.toHaveBeenCalledWith('COMMIT');
      expect(mockDbClient.release).toHaveBeenCalled();
    });

    it('rolls back the complete transaction when option insertion fails', async () => {
      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ id: 'lecturer-1' }] })
        .mockResolvedValueOnce({ rows: [{ id: 'course-1' }] });
      mockAiClientService.generateCase.mockResolvedValue({
        root_node_index: 0,
        nodes: [{ situation: 'Root', options: [{ text: 'Next', next_node_index: null }] }],
      });
      mockDbClient.query.mockImplementation(async (sql: string) => {
        if (sql.includes('SELECT is_active')) return { rows: [{ is_active: true }] };
        if (sql.includes('INSERT INTO case_options')) throw new Error('option insert failed');
        return { rows: [] };
      });

      await expect(service.generateCase('course-1', 'lecturer-1', { materialIds: ['m1'] }))
        .rejects.toThrow('option insert failed');

      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockDbClient.query).not.toHaveBeenCalledWith('COMMIT');
      expect(mockDbClient.release).toHaveBeenCalled();
    });

    it('rejects invalid root and option node references and rolls back', async () => {
      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ id: 'lecturer-1' }] })
        .mockResolvedValueOnce({ rows: [{ id: 'course-1' }] });
      mockAiClientService.generateCase.mockResolvedValue({
        root_node_index: 5,
        nodes: [{ situation: 'Root', options: [{ next_node_index: 8 }] }],
      });
      mockDbClient.query.mockImplementation(async (sql: string) => {
        if (sql.includes('SELECT is_active')) return { rows: [{ is_active: true }] };
        return { rows: [] };
      });

      await expect(service.generateCase('course-1', 'lecturer-1', { materialIds: ['m1'] }))
        .rejects.toThrow(BadRequestException);

      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockDbClient.query).not.toHaveBeenCalledWith(expect.stringContaining('INSERT INTO case_nodes'), expect.any(Array));
    });
  });

  describe('updateCaseNode (BE-017)', () => {
    const caseRow = {
      id: 'case-1', status: 'DRAFT', learning_mode: 'BRANCHING_STUDY',
      root_node_id: 'root', lecturer_id: 'lecturer-1',
    };
    const treeNodes = [
      { id: 'root', situation: 'Root', is_terminal: false, node_index: 0 },
      { id: 'leaf-1', situation: 'Leaf 1', is_terminal: true, node_index: 1 },
      { id: 'leaf-2', situation: 'Leaf 2', is_terminal: true, node_index: 2 },
    ];
    const treeOptions = [
      { id: 'option-1', node_id: 'root', option_text: 'A', consequence: 'A consequence', next_node_id: 'leaf-1' },
      { id: 'option-2', node_id: 'root', option_text: 'B', consequence: 'B consequence', next_node_id: 'leaf-2' },
    ];
    const validUpdate = {
      situation: 'Updated root',
      options: [
        { text: 'Updated A', consequence: 'Updated consequence A', nextNodeId: 'leaf-1' },
        { text: 'Updated B', consequence: 'Updated consequence B', nextNodeId: 'leaf-2' },
      ],
    };

    function mockLockedDraftTree(overrides: { row?: any; nodes?: any[]; options?: any[] } = {}) {
      mockDbClient.query.mockImplementation(async (sql: string) => {
        if (sql.includes('FROM cases c') && sql.includes('FOR UPDATE OF c')) {
          return { rows: [overrides.row || caseRow] };
        }
        if (sql.includes('FROM case_nodes') && sql.includes('FOR UPDATE')) {
          return { rows: overrides.nodes || treeNodes };
        }
        if (sql.includes('FROM case_options') && sql.includes('FOR UPDATE')) {
          return { rows: overrides.options || treeOptions };
        }
        return { rows: [] };
      });
    }

    it('updates a valid node and its options atomically while keeping the case DRAFT', async () => {
      mockLockedDraftTree();
      jest.spyOn(service, 'getCaseById').mockResolvedValue({ id: 'case-1', status: 'DRAFT' } as any);

      const result = await service.updateCaseNode('case-1', 'root', 'lecturer-1', validUpdate);

      expect(result).toEqual({ id: 'case-1', status: 'DRAFT' });
      expect(mockDbClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockDbClient.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE case_nodes SET situation = $1, is_terminal = $2'),
        ['Updated root', false, 'root', 'case-1'],
      );
      expect(mockDbClient.query).toHaveBeenCalledWith('DELETE FROM case_options WHERE node_id = $1', ['root']);
      expect(mockDbClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO case_options'), expect.any(Array));
      expect(mockDbClient.query).toHaveBeenCalledWith('UPDATE cases SET updated_at = NOW() WHERE id = $1', ['case-1']);
      expect(mockDbClient.query.mock.calls.some(([sql]) => String(sql).includes('SET status'))).toBe(false);
      expect(mockDbClient.query).toHaveBeenCalledWith('COMMIT');
      expect(service.getCaseById).toHaveBeenCalledWith('case-1', 'LECTURER', 'lecturer-1');
    });

    it('rejects a cycle without changing any node or option rows', async () => {
      mockLockedDraftTree();
      const cyclicUpdate = {
        ...validUpdate,
        options: [
          { text: 'Loop', consequence: 'Loop', nextNodeId: 'root' },
          { text: 'Leaf', consequence: 'Leaf', nextNodeId: 'leaf-2' },
        ],
      };

      await expect(service.updateCaseNode('case-1', 'root', 'lecturer-1', cyclicUpdate))
        .rejects.toThrow('loop detected');

      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockDbClient.query).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE case_nodes'), expect.any(Array));
      expect(mockDbClient.query).not.toHaveBeenCalledWith(expect.stringContaining('DELETE FROM case_options'), expect.any(Array));
      expect(mockDbClient.query).not.toHaveBeenCalledWith(expect.stringContaining('INSERT INTO case_options'), expect.any(Array));
      expect(mockDbClient.query).not.toHaveBeenCalledWith('COMMIT');
    });

    it('rejects an orphan node without changing persisted data', async () => {
      mockLockedDraftTree({
        nodes: [...treeNodes, { id: 'orphan', situation: 'Orphan', is_terminal: true, node_index: 3 }],
      });

      await expect(service.updateCaseNode('case-1', 'root', 'lecturer-1', validUpdate))
        .rejects.toThrow('no incoming path');

      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockDbClient.query).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE case_nodes'), expect.any(Array));
      expect(mockDbClient.query).not.toHaveBeenCalledWith(expect.stringContaining('DELETE FROM case_options'), expect.any(Array));
    });

    it('rejects an option that targets a node outside the case without persisting', async () => {
      mockLockedDraftTree();
      const invalidTargetUpdate = {
        ...validUpdate,
        options: [
          { text: 'External', consequence: 'Invalid', nextNodeId: 'node-from-another-case' },
          validUpdate.options[1],
        ],
      };

      await expect(service.updateCaseNode('case-1', 'root', 'lecturer-1', invalidTargetUpdate))
        .rejects.toThrow('outside case');

      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockDbClient.query).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE case_nodes'), expect.any(Array));
      expect(mockDbClient.query).not.toHaveBeenCalledWith(expect.stringContaining('DELETE FROM case_options'), expect.any(Array));
    });

    it('rejects malformed node content before opening a transaction', async () => {
      await expect(service.updateCaseNode('case-1', 'root', 'lecturer-1', {
        situation: '  ', options: [],
      })).rejects.toThrow(BadRequestException);

      expect(mockDbService.getClient).not.toHaveBeenCalled();
    });

    it('denies another lecturer and leaves node and option rows untouched', async () => {
      mockLockedDraftTree({ row: { ...caseRow, lecturer_id: 'lecturer-2' } });

      await expect(service.updateCaseNode('case-1', 'root', 'lecturer-1', validUpdate))
        .rejects.toThrow(ForbiddenException);

      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockDbClient.query).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE case_nodes'), expect.any(Array));
      expect(mockDbClient.query).not.toHaveBeenCalledWith(expect.stringContaining('DELETE FROM case_options'), expect.any(Array));
    });

    it('does not allow node edits to bypass lifecycle state', async () => {
      mockLockedDraftTree({ row: { ...caseRow, status: 'REVIEWED' } });

      await expect(service.updateCaseNode('case-1', 'root', 'lecturer-1', validUpdate))
        .rejects.toThrow(ForbiddenException);

      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockDbClient.query).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE case_nodes'), expect.any(Array));
      expect(mockDbClient.query.mock.calls.some(([sql]) => String(sql).includes('SET status'))).toBe(false);
    });
  });

  describe('lifecycle status transitions (BE-018)', () => {
    const baseCase = {
      id: 'case-1', status: 'DRAFT', learning_mode: 'BRANCHING_STUDY',
      root_node_id: 'root-1', context_text: null, problem_text: null,
      lecturer_id: 'lecturer-1',
    };

    function mockLifecycleTransaction(caseRow: any, terminalCount = 1, updateRowCount = 1) {
      mockDbClient.query.mockImplementation(async (sql: string) => {
        if (sql.includes('FROM cases c') && sql.includes('FOR UPDATE OF c')) {
          return { rows: [caseRow] };
        }
        if (sql.includes('SELECT COUNT(*)')) return { rows: [{ count: String(terminalCount) }] };
        if (sql.startsWith('UPDATE cases SET status')) return { rowCount: updateRowCount, rows: [] };
        return { rows: [] };
      });
    }

    it.each([
      ['DRAFT', 'REVIEWED'],
      ['REVIEWED', 'APPROVED'],
      ['APPROVED', 'PUBLISHED'],
    ])('accepts the ordered transition %s -> %s', async (currentStatus, targetStatus) => {
      const caseRow = { ...baseCase, status: currentStatus };
      mockLifecycleTransaction(caseRow, 2);

      const result = await service.updateCaseStatus('case-1', 'lecturer-1', targetStatus as any);

      expect(result).toEqual({ id: 'case-1', status: targetStatus });
      expect(mockDbClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockDbClient.query).toHaveBeenCalledWith(
        'UPDATE cases SET status = $1, updated_at = NOW() WHERE id = $2 AND status = $3',
        [targetStatus, 'case-1', currentStatus],
      );
      expect(mockDbClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it.each([
      ['DRAFT', 'APPROVED'],
      ['DRAFT', 'PUBLISHED'],
      ['REVIEWED', 'PUBLISHED'],
    ])('rejects skipped transition %s -> %s without persistence', async (currentStatus, targetStatus) => {
      mockLifecycleTransaction({ ...baseCase, status: currentStatus });

      await expect(service.updateCaseStatus('case-1', 'lecturer-1', targetStatus as any))
        .rejects.toThrow(BadRequestException);

      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockDbClient.query).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE cases SET status'), expect.any(Array));
      expect(mockDbClient.query).not.toHaveBeenCalledWith('COMMIT');
    });

    it('rejects a lecturer who does not own the course without changing status', async () => {
      mockLifecycleTransaction({ ...baseCase, lecturer_id: 'another-lecturer' });

      await expect(service.updateCaseStatus('case-1', 'lecturer-1', 'REVIEWED'))
        .rejects.toThrow(ForbiddenException);

      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockDbClient.query).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE cases SET status'), expect.any(Array));
    });

    it('rejects publishing a Branching Study without a root or terminal node', async () => {
      mockLifecycleTransaction({ ...baseCase, status: 'APPROVED', root_node_id: null });
      await expect(service.updateCaseStatus('case-1', 'lecturer-1', 'PUBLISHED'))
        .rejects.toThrow(ForbiddenException);
      expect(mockDbClient.query).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE cases SET status'), expect.any(Array));

      mockLifecycleTransaction({ ...baseCase, status: 'APPROVED' }, 0);
      await expect(service.updateCaseStatus('case-1', 'lecturer-1', 'PUBLISHED'))
        .rejects.toThrow(BadRequestException);
      expect(mockDbClient.query).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE cases SET status'), expect.any(Array));
    });

    it('allows publishing Review Study only when context and problem are present', async () => {
      mockLifecycleTransaction({
        ...baseCase, status: 'APPROVED', learning_mode: 'REVIEW_STUDY', root_node_id: null,
        context_text: 'Context', problem_text: 'Problem',
      });
      const result = await service.updateCaseStatus('case-1', 'lecturer-1', 'PUBLISHED');
      expect(result).toEqual({ id: 'case-1', status: 'PUBLISHED' });
      mockDbClient.query.mockClear();

      mockLifecycleTransaction({
        ...baseCase, status: 'APPROVED', learning_mode: 'REVIEW_STUDY', root_node_id: null,
        context_text: '', problem_text: 'Problem',
      });
      await expect(service.updateCaseStatus('case-1', 'lecturer-1', 'PUBLISHED'))
        .rejects.toThrow(BadRequestException);
      expect(mockDbClient.query).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE cases SET status'), expect.any(Array));
    });

    it('keeps an idempotent request unchanged and commits no status update', async () => {
      mockLifecycleTransaction({ ...baseCase, status: 'REVIEWED' });

      const result = await service.updateCaseStatus('case-1', 'lecturer-1', 'REVIEWED');

      expect(result).toEqual({ id: 'case-1', status: 'REVIEWED' });
      expect(mockDbClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockDbClient.query).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE cases SET status'), expect.any(Array));
    });

    it('rolls back if the status changed before the conditional update is persisted', async () => {
      mockLifecycleTransaction({ ...baseCase }, 1, 0);

      await expect(service.updateCaseStatus('case-1', 'lecturer-1', 'REVIEWED'))
        .rejects.toThrow(ConflictException);

      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockDbClient.query).not.toHaveBeenCalledWith('COMMIT');
    });
  });

  describe('student access restriction and data privacy (P0-SEC-01 & P0-SEC-02)', () => {
    it.each(['DRAFT', 'REVIEWED', 'APPROVED'])(
      'should block direct Case ID access for %s before loading content or tree records',
      async (status) => {
        mockDbService.query
          .mockResolvedValueOnce({ rows: [] })
          .mockResolvedValueOnce({ rows: [{ id: 'case-1', status }] });

        await expect(service.getCaseById('case-1', 'STUDENT')).rejects.toThrow(ForbiddenException);

        expect(mockDbService.query.mock.calls[0][0]).toContain("c.status = 'PUBLISHED'");
        expect(mockDbService.query.mock.calls[0][1]).toEqual(['case-1', true]);
        expect(mockDbService.query.mock.calls[1][0]).toBe('SELECT id FROM cases WHERE id = $1');
        expect(mockDbService.query).not.toHaveBeenCalledWith(expect.stringContaining('case_nodes'), expect.any(Array));
        expect(mockDbService.query).not.toHaveBeenCalledWith(expect.stringContaining('case_options'), expect.any(Array));
      },
    );

    it('returns NotFound for an unknown direct Case ID without loading content', async () => {
      mockDbService.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      await expect(service.getCaseById('missing-case', 'STUDENT')).rejects.toThrow(NotFoundException);
      expect(mockDbService.query.mock.calls[0][0]).toContain("c.status = 'PUBLISHED'");
      expect(mockDbService.query).not.toHaveBeenCalledWith(expect.stringContaining('case_nodes'), expect.any(Array));
    });

    it('filters the Case list query to PUBLISHED rows for students', async () => {
      mockDbService.query.mockResolvedValueOnce({ rows: [{ id: 'case-1', status: 'PUBLISHED' }] });

      await service.getCasesByCourse('course-1', 'STUDENT');

      expect(mockDbService.query.mock.calls[0][0]).toContain("AND status = 'PUBLISHED'");
      expect(mockDbService.query.mock.calls[0][1]).toEqual(['course-1']);
    });

    it('does not apply the student visibility filter to lecturer reads', async () => {
      mockDbService.query.mockResolvedValueOnce({ rows: [{ id: 'case-1', status: 'DRAFT' }] });

      await service.getCasesByCourse('course-1', 'LECTURER');

      expect(mockDbService.query.mock.calls[0][0]).not.toContain("status = 'PUBLISHED'");
    });

    it('should allow student accessing published case but HIDE nodes, options, and consequences', async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [{
          id: 'case-1',
          title: 'Business Ethics Case',
          description: 'A study on supply chain ethics',
          status: 'PUBLISHED',
          learning_mode: 'BRANCHING_STUDY',
          lecturer_id: 'lecturer-1',
        }],
      });

      const result = await service.getCaseById('case-1', 'STUDENT');

      expect(result.status).toBe('PUBLISHED');
      expect(result.title).toBe('Business Ethics Case');
      expect(mockDbService.query.mock.calls[0][0]).toContain("c.status = 'PUBLISHED'");
      expect(mockDbService.query).toHaveBeenCalledTimes(1);
      // P0-SEC-02: Nodes and options MUST NOT be returned in student DTO
      expect(result.nodes).toBeUndefined();
      expect(result.all_options).toBeUndefined();
    });

    it('should return full tree with nodes and consequences for lecturer', async () => {
      mockDbService.query
        .mockResolvedValueOnce({
          rows: [{
            id: 'case-1',
            status: 'PUBLISHED',
            lecturer_id: 'lecturer-1',
          }],
        })
        .mockResolvedValueOnce({
          rows: [{ id: 'node-1', situation: 'Crisis Situation', node_index: 0 }],
        })
        .mockResolvedValueOnce({
          rows: [{ id: 'opt-1', node_id: 'node-1', consequence: 'Severe stock drop' }],
        });

      const result = await service.getCaseById('case-1', 'LECTURER', 'lecturer-1');

      expect(result.nodes).toBeDefined();
      expect(result.nodes[0].options[0].consequence).toBe('Severe stock drop');
    });
  });
});
