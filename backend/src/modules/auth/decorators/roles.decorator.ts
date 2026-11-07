import { SetMetadata } from "@nestjs/common";
import { Role } from "../auth.types";

export const ROLES_KEY = "roles";

/**
 * @Roles(...roles: Role[]) — Specifies which user roles are permitted to access this endpoint or controller.
 * Enforced by RolesGuard.
 *
 * Example:
 *   @Roles("LECTURER")
 *   @Post("cases/generate")
 *   generateCase(...) { ... }
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
