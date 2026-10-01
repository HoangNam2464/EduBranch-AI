import { Test, TestingModule } from '@nestjs/testing';
import { CaseService } from './case.service';
import { DatabaseService } from '../../common/database/database.service';
import { AiClientService } from '../../common/ai-client/ai-client.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

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
        .mockResolvedValueOnce({ rows: [{ id: 'case-1', status: 'DRAFT' }] }) // getCaseById caseRes
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

  describe('lifecycle status transitions', () => {
    it('should enforce publishing with root node', async () => {
      mockDbService.query.mockResolvedValueOnce({ rows: [{ id: 'case-1', status: 'APPROVED', root_node_id: null }] });
      await expect(service.updateCaseStatus('case-1', 'PUBLISHED')).rejects.toThrow(ForbiddenException);
    });

    it('should allow publishing if root node exists', async () => {
      mockDbService.query.mockResolvedValueOnce({ rows: [{ id: 'case-1', status: 'APPROVED', root_node_id: 'node-1' }] });
      await service.updateCaseStatus('case-1', 'PUBLISHED');
      expect(mockDbService.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE cases SET status'), ['PUBLISHED', 'case-1']);
    });
  });

  describe('student access restriction', () => {
    it('should forbid student from accessing non-published case', async () => {
      mockDbService.query.mockResolvedValueOnce({ rows: [{ id: 'case-1', status: 'DRAFT' }] });
      await expect(service.getCaseById('case-1', 'STUDENT')).rejects.toThrow(ForbiddenException);
    });

    it('should allow student accessing published case', async () => {
      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ id: 'case-1', status: 'PUBLISHED' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await service.getCaseById('case-1', 'STUDENT');
      expect(result.status).toBe('PUBLISHED');
    });
  });
});
