const request = require('supertest');
const app = require('../app');
const { Employee, User, Department, LeaveBalance } = require('../models');

// Mock models to prevent actual DB inserts/updates during testing
jest.mock('../models', () => {
  const original = jest.requireActual('../models');
  return {
    ...original,
    Employee: {
      findOne: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
    },
    User: {
      findByPk: jest.fn(),
    },
    Department: {
      findByPk: jest.fn(),
    },
    LeaveBalance: {
      create: jest.fn(),
    },
    Role: {
      findByPk: jest.fn(),
    }
  };
});

// A helper to mock jwt verification inside authenticate middleware
jest.mock('../utils/jwt', () => ({
  verifyAccessToken: jest.fn().mockReturnValue({ id: 1, role_name: 'admin' })
}));

describe('Employee Submodule API Tests', () => {
  let authToken = 'mock-jwt-token';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default authentication mock setup
    const { verifyAccessToken } = require('../utils/jwt');
    verifyAccessToken.mockReturnValue({ id: 1, role_name: 'admin' });
    
    User.findByPk.mockResolvedValue({ id: 1, status: 'active', role_id: 1 });
  });

  describe('POST /api/v1/hrms/employees', () => {
    it('should create an employee when all valid data is provided', async () => {
      // Setup mock returns
      User.findByPk.mockResolvedValueOnce({ id: 2, status: 'active' }); // target user
      Employee.findOne.mockResolvedValueOnce(null); // not already an employee
      Department.findByPk.mockResolvedValueOnce({ id: 1, is_active: true }); // valid department
      Employee.findOne.mockResolvedValueOnce(null); // pan check
      Employee.findOne.mockResolvedValueOnce(null); // aadhar check
      Employee.create.mockResolvedValueOnce({ id: 1, employee_code: 'EMP123' });
      LeaveBalance.create.mockResolvedValueOnce({});

      const response = await request(app)
        .post('/api/v1/hrms/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          user_id: 2,
          department_id: 1,
          designation: 'Software Engineer',
          joining_date: '2023-01-01',
          employment_type: 'Full-Time',
          date_of_birth: '1995-01-01',
          gender: 'Male',
          address: '123 Main Street City',
          emergency_contact_name: 'John Doe',
          emergency_contact_phone: '9876543210'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Employee created successfully');
    });

    it('should return 400 if emergency contact is invalid', async () => {
      const response = await request(app)
        .post('/api/v1/hrms/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          user_id: 2,
          department_id: 1,
          designation: 'Software Engineer',
          joining_date: '2023-01-01',
          employment_type: 'Full-Time',
          date_of_birth: '1995-01-01',
          gender: 'Male',
          address: '123 Main Street City',
          emergency_contact_name: 'John Doe',
          emergency_contact_phone: '123' // Invalid phone
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 404 if department does not exist', async () => {
      User.findByPk.mockResolvedValueOnce({ id: 2, status: 'active' });
      Employee.findOne.mockResolvedValueOnce(null);
      Department.findByPk.mockResolvedValueOnce(null); // Dept not found

      const response = await request(app)
        .post('/api/v1/hrms/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          user_id: 2,
          department_id: 999,
          designation: 'Software Engineer',
          joining_date: '2023-01-01',
          employment_type: 'Full-Time',
          date_of_birth: '1995-01-01',
          gender: 'Male',
          address: '123 Main Street City',
          emergency_contact_name: 'John Doe',
          emergency_contact_phone: '9876543210'
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Department not found');
    });
  });

  describe('PUT /api/v1/hrms/employees/:id', () => {
    it('should update an employee', async () => {
      const mockEmployee = { id: 1, pan_number: 'ABCDE1234F', update: jest.fn().mockResolvedValue(true) };
      Employee.findByPk.mockResolvedValueOnce(mockEmployee);
      
      const response = await request(app)
        .put('/api/v1/hrms/employees/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          designation: 'Senior Engineer'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Employee updated successfully');
      expect(mockEmployee.update).toHaveBeenCalledWith(expect.objectContaining({ designation: 'Senior Engineer' }));
    });
  });

  describe('GET /api/v1/hrms/employees', () => {
    it('should filter employees by search term', async () => {
      Employee.findAll.mockResolvedValueOnce([{ id: 1, employee_code: 'EMP001' }]);

      const response = await request(app)
        .get('/api/v1/hrms/employees?search=John')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // The mock should have been called with a where clause containing the search term
      const findAllArgs = Employee.findAll.mock.calls[0][0];
      expect(findAllArgs.where).toBeDefined();
      const symbols = Object.getOwnPropertySymbols(findAllArgs.where);
      expect(symbols.length).toBeGreaterThan(0); // Search should be implemented using Op.or
    });
  });

  describe('POST /api/v1/hrms/employees/bulk-status', () => {
    it('should return 400 if employeeIds is not an array', async () => {
      const response = await request(app)
        .post('/api/v1/hrms/employees/bulk-status')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          employeeIds: 'not-an-array', // Invalid input
          status: 'Inactive'
        });

      // Should be validated and return 400 instead of crashing (500)
      expect(response.status).toBe(400);
    });
  });
});
