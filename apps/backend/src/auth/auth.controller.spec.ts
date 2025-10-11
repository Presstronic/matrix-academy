/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file auth.controller.spec.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
import { jest } from '@jest/globals';
import { Test, type TestingModule } from '@nestjs/testing';
import type { Request } from 'express';

import { Role } from '../enums/role.enum.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import type { AuthResponseDto, UserResponseDto } from './dto/auth-response.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RefreshDto } from './dto/refresh.dto.js';
import type { RegisterDto } from './dto/register.dto.js';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthResponse: AuthResponseDto = {
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

  const mockUserResponse: UserResponseDto = {
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

  const mockRequest = {
    headers: {
      'user-agent': 'test-user-agent',
    },
  } as Request;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
      getMe: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'User',
        tenantId: 'test-tenant-id',
      };

      authService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should return access and refresh tokens', async () => {
      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        password: 'Password123!',
        tenantId: 'test-tenant-id',
      };

      authService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('expiresIn');
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };
      const ipAddress = '127.0.0.1';

      authService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto, mockRequest, ipAddress);

      expect(authService.login).toHaveBeenCalledWith(loginDto, {
        userAgent: 'test-user-agent',
        ipAddress,
      });
      expect(result).toEqual(mockAuthResponse);
    });

    it('should pass metadata to auth service', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };
      const ipAddress = '192.168.1.1';

      authService.login.mockResolvedValue(mockAuthResponse);

      await controller.login(loginDto, mockRequest, ipAddress);

      expect(authService.login).toHaveBeenCalledWith(loginDto, {
        userAgent: 'test-user-agent',
        ipAddress: '192.168.1.1',
      });
    });
  });

  describe('refresh', () => {
    it('should refresh tokens successfully', async () => {
      const refreshDto: RefreshDto = {
        refreshToken: 'valid-refresh-token',
      };
      const ipAddress = '127.0.0.1';

      authService.refresh.mockResolvedValue(mockAuthResponse);

      const result = await controller.refresh(refreshDto, mockRequest, ipAddress);

      expect(authService.refresh).toHaveBeenCalledWith(refreshDto.refreshToken, {
        userAgent: 'test-user-agent',
        ipAddress,
      });
      expect(result).toEqual(mockAuthResponse);
    });

    it('should pass metadata to auth service', async () => {
      const refreshDto: RefreshDto = {
        refreshToken: 'valid-refresh-token',
      };
      const ipAddress = '10.0.0.1';

      authService.refresh.mockResolvedValue(mockAuthResponse);

      await controller.refresh(refreshDto, mockRequest, ipAddress);

      expect(authService.refresh).toHaveBeenCalledWith(refreshDto.refreshToken, {
        userAgent: 'test-user-agent',
        ipAddress: '10.0.0.1',
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const userId = 'test-user-id';
      const refreshDto: RefreshDto = {
        refreshToken: 'valid-refresh-token',
      };

      authService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(userId, refreshDto);

      expect(authService.logout).toHaveBeenCalledWith(userId, refreshDto.refreshToken);
      expect(result).toBeUndefined();
    });

    it('should call logout with correct parameters', async () => {
      const userId = 'user-123';
      const refreshDto: RefreshDto = {
        refreshToken: 'token-abc',
      };

      authService.logout.mockResolvedValue(undefined);

      await controller.logout(userId, refreshDto);

      expect(authService.logout).toHaveBeenCalledWith(userId, 'token-abc');
      expect(authService.logout).toHaveBeenCalledTimes(1);
    });
  });

  describe('getMe', () => {
    it('should return current user information', async () => {
      const userId = 'test-user-id';

      authService.getMe.mockResolvedValue(mockUserResponse);

      const result = await controller.getMe(userId);

      expect(authService.getMe).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUserResponse);
    });

    it('should return user without sensitive data', async () => {
      const userId = 'test-user-id';

      authService.getMe.mockResolvedValue(mockUserResponse);

      const result = await controller.getMe(userId);

      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('roles');
    });
  });
});
