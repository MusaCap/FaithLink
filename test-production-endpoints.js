// Quick test script to verify production backend endpoints are working
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testProductionEndpoints() {
  console.log('🧪 Testing FaithLink360 Production Backend Endpoints...\n');

  const tests = [
    { name: 'Health Check', endpoint: '/health' },
    { name: 'Auth - User Info', endpoint: '/api/auth/me' },
    { name: 'Members List', endpoint: '/api/members?limit=5' },
    { name: 'Groups List', endpoint: '/api/groups?limit=3' },
    { name: 'Events List', endpoint: '/api/events?limit=3' },
    { name: 'Dashboard Stats', endpoint: '/api/dashboard/stats' },
    { name: 'Reports Dashboard', endpoint: '/api/reports/dashboard' },
    { name: 'Communications Campaigns', endpoint: '/api/communications/campaigns' },
    { name: 'Pastoral Care', endpoint: '/api/pastoral-care' },
    { name: 'Tasks', endpoint: '/api/tasks' },
    { name: 'Journeys', endpoint: '/api/journeys' }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      const response = await axios.get(`${BASE_URL}${test.endpoint}`, {
        timeout: 5000,
        headers: {
          'Authorization': 'Bearer mock-jwt-token-admin-user-admin'
        }
      });

      if (response.status === 200) {
        console.log(`✅ ${test.name}: SUCCESS (${response.status})`);
        
        // Show sample data for key endpoints
        if (test.endpoint === '/api/members?limit=5') {
          console.log(`   📊 Members found: ${response.data.members?.length || 0}`);
          if (response.data.members?.[0]) {
            console.log(`   👤 Sample: ${response.data.members[0].firstName} ${response.data.members[0].lastName}`);
          }
        }
        
        if (test.endpoint === '/api/reports/dashboard') {
          console.log(`   📊 Total Members: ${response.data.data?.totalMembers || 'N/A'}`);
          console.log(`   👥 Active Groups: ${response.data.data?.activeGroups || 'N/A'}`);
          console.log(`   📅 Upcoming Events: ${response.data.data?.upcomingEvents || 'N/A'}`);
        }
        
        passedTests++;
      } else {
        console.log(`❌ ${test.name}: FAILED (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
      if (error.response?.status) {
        console.log(`   Status: ${error.response.status}`);
      }
    }
  }

  console.log('\n📊 TEST RESULTS:');
  console.log(`✅ Passed: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);

  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Production backend is fully operational.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
  }
}

// Run the tests
testProductionEndpoints().catch(console.error);
