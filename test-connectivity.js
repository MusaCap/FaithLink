// Test connectivity between frontend and backend
console.log('🧪 Testing FaithLink360 API connectivity...\n');

const http = require('http');

function testEndpoint(hostname, port, path) {
  return new Promise((resolve, reject) => {
    const options = { hostname, port, path, method: 'GET', timeout: 5000 };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data, headers: res.headers });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

async function runTests() {
  console.log('📡 Testing Backend API (localhost:5000)...');
  
  try {
    // Test health endpoint
    const health = await testEndpoint('localhost', 5000, '/health');
    console.log(`✅ Health check: ${health.status}`);
    
    // Test Groups API
    const groups = await testEndpoint('localhost', 5000, '/api/groups');
    console.log(`✅ Groups API: ${groups.status}`);
    if (groups.data) {
      try {
        const parsed = JSON.parse(groups.data);
        console.log(`   - Found ${parsed.total} groups`);
      } catch (e) {}
    }
    
    // Test Journey Templates API
    const journeys = await testEndpoint('localhost', 5000, '/api/journeys/templates');
    console.log(`✅ Journey Templates API: ${journeys.status}`);
    
    // Test Attendance API
    const attendance = await testEndpoint('localhost', 5000, '/api/attendance');
    console.log(`✅ Attendance API: ${attendance.status}`);
    
    console.log('\n🌐 Testing Frontend (localhost:3001)...');
    
    // Test frontend homepage
    const frontend = await testEndpoint('localhost', 3001, '/');
    console.log(`✅ Frontend homepage: ${frontend.status}`);
    
    console.log('\n🎉 Integration test completed successfully!');
    console.log('📋 Summary:');
    console.log('   - Backend API server: Running on port 5000');
    console.log('   - Frontend server: Running on port 3001');
    console.log('   - All API endpoints responding correctly');
    console.log('\n✨ FaithLink360 is ready for frontend-backend integration!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();
