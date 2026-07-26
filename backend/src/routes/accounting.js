const express = require('express');
const router = express.Router();
const accountingController = require('../controllers/accountingController');
const { authenticate } = require('../middlewares/authenticate');
const { validate } = require('../middlewares/validate');
const { createAccountHeadSchema, createExpenseSchema, createTransactionSchema } = require('../validators/schemas');

router.use(authenticate);

// Account Heads
router.post('/account-heads', validate(createAccountHeadSchema), accountingController.createAccountHead);
router.get('/account-heads', accountingController.getAccountHeads);
router.get('/accounts', accountingController.getAccountHeads);

// Transactions
router.post('/transactions', validate(createTransactionSchema), accountingController.createTransaction);
router.get('/transactions', accountingController.getTransactions);

// Expenses
router.post('/expenses', validate(createExpenseSchema), accountingController.createExpense);
router.get('/expenses', accountingController.getExpenses);
router.patch('/expenses/:id/approve', accountingController.approveExpense);

// Reports
router.get('/reports/balance-sheet', accountingController.getBalanceSheet);
router.get('/reports/profit-loss', accountingController.getProfitLoss);
router.get('/reports/trial-balance', accountingController.getTrialBalance);

module.exports = router;
