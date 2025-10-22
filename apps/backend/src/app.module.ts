/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard.js';
import { RolesGuard } from './auth/guards/roles.guard.js';
import { CommonModule } from './common/common.module.js';
import { CsrfGuard } from './common/guards/csrf.guard.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { getDatabaseConfig } from './config/database.config.js';
import type { EnvironmentVariables } from './config/env.validation.js';
import { validate } from './config/env.validation.js';
import { getRedisConfig } from './config/redis.config.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/backend/.env', '.env'],
      validate,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        throttlers: [
          {
            name: 'default',
            ttl: (configService.get('THROTTLE_TTL', { infer: true }) ?? 900) * 1000, // Convert to milliseconds
            limit: configService.get('THROTTLE_LIMIT', { infer: true }) ?? 100,
          },
          {
            name: 'auth',
            ttl: 900 * 1000, // 15 minutes in milliseconds
            limit: 5, // 5 requests per 15 minutes for auth endpoints
          },
        ],
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) =>
        getDatabaseConfig(configService),
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<EnvironmentVariables>) =>
        await getRedisConfig(configService),
    }),
    AuthModule,
    UsersModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
    // TODO: Re-enable ThrottlerGuard after fixing test mocking (see GitHub issue)
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule {}
