# Redis Integration Testing

This document provides instructions for testing the Redis caching integration in the Matrix Academy backend.

## Prerequisites

- Docker container `matrix-academy-redis-dev` must be running
- Redis should be accessible at `redis://localhost:6379`

## Quick Test Script

A standalone Redis connectivity test is available that directly tests Redis operations:

```bash
# From the backend directory
pnpm test:redis
```

This script performs the following tests:

1. ✅ Connection establishment
2. ✅ Write and read operations
3. ✅ Complex object storage (JSON serialization)
4. ✅ TTL (Time To Live) expiration
5. ✅ Key deletion
6. ✅ Multiple key operations

## Manual Testing with Redis CLI

You can also test Redis directly using the Redis CLI:

```bash
# Connect to Redis container
docker exec -it matrix-academy-redis-dev redis-cli

# Inside Redis CLI:
PING                    # Should return PONG
SET test:key "hello"    # Set a key
GET test:key            # Get the key value
DEL test:key            # Delete the key
KEYS *                  # List all keys (use with caution in production)
```

## Application Caching Test

Once the backend is running, you can test the caching behavior:

### Health Endpoint Caching

The `/health` endpoint is configured to cache responses for 1 minute:

```bash
# First request (cache miss - slower)
curl http://localhost:3000/health

# Second request (cache hit - faster, same timestamp)
curl http://localhost:3000/health
```

The `timestamp` field in the response should be identical on both requests, confirming the response is cached.

## Integration Test Suite

A comprehensive e2e test suite is available at:
`apps/backend/test/redis.e2e-spec.ts`

To run the full test suite:

```bash
# From the backend directory
pnpm test:e2e redis.e2e-spec.ts --forceExit
```

### Test Coverage

The integration tests cover:

**Redis Connection Tests:**

- Connection verification
- Write and read operations
- Non-existent key handling
- Cache deletion
- TTL expiration
- Complex object storage

**Health Endpoint Caching:**

- Response caching verification
- Performance improvement validation

**Cache Invalidation:**

- Specific key invalidation

**Cache Key Generation:**

- Unique key generation for different requests

## Monitoring Redis

### Check Redis Container Status

```bash
docker ps --filter "name=redis"
```

### View Redis Stats

```bash
docker exec -it matrix-academy-redis-dev redis-cli INFO stats
```

### Monitor Redis Operations in Real-Time

```bash
docker exec -it matrix-academy-redis-dev redis-cli MONITOR
```

## Configuration

Redis configuration is located in:

- `apps/backend/.env` - Environment variables
- `apps/backend/src/config/redis.config.ts` - Redis configuration factory

### Environment Variables

```env
REDIS_URL=redis://localhost:6379
REDIS_TTL=300000  # Default TTL in milliseconds (5 minutes)
```

## Cache Keys

Cache keys are defined in `apps/backend/src/common/constants/cache-keys.ts`:

- `user:{userId}` - User data cache
- `health` - Health check cache

## Cache Invalidation

The `CacheInvalidationService` provides methods for cache management:

```typescript
import { CacheInvalidationService } from './common/services/cache-invalidation.service';

// Invalidate specific user cache
await cacheInvalidationService.invalidateUserCache(userId);

// Invalidate multiple users
await cacheInvalidationService.invalidateUsersCache([userId1, userId2]);
```

## Troubleshooting

### Redis Connection Issues

If you see "REDIS_URL is not defined" errors:

1. Ensure `.env` file exists with `REDIS_URL` configured
2. Restart the application to pick up environment changes

### Redis Container Not Running

```bash
# Check if Redis is running
docker ps --filter "name=redis"

# Start Redis container (if using docker-compose)
docker-compose up -d redis
```

### Clear All Cache Data

```bash
# Connect to Redis CLI
docker exec -it matrix-academy-redis-dev redis-cli

# Clear all data (use with caution!)
FLUSHALL
```

## Performance Considerations

- Default TTL is 5 minutes (300000ms)
- Health check cache TTL is 1 minute (60000ms)
- Cache keys include user context for proper isolation
- Only GET requests are cached by the HTTP cache interceptor

## Next Steps

- Implement cache invalidation on data updates
- Add Redis health indicator to health checks
- Configure appropriate TTLs for different resource types
- Implement cache warming strategies for frequently accessed data
