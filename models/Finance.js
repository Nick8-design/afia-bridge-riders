const { DataTypes } = require('sequelize');
const { sequelize } = require("../database/db");

const Wallet = sequelize.define('Wallet', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  balance: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'KES'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  payout_method: {
    type: DataTypes.ENUM('mpesa', 'bank'),
    allowNull: true
  },
  payout_account: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  trend: {
    type: DataTypes.JSON,
    allowNull: true
  },
  recent_payouts: {
    type: DataTypes.JSON,
    allowNull: true
  },
  transaction_history: {
    type: DataTypes.JSON,
    allowNull: true
  }

}, {
  tableName: 'wallets',
  timestamps: true,
  underscored: true
});

module.exports = Wallet;