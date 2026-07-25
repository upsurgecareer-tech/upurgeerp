const request = require('supertest');
const app = require('../src/app');

describe('Student Tests', () => {
  let authToken;
  let studentId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@upsurgeerp.com',
        password: 'admin123'
      });
    authToken = res.body.token;
  });

  describe('POST /api/v1/students', () => {
    it('should create new student', async () => {
      const res = await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '1234567890',
          dateOfBirth: '2000-01-01',
          gender: 'Male',
          address: '123 Main St'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      studentId = res.body.id;
    });
  });

  describe('GET /api/v1/students', () => {
    it('should get all students', async () => {
      const res = await request(app)
        .get('/api/v1/students')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/v1/students/:id', () => {
    it('should get student by id', async () => {
      const res = await request(app)
        .get(`/api/v1/students/${studentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('firstName', 'John');
    });
  });
});
