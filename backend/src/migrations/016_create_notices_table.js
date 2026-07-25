const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('notices', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'organizations', key: 'id' }
      },
      branch_id: {
        type: DataTypes.INTEGER,
        references: { model: 'branches', key: 'id' }
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      target_audience: {
        type: DataTypes.ENUM('All', 'Students', 'Staff', 'Parents', 'Specific'),
        allowNull: false,
        defaultValue: 'All'
      },
      priority: {
        type: DataTypes.ENUM('Low', 'Medium', 'High', 'Urgent'),
        defaultValue: 'Medium'
      },
      publish_date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      expiry_date: {
        type: DataTypes.DATE
      },
      attachments: {
        type: DataTypes.JSON
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      created_by: {
        type: DataTypes.INTEGER,
        references: { model: 'users', key: 'id' }
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('notices', ['organization_id']);
    await queryInterface.addIndex('notices', ['target_audience']);
    await queryInterface.addIndex('notices', ['publish_date']);
    await queryInterface.addIndex('notices', ['is_active']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('notices');
  }
};
