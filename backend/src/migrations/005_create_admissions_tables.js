'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Students
    await queryInterface.createTable('students', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      branch_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'branches', key: 'id' }
      },
      lead_id: {
        type: Sequelize.INTEGER,
        references: { model: 'leads', key: 'id' }
      },
      admission_no: {
        type: Sequelize.STRING(50),
        unique: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      dob: {
        type: Sequelize.DATEONLY
      },
      mobile: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100)
      },
      address: {
        type: Sequelize.TEXT
      },
      parent_name: {
        type: Sequelize.STRING(100)
      },
      parent_mobile: {
        type: Sequelize.STRING(15)
      },
      photo_url: {
        type: Sequelize.STRING(255)
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('students', ['mobile']);
    await queryInterface.addIndex('students', ['branch_id']);

    // Course Packages
    await queryInterface.createTable('course_packages', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      branch_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'branches', key: 'id' }
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      total_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      duration_months: {
        type: Sequelize.INTEGER
      },
      description: {
        type: Sequelize.TEXT
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Batches
    await queryInterface.createTable('batches', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      branch_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'branches', key: 'id' }
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATEONLY
      },
      end_date: {
        type: Sequelize.DATEONLY
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Admissions
    await queryInterface.createTable('admissions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'students', key: 'id' }
      },
      course_package_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'course_packages', key: 'id' }
      },
      batch_id: {
        type: Sequelize.INTEGER,
        references: { model: 'batches', key: 'id' }
      },
      counsellor_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }
      },
      admission_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      total_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      net_payable: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('Active', 'Inactive', 'Cancelled'),
        defaultValue: 'Active'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('admissions', ['student_id']);
    await queryInterface.addIndex('admissions', ['course_package_id']);

    // Fee Schedules
    await queryInterface.createTable('fee_schedules', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      admission_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'admissions', key: 'id' },
        onDelete: 'CASCADE'
      },
      installment_no: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      due_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('Pending', 'Paid', 'Overdue'),
        defaultValue: 'Pending'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('fee_schedules', ['admission_id']);
    await queryInterface.addIndex('fee_schedules', ['due_date']);
    await queryInterface.addIndex('fee_schedules', ['status']);

    // Fee Payments
    await queryInterface.createTable('fee_payments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      fee_schedule_id: {
        type: Sequelize.INTEGER,
        references: { model: 'fee_schedules', key: 'id' }
      },
      admission_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'admissions', key: 'id' }
      },
      amount_paid: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      payment_mode: {
        type: Sequelize.ENUM('Cash', 'Online', 'Cheque', 'Card'),
        defaultValue: 'Cash'
      },
      payment_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      receipt_no: {
        type: Sequelize.STRING(50),
        unique: true
      },
      received_by: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }
      },
      gateway_txn_id: {
        type: Sequelize.STRING(100)
      },
      remarks: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('fee_payments', ['admission_id']);
    await queryInterface.addIndex('fee_payments', ['receipt_no']);

    // Discounts
    await queryInterface.createTable('discounts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      admission_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'admissions', key: 'id' },
        onDelete: 'CASCADE'
      },
      discount_type: {
        type: Sequelize.ENUM('Amount', 'Percentage'),
        allowNull: false
      },
      discount_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      reason: {
        type: Sequelize.TEXT
      },
      approved_by: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Student Documents
    await queryInterface.createTable('student_documents', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'students', key: 'id' },
        onDelete: 'CASCADE'
      },
      document_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      file_url: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      uploaded_by: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('student_documents', ['student_id']);

    console.log('✅ Admissions & Fee Management tables created successfully');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('student_documents');
    await queryInterface.dropTable('discounts');
    await queryInterface.dropTable('fee_payments');
    await queryInterface.dropTable('fee_schedules');
    await queryInterface.dropTable('admissions');
    await queryInterface.dropTable('batches');
    await queryInterface.dropTable('course_packages');
    await queryInterface.dropTable('students');
    console.log('✅ Admissions & Fee Management tables dropped successfully');
  }
};
