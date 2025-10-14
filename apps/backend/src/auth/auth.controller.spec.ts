/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file auth.controller.spec.ts — Matrix Academy backend tests (type-safe, no `any`)
 */
import { jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import type { Request, Response } from 'express';

import { CsrfService } from '../common/services/csrf.service.js';
import { Role } from '../enums/role.enum.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  // let csrfService: jest.Mocked<CsrfService>;

  const mockAuthResponse = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      roles: [Role.USER],
      tenantId: 'test-tenant-id',
      isActive: true,
      emailVerifiedAt: undefined,
      createdAt: new Date(),
    },
    expiresIn: 900,
  };

  const mockUserResponse = {
    id: 'test-user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    roles: [Role.USER],
    tenantId: 'test-tenant-id',
    isActive: true,
    emailVerifiedAt: undefined,
    createdAt: new Date(),
  };

  // Minimal realistic mock of an Express Request
  const baseRequest = {
    headers: { 'user-agent': 'test-user-agent' } as Record<string, string>,
    cookies: {} as Record<string, string>,
    get(name: string): string | undefined {
      return this.headers[name.toLowerCase()];
    },
    header(name: string): string | undefined {
      return this.headers[name.toLowerCase()];
    },
  };

  // Minimal realistic mock of an Express Response
  const makeMockResponse = (): Response =>
    ({
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    }) as unknown as Response;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
      getMe: jest.fn(),
    } as unknown as AuthService;

    const mockCsrfService = {
      generateToken: jest.fn(() => 'csrf-123'),
      verifyToken: jest.fn(),
    } as unknown as CsrfService;

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: CsrfService, useValue: mockCsrfService },
      ],
    }).compile();

    controller = moduleRef.get(AuthController);
    authService = moduleRef.get(AuthService);
    // csrfService = moduleRef.get(CsrfService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('registers user, sets cookies, returns payload', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'User',
        tenantId: 'tenant-1',
      };
      const res = makeMockResponse();
      authService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto, res);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        mockAuthResponse.accessToken,
        expect.any(Object),
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        mockAuthResponse.refreshToken,
        expect.any(Object),
      );
      expect(res.cookie).toHaveBeenCalledWith('csrf_token', 'csrf-123', expect.any(Object));
      expect(result).toEqual({
        user: mockAuthResponse.user,
        expiresIn: mockAuthResponse.expiresIn,
      });
    });
  });

  describe('login', () => {
    it('logs in, sets cookies, returns payload', async () => {
      const loginDto = { email: 'test@example.com', password: 'Password123!' };
      const ipAddress = '127.0.0.1';
      const req = { ...baseRequest };
      const res = makeMockResponse();
      authService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto, req as unknown as Request, ipAddress, res);

      expect(authService.login).toHaveBeenCalledWith(loginDto, {
        userAgent: 'test-user-agent',
        ipAddress: '127.0.0.1',
      });
      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        mockAuthResponse.accessToken,
        expect.any(Object),
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        mockAuthResponse.refreshToken,
        expect.any(Object),
      );
      expect(res.cookie).toHaveBeenCalledWith('csrf_token', 'csrf-123', expect.any(Object));
      expect(result).toEqual({
        user: mockAuthResponse.user,
        expiresIn: mockAuthResponse.expiresIn,
      });
    });
  });

  describe('refresh', () => {
    it('refreshes tokens, sets cookies, returns payload', async () => {
      const ipAddress = '127.0.0.1';
      const req = { ...baseRequest, cookies: { refresh_token: 'valid-refresh-token' } };
      const res = makeMockResponse();
      authService.refresh.mockResolvedValue(mockAuthResponse);

      const result = await controller.refresh(req as unknown as Request, ipAddress, res);

      expect(authService.refresh).toHaveBeenCalledWith('valid-refresh-token', {
        userAgent: 'test-user-agent',
        ipAddress,
      });
      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        mockAuthResponse.accessToken,
        expect.any(Object),
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        mockAuthResponse.refreshToken,
        expect.any(Object),
      );
      expect(res.cookie).toHaveBeenCalledWith('csrf_token', 'csrf-123', expect.any(Object));
      expect(result).toEqual({
        user: mockAuthResponse.user,
        expiresIn: mockAuthResponse.expiresIn,
      });
    });

    it('throws if refresh cookie missing', async () => {
      const ipAddress = '127.0.0.1';
      const req = { ...baseRequest, cookies: {} };
      const res = makeMockResponse();
      await expect(controller.refresh(req as unknown as Request, ipAddress, res)).rejects.toThrow(
        'Refresh token not found',
      );
    });
  });

  describe('logout', () => {
    it('clears cookies and calls service', async () => {
      const userId = 'test-user-id';
      const req = { ...baseRequest, cookies: { refresh_token: 'token-abc' } };
      const res = makeMockResponse();
      authService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(userId, req as unknown as Request, res);

      expect(authService.logout).toHaveBeenCalledWith(userId, 'token-abc');
      expect(res.clearCookie).toHaveBeenCalledWith('access_token', { path: '/' });
      expect(res.clearCookie).toHaveBeenCalledWith('refresh_token', { path: '/' });
      expect(res.clearCookie).toHaveBeenCalledWith('csrf_token', { path: '/' });
      expect(result).toBeUndefined();
    });
  });

  describe('getMe', () => {
    it('returns current user', async () => {
      const userId = 'test-user-id';
      authService.getMe.mockResolvedValue(mockUserResponse);

      const result = await controller.getMe(userId);
      expect(authService.getMe).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUserResponse);
    });
  });
});
