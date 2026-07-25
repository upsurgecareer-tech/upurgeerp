'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Account Heads
    await queryInterface.createTable('account_heads', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      organization_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'organizations', key: 'id' }
      },
      branch_id: {
        type: Sequelize.INTEGER,
        references: { model: 'branches', key: 'id' }
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      type: {
        type: Sequelize.ENUM('Asset', 'Liability', 'Income', 'Expense', 'Equity'),
        allowNull: false
      },
      parent_id: {
        type: Sequelize.INTEGER,
        references: { model: 'account_heads', key: 'id' }
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Transactions
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      organization_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'organizations', key: 'id' }
      },
      branch_id: {
        type: Sequelize.INTEGER,
        references: { model: 'branches', key: 'id' }
      },
      transaction_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      transaction_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('Receipt', 'Payment', 'Journal', 'Contra'),
        allowNull: false
      },
      reference_type: {
        type: Sequelize.STRING(50)
      },
      reference_id: {
        type: Sequelize.INTEGER
      },
      description: {
        type: Sequelize.TEXT
      },
      total_amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      created_by: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Transaction Entries
    await queryInterface.createTable('transaction_entries', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      transaction_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'transactions', key: 'id' },
        onDelete: 'CASCADE'
      },
      account_head_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'account_heads', key: 'id' }
      },
      debit: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      credit: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      description: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Expenses
    await queryInterface.createTable('expenses', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      organization_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'organizations', key: 'id' }
      },
      branch_id: {
        type: Sequelize.INTEGER,
        references: { model: 'branches', key: 'id' }
      },
      expense_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      account_head_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'account_heads', key: 'id' }
      },
      expense_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      payment_method: {
        type: Sequelize.ENUM('Cash', 'Bank', 'Cheque', 'Online'),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      receipt_file: {
        type: Sequelize.STRING(255)
      },
      approved_by: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }
      },
      status: {
        type: Sequelize.ENUM('Pending', 'Approved', 'Rejected'),
        defaultValue: 'Pending'
      },
      created_by: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Seed default account heads (will use first organization)
    const [organizations] = await queryInterface.sequelize.query(
      'SELECT id FROM organizations LIMIT 1'
    );
    
    if (organizations.length > 0) {
      const orgId = organizations[0].id;
      
      // Check if account heads already exist
      const [existingHeads] = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM account_heads'
      );
      
      if (existingHeads[0].count === 0) {
        await queryInterface.bulkInsert('account_heads', [
          { organization_id: orgId, name: 'Cash', code: 'ACC001', type: 'Asset', created_at: new Date(), updated_at: new Date() },
          { organization_id: orgId, name: 'Bank', code: 'ACC002', type: 'Asset', created_at: new Date(), updated_at: new Date() },
          { organization_id: orgId, name: 'Fee Income', code: 'ACC003', type: 'Income', created_at: new Date(), updated_at: new Date() },
          { organization_id: orgId, name: 'Salary Expense', code: 'ACC004', type: 'Expense', created_at: new Date(), updated_at: new Date() },
          { organization_id: orgId, name: 'Rent Expense', code: 'ACC005', type: 'Expense', created_at: new Date(), updated_at: new Date() },
          { organization_id: orgId, name: 'Utility Expense', code: 'ACC006', type: 'Expense', created_at: new Date(), updated_at: new Date() },
          { organization_id: orgId, name: 'Accounts Receivable', code: 'ACC007', type: 'Asset', created_at: new Date(), updated_at: new Date() },
          { organization_id: orgId, name: 'Accounts Payable', code: 'ACC008', type: 'Liability', created_at: new Date(), updated_at: new Date() }
        ]);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('expenses');
    await queryInterface.dropTable('transaction_entries');
    await queryInterface.dropTable('transactions');
    await queryInterface.dropTable('account_heads');
  }
};
