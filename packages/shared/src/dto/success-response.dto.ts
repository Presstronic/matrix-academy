/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file Success Response DTO
 */
/**
 * Standard success response wrapper for all API endpoints
 * @template T The type of data being returned
 */
export class SuccessResponseDto<T> {
  /**
   * Indicates whether the request was successful
   */
  success: boolean;

  /**
   * The actual response data
   */
  data: T;

  /**
   * Metadata about the response
   */
  metadata: ResponseMetadata;

  constructor(data: T, correlationId?: string) {
    this.success = true;
    this.data = data;
    this.metadata = {
      timestamp: new Date().toISOString(),
      correlationId: correlationId ?? this.generateCorrelationId(),
      version: '1.0',
    };
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}

/**
 * Metadata included in every response
 */
export interface ResponseMetadata {
  /**
   * ISO 8601 timestamp of when the response was generated
   */
  timestamp: string;

  /**
   * Unique identifier for tracking this request across systems
   */
  correlationId: string;

  /**
   * API version
   */
  version: string;
}
