/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file Authentication Context for managing user authentication state
 */
import type { ReactNode } from 'react';
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  authService,
  type AuthTokenResponse,
  type LoginCredentials,
  type RegistrationData,
  type User,
} from '@/lib/api';

/**
 * Authentication state
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Authentication context value
 */
export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;
}

/**
 * Token refresh configuration
 */
const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes before expiry
const SESSION_CHECK_INTERVAL = 60 * 1000; // Check every minute

/**
 * Create authentication context
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Export AuthContext for use in custom hooks
 */
export { AuthContext };

/**
 * Authentication provider props
 */
interface AuthProviderProps {
  children: ReactNode;
  /** Disable automatic token refresh and session checks (for testing) */
  disableTimers?: boolean;
}

/**
 * Authentication provider component
 */
export function AuthProvider({ children, disableTimers = false }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionCheckTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Clear all timers
   */
  const clearTimers = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    if (sessionCheckTimerRef.current) {
      clearInterval(sessionCheckTimerRef.current);
      sessionCheckTimerRef.current = null;
    }
  }, []);

  /**
   * Logout user - clears cookies on server and local state
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout errors, still clear local state
    } finally {
      clearTimers();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, [clearTimers]);

  /**
   * Set up automatic token refresh
   * Tokens are stored in HttpOnly cookies and automatically included in requests
   */
  const setupTokenRefresh = useCallback(
    (expiresIn?: number) => {
      clearTimers();

      // Skip timer setup if disabled (e.g., in tests)
      if (disableTimers) {
        return;
      }

      // If expiresIn is provided, schedule refresh 5 minutes before expiry
      if (expiresIn) {
        const refreshDelay = Math.max(expiresIn * 1000 - TOKEN_REFRESH_INTERVAL, 60000); // At least 1 minute
        refreshTimerRef.current = setTimeout(() => {
          void (async () => {
            try {
              // Refresh token is automatically sent via cookie
              const response = await authService.refreshToken();
              // Update user with refreshed data
              setState((prev) => ({
                ...prev,
                user: response.user,
              }));
              // Schedule next refresh
              setupTokenRefresh(response.expiresIn);
            } catch {
              // Token refresh failed, logout user
              void logout();
            }
          })();
        }, refreshDelay);
      }

      // Set up periodic session check by pinging the /me endpoint
      sessionCheckTimerRef.current = setInterval(() => {
        void (async () => {
          try {
            // Check if session is still valid by fetching current user
            await authService.getCurrentUser();
          } catch {
            // Session expired or invalid, logout
            setState((currentState) => {
              if (currentState.isAuthenticated) {
                void logout();
                return {
                  user: null,
                  isAuthenticated: false,
                  isLoading: false,
                  error: 'Session expired',
                };
              }
              return currentState;
            });
          }
        })();
      }, SESSION_CHECK_INTERVAL);
    },
    [clearTimers, disableTimers, logout],
  );

  /**
   * Load user from current session
   * Checks if authentication cookies exist by attempting to fetch user
   */
  const loadUser = useCallback(async () => {
    try {
      // Try to fetch user - if cookies are valid, this will succeed
      const user = await authService.getCurrentUser();
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      setupTokenRefresh();
    } catch {
      // No valid session (cookies expired or missing)
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, [setupTokenRefresh]);

  /**
   * Initialize authentication state on mount
   */
  useEffect(() => {
    void loadUser();

    return () => {
      clearTimers();
    };
  }, [loadUser, clearTimers]);

  /**
   * Login with credentials
   * Tokens are set as HttpOnly cookies by the server
   */
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response: AuthTokenResponse = await authService.login(credentials);

        setState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        setupTokenRefresh(response.expiresIn);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Login failed';
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: errorMessage,
        });
        throw error;
      }
    },
    [setupTokenRefresh],
  );

  /**
   * Register new user
   * Tokens are set as HttpOnly cookies by the server
   */
  const register = useCallback(
    async (data: RegistrationData) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response: AuthTokenResponse = await authService.register(data);

        setState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        setupTokenRefresh(response.expiresIn);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Registration failed';
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: errorMessage,
        });
        throw error;
      }
    },
    [setupTokenRefresh],
  );

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async () => {
    if (!state.isAuthenticated) {
      return;
    }

    try {
      const user = await authService.getCurrentUser();
      setState((prev) => ({
        ...prev,
        user,
      }));
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // Don't logout on refresh failure, just keep current state
    }
  }, [state.isAuthenticated]);

  /**
   * Update user data directly (e.g., after profile update)
   */
  const setUser = useCallback((user: User) => {
    setState((prev) => ({
      ...prev,
      user,
    }));
  }, []);

  /**
   * Memoize context value to prevent unnecessary re-renders
   */
  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      register,
      logout,
      refreshUser,
      setUser,
    }),
    [state, login, register, logout, refreshUser, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
