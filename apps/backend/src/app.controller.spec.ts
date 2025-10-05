/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import type { EchoDto } from './dto/echo.dto.js';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('health', () => {
    it('should return health status from service', () => {
      const result = controller.health();

      expect(result).toHaveProperty('ok', true);
      expect(result).toHaveProperty('service', 'api');
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('echo', () => {
    it('should return ok true with echoed DTO', () => {
      const dto: EchoDto = {
        message: 'test message',
        age: 25,
      };

      const result = controller.echo(dto);

      expect(result).toEqual({
        ok: true,
        echo: dto,
      });
    });

    it('should handle DTO without age', () => {
      const dto: EchoDto = {
        message: 'test message',
      };

      const result = controller.echo(dto);

      expect(result).toEqual({
        ok: true,
        echo: dto,
      });
    });
  });
});
