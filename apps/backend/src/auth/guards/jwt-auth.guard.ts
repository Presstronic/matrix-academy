/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import jwt from 'jsonwebtoken';

import type { EnvironmentVariables } from '../../config/env.validation.js';
import type { AuthenticatedUser } from '../decorators/current-user.decorator.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

/**
 * Guard that validates JWT tokens on protected routes
 * Skips authentication for routes marked with @Public() decorator
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private configService: ConfigService<EnvironmentVariables>,
  ) {}

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
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    try {
      const secret = this.configService.get('JWT_SECRET', { infer: true });
      const payload = jwt.verify(token, secret!) as Record<string, unknown>;

      // Attach user to request object
      request.user = {
        id: payload.sub as string,
        email: payload.email as string,
        tenantId: payload.tenantId as string,
        roles: (payload.roles as string[]) || [],
      } as AuthenticatedUser;

      return true;
    } catch (error: unknown) {
      // Check error name instead of instanceof for ESM compatibility
      if (error && typeof error === 'object' && 'name' in error) {
        if (error.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Token has expired');
        }
        if (error.name === 'JsonWebTokenError') {
          throw new UnauthorizedException('Invalid token');
        }
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }

  /**
   * Extract JWT token from cookies or Authorization header
   * Priority: 1. Cookie, 2. Authorization header (for backward compatibility)
   */
  private extractToken(request: Request): string | undefined {
    // First, try to get token from cookie (preferred method)
    const tokenFromCookie = request.cookies?.access_token as string | undefined;
    if (tokenFromCookie) {
      return tokenFromCookie as string | undefined;
    }

    // Fall back to Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
