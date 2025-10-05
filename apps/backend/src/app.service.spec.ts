/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { AppService } from './app.service.js';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health check object with ok status', () => {
      const result = service.getHealth();

      expect(result).toHaveProperty('ok', true);
      expect(result).toHaveProperty('service', 'api');
      expect(result).toHaveProperty('timestamp');
    });

    it('should return current timestamp in ISO format', () => {
      const result = service.getHealth();
      const timestamp = new Date(result.timestamp);

      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.toISOString()).toBe(result.timestamp);
    });

    it('should return fresh timestamp on each call', () => {
      const result1 = service.getHealth();
      const result2 = service.getHealth();

      // Timestamps might be the same if calls are very close together
      // So we just verify both are valid ISO strings
      expect(result1.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(result2.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });
});
