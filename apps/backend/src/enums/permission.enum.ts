/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file Permission enumeration for RBAC system
 */
/**
 * Granular permissions in the system
 */
export enum Permission {
  // User management
  CREATE_USER = 'create:user',
  READ_USER = 'read:user',
  UPDATE_USER = 'update:user',
  DELETE_USER = 'delete:user',

  // Tenant management
  CREATE_TENANT = 'create:tenant',
  READ_TENANT = 'read:tenant',
  UPDATE_TENANT = 'update:tenant',
  DELETE_TENANT = 'delete:tenant',

  // Course management
  CREATE_COURSE = 'create:course',
  READ_COURSE = 'read:course',
  UPDATE_COURSE = 'update:course',
  DELETE_COURSE = 'delete:course',

  // Enrollment management
  CREATE_ENROLLMENT = 'create:enrollment',
  READ_ENROLLMENT = 'read:enrollment',
  UPDATE_ENROLLMENT = 'update:enrollment',
  DELETE_ENROLLMENT = 'delete:enrollment',

  // System administration
  MANAGE_ROLES = 'manage:roles',
  MANAGE_PERMISSIONS = 'manage:permissions',
  VIEW_AUDIT_LOGS = 'view:audit_logs',
}
