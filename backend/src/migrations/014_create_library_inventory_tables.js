'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Library Books
    await queryInterface.createTable('library_books', {
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
      isbn: {
        type: Sequelize.STRING(20),
        unique: true
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      author: {
        type: Sequelize.STRING(255)
      },
      publisher: {
        type: Sequelize.STRING(255)
      },
      category: {
        type: Sequelize.STRING(100)
      },
      quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      available_quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      rack_number: {
        type: Sequelize.STRING(50)
      },
      price: {
        type: Sequelize.DECIMAL(10, 2)
      },
      purchase_date: {
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.ENUM('Available', 'Issued', 'Lost', 'Damaged'),
        defaultValue: 'Available'
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

    // Book Issues
    await queryInterface.createTable('book_issues', {
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
      book_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'library_books', key: 'id' }
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'students', key: 'id' }
      },
      issue_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      return_date: {
        type: Sequelize.DATE
      },
      fine_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('Issued', 'Returned', 'Overdue'),
        defaultValue: 'Issued'
      },
      issued_by: {
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

    // Inventory Items
    await queryInterface.createTable('inventory_items', {
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
      item_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      category: {
        type: Sequelize.ENUM('Stationery', 'Electronics', 'Furniture', 'Lab Equipment', 'Sports', 'Other'),
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      unit: {
        type: Sequelize.STRING(20)
      },
      min_stock_level: {
        type: Sequelize.INTEGER,
        defaultValue: 10
      },
      unit_price: {
        type: Sequelize.DECIMAL(10, 2)
      },
      location: {
        type: Sequelize.STRING(100)
      },
      status: {
        type: Sequelize.ENUM('In Stock', 'Low Stock', 'Out of Stock'),
        defaultValue: 'In Stock'
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

    // Inventory Transactions
    await queryInterface.createTable('inventory_transactions', {
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
      item_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'inventory_items', key: 'id' }
      },
      transaction_type: {
        type: Sequelize.ENUM('Purchase', 'Issue', 'Return', 'Adjustment'),
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      transaction_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      reference_type: {
        type: Sequelize.STRING(50)
      },
      reference_id: {
        type: Sequelize.INTEGER
      },
      remarks: {
        type: Sequelize.TEXT
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

    // Seed sample data (will use first organization and branch)
    const organizations = await queryInterface.sequelize.query(
      'SELECT id FROM organizations LIMIT 1',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const branches = await queryInterface.sequelize.query(
      'SELECT id FROM branches LIMIT 1',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (organizations.length > 0 && branches.length > 0) {
      const orgId = organizations[0].id;
      const branchId = branches[0].id;
      
      await queryInterface.bulkInsert('library_books', [
        { organization_id: orgId, branch_id: branchId, isbn: '9780134685991', title: 'Effective Java', author: 'Joshua Bloch', publisher: 'Addison-Wesley', category: 'Programming', quantity: 5, available_quantity: 5, rack_number: 'A1', price: 45.00, purchase_date: new Date(), created_at: new Date(), updated_at: new Date() },
        { organization_id: orgId, branch_id: branchId, isbn: '9781449355739', title: 'Learning Python', author: 'Mark Lutz', publisher: "O'Reilly", category: 'Programming', quantity: 3, available_quantity: 3, rack_number: 'A2', price: 55.00, purchase_date: new Date(), created_at: new Date(), updated_at: new Date() }
      ]);

      await queryInterface.bulkInsert('inventory_items', [
        { organization_id: orgId, branch_id: branchId, item_code: 'INV001', name: 'Whiteboard Marker', category: 'Stationery', quantity: 100, unit: 'Piece', min_stock_level: 20, unit_price: 2.50, location: 'Store Room A', created_at: new Date(), updated_at: new Date() },
        { organization_id: orgId, branch_id: branchId, item_code: 'INV002', name: 'Projector', category: 'Electronics', quantity: 5, unit: 'Piece', min_stock_level: 2, unit_price: 500.00, location: 'Equipment Room', created_at: new Date(), updated_at: new Date() }
      ]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('inventory_transactions');
    await queryInterface.dropTable('inventory_items');
    await queryInterface.dropTable('book_issues');
    await queryInterface.dropTable('library_books');
  }
};
