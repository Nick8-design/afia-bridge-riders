const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/db");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },

    order_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },

    prescription_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    pharmacy_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    prepared_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    patient_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    patient_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    patient_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    patient_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    delivery_type: {
      type: DataTypes.ENUM("pickup", "home_delivery"),
      allowNull: false,
      defaultValue: "pickup",
    },

    priority: {
      type: DataTypes.ENUM("urgent", "normal"),
      allowNull: true,
      defaultValue: "normal",
    },

    status: {
      type: DataTypes.ENUM(
        "pending",
        "processing",
        "ready",
        "dispatched",
        "delivered",
        "cancelled"
      ),
      allowNull: false,
      defaultValue: "pending",
    },

    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },

    payment_status: {
      type: DataTypes.ENUM("unpaid", "paid", "refunded"),
      allowNull: true,
      defaultValue: "unpaid",
    },

    payment_method: {
      type: DataTypes.ENUM("mpesa", "cash", "insurance", "nhif"),
      allowNull: true,
    },

    mpesa_ref: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "orders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Order;