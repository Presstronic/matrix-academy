/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file 1761017160535-AddAvatarToUsers.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAvatarToUsers1761017160535 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add avatar column to users table
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "avatar" VARCHAR(500) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove avatar column from users table
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "avatar"
    `);
  }
}
