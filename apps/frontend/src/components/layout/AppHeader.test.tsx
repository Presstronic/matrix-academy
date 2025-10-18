/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '@/contexts/AuthContext';
import type * as ApiModule from '@/lib/api';

import { AppHeader } from './AppHeader';

// Create a mockable useMediaQuery
const mockUseMediaQuery = vi.fn(() => false); // Default to desktop

// Mock MUI useMediaQuery
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    useMediaQuery: () => mockUseMediaQuery(),
  };
});

// Mock the API module
vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof ApiModule>('@/lib/api');
  return {
    ...actual,
    authService: {
      ...actual.authService,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
    },
  };
});

// eslint-disable-next-line import/first
import { authService } from '@/lib/api';

const mockGetCurrentUser = vi.mocked(authService.getCurrentUser);
const mockLogout = vi.mocked(authService.logout);

function renderWithProviders(ui: ReactNode) {
  return render(
    <BrowserRouter>
      <AuthProvider disableTimers={true}>{ui}</AuthProvider>
    </BrowserRouter>,
  );
}

describe('AppHeader', () => {
  beforeEach(() => {
    mockGetCurrentUser.mockClear();
    mockLogout.mockClear();
    mockUseMediaQuery.mockReturnValue(false); // Default to desktop view
  });

  describe('Unauthenticated State', () => {
    beforeEach(() => {
      mockGetCurrentUser.mockRejectedValue(new Error('Unauthorized'));
    });

    it('should render Matrix Academy branding', async () => {
      renderWithProviders(<AppHeader />);

      await waitFor(() => {
        expect(screen.getByText('MATRIX ACADEMY')).toBeInTheDocument();
      });
    });

    it('should display Login and Register buttons', async () => {
      renderWithProviders(<AppHeader />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
      });

      expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
    });

    it('should link to login page', async () => {
      renderWithProviders(<AppHeader />);

      await waitFor(() => {
        const loginLink = screen.getByRole('link', { name: /login/i });
        expect(loginLink).toHaveAttribute('href', '/login');
      });
    });

    it('should link to register page', async () => {
      renderWithProviders(<AppHeader />);

      await waitFor(() => {
        const registerLink = screen.getByRole('link', { name: /register/i });
        expect(registerLink).toHaveAttribute('href', '/register');
      });
    });

    it('should have accessible navigation menu button on mobile', async () => {
      mockUseMediaQuery.mockReturnValue(true);
      renderWithProviders(<AppHeader />);

      await waitFor(() => {
        const menuButton = screen.getByLabelText('navigation menu');
        expect(menuButton).toBeInTheDocument();
        expect(menuButton).toHaveAttribute('aria-haspopup', 'true');
      });
    });
  });

  describe('Authenticated State', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      roles: ['user'],
      tenantId: 'test-tenant',
      isActive: true,
      createdAt: new Date(),
    };

    beforeEach(() => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
    });

    it('should display Dashboard and Logout buttons', async () => {
      renderWithProviders(<AppHeader />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });

    it('should link to dashboard page', async () => {
      renderWithProviders(<AppHeader />);

      await waitFor(() => {
        const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
        expect(dashboardLink).toHaveAttribute('href', '/dashboard');
      });
    });

    it('should call logout when logout button is clicked', async () => {
      const user = userEvent.setup();
      mockLogout.mockResolvedValue();

      renderWithProviders(<AppHeader />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
      });

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      await user.click(logoutButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
      });
    });
  });

  describe('Mobile Menu', () => {
    beforeEach(() => {
      mockGetCurrentUser.mockRejectedValue(new Error('Unauthorized'));
      mockUseMediaQuery.mockReturnValue(true); // Enable mobile view for these tests
    });

    it('should open menu when menu button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<AppHeader />);

      await waitFor(() => {
        expect(screen.getByLabelText('navigation menu')).toBeInTheDocument();
      });

      const menuButton = screen.getByLabelText('navigation menu');
      await user.click(menuButton);

      await waitFor(() => {
        const menu = screen.getByRole('menu');
        expect(menu).toBeInTheDocument();
      });
    });

    it('should close menu when menu item is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<AppHeader />);

      await waitFor(() => {
        expect(screen.getByLabelText('navigation menu')).toBeInTheDocument();
      });

      const menuButton = screen.getByLabelText('navigation menu');
      await user.click(menuButton);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      const loginMenuItem = screen.getByRole('menuitem', { name: /login/i });
      await user.click(loginMenuItem);

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockGetCurrentUser.mockRejectedValue(new Error('Unauthorized'));
      mockUseMediaQuery.mockReturnValue(true); // Enable mobile view for these tests
    });

    it('should have header landmark', async () => {
      renderWithProviders(<AppHeader />);

      await waitFor(() => {
        const header = screen.getByRole('banner');
        expect(header).toBeInTheDocument();
      });
    });

    it('should have properly labeled navigation elements', async () => {
      renderWithProviders(<AppHeader />);

      await waitFor(() => {
        const menuButton = screen.getByLabelText('navigation menu');
        expect(menuButton).toHaveAttribute('aria-controls', 'menu-appbar');
      });
    });
  });
});
