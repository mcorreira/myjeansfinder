const request = require('supertest');
const app = require('../server');

describe('Authentication Endpoints', () => {
  // Store token for later tests
  let authToken;

  test('User login should return JWT token', async () => {
    // Send POST request to login endpoint with test credentials
    const response = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    // Check status code is 200 (OK)
    expect(response.status).toBe(200);

    // Verify response contains expected properties
    expect(response.body).toHaveProperty('message', 'Login successful');
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');

    // Store token for later tests
    authToken = response.body.token;
  });
});
