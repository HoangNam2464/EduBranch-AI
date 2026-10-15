import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { DatabaseService } from '../database/database.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

describe('HealthController', () => {
  let controller: HealthController;

  const mockDbService = {
    query: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultVal: any) => defaultVal),
  };

  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: DatabaseService, useValue: mockDbService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return 200 UP when DB and Redis are reachable', async () => {
    mockDbService.query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });
    // Mock checkTcpConnection internal
    jest.spyOn(controller as any, 'checkTcpConnection').mockResolvedValueOnce(true);

    const res = mockResponse();
    await controller.getHealth(res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'UP',
        services: {
          database: 'UP',
          redis: 'UP',
        },
      }),
    );
  });

  it('should return 503 DEGRADED when database fails', async () => {
    mockDbService.query.mockRejectedValueOnce(new Error('DB connection refused'));
    jest.spyOn(controller as any, 'checkTcpConnection').mockResolvedValueOnce(true);

    const res = mockResponse();
    await controller.getHealth(res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'DEGRADED',
        services: {
          database: 'DOWN',
          redis: 'UP',
        },
      }),
    );
  });

  it('should return 503 DEGRADED when redis fails', async () => {
    mockDbService.query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });
    jest.spyOn(controller as any, 'checkTcpConnection').mockResolvedValueOnce(false);

    const res = mockResponse();
    await controller.getHealth(res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'DEGRADED',
        services: {
          database: 'UP',
          redis: 'DOWN',
        },
      }),
    );
  });
});
