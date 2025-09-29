/**
 * FaithLink360 - Pastoral Care Module Integration Test Suite
 * 
 * Tests all Pastoral Care API endpoints for production readiness
 * Including Prayer Requests, Care Records, Counseling Sessions, 
 * Member Care History, and Care Dashboard
 */

const baseURL = 'http://localhost:8000';

// Test results tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

/**
 * Test utility functions
 */
function logTest(name, success, details = '') {
  testResults.total++;
  if (success) {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    testResults.errors.push(`❌ ${name}: ${details}`);
    console.log(`❌ ${name}: ${details}`);
  }
}

async function makeRequest(endpoint, options = {}) {
  const url = `${baseURL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock_auth_token'
    }
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  if (mergedOptions.body && typeof mergedOptions.body === 'object') {
    mergedOptions.body = JSON.stringify(mergedOptions.body);
  }

  try {
    const response = await fetch(url, mergedOptions);
    const data = await response.json();
    return { response, data };
  } catch (error) {
    throw new Error(`Network error: ${error.message}`);
  }
}

/**
 * PRAYER REQUESTS API TESTS
 */
async function testPrayerRequestsAPI() {
  console.log('\n🙏 === PRAYER REQUESTS API TESTS ===');

  // Test 1: List all prayer requests
  try {
    const { response, data } = await makeRequest('/api/care/prayer-requests');
    logTest('GET /api/care/prayer-requests - List all', 
      response.ok && data.prayerRequests && Array.isArray(data.prayerRequests));
  } catch (error) {
    logTest('GET /api/care/prayer-requests - List all', false, error.message);
  }

  // Test 2: Filter prayer requests by category
  try {
    const { response, data } = await makeRequest('/api/care/prayer-requests?category=health&status=active');
    logTest('GET /api/care/prayer-requests - Filter by category/status', 
      response.ok && data.prayerRequests);
  } catch (error) {
    logTest('GET /api/care/prayer-requests - Filter by category/status', false, error.message);
  }

  // Test 3: Get single prayer request
  try {
    const { response, data } = await makeRequest('/api/care/prayer-requests/prayer-1');
    logTest('GET /api/care/prayer-requests/:id - Single request', 
      response.ok && data.id && data.title);
  } catch (error) {
    logTest('GET /api/care/prayer-requests/:id - Single request', false, error.message);
  }

  // Test 4: Create new prayer request
  try {
    const newRequest = {
      title: 'Test Prayer Request',
      description: 'Integration test prayer request',
      category: 'spiritual',
      priority: 'normal',
      isPrivate: false
    };
    const { response, data } = await makeRequest('/api/care/prayer-requests', {
      method: 'POST',
      body: newRequest
    });
    logTest('POST /api/care/prayer-requests - Create new', 
      response.status === 201 && data.id && data.title === newRequest.title);
  } catch (error) {
    logTest('POST /api/care/prayer-requests - Create new', false, error.message);
  }

  // Test 5: Update prayer request
  try {
    const updateData = {
      status: 'resolved',
      notes: 'Prayer answered!'
    };
    const { response, data } = await makeRequest('/api/care/prayer-requests/prayer-1', {
      method: 'PUT',
      body: updateData
    });
    logTest('PUT /api/care/prayer-requests/:id - Update', 
      response.ok && data.id);
  } catch (error) {
    logTest('PUT /api/care/prayer-requests/:id - Update', false, error.message);
  }

  // Test 6: Add update to prayer request
  try {
    const updateContent = {
      content: 'Great progress on this prayer request!',
      isPublic: true
    };
    const { response, data } = await makeRequest('/api/care/prayer-requests/prayer-1/update', {
      method: 'POST',
      body: updateContent
    });
    logTest('POST /api/care/prayer-requests/:id/update - Add update', 
      response.status === 201 && data.success);
  } catch (error) {
    logTest('POST /api/care/prayer-requests/:id/update - Add update', false, error.message);
  }

  // Test 7: Get prayer request categories
  try {
    const { response, data } = await makeRequest('/api/care/prayer-requests/categories');
    logTest('GET /api/care/prayer-requests/categories', 
      response.ok && data.categories && Array.isArray(data.categories));
  } catch (error) {
    logTest('GET /api/care/prayer-requests/categories', false, error.message);
  }

  // Test 8: Get prayer request statistics
  try {
    const { response, data } = await makeRequest('/api/care/prayer-requests/stats');
    logTest('GET /api/care/prayer-requests/stats', 
      response.ok && data.totalRequests !== undefined && data.activeRequests !== undefined);
  } catch (error) {
    logTest('GET /api/care/prayer-requests/stats', false, error.message);
  }

  // Test 9: Delete prayer request
  try {
    const { response, data } = await makeRequest('/api/care/prayer-requests/prayer-test', {
      method: 'DELETE'
    });
    logTest('DELETE /api/care/prayer-requests/:id - Delete', 
      response.ok && data.success);
  } catch (error) {
    logTest('DELETE /api/care/prayer-requests/:id - Delete', false, error.message);
  }
}

/**
 * CARE RECORDS API TESTS
 */
async function testCareRecordsAPI() {
  console.log('\n💙 === CARE RECORDS API TESTS ===');

  // Test 1: List all care records
  try {
    const { response, data } = await makeRequest('/api/care/records');
    logTest('GET /api/care/records - List all', 
      response.ok && data.careRecords && Array.isArray(data.careRecords));
  } catch (error) {
    logTest('GET /api/care/records - List all', false, error.message);
  }

  // Test 2: Filter care records by member and type
  try {
    const { response, data } = await makeRequest('/api/care/records?memberId=member-1&careType=hospital');
    logTest('GET /api/care/records - Filter by member/type', 
      response.ok && data.careRecords);
  } catch (error) {
    logTest('GET /api/care/records - Filter by member/type', false, error.message);
  }

  // Test 3: Get single care record
  try {
    const { response, data } = await makeRequest('/api/care/records/care-1');
    logTest('GET /api/care/records/:id - Single record', 
      response.ok && data.id && data.subject);
  } catch (error) {
    logTest('GET /api/care/records/:id - Single record', false, error.message);
  }

  // Test 4: Create new care record
  try {
    const newRecord = {
      memberId: 'member-test',
      memberName: 'Test Member',
      careType: 'call',
      subject: 'Test Care Call',
      notes: 'Integration test care record',
      priority: 'normal'
    };
    const { response, data } = await makeRequest('/api/care/records', {
      method: 'POST',
      body: newRecord
    });
    logTest('POST /api/care/records - Create new', 
      response.status === 201 && data.id && data.subject === newRecord.subject);
  } catch (error) {
    logTest('POST /api/care/records - Create new', false, error.message);
  }

  // Test 5: Update care record
  try {
    const updateData = {
      notes: 'Updated notes for integration test',
      status: 'completed'
    };
    const { response, data } = await makeRequest('/api/care/records/care-1', {
      method: 'PUT',
      body: updateData
    });
    logTest('PUT /api/care/records/:id - Update', 
      response.ok && data.id);
  } catch (error) {
    logTest('PUT /api/care/records/:id - Update', false, error.message);
  }

  // Test 6: Delete care record
  try {
    const { response, data } = await makeRequest('/api/care/records/care-test', {
      method: 'DELETE'
    });
    logTest('DELETE /api/care/records/:id - Delete', 
      response.ok && data.success);
  } catch (error) {
    logTest('DELETE /api/care/records/:id - Delete', false, error.message);
  }
}

/**
 * COUNSELING SESSIONS API TESTS
 */
async function testCounselingSessionsAPI() {
  console.log('\n🗓️ === COUNSELING SESSIONS API TESTS ===');

  // Test 1: List all counseling sessions
  try {
    const { response, data } = await makeRequest('/api/care/counseling-sessions');
    logTest('GET /api/care/counseling-sessions - List all', 
      response.ok && data.counselingSessions && Array.isArray(data.counselingSessions));
  } catch (error) {
    logTest('GET /api/care/counseling-sessions - List all', false, error.message);
  }

  // Test 2: Filter sessions by counselor and status
  try {
    const { response, data } = await makeRequest('/api/care/counseling-sessions?counselorId=counselor-1&status=scheduled');
    logTest('GET /api/care/counseling-sessions - Filter by counselor/status', 
      response.ok && data.counselingSessions);
  } catch (error) {
    logTest('GET /api/care/counseling-sessions - Filter by counselor/status', false, error.message);
  }

  // Test 3: Get single counseling session
  try {
    const { response, data } = await makeRequest('/api/care/counseling-sessions/session-1');
    logTest('GET /api/care/counseling-sessions/:id - Single session', 
      response.ok && data.id && data.sessionType);
  } catch (error) {
    logTest('GET /api/care/counseling-sessions/:id - Single session', false, error.message);
  }

  // Test 4: Schedule new counseling session
  try {
    const newSession = {
      memberId: 'member-test',
      memberName: 'Test Member',
      counselorId: 'counselor-1',
      sessionType: 'individual',
      sessionDate: '2025-02-01T10:00:00Z',
      subject: 'Test Counseling Session'
    };
    const { response, data } = await makeRequest('/api/care/counseling-sessions', {
      method: 'POST',
      body: newSession
    });
    logTest('POST /api/care/counseling-sessions - Schedule new', 
      response.status === 201 && data.id && data.sessionType === newSession.sessionType);
  } catch (error) {
    logTest('POST /api/care/counseling-sessions - Schedule new', false, error.message);
  }

  // Test 5: Update counseling session
  try {
    const updateData = {
      notes: 'Session completed successfully',
      status: 'completed'
    };
    const { response, data } = await makeRequest('/api/care/counseling-sessions/session-1', {
      method: 'PUT',
      body: updateData
    });
    logTest('PUT /api/care/counseling-sessions/:id - Update', 
      response.ok && data.id);
  } catch (error) {
    logTest('PUT /api/care/counseling-sessions/:id - Update', false, error.message);
  }

  // Test 6: Get counseling session types
  try {
    const { response, data } = await makeRequest('/api/care/counseling-sessions/types');
    logTest('GET /api/care/counseling-sessions/types', 
      response.ok && data.sessionTypes && Array.isArray(data.sessionTypes));
  } catch (error) {
    logTest('GET /api/care/counseling-sessions/types', false, error.message);
  }

  // Test 7: Cancel counseling session
  try {
    const { response, data } = await makeRequest('/api/care/counseling-sessions/session-test', {
      method: 'DELETE'
    });
    logTest('DELETE /api/care/counseling-sessions/:id - Cancel', 
      response.ok && data.success);
  } catch (error) {
    logTest('DELETE /api/care/counseling-sessions/:id - Cancel', false, error.message);
  }
}

/**
 * MEMBER CARE HISTORY API TESTS
 */
async function testMemberCareHistoryAPI() {
  console.log('\n📋 === MEMBER CARE HISTORY API TESTS ===');

  // Test 1: Get member care history
  try {
    const { response, data } = await makeRequest('/api/care/member/member-1/history');
    logTest('GET /api/care/member/:id/history - Full history', 
      response.ok && data.member && data.careHistory && Array.isArray(data.careHistory));
  } catch (error) {
    logTest('GET /api/care/member/:id/history - Full history', false, error.message);
  }

  // Test 2: Get filtered member care history
  try {
    const { response, data } = await makeRequest('/api/care/member/member-1/history?type=prayer_request&limit=5');
    logTest('GET /api/care/member/:id/history - Filtered', 
      response.ok && data.careHistory && data.pagination);
  } catch (error) {
    logTest('GET /api/care/member/:id/history - Filtered', false, error.message);
  }
}

/**
 * CARE DASHBOARD API TESTS
 */
async function testCareDashboardAPI() {
  console.log('\n🎯 === CARE DASHBOARD API TESTS ===');

  // Test 1: Get care dashboard overview
  try {
    const { response, data } = await makeRequest('/api/care/dashboard');
    logTest('GET /api/care/dashboard - Overview', 
      response.ok && data.overview && data.recentActivity && Array.isArray(data.recentActivity));
  } catch (error) {
    logTest('GET /api/care/dashboard - Overview', false, error.message);
  }

  // Test 2: Get detailed care statistics
  try {
    const { response, data } = await makeRequest('/api/care/dashboard/stats?timeRange=30days');
    logTest('GET /api/care/dashboard/stats - Detailed stats', 
      response.ok && data.prayerRequests && data.counselingSessions && data.careRecords);
  } catch (error) {
    logTest('GET /api/care/dashboard/stats - Detailed stats', false, error.message);
  }
}

/**
 * VALIDATION TESTS
 */
async function testValidationAndErrors() {
  console.log('\n⚠️ === VALIDATION AND ERROR TESTS ===');

  // Test 1: Create prayer request without required fields
  try {
    const { response } = await makeRequest('/api/care/prayer-requests', {
      method: 'POST',
      body: { description: 'Missing title' }
    });
    logTest('POST /api/care/prayer-requests - Validation error', 
      response.status === 400);
  } catch (error) {
    logTest('POST /api/care/prayer-requests - Validation error', false, error.message);
  }

  // Test 2: Create care record without required fields
  try {
    const { response } = await makeRequest('/api/care/records', {
      method: 'POST',
      body: { memberId: 'test' }
    });
    logTest('POST /api/care/records - Validation error', 
      response.status === 400);
  } catch (error) {
    logTest('POST /api/care/records - Validation error', false, error.message);
  }

  // Test 3: Create counseling session without required fields
  try {
    const { response } = await makeRequest('/api/care/counseling-sessions', {
      method: 'POST',
      body: { memberId: 'test' }
    });
    logTest('POST /api/care/counseling-sessions - Validation error', 
      response.status === 400);
  } catch (error) {
    logTest('POST /api/care/counseling-sessions - Validation error', false, error.message);
  }
}

/**
 * FRONTEND COMPATIBILITY TESTS
 */
async function testFrontendCompatibility() {
  console.log('\n🎨 === FRONTEND COMPATIBILITY TESTS ===');

  // Test data structure compatibility with expected frontend interfaces
  try {
    const { response, data } = await makeRequest('/api/care/prayer-requests?limit=1');
    if (response.ok && data.prayerRequests?.[0]) {
      const request = data.prayerRequests[0];
      const hasRequiredFields = request.id && request.title && request.description && 
        request.category && request.priority && request.status !== undefined;
      logTest('Prayer Request - Frontend interface compatibility', hasRequiredFields);
    }
  } catch (error) {
    logTest('Prayer Request - Frontend interface compatibility', false, error.message);
  }

  try {
    const { response, data } = await makeRequest('/api/care/records?limit=1');
    if (response.ok && data.careRecords?.[0]) {
      const record = data.careRecords[0];
      const hasRequiredFields = record.id && record.memberId && record.careType && 
        record.subject && record.notes && record.careProvider;
      logTest('Care Record - Frontend interface compatibility', hasRequiredFields);
    }
  } catch (error) {
    logTest('Care Record - Frontend interface compatibility', false, error.message);
  }

  try {
    const { response, data } = await makeRequest('/api/care/counseling-sessions?limit=1');
    if (response.ok && data.counselingSessions?.[0]) {
      const session = data.counselingSessions[0];
      const hasRequiredFields = session.id && session.memberId && session.counselorId && 
        session.sessionType && session.sessionDate && session.status;
      logTest('Counseling Session - Frontend interface compatibility', hasRequiredFields);
    }
  } catch (error) {
    logTest('Counseling Session - Frontend interface compatibility', false, error.message);
  }
}

/**
 * PERFORMANCE TESTS
 */
async function testPerformance() {
  console.log('\n⚡ === PERFORMANCE TESTS ===');

  // Test response time for list endpoints
  const endpoints = [
    '/api/care/prayer-requests',
    '/api/care/records', 
    '/api/care/counseling-sessions',
    '/api/care/dashboard'
  ];

  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      const { response } = await makeRequest(endpoint);
      const duration = Date.now() - startTime;
      
      logTest(`${endpoint} - Response time < 500ms`, 
        response.ok && duration < 500,
        duration > 500 ? `${duration}ms` : '');
    } catch (error) {
      logTest(`${endpoint} - Performance test`, false, error.message);
    }
  }
}

/**
 * MAIN TEST RUNNER
 */
async function runAllTests() {
  console.log('🤲 FaithLink360 - Pastoral Care Module Integration Tests');
  console.log('================================================================');

  try {
    await testPrayerRequestsAPI();
    await testCareRecordsAPI();
    await testCounselingSessionsAPI();
    await testMemberCareHistoryAPI();
    await testCareDashboardAPI();
    await testValidationAndErrors();
    await testFrontendCompatibility();
    await testPerformance();

    // Final results
    console.log('\n📊 === TEST RESULTS SUMMARY ===');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

    if (testResults.failed > 0) {
      console.log('\n❌ Failed Tests:');
      testResults.errors.forEach(error => console.log(`  ${error}`));
    }

    const isSuccess = testResults.failed === 0 && testResults.passed > 0;
    console.log(`\n${isSuccess ? '🎉' : '💥'} Pastoral Care Module: ${isSuccess ? 'PRODUCTION READY' : 'NEEDS FIXES'}`);

    return isSuccess;

  } catch (error) {
    console.error('❌ Test suite failed to run:', error.message);
    return false;
  }
}

// Check if fetch is available (Node.js compatibility)
if (typeof fetch === 'undefined') {
  console.error('❌ fetch is not available. Please run: npm install node-fetch');
  console.error('Or use: node --experimental-fetch pastoral-care-integration-test.js');
  process.exit(1);
}

// Run tests
runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
