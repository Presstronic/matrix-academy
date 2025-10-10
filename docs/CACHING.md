# Caching Documentation

## Overview

Matrix Academy uses Redis for distributed caching to improve application performance and reduce database load. This document covers cache setup, usage patterns, and best practices.

## Configuration

Caching is configured through environment variables defined in `apps/backend/.env`:

```env
REDIS_URL=redis://localhost:6379
REDIS_TTL=300000  # Default TTL in milliseconds (5 minutes)
```

### Environment Variables

- `REDIS_URL`: Redis connection string
- `REDIS_TTL`: Default time-to-live for cache entries in milliseconds

## Architecture

### Cache Module

The application uses `@nestjs/cache-manager` with `cache-manager-redis-yet` as the Redis store adapter. The cache is configured globally in `app.module.ts` and can be injected into any service.

### Configuration File

Redis configuration is located in `apps/backend/src/config/redis.config.ts` and includes:

- **Connection**: Uses `REDIS_URL` from environment
- **Default TTL**: Configurable via `REDIS_TTL` (defaults to 5 minutes)
- **Global scope**: Cache manager is available throughout the application

## Cache Keys

Cache keys are centrally defined in `apps/backend/src/common/constants/cache-keys.ts`:

```typescript
export const CACHE_KEYS = {
  USER: 'user',
  HEALTH: 'health',
} as const;

export const CACHE_TTL = {
  USER: 300000, // 5 minutes
  HEALTH: 60000, // 1 minute
  DEFAULT: 300000, // 5 minutes
} as const;
```

### Key Naming Convention

- Use prefixes for resource types (e.g., `user:`, `health:`)
- Include relevant identifiers (e.g., `user:123`, `user:email@example.com`)
- Use helper functions for consistency (e.g., `getUserCacheKey(userId)`)

## Caching Strategies

### 1. Service-Level Caching

Individual services can implement caching for specific operations:

```typescript
@Injectable()
export class AppService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getHealth() {
    const cacheKey = getHealthCacheKey();
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    const health = {
      /* compute health */
    };
    await this.cacheManager.set(cacheKey, health, CACHE_TTL.HEALTH);

    return health;
  }
}
```

**Use cases:**

- Database query results
- External API responses
- Expensive computations
- User profile lookups

### 2. HTTP Response Caching

The `HttpCacheInterceptor` automatically caches GET request responses:

```typescript
@UseInterceptors(HttpCacheInterceptor)
@Get('/users')
getUsers() {
  // Response automatically cached
}
```

**Behavior:**

- Only caches GET requests
- Cache key includes user ID and URL
- Respects default TTL from configuration

### 3. Manual Cache Management

For fine-grained control, use the `CacheInvalidationService`:

```typescript
@Injectable()
export class UserService {
  constructor(private cacheInvalidation: CacheInvalidationService) {}

  async updateUser(userId: string, data: UpdateUserDto) {
    // Update user in database
    await this.userRepository.update(userId, data);

    // Invalidate cache
    await this.cacheInvalidation.invalidateUserCache(userId);
  }
}
```

## Cache Invalidation

### Strategies

1. **Time-based expiration**: All cache entries have TTL
2. **Event-based invalidation**: Invalidate on updates/deletes
3. **Pattern-based invalidation**: Clear multiple related keys

### Invalidation Service

`CacheInvalidationService` provides methods for cache invalidation:

- `invalidateUserCache(userId)`: Clear single user cache
- `invalidateUsersCache(userIds)`: Clear multiple user caches
- `invalidatePattern(pattern)`: Clear all keys matching pattern
- `clearAllCache()`: Clear entire cache (use with caution)

### When to Invalidate

- **Create operations**: Usually no invalidation needed
- **Update operations**: Invalidate affected resources
- **Delete operations**: Invalidate affected resources
- **Bulk operations**: Invalidate all affected resources

## Health Checks

### Redis Health Indicator

`RedisHealthIndicator` provides health check functionality:

```typescript
@Injectable()
export class RedisHealthIndicator implements HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    // Tests Redis read/write operations
  }
}
```

**Health check includes:**

- Connection test
- Write operation test
- Read operation test
- Cleanup of test data

## Cache TTL Guidelines

| Resource Type  | TTL       | Rationale                                    |
| -------------- | --------- | -------------------------------------------- |
| Health checks  | 1 minute  | Frequently accessed, quick to recompute      |
| User data      | 5 minutes | Balance between freshness and load reduction |
| Static content | 1 hour    | Rarely changes                               |
| API responses  | 5 minutes | Default for most endpoints                   |

## Best Practices

### Caching

1. **Cache appropriate data**: Expensive queries, external API calls, computed results
2. **Set reasonable TTLs**: Balance freshness vs. performance
3. **Use structured keys**: Follow naming conventions for consistency
4. **Monitor cache hit rates**: Track effectiveness of caching strategy
5. **Handle cache failures gracefully**: Application should work without cache

### Cache Keys

1. **Use constants**: Define keys in `cache-keys.ts`
2. **Include version info**: For cache schema changes (e.g., `user:v2:123`)
3. **Namespace by tenant**: If multi-tenant (e.g., `tenant:5:user:123`)
4. **Avoid sensitive data**: Don't include passwords or tokens in keys

### Invalidation

1. **Invalidate on writes**: Update, delete operations
2. **Batch invalidations**: Use `invalidateUsersCache()` for multiple keys
3. **Pattern matching**: Use sparingly (expensive operation)
4. **Log invalidations**: Track for debugging and monitoring

### Performance

1. **Avoid over-caching**: Don't cache data that changes frequently
2. **Set appropriate TTLs**: Too long = stale data, too short = reduced benefit
3. **Use compression**: For large cached values (implement as needed)
4. **Monitor memory usage**: Redis memory consumption

## Common Patterns

### Cache-Aside (Lazy Loading)

```typescript
async getData(id: string) {
  // Try cache first
  const cached = await this.cacheManager.get(cacheKey);
  if (cached) return cached;

  // Cache miss - fetch from source
  const data = await this.repository.findOne(id);

  // Store in cache
  await this.cacheManager.set(cacheKey, data, TTL);

  return data;
}
```

### Write-Through

```typescript
async updateData(id: string, data: UpdateDto) {
  // Update source
  const updated = await this.repository.update(id, data);

  // Update cache
  await this.cacheManager.set(cacheKey, updated, TTL);

  return updated;
}
```

### Write-Behind (Invalidation)

```typescript
async updateData(id: string, data: UpdateDto) {
  // Update source
  const updated = await this.repository.update(id, data);

  // Invalidate cache (will be populated on next read)
  await this.cacheInvalidation.invalidateUserCache(id);

  return updated;
}
```

## Development

### Local Setup

1. Start Redis (via Docker Compose):

   ```bash
   docker compose up -d redis
   ```

2. Verify Redis connection:

   ```bash
   redis-cli ping
   ```

3. Monitor cache operations:
   ```bash
   redis-cli monitor
   ```

### Testing

1. **Unit tests**: Mock `CACHE_MANAGER` for service tests
2. **Integration tests**: Use test Redis instance
3. **E2E tests**: Verify cache behavior in full application

### Debugging

```bash
# View all keys
redis-cli keys "*"

# Get cache value
redis-cli get "user:123"

# Delete specific key
redis-cli del "user:123"

# Flush all cache
redis-cli flushall
```

## Production Considerations

1. **Use Redis Cluster**: For high availability and scalability
2. **Enable persistence**: Configure RDB or AOF for data durability
3. **Set maxmemory policy**: Use `allkeys-lru` for automatic eviction
4. **Monitor metrics**: Hit rate, memory usage, connection count
5. **Implement circuit breaker**: Graceful degradation if Redis fails
6. **Use SSL/TLS**: Encrypt connections in production
7. **Regular backups**: If cache contains non-reproducible data

## Troubleshooting

### Connection Issues

If Redis connection fails:

1. Verify Redis is running: `docker compose ps redis`
2. Check `REDIS_URL` configuration
3. Test connection: `redis-cli -u $REDIS_URL ping`
4. Review firewall/network settings

### Performance Issues

If caching doesn't improve performance:

1. Check cache hit rates (implement metrics)
2. Verify TTLs are appropriate
3. Monitor Redis memory usage
4. Check for cache key collisions
5. Review cache invalidation patterns

### Memory Issues

If Redis runs out of memory:

1. Check maxmemory configuration
2. Review TTL settings (reduce if needed)
3. Implement eviction policy
4. Consider Redis Cluster for horizontal scaling
5. Audit large cached values

## Future Enhancements

- [ ] Cache metrics and monitoring dashboard
- [ ] Automatic cache warming for critical data
- [ ] Cache versioning for schema migrations
- [ ] Multi-level caching (L1: in-memory, L2: Redis)
- [ ] Cache compression for large values
- [ ] Distributed tracing for cache operations
