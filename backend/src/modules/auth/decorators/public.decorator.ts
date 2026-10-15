import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";

/**
 * @Public() — Marks a route as public (no JWT required).
 * Use on login, register, and health-check endpoints.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
