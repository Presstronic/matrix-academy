/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file s3-storage.service.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { IStorageService } from './storage.interface.js';

/**
 * S3-compatible storage service
 * Works with AWS S3, MinIO, Cloudflare R2, Backblaze B2, etc.
 */
@Injectable()
export class S3StorageService implements IStorageService, OnModuleInit {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly endpoint: string | undefined;
  private readonly region: string;
  private readonly forcePathStyle: boolean;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('S3_BUCKET_NAME', 'matrix-academy');
    this.endpoint = this.configService.get<string>('S3_ENDPOINT');
    this.region = this.configService.get<string>('S3_REGION', 'us-east-1');
    this.forcePathStyle = this.configService.get<string>('S3_FORCE_PATH_STYLE') === 'true';

    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('S3_SECRET_ACCESS_KEY');

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY must be set');
    }

    this.s3Client = new S3Client({
      endpoint: this.endpoint,
      region: this.region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: this.forcePathStyle, // Required for MinIO
    });

    this.logger.log(
      `S3 Storage initialized: endpoint=${this.endpoint ?? 'AWS S3'}, bucket=${this.bucketName}, region=${this.region}`,
    );
  }

  /**
   * Ensure bucket exists on module initialization
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.ensureBucketExists();
      await this.setBucketPolicy();
    } catch (error) {
      this.logger.error('Failed to initialize storage bucket', error);
      throw error;
    }
  }

  /**
   * Check if bucket exists, create it if it doesn't
   */
  private async ensureBucketExists(): Promise<void> {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      this.logger.log(`Bucket '${this.bucketName}' already exists`);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'name' in error && error.name === 'NotFound') {
        this.logger.log(`Bucket '${this.bucketName}' not found, creating...`);
        await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
        this.logger.log(`Bucket '${this.bucketName}' created successfully`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Set bucket policy to allow public read access
   */
  private async setBucketPolicy(): Promise<void> {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucketName}/*`],
        },
      ],
    };

    try {
      await this.s3Client.send(
        new PutBucketPolicyCommand({
          Bucket: this.bucketName,
          Policy: JSON.stringify(policy),
        }),
      );
      this.logger.log(`Bucket policy set for public read access on '${this.bucketName}'`);
    } catch (error) {
      this.logger.error(`Failed to set bucket policy for '${this.bucketName}'`, error);
      throw error;
    }
  }

  /**
   * Upload a file to S3/MinIO
   */
  async uploadFile(file: Buffer, key: string, contentType: string): Promise<string> {
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file,
          ContentType: contentType,
        }),
      );

      const url = this.getFileUrl(key);
      this.logger.log(`File uploaded successfully: ${key}`);
      return url;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${key}`, error);
      throw error;
    }
  }

  /**
   * Delete a file from S3/MinIO
   */
  async deleteFile(url: string): Promise<void> {
    try {
      const key = this.extractKeyFromUrl(url);

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );

      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${url}`, error);
      // Don't throw error if file doesn't exist
      if (error && typeof error === 'object' && 'name' in error && error.name === 'NoSuchKey') {
        this.logger.warn(`File not found for deletion: ${url}`);
        return;
      }
      throw error;
    }
  }

  /**
   * Get the public URL for a file
   */
  getFileUrl(key: string): string {
    if (this.endpoint) {
      // MinIO or custom S3-compatible endpoint
      const cleanEndpoint = this.endpoint.replace(/\/$/, '');
      return `${cleanEndpoint}/${this.bucketName}/${key}`;
    } else {
      // AWS S3
      return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
    }
  }

  /**
   * Extract storage key from URL
   */
  private extractKeyFromUrl(url: string): string {
    if (this.endpoint) {
      // MinIO format: http://endpoint/bucket/key
      const cleanEndpoint = this.endpoint.replace(/\/$/, '');
      const prefix = `${cleanEndpoint}/${this.bucketName}/`;
      return url.replace(prefix, '');
    } else {
      // AWS S3 format: https://bucket.s3.region.amazonaws.com/key
      const s3UrlPattern = new RegExp(
        `https://${this.bucketName}\\.s3\\.${this.region}\\.amazonaws\\.com/`,
      );
      return url.replace(s3UrlPattern, '');
    }
  }
}
