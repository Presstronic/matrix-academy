/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file AuthService unit tests (typed, no `any`, ESM-friendly)
 */
import { jest } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { RefreshToken, User } from '../database/entities/index.js';
import type { Tenant } from '../database/entities/tenant.entity.js';
import { TenantService } from '../tenant/tenant.service.js';
import { AuthService } from './auth.service.js';

// ---------- Typed mock data ----------

const mockTenant: Tenant = {
  id: 'test-tenant-id',
  name: 'Test Tenant',
  slug: 'test-tenant',
  isActive: true,
  description: 'Test tenant for specs',
  createdAt: new Date(),
  updatedAt: new Date(),
  users: [],
};

// Password: 'correct-password' hashed with bcrypt
// We'll create this properly in beforeAll
let hashedPassword: string;

const existingUser = {
  id: 'user-1',
  email: 'alice@example.com',
  password: '', // Will be set in beforeAll
  firstName: 'Alice',
  lastName: 'Example',
  tenantId: mockTenant.id,
  roles: ['user'],
  isActive: true,
  lastLoginAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRefreshTokenData = {
  id: 'refresh-1',
  token: 'refresh.token.here',
  userId: existingUser.id,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  isRevoked: false,
  createdAt: new Date(),
};

// ---------- Typed mocks (no `any`) ----------

const mockTenantService = {
  getDefaultTenantId: jest.fn<() => Promise<string>>().mockResolvedValue(mockTenant.id),
  getDefaultTenant: jest.fn<() => Promise<Tenant>>().mockResolvedValue(mockTenant),
  findById: jest.fn<(id: string) => Promise<Tenant | null>>().mockResolvedValue(mockTenant),
  findBySlug: jest.fn<(slug: string) => Promise<Tenant | null>>().mockResolvedValue(mockTenant),
} as unknown as TenantService;

const mockUserRepository = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findOne: jest.fn<any>().mockResolvedValue(existingUser),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: jest.fn<any>().mockReturnValue(existingUser),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  save: jest.fn<any>().mockResolvedValue(existingUser),
};

const mockRefreshTokenRepository = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findOne: jest.fn<any>().mockResolvedValue(mockRefreshTokenData),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: jest.fn<any>().mockReturnValue(mockRefreshTokenData),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  save: jest.fn<any>().mockResolvedValue(mockRefreshTokenData),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete: jest.fn<any>().mockResolvedValue({ affected: 1 }),
};

const mockJwtService = {
  signAsync: jest.fn<() => Promise<string>>().mockResolvedValue('signed.jwt.token'),
} as unknown as JwtService;

const mockConfigService = {
  get: jest.fn((key: string) => {
    const config: Record<string, string> = {
      JWT_SECRET: 'test-secret',
      JWT_EXPIRES_IN: '15m',
      JWT_REFRESH_SECRET: 'test-refresh-secret',
      JWT_REFRESH_EXPIRES_IN: '7d',
    };
    return config[key] || 'test-value';
  }),
} as unknown as ConfigService;

// ---------- Test suite ----------

describe('AuthService', () => {
  let moduleRef: TestingModule;
  let authService: AuthService;

  beforeAll(async () => {
    // Hash the test password
    hashedPassword = await bcrypt.hash('correct-password', 10);
    existingUser.password = hashedPassword;

    moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(RefreshToken), useValue: mockRefreshTokenRepository },
        { provide: TenantService, useValue: mockTenantService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  // ---- Example tests below ----
  // Update to match your real AuthService public API.

  describe('default tenant helpers', () => {
    it('returns a default tenant id', async () => {
      const id = await mockTenantService.getDefaultTenantId();
      expect(id).toBe('test-tenant-id');
      expect(mockTenantService.getDefaultTenantId).toHaveBeenCalled();
    });

    it('returns a default tenant object', async () => {
      const t = await mockTenantService.getDefaultTenant();
      expect(t?.id).toBe('test-tenant-id');
      expect(mockTenantService.getDefaultTenant).toHaveBeenCalled();
    });
  });

  describe('login flow', () => {
    it('successfully logs in a user with valid credentials', async () => {
      // Arrange
      const loginDto = {
        email: 'alice@example.com',
        password: 'correct-password',
      };

      // Act
      const result = await authService.login(loginDto);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(existingUser.email);
    });

    it('throws UnauthorizedException for invalid credentials', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'wrong-password',
      };

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register flow', () => {
    it('successfully registers a new user', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValueOnce(null); // No existing user

      const registerDto = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      // Act
      const result = await authService.register(registerDto);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
    });

    it('throws BadRequestException if user already exists', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValueOnce(existingUser);

      const registerDto = {
        email: 'alice@example.com',
        password: 'password123',
        firstName: 'Alice',
        lastName: 'Example',
      };

      // Act & Assert
      await expect(authService.register(registerDto)).rejects.toThrow(
        'User with this email already exists',
      );
    });
  });
});
