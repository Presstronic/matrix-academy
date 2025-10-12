/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('should return isAuthenticated as false by default', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should return user as null by default', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
  });

  it('should provide login function', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.login).toBeDefined();
    expect(typeof result.current.login).toBe('function');
  });

  it('should provide logout function', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.logout).toBeDefined();
    expect(typeof result.current.logout).toBe('function');
  });

  it('should reject login attempts with error message', async () => {
    const { result } = renderHook(() => useAuth());

    await expect(result.current.login('test@example.com', 'password')).rejects.toThrow(
      'Authentication not yet implemented',
    );
  });

  it('should not throw error when calling logout', () => {
    const { result } = renderHook(() => useAuth());

    expect(() => result.current.logout()).not.toThrow();
  });
});
