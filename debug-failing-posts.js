const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:8000';
const AUTH_TOKEN = 'mock_token_admin';

async function debugFailingPosts() {
  console.log('🔍 Debugging the 3 failing POST endpoints...\n');

  // Get valid IDs first
  const membersResponse = await fetch(`${BASE_URL}/api/members`, {
    headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
  });
  const membersData = await membersResponse.json();
  const memberId = membersData.members[0]?.id || 'mbr-001';

  const eventsResponse = await fetch(`${BASE_URL}/api/events`, {
    headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
  });
  const eventsData = await eventsResponse.json();
  const eventId = eventsData.events[0]?.id || 'evt-001';

  const templatesResponse = await fetch(`${BASE_URL}/api/journey-templates`, {
    headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
  });
  const templatesData = await templatesResponse.json();
  const templateId = templatesData.templates[0]?.id || 'jt-001';

  console.log(`Using IDs: Member=${memberId}, Event=${eventId}, Template=${templateId}\n`);

  const tests = [
    {
      name: 'Event Registration',
      method: 'POST',
      url: `${BASE_URL}/api/events/${eventId}/registrations`,
      body: { memberId }
    },
    {
      name: 'Journey Assignment',
      method: 'POST', 
      url: `${BASE_URL}/api/journeys/member-journeys`,
      body: { 
        memberId, 
        templateId,
        startDate: new Date().toISOString()
      }
    },
    {
      name: 'Announcement Creation',
      method: 'POST',
      url: `${BASE_URL}/api/communications/announcements`,
      body: {
        title: 'Test Announcement',
        content: 'This is a test announcement content.',
        priority: 'medium',
        category: 'general'
      }
    }
  ];

  for (const test of tests) {
    console.log(`🧪 Testing: ${test.name}`);
    
    try {
      const response = await fetch(test.url, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`
        },
        body: JSON.stringify(test.body)
      });

      const responseText = await response.text();
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers))}`);
      console.log(`   Body: ${responseText.substring(0, 300)}${responseText.length > 300 ? '...' : ''}`);
      
      if (response.status === 201 || response.status === 200) {
        console.log(`   ✅ SUCCESS`);
      } else {
        console.log(`   ❌ FAILED`);
      }
    } catch (error) {
      console.log(`   💥 ERROR: ${error.message}`);
    }
    
    console.log('');
  }
}

debugFailingPosts().catch(console.error);
