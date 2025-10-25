/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file Authentication hooks
 */
import { useContext } from 'react';

import { AuthContext, type AuthContextValue } from '@/contexts/AuthContext';
import type { User } from '@/lib/api';

/**
 * Hook to access authentication context
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook to access user data (convenience hook)
 */
export function useUser(): User | null {
  const { user } = useAuth();
  return user;
}
