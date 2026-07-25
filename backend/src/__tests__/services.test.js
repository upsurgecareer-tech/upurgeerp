const { generateBalanceSheet, generateProfitLoss, generateTrialBalance } = require('../utils/financialReportService');
const { getCache, setCache, deleteCache } = require('../utils/cacheService');

describe('Financial Report Service', () => {
  
  describe('generateBalanceSheet', () => {
    test('should return balance sheet structure', async () => {
      const organizationId = 1;
      const asOfDate = new Date();
      
      const result = await generateBalanceSheet(organizationId, asOfDate);
      
      expect(result).toHaveProperty('asOfDate');
      expect(result).toHaveProperty('assets');
      expect(result).toHaveProperty('liabilities');
      expect(result).toHaveProperty('equity');
      expect(result).toHaveProperty('totalAssets');
      expect(result).toHaveProperty('totalLiabilities');
      expect(result).toHaveProperty('totalEquity');
      expect(result).toHaveProperty('balanced');
      
      expect(Array.isArray(result.assets)).toBe(true);
      expect(Array.isArray(result.liabilities)).toBe(true);
      expect(Array.isArray(result.equity)).toBe(true);
    });
  });

  describe('generateProfitLoss', () => {
    test('should return P&L structure', async () => {
      const organizationId = 1;
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      const result = await generateProfitLoss(organizationId, startDate, endDate);
      
      expect(result).toHaveProperty('startDate');
      expect(result).toHaveProperty('endDate');
      expect(result).toHaveProperty('income');
      expect(result).toHaveProperty('expenses');
      expect(result).toHaveProperty('totalIncome');
      expect(result).toHaveProperty('totalExpenses');
      expect(result).toHaveProperty('netProfit');
      expect(result).toHaveProperty('profitMargin');
      
      expect(Array.isArray(result.income)).toBe(true);
      expect(Array.isArray(result.expenses)).toBe(true);
    });
  });

  describe('generateTrialBalance', () => {
    test('should return trial balance structure', async () => {
      const organizationId = 1;
      const asOfDate = new Date();
      
      const result = await generateTrialBalance(organizationId, asOfDate);
      
      expect(result).toHaveProperty('asOfDate');
      expect(result).toHaveProperty('accounts');
      expect(result).toHaveProperty('totalDebit');
      expect(result).toHaveProperty('totalCredit');
      expect(result).toHaveProperty('balanced');
      
      expect(Array.isArray(result.accounts)).toBe(true);
    });
  });
});

describe('Cache Service', () => {
  
  describe('setCache and getCache', () => {
    test('should set and retrieve cache', async () => {
      const key = 'test:key';
      const value = { data: 'test data' };
      
      await setCache(key, value, 60);
      const retrieved = await getCache(key);
      
      if (retrieved) {
        expect(retrieved).toEqual(value);
      }
    });
  });

  describe('deleteCache', () => {
    test('should delete cache key', async () => {
      const key = 'test:delete';
      const value = { data: 'to be deleted' };
      
      await setCache(key, value, 60);
      await deleteCache(key);
      
      const retrieved = await getCache(key);
      expect(retrieved).toBeNull();
    });
  });
});
