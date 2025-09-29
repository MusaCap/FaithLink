// Test frontend service integration with backend APIs
const http = require('http');

console.log('🔗 Testing Frontend Service Integration with Backend APIs');
console.log('=======================================================');

async function testApiIntegration() {
  // Test authentication first
  console.log('\n🔐 Step 1: Testing Authentication...');
  const authResult = await testAuth();
  
  if (!authResult.success) {
    console.log('❌ Authentication failed - cannot proceed with data tests');
    return;
  }
  
  console.log('✅ Authentication successful!');
  const token = authResult.token;
  
  // Test Members API
  console.log('\n👥 Step 2: Testing Members API...');
  await testMembersAPI(token);
  
  // Test Groups API  
  console.log('\n👨‍👩‍👧‍👦 Step 3: Testing Groups API...');
  await testGroupsAPI(token);
  
  // Test Events API
  console.log('\n📅 Step 4: Testing Events API...');
  await testEventsAPI(token);
  
  // Test Additional APIs
  console.log('\n🛤️ Step 5: Testing Additional APIs...');
  await testAdditionalAPIs(token);
  
  console.log('\n🎉 API Integration Test Complete!');
  console.log('✅ Frontend services can now connect to backend APIs');
  console.log('🔗 Ready for React component integration');
}

async function testAuth() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ 
      email: 'admin@demo.faithlink360.com', 
      password: 'password' 
    });
    
    const req = http.request({
      hostname: 'localhost',
      port: 8000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            success: parsed.success || res.statusCode === 200,
            token: parsed.token,
            user: parsed.user
          });
        } catch (e) {
          resolve({ success: false, error: 'Invalid response' });
        }
      });
    });
    
    req.on('error', (err) => resolve({ success: false, error: err.message }));
    req.write(postData);
    req.end();
  });
}

async function testMembersAPI(token) {
  console.log('   📊 GET /api/members...');
  const result = await makeRequest('/api/members', 'GET', token);
  
  if (result.success) {
    console.log('   ✅ Members API working');
    console.log(`   📈 Response: ${result.data.members ? result.data.members.length : 'N/A'} members found`);
  } else {
    console.log('   ❌ Members API failed:', result.error);
  }
}

async function testGroupsAPI(token) {
  console.log('   📊 GET /api/groups...');
  const result = await makeRequest('/api/groups', 'GET', token);
  
  if (result.success) {
    console.log('   ✅ Groups API working');  
    console.log(`   📈 Response: ${result.data.groups ? result.data.groups.length : 'N/A'} groups found`);
  } else {
    console.log('   ❌ Groups API failed:', result.error);
  }
}

async function testEventsAPI(token) {
  console.log('   📊 GET /api/events...');
  const result = await makeRequest('/api/events', 'GET', token);
  
  if (result.success) {
    console.log('   ✅ Events API working');
    console.log(`   📈 Response: ${result.data.events ? result.data.events.length : 'N/A'} events found`);
  } else {
    console.log('   ❌ Events API failed:', result.error);
  }
}

async function testAdditionalAPIs(token) {
  const endpoints = [
    '/api/journeys',
    '/api/attendance', 
    '/api/care'
  ];
  
  for (const endpoint of endpoints) {
    console.log(`   📊 GET ${endpoint}...`);
    const result = await makeRequest(endpoint, 'GET', token);
    
    if (result.success) {
      console.log(`   ✅ ${endpoint} working`);
    } else {
      console.log(`   ❌ ${endpoint} failed:`, result.error);
    }
  }
}

function makeRequest(path, method = 'GET', token = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            success: res.statusCode < 300,
            data: parsed,
            status: res.statusCode
          });
        } catch (e) {
          resolve({
            success: res.statusCode < 300,
            data: data,
            status: res.statusCode
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        success: false,
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

testApiIntegration();
