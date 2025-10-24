/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file users.service.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import type { Express } from 'express';
import sharp from 'sharp';
import type { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { UserResponseDto } from '../auth/dto/auth-response.dto.js';
import type { IStorageService } from '../common/services/storage/storage.interface.js';
import { User } from '../database/entities/index.js';
import type { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject('STORAGE_SERVICE')
    private readonly storageService: IStorageService,
  ) {}

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Email uniqueness
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUserWithEmail = await this.userRepository.findOne({
        where: { email: updateProfileDto.email },
      });
      if (existingUserWithEmail) throw new BadRequestException('Email address is already in use');
    }

    // Username uniqueness
    if (updateProfileDto.username && updateProfileDto.username !== user.username) {
      const existingUserWithUsername = await this.userRepository.findOne({
        where: { username: updateProfileDto.username },
      });
      if (existingUserWithUsername) throw new BadRequestException('Username is already taken');
    }

    // Patch only provided fields
    if (updateProfileDto.firstName !== undefined) user.firstName = updateProfileDto.firstName;
    if (updateProfileDto.lastName !== undefined) user.lastName = updateProfileDto.lastName;
    if (updateProfileDto.email !== undefined) user.email = updateProfileDto.email;
    if (updateProfileDto.username !== undefined) user.username = updateProfileDto.username;
    if (updateProfileDto.phoneNumber !== undefined) user.phoneNumber = updateProfileDto.phoneNumber;
    if (updateProfileDto.bio !== undefined) user.bio = updateProfileDto.bio;

    const updatedUser = await this.userRepository.save(user);
    return plainToInstance(UserResponseDto, updatedUser);
  }

  /**
   * Validate Multer file at runtime (defensive)
   */
  private validateMulterFile(file: Express.Multer.File): void {
    if (!file) throw new BadRequestException('No file provided');
    if (!Buffer.isBuffer(file.buffer)) throw new BadRequestException('Invalid file buffer');
    if (typeof file.originalname !== 'string' || file.originalname.trim().length === 0) {
      throw new BadRequestException('Invalid original file name');
    }
  }

  /**
   * Process and resize avatar image
   */
  private async processAvatar(file: Express.Multer.File): Promise<Buffer> {
    this.validateMulterFile(file);
    const input: Buffer = file.buffer; // typed Buffer, satisfies no-unsafe-argument
    return sharp(input)
      .resize(500, 500, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 90 })
      .toBuffer();
  }

  /**
   * Compute a safe filename extension from originalname
   */
  private deriveExtension(originalName: string): string {
    const name: string = originalName.trim();
    const dotIdx: number = name.lastIndexOf('.');
    const hasExt: boolean = dotIdx > -1 && dotIdx < name.length - 1;
    return hasExt ? name.slice(dotIdx + 1) : 'jpg';
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Best-effort delete of old avatar
    if (user.avatar) {
      try {
        await this.storageService.deleteFile(user.avatar);
      } catch (err) {
        this.logger.warn(
          `Failed to delete old avatar for user ${userId}: ${(err as Error).message}`,
        );
      }
    }

    // Process (validates file)
    const processedBuffer = await this.processAvatar(file);

    // Safe filename generation
    const originalName: string = file.originalname.trim() || 'avatar.jpg';
    const extension: string = this.deriveExtension(originalName);
    const filename = `avatars/${userId}/${uuidv4()}.${extension}`;

    // Upload to storage
    const avatarUrl = await this.storageService.uploadFile(processedBuffer, filename, 'image/jpeg');

    // Persist on user
    user.avatar = avatarUrl;
    const updatedUser = await this.userRepository.save(user);
    return plainToInstance(UserResponseDto, updatedUser);
  }

  /**
   * Remove user avatar
   */
  async removeAvatar(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.avatar) {
      try {
        await this.storageService.deleteFile(user.avatar);
      } catch (err) {
        this.logger.warn(
          `Failed to delete avatar file for user ${userId}: ${(err as Error).message}`,
        );
      }
    }

    user.avatar = undefined;
    const updatedUser = await this.userRepository.save(user);
    return plainToInstance(UserResponseDto, updatedUser);
  }
}
