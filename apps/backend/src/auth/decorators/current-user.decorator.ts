/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

/**
 * Interface representing the authenticated user from JWT payload
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  tenantId?: string;
  roles: string[];
}

/**
 * Decorator to extract the current authenticated user from the request
 *
 * @example
 * ```typescript
 * @Get('profile')
 * getProfile(@CurrentUser() user: AuthenticatedUser) {
 *   return this.usersService.findOne(user.id);
 * }
 *
 * // Extract specific property
 * @Post('update')
 * update(@CurrentUser('id') userId: string) {
 *   return this.usersService.update(userId);
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthenticatedUser }>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
