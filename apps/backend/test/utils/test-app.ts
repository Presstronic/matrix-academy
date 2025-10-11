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
import { ThrottlerStorageService } from '@nestjs/throttler';
import { getDataSourceToken } from '@nestjs/typeorm';

import { AppModule } from '../../src/app.module.js';
import { RolesGuard } from '../../src/auth/guards/roles.guard.js';
import { getTestDataSource } from './test-db.js';
import { getTestJwtSecret } from './test-jwt.js';

@Injectable()
class MockRolesGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    // Always allow access regardless of roles in tests
    return true;
  }
}

@Injectable()
class MockThrottlerStorage extends ThrottlerStorageService {
  increment(
    _key: string,
    ttl: number,
    _limit: number,
    _blockDuration: number,
    _throttlerName: string,
  ): Promise<{ totalHits: number; timeToExpire: number; isBlocked: false; timeToBlockExpire: number }> {
    // Always return 1 hit (well under any limit) and never blocked
    return Promise.resolve({ totalHits: 1, timeToExpire: ttl, isBlocked: false, timeToBlockExpire: 0 });
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
      get: (key: string, _options?: { infer: true }) => {
        if (key === 'JWT_SECRET') return getTestJwtSecret();
        if (key === 'JWT_EXPIRES_IN') return '15m';
        if (key === 'JWT_REFRESH_SECRET') return getTestJwtSecret() + '_refresh';
        if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
        if (key === 'DATABASE_URL') return ':memory:';
        if (key === 'REDIS_URL') return 'redis://localhost:6379';
        if (key === 'REDIS_TTL') return 300000;
        if (key === 'THROTTLE_TTL') return 900;
        if (key === 'THROTTLE_LIMIT') return 10000;
        return undefined;
      },
      getOrThrow: (key: string) => {
        if (key === 'JWT_SECRET') return getTestJwtSecret();
        if (key === 'JWT_EXPIRES_IN') return '15m';
        if (key === 'JWT_REFRESH_SECRET') return getTestJwtSecret() + '_refresh';
        if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
        if (key === 'DATABASE_URL') return ':memory:';
        if (key === 'REDIS_URL') return 'redis://localhost:6379';
        if (key === 'REDIS_TTL') return 300000;
        if (key === 'THROTTLE_TTL') return 900;
        if (key === 'THROTTLE_LIMIT') return 10000;
        throw new Error(`Config key ${key} not found`);
      },
    })
    .overrideProvider(getDataSourceToken())
    .useValue(testDataSource)
    .overrideProvider(ThrottlerStorageService)
    .useClass(MockThrottlerStorage)
    // Don't mock JwtAuthGuard - let it work normally with real tokens
    .overrideGuard(RolesGuard)
    .useClass(MockRolesGuard)
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
