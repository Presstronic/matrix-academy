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

import LoginPage from './LoginPage';

// Mock the API module
vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof ApiModule>('@/lib/api');
  return {
    ...actual,
    authService: {
      ...actual.authService,
      login: vi.fn(),
      getCurrentUser: vi.fn(),
      logout: vi.fn(),
    },
  };
});

// eslint-disable-next-line import/first
import { authService } from '@/lib/api';

const mockLogin = vi.mocked(authService.login);
const mockGetCurrentUser = vi.mocked(authService.getCurrentUser);

function renderWithProviders(ui: ReactNode) {
  return render(
    <BrowserRouter>
      <AuthProvider disableTimers={true}>{ui}</AuthProvider>
    </BrowserRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    mockLogin.mockClear();
    mockGetCurrentUser.mockClear();
    mockGetCurrentUser.mockRejectedValue(new Error('Unauthorized'));
  });

  describe('Rendering', () => {
    it('should render login form', async () => {
      renderWithProviders(<LoginPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    });

    it('should render link to register page', async () => {
      renderWithProviders(<LoginPage />);

      await waitFor(() => {
        const registerLink = screen.getByRole('link', { name: /Register here/i });
        expect(registerLink).toBeInTheDocument();
        expect(registerLink).toHaveAttribute('href', '/register');
      });
    });
  });

  describe('Form Validation', () => {
    it('should show error when email is empty', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /Login/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      });
    });

    it('should show error when email is invalid', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/Email Address/i);
      await user.type(emailInput, 'invalid-email');

      const submitButton = screen.getByRole('button', { name: /Login/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('should show error when password is empty', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/Email Address/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /Login/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
      });
    });

    it('should clear errors when user starts typing', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
      });

      // Submit empty form to get errors
      const submitButton = screen.getByRole('button', { name: /Login/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      });

      // Type in email field
      const emailInput = screen.getByLabelText(/Email Address/i);
      await user.type(emailInput, 'a');

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/Email is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should successfully login with valid credentials', async () => {
      const user = userEvent.setup();
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

      mockLogin.mockResolvedValue({
        user: mockUser,
        expiresIn: 900,
      });

      renderWithProviders(<LoginPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/Email Address/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const submitButton = screen.getByRole('button', { name: /Login/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should display error message when login fails', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValue(new Error('Invalid credentials'));

      renderWithProviders(<LoginPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/Email Address/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const submitButton = screen.getByRole('button', { name: /Login/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('should disable form during submission', async () => {
      const user = userEvent.setup();
      interface LoginResponse {
        user: Record<string, unknown>;
        expiresIn: number;
      }
      let resolveLogin: (value: LoginResponse) => void;
      const loginPromise = new Promise<LoginResponse>((resolve) => {
        resolveLogin = resolve;
      });

      mockLogin.mockReturnValue(loginPromise);

      renderWithProviders(<LoginPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/Email Address/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const submitButton = screen.getByRole('button', { name: /Login/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Logging in.../i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Email Address/i)).toBeDisabled();
        expect(screen.getByLabelText(/Password/i)).toBeDisabled();
      });

      // Resolve the promise and wait for state updates to complete
      resolveLogin!({ user: {}, expiresIn: 900 });
      await waitFor(() => {
        // Wait for the component to finish processing the login
        expect(true).toBe(true);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible form elements', async () => {
      renderWithProviders(<LoginPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      });

      // Email field
      const emailInput = screen.getByLabelText(/Email Address/i);
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('autocomplete', 'email');
      expect(emailInput).toHaveAttribute('required');

      // Password field
      const passwordInput = screen.getByLabelText(/Password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
      expect(passwordInput).toHaveAttribute('required');
    });

    it('should have proper heading hierarchy', async () => {
      renderWithProviders(<LoginPage />);

      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: /Login/i, level: 1 });
        expect(heading).toBeInTheDocument();
      });
    });
  });
});
