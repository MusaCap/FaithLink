// Quick server connectivity check
const http = require('http');

console.log('🔍 FaithLink360 Server Status Check');
console.log('===================================');

async function checkServers() {
  console.log('\n📡 Testing Backend Server (Port 8000)...');
  const backendResult = await testServer('localhost', 8000, '/health');
  
  console.log('\n🌐 Testing Frontend Server (Port 3000)...');
  const frontend3000 = await testServer('localhost', 3000, '/');
  
  console.log('\n🌐 Testing Frontend Server (Port 3001)...');
  const frontend3001 = await testServer('localhost', 3001, '/');
  
  console.log('\n📋 Results Summary:');
  console.log('===================');
  console.log(`Backend (8000):  ${backendResult ? '✅ Online' : '❌ Offline'}`);
  console.log(`Frontend (3000): ${frontend3000 ? '✅ Online' : '❌ Offline'}`);
  console.log(`Frontend (3001): ${frontend3001 ? '✅ Online' : '❌ Offline'}`);
  
  if (backendResult) {
    console.log('\n🔐 Testing Authentication...');
    const authResult = await testAuth();
    console.log(`Authentication: ${authResult ? '✅ Working' : '❌ Failed'}`);
  }
  
  if (frontend3000 || frontend3001) {
    const port = frontend3000 ? 3000 : 3001;
    console.log(`\n🎉 Platform Access Ready:`);
    console.log(`🌐 Frontend: http://localhost:${port}`);
    console.log(`🔧 Backend:  http://localhost:8000`);
    console.log(`🔐 Login:    admin@demo.faithlink360.com / password`);
  }
}

function testServer(hostname, port, path) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname,
      port,
      path,
      method: 'GET',
      timeout: 3000
    }, (res) => {
      console.log(`   Status: ${res.statusCode} (${res.statusMessage})`);
      resolve(res.statusCode < 400);
    });
    
    req.on('error', (err) => {
      console.log(`   Error: ${err.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log('   Error: Request timeout');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
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
      },
      timeout: 3000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(res.statusCode === 200 && parsed.success);
        } catch (e) {
          resolve(false);
        }
      });
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    
    req.write(postData);
    req.end();
  });
}

checkServers();
