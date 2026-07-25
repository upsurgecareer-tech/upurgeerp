const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../config/database');

jest.mock('../models', () => {
  if (!global.mockExam) {
    global.mockExam = { findOne: jest.fn(), findByPk: jest.fn(), findAll: jest.fn(), create: jest.fn(), update: jest.fn() };
    global.mockExamAttempt = { findOne: jest.fn(), create: jest.fn(), findByPk: jest.fn() };
    global.mockQuestionBank = { findByPk: jest.fn() };
    global.mockAssignment = { create: jest.fn(), findAll: jest.fn(), findByPk: jest.fn(), findOne: jest.fn() };
    global.mockAssignmentSubmission = { create: jest.fn(), findAll: jest.fn(), findByPk: jest.fn(), findOne: jest.fn() };
  }
  return {
    Exam: global.mockExam,
    ExamAttempt: global.mockExamAttempt,
    QuestionBank: global.mockQuestionBank,
    Assignment: global.mockAssignment,
    AssignmentSubmission: global.mockAssignmentSubmission
  };
});
jest.mock('../models/Exam', () => global.mockExam);
jest.mock('../models/ExamAttempt', () => global.mockExamAttempt);
jest.mock('../models/QuestionBank', () => global.mockQuestionBank);
jest.mock('../models/Assignment', () => global.mockAssignment);
jest.mock('../models/AssignmentSubmission', () => global.mockAssignmentSubmission);
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

// Mock authenticate middleware to simulate a student in branch 1
jest.mock('../middlewares/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, role_id: 5, branch_id: 1, role_name: 'student' };
    next();
  }
}));
jest.mock('../middlewares/authenticate', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, role_id: 5, branch_id: 1, role_name: 'student' };
    next();
  }
}));

describe('Academics & Student Portal Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Exam Module', () => {
    it('should return 404 (IDOR protection) when trying to access exam from another branch', async () => {
      mockExam.findOne.mockResolvedValue(null); // Simulated: where: { id: 999, branch_id: 1 } finds nothing
      
      const res = await request(app).get('/api/v1/exams/999');
      
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/Exam not found/i);
    });

    it('should safely ignore invalid question_id in submitExam and prevent 500 crash', async () => {
      mockExamAttempt.findByPk.mockResolvedValue({ id: 1, update: jest.fn() });
      mockExam.findByPk.mockResolvedValue({ id: 1, total_marks: 100, pass_marks: 40 });
      mockQuestionBank.findByPk.mockResolvedValue(null); // Fake question ID returns null
      
      const res = await request(app)
        .post('/api/v1/exams/1/submit')
        .send({
          attempt_id: 1,
          answers: [{ question_id: 9999, selected_answer: 'A' }] // Fake question ID
        });

      // Should not crash (500)
      expect(res.statusCode).toBe(200);
      expect(res.body.result.total_marks).toBe(0);
    });
  });

  describe('Assignment Module', () => {
    it('should return 404 when trying to get assignment from another branch', async () => {
      mockAssignment.findOne.mockResolvedValue(null); // Simulated 404 due to branch scoping
      
      const res = await request(app).get('/api/v1/assignments/999');
      
      expect(res.statusCode).toBe(404);
    });

    it('should return 404 when submitting to a non-existent assignment to prevent DB crash', async () => {
      mockAssignment.findByPk.mockResolvedValue(null); 
      
      const res = await request(app)
        .post('/api/v1/assignments/999/submit')
        .send({
          submission_text: "My homework"
        });

      expect(res.statusCode).toBe(404);
    });
  });
});
