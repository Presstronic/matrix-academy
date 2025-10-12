/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import NotFoundPage from './NotFoundPage';

describe('NotFoundPage', () => {
  it('should render 404 heading', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/404',
          element: <NotFoundPage />,
        },
      ],
      {
        initialEntries: ['/404'],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
  });

  it('should render not found message', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/404',
          element: <NotFoundPage />,
        },
      ],
      {
        initialEntries: ['/404'],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(
      screen.getByText('The page you are looking for does not exist or has been moved.'),
    ).toBeInTheDocument();
  });

  it('should have a button to return home', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/404',
          element: <NotFoundPage />,
        },
      ],
      {
        initialEntries: ['/404'],
      },
    );

    render(<RouterProvider router={router} />);

    const button = screen.getByRole('button', { name: /Return to Home/i });
    expect(button).toBeInTheDocument();
  });
});
