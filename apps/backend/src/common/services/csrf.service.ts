/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file CSRF token service
 */
import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class CsrfService {
  /**
   * Generate a new CSRF token
   */
  generateToken(): string {
    return randomBytes(32).toString('hex');
  }
}
