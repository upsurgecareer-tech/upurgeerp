'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Lead Sources
    await queryInterface.createTable('lead_sources', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
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

    // Lead Stages
    await queryInterface.createTable('lead_stages', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      order_sequence: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      color_code: {
        type: Sequelize.STRING(20),
        defaultValue: '#1976d2'
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

    // Leads
    await queryInterface.createTable('leads', {
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
      source_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'lead_sources', key: 'id' }
      },
      assigned_to: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100)
      },
      mobile: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      course_interest: {
        type: Sequelize.STRING(200)
      },
      stage: {
        type: Sequelize.STRING(50),
        defaultValue: 'New'
      },
      status: {
        type: Sequelize.ENUM('Active', 'Converted', 'Lost'),
        defaultValue: 'Active'
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

    await queryInterface.addIndex('leads', ['mobile']);
    await queryInterface.addIndex('leads', ['branch_id']);
    await queryInterface.addIndex('leads', ['assigned_to']);

    // Follow Ups
    await queryInterface.createTable('follow_ups', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      lead_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'leads', key: 'id' },
        onDelete: 'CASCADE'
      },
      counsellor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' }
      },
      follow_up_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      follow_up_type: {
        type: Sequelize.ENUM('Call', 'Meeting', 'Demo', 'Email'),
        defaultValue: 'Call'
      },
      notes: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.ENUM('Pending', 'Done', 'Cancelled'),
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

    await queryInterface.addIndex('follow_ups', ['lead_id']);
    await queryInterface.addIndex('follow_ups', ['counsellor_id']);
    await queryInterface.addIndex('follow_ups', ['follow_up_date']);

    // Lead Activities
    await queryInterface.createTable('lead_activities', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      lead_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'leads', key: 'id' },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' }
      },
      activity_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    console.log('✅ CRM tables created successfully');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('lead_activities');
    await queryInterface.dropTable('follow_ups');
    await queryInterface.dropTable('leads');
    await queryInterface.dropTable('lead_stages');
    await queryInterface.dropTable('lead_sources');
    console.log('✅ CRM tables dropped successfully');
  }
};
