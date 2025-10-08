/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file Script to generate test JWT tokens for manual API testing
 */
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-e2e-tests-only';

const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  TENANT_ADMIN: 'TENANT_ADMIN',
  USER: 'USER',
  GUEST: 'GUEST',
};

const generateToken = (payload) => {
  return jwt.sign(
    {
      sub: payload.email,
      email: payload.email,
      tenantId: payload.tenantId,
      roles: payload.roles,
    },
    JWT_SECRET,
    { expiresIn: '1h' },
  );
};

// Parse command line arguments
const args = process.argv.slice(2);
const roleArg = args[0]?.toLowerCase();

// Predefined test users
const testUsers = {
  superadmin: {
    email: 'super@test.com',
    roles: [Role.SUPER_ADMIN],
  },
  admin: {
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
};

// Generate token based on argument or default to user
const selectedUser = roleArg && roleArg in testUsers
  ? testUsers[roleArg]
  : testUsers.user;

const token = generateToken(selectedUser);

console.log('\n=== Test JWT Token Generated ===');
console.log(`User: ${selectedUser.email}`);
console.log(`Roles: ${selectedUser.roles.join(', ')}`);
if (selectedUser.tenantId) {
  console.log(`Tenant ID: ${selectedUser.tenantId}`);
}
console.log('\nToken:');
console.log(token);
console.log('\nExport as environment variable:');
console.log(`export TOKEN="${token}"`);
console.log('\nOr use directly in curl:');
console.log(`curl -X POST http://localhost:3000/echo \\`);
console.log(`  -H "Authorization: Bearer ${token}" \\`);
console.log(`  -H "Content-Type: application/json" \\`);
console.log(`  -d '{"message": "Hello World"}' | jq`);
console.log('\n');
