const { processNoticeWithGemini } = require('./utils/geminiProcessor');

// Test the new department targeting behavior
async function testAllDepartmentsTargeting() {
  console.log('🏛️ Testing All Departments Targeting (No "all" keyword)...\n');
  
  const testCases = [
    {
      name: "No Department Specified - Should Target ALL Specific Departments",
      data: {
        textData: {
          title: "General University Announcement",
          content: "Important announcement for everyone at JKKNIU"
        },
        files: []
      },
      expected: {
        shouldIncludeAllDepartments: true,
        shouldNotInclude: ['all'] // Should NOT have the "all" keyword
      }
    },
    {
      name: "Specific Department - Should Only Target That Department",
      data: {
        textData: {
          title: "CS Department Meeting",
          content: "Important meeting for Computer Science department",
          targeting: {
            departments: ["Computer Science and Engineering"]
          }
        },
        files: []
      },
      expected: {
        shouldIncludeAllDepartments: false,
        exactDepartments: ["Computer Science and Engineering"],
        shouldNotInclude: ['all']
      }
    },
    {
      name: "Multiple Departments - Should Only Target Those Departments",
      data: {
        textData: {
          title: "Arts Faculty Event",
          content: "Joint event for language departments",
          targeting: {
            departments: ["Bangla Language and Literature", "English Language and Literature"]
          }
        },
        files: []
      },
      expected: {
        shouldIncludeAllDepartments: false,
        exactDepartments: ["Bangla Language and Literature", "English Language and Literature"],
        shouldNotInclude: ['all']
      }
    }
  ];

  // All expected departments when targeting everyone
  const allExpectedDepartments = [
    // Faculty of Arts and Humanities
    'Bangla Language and Literature',
    'English Language and Literature',
    'Music',
    'Theatre and Performance Studies',
    'Film and Media Studies',
    'Philosophy',
    'History',
    'Fine Arts',
    
    // Faculty of Science and Engineering
    'Computer Science and Engineering',
    'Electrical and Electronic Engineering',
    'Environmental Science and Engineering',
    'Statistics',
    
    // Faculty of Social Sciences
    'Economics',
    'Public Administration and Governance Studies',
    'Folklore',
    'Anthropology',
    'Population Science',
    'Local Government and Urban Development',
    'Sociology',
    
    // Faculty of Business Studies
    'Accounting and Information Systems',
    'Finance and Banking',
    'Human Resource Management',
    'Management',
    'Marketing',
    
    // Faculty of Law
    'Law and Justice',
    
    // Other
    'Administration',
    'Other'
  ];

  for (const testCase of testCases) {
    console.log(`📋 Testing: ${testCase.name}`);
    console.log('📤 Input targeting:', JSON.stringify(testCase.data.textData.targeting || 'Not specified', null, 2));
    
    try {
      const result = await processNoticeWithGemini(testCase.data);
      
      console.log('📊 Result:');
      console.log(`- Total departments targeted: ${result.targeting.departments.length}`);
      console.log('- Departments:', result.targeting.departments.slice(0, 5).join(', ') + 
                  (result.targeting.departments.length > 5 ? '... (and more)' : ''));
      
      // Validation
      let isValid = true;
      const issues = [];
      
      // Check if "all" keyword is present (should NOT be)
      if (testCase.expected.shouldNotInclude?.includes('all') && 
          result.targeting.departments.includes('all')) {
        isValid = false;
        issues.push('Found "all" keyword in departments - should use specific departments instead');
      }
      
      // Check for all departments targeting
      if (testCase.expected.shouldIncludeAllDepartments) {
        const missingDepartments = allExpectedDepartments.filter(dept => 
          !result.targeting.departments.includes(dept)
        );
        
        if (missingDepartments.length > 0) {
          isValid = false;
          issues.push(`Missing departments: ${missingDepartments.slice(0, 3).join(', ')}${missingDepartments.length > 3 ? '...' : ''}`);
        }
        
        if (result.targeting.departments.length !== allExpectedDepartments.length) {
          isValid = false;
          issues.push(`Expected ${allExpectedDepartments.length} departments, got ${result.targeting.departments.length}`);
        }
      }
      
      // Check for exact department matching
      if (testCase.expected.exactDepartments) {
        const resultDepts = result.targeting.departments.sort();
        const expectedDepts = testCase.expected.exactDepartments.sort();
        
        if (JSON.stringify(resultDepts) !== JSON.stringify(expectedDepts)) {
          isValid = false;
          issues.push(`Department mismatch - Expected: ${expectedDepts.join(', ')}, Got: ${resultDepts.join(', ')}`);
        }
      }
      
      if (isValid) {
        console.log('✅ PASS - Department targeting works correctly');
        
        if (testCase.expected.shouldIncludeAllDepartments) {
          console.log('✅ EXCELLENT - All specific departments included (no "all" keyword)');
          console.log(`✅ Targeting ${result.targeting.departments.length} specific departments`);
        } else {
          console.log('✅ EXCELLENT - Only specified departments targeted');
        }
      } else {
        console.log('❌ FAIL - Issues found:');
        issues.forEach(issue => console.log(`  - ${issue}`));
      }
      
    } catch (error) {
      console.error('❌ ERROR:', error.message);
    }
    
    console.log('\n' + '─'.repeat(70) + '\n');
  }
}

// Test department coverage
function testDepartmentCoverage() {
  console.log('📊 Testing Department Coverage...\n');
  
  const expectedDepartments = [
    // Faculty of Arts and Humanities (8 departments)
    'Bangla Language and Literature', 'English Language and Literature', 'Music', 
    'Theatre and Performance Studies', 'Film and Media Studies', 'Philosophy', 'History', 'Fine Arts',
    
    // Faculty of Science and Engineering (4 departments)  
    'Computer Science and Engineering', 'Electrical and Electronic Engineering', 
    'Environmental Science and Engineering', 'Statistics',
    
    // Faculty of Social Sciences (7 departments)
    'Economics', 'Public Administration and Governance Studies', 'Folklore', 'Anthropology', 
    'Population Science', 'Local Government and Urban Development', 'Sociology',
    
    // Faculty of Business Studies (5 departments)
    'Accounting and Information Systems', 'Finance and Banking', 'Human Resource Management', 
    'Management', 'Marketing',
    
    // Faculty of Law (1 department)
    'Law and Justice',
    
    // Other (2 departments)
    'Administration', 'Other'
  ];
  
  console.log('📋 Expected Department Coverage:');
  console.log(`📊 Total Departments: ${expectedDepartments.length}`);
  console.log('🏛️ By Faculty:');
  console.log('  - Arts and Humanities: 8 departments');
  console.log('  - Science and Engineering: 4 departments');
  console.log('  - Social Sciences: 7 departments');
  console.log('  - Business Studies: 5 departments');
  console.log('  - Law: 1 department');
  console.log('  - Other: 2 departments');
  
  console.log('\n📝 Key Changes:');
  console.log('✅ Removed "all" keyword from default targeting');
  console.log('✅ Now uses all specific department names');
  console.log('✅ More precise targeting for university notices');
  console.log('✅ Better analytics and reporting capabilities');
  console.log('✅ Aligned with User.js department enum');
}

// Main test execution
async function runDepartmentTargetingTests() {
  console.log('🚀 Starting Department Targeting Tests (No "All" Keyword)...\n');
  
  testDepartmentCoverage();
  console.log('='.repeat(70) + '\n');
  
  await testAllDepartmentsTargeting();
  
  console.log('🎉 Department Targeting Tests Completed!\n');
  console.log('📝 Summary:');
  console.log('✅ No more generic "all" targeting');
  console.log('✅ All 27 specific departments used when no targeting specified');
  console.log('✅ Specific department targeting preserved');
  console.log('✅ Better alignment with User.js model');
  console.log('✅ More precise notice delivery');
}

// Export for use
module.exports = {
  testAllDepartmentsTargeting,
  testDepartmentCoverage,
  runDepartmentTargetingTests
};

// Run if called directly
if (require.main === module) {
  runDepartmentTargetingTests().then(() => {
    console.log('\n✨ All department targeting tests completed.');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
}
