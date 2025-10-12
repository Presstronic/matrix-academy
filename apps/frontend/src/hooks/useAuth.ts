/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { useState } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; email: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

/**
 * Authentication hook
 * TODO: Implement real authentication logic when auth system is ready
 */
export function useAuth(): AuthState {
  const [isAuthenticated] = useState(false);
  const [user] = useState<{ id: string; email: string } | null>(null);

  const login = (_email: string, _password: string) => {
    // TODO: Implement login logic
    return Promise.reject(new Error('Authentication not yet implemented'));
  };

  const logout = () => {
    // TODO: Implement logout logic
  };

  return {
    isAuthenticated,
    user,
    login,
    logout,
  };
}
