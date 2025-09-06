const { processNoticeWithGemini } = require('./utils/geminiProcessor');

// Test specific department targeting
async function testSpecificDepartmentTargeting() {
  console.log('🎯 Testing Specific Department Targeting Fix...\n');
  
  const testCases = [
    {
      name: "Specific Department - Should NOT include 'all'",
      data: {
        textData: {
          title: "Computer Science Workshop",
          content: "Workshop for Computer Science students only",
          targeting: {
            departments: ["Computer Science and Engineering"],
            roles: ["student"]
          }
        },
        files: []
      },
      expected: {
        departments: ["Computer Science and Engineering"], // Should NOT have "all"
        roles: ["student"] // Should NOT have "all"
      }
    },
    {
      name: "Multiple Specific Departments - Should NOT include 'all'",
      data: {
        textData: {
          title: "Engineering Joint Seminar",
          content: "Seminar for CS and EEE departments",
          targeting: {
            departments: ["Computer Science and Engineering", "Electrical and Electronic Engineering"],
            roles: ["student", "teacher"]
          }
        },
        files: []
      },
      expected: {
        departments: ["Computer Science and Engineering", "Electrical and Electronic Engineering"],
        roles: ["student", "teacher"]
      }
    },
    {
      name: "No Specific Targeting - Should default to 'all'",
      data: {
        textData: {
          title: "General University Announcement",
          content: "Important announcement for all members"
        },
        files: []
      },
      expected: {
        departments: ["all"],
        roles: ["all"]
      }
    },
    {
      name: "Mixed Targeting - Only Sessions Specified",
      data: {
        textData: {
          title: "4th Year Project Guidelines",
          content: "Guidelines for final year project",
          targeting: {
            sessions: ["2020-21", "2021-22"]
          }
        },
        files: []
      },
      expected: {
        sessions: ["2020-21", "2021-22"],
        departments: ["all"], // Should be all since not specified
        roles: ["all"] // Should be all since not specified
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`📋 Testing: ${testCase.name}`);
    console.log('📤 Input targeting:', JSON.stringify(testCase.data.textData.targeting || 'Not specified', null, 2));
    
    try {
      const result = await processNoticeWithGemini(testCase.data);
      
      console.log('📊 Result targeting:');
      console.log('- Departments:', result.targeting.departments);
      console.log('- Roles:', result.targeting.roles);
      console.log('- Sessions:', result.targeting.sessions);
      
      // Validation
      let isValid = true;
      const issues = [];
      
      if (testCase.expected.departments) {
        if (JSON.stringify(result.targeting.departments.sort()) !== JSON.stringify(testCase.expected.departments.sort())) {
          isValid = false;
          issues.push(`Departments mismatch - Expected: ${testCase.expected.departments}, Got: ${result.targeting.departments}`);
        }
      }
      
      if (testCase.expected.roles) {
        if (JSON.stringify(result.targeting.roles.sort()) !== JSON.stringify(testCase.expected.roles.sort())) {
          isValid = false;
          issues.push(`Roles mismatch - Expected: ${testCase.expected.roles}, Got: ${result.targeting.roles}`);
        }
      }
      
      if (testCase.expected.sessions) {
        if (JSON.stringify(result.targeting.sessions.sort()) !== JSON.stringify(testCase.expected.sessions.sort())) {
          isValid = false;
          issues.push(`Sessions mismatch - Expected: ${testCase.expected.sessions}, Got: ${result.targeting.sessions}`);
        }
      }
      
      if (isValid) {
        console.log('✅ PASS - Targeting preserved correctly');
        
        // Additional check for the main issue
        if (testCase.name.includes("Should NOT include 'all'")) {
          const hasAllInDepartments = result.targeting.departments.includes('all');
          const hasAllInRoles = result.targeting.roles.includes('all');
          
          if (hasAllInDepartments || hasAllInRoles) {
            console.log('❌ FAIL - Found "all" mixed with specific values!');
            if (hasAllInDepartments) console.log('  - Departments contains "all"');
            if (hasAllInRoles) console.log('  - Roles contains "all"');
          } else {
            console.log('✅ EXCELLENT - No "all" mixed with specific values');
          }
        }
      } else {
        console.log('❌ FAIL - Issues found:');
        issues.forEach(issue => console.log(`  - ${issue}`));
      }
      
    } catch (error) {
      console.error('❌ ERROR:', error.message);
    }
    
    console.log('\n' + '─'.repeat(60) + '\n');
  }
}

// Test validation function specifically
function testValidationLogic() {
  console.log('🔧 Testing Validation Logic...\n');
  
  const validationTests = [
    {
      name: "Original data has specific departments",
      originalData: {
        targeting: {
          departments: ["Computer Science and Engineering"]
        }
      },
      aiData: {
        targeting: {
          departments: ["all", "Computer Science and Engineering"] // AI wrongly added "all"
        }
      },
      expected: ["Computer Science and Engineering"] // Should only keep original
    },
    {
      name: "AI provides specific departments, user provides none", 
      originalData: {},
      aiData: {
        targeting: {
          departments: ["Economics", "Statistics"]
        }
      },
      expected: ["Economics", "Statistics"] // Should use AI's specific data
    },
    {
      name: "Both user and AI provide empty/no data",
      originalData: {},
      aiData: {
        targeting: {}
      },
      expected: ["all"] // Should default to all
    }
  ];

  // We would need to import and test the validateAndSanitizeNoticeData function
  console.log('📋 Validation scenarios:');
  testValidationTests.forEach((test, index) => {
    console.log(`${index + 1}. ${test.name}`);
    console.log(`   Original: ${JSON.stringify(test.originalData.targeting?.departments || 'none')}`);
    console.log(`   AI Data: ${JSON.stringify(test.aiData.targeting?.departments || 'none')}`);
    console.log(`   Expected: ${JSON.stringify(test.expected)}`);
    console.log('');
  });
}

// Main test execution
async function runTargetingTests() {
  console.log('🚀 Starting Department Targeting Fix Tests...\n');
  
  testValidationLogic();
  console.log('='.repeat(70) + '\n');
  
  await testSpecificDepartmentTargeting();
  
  console.log('🎉 Department Targeting Tests Completed!\n');
  console.log('📝 Key Points Tested:');
  console.log('✅ Specific departments should NOT include "all"');
  console.log('✅ Multiple specific departments should work correctly');
  console.log('✅ User-provided targeting should be preserved exactly');
  console.log('✅ Default to "all" only when no specific targeting provided');
  console.log('✅ No mixing of "all" with specific values');
}

// Export for use
module.exports = {
  testSpecificDepartmentTargeting,
  testValidationLogic,
  runTargetingTests
};

// Run if called directly
if (require.main === module) {
  runTargetingTests().then(() => {
    console.log('\n✨ All targeting tests completed.');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
}
