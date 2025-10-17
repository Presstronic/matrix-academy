/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { CanActivate, ExecutionContext, INestApplication } from '@nestjs/common';
import { Injectable, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ThrottlerStorageService } from '@nestjs/throttler';
import { getDataSourceToken } from '@nestjs/typeorm';
import type { Cache } from 'cache-manager';
import type { RedisStore } from 'cache-manager-redis-yet';
import cookieParser from 'cookie-parser';

import { AppModule } from '../../src/app.module.js';
import { RolesGuard } from '../../src/auth/guards/roles.guard.js';
import { CsrfGuard } from '../../src/common/guards/csrf.guard.js';
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
class MockCSRFGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(_context: ExecutionContext): boolean {
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
  ): Promise<{
    totalHits: number;
    timeToExpire: number;
    isBlocked: false;
    timeToBlockExpire: number;
  }> {
    // Always return 1 hit (well under any limit) and never blocked
    return Promise.resolve({
      totalHits: 1,
      timeToExpire: ttl,
      isBlocked: false,
      timeToBlockExpire: 0,
    });
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
    .overrideProvider(RolesGuard)
    .useClass(MockRolesGuard)
    .overrideProvider(CsrfGuard)
    .useClass(MockCSRFGuard)
    .compile();

  const app = moduleFixture.createNestApplication();

  // Enable cookie parser
  app.use(cookieParser());

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

export const closeTestApp = async (app: INestApplication): Promise<void> => {
  if (!app) return;

  try {
    const cache = app.get<Cache>(CACHE_MANAGER, { strict: false });

    // Narrow to the Redis store used by cache-manager-redis-yet
    const redisStore = cache.stores?.[0] as unknown as RedisStore;

    // Derive the client type from the store to avoid cross-package type conflicts
    type RedisClientFromStore = RedisStore['client'];

    const client: RedisClientFromStore | undefined = redisStore?.client;

    if (client && typeof client.quit === 'function') {
      await client.quit();
    } else if (client && typeof (client as { disconnect?: () => void }).disconnect === 'function') {
      (client as { disconnect: () => void }).disconnect();
    }
  } catch {
    // swallow in tests
  }

  await app.close();
};
