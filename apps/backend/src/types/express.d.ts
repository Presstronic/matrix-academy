/**
 * @file Express type extensions
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
