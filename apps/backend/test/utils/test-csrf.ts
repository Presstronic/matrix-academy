/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { randomBytes } from 'crypto';
import type { Test } from 'supertest';

/**
 * Generate a CSRF token for testing
 */
export const generateCsrfToken = (): string => {
  return randomBytes(32).toString('hex');
};

/**
 * Add CSRF token headers and cookies to a supertest request
 */
export const withCsrf = (request: Test, existingCookies?: string): Test => {
  const csrfToken = generateCsrfToken();
  const cookieValue = existingCookies
    ? `${existingCookies}; csrf_token=${csrfToken}`
    : `csrf_token=${csrfToken}`;

  return request.set('x-csrf-token', csrfToken).set('Cookie', cookieValue);
};
