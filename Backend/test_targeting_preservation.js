const { processNoticeWithGemini } = require('./utils/geminiProcessor');

// Test with your specific data to verify sessions and bloodGroups are preserved
async function testTargetingPreservation() {
  console.log('🧪 Testing targeting data preservation...');
  
  const testData = {
    textData: {
      title: "Upcoming CSE Workshop on AI",
      content: "We are organizing a workshop on Artificial Intelligence for all CSE students. Registration is mandatory.",
      summary: "AI workshop for CSE students.",
      category: "Workshop",
      priority: "High",
      type: "Announcement",
      targeting: {
        roles: ["student"],
        departments: ["Computer Science and Engineering"],
        bloodGroups: ["B+"],
        residenceKeywords: [],
        volunteersOnly: false,
        sessions: ["2020-2021"],
        gender: "all",
        specificUsers: [],
        excludeUsers: []
      },
      deliverySettings: {
        publishAt: "2025-09-05T12:00:00Z",
        expiresAt: "2025-10-05T12:00:00Z",
        isImmediate: true,
        sendEmail: true,
        sendPushNotification: true
      },
      tags: ["AI", "CSE", "Workshop"],
      keywords: ["AI", "Artificial Intelligence", "Workshop"],
      externalLinks: [
        {
          title: "Workshop Registration",
          url: "https://campusmate.ai/workshop/register",
          description: "Click to register for the AI workshop."
        }
      ]
    },
    files: []
  };
  
  try {
    const result = await processNoticeWithGemini(testData);
    
    console.log('✅ Processing completed!');
    console.log('\n📊 Results:');
    console.log('- Title:', result.title);
    console.log('- Category:', result.category);
    console.log('- Priority:', result.priority);
    console.log('- Type:', result.type);
    
    console.log('\n🎯 Targeting Data:');
    console.log('- Roles:', result.targeting.roles);
    console.log('- Departments:', result.targeting.departments);
    console.log('- Blood Groups:', result.targeting.bloodGroups);
    console.log('- Sessions:', result.targeting.sessions);
    console.log('- Gender:', result.targeting.gender);
    console.log('- Volunteers Only:', result.targeting.volunteersOnly);
    
    console.log('\n📦 Delivery Settings:');
    console.log('- Publish At:', result.deliverySettings.publishAt);
    console.log('- Expires At:', result.deliverySettings.expiresAt);
    console.log('- Send Email:', result.deliverySettings.sendEmail);
    console.log('- Send Push:', result.deliverySettings.sendPushNotification);
    
    console.log('\n🏷️ Tags:', result.tags);
    console.log('🔍 Keywords:', result.keywords);
    console.log('🔗 External Links:', result.externalLinks);
    
    // Check if the critical data is preserved
    const critical = {
      sessions: result.targeting.sessions.includes("2020-2021"),
      bloodGroups: result.targeting.bloodGroups.includes("B+"),
      sendEmail: result.deliverySettings.sendEmail === true,
      externalLinks: result.externalLinks.length > 0
    };
    
    console.log('\n🔍 Preservation Check:');
    console.log('- Sessions preserved:', critical.sessions ? '✅' : '❌');
    console.log('- Blood Groups preserved:', critical.bloodGroups ? '✅' : '❌');
    console.log('- Email setting preserved:', critical.sendEmail ? '✅' : '❌');
    console.log('- External links preserved:', critical.externalLinks ? '✅' : '❌');
    
    const allPreserved = Object.values(critical).every(v => v);
    console.log('\n' + (allPreserved ? '🎉 All critical data preserved!' : '⚠️  Some data was not preserved'));
    
    return result;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return null;
  }
}

// Run the test
if (require.main === module) {
  testTargetingPreservation().then(() => {
    console.log('\n✨ Test completed.');
    process.exit(0);
  });
}

module.exports = { testTargetingPreservation };
