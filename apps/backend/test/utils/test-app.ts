/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type { CanActivate, ExecutionContext, INestApplication } from '@nestjs/common';
import { Injectable, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { getDataSourceToken } from '@nestjs/typeorm';

import { AppModule } from '../../src/app.module.js';
import { getTestDataSource } from './test-db.js';
import { getTestJwtSecret } from './test-jwt.js';

@Injectable()
class MockThrottlerGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    return true;
  }
}

/**
 * Create a test NestJS application instance
 */
export const createTestApp = async (): Promise<INestApplication> => {
  const testDataSource = await getTestDataSource();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(ConfigService)
    .useValue({
      get: (key: string) => {
        if (key === 'JWT_SECRET') return getTestJwtSecret();
        if (key === 'DATABASE_URL') return ':memory:';
        return undefined;
      },
      getOrThrow: (key: string) => {
        if (key === 'JWT_SECRET') return getTestJwtSecret();
        if (key === 'DATABASE_URL') return ':memory:';
        throw new Error(`Config key ${key} not found`);
      },
    })
    .overrideProvider(getDataSourceToken())
    .useValue(testDataSource)
    .overrideGuard(ThrottlerGuard)
    .useClass(MockThrottlerGuard)
    .compile();

  const app = moduleFixture.createNestApplication();

  // Apply global pipes (same as production)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Disable shutdown hooks for testing
  app.enableShutdownHooks();

  await app.init();
  return app;
};

/**
 * Close and cleanup the test application
 */
export const closeTestApp = async (app: INestApplication): Promise<void> => {
  if (app) {
    await app.close();
  }
};
