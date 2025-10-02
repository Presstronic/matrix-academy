# Database Documentation

## Overview

Matrix Academy uses PostgreSQL as its primary database with TypeORM as the ORM layer. This document covers database setup, migrations, and best practices.

## Configuration

Database configuration is managed through environment variables defined in `apps/backend/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/matrix_academy
DATABASE_SSL=false
DATABASE_LOGGING=false
```

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `DATABASE_SSL`: Enable SSL for database connections (set to `true` in production)
- `DATABASE_LOGGING`: Enable TypeORM query logging (useful for debugging)

## Connection Settings

The database configuration (`apps/backend/src/config/database.config.ts`) includes:

- **Connection pooling**: Max 10 connections
- **Connection timeout**: 5 seconds
- **Migrations**: Auto-discovery from `src/database/migrations/`
- **Entities**: Auto-discovery using `*.entity.ts` pattern
- **Synchronize**: Disabled (always use migrations)

## Migration Workflow

### Creating a New Migration

1. **Define your entity** in `src/**/*.entity.ts`
2. **Generate migration** based on entity changes:
   ```bash
   cd apps/backend
   pnpm migration:generate src/database/migrations/DescriptiveName
   ```

### Running Migrations

To apply pending migrations:

```bash
cd apps/backend
pnpm migration:run
```

### Reverting Migrations

To revert the last migration:

```bash
cd apps/backend
pnpm migration:revert
```

## Migration Scripts

The following scripts are available in `apps/backend/package.json`:

- `pnpm migration:generate`: Generate a new migration based on entity changes
- `pnpm migration:run`: Run all pending migrations
- `pnpm migration:revert`: Revert the last executed migration

## Best Practices

### Migrations

1. **Never modify existing migrations** that have been run in production
2. **Always test migrations** on a development database first
3. **Write reversible migrations** whenever possible (implement `down()` method)
4. **Use descriptive names** for migrations (e.g., `CreateUsersTable`, `AddEmailIndexToUsers`)
5. **Review generated migrations** before running them

### Entities

1. **Use decorators** for column definitions
2. **Define indexes** for frequently queried columns
3. **Set proper constraints** (nullable, unique, etc.)
4. **Use TypeScript types** for type safety

### Connection Management

1. **Don't manually manage connections** - let NestJS handle it
2. **Use repository pattern** for database operations
3. **Leverage transactions** for multi-step operations
4. **Close connections gracefully** on application shutdown

## Database Schema

### Initial Setup

The initial migration (`1727740800000-InitialMigration.ts`) is empty and serves as a baseline for the migration system. Future migrations will build on this foundation.

## Troubleshooting

### Connection Issues

If you encounter connection errors:

1. Verify PostgreSQL is running
2. Check `DATABASE_URL` format and credentials
3. Ensure the database exists
4. Check network/firewall settings

### Migration Errors

If migrations fail:

1. Check migration order and dependencies
2. Verify entity definitions match migration
3. Review TypeORM logs (`DATABASE_LOGGING=true`)
4. Check for conflicting schema changes

### Docker Compose Environment Switching

When switching between production (`docker-compose.yml`) and development (`docker-compose.dev.yml`) configurations:

1. **Password mismatch**: Production uses `matrix_password`, dev uses `dev_password`
2. **Clean volumes** when switching: `docker compose down -v`
3. **Rebuild containers** after switching: `docker compose up -d --build`

### Hot Reload in Docker (macOS)

**Known Limitation**: File system events don't propagate reliably through Docker volumes on macOS.

**Workaround Options**:

1. **Recommended for active development**: Run backend locally with `pnpm dev` and only databases in Docker
2. **Docker-only development**: Manually restart backend container after code changes: `docker compose restart backend`
3. **Use polling**: The `dev:docker` script attempts to use file polling, but results may vary

## Development Workflow

1. Start PostgreSQL (via Docker Compose or locally)
2. Set environment variables in `.env`
3. Run migrations: `pnpm migration:run`
4. Start the application: `pnpm dev`
5. Application connects automatically on startup

## Production Considerations

1. **Enable SSL**: Set `DATABASE_SSL=true`
2. **Disable logging**: Set `DATABASE_LOGGING=false`
3. **Run migrations** before deploying new code
4. **Backup database** before running migrations
5. **Monitor connection pool** usage and adjust if needed
