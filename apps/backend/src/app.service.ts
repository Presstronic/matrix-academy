/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file app.service.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return { ok: true, service: 'api', timestamp: new Date().toISOString() };
  }
}
