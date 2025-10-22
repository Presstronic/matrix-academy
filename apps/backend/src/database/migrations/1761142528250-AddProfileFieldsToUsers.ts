/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file 1761142528250-AddProfileFieldsToUsers.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfileFieldsToUsers1761142528250 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add username column with unique constraint and index
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "username" VARCHAR(50) NULL UNIQUE
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_users_username" ON "users" ("username")
    `);

    // Add phoneNumber column
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "phoneNumber" VARCHAR(20) NULL
    `);

    // Add bio column
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "bio" VARCHAR(500) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove bio column
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "bio"
    `);

    // Remove phoneNumber column
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "phoneNumber"
    `);

    // Drop username index and column
    await queryRunner.query(`
      DROP INDEX "idx_users_username"
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "username"
    `);
  }
}
