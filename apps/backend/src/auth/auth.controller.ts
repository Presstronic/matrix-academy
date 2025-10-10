/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file auth.controller.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request } from 'express';

import type { TokenMetadata } from './auth.service.js';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { Public } from './decorators/public.decorator.js';
import type { AuthResponseDto, UserResponseDto } from './dto/auth-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshDto } from './dto/refresh.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Ip() ipAddress: string,
  ): Promise<AuthResponseDto> {
    const metadata: TokenMetadata = {
      userAgent: req.headers['user-agent'],
      ipAddress,
    };

    return this.authService.login(loginDto, metadata);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Body() refreshDto: RefreshDto,
    @Req() req: Request,
    @Ip() ipAddress: string,
  ): Promise<AuthResponseDto> {
    const metadata: TokenMetadata = {
      userAgent: req.headers['user-agent'],
      ipAddress,
    };

    return this.authService.refresh(refreshDto.refreshToken, metadata);
  }

  @SkipThrottle()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(
    @CurrentUser('id') userId: string,
    @Body() refreshDto: RefreshDto,
  ): Promise<void> {
    await this.authService.logout(userId, refreshDto.refreshToken);
  }

  @SkipThrottle()
  @Get('me')
  async getMe(@CurrentUser('id') userId: string): Promise<UserResponseDto> {
    return this.authService.getMe(userId);
  }
}
