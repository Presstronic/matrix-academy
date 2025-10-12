/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file Custom API error classes
 */
import type { AxiosError } from 'axios';

import type { ApiErrorResponse } from './types';

/**
 * Base API error class
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly response?: ApiErrorResponse;
  public readonly originalError?: AxiosError;

  constructor(
    message: string,
    statusCode: number,
    response?: ApiErrorResponse,
    originalError?: AxiosError,
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
    this.originalError = originalError;

    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication failed', response?: ApiErrorResponse) {
    super(message, 401, response);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error (403)
 */
export class AuthorizationError extends ApiError {
  constructor(message = 'Access forbidden', response?: ApiErrorResponse) {
    super(message, 403, response);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found', response?: ApiErrorResponse) {
    super(message, 404, response);
    this.name = 'NotFoundError';
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends ApiError {
  constructor(message = 'Validation failed', response?: ApiErrorResponse) {
    super(message, 400, response);
    this.name = 'ValidationError';
  }
}

/**
 * Server error (500+)
 */
export class ServerError extends ApiError {
  constructor(message = 'Server error', statusCode = 500, response?: ApiErrorResponse) {
    super(message, statusCode, response);
    this.name = 'ServerError';
  }
}

/**
 * Network error (no response)
 */
export class NetworkError extends ApiError {
  constructor(message = 'Network error occurred') {
    super(message, 0);
    this.name = 'NetworkError';
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends ApiError {
  constructor(message = 'Request timeout') {
    super(message, 0);
    this.name = 'TimeoutError';
  }
}

/**
 * Create appropriate error based on status code
 */
export function createApiError(error: AxiosError): ApiError {
  const response = error.response?.data as ApiErrorResponse | undefined;
  const status = error.response?.status ?? 0;
  const message = response?.message ?? error.message;

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new TimeoutError(message);
  }

  if (!error.response) {
    return new NetworkError(message);
  }

  switch (status) {
    case 400:
      return new ValidationError(message, response);
    case 401:
      return new AuthenticationError(message, response);
    case 403:
      return new AuthorizationError(message, response);
    case 404:
      return new NotFoundError(message, response);
    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(message, status, response);
    default:
      return new ApiError(message, status, response, error);
  }
}
