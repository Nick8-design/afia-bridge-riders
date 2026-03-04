const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // We explicitly tell Mongoose to use 'afya_db' here
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'afya_db', 
    });

    console.log(`MongoDB Connected to: ${conn.connection.name}`);
  } catch (err) {
    console.error("Database Connection Failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;