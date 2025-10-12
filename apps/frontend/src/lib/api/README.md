# API Client Library

Comprehensive HTTP client infrastructure for backend API communication with TypeScript support, automatic retries, error handling, and authentication.

## Features

- **Axios-based HTTP client** with configured interceptors
- **Automatic authentication** token management
- **Request/response interceptors** for consistent behavior
- **Automatic retry logic** with exponential backoff for failed requests
- **Custom error classes** for different HTTP error scenarios
- **TypeScript support** with full type safety
- **Environment-specific configuration**
- **Comprehensive test coverage** (60+ tests)

## Directory Structure

```
src/lib/api/
├── client.ts              # Main API client with interceptors
├── errors.ts              # Custom error classes
├── types.ts               # TypeScript interfaces
├── services/             # API service modules
│   ├── auth.service.ts   # Authentication endpoints
│   └── index.ts          # Services barrel export
├── index.ts              # Main barrel export
└── README.md             # This file
```

## Quick Start

### Basic Usage

```typescript
import { get, post, put, patch, del } from '@/lib/api';

// GET request
const users = await get<User[]>('/users');

// POST request
const newUser = await post<User>('/users', { name: 'John', email: 'john@example.com' });

// PUT request
const updated = await put<User>(`/users/${id}`, { name: 'Jane' });

// PATCH request
const patched = await patch<User>(`/users/${id}`, { email: 'new@example.com' });

// DELETE request
await del(`/users/${id}`);
```

### Using Services

```typescript
import { authService } from '@/lib/api';

// Login
const { accessToken } = await authService.login({
  email: 'user@example.com',
  password: 'password123',
});

// Register
const tokens = await authService.register({
  email: 'new@example.com',
  password: 'password123',
  name: 'New User',
});

// Get current user
const user = await authService.getCurrentUser();

// Logout
await authService.logout();
```

## Authentication

### Token Management

The client automatically manages authentication tokens:

```typescript
import { setAuthToken, getAuthToken, removeAuthToken } from '@/lib/api';

// Set token (usually after login)
setAuthToken('your-access-token');

// Get current token
const token = getAuthToken();

// Remove token (logout)
removeAuthToken();
```

### Automatic Token Injection

All requests automatically include the `Authorization` header when a token is set:

```typescript
// After setting token
setAuthToken('my-token');

// This request will include: Authorization: Bearer my-token
const data = await get('/protected-resource');
```

### Handling 401 Responses

When a 401 (Unauthorized) response is received:

1. The token is automatically removed from storage
2. An `AuthenticationError` is thrown
3. You can catch this error to redirect to login

```typescript
try {
  const data = await get('/protected-resource');
} catch (error) {
  if (error instanceof AuthenticationError) {
    // Redirect to login page
    router.push('/login');
  }
}
```

## Error Handling

### Custom Error Classes

```typescript
import {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ServerError,
  NetworkError,
  TimeoutError,
} from '@/lib/api';

try {
  await post('/users', userData);
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors (400)
    console.error('Validation failed:', error.response);
  } else if (error instanceof AuthenticationError) {
    // Handle auth errors (401)
    console.error('Not authenticated');
  } else if (error instanceof AuthorizationError) {
    // Handle authorization errors (403)
    console.error('Access forbidden');
  } else if (error instanceof NotFoundError) {
    // Handle not found errors (404)
    console.error('Resource not found');
  } else if (error instanceof ServerError) {
    // Handle server errors (500+)
    console.error('Server error');
  } else if (error instanceof NetworkError) {
    // Handle network errors
    console.error('Network error');
  } else if (error instanceof TimeoutError) {
    // Handle timeout errors
    console.error('Request timeout');
  }
}
```

### Error Response Structure

All errors include the response data:

```typescript
try {
  await post('/users', invalidData);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(error.message); // User-friendly message
    console.error(error.statusCode); // 400
    console.error(error.response); // Full error response from API
    console.error(error.response.details); // Validation details if available
  }
}
```

## Retry Logic

Automatic retry with exponential backoff:

- **Default retries**: 3 attempts
- **Retry conditions**:
  - Network errors (no response)
  - 5xx server errors (500, 502, 503, 504)
  - Idempotent request errors (GET, HEAD, OPTIONS, PUT, DELETE)
- **Non-retried errors**:
  - 4xx client errors (400, 401, 403, 404)
  - POST requests (not idempotent)

```typescript
// This request will automatically retry up to 3 times on failure
const data = await get('/users');
```

## Environment Configuration

Configure API settings via environment variables:

### `.env` file

```bash
# API base URL (required)
VITE_API_BASE_URL=http://localhost:3000/api

# Request timeout in milliseconds (default: 30000)
VITE_API_TIMEOUT=30000

# Number of retry attempts (default: 3)
VITE_API_RETRY_ATTEMPTS=3
```

### Default Configuration

```typescript
// Development: http://localhost:3000/api
// Production: /api (same domain)
// Test: http://localhost:3000/api
```

## TypeScript Types

### Request/Response Types

```typescript
import type {
  ApiResponse,
  ApiErrorResponse,
  PaginationParams,
  User,
  LoginCredentials,
  AuthTokenResponse,
} from '@/lib/api';

// API responses are wrapped in a standard format
interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Use with requests
const response = await get<ApiResponse<User>>('/users/1');
const user = response.data;
```

### Creating Custom Service Types

```typescript
// Define your API types
interface Product {
  id: string;
  name: string;
  price: number;
}

interface CreateProductDto {
  name: string;
  price: number;
}

// Use with API methods
const product = await post<ApiResponse<Product>, CreateProductDto>('/products', {
  name: 'New Product',
  price: 99.99,
});
```

## Creating New Services

### Example: Products Service

```typescript
// src/lib/api/services/products.service.ts
import { get, post, put, del } from '../client';
import type { ApiResponse, PaginationParams } from '../types';

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface CreateProductDto {
  name: string;
  price: number;
  description?: string;
}

export async function getProducts(params?: PaginationParams): Promise<Product[]> {
  const response = await get<ApiResponse<Product[]>>('/products', { params });
  return response.data;
}

export async function getProduct(id: string): Promise<Product> {
  const response = await get<ApiResponse<Product>>(`/products/${id}`);
  return response.data;
}

export async function createProduct(data: CreateProductDto): Promise<Product> {
  const response = await post<ApiResponse<Product>>('/products', data);
  return response.data;
}

export async function updateProduct(id: string, data: Partial<CreateProductDto>): Promise<Product> {
  const response = await put<ApiResponse<Product>>(`/products/${id}`, data);
  return response.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await del(`/products/${id}`);
}
```

### Export Service

```typescript
// src/lib/api/services/index.ts
export * as authService from './auth.service';
export * as productService from './products.service';
```

### Use Service

```typescript
import { productService } from '@/lib/api';

const products = await productService.getProducts({ page: 1, limit: 10 });
```

## Testing

### Test Coverage

- **82 total tests** across all API components
- Environment configuration (6 tests)
- Error classes (19 tests)
- API client (20 tests)
- Auth service (15 tests)
- Plus routing and component tests (22 tests)

### Testing with MockAdapter

```typescript
import MockAdapter from 'axios-mock-adapter';
import { apiClient, get } from '@/lib/api';

describe('My Component', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  it('should fetch data', async () => {
    mock.onGet('/users').reply(200, { data: [{ id: 1, name: 'John' }] });

    const result = await get('/users');

    expect(result.data).toHaveLength(1);
  });
});
```

## Best Practices

### 1. Always Use Services

```typescript
// ❌ Don't call API directly in components
const response = await get('/auth/login', { email, password });

// ✅ Use services
import { authService } from '@/lib/api';
const tokens = await authService.login({ email, password });
```

### 2. Handle Errors Properly

```typescript
// ✅ Always handle errors
try {
  const data = await productService.getProduct(id);
  setProduct(data);
} catch (error) {
  if (error instanceof NotFoundError) {
    setError('Product not found');
  } else {
    setError('Failed to load product');
  }
}
```

### 3. Use TypeScript Types

```typescript
// ✅ Define proper types for your API responses
interface ApiProduct {
  id: string;
  name: string;
  price: number;
}

const products = await get<ApiResponse<ApiProduct[]>>('/products');
```

### 4. Manage Tokens Properly

```typescript
// ✅ Set token after successful login
const { accessToken, refreshToken } = await authService.login(credentials);
setAuthToken(accessToken);
if (refreshToken) {
  setRefreshToken(refreshToken);
}

// ✅ Clear token on logout
await authService.logout();
removeAuthToken();
```

## Troubleshooting

### CORS Issues

Ensure your backend allows requests from your frontend origin:

```typescript
// Backend configuration example (Express)
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);
```

### Request Timeout

Adjust timeout in environment variables:

```bash
# Increase to 60 seconds
VITE_API_TIMEOUT=60000
```

### Disable Retries

Set retry attempts to 0:

```bash
VITE_API_RETRY_ATTEMPTS=0
```

## Related Documentation

- [Backend API Documentation](../../../backend/README.md)
- [Frontend README](../../../README.md)
- [Environment Configuration](../../config/README.md)
