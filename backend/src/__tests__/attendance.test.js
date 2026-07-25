const request = require('supertest');
const app = require('../app');
const { Employee, EmployeeAttendance, User, Department } = require('../models');
const { Op } = require('sequelize');

// Mock models
jest.mock('../models', () => {
  const original = jest.requireActual('../models');
  return {
    ...original,
    Employee: {
      findOne: jest.fn(),
      findByPk: jest.fn(),
    },
    EmployeeAttendance: {
      findOne: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      findOrCreate: jest.fn(),
    },
    User: {
      findByPk: jest.fn(),
    },
    Department: {
      findByPk: jest.fn(),
    },
    Role: {
      findByPk: jest.fn(),
    }
  };
});

jest.mock('../utils/jwt', () => ({
  verifyAccessToken: jest.fn().mockReturnValue({ id: 1, role_name: 'admin' })
}));

describe('Attendance Submodule API Tests', () => {
  let authToken = 'mock-jwt-token';

  beforeEach(() => {
    jest.clearAllMocks();
    const { verifyAccessToken } = require('../utils/jwt');
    verifyAccessToken.mockReturnValue({ id: 1, role_name: 'admin' });
    User.findByPk.mockResolvedValue({ id: 1, status: 'active', role_id: 1 });
  });

  describe('POST /api/v1/hrms/attendance/check-in', () => {
    it('should successfully check in', async () => {
      Employee.findOne.mockResolvedValueOnce({ id: 1, status: 'Active' });
      // Not checked in today
      EmployeeAttendance.findOne.mockResolvedValueOnce(null);
      EmployeeAttendance.create.mockResolvedValueOnce({ id: 1, status: 'Present' });

      const response = await request(app)
        .post('/api/v1/hrms/attendance/check-in')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ location: 'Office' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Checked in successfully');
      
      const createArgs = EmployeeAttendance.create.mock.calls[0][0];
      expect(createArgs.date).toMatch(/^\d{4}-\d{2}-\d{2}$/); // should be YYYY-MM-DD format
    });

    it('should fail to check in if already checked in', async () => {
      Employee.findOne.mockResolvedValueOnce({ id: 1, status: 'Active' });
      // Already checked in today
      EmployeeAttendance.findOne.mockResolvedValueOnce({ id: 1, check_in: new Date() });

      const response = await request(app)
        .post('/api/v1/hrms/attendance/check-in')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ location: 'Office' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Already checked in today');
    });
  });

  describe('GET /api/v1/hrms/attendance/employee/:id', () => {
    it('should query history using a valid date range (not string startsWith)', async () => {
      EmployeeAttendance.findAll.mockResolvedValueOnce([]);

      const response = await request(app)
        .get('/api/v1/hrms/attendance/employee/1?month=06&year=2026')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      const findAllArgs = EmployeeAttendance.findAll.mock.calls[0][0];
      const whereDate = findAllArgs.where.date;
      
      // The bug: it uses Op.startsWith which is bad for Date columns. 
      // We expect it to use Op.between or Op.and or Op.gte/lte
      expect(Object.getOwnPropertySymbols(whereDate)).not.toContain(Op.startsWith);
      expect(Object.getOwnPropertySymbols(whereDate)).toContain(Op.between); 
    });
  });
});
