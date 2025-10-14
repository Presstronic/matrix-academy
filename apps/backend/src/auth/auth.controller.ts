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
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request, Response } from 'express';

import { CsrfService } from '../common/services/csrf.service.js';
import type { TokenMetadata } from './auth.service.js';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { Public } from './decorators/public.decorator.js';
import type {
  AuthResponseDto,
  InternalAuthResponse,
  UserResponseDto,
} from './dto/auth-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly csrfService: CsrfService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const authData = await this.authService.register(registerDto);
    this.setAuthCookies(res, authData);
    return { user: authData.user, expiresIn: authData.expiresIn };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Ip() ipAddress: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const metadata: TokenMetadata = {
      userAgent: req.headers['user-agent'],
      ipAddress,
    };

    const authData = await this.authService.login(loginDto, metadata);
    this.setAuthCookies(res, authData);
    return { user: authData.user, expiresIn: authData.expiresIn };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(
    @Req() req: Request,
    @Ip() ipAddress: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const refreshToken = req.cookies?.refresh_token as string;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const metadata: TokenMetadata = {
      userAgent: req.headers['user-agent'],
      ipAddress,
    };

    const authData = await this.authService.refresh(refreshToken, metadata);
    this.setAuthCookies(res, authData);
    return { user: authData.user, expiresIn: authData.expiresIn };
  }

  @SkipThrottle()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  @ApiResponse({ status: 204, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @CurrentUser('id') userId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const refreshToken = req.cookies?.refresh_token as string;
    if (refreshToken) {
      await this.authService.logout(userId, refreshToken);
    }
    this.clearAuthCookies(res);
  }

  @SkipThrottle()
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({ status: 200, description: 'User information retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser('id') userId: string): Promise<UserResponseDto> {
    return this.authService.getMe(userId);
  }

  /**
   * Set authentication cookies (access token, refresh token, and CSRF token)
   */
  private setAuthCookies(res: Response, authData: InternalAuthResponse): void {
    const isProduction = process.env.NODE_ENV === 'production';

    // Set access token cookie (HttpOnly, 15 minutes)
    res.cookie('access_token', authData.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: authData.expiresIn * 1000, // Convert to milliseconds
      path: '/',
    });

    // Set refresh token cookie (HttpOnly, 7 days)
    res.cookie('refresh_token', authData.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      path: '/',
    });

    // Generate and set CSRF token (NOT HttpOnly - JS needs to read it)
    const csrfToken = this.csrfService.generateToken();
    res.cookie('csrf_token', csrfToken, {
      httpOnly: false, // Frontend needs to read this
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // Match refresh token lifetime
      path: '/',
    });
  }

  /**
   * Clear all authentication cookies
   */
  private clearAuthCookies(res: Response): void {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    res.clearCookie('csrf_token', { path: '/' });
  }
}
