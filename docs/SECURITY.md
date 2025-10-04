# Security Configuration

This document outlines the security measures implemented in the Matrix Academy backend application.

## CORS (Cross-Origin Resource Sharing)

The application uses environment-based CORS configuration to control which origins can access the API.

### Configuration

- **Environment Variable**: `CORS_ORIGINS`
- **Format**: Comma-separated list of allowed origins
- **Example**: `http://localhost:3001,http://localhost:5173`
- **Location**: `apps/backend/.env`

### Implementation

CORS is configured in `apps/backend/src/main.ts` to:

- Parse the `CORS_ORIGINS` environment variable
- Accept only explicitly listed origins
- Enable credentials support for authenticated requests

```typescript
cors: {
  origin: process.env.CORS_ORIGINS?.split(',').map((origin) => origin.trim()) ?? [],
  credentials: true,
}
```

## Rate Limiting

The application implements rate limiting using `@nestjs/throttler` to prevent abuse and protect against DDoS attacks.

### Default Rate Limits

- **Limit**: 100 requests per 15 minutes
- **Environment Variables**:
  - `THROTTLE_TTL`: Time window in seconds (default: 900)
  - `THROTTLE_LIMIT`: Maximum requests per window (default: 100)

### Authentication Endpoints Rate Limits

Authentication endpoints have stricter rate limits to prevent brute-force attacks:

- **Limit**: 5 requests per 15 minutes
- **TTL**: 900 seconds (15 minutes)

### Usage

To apply the stricter auth rate limit to a controller or route, use the `@Throttle` decorator:

```typescript
import { Throttle } from '@nestjs/throttler';

@Throttle({ auth: { limit: 5, ttl: 900000 } })
@Post('login')
async login() {
  // ...
}
```

### Error Responses

When rate limits are exceeded, the API returns:

- **Status Code**: `429 Too Many Requests`
- **Response Body**:
  ```json
  {
    "statusCode": 429,
    "message": "Too many requests. Please try again later.",
    "error": "Too Many Requests"
  }
  ```

## Helmet Security Headers

Helmet is configured to set various HTTP security headers to protect against common web vulnerabilities.

### Environment-Based Configuration

- **Development**: CSP and COEP headers are disabled for easier debugging
- **Production**: All Helmet security headers are enabled

### Headers Included

Helmet sets the following security headers:

- `X-DNS-Prefetch-Control`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `X-XSS-Protection`
- `Strict-Transport-Security` (production only)
- `Content-Security-Policy` (production only)
- And more...

## Request Body Size Limits

To prevent payload-based attacks and resource exhaustion:

- **Maximum Body Size**: 10 MB
- **Applies to**: JSON and URL-encoded bodies

### Implementation

```typescript
app.useBodyParser('json', { limit: '10mb' });
app.useBodyParser('urlencoded', { limit: '10mb', extended: true });
```

## Environment Variables Summary

| Variable         | Description                      | Default     | Required |
| ---------------- | -------------------------------- | ----------- | -------- |
| `CORS_ORIGINS`   | Comma-separated allowed origins  | -           | Yes      |
| `THROTTLE_TTL`   | Rate limit time window (seconds) | 900         | No       |
| `THROTTLE_LIMIT` | Max requests per window          | 100         | No       |
| `NODE_ENV`       | Application environment          | development | No       |

## Testing Security Configuration

### Test CORS

```bash
curl -H "Origin: http://unauthorized-origin.com" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS http://localhost:3000/api/endpoint
```

Expected: No `Access-Control-Allow-Origin` header in response.

### Test Rate Limiting

```bash
# Send requests rapidly to trigger rate limit
for i in {1..101}; do
  curl http://localhost:3000/api/endpoint
done
```

Expected: 429 response after exceeding the limit.

### Test Body Size Limit

```bash
# Send a request with body larger than 10mb
curl -X POST http://localhost:3000/api/endpoint \
  -H "Content-Type: application/json" \
  -d @large-file.json
```

Expected: 413 Payload Too Large response.

## Best Practices

1. **Always use HTTPS in production** to encrypt data in transit
2. **Keep CORS origins restrictive** - only add trusted domains
3. **Monitor rate limit violations** to detect potential attacks
4. **Regularly update dependencies** to patch security vulnerabilities
5. **Use strong JWT secrets** (minimum 32 characters)
6. **Enable all Helmet features in production** for maximum security
7. **Adjust rate limits** based on your application's usage patterns

## References

- [NestJS Security Best Practices](https://docs.nestjs.com/security/helmet)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Helmet Documentation](https://helmetjs.github.io/)
- [NestJS Throttler](https://github.com/nestjs/throttler)
