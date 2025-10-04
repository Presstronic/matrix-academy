/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import type { Role } from '../../enums/role.enum.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

/**
 * Guard that checks if the authenticated user has the required roles
 * Should be used after JwtAuthGuard
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user!;

    // Check if user has any of the required roles
    return requiredRoles.some((role) => user?.roles?.includes(role));
  }
}
