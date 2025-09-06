const { processNoticeWithGemini } = require('./utils/geminiProcessor');

// Test the Gemini integration
async function testGeminiIntegration() {
  console.log('Testing Gemini AI integration...');
  
  // Set a timeout for the test
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Test timeout after 30 seconds')), 30000);
  });
  
  try {
    // Test with text data only
    const testData = {
      textData: {
        title: 'Test Notice',
        content: 'This is a test notice for computer science students about an upcoming workshop.',
        category: 'Workshop',
        priority: 'Normal'
      },
      files: []
    };
    
    console.log('Sending request to Gemini...');
    
    const result = await Promise.race([
      processNoticeWithGemini(testData),
      timeout
    ]);
    
    console.log('✅ Gemini processing successful!');
    console.log('Result preview:');
    console.log('- Title:', result.title);
    console.log('- Category:', result.category);
    console.log('- Priority:', result.priority);
    console.log('- Target Roles:', result.targeting?.roles);
    console.log('- Target Departments:', result.targeting?.departments);
    
    return result;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('API_KEY')) {
      console.log('💡 Make sure the Gemini API key is valid');
    }
    
    return null;
  }
}

// Run the test
if (require.main === module) {
  testGeminiIntegration().then(() => {
    console.log('Test completed.');
    process.exit(0);
  });
}

module.exports = { testGeminiIntegration };
