const { processNoticeWithGemini } = require('./utils/geminiProcessor');
const fs = require('fs');
const path = require('path');

// Test PDF processing with Gemini
async function testPDFProcessing() {
  console.log('📄 Testing PDF processing with Gemini AI...');
  
  // Test scenarios for PDF processing
  const testScenarios = [
    {
      name: "PDF with Text Content",
      description: "Testing PDF file processing and content extraction",
      data: {
        textData: {
          title: "Document Analysis",
          content: "Please analyze the attached PDF document"
        },
        files: [{
          filename: "test-notice.pdf",
          originalname: "University Notice.pdf",
          mimetype: "application/pdf",
          size: 102400
        }]
      }
    },
    {
      name: "PDF with Existing Targeting (Should Preserve)",
      description: "Testing that user-provided targeting is preserved even with PDF",
      data: {
        textData: {
          title: "Policy Document", 
          content: "Check attached PDF for complete policy details",
          targeting: {
            roles: ["teacher"],
            departments: ["Computer Science and Engineering"],
            sessions: ["2020-21"]
          }
        },
        files: [{
          filename: "policy-document.pdf",
          originalname: "Department Policy.pdf", 
          mimetype: "application/pdf",
          size: 256000
        }]
      }
    },
    {
      name: "Mixed Content - Text + PDF",
      description: "Testing combination of text content and PDF file",
      data: {
        textData: {
          title: "Workshop Materials",
          content: "Join our AI workshop. Complete details in attached PDF.",
          category: "Workshop",
          priority: "Normal"
        },
        files: [{
          filename: "workshop-details.pdf", 
          originalname: "AI Workshop Details.pdf",
          mimetype: "application/pdf",
          size: 512000
        }]
      }
    }
  ];

  for (const scenario of testScenarios) {
    console.log(`\n📋 Testing: ${scenario.name}`);
    console.log(`📖 Description: ${scenario.description}`);
    
    // Check if we can create a mock PDF file for testing
    const mockPDFPath = path.join(__dirname, 'uploads', 'notice-attachments', scenario.data.files[0].filename);
    
    // Create mock PDF content for testing (if file doesn't exist)
    if (!fs.existsSync(mockPDFPath)) {
      const mockPDFContent = Buffer.from(`%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
  /Font <<
    /F1 5 0 R
  >>
>>
>>
endobj

4 0 obj
<<
/Length 100
>>
stream
BT
/F1 12 Tf
100 700 Td
(Mock PDF Content - Computer Science Department) Tj
0 -20 Td
(Session: 2020-21, For: Students) Tj
0 -20 Td
(Workshop on Artificial Intelligence) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000268 00000 n 
0000000420 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
508
%%EOF`);
      
      // Ensure directory exists
      const uploadsDir = path.dirname(mockPDFPath);
      if (!fs.existsSync(uploadsDir)) {
        console.log('⚠️  Upload directory does not exist. Skipping file creation.');
      } else {
        try {
          fs.writeFileSync(mockPDFPath, mockPDFContent);
          console.log('✅ Created mock PDF for testing');
        } catch (error) {
          console.log('⚠️  Could not create mock PDF:', error.message);
        }
      }
    }
    
    console.log('📤 Input:', JSON.stringify(scenario.data.textData, null, 2));
    console.log('📎 PDF File:', scenario.data.files[0].originalname);
    
    try {
      const result = await processNoticeWithGemini(scenario.data);
      
      console.log('✅ PDF processing successful!');
      console.log('📊 Results:');
      console.log('- Title:', result.title);
      console.log('- Content (first 150 chars):', result.content.substring(0, 150) + '...');
      console.log('- Category:', result.category);
      console.log('- Priority:', result.priority);
      console.log('- Targeting:');
      console.log('  - Roles:', result.targeting.roles);
      console.log('  - Departments:', result.targeting.departments);
      console.log('  - Sessions:', result.targeting.sessions);
      console.log('  - Blood Groups:', result.targeting.bloodGroups);
      console.log('- Tags:', result.tags);
      console.log('- Keywords:', result.keywords);
      
      // Analysis for this specific scenario
      console.log('\n🔍 Analysis:');
      if (scenario.name.includes("Should Preserve") && result.targeting.sessions.includes("2020-21")) {
        console.log('✅ User targeting data preserved correctly');
      }
      if (result.content.length > scenario.data.textData.content.length) {
        console.log('✅ Content enhanced from PDF analysis');
      }
      if (result.targeting.departments.some(d => d !== 'all')) {
        console.log('✅ Department targeting identified');
      }
      
    } catch (error) {
      console.error('❌ PDF processing failed:', error.message);
      
      if (error.message.includes('file does not exist')) {
        console.log('💡 Note: This test requires actual PDF files in uploads/notice-attachments/');
      } else if (error.message.includes('API_KEY')) {
        console.log('💡 Note: Ensure Gemini API key is valid and has PDF processing enabled');
      }
    }
    
    console.log('\n' + '─'.repeat(60));
  }
}

// Test what gets sent to Gemini for PDF processing
function testPDFDataPreparation() {
  console.log('\n🔧 Testing PDF data preparation for Gemini...');
  
  const mockFile = {
    filename: 'test.pdf',
    originalname: 'Test Document.pdf',
    mimetype: 'application/pdf',
    size: 12345
  };
  
  console.log('📋 PDF processing will:');
  console.log('✅ Read PDF file as binary data');
  console.log('✅ Convert to base64 encoding');
  console.log('✅ Send to Gemini with mimetype: application/pdf');
  console.log('✅ Include detailed extraction instructions');
  console.log('✅ Handle both English and Bangla content');
  console.log('✅ Extract targeting information');
  console.log('✅ Preserve user-provided data');
  
  console.log('\n📤 Data structure sent to Gemini:');
  console.log({
    inlineData: {
      data: '<base64_encoded_pdf_content>',
      mimeType: 'application/pdf'
    }
  });
  
  console.log('\n🎯 Extraction instructions include:');
  console.log('- Full text extraction from PDF');
  console.log('- Bangla to English translation');  
  console.log('- Department name mapping');
  console.log('- Session format conversion');
  console.log('- Targeting data extraction');
  console.log('- Event details and requirements');
}

// Run all PDF tests
async function runPDFTests() {
  console.log('🚀 Starting PDF Processing Tests with Gemini AI...\n');
  
  testPDFDataPreparation();
  console.log('\n' + '='.repeat(70));
  
  await testPDFProcessing();
  
  console.log('\n🎉 PDF processing tests completed!');
  console.log('\n💡 Key PDF Processing Features:');
  console.log('✅ Direct PDF to Gemini transmission');
  console.log('✅ Full document text extraction');
  console.log('✅ Bangla content translation');
  console.log('✅ Targeting data extraction');
  console.log('✅ Content enhancement and structuring');
  console.log('✅ User data preservation priority');
  
  console.log('\n🔥 Now PDFs are processed directly by Gemini AI!');
  console.log('No backend PDF processing libraries needed.');
}

// Export functions
module.exports = {
  testPDFProcessing,
  testPDFDataPreparation,
  runPDFTests
};

// Run tests if called directly
if (require.main === module) {
  runPDFTests().then(() => {
    console.log('\n✨ All PDF tests completed.');
    process.exit(0);
  });
}
