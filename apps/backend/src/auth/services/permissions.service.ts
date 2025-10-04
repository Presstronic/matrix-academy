/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file Permission checking service
 */
import { Injectable } from '@nestjs/common';

import { Permission } from '../../enums/permission.enum.js';
import { Role } from '../../enums/role.enum.js';

/**
 * Service for checking user permissions based on roles
 */
@Injectable()
export class PermissionsService {
  /**
   * Role-to-permissions mapping
   */
  private readonly rolePermissions: Record<Role, Permission[]> = {
    [Role.SUPER_ADMIN]: [
      // Super admin has all permissions
      ...Object.values(Permission),
    ],
    [Role.TENANT_ADMIN]: [
      // User management within tenant
      Permission.CREATE_USER,
      Permission.READ_USER,
      Permission.UPDATE_USER,
      Permission.DELETE_USER,

      // Tenant read/update (own tenant)
      Permission.READ_TENANT,
      Permission.UPDATE_TENANT,

      // Course management within tenant
      Permission.CREATE_COURSE,
      Permission.READ_COURSE,
      Permission.UPDATE_COURSE,
      Permission.DELETE_COURSE,

      // Enrollment management
      Permission.CREATE_ENROLLMENT,
      Permission.READ_ENROLLMENT,
      Permission.UPDATE_ENROLLMENT,
      Permission.DELETE_ENROLLMENT,
    ],
    [Role.USER]: [
      // Read own user data
      Permission.READ_USER,

      // Read courses
      Permission.READ_COURSE,

      // Manage own enrollments
      Permission.CREATE_ENROLLMENT,
      Permission.READ_ENROLLMENT,
    ],
    [Role.GUEST]: [
      // Read only access to public courses
      Permission.READ_COURSE,
    ],
  };

  /**
   * Check if a user with given roles has a specific permission
   *
   * @param userRoles - Array of user's roles
   * @param requiredPermission - The permission to check
   * @returns true if user has the permission
   */
  hasPermission(userRoles: string[], requiredPermission: Permission): boolean {
    return userRoles.some((role) => {
      const permissions = this.rolePermissions[role as Role];
      return permissions?.includes(requiredPermission) ?? false;
    });
  }

  /**
   * Check if a user has any of the required permissions
   *
   * @param userRoles - Array of user's roles
   * @param requiredPermissions - Array of permissions (user needs at least one)
   * @returns true if user has any of the required permissions
   */
  hasAnyPermission(userRoles: string[], requiredPermissions: Permission[]): boolean {
    return requiredPermissions.some((permission) => this.hasPermission(userRoles, permission));
  }

  /**
   * Check if a user has all of the required permissions
   *
   * @param userRoles - Array of user's roles
   * @param requiredPermissions - Array of permissions (user needs all)
   * @returns true if user has all required permissions
   */
  hasAllPermissions(userRoles: string[], requiredPermissions: Permission[]): boolean {
    return requiredPermissions.every((permission) => this.hasPermission(userRoles, permission));
  }

  /**
   * Get all permissions for a user based on their roles
   *
   * @param userRoles - Array of user's roles
   * @returns Array of all permissions the user has
   */
  getUserPermissions(userRoles: string[]): Permission[] {
    const permissions = new Set<Permission>();

    userRoles.forEach((role) => {
      const rolePerms = this.rolePermissions[role as Role];
      if (rolePerms) {
        rolePerms.forEach((perm) => permissions.add(perm));
      }
    });

    return Array.from(permissions);
  }
}
