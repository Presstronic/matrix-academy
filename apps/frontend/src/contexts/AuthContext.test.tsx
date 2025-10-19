/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file Tests for Authentication Context
 */
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuth, useUser } from '@/hooks/useAuth';
import type * as ApiModule from '@/lib/api';

import { AuthProvider } from './AuthContext';

vi.mock('@/lib/api', async () => {
  // Import the real module so test & provider share ONE instance
  const actual = await vi.importActual<typeof ApiModule>('@/lib/api');

  return {
    ...actual,
    authService: {
      ...actual.authService,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      refreshToken: vi.fn(),
      verifyEmail: vi.fn(),
      requestPasswordReset: vi.fn(),
      resetPassword: vi.fn(),
    },
    getAuthToken: vi.fn(),
    setAuthToken: vi.fn(),
    setRefreshToken: vi.fn(),
    removeAuthToken: vi.fn(),
    getRefreshToken: vi.fn(),
  };
});

// eslint-disable-next-line import/first
import {
  authService,
  getAuthToken,
  removeAuthToken,
  setAuthToken,
  setRefreshToken,
} from '@/lib/api';

// Get references to the mocked functions
const mockLogin = vi.mocked(authService.login);
const mockRegister = vi.mocked(authService.register);
const mockLogout = vi.mocked(authService.logout);
const mockGetCurrentUser = vi.mocked(authService.getCurrentUser);
const mockRefreshToken = vi.mocked(authService.refreshToken);
const mockGetAuthToken = vi.mocked(getAuthToken);
const mockSetAuthToken = vi.mocked(setAuthToken);
const mockSetRefreshToken = vi.mocked(setRefreshToken);
const mockRemoveAuthToken = vi.mocked(removeAuthToken);

describe('AuthContext', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    roles: ['user'],
    tenantId: 'test-tenant',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockAuthResponse = {
    user: mockUser,
    expiresIn: 900,
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Clear all mocks
    mockLogin.mockClear();
    mockRegister.mockClear();
    mockLogout.mockClear();
    mockGetCurrentUser.mockClear();
    mockRefreshToken.mockClear();
    mockGetAuthToken.mockClear();
    mockSetAuthToken.mockClear();
    mockSetRefreshToken.mockClear();
    mockRemoveAuthToken.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider disableTimers={true}>{children}</AuthProvider>
  );

  describe('Initial State', () => {
    it('should initialize with unauthenticated state when no cookies', async () => {
      // No valid cookie - getCurrentUser will fail
      mockGetCurrentUser.mockRejectedValue(new Error('Unauthorized'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should load user when valid cookie exists', async () => {
      // Valid cookie - getCurrentUser succeeds
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBeNull();
    });

    it('should handle invalid cookie on mount', async () => {
      // Invalid cookie - getCurrentUser fails
      mockGetCurrentUser.mockRejectedValue(new Error('Unauthorized'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('Login', () => {
    it('should successfully login with valid credentials', async () => {
      // Mock initial unauthenticated state
      mockGetCurrentUser.mockRejectedValueOnce(new Error('Unauthorized'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Now setup mocks for login - cookies are set by server
      mockLogin.mockResolvedValue(mockAuthResponse);

      await act(async () => {
        await result.current.login({ email: 'test@example.com', password: 'password' });
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBeNull();
      // Tokens are in cookies, not localStorage
      expect(mockSetAuthToken).not.toHaveBeenCalled();
      expect(mockSetRefreshToken).not.toHaveBeenCalled();
    });

    it('should handle login failure', async () => {
      // Mock initial unauthenticated state
      mockGetCurrentUser.mockRejectedValueOnce(new Error('Unauthorized'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const loginError = new Error('Invalid credentials');
      mockLogin.mockRejectedValue(loginError);

      await act(async () => {
        try {
          await result.current.login({ email: 'test@example.com', password: 'wrong' });
        } catch {
          // Expected error
        }
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Invalid credentials');
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should set loading state during login', async () => {
      // Mock initial unauthenticated state
      mockGetCurrentUser.mockRejectedValueOnce(new Error('Unauthorized'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let resolveLogin: (value: typeof mockAuthResponse) => void;
      const loginPromise = new Promise<typeof mockAuthResponse>((resolve) => {
        resolveLogin = resolve;
      });

      mockLogin.mockReturnValue(loginPromise);

      act(() => {
        void result.current.login({ email: 'test@example.com', password: 'password' });
      });

      // Should be loading immediately
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Resolve login
      act(() => {
        resolveLogin!(mockAuthResponse);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Register', () => {
    it('should successfully register new user', async () => {
      // Mock initial unauthenticated state
      mockGetCurrentUser.mockRejectedValueOnce(new Error('Unauthorized'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Now setup mocks for register - cookies are set by server
      mockRegister.mockResolvedValue(mockAuthResponse);

      await act(async () => {
        await result.current.register({
          email: 'new@example.com',
          password: 'password',
          firstName: 'New',
          lastName: 'User',
          tenantId: 'test-tenant',
        });
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.user).toEqual(mockUser);
      // Tokens are in cookies, not localStorage
      expect(mockSetAuthToken).not.toHaveBeenCalled();
    });

    it('should handle registration failure', async () => {
      // Mock initial unauthenticated state
      mockGetCurrentUser.mockRejectedValueOnce(new Error('Unauthorized'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const registerError = new Error('Email already exists');
      mockRegister.mockRejectedValue(registerError);

      await act(async () => {
        try {
          await result.current.register({
            email: 'existing@example.com',
            password: 'password',
            firstName: 'Test',
            lastName: 'User',
            tenantId: 'test-tenant',
          });
        } catch {
          // Expected error
        }
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Email already exists');
      });

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Logout', () => {
    it('should successfully logout user', async () => {
      // Setup authenticated state with valid cookie
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockLogout.mockResolvedValue();

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeNull();
      expect(mockLogout).toHaveBeenCalled();
      // Cookies are cleared by server, not client
      expect(mockRemoveAuthToken).not.toHaveBeenCalled();
    });

    it('should clear state even if logout API call fails', async () => {
      // Setup authenticated state with valid cookie
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockLogout.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });

      expect(result.current.user).toBeNull();
      // Cookies are cleared by server, not client
      expect(mockRemoveAuthToken).not.toHaveBeenCalled();
    });
  });

  describe('Refresh User', () => {
    it('should refresh user data when authenticated', async () => {
      // Setup authenticated state with valid cookie
      mockGetCurrentUser.mockResolvedValueOnce(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockGetCurrentUser.mockResolvedValueOnce(updatedUser);

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(result.current.user).toEqual(updatedUser);
    });

    it('should do nothing when not authenticated', async () => {
      // No valid cookie
      mockGetCurrentUser.mockRejectedValueOnce(new Error('Unauthorized'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshUser();
      });

      // Only called once during initialization, not again during refreshUser
      expect(mockGetCurrentUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('useUser Hook', () => {
    it('should return user when authenticated', async () => {
      // Valid cookie
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current).toEqual(mockUser);
      });
    });

    it('should return null when not authenticated', async () => {
      // No valid cookie
      mockGetCurrentUser.mockRejectedValue(new Error('Unauthorized'));

      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current).toBeNull();
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useAuth is used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {
        // Intentionally empty to suppress error output
      });

      try {
        renderHook(() => useAuth());
        // If we get here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect((error as Error).message).toContain('useAuth must be used within an AuthProvider');
      }

      consoleError.mockRestore();
    });
  });
});
