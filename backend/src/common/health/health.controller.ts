import { Controller, Get, HttpStatus, Res } from "@nestjs/common";
import { Response } from "express";
import { ConfigService } from "@nestjs/config";
import { DatabaseService } from "../database/database.service";
import { Public } from "../../modules/auth/decorators/public.decorator";
import * as net from "net";

@Controller("health")
export class HealthController {
  constructor(
    private readonly db: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Get()
  async getHealth(@Res() res: Response) {
    let dbStatus = "DOWN";
    let redisStatus = "DOWN";

    try {
      await this.db.query("SELECT 1");
      dbStatus = "UP";
    } catch {
      dbStatus = "DOWN";
    }

    const redisHost = this.configService.get<string>("REDIS_HOST", "localhost");
    const redisPort = Number(this.configService.get<number>("REDIS_PORT", 6379));

    const redisUp = await this.checkTcpConnection(redisHost, redisPort, 1000);
    redisStatus = redisUp ? "UP" : "DOWN";

    const isHealthy = dbStatus === "UP" && redisStatus === "UP";
    const statusCode = isHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

    return res.status(statusCode).json({
      status: isHealthy ? "UP" : "DEGRADED",
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
      timestamp: new Date().toISOString(),
    });
  }

  private checkTcpConnection(host: string, port: number, timeoutMs: number): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(timeoutMs);
      socket.on("connect", () => {
        socket.destroy();
        resolve(true);
      });
      socket.on("timeout", () => {
        socket.destroy();
        resolve(false);
      });
      socket.on("error", () => {
        socket.destroy();
        resolve(false);
      });
      socket.connect(port, host);
    });
  }
}
