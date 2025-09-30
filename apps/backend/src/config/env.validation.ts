/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import Joi from 'joi';

export interface EnvironmentVariables {
  // App
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;

  // Database
  DATABASE_URL: string;
  DATABASE_SSL: boolean;
  DATABASE_LOGGING: boolean;

  // CORS
  CORS_ORIGINS: string;

  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;

  // Redis
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD?: string;

  // Logging
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';

  // Security
  THROTTLE_TTL: number;
  THROTTLE_LIMIT: number;
}

export const validationSchema = Joi.object<EnvironmentVariables>({
  // App
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development')
    .description('Application environment'),

  PORT: Joi.number().port().default(3000).description('Port for the backend server'),

  // Database
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .required()
    .description('PostgreSQL connection string'),

  DATABASE_SSL: Joi.boolean().default(false).description('Enable SSL for database connection'),

  DATABASE_LOGGING: Joi.boolean().default(false).description('Enable TypeORM query logging'),

  // CORS
  CORS_ORIGINS: Joi.string()
    .required()
    .description('Comma-separated list of allowed CORS origins')
    .example('http://localhost:3001,http://localhost:5173'),

  // JWT
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .description('Secret key for signing JWT access tokens'),

  JWT_EXPIRES_IN: Joi.string()
    .pattern(/^\d+[smhd]$/)
    .default('15m')
    .description('JWT access token expiration (e.g., 15m, 1h, 7d)'),

  JWT_REFRESH_SECRET: Joi.string()
    .min(32)
    .required()
    .description('Secret key for signing JWT refresh tokens'),

  JWT_REFRESH_EXPIRES_IN: Joi.string()
    .pattern(/^\d+[smhd]$/)
    .default('7d')
    .description('JWT refresh token expiration (e.g., 15m, 1h, 7d)'),

  // Redis
  REDIS_HOST: Joi.string().hostname().default('localhost').description('Redis host'),

  REDIS_PORT: Joi.number().port().default(6379).description('Redis port'),

  REDIS_PASSWORD: Joi.string().optional().description('Redis password (if required)'),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
    .default('info')
    .description('Logging level'),

  // Security
  THROTTLE_TTL: Joi.number()
    .integer()
    .min(1)
    .default(60)
    .description('Rate limit time window in seconds'),

  THROTTLE_LIMIT: Joi.number()
    .integer()
    .min(1)
    .default(100)
    .description('Maximum requests per time window'),
});

/**
 * Validates environment variables against the schema
 * Throws an error if validation fails
 */
export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const result = validationSchema.validate(config, {
    abortEarly: false,
    allowUnknown: true, // Allow other env vars (like CI variables)
    stripUnknown: false, // Keep unknown vars in process.env
  });

  if (result.error) {
    const errors = result.error.details.map((detail) => detail.message).join(', ');
    throw new Error(`Environment validation failed: ${errors}`);
  }

  return result.value;
}
