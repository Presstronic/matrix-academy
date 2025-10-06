/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { Role } from '../src/enums/role.enum.js';
import { closeTestApp, createTestApp } from './utils/test-app.js';
import { clearDatabase, closeTestDatabase, createTestDatabase } from './utils/test-db.js';
import { generateExpiredToken, generateTestToken, TEST_USERS } from './utils/test-jwt.js';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await createTestDatabase();
    app = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp(app);
    await closeTestDatabase();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('/health (GET)', () => {
    it('should return health status without authentication', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('ok', true);
          expect(res.body).toHaveProperty('service', 'api');
          expect(res.body).toHaveProperty('timestamp');
        });
    });

    it('should return valid ISO timestamp', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          const timestamp = new Date(res.body.timestamp);
          expect(timestamp).toBeInstanceOf(Date);
          expect(timestamp.toISOString()).toBe(res.body.timestamp);
        });
    });
  });

  describe('/echo (POST)', () => {
    const validToken = generateTestToken(TEST_USERS.user);

    it('should reject request without authentication token', () => {
      return request(app.getHttpServer())
        .post('/echo')
        .send({ message: 'test' })
        .expect(401);
    });

    it('should reject request with invalid token', () => {
      return request(app.getHttpServer())
        .post('/echo')
        .set('Authorization', 'Bearer invalid-token')
        .send({ message: 'test' })
        .expect(401);
    });

    it('should reject request with expired token', () => {
      const expiredToken = generateExpiredToken(TEST_USERS.user);

      return request(app.getHttpServer())
        .post('/echo')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send({ message: 'test' })
        .expect(401);
    });

    it('should echo message with valid token', () => {
      return request(app.getHttpServer())
        .post('/echo')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ message: 'Hello World' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('ok', true);
          expect(res.body).toHaveProperty('echo');
          expect(res.body.echo).toHaveProperty('message', 'Hello World');
          expect(res.body.echo).not.toHaveProperty('age');
        });
    });

    it('should echo message with age when provided', () => {
      return request(app.getHttpServer())
        .post('/echo')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ message: 'Hello World', age: 25 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('ok', true);
          expect(res.body).toHaveProperty('echo');
          expect(res.body.echo).toHaveProperty('message', 'Hello World');
          expect(res.body.echo).toHaveProperty('age', 25);
        });
    });

    it('should validate message is required', () => {
      return request(app.getHttpServer())
        .post('/echo')
        .set('Authorization', `Bearer ${validToken}`)
        .send({})
        .expect(400);
    });

    it('should coerce numeric message to string', () => {
      return request(app.getHttpServer())
        .post('/echo')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ message: 123 })
        .expect(200)
        .expect((res) => {
          expect(res.body.echo.message).toBe('123');
        });
    });

    it('should validate age range', () => {
      const validToken2 = generateTestToken({ email: 'range@test.com', roles: [Role.USER] });

      return request(app.getHttpServer())
        .post('/echo')
        .set('Authorization', `Bearer ${validToken2}`)
        .send({ message: 'test', age: -1 })
        .expect(400);
    });
  });
});
