# API Conventions

This document outlines the standard conventions for Matrix Academy API responses.

## Response Format

All API responses follow a standardized format to ensure consistency and ease of integration.

### Success Responses

All successful API responses are wrapped in a standard envelope:

```json
{
  "success": true,
  "data": <response_data>,
  "metadata": {
    "timestamp": "2024-10-07T12:34:56.789Z",
    "correlationId": "1234567890-abc123def456",
    "version": "1.0"
  }
}
```

#### Fields

- **success** (boolean): Always `true` for successful responses
- **data** (any): The actual response payload, can be any valid JSON type
- **metadata** (object): Additional information about the response
  - **timestamp** (string): ISO 8601 formatted timestamp of when the response was generated
  - **correlationId** (string): Unique identifier for tracking this request across systems
  - **version** (string): API version

### Paginated Responses

List endpoints that support pagination use an extended format:

```json
{
  "success": true,
  "data": [<items>],
  "metadata": {
    "timestamp": "2024-10-07T12:34:56.789Z",
    "correlationId": "1234567890-abc123def456",
    "version": "1.0"
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

#### Pagination Fields

- **page** (number): Current page number (1-indexed)
- **limit** (number): Number of items per page
- **total** (number): Total number of items across all pages
- **totalPages** (number): Total number of pages
- **hasNext** (boolean): Whether there is a next page available
- **hasPrevious** (boolean): Whether there is a previous page available

### Error Responses

Error responses follow a different structure (defined in the exception handling system):

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  },
  "metadata": {
    "timestamp": "2024-10-07T12:34:56.789Z",
    "correlationId": "1234567890-abc123def456",
    "version": "1.0"
  }
}
```

## Correlation ID

The correlation ID is used for distributed tracing and debugging. Clients can provide their own correlation ID via headers:

- `X-Correlation-ID`
- `X-Request-ID`

If no correlation ID is provided, one will be automatically generated.

## Implementation Notes

### For Backend Developers

Responses are automatically transformed by the `TransformInterceptor` applied globally in `app.module.ts`. Controllers should return plain data objects:

```typescript
@Get('/users')
async getUsers() {
  return await this.usersService.findAll();
  // This will be automatically wrapped in SuccessResponseDto
}
```

For paginated responses, explicitly return a `PaginatedResponseDto`:

```typescript
@Get('/users')
async getUsers(@Query('page') page: number, @Query('limit') limit: number) {
  const [users, total] = await this.usersService.findAndCount(page, limit);
  return new PaginatedResponseDto(users, page, limit, total);
}
```

### For Frontend Developers

All API responses will have the standard envelope format. Extract the actual data from the `data` field:

```typescript
const response = await fetch('/api/users');
const { data, metadata } = await response.json();
// Use 'data' which contains the actual users array
```

Use the `correlationId` from `metadata` when reporting issues or debugging.

## Version History

- **v1.0** (2024-10-07): Initial API conventions documentation
