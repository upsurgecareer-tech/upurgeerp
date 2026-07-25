const request = require('supertest');
const app = require('../app');

const mockLibraryBook = { create: jest.fn(), findOne: jest.fn(), findAll: jest.fn(), update: jest.fn(), findByPk: jest.fn() };
const mockBookIssue = { create: jest.fn(), findOne: jest.fn(), findAll: jest.fn(), update: jest.fn(), findByPk: jest.fn() };

jest.mock('../models', () => {
  if (!global.mockLibraryBook) global.mockLibraryBook = { create: jest.fn(), findOne: jest.fn(), findAll: jest.fn(), update: jest.fn(), findByPk: jest.fn() };
  if (!global.mockBookIssue) global.mockBookIssue = { create: jest.fn(), findOne: jest.fn(), findAll: jest.fn(), update: jest.fn(), findByPk: jest.fn() };
  
  return {
    LibraryBook: global.mockLibraryBook,
    BookIssue: global.mockBookIssue
  };
});
jest.mock('../models/LibraryBook', () => global.mockLibraryBook);
jest.mock('../models/BookIssue', () => global.mockBookIssue);

jest.mock('../middlewares/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, role_id: 3, branch_id: 1 };
    next();
  }
}));

describe('Library Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a book associated with the user branch', async () => {
    global.mockLibraryBook.create.mockResolvedValue({ id: 1, title: 'Test Book', branch_id: 1 });
    
    const res = await request(app)
      .post('/api/v1/library/books')
      .send({
        title: 'Test Book',
        quantity: 5
      });
      
    expect(res.statusCode).toBe(201);
    expect(global.mockLibraryBook.create).toHaveBeenCalledWith(expect.objectContaining({
      branch_id: 1,
      title: 'Test Book'
    }));
  });

  it('should throw 404 when trying to issue a book from another branch', async () => {
    global.mockLibraryBook.findOne.mockResolvedValue(null); // Simulated IDOR block
    
    const res = await request(app)
      .post('/api/v1/library/issues')
      .send({
        book_id: 999,
        student_id: 1,
        due_date: '2026-12-31'
      });
      
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toMatch(/Book not found/i);
  });
});
