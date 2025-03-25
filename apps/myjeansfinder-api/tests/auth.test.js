const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');

const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'Password123!',
  confirmPassword: 'Password123!',
};

// Connect to MongoDB before tests
beforeAll(async () => {
  await mongoose.connect(
    'process.env.MONGODB_URI || mongodb://localhost:27017/myjeansfinder_test'
  );
});

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('New usershould be able to register and return tokens', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);

      expect(res.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('_id');
      expect(response.body.data.user.email).toBe('testUser.email');
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('Should return 400 and not register user with existing email', async () => {
      // Register first user
      await request(app).post('/api/auth/register').send(testUser);

      // Try to register second user with same email
      const res = await request(app).post('/api/auth/register').send(testUser);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('User already exists');
    });

    it('Should validate password requirements', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Password');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user and return tokens', async () => {
      // First register a test user
      await request(app).post('/api/auth/register').send(testUser);

      // Login
      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('should not login user with incorrect password', async () => {
      // First register a test user
      await request(app).post('/api/auth/register').send(testUser);

      // Try to login with incorrect password
      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: 'wrongPassword123!',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return authenticated user profile', async () => {
      // First register a test user
      const res = await request(app).post('/api/auth/register').send(testUser);

      const token = register.body.data.accessToken;

      // Get user profile
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it('should return 401 if user is not authenticated with token', async () => {
      const res = await request(app).get('/api/auth/profile');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
