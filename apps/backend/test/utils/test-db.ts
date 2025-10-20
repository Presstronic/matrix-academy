/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { dirname, join } from 'path';
import type { DataSource } from 'typeorm';
import { DataSource as TypeOrmDataSource } from 'typeorm';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let dataSource: DataSource | null = null;

/**
 * Create an in-memory SQLite database for testing
 */
export const createTestDatabase = async (): Promise<DataSource> => {
  dataSource = new TypeOrmDataSource({
    type: 'better-sqlite3',
    database: ':memory:',
    entities: [join(__dirname, '..', '..', 'src', '**', '*.entity{.ts,.js}')],
    synchronize: true,
    logging: false,
  });

  await dataSource.initialize();

  // Insert default tenant for individual users (mimics migration 1760079600000)
  await dataSource.query(`
    INSERT INTO "tenants" ("id", "name", "slug", "description", "isActive", "createdAt", "updatedAt")
    VALUES (
      '00000000-0000-0000-0000-000000000001',
      'Individual Users',
      'individual',
      'Default tenant for individual user registrations',
      1,
      datetime('now'),
      datetime('now')
    )
  `);

  return dataSource;
};

/**
 * Get the test data source (creates it if not already created)
 */
export const getTestDataSource = async (): Promise<DataSource> => {
  if (!dataSource) {
    await createTestDatabase();
  }
  return dataSource!;
};

/**
 * Close and cleanup the test database
 */
export const closeTestDatabase = async (): Promise<void> => {
  if (dataSource?.isInitialized) {
    await dataSource.destroy();
    dataSource = null;
  }
};

/**
 * Clear all data from database tables
 */
export const clearDatabase = async (): Promise<void> => {
  if (!dataSource?.isInitialized) {
    return;
  }

  // Temporarily disable foreign key constraints for clearing
  await dataSource.query('PRAGMA foreign_keys = OFF');

  try {
    const entities = dataSource.entityMetadatas;

    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.clear();
    }

    // Re-insert the default tenant after clearing
    await dataSource.query(`
      INSERT INTO "tenants" ("id", "name", "slug", "description", "isActive", "createdAt", "updatedAt")
      VALUES (
        '00000000-0000-0000-0000-000000000001',
        'Individual Users',
        'individual',
        'Default tenant for individual user registrations',
        1,
        datetime('now'),
        datetime('now')
      )
    `);
  } finally {
    // Re-enable foreign key constraints
    await dataSource.query('PRAGMA foreign_keys = ON');
  }
};
