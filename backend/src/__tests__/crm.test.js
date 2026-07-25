const request = require('supertest');
const app = require('../app');
const { Lead, LeadSource, User, FollowUp, Employee } = require('../models');

jest.mock('../models/Lead', () => ({
  create: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
}));

jest.mock('../models/FollowUp', () => ({
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
    User: { findByPk: jest.fn(), ...mockAssociations },
    Employee: { findOne: jest.fn(), findByPk: jest.fn(), ...mockAssociations },
    Lead: { create: jest.fn(), findByPk: jest.fn(), findOne: jest.fn(), findAll: jest.fn(), update: jest.fn(), ...mockAssociations },
    LeadSource: { findByPk: jest.fn(), ...mockAssociations },
    LeadActivity: { create: jest.fn(), ...mockAssociations },
    FollowUp: { create: jest.fn(), findAll: jest.fn(), ...mockAssociations },
    sequelize: {
      define: jest.fn(),
      authenticate: jest.fn(),
      sync: jest.fn(),
      transaction: jest.fn(),
    }
  };
});

jest.mock('../utils/jwt', () => ({
  verifyAccessToken: jest.fn().mockReturnValue({ id: 10, role_name: 'counsellor', branch_id: 1 })
}));

describe('CRM Submodule API Tests', () => {
  let authToken = 'mock-jwt-token';

  beforeEach(() => {
    jest.clearAllMocks();
    User.findByPk.mockResolvedValue({ id: 10, status: 'active', role_id: 3, branch_id: 1, first_name: 'Counsellor' });
  });

  describe('POST /api/v1/crm/leads', () => {
    it('should return 400 if source_id is provided but does not exist in DB (prevent 500 crash)', async () => {
      // Setup: LeadSource does NOT exist
      const { LeadSource } = require('../models');
      LeadSource.findByPk.mockResolvedValueOnce(null);

      const { Lead } = require('../models');
      Lead.findOne.mockResolvedValueOnce(null); // No duplicate mobile
      // Simulate DB crash if code blindly inserts
      Lead.create.mockRejectedValueOnce(new Error('SequelizeForeignKeyConstraintError'));

      const response = await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          name: 'John Doe', 
          mobile: '9998887776',
          source_id: 999 // Invalid ID
        });

      // The backend MUST return 400 Bad Request
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/source/i);
    });
  });

  describe('PUT /api/v1/leads/:id', () => {
    it('should return 403 Forbidden if user from branch 1 tries to update lead from branch 2', async () => {
      const Lead = require('../models/Lead');
      
      const mockUpdate = jest.fn();
      Lead.findByPk.mockResolvedValueOnce({
        id: 1,
        name: 'Jane Smith',
        branch_id: 2, // Belongs to branch 2!
        update: mockUpdate
      });

      const response = await request(app)
        .put('/api/v1/leads/1')
        .set('Authorization', `Bearer ${authToken}`) // Caller is branch 1
        .send({ name: 'Jane Updated' });

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/permission/i);
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe('PUT /api/v1/leads/:id/assign', () => {
    it('should return 400 if counsellor_id is invalid (prevent 500 crash)', async () => {
      const Lead = require('../models/Lead');
      const { User } = require('../models');
      
      Lead.findByPk.mockResolvedValueOnce({
        id: 1,
        branch_id: 1,
        update: jest.fn()
      });

      // Override the global User.findByPk just for this test
      User.findByPk.mockReset();
      User.findByPk
        .mockResolvedValueOnce({ id: 10, status: 'active', role_id: 3, branch_id: 1, first_name: 'Counsellor' }) // Auth middleware
        .mockResolvedValueOnce(null); // Validation middleware in controller

      const response = await request(app)
        .put('/api/v1/leads/1/assign')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ counsellor_id: 999 }); // Invalid counsellor User ID

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/counsellor/i);
    });
  });

  describe('GET /api/v1/followups/today', () => {
    it('should successfully fetch today follow-ups without crashing', async () => {
      const FollowUp = require('../models/FollowUp');
      FollowUp.findAll.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/v1/followups/today')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('followUps');
    });
  });
});
