const { DataTypes } = require('sequelize');
const { sequelize } = require("../database/db");

const DeliveryTask = sequelize.define('DeliveryTask', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4
  },

  package_number: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },

  order_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    unique: true
  },

  rider_id: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    index: true
  },

  status: {
    type: DataTypes.ENUM(
      'pending', 'assigned', 'accepted', 'picked_up', 
      'out_for_delivery', 'delivered', 'failed', 'cancelled'
    ),
    allowNull: false,
    defaultValue: 'pending',
    index: true
  },

  accept_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: 0
  },

 

  package_sealed: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },

  labeled_correctly: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },

  verified_with_pharmacy: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },

  pickup_location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  pickup_lat: {
    type: DataTypes.DECIMAL(9, 6),
    allowNull: true
  },

  pickup_lng: {
    type: DataTypes.DECIMAL(9, 6),
    allowNull: true
  },

  pickup_contact: {
    type: DataTypes.STRING(20),
    allowNull: true
  },

  pickup_time: {
    type: DataTypes.DATE,
    allowNull: true
  },

  dropoff_location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  dropoff_lat: {
    type: DataTypes.DECIMAL(9, 6),
    allowNull: true
  },

  dropoff_lng: {
    type: DataTypes.DECIMAL(9, 6),
    allowNull: true
  },

  receiver_contact: {
    type: DataTypes.STRING(20),
    allowNull: true
  },

  requirement: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  estimated_delivery_time: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  distance: {
    type: DataTypes.FLOAT,
    allowNull: true
  },

  charges: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },

  delivery_zone: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  delivery_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  otp_code: {
    type: DataTypes.STRING(6),
    allowNull: true
  },

  delivered_at: {
    type: DataTypes.DATE,
    allowNull: true
  },

  date_approved: {
    type: DataTypes.DATE,
    allowNull: true
  }

}, {
  tableName: 'deliveries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true
});

module.exports = DeliveryTask;