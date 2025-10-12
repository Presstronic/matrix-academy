/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { vi } from 'vitest';

interface TestRouterOptions {
  initialEntries?: string[];
  initialIndex?: number;
}

/**
 * Renders a component with a test router
 */
export function renderWithRouter(
  ui: ReactElement,
  { initialEntries = ['/'], initialIndex = 0 }: TestRouterOptions = {},
  renderOptions?: RenderOptions,
) {
  const router = createMemoryRouter(
    [
      {
        path: '*',
        element: ui,
      },
    ],
    {
      initialEntries,
      initialIndex,
    },
  );

  return {
    ...render(<RouterProvider router={router} />, renderOptions),
    router,
  };
}

/**
 * Creates a mock navigate function for testing
 */
export function createMockNavigate() {
  return vi.fn();
}
