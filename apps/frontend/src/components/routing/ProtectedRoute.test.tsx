/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { ProtectedRoute } from './ProtectedRoute';

// Mock the useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute', () => {
  it('should render children when user is authenticated', async () => {
    const { useAuth } = await import('@/hooks/useAuth');
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com' },
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: (
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          ),
        },
      ],
      {
        initialEntries: ['/'],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should not render children when user is not authenticated', async () => {
    const { useAuth } = await import('@/hooks/useAuth');
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    const router = createMemoryRouter(
      [
        {
          path: '/protected',
          element: (
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          ),
        },
      ],
      {
        initialEntries: ['/protected'],
      },
    );

    render(<RouterProvider router={router} />);

    // Should not render protected content when not authenticated
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should not render children with custom redirectTo path', async () => {
    const { useAuth } = await import('@/hooks/useAuth');
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    const router = createMemoryRouter(
      [
        {
          path: '/protected',
          element: (
            <ProtectedRoute redirectTo="/login">
              <div>Protected Content</div>
            </ProtectedRoute>
          ),
        },
      ],
      {
        initialEntries: ['/protected'],
      },
    );

    render(<RouterProvider router={router} />);

    // Should not render protected content when not authenticated, regardless of redirectTo path
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
