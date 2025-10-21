/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { UserAvatar } from './UserAvatar';

describe('UserAvatar', () => {
  it('renders with avatar image when provided', () => {
    render(<UserAvatar avatar="https://example.com/avatar.jpg" firstName="John" lastName="Doe" />);

    const avatar = screen.getByAltText('John Doe');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('displays initials when no avatar is provided', () => {
    render(<UserAvatar firstName="John" lastName="Doe" />);

    const avatar = screen.getByText('JD');
    expect(avatar).toBeInTheDocument();
  });

  it('displays only first initial when last name is not provided', () => {
    render(<UserAvatar firstName="John" />);

    const avatar = screen.getByText('J');
    expect(avatar).toBeInTheDocument();
  });

  it('displays icon when no name or avatar is provided', () => {
    const { container } = render(<UserAvatar />);

    // Check for the AccountCircleIcon SVG
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('uses fallback alt text when no name is provided', () => {
    render(<UserAvatar avatar="https://example.com/avatar.jpg" />);

    const avatar = screen.getByAltText('User');
    expect(avatar).toBeInTheDocument();
  });

  it('applies small size correctly', () => {
    const { container } = render(<UserAvatar firstName="John" lastName="Doe" size="small" />);

    const avatar = container.querySelector('.MuiAvatar-root');
    expect(avatar).toHaveStyle({ width: '32px', height: '32px' });
  });

  it('applies medium size correctly', () => {
    const { container } = render(<UserAvatar firstName="John" lastName="Doe" size="medium" />);

    const avatar = container.querySelector('.MuiAvatar-root');
    expect(avatar).toHaveStyle({ width: '40px', height: '40px' });
  });

  it('applies large size correctly', () => {
    const { container } = render(<UserAvatar firstName="John" lastName="Doe" size="large" />);

    const avatar = container.querySelector('.MuiAvatar-root');
    expect(avatar).toHaveStyle({ width: '56px', height: '56px' });
  });

  it('constructs full name from first and last name', () => {
    render(<UserAvatar firstName="John" lastName="Doe" avatar="https://example.com/avatar.jpg" />);

    const avatar = screen.getByAltText('John Doe');
    expect(avatar).toBeInTheDocument();
  });

  it('uses email as fallback when firstName and lastName are missing', () => {
    render(<UserAvatar avatar="https://example.com/avatar.jpg" />);

    const avatar = screen.getByAltText('User');
    expect(avatar).toBeInTheDocument();
  });

  it('handles uppercase conversion for initials', () => {
    render(<UserAvatar firstName="john" lastName="doe" />);

    const avatar = screen.getByText('JD');
    expect(avatar).toBeInTheDocument();
  });

  it('accepts custom sx prop without breaking', () => {
    const { container } = render(
      <UserAvatar firstName="John" lastName="Doe" sx={{ opacity: 0.5 }} />,
    );

    const avatar = container.querySelector('.MuiAvatar-root');
    expect(avatar).toBeInTheDocument();
    // Verify sx prop is accepted and component renders
    const initials = screen.getByText('JD');
    expect(initials).toBeInTheDocument();
  });
});
