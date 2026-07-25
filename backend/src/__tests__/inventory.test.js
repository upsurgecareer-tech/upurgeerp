const request = require('supertest');
const app = require('../app');

const mockInventoryItem = { create: jest.fn(), findOne: jest.fn(), findAll: jest.fn(), update: jest.fn(), findByPk: jest.fn() };
const mockInventoryTransaction = { create: jest.fn(), findOne: jest.fn(), findAll: jest.fn(), update: jest.fn(), findByPk: jest.fn() };

jest.mock('../models', () => {
  if (!global.mockInventoryItem) global.mockInventoryItem = { create: jest.fn(), findOne: jest.fn(), findAll: jest.fn(), update: jest.fn(), findByPk: jest.fn() };
  if (!global.mockInventoryTransaction) global.mockInventoryTransaction = { create: jest.fn(), findOne: jest.fn(), findAll: jest.fn(), update: jest.fn(), findByPk: jest.fn() };
  
  return {
    InventoryItem: global.mockInventoryItem,
    InventoryTransaction: global.mockInventoryTransaction
  };
});
jest.mock('../models/InventoryItem', () => global.mockInventoryItem);
jest.mock('../models/InventoryTransaction', () => global.mockInventoryTransaction);

jest.mock('../middlewares/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, role_id: 3, branch_id: 1 };
    next();
  }
}));

describe('Inventory Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an item associated with the user branch', async () => {
    global.mockInventoryItem.create.mockResolvedValue({ id: 1, name: 'Test Item', branch_id: 1 });
    
    const res = await request(app)
      .post('/api/v1/inventory/items')
      .send({
        name: 'Test Item',
        quantity: 10,
        min_stock_level: 5
      });
      
    expect(res.statusCode).toBe(201);
    expect(global.mockInventoryItem.create).toHaveBeenCalledWith(expect.objectContaining({
      branch_id: 1,
      name: 'Test Item',
      status: 'In Stock'
    }));
  });

  it('should throw 404 when trying to perform transaction on item from another branch', async () => {
    global.mockInventoryItem.findOne.mockResolvedValue(null); // Simulated IDOR block
    
    const res = await request(app)
      .post('/api/v1/inventory/transactions')
      .send({
        item_id: 999,
        transaction_type: 'Issue',
        quantity: 1,
        transaction_date: '2026-07-08'
      });
      
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toMatch(/Item not found/i);
  });
});
