// Example API calls for Gemini AI-enhanced notice creation

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';
let authToken = ''; // Set this to your admin JWT token

// Example 1: Text-only notice that gets enhanced by Gemini AI
async function createTextOnlyNotice() {
  console.log('📝 Creating text-only notice with AI enhancement...');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/notices`,
      {
        title: 'Workshop Announcement',
        content: 'Machine Learning workshop for computer science students this Friday',
        category: 'Workshop',
        priority: 'Normal',
        targeting: {
          departments: ['Computer Science and Engineering'],
          roles: ['student']
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Text-only notice created:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Example 2: Notice with image attachment
async function createNoticeWithImage() {
  console.log('🖼️ Creating notice with image attachment...');
  
  const form = new FormData();
  
  // Add text data
  form.append('title', 'Event Poster');
  form.append('content', 'Check out this event poster for more details');
  form.append('targeting[departments]', 'Computer Science and Engineering');
  form.append('targeting[roles]', 'student');
  form.append('targeting[roles]', 'teacher');
  
  // Add image file (replace with actual image path)
  const imagePath = path.join(__dirname, 'test-images', 'event-poster.jpg');
  if (fs.existsSync(imagePath)) {
    form.append('attachments', fs.createReadStream(imagePath));
  } else {
    console.log('⚠️ No test image found, creating text placeholder...');
    form.append('content', 'Event poster uploaded - AI will analyze the image content for better categorization and targeting');
  }
  
  try {
    const response = await axios.post(
      `${BASE_URL}/notices`,
      form,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          ...form.getHeaders()
        }
      }
    );

    console.log('✅ Notice with image created:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Example 3: Notice with PDF attachment
async function createNoticeWithPDF() {
  console.log('📄 Creating notice with PDF attachment...');
  
  const form = new FormData();
  
  form.append('title', 'Official Document');
  form.append('content', 'Please refer to the attached PDF for complete details');
  form.append('category', 'Administrative');
  form.append('priority', 'High');
  form.append('targeting[roles]', 'teacher');
  form.append('targeting[roles]', 'admin');
  
  // Add PDF file (replace with actual PDF path)
  const pdfPath = path.join(__dirname, 'test-documents', 'policy.pdf');
  if (fs.existsSync(pdfPath)) {
    form.append('attachments', fs.createReadStream(pdfPath));
  } else {
    console.log('⚠️ No test PDF found, creating text placeholder...');
    form.append('content', 'Important policy document attached - please review carefully');
  }
  
  try {
    const response = await axios.post(
      `${BASE_URL}/notices`,
      form,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          ...form.getHeaders()
        }
      }
    );

    console.log('✅ Notice with PDF created:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Example 4: Minimal notice that relies heavily on AI enhancement
async function createMinimalNoticeForAI() {
  console.log('🤖 Creating minimal notice for maximum AI enhancement...');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/notices`,
      {
        content: 'Blood donation camp next week for O+ and AB+ volunteers at main auditorium',
        targeting: {
          roles: ['student', 'teacher'],
          volunteersOnly: true
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ AI-enhanced notice created:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Example 5: Multiple files with mixed content
async function createNoticeWithMultipleFiles() {
  console.log('📁 Creating notice with multiple attachments...');
  
  const form = new FormData();
  
  form.append('title', 'Conference Materials');
  form.append('content', 'Conference announcement with agenda and poster');
  form.append('targeting[departments]', 'Computer Science and Engineering');
  form.append('targeting[departments]', 'Statistics');
  form.append('targeting[roles]', 'teacher');
  
  // Add multiple files if they exist
  const files = [
    'conference-poster.jpg',
    'agenda.pdf',
    'registration-form.jpg'
  ];
  
  files.forEach(filename => {
    const filePath = path.join(__dirname, 'test-files', filename);
    if (fs.existsSync(filePath)) {
      form.append('attachments', fs.createReadStream(filePath));
    }
  });
  
  try {
    const response = await axios.post(
      `${BASE_URL}/notices`,
      form,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          ...form.getHeaders()
        }
      }
    );

    console.log('✅ Notice with multiple files created:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Helper function to authenticate
async function authenticate() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@campusmate.ai', // Replace with your admin credentials
      password: 'admin123456'
    });
    
    authToken = response.data.token;
    console.log('✅ Authenticated successfully');
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    return false;
  }
}

// Run all examples
async function runExamples() {
  console.log('🚀 Starting Gemini AI Notice Creation Examples...\n');
  
  // First authenticate
  const authenticated = await authenticate();
  if (!authenticated) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  console.log('\n' + '='.repeat(50));
  
  // Run examples with delays between them
  await createTextOnlyNotice();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('\n' + '='.repeat(50));
  
  await createNoticeWithImage();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('\n' + '='.repeat(50));
  
  await createNoticeWithPDF();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('\n' + '='.repeat(50));
  
  await createMinimalNoticeForAI();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('\n' + '='.repeat(50));
  
  await createNoticeWithMultipleFiles();
  
  console.log('\n🎉 All examples completed!');
}

// Export functions for individual testing
module.exports = {
  createTextOnlyNotice,
  createNoticeWithImage,
  createNoticeWithPDF,
  createMinimalNoticeForAI,
  createNoticeWithMultipleFiles,
  authenticate,
  runExamples
};

// Run examples if called directly
if (require.main === module) {
  runExamples();
}
