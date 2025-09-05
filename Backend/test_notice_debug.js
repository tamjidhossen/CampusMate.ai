/**
 * Debug script to test Notice finding functionality
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const Notice = require('./models/Notice');
const User = require('./models/User');

async function testNoticeFind() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to database');
    
    // Get all notices
    const allNotices = await Notice.find({});
    console.log(`📋 Total notices in database: ${allNotices.length}`);
    
    if (allNotices.length > 0) {
      console.log('\n📝 Sample notices:');
      allNotices.slice(0, 3).forEach((notice, index) => {
        console.log(`${index + 1}. ID: ${notice._id} | Title: ${notice.title} | Status: ${notice.status}`);
      });
      
      // Test finding a specific notice
      const firstNotice = allNotices[0];
      console.log(`\n🔍 Testing findById with: ${firstNotice._id}`);
      
      const foundNotice = await Notice.findById(firstNotice._id);
      console.log(`Found notice: ${foundNotice ? 'Yes ✅' : 'No ❌'}`);
      
      if (foundNotice) {
        console.log(`Notice title: ${foundNotice.title}`);
        console.log(`Notice status: ${foundNotice.status}`);
        console.log(`Notice readBy count: ${foundNotice.readBy.length}`);
      }
      
      // Test ObjectId validation
      const testId = firstNotice._id.toString();
      console.log(`\n🧪 Testing ObjectId validation for: ${testId}`);
      console.log(`Is valid ObjectId: ${mongoose.Types.ObjectId.isValid(testId)}`);
      
      // Test conversion
      const objectId = new mongoose.Types.ObjectId(testId);
      console.log(`Converted ObjectId: ${objectId}`);
      console.log(`Are they equal: ${objectId.toString() === testId}`);
      
    } else {
      console.log('❌ No notices found in database');
      
      // Create a test notice
      console.log('\n🔨 Creating a test notice...');
      
      // Find an admin user first
      const adminUser = await User.findOne({ role: 'admin' });
      if (!adminUser) {
        console.log('❌ No admin user found to create notice');
        return;
      }
      
      const testNotice = new Notice({
        title: 'Test Notice for Debugging',
        content: 'This is a test notice created for debugging the markNoticeAsRead function.',
        category: 'General',
        priority: 'Normal',
        type: 'Notice',
        author: adminUser._id,
        targeting: {
          roles: ['student', 'teacher'],
          departments: ['Computer Science and Engineering']
        },
        status: 'Published'
      });
      
      await testNotice.save();
      console.log(`✅ Test notice created with ID: ${testNotice._id}`);
      
      // Verify it can be found
      const verifyNotice = await Notice.findById(testNotice._id);
      console.log(`✅ Test notice can be found: ${verifyNotice ? 'Yes' : 'No'}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

testNoticeFind();
