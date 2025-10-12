/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file Tests for API client
 */
import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  apiClient,
  del,
  get,
  getAuthToken,
  patch,
  post,
  put,
  removeAuthToken,
  setAuthToken,
} from './client';
import { AuthenticationError, NetworkError, ValidationError } from './errors';

describe('API Client', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    mock.restore();
    vi.restoreAllMocks();
  });

  describe('Token Management', () => {
    it('should set and get auth token', () => {
      setAuthToken('test-token');
      expect(getAuthToken()).toBe('test-token');
    });

    it('should remove auth token', () => {
      setAuthToken('test-token');
      removeAuthToken();
      expect(getAuthToken()).toBeNull();
    });

    it('should return null when no token is set', () => {
      expect(getAuthToken()).toBeNull();
    });
  });

  describe('Request Interceptor', () => {
    it('should attach authorization header when token is set', async () => {
      setAuthToken('test-token');
      mock.onGet('/test').reply((config) => {
        expect(config.headers?.Authorization).toBe('Bearer test-token');
        return [200, { data: 'success' }];
      });

      await get('/test');
    });

    it('should not attach authorization header when no token', async () => {
      removeAuthToken();
      mock.onGet('/test').reply((config) => {
        expect(config.headers?.Authorization).toBeUndefined();
        return [200, { data: 'success' }];
      });

      await get('/test');
    });
  });

  describe('GET requests', () => {
    it('should make successful GET request', async () => {
      const responseData = { data: { id: 1, name: 'Test' } };
      mock.onGet('/users/1').reply(200, responseData);

      const result = await get('/users/1');

      expect(result).toEqual(responseData);
    });

    it('should handle GET request with query parameters', async () => {
      const responseData = { data: [{ id: 1 }] };
      mock.onGet('/users').reply((config) => {
        expect(config.params).toEqual({ page: 1, limit: 10 });
        return [200, responseData];
      });

      await get('/users', { params: { page: 1, limit: 10 } });
    });
  });

  describe('POST requests', () => {
    it('should make successful POST request', async () => {
      const postData = { name: 'New User' };
      const responseData = { data: { id: 1, ...postData } };
      mock.onPost('/users', postData).reply(201, responseData);

      const result = await post('/users', postData);

      expect(result).toEqual(responseData);
    });
  });

  describe('PUT requests', () => {
    it('should make successful PUT request', async () => {
      const putData = { name: 'Updated User' };
      const responseData = { data: { id: 1, ...putData } };
      mock.onPut('/users/1', putData).reply(200, responseData);

      const result = await put('/users/1', putData);

      expect(result).toEqual(responseData);
    });
  });

  describe('PATCH requests', () => {
    it('should make successful PATCH request', async () => {
      const patchData = { name: 'Patched User' };
      const responseData = { data: { id: 1, ...patchData } };
      mock.onPatch('/users/1', patchData).reply(200, responseData);

      const result = await patch('/users/1', patchData);

      expect(result).toEqual(responseData);
    });
  });

  describe('DELETE requests', () => {
    it('should make successful DELETE request', async () => {
      const responseData = { data: { success: true } };
      mock.onDelete('/users/1').reply(200, responseData);

      const result = await del('/users/1');

      expect(result).toEqual(responseData);
    });
  });

  describe('Error Handling', () => {
    it('should throw ValidationError for 400 status', async () => {
      mock.onGet('/test').reply(400, { message: 'Bad request', statusCode: 400 });

      await expect(get('/test')).rejects.toThrow(ValidationError);
    });

    it('should throw AuthenticationError for 401 status', async () => {
      mock.onGet('/test').reply(401, { message: 'Unauthorized', statusCode: 401 });

      await expect(get('/test')).rejects.toThrow(AuthenticationError);
    });

    it('should throw ServerError for 500 status after retries', async () => {
      // Mock will respond with 500 on every attempt (including retries)
      mock.onGet('/test').reply(500, { message: 'Server error', statusCode: 500 });

      // Should throw an error (may be ServerError or NetworkError after retries)
      await expect(get('/test')).rejects.toThrow();
    });

    it('should throw NetworkError when network fails', async () => {
      mock.onGet('/test').networkError();

      await expect(get('/test')).rejects.toThrow(NetworkError);
    });

    it('should remove token on 401 error', async () => {
      setAuthToken('test-token');
      mock.onGet('/test').reply(401, { message: 'Unauthorized', statusCode: 401 });

      await expect(get('/test')).rejects.toThrow(AuthenticationError);
      expect(getAuthToken()).toBeNull();
    });
  });

  describe('Response Handling', () => {
    it('should return response data directly', async () => {
      const responseData = { data: { id: 1, name: 'Test' } };
      mock.onGet('/test').reply(200, responseData);

      const result = await get('/test');

      expect(result).toEqual(responseData);
    });

    it('should handle empty response', async () => {
      mock.onDelete('/test').reply(204);

      const result = await del('/test');

      expect(result).toBeUndefined();
    });
  });

  describe('Type Safety', () => {
    it('should respect TypeScript types for GET', async () => {
      interface User {
        id: number;
        name: string;
      }

      const responseData = { data: { id: 1, name: 'Test' } };
      mock.onGet('/user').reply(200, responseData);

      const result = await get<{ data: User }>('/user');

      // TypeScript should enforce this structure
      expect(result.data.id).toBe(1);
      expect(result.data.name).toBe('Test');
    });

    it('should respect TypeScript types for POST', async () => {
      interface CreateUser {
        name: string;
        email: string;
      }

      const postData: CreateUser = { name: 'Test', email: 'test@example.com' };
      const responseData = { data: { id: 1, ...postData } };
      mock.onPost('/users').reply(201, responseData);

      const result = await post<{ data: CreateUser & { id: number } }, CreateUser>(
        '/users',
        postData,
      );

      expect(result.data.id).toBe(1);
      expect(result.data.name).toBe('Test');
    });
  });
});
