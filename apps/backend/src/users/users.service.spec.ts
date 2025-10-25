/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file UsersService unit tests
 */
import { jest } from '@jest/globals';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Express } from 'express';
import { Readable } from 'stream';

import type { IStorageService } from '../common/services/storage/storage.interface.js';
import { User } from '../database/entities/index.js';
import { createMockRepository } from '../test-helpers/repository.mock.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let moduleRef: TestingModule;
  let service: UsersService;
  let mockUserRepository: ReturnType<typeof createMockRepository<User>>;
  let mockStorageService: jest.Mocked<IStorageService>;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashed-password',
    firstName: 'Test',
    lastName: 'User',
    tenantId: 'tenant-1',
    roles: ['user'],
    isActive: true,
    avatar: undefined,
    phoneNumber: undefined,
    bio: undefined,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  beforeEach(async () => {
    mockUserRepository = createMockRepository<User>();
    mockStorageService = {
      uploadFile: jest.fn<() => Promise<string>>(),
      deleteFile: jest.fn<() => Promise<void>>(),
      getFileUrl: jest.fn<(key: string) => string>(),
    } as jest.Mocked<IStorageService>;

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

    moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: 'STORAGE_SERVICE', useValue: mockStorageService },
      ],
    }).compile();

    service = moduleRef.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
      mockUserRepository.save.mockResolvedValueOnce({
        ...mockUser,
        firstName: 'Updated',
      });

      const result = await service.updateProfile('user-1', { firstName: 'Updated' });

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result.firstName).toBe('Updated');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.updateProfile('non-existent', { firstName: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if email is already in use', async () => {
      const existingUser = { ...mockUser, id: 'user-2' };
      mockUserRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(existingUser);

      await expect(
        service.updateProfile('user-1', { email: 'existing@example.com' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if username is already taken', async () => {
      const existingUser = { ...mockUser, id: 'user-2' };
      mockUserRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(existingUser);

      await expect(service.updateProfile('user-1', { username: 'existinguser' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow updating email to same value', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
      mockUserRepository.save.mockResolvedValueOnce(mockUser);

      const result = await service.updateProfile('user-1', { email: mockUser.email });

      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result.email).toBe(mockUser.email);
    });

    it('should allow updating username to same value', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
      mockUserRepository.save.mockResolvedValueOnce(mockUser);

      const result = await service.updateProfile('user-1', { username: mockUser.username });

      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result.username).toBe(mockUser.username);
    });

    it('should update multiple fields at once', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
      const updatedUser = {
        ...mockUser,
        firstName: 'NewFirst',
        lastName: 'NewLast',
        bio: 'New bio',
      };
      mockUserRepository.save.mockResolvedValueOnce(updatedUser);

      const result = await service.updateProfile('user-1', {
        firstName: 'NewFirst',
        lastName: 'NewLast',
        bio: 'New bio',
      });

      expect(result.firstName).toBe('NewFirst');
      expect(result.lastName).toBe('NewLast');
      expect(result.bio).toBe('New bio');
    });
  });

  describe('uploadAvatar', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'avatar',
      originalname: 'test-image.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('fake-image-data'),
      stream: new Readable(),
      destination: '',
      filename: '',
      path: '',
    };

    beforeEach(() => {
      jest
        .spyOn(service as unknown as { processAvatar: () => Promise<Buffer> }, 'processAvatar')
        .mockResolvedValue(Buffer.from('processed-image-data'));
    });

    it('should upload avatar successfully', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
      mockStorageService.uploadFile.mockResolvedValueOnce('http://storage/avatar.jpg');
      mockUserRepository.save.mockResolvedValueOnce({
        ...mockUser,
        avatar: 'http://storage/avatar.jpg',
      });

      const result = await service.uploadAvatar('user-1', mockFile);

      expect(mockStorageService.uploadFile).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.stringContaining('avatars/user-1/'),
        'image/jpeg',
      );
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result.avatar).toBe('http://storage/avatar.jpg');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.uploadAvatar('non-existent', mockFile)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete old avatar before uploading new one', async () => {
      const userWithAvatar = { ...mockUser, avatar: 'http://storage/old-avatar.jpg' };
      mockUserRepository.findOne.mockResolvedValueOnce(userWithAvatar);
      mockStorageService.deleteFile.mockResolvedValueOnce();
      mockStorageService.uploadFile.mockResolvedValueOnce('http://storage/new-avatar.jpg');
      mockUserRepository.save.mockResolvedValueOnce({
        ...userWithAvatar,
        avatar: 'http://storage/new-avatar.jpg',
      });

      const result = await service.uploadAvatar('user-1', mockFile);

      expect(mockStorageService.deleteFile).toHaveBeenCalledWith('http://storage/old-avatar.jpg');
      expect(result.avatar).toBe('http://storage/new-avatar.jpg');
    });

    it('should continue if old avatar deletion fails', async () => {
      const userWithAvatar = { ...mockUser, avatar: 'http://storage/old-avatar.jpg' };
      mockUserRepository.findOne.mockResolvedValueOnce(userWithAvatar);
      mockStorageService.deleteFile.mockRejectedValueOnce(new Error('Delete failed'));
      mockStorageService.uploadFile.mockResolvedValueOnce('http://storage/new-avatar.jpg');
      mockUserRepository.save.mockResolvedValueOnce({
        ...userWithAvatar,
        avatar: 'http://storage/new-avatar.jpg',
      });

      const result = await service.uploadAvatar('user-1', mockFile);

      expect(result.avatar).toBe('http://storage/new-avatar.jpg');
    });

    it('should handle files without extension', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
      mockStorageService.uploadFile.mockResolvedValueOnce('http://storage/avatar.jpg');
      mockUserRepository.save.mockResolvedValueOnce({
        ...mockUser,
        avatar: 'http://storage/avatar.jpg',
      });

      const fileWithoutExt = { ...mockFile, originalname: 'avatar' };

      const result = await service.uploadAvatar('user-1', fileWithoutExt);

      expect(mockStorageService.uploadFile).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.stringMatching(/avatars\/user-1\/.*\.jpg$/),
        'image/jpeg',
      );
      expect(result.avatar).toBe('http://storage/avatar.jpg');
    });
  });

  describe('removeAvatar', () => {
    it('should remove avatar successfully', async () => {
      const userWithAvatar = { ...mockUser, avatar: 'http://storage/avatar.jpg' };
      mockUserRepository.findOne.mockResolvedValueOnce(userWithAvatar);
      mockStorageService.deleteFile.mockResolvedValueOnce();
      mockUserRepository.save.mockResolvedValueOnce({ ...userWithAvatar, avatar: undefined });

      const result = await service.removeAvatar('user-1');

      expect(mockStorageService.deleteFile).toHaveBeenCalledWith('http://storage/avatar.jpg');
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result.avatar).toBeUndefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.removeAvatar('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should continue if avatar deletion fails', async () => {
      const userWithAvatar = { ...mockUser, avatar: 'http://storage/avatar.jpg' };
      mockUserRepository.findOne.mockResolvedValueOnce(userWithAvatar);
      mockStorageService.deleteFile.mockRejectedValueOnce(new Error('Delete failed'));
      mockUserRepository.save.mockResolvedValueOnce({ ...userWithAvatar, avatar: undefined });

      const result = await service.removeAvatar('user-1');

      expect(result.avatar).toBeUndefined();
    });
  });
});
