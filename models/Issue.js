const { DataTypes } = require('sequelize');
const { sequelize } = require("../database/db");

const Issue = sequelize.define('Issue', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4 
  },
  user_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'users', 
      key: 'id'
    }
  },
  reference_id: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    comment: 'ID of the related entity (e.g., order_id, delivery_id)'
  },
  reference_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Type of entity (e.g., "Order", "Prescription")'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('open', 'in_review', 'resolved', 'closed'),
    allowNull: false,
    defaultValue: 'open'
  },
  resolved_by: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    comment: 'Admin or system user ID who resolved the ticket'
  },
  resolution_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  // Database configuration
  tableName: 'issues',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['reference_id'] },
    { fields: ['status'] }
  ]
});

module.exports = Issue;