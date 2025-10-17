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
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { closeTestApp, createTestApp } from './utils/test-app.js';
import { withCsrf } from './utils/test-csrf.js';
import { clearDatabase, closeTestDatabase, createTestDatabase } from './utils/test-db.js';

/**
 * Extract a cookie value from Set-Cookie headers
 */
function getCookieValue(cookies: string[], cookieName: string): string | null {
  const cookie = cookies.find((c) => c.startsWith(`${cookieName}=`));
  if (!cookie) return null;
  const match = new RegExp(`${cookieName}=([^;]+)`).exec(cookie);
  return match ? match[1] : null;
}

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
          expect(res.body.data).toHaveProperty('user');
          expect(res.body.data.user.email).toBe(registerDto.email);
          expect(res.body.data.user).not.toHaveProperty('password');
          expect(res.body.data.user.roles).toContain('user');
          expect(res.headers['set-cookie']).toBeDefined();
          const cookies = res.headers['set-cookie'] as unknown as string[];
          expect(cookies.some((c: string) => c.startsWith('access_token='))).toBe(true);
          expect(cookies.some((c: string) => c.startsWith('refresh_token='))).toBe(true);
          expect(cookies.some((c: string) => c.startsWith('csrf_token='))).toBe(true);
        });
    });

    it('should reject registration with duplicate email', async () => {
      const registerDto = {
        email: faker.internet.email(),
        password: 'Test123456!',
        tenantId: testTenantId,
      };

      await request(app.getHttpServer()).post('/auth/register').send(registerDto).expect(201);

      return request(app.getHttpServer()).post('/auth/register').send(registerDto).expect(400);
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
      return request(app.getHttpServer()).post('/auth/register').send({}).expect(400);
    });
  });

  describe('POST /auth/login', () => {
    const userCredentials = {
      email: faker.internet.email(),
      password: 'Test123456!',
      tenantId: testTenantId,
    };

    beforeEach(async () => {
      await request(app.getHttpServer()).post('/auth/register').send(userCredentials);
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
          expect(res.body.data).toHaveProperty('user');
          expect(res.body.data.user.email).toBe(userCredentials.email);
          const cookies = res.headers['set-cookie'] as unknown as string[];
          expect(getCookieValue(cookies, 'access_token')).toBeTruthy();
          expect(getCookieValue(cookies, 'refresh_token')).toBeTruthy();
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
      return request(app.getHttpServer()).post('/auth/login').send({}).expect(400);
    });
  });

  describe('POST /auth/refresh', () => {
    const userCredentials = {
      email: faker.internet.email(),
      password: 'Test123456!',
      tenantId: testTenantId,
    };

    let cookies: string[];

    beforeEach(async () => {
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userCredentials);

      cookies = registerResponse.headers['set-cookie'] as unknown as string[];
    });

    it('should refresh tokens successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', `refresh_token=${getCookieValue(cookies, 'refresh_token')}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          const newCookies = res.headers['set-cookie'] as unknown as string[];
          const newRefreshToken = getCookieValue(newCookies, 'refresh_token');
          expect(newRefreshToken).toBeTruthy();
          expect(getCookieValue(cookies, 'refresh_token')).not.toBe(newRefreshToken);
        });
    });

    it('should reject refresh with invalid token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', 'refresh_token=invalid-token')
        .expect(401);
    });

    it('should reject refresh with already used token (rotation)', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', `refresh_token=${getCookieValue(cookies, 'refresh_token')}`)
        .expect(200);

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', `refresh_token=${getCookieValue(cookies, 'refresh_token')}`)
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    const userCredentials = {
      email: faker.internet.email(),
      password: 'Test123456!',
      tenantId: testTenantId,
    };

    let cookies: string[];

    beforeEach(async () => {
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userCredentials);

      cookies = registerResponse.headers['set-cookie'] as unknown as string[];
    });

    it('should logout successfully', () => {
      const cookieHeader = `access_token=${getCookieValue(cookies, 'access_token')}; refresh_token=${getCookieValue(cookies, 'refresh_token')}`;
      return withCsrf(request(app.getHttpServer()).post('/auth/logout'), cookieHeader).expect(204);
    });

    it('should invalidate refresh token after logout', async () => {
      const cookieHeader = `access_token=${getCookieValue(cookies, 'access_token')}; refresh_token=${getCookieValue(cookies, 'refresh_token')}`;
      await withCsrf(request(app.getHttpServer()).post('/auth/logout'), cookieHeader).expect(204);

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', `refresh_token=${getCookieValue(cookies, 'refresh_token')}`)
        .expect(401);
    });

    it('should reject logout without authentication', () => {
      return request(app.getHttpServer()).post('/auth/logout').expect(401);
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

    let cookies: string[];

    beforeEach(async () => {
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userCredentials);

      cookies = registerResponse.headers['set-cookie'] as unknown as string[];
    });

    it('should return current user information', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', `access_token=${getCookieValue(cookies, 'access_token')}`)
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
      return request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should reject request with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', 'access_token=invalid-token')
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

      const registerCookies = registerRes.headers['set-cookie'] as unknown as string[];

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userCredentials.email,
          password: userCredentials.password,
        })
        .expect(200);

      const loginCookies = loginRes.headers['set-cookie'] as unknown as string[];

      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', `access_token=${getCookieValue(loginCookies, 'access_token')}`)
        .expect(200);

      const refreshRes = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', `refresh_token=${getCookieValue(loginCookies, 'refresh_token')}`)
        .expect(200);

      const refreshCookies = refreshRes.headers['set-cookie'] as unknown as string[];

      const cookieHeader = `access_token=${getCookieValue(refreshCookies, 'access_token')}; refresh_token=${getCookieValue(refreshCookies, 'refresh_token')}`;
      await withCsrf(request(app.getHttpServer()).post('/auth/logout'), cookieHeader).expect(204);

      // Third refresh token should be invalid (was logged out)
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', `refresh_token=${getCookieValue(refreshCookies, 'refresh_token')}`)
        .expect(401);

      // First refresh token should still be valid (different session, not logged out)
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', `refresh_token=${getCookieValue(registerCookies, 'refresh_token')}`)
        .expect(200);
    });
  });
});
