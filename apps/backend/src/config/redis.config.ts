/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file redis.config.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
import type { CacheModuleOptions } from '@nestjs/cache-manager';
import type { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

import type { EnvironmentVariables } from './env.validation.js';

export const getRedisConfig = async (
  configService: ConfigService<EnvironmentVariables>,
): Promise<CacheModuleOptions> => {
  const redisUrl = configService.get('REDIS_URL', { infer: true });

  if (!redisUrl) {
    throw new Error('REDIS_URL is not defined');
  }

  return {
    store: await redisStore({
      url: redisUrl,
      ttl: configService.get('REDIS_TTL', { infer: true }) ?? 300000, // 5 minutes default
    }),
    isGlobal: true,
  };
};
