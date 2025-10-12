/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file API library barrel export
 */
// Client and HTTP methods
export { apiClient, del, get, patch, post, put } from './client';
export {
  getAuthToken,
  getRefreshToken,
  removeAuthToken,
  setAuthToken,
  setRefreshToken,
} from './client';

// Error classes
export {
  ApiError,
  AuthenticationError,
  AuthorizationError,
  createApiError,
  NetworkError,
  NotFoundError,
  ServerError,
  TimeoutError,
  ValidationError,
} from './errors';

// Types
export type {
  ApiErrorResponse,
  ApiRequestConfig,
  ApiResponse,
  AuthTokenResponse,
  LoginCredentials,
  PaginationParams,
  RegistrationData,
  User,
} from './types';

// Services
export { authService } from './services';
