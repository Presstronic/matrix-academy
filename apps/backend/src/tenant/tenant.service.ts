/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file tenant.service.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { Tenant } from '../database/entities/tenant.entity.js';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  /**
   * Get the default tenant for individual user registrations
   */
  async getDefaultTenant(): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { slug: 'individual' },
    });

    if (!tenant) {
      throw new NotFoundException('Default tenant not found. Please run database migrations.');
    }

    return tenant;
  }

  /**
   * Get the default tenant ID for individual user registrations
   */
  async getDefaultTenantId(): Promise<string> {
    const tenant = await this.getDefaultTenant();
    return tenant.id;
  }

  /**
   * Find tenant by ID
   */
  async findById(id: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({ where: { id } });
  }

  /**
   * Find tenant by slug
   */
  async findBySlug(slug: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({ where: { slug } });
  }
}
