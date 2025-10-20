/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file Repository mock helper for unit tests
 */
import { jest } from '@jest/globals';
import type {
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';

/**
 * Creates a typed mock repository with commonly used methods pre-configured.
 * This eliminates the need for repetitive `any` type annotations in test files.
 *
 * @template T - The entity type this repository manages
 * @returns A partial mock of Repository<T> with Jest mock functions
 *
 * @example
 * ```typescript
 * const mockUserRepository = createMockRepository<User>();
 * mockUserRepository.findOne.mockResolvedValue(testUser);
 * mockUserRepository.save.mockResolvedValue(savedUser);
 * ```
 */
export function createMockRepository<T extends ObjectLiteral>(): MockRepository<T> {
  return {
    findOne: jest.fn<(options?: FindOneOptions<T>) => Promise<T | null>>(),
    find: jest.fn<(options?: FindManyOptions<T>) => Promise<T[]>>(),
    findAndCount: jest.fn<(options?: FindManyOptions<T>) => Promise<[T[], number]>>(),
    findOneBy: jest.fn<(where: FindOptionsWhere<T>) => Promise<T | null>>(),
    findBy: jest.fn<(where: FindOptionsWhere<T>) => Promise<T[]>>(),
    create: jest.fn<(entityLike: Partial<T>) => T>(),
    save: jest.fn<(entity: T | T[]) => Promise<T | T[]>>(),
    update:
      jest.fn<
        (criteria: FindOptionsWhere<T>, partialEntity: Partial<T>) => Promise<UpdateResult>
      >(),
    delete: jest.fn<(criteria: FindOptionsWhere<T>) => Promise<DeleteResult>>(),
    remove: jest.fn<(entity: T | T[]) => Promise<T | T[]>>(),
    count: jest.fn<(options?: FindManyOptions<T>) => Promise<number>>(),
    createQueryBuilder: jest.fn<(alias?: string) => SelectQueryBuilder<T>>(),
  } as unknown as MockRepository<T>;
}

/**
 * Type definition for a mocked repository.
 * Provides type-safe access to mocked methods while maintaining Jest mock functionality.
 */
export type MockRepository<T extends ObjectLiteral> = {
  [K in keyof Repository<T>]: Repository<T>[K] extends (...args: infer A) => infer R
    ? jest.MockedFunction<(...args: A) => R>
    : Repository<T>[K];
};
