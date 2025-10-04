/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import 'reflect-metadata';

import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

import { AppModule } from './app.module.js';
import { ThrottlerExceptionFilter } from './common/guards/throttler-exception.filter.js';

async function bootstrap(): Promise<void> {

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(',').map((origin) => origin.trim()) ?? [],
      credentials: true,
    },
  });

  // Configure Helmet based on environment
  const isProduction = process.env.NODE_ENV === 'production';
  app.use(
    helmet({
      contentSecurityPolicy: isProduction ? undefined : false,
      crossOriginEmbedderPolicy: isProduction ? undefined : false,
    }),
  );

  // Set request body size limit to 10mb
  app.useBodyParser('json', { limit: '10mb' });
  app.useBodyParser('urlencoded', { limit: '10mb', extended: true });

  app.useGlobalFilters(new ThrottlerExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, // keep transform ON
      validationError: { target: false, value: false },
      forbidUnknownValues: false,
    }),
  );

  app.enableVersioning({ type: VersioningType.URI });
  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  new Logger('Bootstrap').log(`Backend listening at http://localhost:${port}`);
}

bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  const reason =
    err instanceof Error
      ? (err.stack ?? err.message)
      : typeof err === 'string'
        ? err
        : JSON.stringify(err);
  logger.error('Fatal error during bootstrap', reason);
  process.exit(1);
});
