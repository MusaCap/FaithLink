const fetch = require('node-fetch');

async function testJourneyEndpointWithDebug() {
  console.log('🔧 TESTING JOURNEY ENDPOINT WITH DEBUG LOGGING\n');

  try {
    // Test with the correct template ID (jt-002) that we know exists
    console.log('Testing POST /api/journeys/member-journeys with jt-002...');
    const response = await fetch('http://localhost:8000/api/journeys/member-journeys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock_admin_token'
      },
      body: JSON.stringify({
        memberId: 'mbr-001',
        templateId: 'jt-002',
        mentorId: 'mbr-002'
      })
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.status === 201) {
      const data = await response.json();
      console.log('✅ SUCCESS! Journey assignment endpoint is working!');
      console.log('Response data:', JSON.stringify(data, null, 2));
      return true;
    } else {
      const errorData = await response.text();
      console.log(`❌ FAILED: ${errorData}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return false;
  }
}

testJourneyEndpointWithDebug().then(success => {
  if (success) {
    console.log('\n🎉 FINAL ENDPOINT FIXED! Ready to achieve 100% API coverage!');
  } else {
    console.log('\n🔧 Still investigating the issue...');
  }
}).catch(console.error);
