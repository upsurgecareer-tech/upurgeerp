const { AccountHead, Transaction, TransactionEntry, Expense } = require('../models/Accounting');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const financialReportService = require('../utils/financialReportService');

const getOrgId = (user) => user ? (user.organizationId || user.organization_id || 1) : 1;
const getBranchId = (user) => user ? (user.branchId || user.branch_id || 1) : 1;

// Account Heads
exports.createAccountHead = async (req, res) => {
  try {
    const { name, code, type, parentId } = req.body;
    const accountHead = await AccountHead.create({
      organizationId: getOrgId(req.user),
      branchId: getBranchId(req.user),
      name, code, type, parentId
    });
    res.status(201).json(accountHead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAccountHeads = async (req, res) => {
  try {
    const { type } = req.query;
    const where = { organizationId: getOrgId(req.user), isActive: true };
    if (type) where.type = type;
    
    const accountHeads = await AccountHead.findAll({ where, order: [['code', 'ASC']] });
    res.json(accountHeads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Transactions
exports.createTransaction = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { transactionDate, type, description, entries } = req.body;
    
    const lastTransaction = await Transaction.findOne({
      where: { organizationId: getOrgId(req.user) },
      order: [['id', 'DESC']]
    });
    const transactionNumber = `TXN${String((lastTransaction?.id || 0) + 1).padStart(6, '0')}`;
    
    const totalAmount = entries.reduce((sum, e) => sum + parseFloat(e.debit || 0), 0);
    
    const transaction = await Transaction.create({
      organizationId: getOrgId(req.user),
      branchId: getBranchId(req.user),
      transactionNumber,
      transactionDate,
      type,
      description,
      totalAmount,
      createdBy: req.user.id
    }, { transaction: t });
    
    for (const entry of entries) {
      await TransactionEntry.create({
        transactionId: transaction.id,
        accountHeadId: entry.accountHeadId,
        debit: entry.debit || 0,
        credit: entry.credit || 0,
        description: entry.description
      }, { transaction: t });
    }
    
    await t.commit();
    res.status(201).json(transaction);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    const where = { organizationId: getOrgId(req.user) };
    if (type) where.type = type;
    if (startDate && endDate) {
      where.transactionDate = { [Op.between]: [startDate, endDate] };
    }
    
    const transactions = await Transaction.findAll({
      where,
      include: [{ model: TransactionEntry, as: 'entries', include: [{ model: AccountHead, as: 'accountHead' }] }],
      order: [['transactionDate', 'DESC']]
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Expenses
exports.createExpense = async (req, res) => {
  try {
    const { accountHeadId, expenseDate, amount, paymentMethod, description } = req.body;
    
    const lastExpense = await Expense.findOne({
      where: { organizationId: getOrgId(req.user) },
      order: [['id', 'DESC']]
    });
    const expenseNumber = `EXP${String((lastExpense?.id || 0) + 1).padStart(6, '0')}`;
    
    const expense = await Expense.create({
      organizationId: getOrgId(req.user),
      branchId: getBranchId(req.user),
      expenseNumber,
      accountHeadId,
      expenseDate,
      amount,
      paymentMethod,
      description,
      createdBy: req.user.id
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const where = { organizationId: getOrgId(req.user) };
    if (status) where.status = status;
    if (startDate && endDate) {
      where.expenseDate = { [Op.between]: [startDate, endDate] };
    }
    
    const expenses = await Expense.findAll({
      where,
      include: [{ model: AccountHead, as: 'accountHead' }],
      order: [['expenseDate', 'DESC']]
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await Expense.update(
      { status, approvedBy: req.user.id },
      { where: { id, organizationId: getOrgId(req.user) } }
    );
    res.json({ message: 'Expense updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reports
exports.getBalanceSheet = async (req, res) => {
  try {
    const { date } = req.query;
    const balanceSheet = await financialReportService.generateBalanceSheet(
      getOrgId(req.user),
      date ? new Date(date) : new Date()
    );
    res.json(balanceSheet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfitLoss = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const profitLoss = await financialReportService.generateProfitLoss(
      getOrgId(req.user),
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );
    res.json(profitLoss);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTrialBalance = async (req, res) => {
  try {
    const { date } = req.query;
    const trialBalance = await financialReportService.generateTrialBalance(
      getOrgId(req.user),
      date ? new Date(date) : new Date()
    );
    res.json(trialBalance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
