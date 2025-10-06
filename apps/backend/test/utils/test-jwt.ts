/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import jwt from 'jsonwebtoken';

import { Role } from '../../src/enums/role.enum.js';

const TEST_JWT_SECRET = 'test-secret-key-for-e2e-tests-only';

export interface TestTokenPayload {
  email: string;
  tenantId?: string;
  roles: readonly Role[];
}

/**
 * Generate a valid JWT token for testing
 */
export const generateTestToken = (payload: TestTokenPayload): string => {
  return jwt.sign(
    {
      sub: payload.email,
      email: payload.email,
      tenantId: payload.tenantId,
      roles: payload.roles,
    },
    TEST_JWT_SECRET,
    { expiresIn: '1h' },
  );
};

/**
 * Generate an expired JWT token for testing
 */
export const generateExpiredToken = (payload: TestTokenPayload): string => {
  return jwt.sign(
    {
      sub: payload.email,
      email: payload.email,
      tenantId: payload.tenantId,
      roles: payload.roles,
    },
    TEST_JWT_SECRET,
    { expiresIn: '-1h' },
  );
};

/**
 * Test user presets
 */
export const TEST_USERS = {
  superAdmin: {
    email: 'super@test.com',
    roles: [Role.SUPER_ADMIN],
  },
  tenantAdmin: {
    email: 'admin@test.com',
    tenantId: 'tenant-123',
    roles: [Role.TENANT_ADMIN],
  },
  user: {
    email: 'user@test.com',
    tenantId: 'tenant-123',
    roles: [Role.USER],
  },
  guest: {
    email: 'guest@test.com',
    roles: [Role.GUEST],
  },
} as const;

/**
 * Get the test JWT secret (exposed for ConfigService mocking)
 */
export const getTestJwtSecret = () => TEST_JWT_SECRET;
