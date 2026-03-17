const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 4000,
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: true, // Required for TiDB Cloud
      }
    },
    logging: false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('TiDB MySQL Connected Successfully');
    
    // Sync models to database (Creates tables if they don't exist)
    await sequelize.sync();
  } catch (err) {
    console.error(" TiDB Connection Failed:", err.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };