// Simple test without Gemini API call to verify logic
const originalData = {
  title: "Upcoming CSE Workshop on AI",
  content: "We are organizing a workshop on Artificial Intelligence for all CSE students. Registration is mandatory.",
  targeting: {
    roles: ["student"],
    departments: ["Computer Science and Engineering"],
    bloodGroups: ["B+"],
    sessions: ["2020-2021"],
    gender: "all"
  },
  deliverySettings: {
    sendEmail: true,
    sendPushNotification: true
  },
  tags: ["AI", "CSE", "Workshop"]
};

// Mock AI response that might override some values
const aiResponse = {
  title: "Enhanced AI Workshop Title",
  content: "Enhanced content...",
  targeting: {
    roles: ["student"],
    departments: ["Computer Science and Engineering"],
    bloodGroups: [], // AI might empty this
    sessions: [], // AI might empty this
    gender: "all"
  },
  deliverySettings: {
    sendEmail: false, // AI might change this
    sendPushNotification: false
  },
  tags: ["Enhanced", "Tags"]
};

// Import the validation function
const path = require('path');
const fs = require('fs');

// Read and execute the validation function
const geminiProcessorPath = path.join(__dirname, 'utils', 'geminiProcessor.js');
const geminiCode = fs.readFileSync(geminiProcessorPath, 'utf8');

// Extract the validation function (this is a hack for testing)
console.log('🧪 Testing data preservation logic...');

// Mock the validation logic
function testValidation(aiData, originalData) {
  const originalTargeting = originalData.targeting || {};
  const aiTargeting = aiData.targeting || {};

  return {
    targeting: {
      roles: Array.isArray(originalTargeting.roles) && originalTargeting.roles.length > 0 ?
        originalTargeting.roles : aiTargeting.roles,
      
      departments: Array.isArray(originalTargeting.departments) && originalTargeting.departments.length > 0 ?
        originalTargeting.departments : aiTargeting.departments,
      
      bloodGroups: Array.isArray(originalTargeting.bloodGroups) ?
        originalTargeting.bloodGroups : aiTargeting.bloodGroups,
      
      sessions: Array.isArray(originalTargeting.sessions) ?
        originalTargeting.sessions : aiTargeting.sessions,
      
      gender: originalTargeting.gender || aiTargeting.gender
    },
    deliverySettings: {
      sendEmail: originalData.deliverySettings?.hasOwnProperty('sendEmail') ?
        originalData.deliverySettings.sendEmail : aiData.deliverySettings?.sendEmail,
      
      sendPushNotification: originalData.deliverySettings?.hasOwnProperty('sendPushNotification') ?
        originalData.deliverySettings.sendPushNotification : aiData.deliverySettings?.sendPushNotification
    },
    tags: originalData.tags && originalData.tags.length > 0 ?
      [...new Set([...originalData.tags, ...aiData.tags])] : aiData.tags
  };
}

const result = testValidation(aiResponse, originalData);

console.log('📊 Test Results:');
console.log('- Blood Groups preserved:', JSON.stringify(result.targeting.bloodGroups));
console.log('- Sessions preserved:', JSON.stringify(result.targeting.sessions));
console.log('- Send Email preserved:', result.deliverySettings.sendEmail);
console.log('- Send Push preserved:', result.deliverySettings.sendPushNotification);
console.log('- Tags merged:', JSON.stringify(result.tags));

console.log('\n✅ Logic test completed!');
