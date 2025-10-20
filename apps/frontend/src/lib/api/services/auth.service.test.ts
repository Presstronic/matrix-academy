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

  // Helper to wrap response in API envelope
  const wrapInEnvelope = <T>(data: T) => ({
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      correlationId: 'test-correlation-id',
      version: '1.0',
    },
  });

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('login', () => {
    it('should successfully login with credentials', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const authResponse = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
        },
        expiresIn: 900,
      };

      mock.onPost('/auth/login', credentials).reply(200, wrapInEnvelope(authResponse));

      const result = await authService.login(credentials);

      expect(result).toEqual(authResponse);
      expect(result.user.email).toBe('test@example.com');
      expect(result.expiresIn).toBe(900);
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
        firstName: 'New',
        lastName: 'User',
      };
      const authResponse = {
        user: {
          id: '2',
          email: 'new@example.com',
          firstName: 'New',
          lastName: 'User',
          roles: ['user'],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        expiresIn: 900,
      };

      mock.onPost('/auth/register', registrationData).reply(201, wrapInEnvelope(authResponse));

      const result = await authService.register(registrationData);

      expect(result).toEqual(authResponse);
      expect(result.user.email).toBe('new@example.com');
    });

    it('should handle registration validation errors', async () => {
      const registrationData = {
        email: 'invalid-email',
        password: '123',
        firstName: 'Test',
        lastName: 'User',
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
      const user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };

      mock.onGet('/auth/me').reply(200, wrapInEnvelope(user));

      const result = await authService.getCurrentUser();

      expect(result).toEqual(user);
      expect(result.email).toBe('test@example.com');
    });

    it('should handle unauthorized access', async () => {
      mock.onGet('/auth/me').reply(401, {
        message: 'Unauthorized',
        statusCode: 401,
      });

      await expect(authService.getCurrentUser()).rejects.toThrow();
    });
  });

  describe('refreshToken', () => {
    it('should refresh authentication token', async () => {
      const authResponse = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
        },
        expiresIn: 900,
      };

      // Refresh token is sent via HttpOnly cookie, not in body
      mock.onPost('/auth/refresh').reply(200, wrapInEnvelope(authResponse));

      const result = await authService.refreshToken();

      expect(result).toEqual(authResponse);
      expect(result.user.email).toBe('test@example.com');
      expect(result.expiresIn).toBe(900);
    });

    it('should handle invalid refresh token', async () => {
      mock.onPost('/auth/refresh').reply(401, {
        message: 'Invalid refresh token',
        statusCode: 401,
      });

      await expect(authService.refreshToken()).rejects.toThrow();
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
