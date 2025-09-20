import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../test-utils/app';
import { db } from '../services/database.service';
import { authService } from '../services/auth.service';

describe('Authentication API', () => {
  let app: Express;
  
  beforeAll(async () => {
    app = await createTestApp();
  });
  
  afterAll(async () => {
    await db.close();
  });
  
  beforeEach(async () => {
    // Clear test data
    await db.query('DELETE FROM users WHERE email LIKE $1', ['%@test.com']);
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@test.com',
          password: 'TestPass123!',
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe('test@test.com');
      expect(response.body.user).not.toHaveProperty('password');
    });
    
    it('should reject duplicate email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser1',
          email: 'duplicate@test.com',
          password: 'TestPass123!',
        });
      
      // Duplicate attempt
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser2',
          email: 'duplicate@test.com',
          password: 'TestPass123!',
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
    
    it('should validate password strength', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@test.com',
          password: 'weak',
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('details');
      expect(response.body.details[0].field).toBe('password');
    });
  });
  
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      await authService.register({
        username: 'logintest',
        email: 'login@test.com',
        password: 'TestPass123!',
      });
    });
    
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'TestPass123!',
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.headers).toHaveProperty('set-cookie');
    });
    
    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'WrongPass123!',
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
    
    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'TestPass123!',
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
    
    it('should enforce rate limiting', async () => {
      const requests = Array(6).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'login@test.com',
            password: 'WrongPass123!',
          })
      );
      
      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);
      
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });
  
  describe('GET /api/auth/me', () => {
    let authToken: string;
    
    beforeEach(async () => {
      // Create and login test user
      await authService.register({
        username: 'authtest',
        email: 'auth@test.com',
        password: 'TestPass123!',
      });
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'auth@test.com',
          password: 'TestPass123!',
        });
      
      authToken = loginResponse.headers['set-cookie'][0];
    });
    
    it('should return current user when authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', authToken);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('auth@test.com');
    });
    
    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/auth/me');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('POST /api/auth/logout', () => {
    it('should clear auth cookie', async () => {
      const response = await request(app)
        .post('/api/auth/logout');
      
      expect(response.status).toBe(200);
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('auth_token=;');
    });
  });
});