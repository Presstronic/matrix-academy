/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file Authentication API service
 */
import { post } from '../client';
import type {
  ApiResponse,
  AuthTokenResponse,
  LoginCredentials,
  RegistrationData,
  User,
} from '../types';

/**
 * Login with email and password
 */
export async function login(credentials: LoginCredentials): Promise<AuthTokenResponse> {
  const response = await post<ApiResponse<AuthTokenResponse>>('/auth/login', credentials);
  return response.data;
}

/**
 * Register a new user
 */
export async function register(data: RegistrationData): Promise<AuthTokenResponse> {
  const response = await post<ApiResponse<AuthTokenResponse>>('/auth/register', data);
  return response.data;
}

/**
 * Logout the current user
 */
export async function logout(): Promise<void> {
  await post('/auth/logout');
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<User> {
  const response = await post<ApiResponse<User>>('/auth/me');
  return response.data;
}

/**
 * Refresh authentication token
 */
export async function refreshToken(refreshToken: string): Promise<AuthTokenResponse> {
  const response = await post<ApiResponse<AuthTokenResponse>>('/auth/refresh', {
    refreshToken,
  });
  return response.data;
}

/**
 * Verify email address
 */
export async function verifyEmail(token: string): Promise<void> {
  await post('/auth/verify-email', { token });
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<void> {
  await post('/auth/forgot-password', { email });
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await post('/auth/reset-password', { token, password: newPassword });
}
