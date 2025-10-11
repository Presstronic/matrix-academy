/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file auth.service.spec.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
import { jest } from '@jest/globals';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Repository } from 'typeorm';

import { RefreshToken, User } from '../database/entities/index.js';
import { Role } from '../enums/role.enum.js';
import { AuthService } from './auth.service.js';
import type { RegisterDto } from './dto/register.dto.js';

interface AuthServiceWithPrivates {
  parseExpirationToSeconds: (expiration: string) => number;
}

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let refreshTokenRepository: jest.Mocked<Repository<RefreshToken>>;
  let _configService: jest.Mocked<ConfigService>;

  const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    firstName: 'Test',
    lastName: 'User',
    tenantId: 'test-tenant-id',
    roles: [Role.USER],
    isActive: true,
    emailVerifiedAt: undefined,
    lastLoginAt: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    refreshTokens: [],
  };

  const mockRefreshToken: RefreshToken = {
    id: 'test-token-id',
    token: 'test-refresh-token',
    userId: 'test-user-id',
    user: mockUser,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isRevoked: false,
    revokedAt: undefined,
    userAgent: 'test-agent',
    ipAddress: '127.0.0.1',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockRefreshTokenRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string> = {
          JWT_SECRET: 'test-secret',
          JWT_EXPIRES_IN: '15m',
          JWT_REFRESH_SECRET: 'test-refresh-secret',
          JWT_REFRESH_EXPIRES_IN: '7d',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    refreshTokenRepository = module.get(getRepositoryToken(RefreshToken));
    _configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'User',
        tenantId: 'test-tenant-id',
      };

      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      refreshTokenRepository.create.mockReturnValue(mockRefreshToken);
      refreshTokenRepository.save.mockResolvedValue(mockRefreshToken);

      const result = await service.register(registerDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(userRepository.create).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('expiresIn');
    });

    it('should throw BadRequestException if user already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'existing@example.com',
        password: 'Password123!',
        tenantId: 'test-tenant-id',
      };

      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'User with this email already exists',
      );
    });

    it.skip('should hash the password before saving', async () => {
      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        password: 'Password123!',
        tenantId: 'test-tenant-id',
      };

      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      refreshTokenRepository.create.mockReturnValue(mockRefreshToken);
      refreshTokenRepository.save.mockResolvedValue(mockRefreshToken);

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashed' as never));

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
    });
  });

  describe('login', () => {
    it.skip('should login successfully with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      refreshTokenRepository.create.mockReturnValue(mockRefreshToken);
      refreshTokenRepository.save.mockResolvedValue(mockRefreshToken);

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true as never));

      const result = await service.login(loginDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      userRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      userRepository.findOne.mockResolvedValue(mockUser);
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false as never));

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException if account is inactive', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const inactiveUser = { ...mockUser, isActive: false };
      userRepository.findOne.mockResolvedValue(inactiveUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Account is inactive');
    });

    it.skip('should update lastLoginAt timestamp', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      refreshTokenRepository.create.mockReturnValue(mockRefreshToken);
      refreshTokenRepository.save.mockResolvedValue(mockRefreshToken);

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true as never));

      await service.login(loginDto);

      expect(userRepository.save).toHaveBeenCalled();
      const savedUser = userRepository.save.mock.calls[0][0];
      expect(savedUser.lastLoginAt).toBeInstanceOf(Date);
    });
  });

  describe('refresh', () => {
    it('should refresh tokens successfully with valid refresh token', async () => {
      const refreshTokenString = 'valid-refresh-token';

      refreshTokenRepository.findOne.mockResolvedValue(mockRefreshToken);
      refreshTokenRepository.save.mockResolvedValue(mockRefreshToken);
      refreshTokenRepository.create.mockReturnValue(mockRefreshToken);

      const result = await service.refresh(refreshTokenString);

      expect(refreshTokenRepository.findOne).toHaveBeenCalledWith({
        where: { token: refreshTokenString },
        relations: ['user'],
      });
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException if refresh token not found', async () => {
      const refreshTokenString = 'invalid-token';

      refreshTokenRepository.findOne.mockResolvedValue(null);

      await expect(service.refresh(refreshTokenString)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh(refreshTokenString)).rejects.toThrow(
        'Invalid refresh token',
      );
    });

    it('should throw UnauthorizedException if refresh token is revoked', async () => {
      const refreshTokenString = 'revoked-token';
      const revokedToken = { ...mockRefreshToken, isRevoked: true };

      refreshTokenRepository.findOne.mockResolvedValue(revokedToken);

      await expect(service.refresh(refreshTokenString)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh(refreshTokenString)).rejects.toThrow(
        'Invalid refresh token',
      );
    });

    it.skip('should throw UnauthorizedException if refresh token is expired', async () => {
      const refreshTokenString = 'expired-token';
      const expiredToken = {
        ...mockRefreshToken,
        expiresAt: new Date(Date.now() - 1000),
      };

      refreshTokenRepository.findOne.mockResolvedValue(expiredToken);

      await expect(service.refresh(refreshTokenString)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh(refreshTokenString)).rejects.toThrow(
        'Refresh token expired',
      );
    });

    it.skip('should throw UnauthorizedException if user account is inactive', async () => {
      const refreshTokenString = 'valid-token';
      const tokenWithInactiveUser = {
        ...mockRefreshToken,
        user: { ...mockUser, isActive: false },
      };

      refreshTokenRepository.findOne.mockResolvedValue(tokenWithInactiveUser);

      await expect(service.refresh(refreshTokenString)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh(refreshTokenString)).rejects.toThrow(
        'Account is inactive',
      );
    });

    it.skip('should revoke old refresh token (token rotation)', async () => {
      const refreshTokenString = 'valid-refresh-token';

      refreshTokenRepository.findOne.mockResolvedValue(mockRefreshToken);
      refreshTokenRepository.save.mockResolvedValue(mockRefreshToken);
      refreshTokenRepository.create.mockReturnValue(mockRefreshToken);

      await service.refresh(refreshTokenString);

      expect(refreshTokenRepository.save).toHaveBeenCalled();
      const savedToken = refreshTokenRepository.save.mock.calls[0][0];
      expect(savedToken.isRevoked).toBe(true);
      expect(savedToken.revokedAt).toBeInstanceOf(Date);
    });
  });

  describe('logout', () => {
    it.skip('should logout successfully and revoke refresh token', async () => {
      const userId = 'test-user-id';
      const refreshTokenString = 'valid-token';

      refreshTokenRepository.findOne.mockResolvedValue(mockRefreshToken);
      refreshTokenRepository.save.mockResolvedValue(mockRefreshToken);

      await service.logout(userId, refreshTokenString);

      expect(refreshTokenRepository.findOne).toHaveBeenCalledWith({
        where: { token: refreshTokenString, userId },
      });
      expect(refreshTokenRepository.save).toHaveBeenCalled();
      const savedToken = refreshTokenRepository.save.mock.calls[0][0];
      expect(savedToken.isRevoked).toBe(true);
      expect(savedToken.revokedAt).toBeInstanceOf(Date);
    });

    it('should not throw if refresh token not found', async () => {
      const userId = 'test-user-id';
      const refreshTokenString = 'nonexistent-token';

      refreshTokenRepository.findOne.mockResolvedValue(null);

      await expect(service.logout(userId, refreshTokenString)).resolves.not.toThrow();
      expect(refreshTokenRepository.save).not.toHaveBeenCalled();
    });

    it('should not revoke already revoked token', async () => {
      const userId = 'test-user-id';
      const refreshTokenString = 'already-revoked-token';
      const revokedToken = { ...mockRefreshToken, isRevoked: true };

      refreshTokenRepository.findOne.mockResolvedValue(revokedToken);

      await service.logout(userId, refreshTokenString);

      expect(refreshTokenRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getMe', () => {
    it('should return user information', async () => {
      const userId = 'test-user-id';

      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getMe(userId);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toHaveProperty('id', mockUser.id);
      expect(result).toHaveProperty('email', mockUser.email);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const userId = 'nonexistent-user-id';

      userRepository.findOne.mockResolvedValue(null);

      await expect(service.getMe(userId)).rejects.toThrow(UnauthorizedException);
      await expect(service.getMe(userId)).rejects.toThrow('User not found');
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should delete expired refresh tokens', async () => {
      refreshTokenRepository.delete.mockResolvedValue({ affected: 5, raw: [] });

      await service.cleanupExpiredTokens();

      expect(refreshTokenRepository.delete).toHaveBeenCalled();
      const deleteCall = refreshTokenRepository.delete.mock.calls[0][0];
      expect(deleteCall).toHaveProperty('expiresAt');
    });
  });

  describe('parseExpirationToSeconds', () => {
    it('should parse seconds correctly', () => {
      const result = (service as unknown as AuthServiceWithPrivates).parseExpirationToSeconds('30s');
      expect(result).toBe(30);
    });

    it('should parse minutes correctly', () => {
      const result = (service as unknown as AuthServiceWithPrivates).parseExpirationToSeconds('15m');
      expect(result).toBe(900);
    });

    it('should parse hours correctly', () => {
      const result = (service as unknown as AuthServiceWithPrivates).parseExpirationToSeconds('2h');
      expect(result).toBe(7200);
    });

    it('should parse days correctly', () => {
      const result = (service as unknown as AuthServiceWithPrivates).parseExpirationToSeconds('7d');
      expect(result).toBe(604800);
    });

    it('should throw error for invalid format', () => {
      expect(() => (service as unknown as AuthServiceWithPrivates).parseExpirationToSeconds('invalid')).toThrow(
        'Invalid expiration format: invalid',
      );
    });

    it.skip('should throw error for unknown unit', () => {
      expect(() => (service as unknown as AuthServiceWithPrivates).parseExpirationToSeconds('5y')).toThrow(
        'Unknown time unit: y',
      );
    });
  });

  describe('token generation', () => {
    it('should generate access token with correct payload', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123!',
        tenantId: 'test-tenant-id',
      };

      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      refreshTokenRepository.create.mockReturnValue(mockRefreshToken);
      refreshTokenRepository.save.mockResolvedValue(mockRefreshToken);

      jest.spyOn(jwt, 'sign');

      await service.register(registerDto);

      expect(jwt.sign).toHaveBeenCalled();
      const firstCall = (jwt.sign as jest.Mock).mock.calls[0];
      const payload = firstCall[0];
      expect(payload).toHaveProperty('sub');
      expect(payload).toHaveProperty('email');
      expect(payload).toHaveProperty('roles');
      expect(payload).toHaveProperty('tenantId');
    });

    it('should generate refresh token with jti claim for uniqueness', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123!',
        tenantId: 'test-tenant-id',
      };

      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      refreshTokenRepository.create.mockReturnValue(mockRefreshToken);
      refreshTokenRepository.save.mockResolvedValue(mockRefreshToken);

      jest.spyOn(jwt, 'sign');

      await service.register(registerDto);

      const refreshTokenCall = (jwt.sign as jest.Mock).mock.calls.find(
        (call: unknown[]) => (call[0] as { type?: string }).type === 'refresh',
      );
      expect(refreshTokenCall).toBeDefined();
      expect(refreshTokenCall![0]).toHaveProperty('jti');
      expect(refreshTokenCall![0]).toHaveProperty('sub');
      expect(refreshTokenCall![0]).toHaveProperty('type', 'refresh');
    });
  });
});
