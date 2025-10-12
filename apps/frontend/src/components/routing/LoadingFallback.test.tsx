/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LoadingFallback } from './LoadingFallback';

describe('LoadingFallback', () => {
  it('should render loading text', () => {
    render(<LoadingFallback />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should have correct styling for centering', () => {
    const { container } = render(<LoadingFallback />);
    const div = container.firstChild as HTMLElement;

    expect(div).toHaveStyle({
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    });
  });
});
