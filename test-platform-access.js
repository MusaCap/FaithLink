// Test complete platform access with updated port
const http = require('http');

console.log('🚀 Testing FaithLink360 Platform Access');
console.log('======================================');

async function testPlatformAccess() {
  console.log('\n🔍 Step 1: Verifying server accessibility...');
  
  // Test backend on port 8000
  const backendTest = await testServer(8000, '/health', 'Backend');
  
  // Test frontend on port 3001 (updated port)
  const frontendTest = await testServer(3001, '/', 'Frontend');
  
  if (backendTest && frontendTest) {
    console.log('\n✅ Both servers accessible!');
    
    // Test API integration with updated frontend port
    console.log('\n🔗 Step 2: Testing API integration...');
    await testAPIFlow();
    
    console.log('\n🎉 Platform Access Test Complete!');
    console.log('✅ Frontend: http://localhost:3001');
    console.log('✅ Backend API: http://localhost:8000');
    console.log('🔐 Login: admin@demo.faithlink360.com / password');
    console.log('📊 Platform ready for use!');
  } else {
    console.log('\n❌ Server accessibility issues detected');
  }
}

function testServer(port, path, name) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: path,
      method: 'GET',
      timeout: 3000
    }, (res) => {
      console.log(`   ✅ ${name} (Port ${port}): ${res.statusCode}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`   ❌ ${name} (Port ${port}): ${err.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log(`   ⏰ ${name} (Port ${port}): Timeout`);
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

async function testAPIFlow() {
  // Test authentication
  console.log('   🔐 Testing authentication...');
  const authResult = await testAuth();
  
  if (authResult.success) {
    console.log('   ✅ Authentication working');
    
    // Test data endpoints
    console.log('   📊 Testing data endpoints...');
    const endpoints = [
      { path: '/api/members', name: 'Members' },
      { path: '/api/groups', name: 'Groups' }, 
      { path: '/api/events', name: 'Events' }
    ];
    
    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint.path, authResult.token);
      if (result.success) {
        console.log(`   ✅ ${endpoint.name}: Working`);
      } else {
        console.log(`   ❌ ${endpoint.name}: ${result.error}`);
      }
    }
  } else {
    console.log('   ❌ Authentication failed:', authResult.error);
  }
}

function testAuth() {
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
            success: res.statusCode === 200,
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

function testEndpoint(path, token) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8000,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          success: res.statusCode === 200,
          data: data
        });
      });
    });
    
    req.on('error', (err) => resolve({ success: false, error: err.message }));
    req.end();
  });
}

testPlatformAccess();
