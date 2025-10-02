/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1727740800000 implements MigrationInterface {
  public async up(_queryRunner: QueryRunner): Promise<void> {
    // Initial empty migration to test migration setup
    // Future migrations will be generated using: pnpm migration:generate
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Nothing to revert in initial migration
  }
}
