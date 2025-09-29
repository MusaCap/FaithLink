const fetch = require('node-fetch');

async function testFinalJourneyEndpoint() {
  console.log('🎯 FINAL JOURNEY ENDPOINT TEST\n');

  try {
    // Test with the correct template ID (jt-002)
    const response = await fetch('http://localhost:8000/api/journeys/member-journeys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock_admin_token'
      },
      body: JSON.stringify({
        memberId: 'mbr-001',
        templateId: 'jt-002',  // Using the correct template ID
        mentorId: 'mbr-002'
      })
    });
    
    console.log(`✅ Status: ${response.status}`);
    
    if (response.status === 201) {
      const data = await response.json();
      console.log('✅ SUCCESS: Journey assignment endpoint working!');
      console.log('   Response:', JSON.stringify(data, null, 2));
    } else {
      const data = await response.text();
      console.log(`❌ FAILED: ${data}`);
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
  }
}

testFinalJourneyEndpoint().catch(console.error);
