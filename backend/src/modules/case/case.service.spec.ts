import { Test, TestingModule } from '@nestjs/testing';
import { CaseService } from './case.service';
import { DatabaseService } from '../../common/database/database.service';
import { AiClientService } from '../../common/ai-client/ai-client.service';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

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

      const result = await service.generateCase('course-1', 'lecturer-1', { materialIds: ['m1'] });

      expect(mockDbClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockDbClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO cases'), expect.any(Array));
      expect(mockDbClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO case_nodes'), expect.any(Array));
      expect(mockDbClient.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE cases SET root_node_id'), expect.any(Array));
      expect(mockDbClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO case_options'), expect.any(Array));
      expect(mockDbClient.query).toHaveBeenCalledWith('COMMIT');
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
});
