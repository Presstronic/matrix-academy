/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { SetMetadata } from '@nestjs/common';

import type { Role } from '../../enums/role.enum.js';

export const ROLES_KEY = 'roles';

/**
 * Decorator to require specific roles for accessing a route
 *
 * @param roles - The roles allowed to access this route
 *
 * @example
 * ```typescript
 * @Roles(Role.ADMIN, Role.SUPER_ADMIN)
 * @Delete('users/:id')
 * deleteUser(@Param('id') id: string) {
 *   return this.usersService.remove(id);
 * }
 * ```
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
