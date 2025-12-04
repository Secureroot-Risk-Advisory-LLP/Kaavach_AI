import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    console.log("Connecting to:", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@kaavach.ai' });
    
    if (adminExists) {
      console.log('ℹ️  Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    await User.create({
      name: 'Admin User',
      email: 'admin@kaavach.ai',
      password: 'admin123',
      role: 'admin',
      isEmailVerified: true
    });

    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email: admin@kaavach.ai');
    console.log('🔑 Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
