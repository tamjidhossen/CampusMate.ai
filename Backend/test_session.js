// Quick test to verify session validation
const mongoose = require('mongoose');
const User = require('./models/User');

// Test student without session (should fail)
async function testSessionValidation() {
  try {
    const studentWithoutSession = new User({
      name: 'John Student',
      email: 'john.student@example.com',
      password: 'Password123',
      phone: '+1-234-567-8900',
      department: 'Computer Science and Engineering',
      residence: '123 Campus Drive',
      bloodGroup: 'O+',
      role: 'student'
      // Missing session - should fail
    });
    
    const validation = studentWithoutSession.validateSync();
    if (validation && validation.errors && validation.errors.session) {
      console.log('✅ Session validation working: Student requires session');
      console.log('Error:', validation.errors.session.message);
    } else {
      console.log('❌ Session validation NOT working: Student should require session');
    }
  } catch (error) {
    console.log('✅ Session validation working via exception:', error.message);
  }

  // Test teacher without session (should pass)
  try {
    const teacherWithoutSession = new User({
      name: 'Jane Teacher',
      email: 'jane.teacher@example.com',
      password: 'Password123',
      phone: '+1-234-567-8900',
      department: 'Computer Science and Engineering',
      residence: '123 Campus Drive',
      bloodGroup: 'A+',
      role: 'teacher'
      // No session - should be fine
    });
    
    const validation = teacherWithoutSession.validateSync();
    if (!validation || !validation.errors || !validation.errors.session) {
      console.log('✅ Teacher validation working: Teacher does not require session');
    } else {
      console.log('❌ Teacher validation NOT working: Teacher should not require session');
    }
  } catch (error) {
    console.log('❌ Teacher validation error:', error.message);
  }

  // Test student with valid session (should pass)
  try {
    const studentWithSession = new User({
      name: 'Bob Student',
      email: 'bob.student@example.com',
      password: 'Password123',
      phone: '+1-234-567-8900',
      department: 'Computer Science and Engineering',
      residence: '123 Campus Drive',
      bloodGroup: 'B+',
      role: 'student',
      session: '2024-25'
    });
    
    const validation = studentWithSession.validateSync();
    if (!validation || !validation.errors) {
      console.log('✅ Student with session validation working: Valid session accepted');
    } else {
      console.log('❌ Student with session validation NOT working:', validation.errors);
    }
  } catch (error) {
    console.log('❌ Student with session error:', error.message);
  }

  // Test student with invalid session (should fail)
  try {
    const studentWithInvalidSession = new User({
      name: 'Alice Student',
      email: 'alice.student@example.com',
      password: 'Password123',
      phone: '+1-234-567-8900',
      department: 'Computer Science and Engineering',
      residence: '123 Campus Drive',
      bloodGroup: 'AB+',
      role: 'student',
      session: '2030-31' // Invalid session
    });
    
    const validation = studentWithInvalidSession.validateSync();
    if (validation && validation.errors && validation.errors.session) {
      console.log('✅ Invalid session validation working: Invalid session rejected');
      console.log('Error:', validation.errors.session.message);
    } else {
      console.log('❌ Invalid session validation NOT working: Should reject invalid session');
    }
  } catch (error) {
    console.log('✅ Invalid session validation working via exception:', error.message);
  }
}

testSessionValidation();
