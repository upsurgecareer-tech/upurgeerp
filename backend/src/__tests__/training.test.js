const request = require('supertest');
const app = require('../app');
const { TrainingProgram, Department, User } = require('../models');

jest.mock('../models/TrainingProgram', () => ({
  create: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn(),
}));

jest.mock('../models', () => {
  const mockAssociations = {
    hasMany: jest.fn(),
    belongsTo: jest.fn(),
    hasOne: jest.fn(),
    belongsToMany: jest.fn(),
  };

  return {
    Department: { findByPk: jest.fn(), ...mockAssociations },
    User: { findByPk: jest.fn(), ...mockAssociations },
    Employee: { findOne: jest.fn(), findByPk: jest.fn(), ...mockAssociations },
    TrainingProgram: { create: jest.fn(), findByPk: jest.fn(), findAll: jest.fn(), ...mockAssociations },
    sequelize: {
      define: jest.fn(),
      authenticate: jest.fn(),
      sync: jest.fn(),
      transaction: jest.fn(),
    }
  };
});

jest.mock('../utils/jwt', () => ({
  verifyAccessToken: jest.fn().mockReturnValue({ id: 1, role_name: 'super admin' })
}));

describe('Training Submodule API Tests', () => {
  let authToken = 'mock-jwt-token';

  beforeEach(() => {
    jest.clearAllMocks();
    const { verifyAccessToken } = require('../utils/jwt');
    verifyAccessToken.mockReturnValue({ id: 1, role_name: 'super admin' });
    User.findByPk.mockResolvedValue({ id: 1, status: 'active', role_id: 1, first_name: 'Admin' });
  });

  describe('POST /api/v1/hrms/training', () => {
    it('should return 400 if department_id is provided but does not exist in DB (prevent 500 crash)', async () => {
      // Setup: Department does NOT exist
      const { Department } = require('../models');
      Department.findByPk.mockResolvedValueOnce(null);

      const TrainingProgram = require('../models/TrainingProgram');
      // Simulate DB crash if code blindly inserts
      TrainingProgram.create.mockRejectedValueOnce(new Error('SequelizeForeignKeyConstraintError'));

      const response = await request(app)
        .post('/api/v1/hrms/training')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          title: 'New Training', 
          trainer_name: 'John Doe',
          start_date: '2026-10-10', 
          end_date: '2026-10-15',
          department_id: 999 // Invalid ID
        });

      // The backend MUST return 400 Bad Request to prevent 500 crash
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/department/i);
    });
  });

  describe('PUT /api/v1/hrms/training/:id', () => {
    it('should return 400 if updating with a department_id that does not exist', async () => {
      const { Department } = require('../models');
      Department.findByPk.mockResolvedValueOnce(null);

      const TrainingProgram = require('../models/TrainingProgram');
      const mockUpdate = jest.fn().mockRejectedValueOnce(new Error('SequelizeForeignKeyConstraintError'));
      TrainingProgram.findByPk.mockResolvedValueOnce({
        id: 1,
        title: 'Old Training',
        update: mockUpdate
      });

      const response = await request(app)
        .put('/api/v1/hrms/training/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          title: 'Updated Training', 
          trainer_name: 'John Doe',
          start_date: '2026-10-10', 
          department_id: 888 // Invalid ID
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/department/i);
    });
  });
});
