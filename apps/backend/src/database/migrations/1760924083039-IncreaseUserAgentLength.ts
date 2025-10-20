/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file 1760924083039-IncreaseUserAgentLength.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class IncreaseUserAgentLength1760924083039 implements MigrationInterface {
  name = 'IncreaseUserAgentLength1760924083039';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_tenant"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "userAgent"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "userAgent" character varying(500)`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_c58f7e88c286e5e3478960a998b" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_c58f7e88c286e5e3478960a998b"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "userAgent"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "userAgent" character varying(100)`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_users_tenant" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }
}
