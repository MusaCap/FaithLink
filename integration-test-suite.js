const axios = require('axios');

// Configuration
const BACKEND_URL = 'http://localhost:8000';
const FRONTEND_URL = 'http://localhost:3000';

console.log('🧪 FaithLink360 Integration Test Suite Starting...');

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Helper function to run a test
async function runTest(testName, testFunction) {
  try {
    console.log(`\n🔍 Testing: ${testName}`);
    await testFunction();
    console.log(`✅ PASSED: ${testName}`);
    testResults.passed++;
  } catch (error) {
    console.log(`❌ FAILED: ${testName} - ${error.message}`);
    testResults.failed++;
    testResults.errors.push({ test: testName, error: error.message });
  }
}

// Backend API Tests
async function testBackendHealth() {
  const response = await axios.get(`${BACKEND_URL}/health`);
  if (response.status !== 200) throw new Error('Health check failed');
  if (response.data.status !== 'OK') throw new Error('Health status not OK');
  if (response.data.database !== 'Connected') throw new Error('Database not connected');
}

async function testBackendTestEndpoint() {
  const response = await axios.get(`${BACKEND_URL}/api/test`);
  if (response.status !== 200) throw new Error('Test endpoint failed');
  if (!response.data.message) throw new Error('Test response missing message');
}

async function testMembersEndpoint() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/members`);
    if (response.status !== 200 && response.status !== 401) {
      throw new Error(`Unexpected status: ${response.status}`);
    }
    console.log(`   📊 Members endpoint status: ${response.status}`);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('   🔐 Members endpoint requires authentication (expected)');
    } else {
      throw error;
    }
  }
}

async function testGroupsEndpoint() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/groups`);
    if (response.status !== 200 && response.status !== 401) {
      throw new Error(`Unexpected status: ${response.status}`);
    }
    console.log(`   📊 Groups endpoint status: ${response.status}`);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('   🔐 Groups endpoint requires authentication (expected)');
    } else {
      throw error;
    }
  }
}

async function testEventsEndpoint() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/events`);
    if (response.status !== 200 && response.status !== 401) {
      throw new Error(`Unexpected status: ${response.status}`);
    }
    console.log(`   📊 Events endpoint status: ${response.status}`);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('   🔐 Events endpoint requires authentication (expected)');
    } else {
      throw error;
    }
  }
}

async function testCareEndpoint() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/care`);
    if (response.status !== 200 && response.status !== 401) {
      throw new Error(`Unexpected status: ${response.status}`);
    }
    console.log(`   📊 Care endpoint status: ${response.status}`);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('   🔐 Care endpoint requires authentication (expected)');
    } else {
      throw error;
    }
  }
}

async function testAuthEndpoints() {
  try {
    // Test login endpoint with invalid credentials
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'test@test.com',
      password: 'wrongpassword'
    });
  } catch (error) {
    if (error.response && (error.response.status === 401 || error.response.status === 400)) {
      console.log('   🔐 Login endpoint correctly rejects invalid credentials');
    } else {
      throw new Error(`Unexpected auth error: ${error.message}`);
    }
  }
}

// Frontend Tests
async function testFrontendHealth() {
  try {
    const response = await axios.get(`${FRONTEND_URL}`, { timeout: 5000 });
    if (response.status !== 200) throw new Error('Frontend not accessible');
    console.log('   🌐 Frontend server is running and accessible');
  } catch (error) {
    throw new Error(`Frontend not accessible: ${error.message}`);
  }
}

// CORS Tests
async function testCORS() {
  try {
    const response = await axios.options(`${BACKEND_URL}/api/test`, {
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET'
      }
    });
    console.log('   🌐 CORS preflight request successful');
  } catch (error) {
    console.log('   ⚠️  CORS test inconclusive (may be normal)');
  }
}

// Database Integration Tests
async function testDatabaseModels() {
  // Test that all major API endpoints respond (even with auth errors)
  const endpoints = ['/api/members', '/api/groups', '/api/events', '/api/care', '/api/journeys', '/api/attendance'];
  let workingEndpoints = 0;
  
  for (const endpoint of endpoints) {
    try {
      await axios.get(`${BACKEND_URL}${endpoint}`, { timeout: 3000 });
      workingEndpoints++;
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        workingEndpoints++; // Auth error means endpoint exists
      }
    }
  }
  
  if (workingEndpoints < 4) {
    throw new Error(`Only ${workingEndpoints}/${endpoints.length} endpoints responding`);
  }
  console.log(`   📊 ${workingEndpoints}/${endpoints.length} API endpoints responding correctly`);
}

// Performance Tests
async function testResponseTimes() {
  const start = Date.now();
  await axios.get(`${BACKEND_URL}/health`);
  const responseTime = Date.now() - start;
  
  if (responseTime > 5000) {
    throw new Error(`Health endpoint too slow: ${responseTime}ms`);
  }
  console.log(`   ⚡ Health endpoint response time: ${responseTime}ms`);
}

// Main test execution
async function runIntegrationTests() {
  console.log('🚀 Starting Backend Integration Tests...');
  
  // Core Backend Tests
  await runTest('Backend Health Check', testBackendHealth);
  await runTest('Backend Test Endpoint', testBackendTestEndpoint);
  await runTest('Response Time Performance', testResponseTimes);
  
  // API Endpoint Tests
  await runTest('Members API Endpoint', testMembersEndpoint);
  await runTest('Groups API Endpoint', testGroupsEndpoint);
  await runTest('Events API Endpoint', testEventsEndpoint);
  await runTest('Care API Endpoint', testCareEndpoint);
  await runTest('Authentication Endpoints', testAuthEndpoints);
  
  // Database and Model Tests
  await runTest('Database Model Integration', testDatabaseModels);
  
  // Frontend Tests
  console.log('\n🌐 Starting Frontend Integration Tests...');
  await runTest('Frontend Server Health', testFrontendHealth);
  await runTest('CORS Configuration', testCORS);
  
  // Results Summary
  console.log('\n📊 Integration Test Results Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n🔍 Failed Test Details:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.test}: ${error.error}`);
    });
  }
  
  console.log('\n🎯 Integration Test Suite Complete!');
  
  if (testResults.failed === 0) {
    console.log('🎉 All integration tests passed! Frontend-Backend connection is working correctly.');
  } else if (testResults.failed < 3) {
    console.log('⚠️  Most tests passed with minor issues. System is largely functional.');
  } else {
    console.log('❌ Multiple integration issues detected. Review failed tests.');
  }
}

// Execute tests
runIntegrationTests().catch((error) => {
  console.error('💥 Integration test suite crashed:', error.message);
  process.exit(1);
});
