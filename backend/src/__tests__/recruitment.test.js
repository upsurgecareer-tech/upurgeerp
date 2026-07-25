const request = require('supertest');
const app = require('../app');
const JobPosting = require('../models/JobPosting');
const Candidate = require('../models/Candidate');
const { Department, User } = require('../models');

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
    JobPosting: { create: jest.fn(), ...mockAssociations },
    Candidate: { findOne: jest.fn(), create: jest.fn(), ...mockAssociations },
    Employee: { findByPk: jest.fn(), ...mockAssociations },
    // Mock the sequelize instance so index.js doesn't crash if imported elsewhere
    sequelize: {
      define: jest.fn(),
      authenticate: jest.fn(),
      sync: jest.fn(),
      transaction: jest.fn(),
    }
  };
});

// We can remove the individual model mocks since they are now in the main models mock
jest.mock('../models/JobPosting', () => ({
  create: jest.fn(),
  hasMany: jest.fn(),
  belongsTo: jest.fn(),
}));

jest.mock('../models/Candidate', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  hasMany: jest.fn(),
  belongsTo: jest.fn(),
}));

jest.mock('../utils/jwt', () => ({
  verifyAccessToken: jest.fn().mockReturnValue({ id: 1, role_name: 'admin' })
}));

describe('Recruitment Submodule API Tests', () => {
  let authToken = 'mock-jwt-token';

  beforeEach(() => {
    jest.clearAllMocks();
    const { verifyAccessToken } = require('../utils/jwt');
    verifyAccessToken.mockReturnValue({ id: 1, role_name: 'admin' });
    User.findByPk.mockResolvedValue({ id: 1, status: 'active', role_id: 1, first_name: 'Admin' });
  });

  describe('POST /api/v1/hrms/recruitment/jobs', () => {
    it('should return 400 if department_id does not exist in the database', async () => {
      // Simulate that the department doesn't exist
      Department.findByPk.mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/v1/hrms/recruitment/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Software Engineer',
          department_id: 99999,
          openings: 2
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Department not found/i);
    });
  });

  describe('POST /api/v1/hrms/recruitment/candidates', () => {
    it('should block duplicate candidate applications for the same job', async () => {
      // Simulate that the candidate already exists for this job posting
      Candidate.findOne.mockResolvedValueOnce({ id: 10, email: 'test@example.com', job_posting_id: 5 });

      const response = await request(app)
        .post('/api/v1/hrms/recruitment/candidates')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'John Doe',
          email: 'test@example.com',
          job_posting_id: 5
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/already applied/i);
    });
  });
});
