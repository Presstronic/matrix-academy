/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { Module } from '@nestjs/common';

import { CsrfService } from './services/csrf.service.js';

@Module({
  providers: [CsrfService],
  exports: [CsrfService],
})
export class CommonModule {}
