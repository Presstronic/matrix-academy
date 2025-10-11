/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file register.dto.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'newuser@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'SecureP@ssw0rd',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'Tenant ID for multi-tenancy',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  tenantId!: string;
}
