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

  const entities = dataSource.entityMetadatas;

  for (const entity of entities) {
    const repository = dataSource.getRepository(entity.name);
    await repository.clear();
  }
};
