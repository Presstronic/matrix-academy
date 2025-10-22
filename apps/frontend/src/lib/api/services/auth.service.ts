/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file Authentication API service
 */
import { get, patch, post } from '../client';
import type {
  ApiResponse,
  AuthTokenResponse,
  LoginCredentials,
  RegistrationData,
  UpdateProfileData,
  User,
} from '../types';

/**
 * Login with email and password
 * Tokens are set as HttpOnly cookies by the server
 */
export async function login(credentials: LoginCredentials): Promise<AuthTokenResponse> {
  const response = await post<ApiResponse<AuthTokenResponse>>('/auth/login', credentials);
  return response.data;
}

/**
 * Register a new user
 * Tokens are set as HttpOnly cookies by the server
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
  const response = await get<ApiResponse<User>>('/auth/me');
  return response.data;
}

/**
 * Refresh authentication token
 * Refresh token is automatically sent via HttpOnly cookie
 */
export async function refreshToken(): Promise<AuthTokenResponse> {
  const response = await post<ApiResponse<AuthTokenResponse>>('/auth/refresh');
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

/**
 * Change password for authenticated user
 */
export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await post('/auth/change-password', data);
}

/**
 * Update user profile
 */
export async function updateProfile(data: UpdateProfileData): Promise<User> {
  const response = await patch<ApiResponse<User>>('/users/profile', data);
  return response.data;
}
