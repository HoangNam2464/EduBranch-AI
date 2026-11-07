import { SetMetadata } from "@nestjs/common";

export interface RateLimitOptions {
  limit?: number; // Maximum number of requests allowed in the window
  ttlMs?: number; // Time-to-live / window duration in milliseconds
}

export const RATE_LIMIT_KEY = "rate_limit";

/**
 * @RateLimit(options?: RateLimitOptions)
 * Sets custom rate limit options on an endpoint or controller.
 * If omitted, defaults from environment configuration are used:
 * - AUTH_RATE_LIMIT_MAX_REQUESTS (default: 5)
 * - AUTH_RATE_LIMIT_TTL_MS (default: 60000ms / 1 minute)
 */
export const RateLimit = (options?: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options || {});
