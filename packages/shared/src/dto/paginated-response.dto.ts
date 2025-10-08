/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file Paginated Response DTO
 */
import { SuccessResponseDto } from './success-response.dto.js';

/**
 * Paginated response wrapper for list endpoints
 * @template T The type of items in the paginated list
 */
export class PaginatedResponseDto<T> extends SuccessResponseDto<T[]> {
  /**
   * Pagination metadata
   */
  pagination: PaginationMetadata;

  constructor(
    data: T[],
    page: number,
    limit: number,
    total: number,
    correlationId?: string,
  ) {
    super(data, correlationId);
    this.pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrevious: page > 1,
    };
  }
}

/**
 * Pagination metadata included in paginated responses
 */
export interface PaginationMetadata {
  /**
   * Current page number (1-indexed)
   */
  page: number;

  /**
   * Number of items per page
   */
  limit: number;

  /**
   * Total number of items across all pages
   */
  total: number;

  /**
   * Total number of pages
   */
  totalPages: number;

  /**
   * Whether there is a next page
   */
  hasNext: boolean;

  /**
   * Whether there is a previous page
   */
  hasPrevious: boolean;
}
