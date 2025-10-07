/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ErrorResponse, ValidationErrorDetail } from '@matrix-academy/shared';
import { ErrorCode } from '@matrix-academy/shared';
import type {
  ArgumentsHost,
  ExceptionFilter} from '@nestjs/common';
import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

import { BusinessException } from '../exceptions/business.exception.js';
import { ValidationException } from '../exceptions/validation.exception.js';

/**
 * Global exception filter that catches all exceptions and formats them
 * into a standardized error response structure
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);

    // Log the error with context
    this.logError(exception, request, errorResponse);

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  /**
   * Builds a standardized error response from any exception
   */
  private buildErrorResponse(exception: unknown, request: Request): ErrorResponse {
    const timestamp = new Date().toISOString();
    const path = request.url;
    const correlationId = request.headers['x-correlation-id'] as string | undefined;

    // Handle ValidationException
    if (exception instanceof ValidationException) {
      return {
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: exception.errorCode,
        message: exception.message,
        details: exception.validationErrors,
        correlationId,
        timestamp,
        path,
        ...(process.env.NODE_ENV === 'development' && { stack: exception.stack }),
      };
    }

    // Handle BusinessException
    if (exception instanceof BusinessException) {
      return {
        success: false,
        statusCode: exception.getStatus(),
        errorCode: exception.errorCode,
        message: exception.message,
        details: exception.details,
        correlationId,
        timestamp,
        path,
        ...(process.env.NODE_ENV === 'development' && { stack: exception.stack }),
      };
    }

    // Handle standard NestJS HttpExceptions
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message ?? exception.message;

      // Handle class-validator validation errors
      const validationErrors = this.extractValidationErrors(exceptionResponse);

      return {
        success: false,
        statusCode: status,
        errorCode: this.mapStatusToErrorCode(status),
        message: Array.isArray(message) ? message.join(', ') : message,
        ...(validationErrors.length > 0 && { details: validationErrors }),
        correlationId,
        timestamp,
        path,
        ...(process.env.NODE_ENV === 'development' && { stack: exception.stack }),
      };
    }

    // Handle TypeORM database errors
    if (exception instanceof QueryFailedError) {
      return this.handleDatabaseError(exception, path, correlationId, timestamp);
    }

    // Handle unknown errors
    return this.handleUnknownError(exception, path, correlationId, timestamp);
  }

  /**
   * Extracts validation errors from class-validator response
   */
  private extractValidationErrors(response: unknown): ValidationErrorDetail[] {
    if (typeof response === 'object' && response !== null && 'message' in response) {
      const messages = (response as any).message;
      if (Array.isArray(messages)) {
        return messages.map((msg) => ({
          field: typeof msg === 'string' ? 'unknown' : msg.property ?? 'unknown',
          message: typeof msg === 'string' ? msg : Object.values(msg.constraints ?? {}).join(', '),
        }));
      }
    }
    return [];
  }

  /**
   * Handles TypeORM database errors
   */
  private handleDatabaseError(
    error: QueryFailedError,
    path: string,
    correlationId: string | undefined,
    timestamp: string,
  ): ErrorResponse {
    const driverError = error.driverError as any;

    // PostgreSQL error codes
    // 23505 = unique_violation
    // 23503 = foreign_key_violation
    // 23502 = not_null_violation
    if (driverError.code === '23505') {
      return {
        success: false,
        statusCode: HttpStatus.CONFLICT,
        errorCode: ErrorCode.DUPLICATE_ENTRY,
        message: 'A record with this value already exists',
        details: {
          constraint: driverError.constraint,
          detail: driverError.detail,
        },
        correlationId,
        timestamp,
        path,
      };
    }

    if (driverError.code === '23503') {
      return {
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.FOREIGN_KEY_VIOLATION,
        message: 'Referenced record does not exist',
        details: {
          constraint: driverError.constraint,
        },
        correlationId,
        timestamp,
        path,
      };
    }

    // Generic database error
    return {
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: ErrorCode.DATABASE_ERROR,
      message: 'A database error occurred',
      correlationId,
      timestamp,
      path,
      ...(process.env.NODE_ENV === 'development' && {
        details: { message: error.message },
        stack: error.stack,
      }),
    };
  }

  /**
   * Handles unknown errors
   */
  private handleUnknownError(
    exception: unknown,
    path: string,
    correlationId: string | undefined,
    timestamp: string,
  ): ErrorResponse {
    const message = exception instanceof Error ? exception.message : 'An unexpected error occurred';
    const stack = exception instanceof Error ? exception.stack : undefined;

    return {
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
      message,
      correlationId,
      timestamp,
      path,
      ...(process.env.NODE_ENV === 'development' && { stack }),
    };
  }

  /**
   * Maps HTTP status codes to error codes
   */
  private mapStatusToErrorCode(status: HttpStatus): ErrorCode {
    const statusMap: Record<number, ErrorCode> = {
      [HttpStatus.BAD_REQUEST]: ErrorCode.BAD_REQUEST,
      [HttpStatus.UNAUTHORIZED]: ErrorCode.UNAUTHORIZED,
      [HttpStatus.FORBIDDEN]: ErrorCode.FORBIDDEN,
      [HttpStatus.NOT_FOUND]: ErrorCode.NOT_FOUND,
      [HttpStatus.METHOD_NOT_ALLOWED]: ErrorCode.METHOD_NOT_ALLOWED,
      [HttpStatus.CONFLICT]: ErrorCode.RESOURCE_CONFLICT,
      [HttpStatus.UNPROCESSABLE_ENTITY]: ErrorCode.VALIDATION_ERROR,
      [HttpStatus.TOO_MANY_REQUESTS]: ErrorCode.RATE_LIMIT_EXCEEDED,
      [HttpStatus.INTERNAL_SERVER_ERROR]: ErrorCode.INTERNAL_SERVER_ERROR,
      [HttpStatus.SERVICE_UNAVAILABLE]: ErrorCode.SERVICE_UNAVAILABLE,
    };

    return statusMap[status] ?? ErrorCode.UNKNOWN_ERROR;
  }

  /**
   * Logs error with context
   */
  private logError(exception: unknown, request: Request, errorResponse: ErrorResponse): void {
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') ?? '';
    const correlationId = errorResponse.correlationId ?? 'N/A';

    const context = {
      correlationId,
      method,
      url,
      ip,
      userAgent,
      statusCode: errorResponse.statusCode,
      errorCode: errorResponse.errorCode,
    };

    if (errorResponse.statusCode >= 500) {
      this.logger.error(
        `${method} ${url} - ${errorResponse.message}`,
        exception instanceof Error ? exception.stack : undefined,
        JSON.stringify(context),
      );
    } else {
      this.logger.warn(`${method} ${url} - ${errorResponse.message}`, JSON.stringify(context));
    }
  }
}
