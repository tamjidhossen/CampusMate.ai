const User = require('../models/User');



// Create default admin user if none exists
exports.createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const admin = await User.create({
        name: 'System Administrator',
        email: process.env.ADMIN_EMAIL || 'admin@campusmate.ai',
        password: process.env.ADMIN_PASSWORD || 'admin123456',
        phone: '+1-000-000-0000',
        department: 'Administration',
        residence: 'Campus Administration Office',
        bloodGroup: 'O+',
        role: 'admin',
        isVolunteer: false,
        isVerified: true
      });

      console.log('✅ Default admin user created:', admin.email);
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  }
};
