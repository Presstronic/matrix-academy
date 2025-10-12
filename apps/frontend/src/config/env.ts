/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file Environment configuration for API URLs and settings
 */
interface EnvConfig {
  apiBaseUrl: string;
  apiTimeout: number;
  apiRetryAttempts: number;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
}

/**
 * Get the API base URL based on the current environment
 */
function getApiBaseUrl(): string {
  // Check for environment variable first (from .env files)
  if (import.meta.env.VITE_API_BASE_URL) {
    return String(import.meta.env.VITE_API_BASE_URL);
  }

  // Default based on mode
  const mode = import.meta.env.MODE;

  switch (mode) {
    case 'production':
      // In production, API should be on the same domain
      return '/api';
    case 'test':
      // In test mode, use mock URL
      return 'http://localhost:3000/api';
    case 'development':
    default:
      // In development, backend runs on port 3000
      return 'http://localhost:3000/api';
  }
}

/**
 * Environment configuration
 */
export const env: EnvConfig = {
  apiBaseUrl: getApiBaseUrl(),
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000, // 30 seconds default
  apiRetryAttempts: Number(import.meta.env.VITE_API_RETRY_ATTEMPTS) || 3,
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
  isTest: import.meta.env.MODE === 'test',
};
