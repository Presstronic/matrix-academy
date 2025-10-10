/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { AppService } from './app.service.js';

describe('AppService', () => {
  let service: AppService;
  let cacheManager: {
    get: () => Promise<unknown>;
    set: () => Promise<void>;
  };

  beforeEach(async () => {
    cacheManager = {
      get: () => Promise.resolve(null),
      set: () => Promise.resolve(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health check object with ok status', async () => {
      const result = await service.getHealth();

      expect(result).toHaveProperty('ok', true);
      expect(result).toHaveProperty('service', 'api');
      expect(result).toHaveProperty('timestamp');
    });

    it('should return current timestamp in ISO format', async () => {
      const result = await service.getHealth() as { ok: boolean; service: string; timestamp: string };
      const timestamp = new Date(result.timestamp);

      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.toISOString()).toBe(result.timestamp);
    });
  });
});
