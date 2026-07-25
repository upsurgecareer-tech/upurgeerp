const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../config/database');

const mockUser = { findOne: jest.fn(), findByPk: jest.fn(), findAll: jest.fn() };
const mockEmployee = { findOne: jest.fn(), findByPk: jest.fn(), findAll: jest.fn() };
const mockSalaryStructure = { findOne: jest.fn(), findOrCreate: jest.fn(), findAll: jest.fn() };
const mockPayroll = { findOne: jest.fn(), create: jest.fn(), findByPk: jest.fn(), findAll: jest.fn() };
const mockPerformance = { findOne: jest.fn(), create: jest.fn(), findByPk: jest.fn(), findAll: jest.fn() };

jest.mock('../models', () => {
  if (!global.mockUser) {
    global.mockUser = { findOne: jest.fn(), findByPk: jest.fn(), findAll: jest.fn() };
    global.mockEmployee = { findOne: jest.fn(), findByPk: jest.fn(), findAll: jest.fn() };
    global.mockPerformance = { findOne: jest.fn(), create: jest.fn(), findByPk: jest.fn(), findAll: jest.fn() };
  }
  return {
    User: global.mockUser,
    Employee: global.mockEmployee,
    Performance: global.mockPerformance,
    Department: {}
  };
});
jest.mock('../models/User', () => global.mockUser);
jest.mock('../models/Employee', () => global.mockEmployee);
jest.mock('../models/Performance', () => global.mockPerformance);
jest.mock('../models/SalaryStructure', () => {
  if (!global.mockSalaryStructure) global.mockSalaryStructure = { findOne: jest.fn(), findOrCreate: jest.fn(), findAll: jest.fn() };
  return global.mockSalaryStructure;
});
jest.mock('../models/Payroll', () => {
  if (!global.mockPayroll) global.mockPayroll = { findOne: jest.fn(), create: jest.fn(), findByPk: jest.fn(), findAll: jest.fn() };
  return global.mockPayroll;
});

jest.mock('../config/database', () => {
  return {
    query: jest.fn(),
    define: jest.fn(() => ({
      belongsTo: jest.fn(),
      hasMany: jest.fn(),
      hasOne: jest.fn(),
      belongsToMany: jest.fn(),
      prototype: {}
    })),
    transaction: jest.fn().mockImplementation(async (cb) => {
      if (cb) await cb({});
    }),
    Sequelize: { Op: { between: Symbol('between') } }
  };
});

// Mock authenticate middleware to simulate HR in branch 1
jest.mock('../middlewares/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, role_id: 3, branch_id: 1, role_name: 'hr manager' };
    next();
  }
}));
jest.mock('../middlewares/authenticate', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, role_id: 3, branch_id: 1, role_name: 'hr manager' };
    next();
  }
}));

describe('HRMS Payroll & Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Payroll Module', () => {
    it('should return 404 when trying to update salary for an employee in another branch', async () => {
      global.mockUser.findOne.mockResolvedValue(null); // Simulated IDOR block
      
      const res = await request(app)
        .post('/api/v1/payroll/salary-structure')
        .send({
          employee_user_id: 999,
          basic_salary: 5000,
          allowances: "{}",
          deductions: "{}",
          total_salary: 5000,
          effective_from: '2026-07-08'
        });
      
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/Employee not found or unauthorized/i);
    });

    it('should return 404 when trying to generate payroll for employee in another branch', async () => {
      global.mockEmployee.findOne.mockResolvedValue(null); // Simulated IDOR block
      
      const res = await request(app)
        .post('/api/v1/payroll/generate')
        .send({
          employee_id: 999,
          month: 7,
          year: 2026,
          basic_salary: 5000,
          allowances: 0,
          deductions: 0,
          net_salary: 5000
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/Employee not found or unauthorized/i);
    });
  });

  describe('Performance Module', () => {
    it('should return 404 when trying to create review for employee in another branch', async () => {
      global.mockEmployee.findOne.mockResolvedValue(null); // Simulated IDOR block
      
      const res = await request(app)
        .post('/api/v1/hrms/performance')
        .send({
          employee_id: 999,
          review_period: 'Q2 2026',
          reviewer_id: 1,
          technical_skills: 5,
          communication: 5,
          teamwork: 5,
          punctuality: 5,
          quality_of_work: 5,
          strengths: 'Very strong skills.',
          areas_of_improvement: 'Needs to improve time management.',
          comments: 'Great overall performance.'
        });
      
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/Employee not found or unauthorized/i);
    });
  });
});
