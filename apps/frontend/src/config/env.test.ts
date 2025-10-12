/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file Tests for environment configuration
 */
import { describe, expect, it } from 'vitest';

import { env } from './env';

describe('env', () => {
  it('should have apiBaseUrl defined', () => {
    expect(env.apiBaseUrl).toBeDefined();
    expect(typeof env.apiBaseUrl).toBe('string');
  });

  it('should have apiTimeout defined as number', () => {
    expect(env.apiTimeout).toBeDefined();
    expect(typeof env.apiTimeout).toBe('number');
    expect(env.apiTimeout).toBeGreaterThan(0);
  });

  it('should have apiRetryAttempts defined as number', () => {
    expect(env.apiRetryAttempts).toBeDefined();
    expect(typeof env.apiRetryAttempts).toBe('number');
    expect(env.apiRetryAttempts).toBeGreaterThanOrEqual(0);
  });

  it('should have environment flags', () => {
    expect(typeof env.isDevelopment).toBe('boolean');
    expect(typeof env.isProduction).toBe('boolean');
    expect(typeof env.isTest).toBe('boolean');
  });

  it('should have correct default values', () => {
    // Default timeout should be 30 seconds
    expect(env.apiTimeout).toBe(30000);
    // Default retry attempts should be 3
    expect(env.apiRetryAttempts).toBe(3);
  });

  it('should be in test mode', () => {
    // When running tests, MODE should be 'test'
    expect(env.isTest).toBe(true);
    expect(env.isDevelopment).toBe(false);
    expect(env.isProduction).toBe(false);
  });
});
