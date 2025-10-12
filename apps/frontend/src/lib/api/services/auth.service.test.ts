/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file Tests for authentication service
 */
import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { apiClient } from '../client';
import * as authService from './auth.service';

describe('Auth Service', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('login', () => {
    it('should successfully login with credentials', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const tokenResponse = {
        data: {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
          expiresIn: 3600,
        },
      };

      mock.onPost('/auth/login', credentials).reply(200, tokenResponse);

      const result = await authService.login(credentials);

      expect(result).toEqual(tokenResponse.data);
      expect(result.accessToken).toBe('test-access-token');
    });

    it('should handle login failure', async () => {
      const credentials = { email: 'test@example.com', password: 'wrong' };

      mock.onPost('/auth/login').reply(401, {
        message: 'Invalid credentials',
        statusCode: 401,
      });

      await expect(authService.login(credentials)).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registrationData = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      };
      const tokenResponse = {
        data: {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
        },
      };

      mock.onPost('/auth/register', registrationData).reply(201, tokenResponse);

      const result = await authService.register(registrationData);

      expect(result).toEqual(tokenResponse.data);
    });

    it('should handle registration validation errors', async () => {
      const registrationData = {
        email: 'invalid-email',
        password: '123',
      };

      mock.onPost('/auth/register').reply(400, {
        message: 'Validation failed',
        statusCode: 400,
      });

      await expect(authService.register(registrationData)).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      mock.onPost('/auth/logout').reply(200);

      await expect(authService.logout()).resolves.not.toThrow();
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user profile', async () => {
      const userResponse = {
        data: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
        },
      };

      mock.onPost('/auth/me').reply(200, userResponse);

      const result = await authService.getCurrentUser();

      expect(result).toEqual(userResponse.data);
      expect(result.email).toBe('test@example.com');
    });

    it('should handle unauthorized access', async () => {
      mock.onPost('/auth/me').reply(401, {
        message: 'Unauthorized',
        statusCode: 401,
      });

      await expect(authService.getCurrentUser()).rejects.toThrow();
    });
  });

  describe('refreshToken', () => {
    it('should refresh authentication token', async () => {
      const refreshToken = 'old-refresh-token';
      const tokenResponse = {
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expiresIn: 3600,
        },
      };

      mock.onPost('/auth/refresh', { refreshToken }).reply(200, tokenResponse);

      const result = await authService.refreshToken(refreshToken);

      expect(result).toEqual(tokenResponse.data);
      expect(result.accessToken).toBe('new-access-token');
    });

    it('should handle invalid refresh token', async () => {
      mock.onPost('/auth/refresh').reply(401, {
        message: 'Invalid refresh token',
        statusCode: 401,
      });

      await expect(authService.refreshToken('invalid-token')).rejects.toThrow();
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with token', async () => {
      const token = 'verification-token';

      mock.onPost('/auth/verify-email', { token }).reply(200);

      await expect(authService.verifyEmail(token)).resolves.not.toThrow();
    });

    it('should handle invalid verification token', async () => {
      mock.onPost('/auth/verify-email').reply(400, {
        message: 'Invalid token',
        statusCode: 400,
      });

      await expect(authService.verifyEmail('invalid-token')).rejects.toThrow();
    });
  });

  describe('requestPasswordReset', () => {
    it('should request password reset', async () => {
      const email = 'test@example.com';

      mock.onPost('/auth/forgot-password', { email }).reply(200);

      await expect(authService.requestPasswordReset(email)).resolves.not.toThrow();
    });

    it('should handle non-existent email', async () => {
      mock.onPost('/auth/forgot-password').reply(404, {
        message: 'User not found',
        statusCode: 404,
      });

      await expect(authService.requestPasswordReset('nonexistent@example.com')).rejects.toThrow();
    });
  });

  describe('resetPassword', () => {
    it('should reset password with token', async () => {
      const token = 'reset-token';
      const newPassword = 'newPassword123';

      mock.onPost('/auth/reset-password', { token, password: newPassword }).reply(200);

      await expect(authService.resetPassword(token, newPassword)).resolves.not.toThrow();
    });

    it('should handle invalid reset token', async () => {
      mock.onPost('/auth/reset-password').reply(400, {
        message: 'Invalid or expired token',
        statusCode: 400,
      });

      await expect(authService.resetPassword('invalid-token', 'newPassword')).rejects.toThrow();
    });
  });
});
