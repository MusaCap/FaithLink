// Quick test for the failing endpoints
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:8000';
const AUTH_TOKEN = 'mock_token_admin';

async function testEndpoint(endpoint, method = 'GET') {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    console.log(`${method} ${endpoint}: ${response.status}`);
    
    if (response.status === 200) {
      const data = await response.json();
      console.log('✅ Success');
    } else {
      console.log('❌ Failed');
    }
  } catch (error) {
    console.log(`❌ ${endpoint}: ERROR - ${error.message}`);
  }
}

async function runTests() {
  console.log('Testing failing endpoints...');
  await testEndpoint('/api/members/stats');
  await testEndpoint('/api/members/tags');
  await testEndpoint('/api/groups/stats');
  await testEndpoint('/api/care/prayer-requests', 'POST');
}

runTests();
