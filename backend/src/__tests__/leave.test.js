const request = require('supertest');
const app = require('../app');
const { Leave, LeaveBalance, Employee, User } = require('../models');

// Mock models
jest.mock('../models', () => {
  const original = jest.requireActual('../models');
  return {
    ...original,
    Leave: {
      findOne: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
    },
    LeaveBalance: {
      findOne: jest.fn(),
      create: jest.fn(),
    },
    Employee: {
      findByPk: jest.fn(),
    },
    User: {
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

describe('Leave Submodule API Tests', () => {
  let authToken = 'mock-jwt-token';

  beforeEach(() => {
    jest.clearAllMocks();
    const { verifyAccessToken } = require('../utils/jwt');
    verifyAccessToken.mockReturnValue({ id: 1, role_name: 'admin' });
    User.findByPk.mockResolvedValue({ id: 1, status: 'active', role_id: 1 });
  });

  describe('POST /api/v1/hrms/leaves', () => {
    it('should successfully apply for a leave', async () => {
      Employee.findByPk.mockResolvedValueOnce({ id: 1, status: 'Active' });
      LeaveBalance.findOne.mockResolvedValueOnce({ sick_leave: 12, sick_leave_used: 0 }); // sufficient balance
      Leave.findOne.mockResolvedValueOnce(null); // no overlap
      Leave.create.mockResolvedValueOnce({ id: 1, leave_type: 'Sick', status: 'Pending' });

      const response = await request(app)
        .post('/api/v1/hrms/leaves')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          employee_id: 1,
          leave_type: 'Sick',
          start_date: '2023-10-01',
          end_date: '2023-10-02',
          reason: 'Fever'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Leave applied successfully');
    });

    it('should return 400 for insufficient leave balance', async () => {
      Employee.findByPk.mockResolvedValueOnce({ id: 1, status: 'Active' });
      // Total 12, used 11, requesting 2 days -> Insufficient
      LeaveBalance.findOne.mockResolvedValueOnce({ sick_leave: 12, sick_leave_used: 11 }); 

      const response = await request(app)
        .post('/api/v1/hrms/leaves')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          employee_id: 1,
          leave_type: 'Sick',
          start_date: '2023-10-01',
          end_date: '2023-10-02', // 2 days
          reason: 'Fever'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Insufficient');
    });
  });

  describe('PATCH /api/v1/hrms/leaves/:id/status', () => {
    it('should approve a Sick leave and deduct balance', async () => {
      const mockLeave = { id: 1, employee_id: 1, leave_type: 'Sick', status: 'Pending', total_days: 2, update: jest.fn().mockResolvedValue(true) };
      Leave.findByPk.mockResolvedValueOnce(mockLeave);
      
      const mockBalance = { sick_leave: 12, sick_leave_used: 0, update: jest.fn().mockResolvedValue(true) };
      // Called twice (once for check, once for update)
      LeaveBalance.findOne.mockResolvedValue(mockBalance);

      const response = await request(app)
        .patch('/api/v1/hrms/leaves/1/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'Approved',
          remarks: 'Approved by admin'
        });

      expect(response.status).toBe(200);
      expect(mockLeave.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'Approved' }));
      expect(mockBalance.update).toHaveBeenCalledWith(expect.objectContaining({ sick_leave_used: 2 }));
    });

    it('should not crash when approving an Unpaid leave', async () => {
      const mockLeave = { id: 2, employee_id: 1, leave_type: 'Unpaid', status: 'Pending', total_days: 2, update: jest.fn().mockResolvedValue(true) };
      Leave.findByPk.mockResolvedValueOnce(mockLeave);
      
      const mockBalance = { update: jest.fn().mockResolvedValue(true) };
      LeaveBalance.findOne.mockResolvedValue(mockBalance);

      const response = await request(app)
        .patch('/api/v1/hrms/leaves/2/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'Approved'
        });

      // Should return 200, but in buggy code it tries to update unpaid_leave_used which crashes
      expect(response.status).toBe(200);
      // It should NOT attempt to update the balance model for Unpaid leave
      expect(mockBalance.update).not.toHaveBeenCalled(); 
    });
  });
});
