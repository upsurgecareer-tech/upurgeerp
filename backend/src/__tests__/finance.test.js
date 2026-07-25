const request = require('supertest');
const app = require('../app');
const { FeePayment, FeeSchedule, Admission, Student, User } = require('../models');
const { sequelize } = require('../config/database');

jest.mock('../models', () => {
  if (!global.mockFeePayment) {
    global.mockFeePayment = { create: jest.fn(), count: jest.fn(), findAll: jest.fn(), findByPk: jest.fn() };
    global.mockFeeSchedule = { findByPk: jest.fn(), findAll: jest.fn() };
    global.mockAdmission = { findByPk: jest.fn(), findAll: jest.fn() };
    global.mockStudent = { findByPk: jest.fn() };
    global.mockUser = { findByPk: jest.fn(), findOne: jest.fn(), prototype: {} };
  }
  return {
    FeePayment: global.mockFeePayment,
    FeeSchedule: global.mockFeeSchedule,
    Admission: global.mockAdmission,
    Student: global.mockStudent,
    User: global.mockUser
  };
});
jest.mock('../models/FeePayment', () => global.mockFeePayment);
jest.mock('../models/FeeSchedule', () => global.mockFeeSchedule);
jest.mock('../models/Admission', () => global.mockAdmission);
jest.mock('../models/Student', () => global.mockStudent);
jest.mock('../models/User', () => global.mockUser);
jest.mock('../config/database', () => {
  return {
    query: jest.fn(),
    define: jest.fn(() => ({ 
      prototype: {},
      hasMany: jest.fn(),
      belongsTo: jest.fn(),
      belongsToMany: jest.fn(),
      hasOne: jest.fn()
    })),
    sync: jest.fn(),
    authenticate: jest.fn()
  };
});

const mockAuthMiddleware = require('../middlewares/auth');
jest.mock('../middlewares/auth', () => ({
  authenticate: (req, res, next) => {
    // Mock logged in user is from branch 1 (Admin/Staff)
    req.user = { id: 10, role_id: 3, branch_id: 1 };
    next();
  }
}));

describe('Finance Submodule API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/fee-payments', () => {
    it('should return 400 if admission_id is invalid (prevent 500 crash)', async () => {
      Admission.findByPk.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/fee-payments')
        .send({
          admission_id: 999, // Fake ID
          amount_paid: 5000,
          payment_mode: 'Cash',
          payment_date: '2023-10-01'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Invalid admission_id/i);
    });

    it('should return 403 Forbidden if user tries to pay for admission in different branch', async () => {
      // Setup admission that belongs to a student in branch 2
      Admission.findByPk.mockResolvedValue({
        id: 1,
        student_id: 100,
        Student: { branch_id: 2 } // Different branch!
      });

      const res = await request(app)
        .post('/api/v1/fee-payments')
        .send({
          admission_id: 1,
          amount_paid: 5000,
          payment_mode: 'Cash',
          payment_date: '2023-10-01'
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/Permission denied/i);
    });
  });

  describe('GET /api/v1/fee-payments/due', () => {
    it('should query due payments scoped to the user branch without crashing', async () => {
      FeeSchedule.findAll.mockResolvedValue([]);
      
      const res = await request(app).get('/api/v1/fee-payments/due');
      if (res.statusCode === 500) {
        console.error('Due payments error:', res.body);
      }
      expect(res.statusCode).toBe(200);
      
      // Ensure the mock was called with an include to Admission->Student
      expect(FeeSchedule.findAll).toHaveBeenCalled();
      const callArgs = FeeSchedule.findAll.mock.calls[0][0];
      expect(callArgs.include).toBeDefined();
    });
  });
});
