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
    name: 'Test User',
  };

  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 3600,
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Setup stateful token mocking
    let currentToken: string | null = null;
    mockGetAuthToken.mockImplementation(() => currentToken);
    mockSetAuthToken.mockImplementation((token: string) => {
      currentToken = token;
    });
    mockRemoveAuthToken.mockImplementation(() => {
      currentToken = null;
    });

    // Clear all other mocks (preserves implementations)
    mockLogin.mockClear();
    mockRegister.mockClear();
    mockLogout.mockClear();
    mockGetCurrentUser.mockClear();
    mockRefreshToken.mockClear();
    mockSetRefreshToken.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider disableTimers={true}>{children}</AuthProvider>
  );

  describe('Initial State', () => {
    it('should initialize with unauthenticated state when no token', async () => {
      mockGetAuthToken.mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should load user when valid token exists', async () => {
      mockGetAuthToken.mockReturnValue('valid-token');
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBeNull();
    });

    it('should clear invalid token on mount', async () => {
      mockGetAuthToken.mockReturnValue('invalid-token');
      mockGetCurrentUser.mockRejectedValue(new Error('Unauthorized'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe('Session expired');
      expect(mockRemoveAuthToken).toHaveBeenCalled();
    });
  });

  describe('Login', () => {
    it('should successfully login with valid credentials', async () => {
      // Mock initial state
      mockGetAuthToken.mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Now setup mocks for login
      mockLogin.mockResolvedValue(mockTokens);
      mockGetCurrentUser.mockResolvedValue(mockUser);

      await act(async () => {
        await result.current.login({ email: 'test@example.com', password: 'password' });
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBeNull();
      expect(mockSetAuthToken).toHaveBeenCalledWith(mockTokens.accessToken);
      expect(mockSetRefreshToken).toHaveBeenCalledWith(mockTokens.refreshToken);
    });

    it('should handle login failure', async () => {
      // Mock initial state
      mockGetAuthToken.mockReturnValue(null);

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
      // Mock initial state
      mockGetAuthToken.mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let resolveLogin: (value: typeof mockTokens) => void;
      const loginPromise = new Promise<typeof mockTokens>((resolve) => {
        resolveLogin = resolve;
      });

      mockLogin.mockReturnValue(loginPromise);
      mockGetCurrentUser.mockResolvedValue(mockUser);

      act(() => {
        void result.current.login({ email: 'test@example.com', password: 'password' });
      });

      // Should be loading immediately
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Resolve login
      act(() => {
        resolveLogin!(mockTokens);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Register', () => {
    it('should successfully register new user', async () => {
      // Mock initial state
      mockGetAuthToken.mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Now setup mocks for register
      mockRegister.mockResolvedValue(mockTokens);
      mockGetCurrentUser.mockResolvedValue(mockUser);

      await act(async () => {
        await result.current.register({
          email: 'new@example.com',
          password: 'password',
          name: 'New User',
        });
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(mockSetAuthToken).toHaveBeenCalledWith(mockTokens.accessToken);
    });

    it('should handle registration failure', async () => {
      // Mock initial state
      mockGetAuthToken.mockReturnValue(null);

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
      // Setup authenticated state
      mockGetAuthToken.mockReturnValue('valid-token');
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
      expect(mockRemoveAuthToken).toHaveBeenCalled();
    });

    it('should clear state even if logout API call fails', async () => {
      // Setup authenticated state
      mockGetAuthToken.mockReturnValue('valid-token');
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
      expect(mockRemoveAuthToken).toHaveBeenCalled();
    });
  });

  describe('Refresh User', () => {
    it('should refresh user data when authenticated', async () => {
      // Setup authenticated state
      mockGetAuthToken.mockReturnValue('valid-token');
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
      mockGetAuthToken.mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(mockGetCurrentUser).toHaveBeenCalledTimes(0);
    });
  });

  describe('useUser Hook', () => {
    it('should return user when authenticated', async () => {
      mockGetAuthToken.mockReturnValue('valid-token');
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current).toEqual(mockUser);
      });
    });

    it('should return null when not authenticated', async () => {
      mockGetAuthToken.mockReturnValue(null);

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
