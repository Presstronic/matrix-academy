/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file refresh.dto.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({
    description: 'Refresh token to exchange for new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
