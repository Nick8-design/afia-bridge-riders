const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/db");

const Pharmacy = sequelize.define(
  "Pharmacy",
  {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
      },

      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },

      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },

      logo: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },

      address_line1: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      address_line2: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      county: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      sub_county: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      gps_lat: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: true,
      },

      gps_lng: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: true,
      },

      license_number: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      license_expiry: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      delivery_zones: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      is_24hr: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },

      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
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
      tableName: "pharmacies",
      timestamps: false, // since you already defined created_at and updated_at
      underscored: true,
    }
  );


  module.exports = Pharmacy;