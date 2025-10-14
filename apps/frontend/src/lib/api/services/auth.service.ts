/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file Authentication API service
 */
import { get, post } from '../client';
import type { AuthTokenResponse, LoginCredentials, RegistrationData, User } from '../types';

/**
 * Login with email and password
 * Tokens are set as HttpOnly cookies by the server
 */
export async function login(credentials: LoginCredentials): Promise<AuthTokenResponse> {
  return await post<AuthTokenResponse>('/auth/login', credentials);
}

/**
 * Register a new user
 * Tokens are set as HttpOnly cookies by the server
 */
export async function register(data: RegistrationData): Promise<AuthTokenResponse> {
  return await post<AuthTokenResponse>('/auth/register', data);
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
  return await get<User>('/auth/me');
}

/**
 * Refresh authentication token
 * Refresh token is automatically sent via HttpOnly cookie
 */
export async function refreshToken(): Promise<AuthTokenResponse> {
  return await post<AuthTokenResponse>('/auth/refresh');
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
