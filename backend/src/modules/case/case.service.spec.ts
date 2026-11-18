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

  describe('student access restriction and data privacy (P0-SEC-01 & P0-SEC-02)', () => {
    it('should forbid student from accessing non-published case', async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [{ id: 'case-1', status: 'DRAFT', lecturer_id: 'lecturer-1' }],
      });
      await expect(service.getCaseById('case-1', 'STUDENT')).rejects.toThrow(ForbiddenException);
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

  describe('updateNode', () => {
    it('should reject if lecturer does not own the course', async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [{ status: 'DRAFT', lecturer_id: 'other-lecturer', course_id: 'course-1', is_active: true }],
      });

      await expect(
        service.updateNode('case-1', 'node-1', 'lecturer-1', { situation: 'New' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject if course is archived (ConflictException)', async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [{ status: 'DRAFT', lecturer_id: 'lecturer-1', course_id: 'course-1', is_active: false }],
      });

      await expect(
        service.updateNode('case-1', 'node-1', 'lecturer-1', { situation: 'New' }),
      ).rejects.toThrow(new ConflictException('Course is archived'));
    });

    it('should reject if case is PUBLISHED or APPROVED', async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [{ status: 'PUBLISHED', lecturer_id: 'lecturer-1', course_id: 'course-1', is_active: true }],
      });

      await expect(
        service.updateNode('case-1', 'node-1', 'lecturer-1', { situation: 'New' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject if target node does not exist in case (IDOR)', async () => {
      mockDbService.query
        .mockResolvedValueOnce({
          rows: [{ status: 'DRAFT', lecturer_id: 'lecturer-1', course_id: 'course-1', is_active: true }],
        })
        .mockResolvedValueOnce({ rows: [{ id: 'node-1' }] }) // nodeCheck exists
        .mockResolvedValueOnce({ rows: [] }); // target node does NOT exist

      await expect(
        service.updateNode('case-1', 'node-1', 'lecturer-1', {
          options: [
            { option_text: 'O1', consequence: 'C1', next_node_id: 'invalid-target' },
            { option_text: 'O2', consequence: 'C2', next_node_id: 'node-2' },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if cycle is detected in DAG (DFS 3-color)', async () => {
      mockDbService.query
        .mockResolvedValueOnce({
          rows: [{ status: 'DRAFT', lecturer_id: 'lecturer-1', course_id: 'course-1', is_active: true }],
        })
        .mockResolvedValueOnce({ rows: [{ id: 'node-1' }] }) // nodeCheck exists
        .mockResolvedValueOnce({ rows: [{ id: 'node-2' }] }) // target node 2 exists
        .mockResolvedValueOnce({
          rows: [
            // Existing edge: node-2 -> node-1
            { node_id: 'node-2', next_node_id: 'node-1' },
          ],
        }); // allEdgesRes

      // Adding edge node-1 -> node-2 creates cycle: node-1 -> node-2 -> node-1
      await expect(
        service.updateNode('case-1', 'node-1', 'lecturer-1', {
          options: [
            { option_text: 'O1', consequence: 'C1', next_node_id: 'node-2' },
            { option_text: 'O2', consequence: 'C2', next_node_id: null },
          ],
        }),
      ).rejects.toThrow(new BadRequestException('Cycle detected in decision tree. Tree must be a directed acyclic graph (DAG).'));
    });

    it('should update node and commit transaction successfully', async () => {
      mockDbService.query
        .mockResolvedValueOnce({
          rows: [{ status: 'DRAFT', lecturer_id: 'lecturer-1', course_id: 'course-1', is_active: true }],
        })
        .mockResolvedValueOnce({ rows: [{ id: 'node-1' }] }) // nodeCheck exists
        .mockResolvedValueOnce({ rows: [{ id: 'node-2' }] }) // target node 2 exists
        .mockResolvedValueOnce({ rows: [] }) // all edges (no cycle)
        .mockResolvedValueOnce({ rows: [{ id: 'case-1', status: 'DRAFT', lecturer_id: 'lecturer-1' }] }) // getCaseById caseRes
        .mockResolvedValueOnce({ rows: [{ id: 'node-1', node_index: 0 }] }) // getCaseById nodesRes
        .mockResolvedValueOnce({ rows: [{ id: 'opt-1', node_id: 'node-1' }] }); // getCaseById optionsRes

      mockDbClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [{ is_active: true }] }) // FOR SHARE
        .mockResolvedValueOnce({ rows: [] }) // UPDATE case_nodes
        .mockResolvedValueOnce({ rows: [{ id: 'opt-1' }] }) // IDOR check for option
        .mockResolvedValueOnce({ rows: [] }) // UPDATE case_options
        .mockResolvedValueOnce({ rows: [] }) // UPDATE cases updated_at
        .mockResolvedValueOnce(undefined); // COMMIT

      const result = await service.updateNode('case-1', 'node-1', 'lecturer-1', {
        situation: 'New Situation',
        options: [
          { id: 'opt-1', option_text: 'O1', consequence: 'C1', next_node_id: 'node-2' },
          { option_text: 'O2', consequence: 'C2', next_node_id: null },
        ],
      });

      expect(mockDbClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockDbClient.query).toHaveBeenCalledWith(
        'SELECT is_active FROM courses WHERE id = $1 FOR SHARE',
        ['course-1'],
      );
      expect(mockDbClient.query).toHaveBeenCalledWith('COMMIT');
      expect(result.id).toBe('case-1');
    });
  });
});
