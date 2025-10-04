/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type { ArgumentsHost, ExceptionFilter} from '@nestjs/common';
import { Catch, HttpStatus } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import type { Response } from 'express';

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  catch(exception: ThrottlerException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.TOO_MANY_REQUESTS).json({
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      message: 'Too many requests. Please try again later.',
      error: 'Too Many Requests',
    });
  }
}
