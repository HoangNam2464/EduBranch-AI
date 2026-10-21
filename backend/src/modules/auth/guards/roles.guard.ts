import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "../auth.types";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

/**
 * RolesGuard — Enforces role-based authorization for protected endpoints.
 *
 * Rules:
 * - If route is marked with @Public(), access is granted without checking roles.
 * - If no @Roles() metadata is found on handler or class, any authenticated user is allowed.
 * - If @Roles(...) specifies allowed roles, req.user must exist and req.user.role must match.
 * - Rejects unauthorized access with 403 Forbidden.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException("Forbidden resource: missing authenticated user role");
    }

    const hasRole = requiredRoles.includes(user.role as Role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Forbidden resource: requires role ${requiredRoles.join(" or ")}`,
      );
    }

    return true;
  }
}
