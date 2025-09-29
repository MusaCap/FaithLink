const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:8000';
const AUTH_TOKEN = 'mock_token_admin';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${AUTH_TOKEN}`
};

async function testFailingEndpoints() {
  console.log('🔍 Testing the 9 failing endpoints from previous audit:\n');
  
  const tests = [
    { method: 'GET', url: '/api/members/bulk', desc: 'Members bulk operations' },
    { method: 'GET', url: '/api/members/search/suggestions?q=john', desc: 'Member search suggestions' },
    { method: 'GET', url: '/api/groups/bulk', desc: 'Groups bulk operations' },
    { method: 'GET', url: '/api/groups/grp-001/members', desc: 'Group members' },
    { method: 'POST', url: '/api/groups/grp-001/members', desc: 'Add group member', body: { memberId: 'mbr-001' } },
    { method: 'DELETE', url: '/api/groups/grp-001/members/mbr-001', desc: 'Remove group member' },
    { method: 'GET', url: '/api/events/evt-001/registrations', desc: 'Event registrations' },
    { method: 'POST', url: '/api/events/evt-001/registrations', desc: 'Register for event', body: { memberId: 'mbr-001' } },
    { method: 'POST', url: '/api/journeys/member-journeys', desc: 'Assign journey to member', body: { memberId: 'mbr-001', templateId: 'jt-001' } }
  ];
  
  for (const test of tests) {
    try {
      const options = { method: test.method, headers };
      if (test.body) {
        options.body = JSON.stringify(test.body);
      }
      
      const response = await fetch(`${BASE_URL}${test.url}`, options);
      const status = response.status;
      
      if (status >= 200 && status < 400) {
        console.log(`✅ ${test.method.padEnd(6)} ${test.url} - ${test.desc} (${status})`);
      } else {
        console.log(`❌ ${test.method.padEnd(6)} ${test.url} - ${test.desc} (${status})`);
      }
    } catch (error) {
      console.log(`❌ ${test.method.padEnd(6)} ${test.url} - ${test.desc} (ERROR: ${error.message})`);
    }
  }
}

testFailingEndpoints().catch(console.error);
