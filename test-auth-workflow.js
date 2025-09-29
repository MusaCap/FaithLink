// Test authentication workflow with working backend
const http = require('http');

console.log('🔐 Testing FaithLink360 Authentication Workflow');
console.log('===============================================');

async function testAuthWorkflow() {
  console.log('\n1️⃣ Testing Login Endpoint...');
  
  const loginTest = await testLogin('admin@demo.faithlink360.com', 'password');
  
  if (loginTest.success) {
    console.log('✅ Login successful!');
    console.log(`   🔑 Token: ${loginTest.token?.substring(0, 20)}...`);
    console.log(`   👤 User: ${loginTest.user?.name} (${loginTest.user?.role})`);
    
    console.log('\n2️⃣ Testing User Info Endpoint...');
    const userInfoTest = await testUserInfo(loginTest.token);
    
    if (userInfoTest.success) {
      console.log('✅ User info retrieved successfully!');
      console.log(`   📧 Email: ${userInfoTest.user?.email}`);
      console.log(`   🏷️ Role: ${userInfoTest.user?.role}`);
    } else {
      console.log('❌ User info test failed:', userInfoTest.error);
    }
  } else {
    console.log('❌ Login failed:', loginTest.error);
  }
  
  console.log('\n🎯 Authentication Workflow Test Complete!');
}

function testLogin(email, password) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ email, password });
    
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode === 200 && parsed.success) {
            resolve({
              success: true,
              token: parsed.token,
              user: parsed.user
            });
          } else {
            resolve({
              success: false,
              error: parsed.message || `HTTP ${res.statusCode}`
            });
          }
        } catch (e) {
          resolve({
            success: false,
            error: 'Invalid JSON response'
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

    req.write(postData);
    req.end();
  });
}

function testUserInfo(token) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode === 200) {
            resolve({
              success: true,
              user: parsed
            });
          } else {
            resolve({
              success: false,
              error: `HTTP ${res.statusCode}`
            });
          }
        } catch (e) {
          resolve({
            success: false,
            error: 'Invalid JSON response'
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

testAuthWorkflow();
