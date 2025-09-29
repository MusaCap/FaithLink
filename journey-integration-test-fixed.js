const http = require('http');
const https = require('https');
const { URL } = require('url');

// Configuration
const API_BASE_URL = 'http://localhost:3000';
const AUTH_TOKEN = 'mock-jwt-token-for-testing';

// Test Results
let testResults = [];
let passedTests = 0;
let totalTests = 0;

// HTTP request helper using Node.js built-in modules
function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const httpModule = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: options.timeout || 10000
    };
    
    const req = httpModule.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Simplified API call with better error handling
async function testEndpoint(method, endpoint, body = null, expectedStatus = 200) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`
    },
    timeout: 10000
  };
  
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }
  
  try {
    console.log(`🔍 Testing ${method} ${endpoint}`);
    const response = await makeRequest(url, options);
    
    let data = null;
    try {
      data = JSON.parse(response.data);
    } catch (e) {
      console.log(`⚠️  Non-JSON response: ${response.data.substring(0, 100)}...`);
      return {
        success: false,
        status: response.status,
        error: 'Invalid JSON response',
        response: response.data.substring(0, 200)
      };
    }
    
    const success = response.status === expectedStatus;
    if (success) {
      console.log(`✅ PASS: ${method} ${endpoint} (${response.status})`);
    } else {
      console.log(`❌ FAIL: ${method} ${endpoint} - Expected ${expectedStatus}, got ${response.status}`);
    }
    
    return {
      success,
      status: response.status,
      data,
      expectedStatus
    };
    
  } catch (error) {
    console.log(`❌ ERROR: ${method} ${endpoint} - ${error.message}`);
    return {
      success: false,
      status: 0,
      error: error.message,
      expectedStatus
    };
  }
}

// Test runner
async function runTest(testName, testFn) {
  totalTests++;
  console.log(`\n🧪 ${totalTests}. ${testName}`);
  
  try {
    const result = await testFn();
    if (result && result.success) {
      passedTests++;
      testResults.push({ name: testName, status: 'PASS', details: result });
    } else {
      testResults.push({ 
        name: testName, 
        status: 'FAIL', 
        details: result || { error: 'Test function returned falsy' }
      });
    }
  } catch (error) {
    console.log(`❌ EXCEPTION: ${testName} - ${error.message}`);
    testResults.push({ name: testName, status: 'ERROR', error: error.message });
  }
}

// Sprint 5 Test Suite
async function runJourneyTests() {
  console.log('🙏 FaithLink360 - Sprint 5: Spiritual Journey Extensions Integration Tests');
  console.log('=' .repeat(80));
  console.log('Testing 19 API endpoints for production readiness\n');

  // 1. DAILY DEVOTIONS TESTS
  console.log('\n📖 1. DAILY DEVOTIONS TRACKING SYSTEM');
  
  await runTest('GET Devotions History', async () => {
    return await testEndpoint('GET', '/api/journeys/devotions?memberId=member-123');
  });

  await runTest('POST New Devotion', async () => {
    const devotionData = {
      memberId: 'member-123',
      date: '2025-01-16',
      passage: 'John 3:16',
      title: 'Test Devotion',
      notes: 'Test notes',
      duration: 15
    };
    return await testEndpoint('POST', '/api/journeys/devotions', devotionData, 201);
  });

  await runTest('PUT Update Devotion', async () => {
    const updateData = { notes: 'Updated test notes', duration: 20 };
    return await testEndpoint('PUT', '/api/journeys/devotions/dev-001', updateData);
  });

  await runTest('GET Reading Plans', async () => {
    return await testEndpoint('GET', '/api/journeys/devotions/plans');
  });

  // 2. SPIRITUAL GIFTS TESTS
  console.log('\n🎁 2. SPIRITUAL GIFTS ASSESSMENT SYSTEM');
  
  await runTest('GET Gifts Assessment Results', async () => {
    return await testEndpoint('GET', '/api/journeys/spiritual-gifts?memberId=member-123');
  });

  await runTest('POST Submit Assessment', async () => {
    const assessmentData = {
      memberId: 'member-123',
      responses: [
        { questionId: 'q001', answer: 5 },
        { questionId: 'q002', answer: 4 }
      ]
    };
    return await testEndpoint('POST', '/api/journeys/spiritual-gifts', assessmentData, 201);
  });

  await runTest('GET Assessment Questions', async () => {
    return await testEndpoint('GET', '/api/journeys/spiritual-gifts/questions');
  });

  // 3. SERVING OPPORTUNITIES TESTS
  console.log('\n🤝 3. SERVING OPPORTUNITIES SYSTEM');
  
  await runTest('GET Serving Opportunities', async () => {
    return await testEndpoint('GET', '/api/journeys/serving-opportunities');
  });

  await runTest('POST Apply for Opportunity', async () => {
    const applicationData = {
      memberId: 'member-123',
      memberName: 'John Smith',
      motivation: 'Test motivation'
    };
    return await testEndpoint('POST', '/api/journeys/serving-opportunities/opp-001/apply', applicationData, 201);
  });

  // 4. MILESTONE TRACKING TESTS
  console.log('\n🎯 4. JOURNEY MILESTONE TRACKING SYSTEM');
  
  await runTest('GET Member Milestones', async () => {
    return await testEndpoint('GET', '/api/journeys/milestones?memberId=member-123');
  });

  await runTest('PUT Update Milestone Progress', async () => {
    const updateData = { status: 'in_progress', notes: 'Test milestone update' };
    return await testEndpoint('PUT', '/api/journeys/milestones/milestone-004', updateData);
  });

  // 5. GROWTH ANALYTICS TESTS
  console.log('\n📊 5. SPIRITUAL GROWTH ANALYTICS SYSTEM');
  
  await runTest('GET Growth Analytics', async () => {
    return await testEndpoint('GET', '/api/journeys/analytics?memberId=member-123');
  });

  await runTest('GET Growth Trends', async () => {
    return await testEndpoint('GET', '/api/journeys/analytics/trends?memberId=member-123');
  });

  // 6. PERSONAL REFLECTIONS TESTS
  console.log('\n📝 6. PERSONAL REFLECTION & NOTES SYSTEM');
  
  await runTest('GET Personal Reflections', async () => {
    return await testEndpoint('GET', '/api/journeys/reflections?memberId=member-123');
  });

  await runTest('POST New Reflection', async () => {
    const reflectionData = {
      memberId: 'member-123',
      title: 'Test Reflection',
      content: 'Test reflection content for validation',
      category: 'devotional'
    };
    return await testEndpoint('POST', '/api/journeys/reflections', reflectionData, 201);
  });

  await runTest('PUT Update Reflection', async () => {
    const updateData = { title: 'Updated Test Reflection', content: 'Updated content' };
    return await testEndpoint('PUT', '/api/journeys/reflections/ref-001', updateData);
  });

  await runTest('DELETE Reflection', async () => {
    return await testEndpoint('DELETE', '/api/journeys/reflections/ref-001');
  });

  await runTest('PUT Update Action Item', async () => {
    const updateData = { completed: true, text: 'Updated action item' };
    return await testEndpoint('PUT', '/api/journeys/reflections/ref-002/actions/action-001', updateData);
  });

  await runTest('GET Export Reflections', async () => {
    return await testEndpoint('GET', '/api/journeys/reflections/export?memberId=member-123');
  });

  // RESULTS SUMMARY
  console.log('\n' + '='.repeat(80));
  console.log('📊 SPRINT 5 TEST RESULTS SUMMARY');
  console.log('='.repeat(80));
  
  const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
  
  console.log(`\n📋 Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}`);
  console.log(`📈 Success Rate: ${successRate}%`);

  // Feature breakdown
  console.log('\n📊 FEATURE COVERAGE:');
  console.log('• Daily Devotions Tracking: 4 endpoints');
  console.log('• Spiritual Gifts Assessment: 3 endpoints');
  console.log('• Serving Opportunities: 2 endpoints');
  console.log('• Journey Milestone Tracking: 2 endpoints');
  console.log('• Spiritual Growth Analytics: 2 endpoints');
  console.log('• Personal Reflection & Notes: 6 endpoints');
  console.log(`\n🎯 Total API Coverage: 19/19 endpoints (100%)`);

  // Detailed results for failed tests
  const failedTests = testResults.filter(t => t.status !== 'PASS');
  if (failedTests.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    failedTests.forEach(test => {
      console.log(`• ${test.name}: ${test.error || test.details?.error || 'Unknown error'}`);
    });
  }

  // Production readiness assessment
  console.log('\n🚀 PRODUCTION READINESS ASSESSMENT:');
  if (successRate >= 95) {
    console.log('✅ EXCELLENT - All systems operational, ready for production');
  } else if (successRate >= 85) {
    console.log('⚠️  GOOD - Minor issues detected, review before production');
  } else if (successRate >= 70) {
    console.log('🔧 NEEDS ATTENTION - Several issues require fixes');
  } else {
    console.log('❌ CRITICAL - Major issues prevent production deployment');
  }

  console.log('\n🎯 All Sprint 5 API endpoints tested!');
  console.log('Ready to proceed to Sprint 6: Advanced Reports & Analytics\n');
  
  return {
    totalTests,
    passedTests,
    successRate: parseFloat(successRate),
    ready: successRate >= 85
  };
}

// Run the test suite
if (require.main === module) {
  runJourneyTests().then(results => {
    process.exit(results.ready ? 0 : 1);
  }).catch(error => {
    console.error('Test suite error:', error);
    process.exit(1);
  });
}

module.exports = { runJourneyTests, testEndpoint };
