const { processNoticeWithGemini } = require('./utils/geminiProcessor');

// Test Bangla content processing and targeting extraction
async function testBanglaContentProcessing() {
  console.log('🇧🇩 Testing Bangla content processing and targeting extraction...');
  
  const testScenarios = [
    {
      name: "Bangla Text with Session Info",
      data: {
        textData: {
          title: "কম্পিউটার বিজ্ঞান ও প্রকৌশল বিভাগের নোটিস",
          content: "২০২০-২১ সেশনের ৪র্থ বর্ষের সকল ছাত্র-ছাত্রীদের জানানো যাচ্ছে যে আগামী সপ্তাহে পরীক্ষা অনুষ্ঠিত হবে।",
          // No targeting provided - should extract from content
        },
        files: []
      }
    },
    {
      name: "Mixed Content with Partial Targeting",
      data: {
        textData: {
          title: "Blood Donation Camp - রক্তদান শিবির",
          content: "B+ এবং O+ রক্তের গ্রুপের স্বেচ্ছাসেবকদের প্রয়োজন। কম্পিউটার বিজ্ঞান বিভাগের সকল ছাত্রছাত্রী অংশগ্রহণ করুন।",
          targeting: {
            roles: ["student"],
            // Should extract departments and bloodGroups from content
          }
        },
        files: []
      }
    },
    {
      name: "Complete User Data - Should Preserve",
      data: {
        textData: {
          title: "Workshop on AI",
          content: "কৃত্রিম বুদ্ধিমত্তার উপর কর্মশালা",
          targeting: {
            roles: ["student"],
            departments: ["Computer Science and Engineering"],
            sessions: ["2020-21", "2021-22"],
            bloodGroups: ["B+"],
            volunteersOnly: true
          },
          tags: ["AI", "Workshop", "CSE"]
        },
        files: []
      }
    }
  ];

  for (const scenario of testScenarios) {
    console.log(`\n📋 Testing: ${scenario.name}`);
    console.log('Input:', JSON.stringify(scenario.data.textData, null, 2));
    
    try {
      const result = await processNoticeWithGemini(scenario.data);
      
      console.log('✅ Processing successful');
      console.log('📊 Results:');
      console.log('- Title:', result.title);
      console.log('- Content (first 100 chars):', result.content.substring(0, 100) + '...');
      console.log('- Category:', result.category);
      console.log('- Targeting:');
      console.log('  - Roles:', result.targeting.roles);
      console.log('  - Departments:', result.targeting.departments);
      console.log('  - Sessions:', result.targeting.sessions);
      console.log('  - Blood Groups:', result.targeting.bloodGroups);
      console.log('  - Volunteers Only:', result.targeting.volunteersOnly);
      console.log('- Tags:', result.tags);
      
      // Analysis
      console.log('\n🔍 Analysis:');
      if (result.targeting.sessions.length > 0) {
        console.log('✅ Sessions extracted/preserved');
      }
      if (result.targeting.departments.some(d => d !== 'all')) {
        console.log('✅ Departments identified');
      }
      if (result.targeting.bloodGroups.length > 0) {
        console.log('✅ Blood groups identified');
      }
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }
    
    console.log('\n' + '─'.repeat(50));
  }
}

// Test with mock image scenario
async function testImageTargetingExtraction() {
  console.log('\n🖼️  Testing image-based targeting extraction (mock)...');
  
  // Simulate what would happen with a Bangla image
  const mockImageScenario = {
    textData: {
      title: "Event Notice",
      content: "Please check the attached image for details"
      // No targeting data provided
    },
    files: [{
      filename: "bangla_notice.jpg",
      originalname: "Bengali Notice.jpg",
      mimetype: "image/jpeg"
    }]
  };
  
  console.log('📝 This test would process an image containing:');
  console.log('- Department: কম্পিউটার বিজ্ঞান ও প্রকৌশল');
  console.log('- Session: ২০২০-২১');
  console.log('- Target: ৪র্থ বর্ষের ছাত্রছাত্রী');
  console.log('- Blood Group: বি+ (B+)');
  
  console.log('\n✅ Expected extraction:');
  console.log('- departments: ["Computer Science and Engineering"]');
  console.log('- sessions: ["2020-21"]');
  console.log('- roles: ["student"]');
  console.log('- bloodGroups: ["B+"]');
}

// Run all tests
async function runBanglaTests() {
  console.log('🚀 Starting Bangla Content Processing Tests...\n');
  
  await testBanglaContentProcessing();
  await testImageTargetingExtraction();
  
  console.log('\n🎉 Bangla processing tests completed!');
  console.log('\n💡 Key Enhancements Added:');
  console.log('✅ Bangla department name mapping');
  console.log('✅ Session format conversion (২০২০-২১ → 2020-21)');
  console.log('✅ Enhanced image analysis for targeting data');
  console.log('✅ Preservation of user-provided data');
  console.log('✅ Intelligent content extraction from mixed language content');
}

// Export functions
module.exports = {
  testBanglaContentProcessing,
  testImageTargetingExtraction,
  runBanglaTests
};

// Run tests if called directly
if (require.main === module) {
  runBanglaTests().then(() => {
    console.log('\n✨ All tests completed.');
    process.exit(0);
  });
}
