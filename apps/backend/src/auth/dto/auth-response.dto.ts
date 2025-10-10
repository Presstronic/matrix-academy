/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file auth-response.dto.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
import { Exclude, Expose } from 'class-transformer';

import type { Role } from '../../enums/role.enum.js';

@Exclude()
export class UserResponseDto {
  @Expose()
  id!: string;

  @Expose()
  email!: string;

  @Expose()
  firstName?: string;

  @Expose()
  lastName?: string;

  @Expose()
  roles!: Role[];

  @Expose()
  tenantId!: string;

  @Expose()
  isActive!: boolean;

  @Expose()
  emailVerifiedAt?: Date;

  @Expose()
  createdAt!: Date;
}

export class AuthResponseDto {
  accessToken!: string;
  refreshToken!: string;
  user!: UserResponseDto;
  expiresIn!: number;
}
