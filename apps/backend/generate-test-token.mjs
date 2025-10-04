/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file Generate test JWT token for manual testing
 */
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
dotenv.config({ path: join(__dirname, '.env') });

const secret = process.env.JWT_SECRET;

// Generate token for different roles
const roles = process.argv[2]?.split(',') || ['user'];

const token = jwt.sign(
  {
    sub: 'test-user-123',
    email: 'test@example.com',
    tenantId: 'tenant-456',
    roles: roles,
  },
  secret,
  { expiresIn: '1h' }
);

if (!secret) {
  console.error('ERROR: JWT_SECRET not found in .env file');
  process.exit(1);
}

console.log('\n=== Test JWT Token ===');
console.log('Roles:', roles.join(', '));
console.log('Token:', token);
console.log('\nUsage:');
console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:3000/echo -X POST -H "Content-Type: application/json" -d '{"message":"test"}'`);
console.log('');
