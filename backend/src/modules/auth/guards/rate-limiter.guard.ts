import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RateLimiterService } from "../rate-limiter/rate-limiter.service";
import { RATE_LIMIT_KEY, RateLimitOptions } from "../decorators/rate-limit.decorator";

/**
 * RateLimiterGuard — Protects endpoints from excessive request spikes and brute-force attempts.
 * Returns HTTP 429 Too Many Requests when configured threshold is exceeded.
 */
@Injectable()
export class RateLimiterGuard implements CanActivate {
  constructor(
    private readonly rateLimiterService: RateLimiterService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const handler = context.getHandler();
    const clazz = context.getClass();
    const targets = [handler, clazz].filter((t): t is Function => typeof t === "function" || (typeof t === "object" && t !== null));

    const options = targets.length > 0
      ? this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_KEY, targets)
      : undefined;

    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();

    const clientIp =
      req.headers?.["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      "127.0.0.1";

    const path = req.path || req.url || "endpoint";
    const trackerKey = `ratelimit:${clientIp}:${path}`;

    const result = this.rateLimiterService.checkLimit(
      trackerKey,
      options?.limit,
      options?.ttlMs,
    );

    // Set standard rate limit headers when response object supports setHeader
    if (res && typeof res.setHeader === "function") {
      res.setHeader("X-RateLimit-Limit", result.limit.toString());
      res.setHeader("X-RateLimit-Remaining", result.remaining.toString());
      res.setHeader("X-RateLimit-Reset", Math.ceil(result.resetTime / 1000).toString());
    }

    if (!result.allowed) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: "Too many requests. Please try again later.",
          error: "Too Many Requests",
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
