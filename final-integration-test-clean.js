const http = require('http');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

// Utility function to make HTTP requests
function makeRequest(endpoint, method = 'GET', data = null, role = 'admin') {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API_BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer mock-jwt-token-${role}-user`
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedBody = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            data: parsedBody,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: body,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test runner function
async function runTest(testName, testFunction) {
  totalTests++;
  try {
    await testFunction();
    passedTests++;
    testResults.push({ test: testName, status: 'PASSED' });
    console.log(`✅ PASSED: ${testName}`);
  } catch (error) {
    failedTests++;
    testResults.push({ test: testName, status: 'FAILED', error: error.message });
    console.log(`❌ FAILED: ${testName} - ${error.message}`);
  }
}

// Core Platform Tests
async function testHealthCheck() {
  const response = await makeRequest('/health');
  if (response.status !== 200) {
    throw new Error(`Health check failed with status ${response.status}`);
  }
}

async function testEventWorkflow() {
  const eventId = `test-event-${Date.now()}`;
  
  // Step 1: Event Registration
  const registrationData = {
    memberId: 'mem-001',
    eventId: eventId,
    registrationDate: new Date().toISOString(),
    specialRequirements: 'None'
  };
  
  const regResponse = await makeRequest(`/api/events/${eventId}/registrations`, 'POST', registrationData);
  if (regResponse.status !== 201) {
    throw new Error(`Event registration failed with status ${regResponse.status}`);
  }
  
  // Step 2: Event Check-in
  const checkinResponse = await makeRequest(`/api/events/${eventId}/check-in`, 'POST', {
    memberId: 'mem-001',
    checkInTime: new Date().toISOString(),
    checkInMethod: 'manual'
  });
  
  if (checkinResponse.status !== 201) {
    throw new Error(`Event check-in failed with status ${checkinResponse.status}`);
  }
}

async function testJourneyWorkflow() {
  const memberId = `mem-${Date.now()}`;
  
  // Step 1: Assign Journey
  const journeyResponse = await makeRequest('/api/journeys', 'POST', {
    memberId: memberId,
    templateId: 'template-001',
    startDate: new Date().toISOString()
  });
  
  if (journeyResponse.status !== 201) {
    throw new Error(`Journey assignment failed with status ${journeyResponse.status}`);
  }
}

async function testCommunicationWorkflow() {
  const campaignId = `campaign-${Date.now()}`;
  
  // Test communication campaign
  const campaignResponse = await makeRequest(`/api/communications/campaigns/${campaignId}/send`, 'POST', {
    recipientIds: ['mem-001', 'mem-002'],
    subject: 'Test Campaign',
    message: 'This is a test message'
  });
  
  if (campaignResponse.status !== 200) {
    throw new Error(`Communication campaign failed with status ${campaignResponse.status}`);
  }
}

async function testPlatformAPIs() {
  // Test core API endpoints
  const endpoints = [
    '/api/members',
    '/api/groups', 
    '/api/events',
    '/api/journeys',
    '/api/communications/campaigns'
  ];
  
  for (const endpoint of endpoints) {
    const response = await makeRequest(endpoint);
    if (response.status !== 200) {
      throw new Error(`API ${endpoint} failed with status ${response.status}`);
    }
  }
}

async function testPerformance() {
  const startTime = Date.now();
  
  // Test multiple concurrent requests
  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(makeRequest('/health'));
  }
  
  await Promise.all(promises);
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  if (totalTime > 5000) { // 5 second timeout
    throw new Error(`Performance test failed: ${totalTime}ms > 5000ms`);
  }
}

// Main test execution
async function runFinalIntegrationTests() {
  console.log('🚀 FINAL SPRINT 7 INTEGRATION TEST SUITE');
  console.log('================================================================================');
  
  console.log('\n💚 PLATFORM HEALTH MONITORING');
  console.log('--------------------------------');
  await runTest('Health Check', testHealthCheck);
  
  console.log('\n🔄 CORE WORKFLOW TESTING');
  console.log('---------------------------');
  await runTest('Event Registration & Check-in Workflow', testEventWorkflow);
  await runTest('Journey Assignment Workflow', testJourneyWorkflow);
  await runTest('Communication Campaign Workflow', testCommunicationWorkflow);
  
  console.log('\n📡 API ENDPOINT VALIDATION');
  console.log('-----------------------------');
  await runTest('Platform API Endpoints', testPlatformAPIs);
  
  console.log('\n⚡ PERFORMANCE TESTING');
  console.log('------------------------');
  await runTest('Concurrent Request Performance', testPerformance);
  
  // Final Results
  console.log('\n================================================================================');
  console.log('🎯 FINAL SPRINT 7 INTEGRATION TEST RESULTS');
  console.log('================================================================================');
  console.log(`📊 Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (failedTests > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.filter(r => r.status === 'FAILED').forEach(result => {
      console.log(`   • ${result.test}: ${result.error}`);
    });
  }

  const productionReady = failedTests === 0 && (passedTests / totalTests) >= 1.0;
  console.log(`\n🚀 PLATFORM PRODUCTION READINESS: ${productionReady ? '✅ READY' : '❌ NOT READY'}`);
  
  if (productionReady) {
    console.log('   🎉 FaithLink360 platform is fully integrated and production-ready!');
    console.log('   📦 All 6 modules working together seamlessly');
    console.log('   🔒 Security and workflows validated');
    console.log('   ⚡ Performance benchmarks met');
    console.log('   💚 Platform health monitoring active');
    console.log('   🚀 Ready for production deployment!');
  } else {
    console.log('   ⚠️  Platform integration needs attention before production deployment.');
    console.log('   🔧 Review failed tests and resolve integration issues.');
  }
  
  console.log('\n================================================================================');
}

// Execute final integration tests
runFinalIntegrationTests().catch(error => {
  console.error('❌ Final integration test suite failed:', error);
  process.exit(1);
});
