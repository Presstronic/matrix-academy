/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file app.service.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';

import { CACHE_TTL, getHealthCacheKey } from './common/constants/cache-keys.js';

@Injectable()
export class AppService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async getHealth() {
    const cacheKey = getHealthCacheKey();
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    const health = { ok: true, service: 'api', timestamp: new Date().toISOString() };
    await this.cacheManager.set(cacheKey, health, CACHE_TTL.HEALTH);

    return health;
  }
}
