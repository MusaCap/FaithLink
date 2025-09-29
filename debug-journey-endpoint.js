const fetch = require('node-fetch');

async function debugJourneyEndpoint() {
  console.log('🔧 DEBUGGING JOURNEY ENDPOINT LOGIC\n');

  // First check what journey templates are available
  console.log('1️⃣ Checking available journey templates...');
  try {
    const response = await fetch('http://localhost:8000/api/journey-templates', {
      headers: { 'Authorization': 'Bearer mock_admin_token' }
    });
    const data = await response.json();
    console.log('   Available templates:', data.templates.map(t => ({ id: t.id, title: t.title })));
    console.log();
  } catch (error) {
    console.log(`   Error: ${error.message}\n`);
  }

  // Test with the exact template ID that exists
  console.log('2️⃣ Testing journey assignment with jt-001...');
  try {
    const response = await fetch('http://localhost:8000/api/journeys/member-journeys', {
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
    console.log(`   Response: ${data}\n`);
  } catch (error) {
    console.log(`   Error: ${error.message}\n`);
  }

  // Test with template ID that definitely doesn't exist
  console.log('3️⃣ Testing with invalid template ID...');
  try {
    const response = await fetch('http://localhost:8000/api/journeys/member-journeys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', 
        'Authorization': 'Bearer mock_admin_token'
      },
      body: JSON.stringify({
        memberId: 'mbr-001',
        templateId: 'invalid-template',
        mentorId: 'mbr-002'
      })
    });
    
    console.log(`   Status: ${response.status}`);
    const data = await response.text();
    console.log(`   Response: ${data}\n`);
  } catch (error) {
    console.log(`   Error: ${error.message}\n`);
  }

  console.log('🔍 Debug complete!');
}

debugJourneyEndpoint().catch(console.error);
