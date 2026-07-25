'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Email Templates
    await queryInterface.createTable('email_templates', {
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
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      subject: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('Admission', 'Fee', 'Exam', 'Attendance', 'General'),
        allowNull: false
      },
      variables: {
        type: Sequelize.JSON
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

    // SMS Templates
    await queryInterface.createTable('sms_templates', {
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
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('Admission', 'Fee', 'Exam', 'Attendance', 'General'),
        allowNull: false
      },
      variables: {
        type: Sequelize.JSON
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

    // Communication Logs
    await queryInterface.createTable('communication_logs', {
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
      type: {
        type: Sequelize.ENUM('Email', 'SMS', 'WhatsApp', 'Push'),
        allowNull: false
      },
      recipient_type: {
        type: Sequelize.ENUM('Student', 'Parent', 'Staff', 'Lead'),
        allowNull: false
      },
      recipient_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      recipient_contact: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      subject: {
        type: Sequelize.STRING(255)
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('Pending', 'Sent', 'Failed', 'Delivered', 'Read'),
        defaultValue: 'Pending'
      },
      sent_at: {
        type: Sequelize.DATE
      },
      error_message: {
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

    // Announcements
    await queryInterface.createTable('announcements', {
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
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('General', 'Urgent', 'Event', 'Holiday', 'Exam'),
        allowNull: false
      },
      target_audience: {
        type: Sequelize.ENUM('All', 'Students', 'Parents', 'Staff', 'Specific'),
        allowNull: false
      },
      target_ids: {
        type: Sequelize.JSON
      },
      publish_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      expiry_date: {
        type: Sequelize.DATE
      },
      is_published: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      send_email: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      send_sms: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      send_push: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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

    // Push Notification Tokens
    await queryInterface.createTable('push_tokens', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' }
      },
      token: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      device_type: {
        type: Sequelize.ENUM('Android', 'iOS', 'Web'),
        allowNull: false
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

    // Seed default templates (will use first organization)
    const organizations = await queryInterface.sequelize.query(
      'SELECT id FROM organizations LIMIT 1',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (organizations.length > 0) {
      const orgId = organizations[0].id;
      
      await queryInterface.bulkInsert('email_templates', [
        {
          organization_id: orgId,
          name: 'Admission Confirmation',
          subject: 'Welcome to {{organization_name}}',
          body: 'Dear {{student_name}},\n\nCongratulations! Your admission has been confirmed.\nAdmission Number: {{admission_number}}\n\nBest Regards,\n{{organization_name}}',
          type: 'Admission',
          variables: JSON.stringify(['student_name', 'admission_number', 'organization_name']),
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          organization_id: orgId,
          name: 'Fee Payment Receipt',
          subject: 'Fee Payment Receipt - {{receipt_number}}',
          body: 'Dear {{student_name}},\n\nYour fee payment of {{amount}} has been received.\nReceipt Number: {{receipt_number}}\n\nThank you!',
          type: 'Fee',
          variables: JSON.stringify(['student_name', 'amount', 'receipt_number']),
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);

      await queryInterface.bulkInsert('sms_templates', [
        {
          organization_id: orgId,
          name: 'Fee Reminder',
          message: 'Dear {{student_name}}, your fee of {{amount}} is due on {{due_date}}. Please pay at the earliest.',
          type: 'Fee',
          variables: JSON.stringify(['student_name', 'amount', 'due_date']),
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          organization_id: orgId,
          name: 'Attendance Alert',
          message: 'Dear Parent, {{student_name}} was absent today ({{date}}). Please contact us if needed.',
          type: 'Attendance',
          variables: JSON.stringify(['student_name', 'date']),
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('push_tokens');
    await queryInterface.dropTable('announcements');
    await queryInterface.dropTable('communication_logs');
    await queryInterface.dropTable('sms_templates');
    await queryInterface.dropTable('email_templates');
  }
};
