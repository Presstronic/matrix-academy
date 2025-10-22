/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file auth.service.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Repository } from 'typeorm';
import { LessThan } from 'typeorm';

import type { EnvironmentVariables } from '../config/env.validation.js';
import { RefreshToken, User } from '../database/entities/index.js';
import { Role } from '../enums/role.enum.js';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { TenantService } from '../tenant/tenant.service.js';
import type { InternalAuthResponse } from './dto/auth-response.dto.js';
import { UserResponseDto } from './dto/auth-response.dto.js';
import type { ChangePasswordDto } from './dto/change-password.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private configService: ConfigService<EnvironmentVariables>,
    private tenantService: TenantService,
  ) {}

  async register(registerDto: RegisterDto): Promise<InternalAuthResponse> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Check if username is already taken
    const existingUsername = await this.userRepository.findOne({
      where: { username: registerDto.username },
    });

    if (existingUsername) {
      throw new BadRequestException('Username is already taken');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, this.SALT_ROUNDS);

    // Get default tenant for individual users
    const defaultTenantId = await this.tenantService.getDefaultTenantId();

    const user = this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      username: registerDto.username,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      tenantId: defaultTenantId,
      roles: [Role.USER],
      isActive: true,
    });

    const savedUser = await this.userRepository.save(user);

    return this.generateAuthResponse(savedUser);
  }

  async login(loginDto: LoginDto, metadata?: TokenMetadata): Promise<InternalAuthResponse> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    return this.generateAuthResponse(user, metadata);
  }

  async refresh(
    refreshTokenString: string,
    metadata?: TokenMetadata,
  ): Promise<InternalAuthResponse> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshTokenString },
      relations: ['user'],
    });

    if (!refreshToken || refreshToken.isRevoked) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (new Date() > refreshToken.expiresAt) {
      throw new UnauthorizedException('Refresh token expired');
    }

    if (!refreshToken.user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Revoke old refresh token (token rotation)
    refreshToken.isRevoked = true;
    refreshToken.revokedAt = new Date();
    await this.refreshTokenRepository.save(refreshToken);

    return this.generateAuthResponse(refreshToken.user, metadata);
  }

  async logout(userId: string, refreshTokenString: string): Promise<void> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshTokenString, userId },
    });

    if (refreshToken && !refreshToken.isRevoked) {
      refreshToken.isRevoked = true;
      refreshToken.revokedAt = new Date();
      await this.refreshTokenRepository.save(refreshToken);
    }
  }

  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return plainToInstance(UserResponseDto, user);
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Check if new password is different
    const isSamePassword = await bcrypt.compare(changePasswordDto.newPassword, user.password);

    if (isSamePassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, this.SALT_ROUNDS);

    // Update password
    user.password = hashedPassword;
    await this.userRepository.save(user);

    // Invalidate all existing refresh tokens for security
    await this.refreshTokenRepository.update(
      { userId },
      { isRevoked: true, revokedAt: new Date() },
    );
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.refreshTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }

  private async generateAuthResponse(
    user: User,
    metadata?: TokenMetadata,
  ): Promise<InternalAuthResponse> {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user, metadata);

    const userResponse = plainToInstance(UserResponseDto, user);

    const expiresIn = this.parseExpirationToSeconds(
      this.configService.get('JWT_EXPIRES_IN', { infer: true })!,
    );

    return {
      accessToken,
      refreshToken: refreshToken.token,
      user: userResponse,
      expiresIn,
    };
  }

  private generateAccessToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      tenantId: user.tenantId,
    };

    const secret: string = this.configService.get('JWT_SECRET', { infer: true })!;
    const expiresIn = this.configService.get('JWT_EXPIRES_IN', { infer: true })!;

    return jwt.sign(payload, secret, { expiresIn } as SignOptions);
  }

  private async generateRefreshToken(user: User, metadata?: TokenMetadata): Promise<RefreshToken> {
    const payload = {
      sub: user.id,
      type: 'refresh',
      jti: crypto.randomUUID(), // Unique identifier for this token
    };

    const secret: string = this.configService.get('JWT_REFRESH_SECRET', { infer: true })!;
    const expiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN', { infer: true })!;

    const token = jwt.sign(payload, secret, { expiresIn } as SignOptions);

    const expiresAt = new Date();
    const expirationSeconds = this.parseExpirationToSeconds(expiresIn);
    expiresAt.setSeconds(expiresAt.getSeconds() + expirationSeconds);

    const refreshToken = this.refreshTokenRepository.create({
      token,
      userId: user.id,
      expiresAt,
      userAgent: metadata?.userAgent,
      ipAddress: metadata?.ipAddress,
    });

    return this.refreshTokenRepository.save(refreshToken);
  }

  private parseExpirationToSeconds(expiration: string): number {
    const regex = /^(\d+)([smhd])$/;
    const match = regex.exec(expiration);
    if (!match) {
      throw new Error(`Invalid expiration format: ${expiration}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 60 * 60 * 24;
      default:
        throw new Error(`Unknown time unit: ${unit}`);
    }
  }
}

export interface TokenMetadata {
  userAgent?: string;
  ipAddress?: string;
}
