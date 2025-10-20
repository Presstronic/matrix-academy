/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { HomePage } from './HomePage';

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('HomePage', () => {
  describe('Hero Section', () => {
    it('should render main heading', () => {
      renderWithRouter(<HomePage />);

      expect(
        screen.getByRole('heading', { name: /Welcome to Matrix Academy/i, level: 1 }),
      ).toBeInTheDocument();
    });

    it('should render value proposition', () => {
      renderWithRouter(<HomePage />);

      expect(
        screen.getByText(
          /Master the digital realm. Learn to code, collaborate, and create the future./i,
        ),
      ).toBeInTheDocument();
    });

    it('should have Get Started button linking to register', () => {
      renderWithRouter(<HomePage />);

      const getStartedButton = screen.getByRole('link', { name: /Get Started/i });
      expect(getStartedButton).toBeInTheDocument();
      expect(getStartedButton).toHaveAttribute('href', '/register');
    });

    it('should have Login button linking to login', () => {
      renderWithRouter(<HomePage />);

      const loginButton = screen.getByRole('link', { name: /Login/i });
      expect(loginButton).toBeInTheDocument();
      expect(loginButton).toHaveAttribute('href', '/login');
    });
  });

  describe('Features Section', () => {
    it('should render features heading', () => {
      renderWithRouter(<HomePage />);

      expect(
        screen.getByRole('heading', { name: /Why Choose Matrix Academy\?/i }),
      ).toBeInTheDocument();
    });

    it('should render Expert-Led Learning feature', () => {
      renderWithRouter(<HomePage />);

      expect(screen.getByRole('heading', { name: /Expert-Led Learning/i })).toBeInTheDocument();
      expect(
        screen.getByText(/Learn from industry professionals with real-world experience/i),
      ).toBeInTheDocument();
    });

    it('should render Hands-On Projects feature', () => {
      renderWithRouter(<HomePage />);

      expect(screen.getByRole('heading', { name: /Hands-On Projects/i })).toBeInTheDocument();
      expect(
        screen.getByText(
          /Build real applications and portfolios with interactive coding challenges/i,
        ),
      ).toBeInTheDocument();
    });

    it('should render Community Support feature', () => {
      renderWithRouter(<HomePage />);

      expect(screen.getByRole('heading', { name: /Community Support/i })).toBeInTheDocument();
      expect(
        screen.getByText(/Join a vibrant community of learners and get help when you need it/i),
      ).toBeInTheDocument();
    });
  });

  describe('Call to Action Section', () => {
    it('should render CTA heading', () => {
      renderWithRouter(<HomePage />);

      expect(
        screen.getByRole('heading', { name: /Ready to Begin Your Journey\?/i }),
      ).toBeInTheDocument();
    });

    it('should render CTA description', () => {
      renderWithRouter(<HomePage />);

      expect(
        screen.getByText(
          /Join thousands of students learning to master technology and build the future/i,
        ),
      ).toBeInTheDocument();
    });

    it('should have Start Learning Now button linking to register', () => {
      renderWithRouter(<HomePage />);

      const startButton = screen.getByRole('link', { name: /Start Learning Now/i });
      expect(startButton).toBeInTheDocument();
      expect(startButton).toHaveAttribute('href', '/register');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithRouter(<HomePage />);

      // Should have h2 headings for main sections
      const headings = screen.getAllByRole('heading', { level: 2 });
      expect(headings.length).toBeGreaterThan(0);

      // Should have h3 headings for features
      const subheadings = screen.getAllByRole('heading', { level: 3 });
      expect(subheadings).toHaveLength(3); // Three feature cards
    });

    it('should have semantic sections with aria-labelledby', () => {
      const { container } = renderWithRouter(<HomePage />);

      const sections = container.querySelectorAll('section');
      expect(sections.length).toBeGreaterThanOrEqual(3); // Hero, Features, CTA

      // Check that sections have aria-labelledby attributes
      sections.forEach((section) => {
        expect(section).toHaveAttribute('aria-labelledby');
      });
    });
  });
});
