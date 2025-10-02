/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import type { EnvironmentVariables } from './env.validation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getDatabaseConfig = (
  configService: ConfigService<EnvironmentVariables>,
): TypeOrmModuleOptions => {
  const databaseUrl = configService.get('DATABASE_URL', { infer: true });

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined');
  }

  return {
    type: 'postgres',
    url: databaseUrl,
    ssl: configService.get('DATABASE_SSL', { infer: true })
      ? { rejectUnauthorized: false }
      : false,
    logging: configService.get('DATABASE_LOGGING', { infer: true }) ? ['query', 'error', 'schema'] : false,
    entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
    migrations: [join(__dirname, '..', 'database', 'migrations', '*{.ts,.js}')],
    synchronize: false, // Always use migrations in production
    extra: {
      max: 10,
      connectionTimeoutMillis: 5000,
    },
  };
};
