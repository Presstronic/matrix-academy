/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { getDatabaseConfig } from './config/database.config.js';
import type { EnvironmentVariables} from './config/env.validation.js';
import { validate } from './config/env.validation.js';

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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
