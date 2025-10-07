/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { ErrorCode } from '@matrix-academy/shared';
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Custom exception for business logic violations
 * Use this for domain-specific errors that don't fit standard HTTP exceptions
 *
 * @example
 * throw new BusinessException(
 *   'User cannot enroll in more than 5 courses',
 *   ErrorCode.BUSINESS_RULE_VIOLATION,
 *   HttpStatus.UNPROCESSABLE_ENTITY
 * );
 */
export class BusinessException extends HttpException {
  constructor(
    message: string,
    public readonly errorCode: ErrorCode = ErrorCode.BUSINESS_RULE_VIOLATION,
    statusCode: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY,
    public readonly details?: Record<string, unknown>,
  ) {
    super(
      {
        message,
        errorCode,
        details,
      },
      statusCode,
    );
  }
}
