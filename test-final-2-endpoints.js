const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:8000';

async function testFinal2Endpoints() {
  console.log('🔧 TESTING FINAL 2 FAILING ENDPOINTS\n');

  // Test 1: Journey assignment with jt-001
  console.log('1️⃣ Testing POST /api/journeys/member-journeys with jt-001...');
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
    if (response.status === 201) {
      const data = await response.json();
      console.log('   ✅ SUCCESS: Journey assignment working!');
    } else {
      const errorData = await response.text();
      console.log(`   ❌ FAILED: ${errorData}`);
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
  }

  console.log();

  // Test 2: Care records creation
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
        assignedTo: 'mbr-001', // Pastor ID
        scheduledDate: '2024-04-01T10:00:00Z'
      })
    });
    
    console.log(`   Status: ${response.status}`);
    if (response.status === 201) {
      const data = await response.json();
      console.log('   ✅ SUCCESS: Care record creation working!');
    } else {
      const errorData = await response.text();
      console.log(`   ❌ FAILED: ${errorData}`);
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
  }

  console.log('\n🔍 Investigation complete!');
}

testFinal2Endpoints().catch(console.error);
