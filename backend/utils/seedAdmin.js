import User from '../models/User.model.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Seed admin user from environment variables
 * This runs on server start and creates admin if it doesn't exist
 */
export const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'System Administrator';

    // Check if admin credentials are provided
    if (!adminEmail || !adminPassword) {
      console.warn('⚠️  ADMIN_EMAIL or ADMIN_PASSWORD not set in .env. Admin user will not be created.');
      return;
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
    
    if (existingAdmin) {
      // If admin exists but role is not admin, update it
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        existingAdmin.isActive = true;
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin role:', adminEmail);
      } else {
        console.log('✅ Admin user already exists:', adminEmail);
      }
      return;
    }

    // Create admin user
    const admin = await User.create({
      name: adminName,
      email: adminEmail.toLowerCase(),
      password: adminPassword,
      role: 'admin',
      isActive: true
    });

    console.log('✅ Admin user created successfully:', adminEmail);
    console.log('   Name:', adminName);
    console.log('   Email:', adminEmail);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    // Don't throw error - allow server to start even if admin seeding fails
  }
};

