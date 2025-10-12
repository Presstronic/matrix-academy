/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('should render the Matrix ASCII art', () => {
    const { container } = render(<HomePage />);

    // The ASCII art is in a pre element with box drawing characters
    const preElement = container.querySelector('pre');
    expect(preElement).toBeInTheDocument();
    expect(preElement?.textContent).toContain('╔══');
    expect(preElement?.textContent).toContain('The Matrix Has You');
  });

  it('should render the tech stack description', () => {
    render(<HomePage />);

    expect(
      screen.getByText(/React 18 \+ TypeScript \+ Vite \+ Material-UI \+ React Router/i),
    ).toBeInTheDocument();
  });

  it('should render the counter button with initial count of 0', () => {
    render(<HomePage />);

    expect(screen.getByRole('button', { name: /Follow the White Rabbit: 0/i })).toBeInTheDocument();
  });

  it('should increment counter when button is clicked', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    const button = screen.getByRole('button', { name: /Follow the White Rabbit: 0/i });

    await user.click(button);
    expect(screen.getByRole('button', { name: /Follow the White Rabbit: 1/i })).toBeInTheDocument();

    await user.click(button);
    expect(screen.getByRole('button', { name: /Follow the White Rabbit: 2/i })).toBeInTheDocument();
  });

  it('should render HMR instruction', () => {
    render(<HomePage />);

    expect(
      screen.getByText(/Edit src\/pages\/HomePage.tsx and save to test HMR/i),
    ).toBeInTheDocument();
  });
});
