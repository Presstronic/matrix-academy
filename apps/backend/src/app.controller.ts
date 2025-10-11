/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AppService } from './app.service.js';
import { Public } from './auth/decorators/public.decorator.js';
import { EchoDto } from './dto/echo.dto.js';

@ApiTags('Application')
@Controller()
export class AppController {
  constructor(private readonly app: AppService) {}

  @Public()
  @Get('/health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() {
    return this.app.getHealth();
  }

  @Post('/echo')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Echo endpoint for testing' })
  @ApiResponse({ status: 200, description: 'Echo response returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  echo(@Body() dto: EchoDto) {
    // thanks to transform:true, age arrives as a number if provided as a string
    return { ok: true, echo: dto };
  }
}
