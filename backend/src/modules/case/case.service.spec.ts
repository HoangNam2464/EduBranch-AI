import { Test, TestingModule } from '@nestjs/testing';
import { CaseService } from './case.service';
import { DatabaseService } from '../../common/database/database.service';
import { AiClientService } from '../../common/ai-client/ai-client.service';
import { AuditService } from '../../common/audit/audit.service';
import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  BadGatewayException,
  ConflictException,
} from '@nestjs/common';

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

  const mockAuditService = {
    record: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CaseService,
        { provide: DatabaseService, useValue: mockDbService },
        { provide: AiClientService, useValue: mockAiClientService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<CaseService>(CaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
      expect(mockDbClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO case_nodes'), expect.any(Array));
      expect(mockDbClient.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE cases SET root_node_id'), expect.any(Array));
      expect(mockDbClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO case_options'), expect.any(Array));
      expect(mockDbClient.query).toHaveBeenCalledWith('COMMIT');
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

    it.each([
      ['out-of-bounds root_node_index', { title: 'T', root_node_index: 5, nodes: [{ situation: 'S', options: [] }] }],
      ['negative root_node_index', { title: 'T', root_node_index: -1, nodes: [{ situation: 'S', options: [] }] }],
      ['non-integer root_node_index', { title: 'T', root_node_index: 0.5, nodes: [{ situation: 'S', options: [] }] }],
      ['null root_node_index', { title: 'T', root_node_index: null, nodes: [{ situation: 'S', options: [] }] }],
      [
        'out-of-bounds option next_node_index',
        {
          title: 'T',
          root_node_index: 0,
          nodes: [{ situation: 'S', options: [{ text: 'Opt', consequence: 'Cons', next_node_index: 9 }] }],
        },
      ],
      [
        'non-integer option next_node_index',
        {
          title: 'T',
          root_node_index: 0,
          nodes: [{ situation: 'S', options: [{ text: 'Opt', consequence: 'Cons', next_node_index: 1.2 }] }],
        },
      ],
    ])('rejects %s with 502 BadGatewayException, rolls back and records failure audit (E)', async (_label, payload) => {
      mockAiClientService.generateCase.mockResolvedValue(payload);
      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ id: 'lecturer-1' }] })
        .mockResolvedValueOnce({ rows: [{ id: 'course-1', is_active: true }] });
      mockDbClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [{ is_active: true }] }); // FOR SHARE

      await expect(
        service.generateCase('course-1', 'lecturer-1', { materialIds: ['m1'] }),
      ).rejects.toThrow(BadGatewayException);
      expect(mockDbClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockDbClient.query).not.toHaveBeenCalledWith('COMMIT');
      expect(mockDbClient.query).not.toHaveBeenCalledWith(expect.stringContaining('INSERT INTO cases'), expect.anything());
      expect(mockDbClient.release).toHaveBeenCalled();
      expect(mockAuditService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'CASE_GENERATION_FAILED',
          outcome: 'ERROR',
          meta: expect.objectContaining({ errorCode: 'HTTP_502' }),
        }),
      );
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

  describe('lifecycle status transitions (P0-DATA-03)', () => {
    it('should reject status change if lecturer does not own the course', async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [{ id: 'case-1', status: 'DRAFT', lecturer_id: 'other-lecturer' }],
      });

      await expect(
        service.updateCaseStatus('case-1', 'lecturer-1', 'REVIEWED'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject invalid transition jumping from DRAFT to PUBLISHED', async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [{ id: 'case-1', status: 'DRAFT', lecturer_id: 'lecturer-1' }],
      });

      await expect(
        service.updateCaseStatus('case-1', 'lecturer-1', 'PUBLISHED'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should enforce publishing with root node and at least one terminal node for BRANCHING_STUDY', async () => {
      // 1. Missing root node
      mockDbService.query.mockResolvedValueOnce({
        rows: [{
          id: 'case-1',
          status: 'APPROVED',
          learning_mode: 'BRANCHING_STUDY',
          root_node_id: null,
          lecturer_id: 'lecturer-1',
        }],
      });
      await expect(
        service.updateCaseStatus('case-1', 'lecturer-1', 'PUBLISHED'),
      ).rejects.toThrow(ForbiddenException);

      // 2. Has root node but 0 terminal nodes
      mockDbService.query
        .mockResolvedValueOnce({
          rows: [{
            id: 'case-1',
            status: 'APPROVED',
            learning_mode: 'BRANCHING_STUDY',
            root_node_id: 'node-1',
            lecturer_id: 'lecturer-1',
          }],
        })
        .mockResolvedValueOnce({ rows: [{ count: '0' }] }); // terminal count = 0

      await expect(
        service.updateCaseStatus('case-1', 'lecturer-1', 'PUBLISHED'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow valid transition from APPROVED to PUBLISHED for BRANCHING_STUDY with terminal node', async () => {
      mockDbService.query
        .mockResolvedValueOnce({
          rows: [{
            id: 'case-1',
            status: 'APPROVED',
            learning_mode: 'BRANCHING_STUDY',
            root_node_id: 'node-1',
            lecturer_id: 'lecturer-1',
          }],
        })
        .mockResolvedValueOnce({ rows: [{ count: '2' }] }) // terminal count = 2
        .mockResolvedValueOnce({ rows: [] }); // update

      const result = await service.updateCaseStatus('case-1', 'lecturer-1', 'PUBLISHED');
      expect(result).toEqual({ id: 'case-1', status: 'PUBLISHED' });
    });

    it('should allow valid transition to PUBLISHED for REVIEW_STUDY case without root node when context and problem exist', async () => {
      mockDbService.query
        .mockResolvedValueOnce({
          rows: [{
            id: 'case-review-1',
            status: 'APPROVED',
            learning_mode: 'REVIEW_STUDY',
            root_node_id: null, // No root node for Review Study
            context_text: 'Comprehensive business case context and market data',
            problem_text: 'What turnaround strategy should the executive committee adopt?',
            lecturer_id: 'lecturer-1',
          }],
        })
        .mockResolvedValueOnce({ rows: [] }); // update

      const result = await service.updateCaseStatus('case-review-1', 'lecturer-1', 'PUBLISHED');
      expect(result).toEqual({ id: 'case-review-1', status: 'PUBLISHED' });
    });

    it('should reject publishing REVIEW_STUDY case if context_text or problem_text is missing', async () => {
      // Missing context_text
      mockDbService.query.mockResolvedValueOnce({
        rows: [{
          id: 'case-review-1',
          status: 'APPROVED',
          learning_mode: 'REVIEW_STUDY',
          root_node_id: null,
          context_text: '',
          problem_text: 'Some problem',
          lecturer_id: 'lecturer-1',
        }],
      });

      await expect(
        service.updateCaseStatus('case-review-1', 'lecturer-1', 'PUBLISHED'),
      ).rejects.toThrow(BadRequestException);

      // Missing problem_text
      mockDbService.query.mockResolvedValueOnce({
        rows: [{
          id: 'case-review-1',
          status: 'APPROVED',
          learning_mode: 'REVIEW_STUDY',
          root_node_id: null,
          context_text: 'Some context',
          problem_text: null,
          lecturer_id: 'lecturer-1',
        }],
      });

      await expect(
        service.updateCaseStatus('case-review-1', 'lecturer-1', 'PUBLISHED'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('student access restriction and data privacy (P0-SEC-01 & P0-SEC-02, H1, H2)', () => {
    it('H1: rejects missing or unknown role with 403 ForbiddenException', async () => {
      await expect(service.getCaseById('case-1')).rejects.toThrow(ForbiddenException);
      await expect(service.getCaseById('case-1', 'GUEST', 'u-1')).rejects.toThrow(ForbiddenException);
      expect(mockDbService.query).not.toHaveBeenCalled();
    });

    it('H1: should forbid student from accessing non-published case with SQL status filter', async () => {
      mockDbService.query
        .mockResolvedValueOnce({ rows: [] }) // PUBLISHED query returns empty
        .mockResolvedValueOnce({ rows: [{ id: 'case-1' }] }); // id-only existence check

      await expect(service.getCaseById('case-1', 'STUDENT', 'student-1')).rejects.toThrow(
        new ForbiddenException('Students can only access PUBLISHED cases'),
      );
      expect(mockDbService.query.mock.calls[0][0]).toContain("c.status = 'PUBLISHED'");
      expect(mockDbService.query.mock.calls[0][1]).toEqual(['case-1']);
    });

    it('H1: returns 404 NotFoundException when case does not exist for student', async () => {
      mockDbService.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      await expect(service.getCaseById('missing-case', 'STUDENT', 'student-1')).rejects.toThrow(NotFoundException);
    });

    it('H1: should allow student accessing published case but HIDE nodes, options, and consequences', async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [{
          id: 'case-1',
          title: 'Business Ethics Case',
          description: 'A study on supply chain ethics',
          course_id: 'course-1',
          status: 'PUBLISHED',
          learning_mode: 'BRANCHING_STUDY',
          context_text: null,
          problem_text: null,
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
          lecturer_id: 'lecturer-1',
        }],
      });

      const result = await service.getCaseById('case-1', 'STUDENT');

      expect(mockDbService.query.mock.calls[0][0]).toContain("c.status = 'PUBLISHED'");
      expect(result.status).toBe('PUBLISHED');
      expect(result.title).toBe('Business Ethics Case');
      // P0-SEC-02: Nodes and options MUST NOT be returned in student DTO
      expect(result.nodes).toBeUndefined();
      expect(result.all_options).toBeUndefined();
    });

    it('H1: should return full tree with nodes and consequences for owner lecturer using SQL lecturer_id filter', async () => {
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

      expect(mockDbService.query.mock.calls[0][0]).toContain('co.lecturer_id = $2');
      expect(mockDbService.query.mock.calls[0][1]).toEqual(['case-1', 'lecturer-1']);
      expect(result.nodes).toBeDefined();
      expect(result.nodes[0].options[0].consequence).toBe('Severe stock drop');
    });

    it('H1: forbids non-owner lecturer with 403 and returns 404 when missing', async () => {
      mockDbService.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 'case-1' }] });
      await expect(service.getCaseById('case-1', 'LECTURER', 'other-lecturer')).rejects.toThrow(ForbiddenException);

      mockDbService.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });
      await expect(service.getCaseById('missing-case', 'LECTURER', 'other-lecturer')).rejects.toThrow(NotFoundException);
    });

    it('H1: allows ADMIN to read any case with full tree and no owner filter', async () => {
      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ id: 'case-1', status: 'DRAFT', lecturer_id: 'lecturer-1' }] })
        .mockResolvedValueOnce({ rows: [{ id: 'node-1', situation: 'Sit', node_index: 0 }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await service.getCaseById('case-1', 'ADMIN', 'admin-1');
      expect(mockDbService.query.mock.calls[0][0]).not.toContain('lecturer_id =');
      expect(mockDbService.query.mock.calls[0][1]).toEqual(['case-1']);
      expect(result.nodes).toHaveLength(1);
    });

    it('H2: getCasesByCourse enforces role, course existence (404), lecturer owner (403) and student enrollment (403)', async () => {
      await expect(service.getCasesByCourse('c-1', { id: 'u-1', role: 'UNKNOWN' })).rejects.toThrow(ForbiddenException);

      // Unknown course -> 404
      mockDbService.query.mockResolvedValueOnce({ rows: [] });
      await expect(service.getCasesByCourse('missing', { id: 'admin-1', role: 'ADMIN' })).rejects.toThrow(NotFoundException);

      // ADMIN -> all statuses
      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ id: 'c-1' }] })
        .mockResolvedValueOnce({ rows: [{ id: 'k-1', status: 'DRAFT' }] });
      await expect(service.getCasesByCourse('c-1', { id: 'admin-1', role: 'ADMIN' })).resolves.toHaveLength(1);

      // LECTURER owner -> SQL includes lecturer_id = $2
      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ id: 'c-1' }] })
        .mockResolvedValueOnce({ rows: [{ id: 'k-1', status: 'DRAFT' }] });
      await service.getCasesByCourse('c-1', { id: 'lect-1', role: 'LECTURER' });
      expect(mockDbService.query.mock.calls[4][0]).toContain('lecturer_id = $2');
      expect(mockDbService.query.mock.calls[4][1]).toEqual(['c-1', 'lect-1']);

      // LECTURER non-owner -> 403
      mockDbService.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 'c-1' }] });
      await expect(service.getCasesByCourse('c-1', { id: 'lect-2', role: 'LECTURER' })).rejects.toThrow(ForbiddenException);

      // STUDENT not enrolled -> 403
      mockDbService.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 'c-1' }] });
      await expect(service.getCasesByCourse('c-1', { id: 'stu-2', role: 'STUDENT' })).rejects.toThrow(ForbiddenException);

      // STUDENT enrolled -> SQL checks course_enrollments + PUBLISHED + exact columns
      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ id: 'enr-1' }] })
        .mockResolvedValueOnce({ rows: [{ id: 'k-pub', status: 'PUBLISHED' }] });
      await service.getCasesByCourse('c-1', { id: 'stu-1', role: 'STUDENT' });
      const studentCasesSql = mockDbService.query.mock.calls[10][0] as string;
      expect(studentCasesSql).toContain('course_enrollments');
      expect(studentCasesSql).toContain("c.status = 'PUBLISHED'");
      expect(studentCasesSql).not.toContain('SELECT *');
      expect(mockDbService.query.mock.calls[10][1]).toEqual(['c-1', 'stu-1']);
    });
  });
});
