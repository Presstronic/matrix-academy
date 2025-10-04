# Authorization & RBAC

This document describes the Role-Based Access Control (RBAC) system implemented in Matrix Academy.

## Overview

The authorization framework provides:

- **JWT-based authentication** - All endpoints require authentication by default
- **Role-Based Access Control (RBAC)** - Fine-grained access control using roles
- **Permission system** - Granular permissions mapped to roles
- **Public endpoints** - Ability to mark specific endpoints as public

## Roles

The system supports four hierarchical roles:

| Role           | Description                                                 |
| -------------- | ----------------------------------------------------------- |
| `SUPER_ADMIN`  | Full system access, can manage all tenants and users        |
| `TENANT_ADMIN` | Manages users, courses, and enrollments within their tenant |
| `USER`         | Standard user with access to courses and own enrollments    |
| `GUEST`        | Read-only access to public courses                          |

### Role Enum

```typescript
enum Role {
  SUPER_ADMIN = 'super_admin',
  TENANT_ADMIN = 'tenant_admin',
  USER = 'user',
  GUEST = 'guest',
}
```

## Permissions

Permissions are granular capabilities that can be checked programmatically:

### User Management

- `CREATE_USER` - Create new users
- `READ_USER` - View user details
- `UPDATE_USER` - Modify user information
- `DELETE_USER` - Remove users

### Tenant Management

- `CREATE_TENANT` - Create new tenants
- `READ_TENANT` - View tenant details
- `UPDATE_TENANT` - Modify tenant settings
- `DELETE_TENANT` - Remove tenants

### Course Management

- `CREATE_COURSE` - Create new courses
- `READ_COURSE` - View course content
- `UPDATE_COURSE` - Modify courses
- `DELETE_COURSE` - Remove courses

### Enrollment Management

- `CREATE_ENROLLMENT` - Enroll users in courses
- `READ_ENROLLMENT` - View enrollment details
- `UPDATE_ENROLLMENT` - Modify enrollments
- `DELETE_ENROLLMENT` - Remove enrollments

### System Administration

- `MANAGE_ROLES` - Manage user roles
- `MANAGE_PERMISSIONS` - Configure permissions
- `VIEW_AUDIT_LOGS` - Access system audit logs

## Role-Permission Mapping

| Permission         | GUEST | USER | TENANT_ADMIN | SUPER_ADMIN |
| ------------------ | ----- | ---- | ------------ | ----------- |
| READ_COURSE        | ✓     | ✓    | ✓            | ✓           |
| CREATE_ENROLLMENT  |       | ✓    | ✓            | ✓           |
| READ_ENROLLMENT    |       | ✓    | ✓            | ✓           |
| READ_USER          |       | ✓    | ✓            | ✓           |
| CREATE_USER        |       |      | ✓            | ✓           |
| UPDATE_USER        |       |      | ✓            | ✓           |
| DELETE_USER        |       |      | ✓            | ✓           |
| CREATE_COURSE      |       |      | ✓            | ✓           |
| UPDATE_COURSE      |       |      | ✓            | ✓           |
| DELETE_COURSE      |       |      | ✓            | ✓           |
| UPDATE_ENROLLMENT  |       |      | ✓            | ✓           |
| DELETE_ENROLLMENT  |       |      | ✓            | ✓           |
| READ_TENANT        |       |      | ✓            | ✓           |
| UPDATE_TENANT      |       |      | ✓            | ✓           |
| CREATE_TENANT      |       |      |              | ✓           |
| DELETE_TENANT      |       |      |              | ✓           |
| MANAGE_ROLES       |       |      |              | ✓           |
| MANAGE_PERMISSIONS |       |      |              | ✓           |
| VIEW_AUDIT_LOGS    |       |      |              | ✓           |

## Usage

### Global Authentication

All endpoints require JWT authentication by default. The `JwtAuthGuard` is applied globally in `app.module.ts`:

```typescript
{
  provide: APP_GUARD,
  useClass: JwtAuthGuard,
}
```

### Public Endpoints

Mark endpoints as public using the `@Public()` decorator:

```typescript
@Public()
@Get('/health')
health() {
  return { status: 'ok' };
}
```

### Role-Based Access

Require specific roles using the `@Roles()` decorator:

```typescript
@Roles(Role.TENANT_ADMIN, Role.SUPER_ADMIN)
@Delete('/users/:id')
deleteUser(@Param('id') id: string) {
  return this.usersService.remove(id);
}
```

### Current User

Access the authenticated user in your controllers:

```typescript
@Get('/profile')
getProfile(@CurrentUser() user: AuthenticatedUser) {
  return this.usersService.findOne(user.id);
}
```

The `AuthenticatedUser` interface provides:

```typescript
interface AuthenticatedUser {
  id: string;
  email: string;
  tenantId?: string;
  roles: string[];
}
```

### Permission Checking

Use the `PermissionsService` to check permissions programmatically:

```typescript
constructor(private permissionsService: PermissionsService) {}

someMethod(@CurrentUser() user: AuthenticatedUser) {
  if (!this.permissionsService.hasPermission(user.roles, Permission.DELETE_USER)) {
    throw new ForbiddenException('Insufficient permissions');
  }

  // Perform action
}
```

Available methods:

- `hasPermission(roles, permission)` - Check single permission
- `hasAnyPermission(roles, permissions)` - Check if user has any of the permissions
- `hasAllPermissions(roles, permissions)` - Check if user has all permissions
- `getUserPermissions(roles)` - Get all permissions for user's roles

## JWT Token Structure

Access tokens should include:

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "tenantId": "tenant-id",
  "roles": ["user", "tenant_admin"],
  "iat": 1234567890,
  "exp": 1234567900
}
```

## Environment Variables

Configure JWT settings in your `.env` file:

```env
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d
```

## Security Considerations

1. **Token Security**
   - Always use HTTPS in production
   - Store tokens securely on the client (httpOnly cookies recommended)
   - Implement token refresh mechanism

2. **Role Assignment**
   - Validate role assignments server-side
   - Never trust client-provided roles
   - Implement role change audit logging

3. **Permission Checks**
   - Always verify permissions on the server
   - Check both role and tenant context where applicable
   - Implement resource-level authorization for multi-tenant isolation

4. **Public Endpoints**
   - Carefully review all `@Public()` decorated endpoints
   - Ensure no sensitive data is exposed
   - Consider rate limiting for public endpoints

## Testing

To test protected endpoints, include a valid JWT token:

```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/protected
```

For public endpoints, no token is required:

```bash
curl http://localhost:3000/health
```

## Future Enhancements

- [ ] Add tests when testing infrastructure is configured
- [ ] Implement attribute-based access control (ABAC)
- [ ] Add permission decorators for method-level checks
- [ ] Implement dynamic permission loading from database
- [ ] Add audit logging for authorization failures
