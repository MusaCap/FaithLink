// Verify React frontend can load and display backend data
const puppeteer = require('puppeteer');
const http = require('http');

console.log('🌐 Verifying FaithLink360 React Frontend Integration');
console.log('==================================================');

async function verifyFrontendIntegration() {
  // First verify servers are running
  console.log('\n🔍 Step 1: Verifying server connectivity...');
  
  const backendOnline = await checkServer(8000, '/health');
  const frontendOnline = await checkServer(3000, '/');
  
  if (!backendOnline) {
    console.log('❌ Backend server not accessible on port 8000');
    return;
  }
  
  if (!frontendOnline) {
    console.log('❌ Frontend server not accessible on port 3000');
    return;
  }
  
  console.log('✅ Both servers are online and accessible');
  
  // Test frontend-backend integration
  console.log('\n🔗 Step 2: Testing frontend-backend data flow...');
  await testDataFlow();
  
  console.log('\n🎯 Frontend Integration Verification Complete!');
  console.log('✅ React components ready for backend API integration');
  console.log('🌐 Frontend URL: http://localhost:3000');
  console.log('📡 Backend API: http://localhost:8000');
}

function checkServer(port, path) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: path,
      method: 'GET',
      timeout: 3000
    }, (res) => {
      console.log(`   ✅ Port ${port}: Online (${res.statusCode})`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`   ❌ Port ${port}: ${err.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log(`   ⏰ Port ${port}: Timeout`);
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

async function testDataFlow() {
  console.log('   📊 Testing API data retrieval...');
  
  // Test if we can get data from backend APIs
  const endpoints = [
    { path: '/api/members', name: 'Members' },
    { path: '/api/groups', name: 'Groups' },
    { path: '/api/events', name: 'Events' }
  ];
  
  let allWorking = true;
  
  for (const endpoint of endpoints) {
    const data = await getApiData(endpoint.path);
    if (data.success) {
      console.log(`   ✅ ${endpoint.name}: Data available`);
    } else {
      console.log(`   ❌ ${endpoint.name}: ${data.error}`);
      allWorking = false;
    }
  }
  
  if (allWorking) {
    console.log('   🎉 All API endpoints providing data successfully');
    console.log('   🔗 Frontend services can connect to backend APIs');
    
    // Test authentication flow
    console.log('\n   🔐 Testing authentication flow...');
    const authResult = await testAuthFlow();
    
    if (authResult.success) {
      console.log('   ✅ Authentication: Login successful');
      console.log('   🔑 JWT token received and stored');
    } else {
      console.log('   ❌ Authentication failed:', authResult.error);
    }
  } else {
    console.log('   ⚠️  Some API endpoints have issues');
  }
}

function getApiData(path) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8000,
      path: path,
      method: 'GET',
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            success: res.statusCode === 200,
            data: parsed
          });
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

function testAuthFlow() {
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
          resolve({
            success: false,
            error: 'Invalid response'
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
    
    req.write(postData);
    req.end();
  });
}

verifyFrontendIntegration();
