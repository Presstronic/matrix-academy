/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file auth-response.dto.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

import type { Role } from '../../enums/role.enum.js';

@Exclude()
export class UserResponseDto {
  @ApiProperty({ description: 'User unique identifier', example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  id!: string;

  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @Expose()
  email!: string;

  @ApiProperty({ description: 'User first name', example: 'John', required: false })
  @Expose()
  firstName?: string;

  @ApiProperty({ description: 'User last name', example: 'Doe', required: false })
  @Expose()
  lastName?: string;

  @ApiProperty({ description: 'User roles', example: ['USER'], isArray: true })
  @Expose()
  roles!: Role[];

  @ApiProperty({ description: 'Tenant ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  tenantId!: string;

  @ApiProperty({ description: 'Whether the user account is active', example: true })
  @Expose()
  isActive!: boolean;

  @ApiProperty({ description: 'Email verification timestamp', example: '2025-01-01T00:00:00.000Z', required: false })
  @Expose()
  emailVerifiedAt?: Date;

  @ApiProperty({ description: 'Account creation timestamp', example: '2025-01-01T00:00:00.000Z' })
  @Expose()
  createdAt!: Date;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT access token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ description: 'Refresh token for obtaining new access tokens', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken!: string;

  @ApiProperty({ description: 'User information', type: UserResponseDto })
  user!: UserResponseDto;

  @ApiProperty({ description: 'Access token expiration time in seconds', example: 900 })
  expiresIn!: number;
}
