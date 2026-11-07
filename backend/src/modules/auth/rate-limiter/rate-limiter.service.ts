import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
  remaining: number;
  resetTime: number; // Unix timestamp in ms when the window resets
}

export interface RateLimitRecord {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  private readonly records = new Map<string, RateLimitRecord>();

  constructor(private readonly configService: ConfigService) {}

  /**
   * Check whether the request under the specified key is within rate limits.
   * Increments hit counter if allowed.
   */
  checkLimit(key: string, customLimit?: number, customTtlMs?: number): RateLimitResult {
    const defaultLimit = Number(
      this.configService.get<number>("AUTH_RATE_LIMIT_MAX_REQUESTS") ?? 5,
    );
    const defaultTtlMs = Number(
      this.configService.get<number>("AUTH_RATE_LIMIT_TTL_MS") ?? 60000,
    );

    const limit = customLimit !== undefined && customLimit > 0 ? customLimit : defaultLimit;
    const ttlMs = customTtlMs !== undefined && customTtlMs > 0 ? customTtlMs : defaultTtlMs;

    const now = Date.now();
    const existing = this.records.get(key);

    // If no existing record or current window has expired, start a new window
    if (!existing || now >= existing.resetTime) {
      const resetTime = now + ttlMs;
      const newRecord: RateLimitRecord = {
        count: 1,
        resetTime,
      };
      this.records.set(key, newRecord);

      return {
        allowed: true,
        count: 1,
        limit,
        remaining: Math.max(0, limit - 1),
        resetTime,
      };
    }

    // Window is currently active
    if (existing.count < limit) {
      existing.count += 1;
      return {
        allowed: true,
        count: existing.count,
        limit,
        remaining: Math.max(0, limit - existing.count),
        resetTime: existing.resetTime,
      };
    }

    // Limit exceeded
    this.logger.warn(`Rate limit exceeded for key: "${key}" (${existing.count}/${limit})`);
    return {
      allowed: false,
      count: existing.count,
      limit,
      remaining: 0,
      resetTime: existing.resetTime,
    };
  }

  /**
   * Resets rate limiting state for a specific key, or all keys if omitted.
   * Useful for testing and administrative resets.
   */
  reset(key?: string): void {
    if (key) {
      this.records.delete(key);
    } else {
      this.records.clear();
    }
  }

  /**
   * Inspect current record for a key (if valid and unexpired).
   */
  getRecord(key: string): RateLimitRecord | undefined {
    const record = this.records.get(key);
    if (!record) return undefined;
    if (Date.now() >= record.resetTime) {
      this.records.delete(key);
      return undefined;
    }
    return record;
  }
}
