/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file 1761143299654-MakeUsernameRequired.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeUsernameRequired1761143299654 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, generate usernames for any existing users that don't have one
    // Generate username from email (part before @) with a random suffix if needed
    await queryRunner.query(`
      UPDATE "users"
      SET "username" = LOWER(REGEXP_REPLACE(SPLIT_PART("email", '@', 1), '[^a-zA-Z0-9]', '', 'g')) || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6)
      WHERE "username" IS NULL
    `);

    // Now make the column NOT NULL
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "username" SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert username column to nullable
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "username" DROP NOT NULL
    `);
  }
}
