/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file update-profile.dto.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(50, { message: 'First name must be less than 50 characters' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(50, { message: 'Last name must be less than 50 characters' })
  lastName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]{3,50}$/, {
    message: 'Username must be 3-50 characters (letters, numbers, underscore, hyphen)',
  })
  username?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Please enter a valid phone number',
  })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Bio must be less than 500 characters' })
  bio?: string;
}
