/**
 * MongoDB Database Configuration
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/university_scheduler';
    
    const conn = await mongoose.connect(mongoURI, {
      // Mongoose 8 uses these options by default
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.log('⚠️ MongoDB connection failed. Running in memory-only mode.');
    console.log('   To enable persistence, make sure MongoDB is running.');
    // Don't exit - allow the app to run without MongoDB
    return null;
  }
};

module.exports = connectDB;
