/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { AppService } from './app.service.js';
import { EchoDto } from './dto/echo.dto.js';

@Controller()
export class AppController {
  constructor(private readonly app: AppService) {}

  @Get('/health')
  health() {
    return this.app.getHealth();
  }

  @Post('/echo')
  @HttpCode(HttpStatus.OK)
  echo(@Body() dto: EchoDto) {
    // thanks to transform:true, age arrives as a number if provided as a string
    return { ok: true, echo: dto };
  }
}
