/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { SuccessResponseDto } from '@matrix-academy/shared';
import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interceptor that wraps all successful responses in a standard format
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, SuccessResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponseDto<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const correlationId = this.getCorrelationId(request);

    return next.handle().pipe(
      map((data: T) => {
        // If data is already wrapped in SuccessResponseDto, return as-is
        if (data instanceof SuccessResponseDto) {
          return data as SuccessResponseDto<T>;
        }

        // Wrap raw data in standard response format
        return new SuccessResponseDto<T>(data, correlationId);
      }),
    );
  }

  /**
   * Extract or generate correlation ID for request tracking
   */
  private getCorrelationId(request: Request): string {
    // Check for correlation ID in headers
    const headerCorrelationId =
      request.headers['x-correlation-id'] ??
      request.headers['x-request-id'];

    if (typeof headerCorrelationId === 'string') {
      return headerCorrelationId;
    }

    // Generate new correlation ID if not provided
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}
