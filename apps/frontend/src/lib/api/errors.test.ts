/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file Tests for API error classes
 */
import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it } from 'vitest';

import {
  ApiError,
  AuthenticationError,
  AuthorizationError,
  createApiError,
  NetworkError,
  NotFoundError,
  ServerError,
  TimeoutError,
  ValidationError,
} from './errors';

describe('API Error Classes', () => {
  describe('ApiError', () => {
    it('should create an ApiError with message and status code', () => {
      const error = new ApiError('Test error', 500);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('ApiError');
    });

    it('should include response data if provided', () => {
      const response = { message: 'Error details', statusCode: 500 };
      const error = new ApiError('Test error', 500, response);

      expect(error.response).toEqual(response);
    });
  });

  describe('AuthenticationError', () => {
    it('should create a 401 error', () => {
      const error = new AuthenticationError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Authentication failed');
      expect(error.name).toBe('AuthenticationError');
    });

    it('should accept custom message', () => {
      const error = new AuthenticationError('Token expired');

      expect(error.message).toBe('Token expired');
    });
  });

  describe('AuthorizationError', () => {
    it('should create a 403 error', () => {
      const error = new AuthorizationError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Access forbidden');
      expect(error.name).toBe('AuthorizationError');
    });
  });

  describe('NotFoundError', () => {
    it('should create a 404 error', () => {
      const error = new NotFoundError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
      expect(error.name).toBe('NotFoundError');
    });
  });

  describe('ValidationError', () => {
    it('should create a 400 error', () => {
      const error = new ValidationError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Validation failed');
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('ServerError', () => {
    it('should create a 500 error by default', () => {
      const error = new ServerError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Server error');
      expect(error.name).toBe('ServerError');
    });

    it('should accept custom status code', () => {
      const error = new ServerError('Gateway timeout', 504);

      expect(error.statusCode).toBe(504);
      expect(error.message).toBe('Gateway timeout');
    });
  });

  describe('NetworkError', () => {
    it('should create a network error', () => {
      const error = new NetworkError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(0);
      expect(error.message).toBe('Network error occurred');
      expect(error.name).toBe('NetworkError');
    });
  });

  describe('TimeoutError', () => {
    it('should create a timeout error', () => {
      const error = new TimeoutError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(0);
      expect(error.message).toBe('Request timeout');
      expect(error.name).toBe('TimeoutError');
    });
  });

  describe('createApiError', () => {
    it('should create ValidationError for 400 status', () => {
      const axiosError = new AxiosError('Bad request');
      axiosError.response = {
        status: 400,
        data: { message: 'Validation failed', statusCode: 400 },
        statusText: 'Bad Request',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      const error = createApiError(axiosError);

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.statusCode).toBe(400);
    });

    it('should create AuthenticationError for 401 status', () => {
      const axiosError = new AxiosError('Unauthorized');
      axiosError.response = {
        status: 401,
        data: { message: 'Unauthorized', statusCode: 401 },
        statusText: 'Unauthorized',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      const error = createApiError(axiosError);

      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error.statusCode).toBe(401);
    });

    it('should create AuthorizationError for 403 status', () => {
      const axiosError = new AxiosError('Forbidden');
      axiosError.response = {
        status: 403,
        data: { message: 'Forbidden', statusCode: 403 },
        statusText: 'Forbidden',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      const error = createApiError(axiosError);

      expect(error).toBeInstanceOf(AuthorizationError);
      expect(error.statusCode).toBe(403);
    });

    it('should create NotFoundError for 404 status', () => {
      const axiosError = new AxiosError('Not found');
      axiosError.response = {
        status: 404,
        data: { message: 'Not found', statusCode: 404 },
        statusText: 'Not Found',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      const error = createApiError(axiosError);

      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.statusCode).toBe(404);
    });

    it('should create ServerError for 500+ status', () => {
      const axiosError = new AxiosError('Internal server error');
      axiosError.response = {
        status: 500,
        data: { message: 'Internal server error', statusCode: 500 },
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      const error = createApiError(axiosError);

      expect(error).toBeInstanceOf(ServerError);
      expect(error.statusCode).toBe(500);
    });

    it('should create TimeoutError for timeout errors', () => {
      const axiosError = new AxiosError('Timeout');
      axiosError.code = 'ECONNABORTED';

      const error = createApiError(axiosError);

      expect(error).toBeInstanceOf(TimeoutError);
    });

    it('should create NetworkError for network errors', () => {
      const axiosError = new AxiosError('Network error');
      // No response means network error

      const error = createApiError(axiosError);

      expect(error).toBeInstanceOf(NetworkError);
    });

    it('should use response message if available', () => {
      const axiosError = new AxiosError('Generic error');
      axiosError.response = {
        status: 500,
        data: { message: 'Custom error message', statusCode: 500 },
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      const error = createApiError(axiosError);

      expect(error.message).toBe('Custom error message');
    });
  });
});
