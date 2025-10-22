/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file users.service.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import type { Repository } from 'typeorm';

import { UserResponseDto } from '../auth/dto/auth-response.dto.js';
import { User } from '../database/entities/index.js';
import type { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUserWithEmail = await this.userRepository.findOne({
        where: { email: updateProfileDto.email },
      });

      if (existingUserWithEmail) {
        throw new BadRequestException('Email address is already in use');
      }
    }

    // Check if username is being changed and if it's already taken
    if (updateProfileDto.username && updateProfileDto.username !== user.username) {
      const existingUserWithUsername = await this.userRepository.findOne({
        where: { username: updateProfileDto.username },
      });

      if (existingUserWithUsername) {
        throw new BadRequestException('Username is already taken');
      }
    }

    // Update only provided fields
    if (updateProfileDto.firstName !== undefined) {
      user.firstName = updateProfileDto.firstName;
    }

    if (updateProfileDto.lastName !== undefined) {
      user.lastName = updateProfileDto.lastName;
    }

    if (updateProfileDto.email !== undefined) {
      user.email = updateProfileDto.email;
    }

    if (updateProfileDto.username !== undefined) {
      user.username = updateProfileDto.username;
    }

    if (updateProfileDto.phoneNumber !== undefined) {
      user.phoneNumber = updateProfileDto.phoneNumber;
    }

    if (updateProfileDto.bio !== undefined) {
      user.bio = updateProfileDto.bio;
    }

    const updatedUser = await this.userRepository.save(user);

    return plainToInstance(UserResponseDto, updatedUser);
  }
}
