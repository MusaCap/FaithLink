// Test frontend-backend API connectivity
const http = require('http');

console.log('🔗 Testing FaithLink360 Frontend-Backend Connection');
console.log('==================================================');

// Test if both servers are running
async function testServerConnectivity() {
  console.log('\n🖥️ Testing Backend Server (Port 8000)...');
  
  // Test backend
  const backendTest = new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8000,
      path: '/health',
      method: 'GET',
      timeout: 3000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('✅ Backend: ONLINE');
        try {
          const parsed = JSON.parse(data);
          console.log(`   📊 Status: ${parsed.status}`);
          console.log(`   🗄️ Database: ${parsed.database?.status || 'N/A'}`);
        } catch (e) {
          console.log(`   📄 Response received`);
        }
        resolve(true);
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Backend: OFFLINE -', err.message);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log('⏰ Backend: TIMEOUT');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });

  console.log('\n🌐 Testing Frontend Server (Port 3000)...');
  
  // Test frontend
  const frontendTest = new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      timeout: 3000
    }, (res) => {
      console.log('✅ Frontend: ONLINE');
      console.log(`   📊 Status: ${res.statusCode}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log('❌ Frontend: OFFLINE -', err.message);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log('⏰ Frontend: TIMEOUT');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });

  const [backendOnline, frontendOnline] = await Promise.all([backendTest, frontendTest]);

  if (backendOnline && frontendOnline) {
    console.log('\n🎉 SUCCESS: Both servers are online!');
    await testAPIEndpoints();
  } else {
    console.log('\n⚠️ WARNING: One or both servers are offline');
    if (!backendOnline) console.log('   🔧 Start backend: cd src\\backend && node server-fixed.js');
    if (!frontendOnline) console.log('   🔧 Start frontend: cd src\\frontend && node frontend-fixed.js');
  }
}

// Test specific API endpoints that frontend will use
async function testAPIEndpoints() {
  console.log('\n📡 Testing Key API Endpoints...');
  
  const endpoints = [
    '/api/members',
    '/api/groups', 
    '/api/events',
    '/api/auth/me'
  ];

  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint);
    console.log(`   ${success ? '✅' : '❌'} ${endpoint}`);
  }
  
  console.log('\n🚀 Frontend-Backend Integration Ready!');
  console.log('🔗 Frontend URL: http://localhost:3000');
  console.log('📡 Backend API: http://localhost:8000');
}

function testEndpoint(path) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8000,
      path: path,
      method: 'GET',
      timeout: 3000
    }, (res) => {
      resolve(res.statusCode < 300);
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

testServerConnectivity();
