const request = require('supertest');
const app = require('../app');
const { Employee, User, Department } = require('../models');
const Payroll = require('../models/Payroll');
const SalaryStructure = require('../models/SalaryStructure');
const { Op } = require('sequelize');

jest.mock('../models', () => {
  const original = jest.requireActual('../models');
  return {
    ...original,
    Employee: {
      findOne: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
    },
    User: {
      findByPk: jest.fn(),
    },
    Department: {
      findByPk: jest.fn(),
    },
  };
});

jest.mock('../models/Payroll', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  findByPk: jest.fn(),
}));

jest.mock('../models/SalaryStructure', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  findOrCreate: jest.fn(),
}));

jest.mock('../utils/jwt', () => ({
  verifyAccessToken: jest.fn().mockReturnValue({ id: 1, role_name: 'admin' })
}));

describe('Payroll Submodule API Tests', () => {
  let authToken = 'mock-jwt-token';

  beforeEach(() => {
    jest.clearAllMocks();
    const { verifyAccessToken } = require('../utils/jwt');
    verifyAccessToken.mockReturnValue({ id: 1, role_name: 'admin' });
    User.findByPk.mockResolvedValue({ id: 1, status: 'active', role_id: 1, first_name: 'Admin' });
  });

  describe('POST /api/v1/payroll/generate', () => {
    it('should fail if net_salary calculation is manipulated with NaN or incorrect numbers', async () => {
      Employee.findByPk.mockResolvedValueOnce({ id: 1, user_id: 10 });
      Payroll.findOne.mockResolvedValueOnce(null); // No existing payroll

      const response = await request(app)
        .post('/api/v1/payroll/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          employee_id: 1,
          month: 10,
          year: 2026,
          basic_salary: 50000,
          // Passing an object instead of a number simulates an invalid client payload that forces Number() to yield NaN
          allowances: { HRA: 10000 }, 
          deductions: 5000,
          net_salary: 55000 // 50000 + NaN - 5000 is NaN. The calculation fails.
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Validation failed|Invalid numerical values/i);
    });
  });

  describe('PUT /api/v1/payroll/:id/approve', () => {
    it('should approve payroll and set payment date in local timezone', async () => {
      const mockPayroll = {
        id: 100,
        status: 'Pending',
        update: jest.fn().mockResolvedValue(true)
      };
      Payroll.findByPk.mockResolvedValueOnce(mockPayroll);

      const response = await request(app)
        .put('/api/v1/payroll/100/approve')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(mockPayroll.update).toHaveBeenCalled();
      
      const updateArgs = mockPayroll.update.mock.calls[0][0];
      expect(updateArgs.status).toBe('Paid');
      expect(updateArgs.payment_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      
      // Simulate checking if the payment date matches the local time
      const d = new Date();
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      const localToday = d.toISOString().split('T')[0];
      expect(updateArgs.payment_date).toBe(localToday);
    });
  });
});
