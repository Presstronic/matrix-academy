/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file storage.module.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
import { Module } from '@nestjs/common';

import { S3StorageService } from './s3-storage.service.js';

/**
 * Storage module providing file upload/download functionality
 * Note: ConfigService is available via global ConfigModule in AppModule
 */
@Module({
  providers: [
    {
      provide: 'STORAGE_SERVICE',
      useClass: S3StorageService,
    },
  ],
  exports: ['STORAGE_SERVICE'],
})
export class StorageModule {}
