/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file auth.e2e-spec.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
import { faker } from '@faker-js/faker';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { closeTestApp, createTestApp } from './utils/test-app.js';
import { clearDatabase, closeTestDatabase, createTestDatabase } from './utils/test-db.js';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  const testTenantId = faker.string.uuid();

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

  describe('POST /auth/register', () => {
    it('should register a new user successfully', () => {
      const registerDto = {
        email: faker.internet.email(),
        password: 'Test123456!',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        tenantId: testTenantId,
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body.data).toHaveProperty('accessToken');
          expect(res.body.data).toHaveProperty('refreshToken');
          expect(res.body.data).toHaveProperty('user');
          expect(res.body.data.user.email).toBe(registerDto.email);
          expect(res.body.data.user).not.toHaveProperty('password');
          expect(res.body.data.user.roles).toContain('user');
        });
    });

    it('should reject registration with duplicate email', async () => {
      const registerDto = {
        email: faker.internet.email(),
        password: 'Test123456!',
        tenantId: testTenantId,
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400);
    });

    it('should reject registration with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Test123456!',
          tenantId: testTenantId,
        })
        .expect(400);
    });

    it('should reject registration with short password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: faker.internet.email(),
          password: 'short',
          tenantId: testTenantId,
        })
        .expect(400);
    });

    it('should reject registration without required fields', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({})
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    const userCredentials = {
      email: faker.internet.email(),
      password: 'Test123456!',
      tenantId: testTenantId,
    };

    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userCredentials);
    });

    it('should login successfully with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userCredentials.email,
          password: userCredentials.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body.data).toHaveProperty('accessToken');
          expect(res.body.data).toHaveProperty('refreshToken');
          expect(res.body.data).toHaveProperty('user');
          expect(res.body.data.user.email).toBe(userCredentials.email);
        });
    });

    it('should reject login with incorrect password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userCredentials.email,
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should reject login with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: faker.internet.email(),
          password: 'Test123456!',
        })
        .expect(401);
    });

    it('should reject login with missing credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });
  });

  describe('POST /auth/refresh', () => {
    const userCredentials = {
      email: faker.internet.email(),
      password: 'Test123456!',
      tenantId: testTenantId,
    };

    let refreshToken: string;

    beforeEach(async () => {
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userCredentials);

      refreshToken = registerResponse.body.data.refreshToken;
    });

    it('should refresh tokens successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body.data).toHaveProperty('accessToken');
          expect(res.body.data).toHaveProperty('refreshToken');
          expect(res.body.data.refreshToken).not.toBe(refreshToken);
        });
    });

    it('should reject refresh with invalid token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });

    it('should reject refresh with already used token (rotation)', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    const userCredentials = {
      email: faker.internet.email(),
      password: 'Test123456!',
      tenantId: testTenantId,
    };

    let accessToken: string;
    let refreshToken: string;

    beforeEach(async () => {
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userCredentials);

      accessToken = registerResponse.body.data.accessToken;
      refreshToken = registerResponse.body.data.refreshToken;
    });

    it('should logout successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(204);
    });

    it('should invalidate refresh token after logout', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(204);

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });

    it('should reject logout without authentication', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .send({ refreshToken })
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    const userCredentials = {
      email: faker.internet.email(),
      password: 'Test123456!',
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      tenantId: testTenantId,
    };

    let accessToken: string;

    beforeEach(async () => {
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userCredentials);

      accessToken = registerResponse.body.data.accessToken;
    });

    it('should return current user information', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data).toHaveProperty('email', userCredentials.email);
          expect(res.body.data).toHaveProperty('firstName', userCredentials.firstName);
          expect(res.body.data).toHaveProperty('lastName', userCredentials.lastName);
          expect(res.body.data).toHaveProperty('roles');
          expect(res.body.data).not.toHaveProperty('password');
        });
    });

    it('should reject request without authentication', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });

    it('should reject request with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Authentication Flow', () => {
    it('should complete full registration > login > refresh > logout flow', async () => {
      const userCredentials = {
        email: faker.internet.email(),
        password: 'Test123456!',
        tenantId: testTenantId,
      };

      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userCredentials)
        .expect(201);

      expect(registerRes.body.data).toHaveProperty('accessToken');
      const firstRefreshToken = registerRes.body.data.refreshToken;

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userCredentials.email,
          password: userCredentials.password,
        })
        .expect(200);

      const accessToken = loginRes.body.data.accessToken;
      const secondRefreshToken = loginRes.body.data.refreshToken;

      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const refreshRes = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: secondRefreshToken })
        .expect(200);

      const newAccessToken = refreshRes.body.data.accessToken;
      const thirdRefreshToken = refreshRes.body.data.refreshToken;

      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .send({ refreshToken: thirdRefreshToken })
        .expect(204);

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: thirdRefreshToken })
        .expect(401);

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: firstRefreshToken })
        .expect(401);
    });
  });
});
