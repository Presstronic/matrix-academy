/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file auth.module.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CsrfService } from '../common/services/csrf.service.js';
import { RefreshToken, User } from '../database/entities/index.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { PermissionsService } from './services/permissions.service.js';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User, RefreshToken])],
  controllers: [AuthController],
  providers: [AuthService, PermissionsService, CsrfService],
  exports: [AuthService, PermissionsService],
})
export class AuthModule {}
