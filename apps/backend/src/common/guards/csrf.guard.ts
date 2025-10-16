/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file CSRF protection guard
 */
import { CanActivate, type ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { IS_PUBLIC_KEY } from '../../auth/decorators/public.decorator.js';

/**
 * CSRF Token Guard
 * Validates CSRF tokens using double-submit cookie pattern
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;

    // Only validate CSRF for state-changing methods
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return true;
    }

    const csrfTokenFromHeader = request.headers['x-csrf-token'] as string;
    const csrfTokenFromCookie = request.cookies?.csrf_token as string;

    if (!csrfTokenFromHeader || !csrfTokenFromCookie) {
      throw new ForbiddenException('CSRF token missing');
    }

    if (csrfTokenFromHeader !== csrfTokenFromCookie) {
      throw new ForbiddenException('CSRF token mismatch');
    }

    return true;
  }
}
