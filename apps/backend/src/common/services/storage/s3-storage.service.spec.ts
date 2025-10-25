/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file S3StorageService unit tests
 */
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { jest } from '@jest/globals';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { S3StorageService } from './s3-storage.service.js';

describe('S3StorageService', () => {
  let moduleRef: TestingModule;
  let service: S3StorageService;
  let mockConfigService: ConfigService;
  let mockS3ClientSend: ReturnType<typeof jest.spyOn>;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        const config: Record<string, string> = {
          S3_BUCKET_NAME: 'test-bucket',
          S3_ENDPOINT: 'http://localhost:9000',
          S3_REGION: 'us-east-1',
          S3_FORCE_PATH_STYLE: 'true',
          S3_ACCESS_KEY_ID: 'test-access-key',
          S3_SECRET_ACCESS_KEY: 'test-secret-key',
        };
        return config[key] ?? defaultValue;
      }),
    } as unknown as ConfigService;

    mockS3ClientSend = jest.spyOn(S3Client.prototype, 'send').mockResolvedValue({} as never);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

    moduleRef = await Test.createTestingModule({
      providers: [S3StorageService, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();

    service = moduleRef.get<S3StorageService>(S3StorageService);
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

  describe('constructor', () => {
    it('should throw error if access keys are missing', async () => {
      const badConfigService = {
        get: jest.fn((key: string) => {
          if (key === 'S3_ACCESS_KEY_ID' || key === 'S3_SECRET_ACCESS_KEY') return undefined;
          return 'some-value';
        }),
      } as unknown as ConfigService;

      await expect(
        Test.createTestingModule({
          providers: [S3StorageService, { provide: ConfigService, useValue: badConfigService }],
        }).compile(),
      ).rejects.toThrow('S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY must be set');
    });
  });

  describe('onModuleInit', () => {
    it('should ensure bucket exists and set policy', async () => {
      mockS3ClientSend
        .mockResolvedValueOnce({} as never) // HeadBucketCommand
        .mockResolvedValueOnce({} as never); // PutBucketPolicyCommand

      await service.onModuleInit();

      expect(mockS3ClientSend).toHaveBeenCalledTimes(2);
      expect(mockS3ClientSend).toHaveBeenNthCalledWith(1, expect.any(HeadBucketCommand));
      expect(mockS3ClientSend).toHaveBeenNthCalledWith(2, expect.any(PutBucketPolicyCommand));
    });

    it('should create bucket if it does not exist', async () => {
      const notFoundError = new Error('NotFound');
      (notFoundError as Error & { name: string }).name = 'NotFound';

      mockS3ClientSend
        .mockRejectedValueOnce(notFoundError) // HeadBucketCommand fails
        .mockResolvedValueOnce({} as never) // CreateBucketCommand
        .mockResolvedValueOnce({} as never); // PutBucketPolicyCommand

      await service.onModuleInit();

      expect(mockS3ClientSend).toHaveBeenCalledTimes(3);
      expect(mockS3ClientSend).toHaveBeenNthCalledWith(1, expect.any(HeadBucketCommand));
      expect(mockS3ClientSend).toHaveBeenNthCalledWith(2, expect.any(CreateBucketCommand));
      expect(mockS3ClientSend).toHaveBeenNthCalledWith(3, expect.any(PutBucketPolicyCommand));
    });

    it('should throw error if bucket creation fails', async () => {
      mockS3ClientSend.mockRejectedValueOnce(new Error('S3 Connection Error'));

      await expect(service.onModuleInit()).rejects.toThrow('S3 Connection Error');
    });
  });

  describe('uploadFile', () => {
    beforeEach(async () => {
      mockS3ClientSend
        .mockResolvedValueOnce({} as never) // HeadBucketCommand in onModuleInit
        .mockResolvedValueOnce({} as never); // PutBucketPolicyCommand in onModuleInit
      await service.onModuleInit();
      jest.clearAllMocks();
    });

    it('should upload file successfully', async () => {
      mockS3ClientSend.mockResolvedValueOnce({} as never);

      const buffer = Buffer.from('test file content');
      const key = 'test/file.jpg';
      const contentType = 'image/jpeg';

      const url = await service.uploadFile(buffer, key, contentType);

      expect(mockS3ClientSend).toHaveBeenCalledWith(expect.any(PutObjectCommand));
      expect(url).toBe('http://localhost:9000/test-bucket/test/file.jpg');
    });

    it('should throw error if upload fails', async () => {
      mockS3ClientSend.mockRejectedValueOnce(new Error('Upload failed'));

      const buffer = Buffer.from('test file content');
      const key = 'test/file.jpg';
      const contentType = 'image/jpeg';

      await expect(service.uploadFile(buffer, key, contentType)).rejects.toThrow('Upload failed');
    });
  });

  describe('deleteFile', () => {
    beforeEach(async () => {
      mockS3ClientSend
        .mockResolvedValueOnce({} as never) // HeadBucketCommand in onModuleInit
        .mockResolvedValueOnce({} as never); // PutBucketPolicyCommand in onModuleInit
      await service.onModuleInit();
      jest.clearAllMocks();
    });

    it('should delete file successfully', async () => {
      mockS3ClientSend.mockResolvedValueOnce({} as never);

      const url = 'http://localhost:9000/test-bucket/test/file.jpg';

      await service.deleteFile(url);

      expect(mockS3ClientSend).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
    });

    it('should not throw error if file does not exist', async () => {
      const noSuchKeyError = new Error('NoSuchKey');
      (noSuchKeyError as Error & { name: string }).name = 'NoSuchKey';

      mockS3ClientSend.mockRejectedValueOnce(noSuchKeyError);

      const url = 'http://localhost:9000/test-bucket/test/file.jpg';

      await expect(service.deleteFile(url)).resolves.not.toThrow();
    });

    it('should throw error for other deletion failures', async () => {
      mockS3ClientSend.mockRejectedValueOnce(new Error('Access denied'));

      const url = 'http://localhost:9000/test-bucket/test/file.jpg';

      await expect(service.deleteFile(url)).rejects.toThrow('Access denied');
    });
  });

  describe('getFileUrl', () => {
    beforeEach(async () => {
      mockS3ClientSend
        .mockResolvedValueOnce({} as never) // HeadBucketCommand in onModuleInit
        .mockResolvedValueOnce({} as never); // PutBucketPolicyCommand in onModuleInit
      await service.onModuleInit();
      jest.clearAllMocks();
    });

    it('should generate correct MinIO URL', () => {
      const key = 'test/file.jpg';
      const url = service.getFileUrl(key);

      expect(url).toBe('http://localhost:9000/test-bucket/test/file.jpg');
    });

    it('should generate correct AWS S3 URL when endpoint is not set', async () => {
      const awsConfigService = {
        get: jest.fn((key: string, defaultValue?: string) => {
          const config: Record<string, string> = {
            S3_BUCKET_NAME: 'test-bucket',
            S3_REGION: 'us-west-2',
            S3_ACCESS_KEY_ID: 'test-access-key',
            S3_SECRET_ACCESS_KEY: 'test-secret-key',
          };
          return config[key] ?? defaultValue;
        }),
      } as unknown as ConfigService;

      mockS3ClientSend
        .mockResolvedValueOnce({} as never) // HeadBucketCommand
        .mockResolvedValueOnce({} as never); // PutBucketPolicyCommand

      const awsModule = await Test.createTestingModule({
        providers: [S3StorageService, { provide: ConfigService, useValue: awsConfigService }],
      }).compile();

      const awsService = awsModule.get<S3StorageService>(S3StorageService);
      await awsService.onModuleInit();

      const key = 'test/file.jpg';
      const url = awsService.getFileUrl(key);

      expect(url).toBe('https://test-bucket.s3.us-west-2.amazonaws.com/test/file.jpg');

      await awsModule.close();
    });
  });
});
