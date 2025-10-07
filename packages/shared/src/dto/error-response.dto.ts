/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type { ErrorCode } from '../enums/error-codes.enum.js';

/**
 * Validation error detail for a specific field
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: unknown;
  constraints?: Record<string, string>;
}

/**
 * Standardized error response structure
 * This format is returned for all errors across the API
 */
export interface ErrorResponse {
  /**
   * Whether the request was successful (always false for errors)
   */
  success: false;

  /**
   * HTTP status code
   */
  statusCode: number;

  /**
   * Machine-readable error code for client-side handling
   */
  errorCode: ErrorCode;

  /**
   * Human-readable error message
   */
  message: string;

  /**
   * Detailed error information (optional)
   * Can include additional context, field-level validation errors, etc.
   */
  details?: ValidationErrorDetail[] | Record<string, unknown>;

  /**
   * Correlation ID for tracing this request through logs
   */
  correlationId?: string;

  /**
   * Timestamp when the error occurred
   */
  timestamp: string;

  /**
   * API path where the error occurred
   */
  path: string;

  /**
   * Stack trace (only included in development mode)
   */
  stack?: string;
}
