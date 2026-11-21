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

      mockDbClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [{ is_active: true }] }); // FOR SHARE re-check

      const result = await service.generateCase('course-1', 'lecturer-1', { materialIds: ['m1'] });

      expect(mockDbClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockDbClient.query).toHaveBeenCalledWith(
        'SELECT is_active FROM courses WHERE id = $1 FOR SHARE',
        ['course-1'],
      );
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
    it('rejects generation in an archived course with 409 before calling the AI service (C1-B)', async () => {
      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ id: 'lecturer-1' }] }) // user check
        .mockResolvedValueOnce({ rows: [{ id: 'course-1', is_active: false }] }); // course check

      await expect(
        service.generateCase('course-1', 'lecturer-1', { materialIds: ['m1'] }),
      ).rejects.toThrow(new ConflictException('Course is archived'));
      expect(mockDbService.query.mock.calls[1][0]).toContain('is_active');
      expect(mockAiClientService.generateCase).not.toHaveBeenCalled();
      expect(mockDbService.getClient).not.toHaveBeenCalled();
    });

    it('rolls back without inserting when the course is archived during AI generation (C1-B)', async () => {
      mockAiClientService.generateCase.mockResolvedValue({ title: 'T', root_node_index: 0, nodes: [] });
      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ id: 'lecturer-1' }] }) // user check
        .mockResolvedValueOnce({ rows: [{ id: 'course-1', is_active: true }] }); // course check (active)
      mockDbClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [{ is_active: false }] }); // archived meanwhile

      await expect(
        service.generateCase('course-1', 'lecturer-1', { materialIds: ['m1'] }),
      ).rejects.toThrow(new ConflictException('Course is archived'));
      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockDbClient.query).not.toHaveBeenCalledWith(expect.stringContaining('INSERT INTO cases'), expect.anything());
      expect(mockDbClient.release).toHaveBeenCalled();
    });
  });

  describe('updateCaseNode (BE-017, FND §5)', () => {
    const R = '00000000-0000-4000-8000-000000000001';
    const A = '00000000-0000-4000-8000-000000000002';
    const B = '00000000-0000-4000-8000-000000000003';
    const OPT1 = '00000000-0000-4000-8000-0000000000a1';
    const OPT2 = '00000000-0000-4000-8000-0000000000a2';

    // Tree: R -> (A, B); A and B are endings.
    function mockTree(caseRow: Record<string, unknown> = {}, opts: { usedCount?: number } = {}) {
      const sql: string[] = [];
      // Options of the tree as the writes change them (for the post-write check).
      let rows = [
        { id: OPT1, node_id: R, next_node_id: A },
        { id: OPT2, node_id: R, next_node_id: B },
      ];
      mockDbClient.query.mockImplementation(async (q: string, params: any[] = []) => {
        sql.push(q);
        if (q.startsWith('DELETE FROM case_options')) rows = rows.filter((r) => !params[0].includes(r.id));
        if (q.startsWith('UPDATE case_options')) rows = rows.map((r) => (r.id === params[3] ? { ...r, next_node_id: params[2] } : r));
        if (q.startsWith('INSERT INTO case_options')) rows = [...rows, { id: params[0], node_id: params[1], next_node_id: params[4] }];
        if (q.startsWith('SELECT next_node_id FROM case_options')) return { rows: rows.filter((r) => r.node_id === params[0]) };
        if (q.includes('FROM cases c')) {
          return { rows: [{ status: 'DRAFT', learning_mode: 'BRANCHING_STUDY', root_node_id: R, lecturer_id: 'lecturer-1', is_active: true, ...caseRow }] };
        }
        if (q.startsWith('SELECT id FROM case_nodes')) return { rows: [{ id: R }, { id: A }, { id: B }] };
        if (q.includes('FROM case_options o')) return { rows: [...rows] };
        if (q.includes('FROM student_reasoning')) return { rows: [{ count: opts.usedCount ?? 0 }] };
        return { rows: [], rowCount: 1 };
      });
      jest.spyOn(service, 'getCaseById').mockResolvedValue({ id: 'case-1' } as never);
      return sql;
    }

    const body = (options: Array<{ id?: string; text?: string; consequence?: string; nextNodeId: string }>) => ({
      situation: 'Tình huống',
      options: options.map((o) => ({ text: 'Phương án', consequence: 'Hệ quả', ...o })),
    });

    it('updates kept options, inserts new ones, keeps the case status and commits', async () => {
      const sql = mockTree();
      await service.updateCaseNode('case-1', R, 'lecturer-1', body([
        { id: OPT1, nextNodeId: A },
        { id: OPT2, nextNodeId: B },
        { nextNodeId: B },
      ]));
      expect(sql.filter((q) => q.startsWith('UPDATE case_options'))).toHaveLength(2);
      expect(sql.filter((q) => q.startsWith('INSERT INTO case_options'))).toHaveLength(1);
      expect(sql.some((q) => q.includes('SET status'))).toBe(false);
      expect(sql).toContain('COMMIT');
    });

    it('rejects a lecturer who does not own the course', async () => {
      mockTree({ lecturer_id: 'other' });
      await expect(service.updateCaseNode('case-1', R, 'lecturer-1', body([{ id: OPT1, nextNodeId: A }, { id: OPT2, nextNodeId: B }])))
        .rejects.toThrow(ForbiddenException);
    });

    it('rejects edits in an archived course with 409 (C1-B)', async () => {
      mockTree({ is_active: false });
      await expect(service.updateCaseNode('case-1', R, 'lecturer-1', body([{ id: OPT1, nextNodeId: A }, { id: OPT2, nextNodeId: B }])))
        .rejects.toThrow(ConflictException);
    });

    it.each(['APPROVED', 'PUBLISHED'])('rejects edits of a %s case', async (status) => {
      mockTree({ status });
      await expect(service.updateCaseNode('case-1', R, 'lecturer-1', body([{ id: OPT1, nextNodeId: A }, { id: OPT2, nextNodeId: B }])))
        .rejects.toThrow(ForbiddenException);
    });

    it('allows edits of a REVIEWED case without changing its status', async () => {
      const sql = mockTree({ status: 'REVIEWED' });
      await service.updateCaseNode('case-1', R, 'lecturer-1', body([{ id: OPT1, nextNodeId: A }, { id: OPT2, nextNodeId: B }]));
      expect(sql.some((q) => q.includes('SET status'))).toBe(false);
    });

    it('rejects a change that creates a loop and rolls back', async () => {
      const sql = mockTree();
      // A becomes a decision node pointing back to R -> loop
      await expect(service.updateCaseNode('case-1', A, 'lecturer-1', body([{ nextNodeId: R }, { nextNodeId: B }])))
        .rejects.toThrow(BadRequestException);
      expect(sql).toContain('ROLLBACK');
      expect(sql.some((q) => q.startsWith('INSERT') || q.startsWith('UPDATE case_options'))).toBe(false);
    });

    it('rejects a change that leaves a node unreachable', async () => {
      mockTree();
      // R keeps 2 options but both lead to A -> B becomes an orphan
      await expect(service.updateCaseNode('case-1', R, 'lecturer-1', body([{ id: OPT1, nextNodeId: A }, { id: OPT2, nextNodeId: A }])))
        .rejects.toThrow(/reachable/);
    });

    it('rejects a decision node with a single option', async () => {
      mockTree();
      await expect(service.updateCaseNode('case-1', R, 'lecturer-1', body([{ id: OPT1, nextNodeId: A }])))
        .rejects.toThrow(/between 2 and 4/);
    });

    it('rejects an option id that belongs to another node', async () => {
      mockTree();
      await expect(service.updateCaseNode('case-1', A, 'lecturer-1', body([{ id: OPT1, nextNodeId: B }, { nextNodeId: B }])))
        .rejects.toThrow(/does not belong/);
    });

    it('refuses to delete an option that students already chose (409)', async () => {
      mockTree({}, { usedCount: 2 });
      // drop OPT2, add a new option to B instead
      await expect(service.updateCaseNode('case-1', R, 'lecturer-1', body([{ id: OPT1, nextNodeId: A }, { nextNodeId: B }])))
        .rejects.toThrow(ConflictException);
    });

    it('rejects blank text after trimming', async () => {
      mockTree();
      await expect(service.updateCaseNode('case-1', R, 'lecturer-1', { situation: '   ', options: [] }))
        .rejects.toThrow(BadRequestException);
    });

    it('rejects the same option id listed twice (would otherwise drop the other option)', async () => {
      mockTree();
      await expect(service.updateCaseNode('case-1', R, 'lecturer-1', body([{ id: OPT1, nextNodeId: A }, { id: OPT1, nextNodeId: B }])))
        .rejects.toThrow(/listed twice/);
    });

    it('returns 409, not 500, when another table still references a removed option (FK 23503)', async () => {
      const sql = mockTree();
      const base = mockDbClient.query.getMockImplementation()!;
      mockDbClient.query.mockImplementation(async (q: string, params?: any[]) => {
        if (q.startsWith('DELETE FROM case_options')) throw Object.assign(new Error('fk'), { code: '23503' });
        return base(q, params);
      });
      await expect(service.updateCaseNode('case-1', R, 'lecturer-1', body([{ id: OPT1, nextNodeId: A }, { nextNodeId: B }])))
        .rejects.toThrow(ConflictException);
      expect(sql).toContain('ROLLBACK');
    });

    it('returns 404 for a node outside the case', async () => {
      mockTree();
      await expect(service.updateCaseNode('case-1', '00000000-0000-4000-8000-0000000000ff', 'lecturer-1', body([])))
        .rejects.toThrow(NotFoundException);
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
