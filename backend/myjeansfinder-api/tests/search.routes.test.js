const request = require('supertest');
const app = require('../server');

describe('Search Routes', () => {
  let authToken;

  // Before running tests, get an authentication token
  beforeAll(async () => {
    // First register a test user
    await request(app).post('/api/auth/register').send({
      username: 'testsearch',
      email: 'testsearch@example.com',
      password: 'password123',
    });

    // Then login to get token
    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'testsearch@example.com',
      password: 'password123',
    });

    authToken = loginResponse.body.token;
  });

  it('should return jeans matching brand criteria', async () => {
    const res = await request(app)
      .get('/api/search?brand=Levis')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Search successful');
    expect(res.body).toHaveProperty('results');
  });

  it('should return specific jeans by ID', async () => {
    const res = await request(app)
      .get('/api/search/2')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Jeans found');
    expect(res.body).toHaveProperty('jeans');
    expect(res.body.jeans).toHaveProperty('brand', 'Levis');
  });
});
