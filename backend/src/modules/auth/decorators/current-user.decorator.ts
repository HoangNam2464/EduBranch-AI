import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * @CurrentUser() — Injects the authenticated user from req.user.
 * Only works on routes protected by JwtAuthGuard.
 *
 * Usage:
 *   @Get('profile')
 *   getProfile(@CurrentUser() user: { id: string; email: string; role: string }) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
