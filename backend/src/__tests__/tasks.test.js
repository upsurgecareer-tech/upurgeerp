const request = require('supertest');
const app = require('../app');
const { Task, Timesheet, User } = require('../models');

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
    Task: { findByPk: jest.fn(), findAll: jest.fn(), ...mockAssociations },
    Timesheet: { findByPk: jest.fn(), findAll: jest.fn(), ...mockAssociations },
    Performance: { ...mockAssociations },
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

jest.mock('../models/Task', () => ({
  findByPk: jest.fn(),
  findAll: jest.fn(),
}));

jest.mock('../models/Timesheet', () => ({
  findByPk: jest.fn(),
  findAll: jest.fn(),
}));

describe('Tasks & Timesheets Submodule API Tests', () => {
  let authToken = 'mock-jwt-token';

  beforeEach(() => {
    jest.clearAllMocks();
    const { verifyAccessToken } = require('../utils/jwt');
    // Logged in user is ID: 99 (a regular staff member)
    verifyAccessToken.mockReturnValue({ id: 99, role_name: 'staff' });
    User.findByPk.mockResolvedValue({ id: 99, status: 'active', role_id: 2, first_name: 'TestStaff' });
  });

  describe('PUT /api/v1/hrms/tasks/:id', () => {
    it('should set completed_date to local timezone date, avoiding UTC shift', async () => {
      const mockUpdate = jest.fn();
      
      const Task = require('../models/Task');
      Task.findByPk.mockResolvedValueOnce({ 
        id: 1, 
        status: 'Todo',
        completed_date: null,
        update: mockUpdate
      });

      const response = await request(app)
        .put('/api/v1/hrms/tasks/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          title: 'Valid Title', 
          assigned_to: 5, 
          status: 'Done' 
        });

      expect(response.status).toBe(200);
      
      const d = new Date();
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      const expectedLocalToday = d.toISOString().split('T')[0];

      // Assuming mockUpdate is called with the request body, which has completed_date attached
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ completed_date: expectedLocalToday }));
    });
  });

  describe('PATCH /api/v1/hrms/timesheets/:id/submit', () => {
    it('should block unauthorized users from submitting someone else\'s timesheet (IDOR)', async () => {
      const mockUpdate = jest.fn();
      const Timesheet = require('../models/Timesheet');
      Timesheet.findByPk.mockResolvedValueOnce({ 
        id: 1, 
        user_id: 100, // Belongs to a different user!
        status: 'Draft',
        update: mockUpdate
      });

      const response = await request(app)
        .patch('/api/v1/hrms/timesheets/1/submit')
        .set('Authorization', `Bearer ${authToken}`);

      // The backend MUST return 403 Forbidden because user 99 cannot submit user 100's timesheet!
      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/unauthorized|forbidden/i);
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });
});
