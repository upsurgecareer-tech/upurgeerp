const { AccountHead, TransactionEntry, Transaction } = require('../models/Accounting');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Calculate account balance
const calculateAccountBalance = async (accountHeadId, endDate, organizationId) => {
  const result = await TransactionEntry.findOne({
    attributes: [
      [sequelize.fn('SUM', sequelize.col('debit')), 'totalDebit'],
      [sequelize.fn('SUM', sequelize.col('credit')), 'totalCredit']
    ],
    include: [{
      model: Transaction,
      attributes: [],
      where: {
        organizationId,
        transactionDate: { [Op.lte]: endDate }
      }
    }],
    where: { accountHeadId },
    raw: true
  });

  const debit = parseFloat(result?.totalDebit || 0);
  const credit = parseFloat(result?.totalCredit || 0);
  return debit - credit;
};

// Generate Balance Sheet
exports.generateBalanceSheet = async (organizationId, asOfDate) => {
  const endDate = asOfDate || new Date();

  // Fetch all account heads
  const assets = await AccountHead.findAll({
    where: { organizationId, type: 'Asset', isActive: true },
    order: [['code', 'ASC']]
  });

  const liabilities = await AccountHead.findAll({
    where: { organizationId, type: 'Liability', isActive: true },
    order: [['code', 'ASC']]
  });

  const equity = await AccountHead.findAll({
    where: { organizationId, type: 'Equity', isActive: true },
    order: [['code', 'ASC']]
  });

  // Calculate balances
  const assetDetails = await Promise.all(
    assets.map(async (acc) => ({
      id: acc.id,
      name: acc.name,
      code: acc.code,
      balance: await calculateAccountBalance(acc.id, endDate, organizationId)
    }))
  );

  const liabilityDetails = await Promise.all(
    liabilities.map(async (acc) => ({
      id: acc.id,
      name: acc.name,
      code: acc.code,
      balance: await calculateAccountBalance(acc.id, endDate, organizationId)
    }))
  );

  const equityDetails = await Promise.all(
    equity.map(async (acc) => ({
      id: acc.id,
      name: acc.name,
      code: acc.code,
      balance: await calculateAccountBalance(acc.id, endDate, organizationId)
    }))
  );

  const totalAssets = assetDetails.reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = liabilityDetails.reduce((sum, l) => sum + Math.abs(l.balance), 0);
  const totalEquity = equityDetails.reduce((sum, e) => sum + Math.abs(e.balance), 0);

  return {
    asOfDate: endDate,
    assets: assetDetails.filter(a => a.balance !== 0),
    liabilities: liabilityDetails.filter(l => l.balance !== 0),
    equity: equityDetails.filter(e => e.balance !== 0),
    totalAssets,
    totalLiabilities,
    totalEquity,
    totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
    balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
  };
};

// Generate Profit & Loss Statement
exports.generateProfitLoss = async (organizationId, startDate, endDate) => {
  const start = startDate || new Date(new Date().getFullYear(), 0, 1);
  const end = endDate || new Date();

  // Fetch income and expense accounts
  const incomeAccounts = await AccountHead.findAll({
    where: { organizationId, type: 'Income', isActive: true },
    order: [['code', 'ASC']]
  });

  const expenseAccounts = await AccountHead.findAll({
    where: { organizationId, type: 'Expense', isActive: true },
    order: [['code', 'ASC']]
  });

  // Calculate period balances
  const calculatePeriodBalance = async (accountHeadId) => {
    const result = await TransactionEntry.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('debit')), 'totalDebit'],
        [sequelize.fn('SUM', sequelize.col('credit')), 'totalCredit']
      ],
      include: [{
        model: Transaction,
        attributes: [],
        where: {
          organizationId,
          transactionDate: { [Op.between]: [start, end] }
        }
      }],
      where: { accountHeadId },
      raw: true
    });

    const debit = parseFloat(result?.totalDebit || 0);
    const credit = parseFloat(result?.totalCredit || 0);
    return credit - debit; // Income is credit, expense is debit
  };

  const incomeDetails = await Promise.all(
    incomeAccounts.map(async (acc) => ({
      id: acc.id,
      name: acc.name,
      code: acc.code,
      amount: await calculatePeriodBalance(acc.id)
    }))
  );

  const expenseDetails = await Promise.all(
    expenseAccounts.map(async (acc) => ({
      id: acc.id,
      name: acc.name,
      code: acc.code,
      amount: Math.abs(await calculatePeriodBalance(acc.id))
    }))
  );

  const totalIncome = incomeDetails.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenseDetails.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  return {
    startDate: start,
    endDate: end,
    income: incomeDetails.filter(i => i.amount !== 0),
    expenses: expenseDetails.filter(e => e.amount !== 0),
    totalIncome,
    totalExpenses,
    netProfit,
    profitMargin: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : 0
  };
};

// Generate Trial Balance
exports.generateTrialBalance = async (organizationId, asOfDate) => {
  const endDate = asOfDate || new Date();

  const allAccounts = await AccountHead.findAll({
    where: { organizationId, isActive: true },
    order: [['code', 'ASC']]
  });

  const trialBalanceData = await Promise.all(
    allAccounts.map(async (acc) => {
      const result = await TransactionEntry.findOne({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('debit')), 'totalDebit'],
          [sequelize.fn('SUM', sequelize.col('credit')), 'totalCredit']
        ],
        include: [{
          model: Transaction,
          attributes: [],
          where: {
            organizationId,
            transactionDate: { [Op.lte]: endDate }
          }
        }],
        where: { accountHeadId: acc.id },
        raw: true
      });

      const debit = parseFloat(result?.totalDebit || 0);
      const credit = parseFloat(result?.totalCredit || 0);

      return {
        id: acc.id,
        name: acc.name,
        code: acc.code,
        type: acc.type,
        debit,
        credit
      };
    })
  );

  const filtered = trialBalanceData.filter(t => t.debit !== 0 || t.credit !== 0);
  const totalDebit = filtered.reduce((sum, t) => sum + t.debit, 0);
  const totalCredit = filtered.reduce((sum, t) => sum + t.credit, 0);

  return {
    asOfDate: endDate,
    accounts: filtered,
    totalDebit,
    totalCredit,
    balanced: Math.abs(totalDebit - totalCredit) < 0.01
  };
};

module.exports = exports;
