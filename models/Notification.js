const { DataTypes } = require('sequelize');
const { sequelize } = require("../database/db");

const Notification = sequelize.define(
  'Notification', 
  {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    allowNull: false,

    defaultValue: DataTypes.UUIDV4 
  },
  user_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    index: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  notification_type: {
    type: DataTypes.ENUM(
      'appointment', 'prescription', 'order', 'delivery', 
      'payment', 'low_stock', 'expiry_alert', 'broadcast', 
      'system', 'chat'
    ),
    allowNull: false,
    index: true
  },
  channel: {
    type: DataTypes.ENUM('sms', 'email', 'push', 'in_app'),
    allowNull: false,
    defaultValue: 'in_app',
    index: true
  },
  reference_id: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    index: true
  },
  reference_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  broadcast_id: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    index: true
  },
  is_read: {
    type: DataTypes.BOOLEAN, // Maps to tinyint(1)
    allowNull: true,
    defaultValue: 0,
    index: true
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: true,
    index: true
  }
}, {
  // Logic for created_at and updated_at
  timestamps: true,
  createdAt: 'created_at',
  updated_at: 'updated_at',
  tableName: 'notifications',
  underscored: true
});

module.exports = Notification;


// const { DataTypes } = require("sequelize");
// const { sequelize } = require("../database/db");

// const Notification = sequelize.define("Notification", {

//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true
//   },

//   userId: DataTypes.STRING,

//   notificationType: DataTypes.STRING,

//   title: DataTypes.STRING,

//   text: DataTypes.STRING,

//   timeSent: {
//     type: DataTypes.DATE,
//     defaultValue: DataTypes.NOW
//   }

// });

// module.exports = Notification;