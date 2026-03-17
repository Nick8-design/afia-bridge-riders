

const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/db");

const Finance = sequelize.define("Finance", {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },

  balance: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },

  trend: {
    type: DataTypes.JSON
  },

  recentPayouts: {
    type: DataTypes.JSON
  },

  transactionHistory: {
    type: DataTypes.JSON
  }

}, { timestamps: true ,

  
    tableName: 'Finances',
   
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
 
  
});

module.exports = Finance;