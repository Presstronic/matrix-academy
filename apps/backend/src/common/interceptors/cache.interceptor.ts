/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file cache.interceptor.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import type { Observable } from 'rxjs';
import { of, tap } from 'rxjs';

/**
 * Custom caching interceptor for HTTP requests
 */
@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<{
      method: string;
      url: string;
      user?: { id: string };
    }>();

    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    const cacheKey = this.generateCacheKey(request);
    const cachedResponse = await this.cacheManager.get(cacheKey);

    if (cachedResponse) {
      return of(cachedResponse);
    }

    return next.handle().pipe(
      tap((response) => {
        void this.cacheManager.set(cacheKey, response);
      }),
    );
  }

  /**
   * Generate cache key from request
   */
  private generateCacheKey(request: {
    url: string;
    user?: { id: string };
  }): string {
    const userId = request.user?.id ?? 'anonymous';
    return `http:${userId}:${request.url}`;
  }
}
