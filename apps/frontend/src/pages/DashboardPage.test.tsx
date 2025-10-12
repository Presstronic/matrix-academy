/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import DashboardPage from './DashboardPage';

describe('DashboardPage', () => {
  it('should render dashboard heading', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/dashboard',
          element: <DashboardPage />,
        },
      ],
      {
        initialEntries: ['/dashboard'],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('should render protected route message', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/dashboard',
          element: <DashboardPage />,
        },
      ],
      {
        initialEntries: ['/dashboard'],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByText(/This is a protected route\. In a real application/i),
    ).toBeInTheDocument();
  });

  it('should have a button to return home', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/dashboard',
          element: <DashboardPage />,
        },
      ],
      {
        initialEntries: ['/dashboard'],
      },
    );

    render(<RouterProvider router={router} />);

    const button = screen.getByRole('button', { name: /Return to Home/i });
    expect(button).toBeInTheDocument();
  });
});
