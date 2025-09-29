const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:8000';

async function testFailingEndpoints() {
  console.log('🔧 TESTING FINAL 2 FAILING ENDPOINTS\n');

  // Test 1: POST /api/journeys/member-journeys (404 error)
  console.log('1️⃣ Testing POST /api/journeys/member-journeys...');
  try {
    const response = await fetch(`${BASE_URL}/api/journeys/member-journeys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock_admin_token'
      },
      body: JSON.stringify({
        memberId: 'mbr-001',
        templateId: 'jt-001',
        mentorId: 'mbr-002'
      })
    });
    
    console.log(`   Status: ${response.status}`);
    const data = await response.text();
    console.log(`   Response: ${data.substring(0, 200)}...\n`);
  } catch (error) {
    console.log(`   Error: ${error.message}\n`);
  }

  // Test 2: POST /api/care/records (400 error)
  console.log('2️⃣ Testing POST /api/care/records...');
  try {
    const response = await fetch(`${BASE_URL}/api/care/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock_admin_token'
      },
      body: JSON.stringify({
        memberId: 'mbr-001',
        careType: 'counseling',
        priority: 'medium',
        description: 'Member needs counseling support',
        assignedTo: 'pastor-001',
        scheduledDate: '2024-02-01T10:00:00Z'
      })
    });
    
    console.log(`   Status: ${response.status}`);
    const data = await response.text();
    console.log(`   Response: ${data.substring(0, 200)}...\n`);
  } catch (error) {
    console.log(`   Error: ${error.message}\n`);
  }

  console.log('🔍 Investigation complete!');
}

testFailingEndpoints().catch(console.error);
