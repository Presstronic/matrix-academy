/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file 1760079600000-CreateTenantAndDefaultOrg.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTenantAndDefaultOrg1760079600000 implements MigrationInterface {
  name = 'CreateTenantAndDefaultOrg1760079600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create tenants table
    await queryRunner.query(`
            CREATE TABLE "tenants" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "slug" character varying(100),
                "isActive" boolean NOT NULL DEFAULT true,
                "description" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_tenants_slug" UNIQUE ("slug"),
                CONSTRAINT "PK_tenants" PRIMARY KEY ("id")
            )
        `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "idx_tenants_name" ON "tenants" ("name")`);
    await queryRunner.query(`CREATE INDEX "idx_tenants_slug" ON "tenants" ("slug")`);

    // Insert default tenant for individual users
    await queryRunner.query(`
            INSERT INTO "tenants" ("id", "name", "slug", "description", "isActive")
            VALUES (
                '00000000-0000-0000-0000-000000000001',
                'Individual Users',
                'individual',
                'Default tenant for individual user registrations',
                true
            )
        `);

    // Add foreign key constraint from users to tenants
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_users_tenant"
            FOREIGN KEY ("tenantId")
            REFERENCES "tenants"("id")
            ON DELETE RESTRICT
            ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_tenant"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "public"."idx_tenants_slug"`);
    await queryRunner.query(`DROP INDEX "public"."idx_tenants_name"`);

    // Drop tenants table
    await queryRunner.query(`DROP TABLE "tenants"`);
  }
}
