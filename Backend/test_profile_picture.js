// Quick test to verify profile picture validation
const mongoose = require('mongoose');
const User = require('./models/User');

// Test profile picture validation
async function testProfilePictureValidation() {
  console.log('Testing Profile Picture Validation...\n');

  // Test 1: Valid profile picture URL
  try {
    const userWithValidPicture = new User({
      name: 'John Student',
      email: 'john.test@example.com',
      password: 'Password123',
      phone: '+1-234-567-8900',
      department: 'Computer Science and Engineering',
      residence: '123 Campus Drive',
      bloodGroup: 'O+',
      role: 'student',
      session: '2024-25',
      profilePicture: '/uploads/profile-pictures/test-image.jpg'
    });
    
    const validation = userWithValidPicture.validateSync();
    if (!validation || !validation.errors) {
      console.log('✅ Valid profile picture URL accepted');
    } else {
      console.log('❌ Valid profile picture URL rejected:', validation.errors.profilePicture?.message);
    }
  } catch (error) {
    console.log('❌ Valid profile picture URL error:', error.message);
  }

  // Test 2: Null profile picture (should be allowed)
  try {
    const userWithNullPicture = new User({
      name: 'Jane Student',
      email: 'jane.test@example.com',
      password: 'Password123',
      phone: '+1-234-567-8900',
      department: 'Computer Science and Engineering',
      residence: '123 Campus Drive',
      bloodGroup: 'A+',
      role: 'student',
      session: '2024-25',
      profilePicture: null
    });
    
    const validation = userWithNullPicture.validateSync();
    if (!validation || !validation.errors) {
      console.log('✅ Null profile picture accepted');
    } else {
      console.log('❌ Null profile picture rejected:', validation.errors.profilePicture?.message);
    }
  } catch (error) {
    console.log('❌ Null profile picture error:', error.message);
  }

  // Test 3: Invalid profile picture URL (should fail)
  try {
    const userWithInvalidPicture = new User({
      name: 'Bob Student',
      email: 'bob.test@example.com',
      password: 'Password123',
      phone: '+1-234-567-8900',
      department: 'Computer Science and Engineering',
      residence: '123 Campus Drive',
      bloodGroup: 'B+',
      role: 'student',
      session: '2024-25',
      profilePicture: 'invalid-url'
    });
    
    const validation = userWithInvalidPicture.validateSync();
    if (validation && validation.errors && validation.errors.profilePicture) {
      console.log('✅ Invalid profile picture URL rejected');
      console.log('   Error:', validation.errors.profilePicture.message);
    } else {
      console.log('❌ Invalid profile picture URL should be rejected');
    }
  } catch (error) {
    console.log('✅ Invalid profile picture URL rejected via exception:', error.message);
  }

  // Test 4: HTTPS URL (should be valid)
  try {
    const userWithHttpsPicture = new User({
      name: 'Alice Student',
      email: 'alice.test@example.com',
      password: 'Password123',
      phone: '+1-234-567-8900',
      department: 'Computer Science and Engineering',
      residence: '123 Campus Drive',
      bloodGroup: 'AB+',
      role: 'student',
      session: '2024-25',
      profilePicture: 'https://example.com/image.jpg'
    });
    
    const validation = userWithHttpsPicture.validateSync();
    if (!validation || !validation.errors) {
      console.log('✅ HTTPS profile picture URL accepted');
    } else {
      console.log('❌ HTTPS profile picture URL rejected:', validation.errors.profilePicture?.message);
    }
  } catch (error) {
    console.log('❌ HTTPS profile picture URL error:', error.message);
  }

  console.log('\n✅ Profile picture validation tests completed!');
}

testProfilePictureValidation();
