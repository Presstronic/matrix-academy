/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

// Load environment variables
config({ path: ['apps/backend/.env', '.env'] });

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  logging: process.env.DATABASE_LOGGING === 'true',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
