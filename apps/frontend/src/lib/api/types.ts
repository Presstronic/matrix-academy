/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file TypeScript interfaces for API contracts
 */
/**
 * Standard API error response structure
 */
export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  error?: string;
  details?: Record<string, unknown>;
}

/**
 * Standard API success response structure
 * Matches backend's SuccessResponseDto
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  metadata: {
    timestamp: string;
    correlationId: string;
    version: string;
  };
}

/**
 * Paginated request parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Authentication token response (legacy - tokens in body)
 * @deprecated Tokens are now in HttpOnly cookies
 */
export interface LegacyAuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

/**
 * Authentication response (cookie-based)
 * Tokens are stored in HttpOnly cookies on the client
 */
export interface AuthTokenResponse {
  user: User;
  expiresIn: number;
}

/**
 * User data structure
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegistrationData {
  email: string;
  password: string;
  name?: string;
}

/**
 * API request configuration
 */
export interface ApiRequestConfig {
  withAuth?: boolean;
  retry?: boolean;
  timeout?: number;
}
