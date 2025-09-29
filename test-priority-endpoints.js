const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:8000';
const AUTH_TOKEN = 'mock_token_admin';

async function testPriorityEndpoints() {
  console.log('🧪 Testing newly implemented priority endpoints...\n');
  
  const tests = [
    // Event Registration System
    {
      name: 'GET Event Registrations',
      method: 'GET',
      url: `${BASE_URL}/api/events/evt-001/registrations`,
      expectedStatus: 200
    },
    {
      name: 'POST Event Registration',
      method: 'POST',
      url: `${BASE_URL}/api/events/evt-001/registrations`,
      body: { memberId: 'mbr-001' },
      expectedStatus: 201
    },
    
    // Journey Assignment System
    {
      name: 'POST Journey Assignment',
      method: 'POST',
      url: `${BASE_URL}/api/journeys/member-journeys`,
      body: { 
        memberId: 'mbr-001', 
        templateId: 'jt-001',
        mentorId: 'mbr-002',
        startDate: '2024-11-20T00:00:00Z'
      },
      expectedStatus: 201
    },
    {
      name: 'GET Member Journey Details',
      method: 'GET',
      url: `${BASE_URL}/api/journeys/member-journeys/member-journey-123`,
      expectedStatus: 200
    },
    {
      name: 'PUT Member Journey Update',
      method: 'PUT',
      url: `${BASE_URL}/api/journeys/member-journeys/member-journey-123`,
      body: { 
        status: 'in_progress',
        progress: 75,
        notes: 'Great progress on milestones'
      },
      expectedStatus: 200
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`
        }
      };

      if (test.body) {
        options.body = JSON.stringify(test.body);
      }

      const response = await fetch(test.url, options);
      const data = await response.text();

      if (response.status === test.expectedStatus) {
        console.log(`✅ ${test.name}: PASSED (${response.status})`);
        
        // Show response preview for successful calls
        try {
          const jsonData = JSON.parse(data);
          if (test.method === 'GET' && test.name.includes('Registrations')) {
            console.log(`   📊 Total Registrations: ${jsonData.totalRegistrations || 'N/A'}`);
          } else if (test.method === 'POST' && test.name.includes('Assignment')) {
            console.log(`   🎯 Journey ID: ${jsonData.id}, Status: ${jsonData.status}`);
          } else if (test.method === 'GET' && test.name.includes('Journey Details')) {
            console.log(`   📈 Progress: ${jsonData.journey?.progress}%, Milestones: ${jsonData.journey?.completedMilestones}/${jsonData.journey?.totalMilestones}`);
          }
        } catch (e) {
          // Response not JSON, that's okay
        }
        
        passed++;
      } else {
        console.log(`❌ ${test.name}: FAILED (${response.status} != ${test.expectedStatus})`);
        console.log(`   Response: ${data.substring(0, 200)}...`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 PRIORITY ENDPOINTS TEST RESULTS:`);
  console.log(`✅ Passed: ${passed}/${tests.length} (${(passed/tests.length*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${failed}/${tests.length} (${(failed/tests.length*100).toFixed(1)}%)`);

  if (passed === tests.length) {
    console.log('\n🎉 ALL PRIORITY ENDPOINTS WORKING! Critical user flows restored.');
  } else {
    console.log('\n⚠️ Some priority endpoints still need fixes.');
  }
}

// Run the test
testPriorityEndpoints().catch(console.error);
