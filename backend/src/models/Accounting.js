const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AccountHead = sequelize.define('AccountHead', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  organizationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'organization_id'
  },
  branchId: {
    type: DataTypes.INTEGER,
    field: 'branch_id'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('Asset', 'Liability', 'Income', 'Expense', 'Equity'),
    allowNull: false
  },
  parentId: {
    type: DataTypes.INTEGER,
    field: 'parent_id'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'account_heads',
  underscored: true
});

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  organizationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'organization_id'
  },
  branchId: {
    type: DataTypes.INTEGER,
    field: 'branch_id'
  },
  transactionNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'transaction_number'
  },
  transactionDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'transaction_date'
  },
  type: {
    type: DataTypes.ENUM('Receipt', 'Payment', 'Journal', 'Contra'),
    allowNull: false
  },
  referenceType: {
    type: DataTypes.STRING(50),
    field: 'reference_type'
  },
  referenceId: {
    type: DataTypes.INTEGER,
    field: 'reference_id'
  },
  description: {
    type: DataTypes.TEXT
  },
  totalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'total_amount'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    field: 'created_by'
  }
}, {
  tableName: 'transactions',
  underscored: true
});

const TransactionEntry = sequelize.define('TransactionEntry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  transactionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'transaction_id'
  },
  accountHeadId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'account_head_id'
  },
  debit: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  credit: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'transaction_entries',
  underscored: true
});

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  organizationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'organization_id'
  },
  branchId: {
    type: DataTypes.INTEGER,
    field: 'branch_id'
  },
  expenseNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'expense_number'
  },
  accountHeadId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'account_head_id'
  },
  expenseDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expense_date'
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('Cash', 'Bank', 'Cheque', 'Online'),
    allowNull: false,
    field: 'payment_method'
  },
  description: {
    type: DataTypes.TEXT
  },
  receiptFile: {
    type: DataTypes.STRING(255),
    field: 'receipt_file'
  },
  approvedBy: {
    type: DataTypes.INTEGER,
    field: 'approved_by'
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
    defaultValue: 'Pending'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    field: 'created_by'
  }
}, {
  tableName: 'expenses',
  underscored: true
});

// Associations
Transaction.hasMany(TransactionEntry, { foreignKey: 'transactionId', as: 'entries' });
TransactionEntry.belongsTo(Transaction, { foreignKey: 'transactionId' });
TransactionEntry.belongsTo(AccountHead, { foreignKey: 'accountHeadId', as: 'accountHead' });
Expense.belongsTo(AccountHead, { foreignKey: 'accountHeadId', as: 'accountHead' });

module.exports = { AccountHead, Transaction, TransactionEntry, Expense };
