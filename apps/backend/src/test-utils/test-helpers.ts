/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type { DynamicModule, ForwardReference, Provider, Type } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

/**
 * Create a mock ConfigService
 */
export const createMockConfigService = (config: Record<string, unknown> = {}) => ({
  get: jest.fn((key: string) => config[key]),
  getOrThrow: jest.fn((key: string) => {
    if (!(key in config)) {
      throw new Error(`Config key ${key} not found`);
    }
    return config[key];
  }),
});

/**
 * Create a mock Reflector
 */
export const createMockReflector = () => ({
  get: jest.fn(),
  getAll: jest.fn(),
  getAllAndOverride: jest.fn(),
  getAllAndMerge: jest.fn(),
});

/**
 * Create a testing module with common providers
 */
export const createTestingModule = async (
  imports: (Type | DynamicModule | Promise<DynamicModule> | ForwardReference)[] = [],
  providers: Provider[] = [],
  controllers: Type[] = [],
) => {
  const module: TestingModule = await Test.createTestingModule({
    imports,
    controllers,
    providers,
  }).compile();

  return module;
};

/**
 * Mock Express Request
 */
export const createMockRequest = (overrides: Record<string, unknown> = {}) => ({
  headers: {},
  query: {},
  params: {},
  body: {},
  user: undefined,
  ...overrides,
});

/**
 * Mock Express Response
 */
export const createMockResponse = () => {
  const res: Record<string, unknown> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Mock ExecutionContext for guards
 */
export const createMockExecutionContext = (request: unknown = {}) => ({
  switchToHttp: () => ({
    getRequest: () => request,
    getResponse: () => createMockResponse(),
  }),
  getHandler: jest.fn(),
  getClass: jest.fn(),
  getArgs: jest.fn(),
  getArgByIndex: jest.fn(),
  switchToRpc: jest.fn(),
  switchToWs: jest.fn(),
  getType: jest.fn(),
});
