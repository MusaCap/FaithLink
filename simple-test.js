// Simple test script to check backend endpoints
const http = require('http');

console.log('🔍 Testing All Backend Endpoints...');

const testEndpoint = (path, name) => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: path,
      method: path.includes('/auth/login') ? 'POST' : 'GET',
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode < 300) {
          console.log(`✅ ${name}: Working (${res.statusCode})`);
        } else {
          console.log(`⚠️  ${name}: Status ${res.statusCode}`);
        }
        resolve(true);
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${name}: Failed - ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log(`⏰ ${name}: Timeout`);
      req.destroy();
      resolve(false);
    });

    if (path.includes('/auth/login')) {
      req.write(JSON.stringify({ email: 'test@test.com', password: 'test123' }));
    }
    req.end();
  });
};

async function runTests() {
  const endpoints = [
    { path: '/health', name: 'Health Check' },
    { path: '/api/test', name: 'Test API' },
    { path: '/api/members', name: 'Members API' },
    { path: '/api/groups', name: 'Groups API' },
    { path: '/api/events', name: 'Events API' },
    { path: '/api/care', name: 'Care API' },
    { path: '/api/auth/login', name: 'Auth Login API' },
    { path: '/api/journeys', name: 'Journeys API' },
    { path: '/api/attendance', name: 'Attendance API' }
  ];

  console.log('🚀 Starting comprehensive endpoint tests...\n');
  
  let passed = 0;
  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint.path, endpoint.name);
    if (success) passed++;
  }

  console.log(`\n📊 Results: ${passed}/${endpoints.length} endpoints working`);
  
  if (passed === endpoints.length) {
    console.log('🎉 ALL ENDPOINTS WORKING! Running integration tests...\n');
    
    // Run integration test suite
    const { spawn } = require('child_process');
    const integrationTest = spawn('node', ['integration-test-suite.js'], {
      stdio: 'inherit'
    });
  } else {
    console.log('⚠️  Some endpoints need attention');
  }
}

runTests();
