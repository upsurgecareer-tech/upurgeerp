const request = require('supertest');
const app = require('../app');
const { Performance, Employee, User } = require('../models');

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
    Performance: { findByPk: jest.fn(), create: jest.fn(), ...mockAssociations },
    JobPosting: { ...mockAssociations },
    Candidate: { ...mockAssociations },
    sequelize: {
      define: jest.fn(),
      authenticate: jest.fn(),
      sync: jest.fn(),
      transaction: jest.fn(),
    }
  };
});

jest.mock('../utils/jwt', () => ({
  verifyAccessToken: jest.fn().mockReturnValue({ id: 99, role_name: 'staff' })
}));

describe('Performance Submodule API Tests', () => {
  let authToken = 'mock-jwt-token';

  beforeEach(() => {
    jest.clearAllMocks();
    const { verifyAccessToken } = require('../utils/jwt');
    // Logged in user is ID: 99 (a regular staff member)
    verifyAccessToken.mockReturnValue({ id: 99, role_name: 'staff' });
    User.findByPk.mockResolvedValue({ id: 99, status: 'active', role_id: 2, first_name: 'TestStaff' });
  });

  describe('PATCH /api/v1/hrms/performance/:id/acknowledge', () => {
    it('should block unauthorized users from acknowledging someone else\'s review (IDOR protection)', async () => {
      // Setup: Logged in user (ID: 99) has an Employee profile
      Employee.findOne.mockResolvedValueOnce({ id: 50, user_id: 99 });

      // The performance review belongs to a DIFFERENT employee (employee_id: 100)
      const mockUpdate = jest.fn();
      Performance.findByPk.mockResolvedValueOnce({ 
        id: 1, 
        employee_id: 100, 
        status: 'Submitted',
        update: mockUpdate
      });

      const response = await request(app)
        .patch('/api/v1/hrms/performance/1/acknowledge')
        .set('Authorization', `Bearer ${authToken}`);

      // The backend MUST return 403 Forbidden because employee 50 cannot acknowledge employee 100's review!
      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/unauthorized|forbidden/i);
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });
});
