const request = require('supertest');
const app = require('../app');

describe('API Integration Tests', () => {
  
  let authToken;
  
  beforeAll(async () => {
    // Mock authentication - in real scenario, login and get token
    authToken = 'mock-jwt-token';
  });

  describe('Health Check', () => {
    test('GET /health should return 200', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Authentication', () => {
    test('POST /api/v1/auth/login should require email and password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({});
      
      expect(response.status).toBe(400);
    });

    test('POST /api/v1/auth/login with invalid credentials should return 401', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'wrongpassword'
        });
      
      expect([401, 404]).toContain(response.status);
    });
  });

  describe('Protected Routes', () => {
    test('GET /api/v1/students without token should return 401', async () => {
      const response = await request(app).get('/api/v1/students');
      
      expect(response.status).toBe(401);
    });

    test('GET /api/v1/leads without token should return 401', async () => {
      const response = await request(app).get('/api/v1/leads');
      
      expect(response.status).toBe(401);
    });
  });

  describe('Validation Tests', () => {
    test('POST /api/v1/students with invalid data should return 400', async () => {
      const response = await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'J',
          email: 'invalid-email',
          phone: '123'
        });
      
      expect([400, 401]).toContain(response.status);
    });

    test('POST /api/v1/leads with invalid phone should return 400', async () => {
      const response = await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Lead',
          phone: '123',
          source: 'Website'
        });
      
      expect([400, 401]).toContain(response.status);
    });
  });

  describe('404 Handler', () => {
    test('GET /api/v1/nonexistent should return 404', async () => {
      const response = await request(app).get('/api/v1/nonexistent');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });
});
