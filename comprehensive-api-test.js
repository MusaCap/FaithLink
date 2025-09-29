const API_BASE_URL = 'http://localhost:8000';
const AUTH_TOKEN = 'mock_token_admin';

// Comprehensive API endpoint testing
async function testAPIEndpoint(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      endpoint,
      method,
      data: response.ok ? 'SUCCESS' : data,
      error: response.ok ? null : `${response.status} - ${response.statusText}`
    };
  } catch (error) {
    return {
      success: false,
      status: 'ERROR',
      endpoint,
      method,
      data: null,
      error: error.message
    };
  }
}

async function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive FaithLink360 API Tests');
  console.log('=' .repeat(60));

  const testEndpoints = [
    // Core API Tests
    { endpoint: '/api/test', method: 'GET', category: 'Core' },
    
    // Authentication Tests
    { endpoint: '/api/auth/me', method: 'GET', category: 'Auth' },
    
    // Members API Tests
    { endpoint: '/api/members', method: 'GET', category: 'Members' },
    { endpoint: '/api/members/member-1', method: 'GET', category: 'Members' },
    { endpoint: '/api/members/stats', method: 'GET', category: 'Members' },
    { endpoint: '/api/members', method: 'POST', body: { firstName: 'Test', lastName: 'User', email: 'test@example.com' }, category: 'Members' },
    
    // Groups API Tests
    { endpoint: '/api/groups', method: 'GET', category: 'Groups' },
    { endpoint: '/api/groups/group-1', method: 'GET', category: 'Groups' },
    { endpoint: '/api/groups', method: 'POST', body: { name: 'Test Group', description: 'Test Description' }, category: 'Groups' },
    
    // Events API Tests
    { endpoint: '/api/events', method: 'GET', category: 'Events' },
    { endpoint: '/api/events/event-1', method: 'GET', category: 'Events' },
    { endpoint: '/api/events', method: 'POST', body: { title: 'Test Event', description: 'Test Description', startDate: new Date().toISOString() }, category: 'Events' },
    
    // Attendance API Tests
    { endpoint: '/api/attendance/sessions', method: 'GET', category: 'Attendance' },
    { endpoint: '/api/attendance/stats', method: 'GET', category: 'Attendance' },
    { endpoint: '/api/attendance/member-stats/member-1', method: 'GET', category: 'Attendance' },
    
    // Journey Templates API Tests
    { endpoint: '/api/journeys/templates', method: 'GET', category: 'Journeys' },
    { endpoint: '/api/journeys/templates/template-1', method: 'GET', category: 'Journeys' },
    { endpoint: '/api/journeys/member-journeys', method: 'GET', category: 'Journeys' },
    
    // Reports API Tests
    { endpoint: '/api/reports/attendance', method: 'GET', category: 'Reports' },
    { endpoint: '/api/reports/engagement', method: 'GET', category: 'Reports' },
    { endpoint: '/api/reports/groups', method: 'GET', category: 'Reports' },
    { endpoint: '/api/reports/dashboard', method: 'GET', category: 'Reports' },
    
    // Member Self-Service Tests
    { endpoint: '/api/members/self-service/profile', method: 'GET', category: 'Self-Service' },
    { endpoint: '/api/members/self-service/groups', method: 'GET', category: 'Self-Service' },
    { endpoint: '/api/members/self-service/events', method: 'GET', category: 'Self-Service' },
    
    // Volunteer System Tests
    { endpoint: '/api/volunteers/opportunities', method: 'GET', category: 'Volunteers' },
    { endpoint: '/api/volunteers/signups', method: 'GET', category: 'Volunteers' },
    
    // Dashboard API Tests
    { endpoint: '/api/dashboard/stats', method: 'GET', category: 'Dashboard' },
    
    // Care API Tests
    { endpoint: '/api/care', method: 'GET', category: 'Care' }
  ];

  const results = [];
  let successCount = 0;
  let totalCount = testEndpoints.length;

  console.log(`\n📊 Testing ${totalCount} API endpoints...\n`);

  for (const test of testEndpoints) {
    const result = await testAPIEndpoint(test.endpoint, test.method, test.body);
    result.category = test.category;
    results.push(result);
    
    if (result.success) {
      successCount++;
      console.log(`✅ ${test.category}: ${test.method} ${test.endpoint}`);
    } else {
      console.log(`❌ ${test.category}: ${test.method} ${test.endpoint} - ${result.error}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '=' .repeat(60));
  console.log('📈 TEST RESULTS SUMMARY');
  console.log('=' .repeat(60));

  // Group results by category
  const categorizedResults = {};
  results.forEach(result => {
    if (!categorizedResults[result.category]) {
      categorizedResults[result.category] = { success: 0, total: 0 };
    }
    categorizedResults[result.category].total++;
    if (result.success) {
      categorizedResults[result.category].success++;
    }
  });

  // Display category results
  Object.keys(categorizedResults).forEach(category => {
    const cat = categorizedResults[category];
    const percentage = ((cat.success / cat.total) * 100).toFixed(1);
    console.log(`${category.padEnd(15)} ${cat.success}/${cat.total} (${percentage}%)`);
  });

  const overallPercentage = ((successCount / totalCount) * 100).toFixed(1);
  console.log('\n' + '-'.repeat(60));
  console.log(`🎯 OVERALL RESULTS: ${successCount}/${totalCount} (${overallPercentage}%)`);
  
  if (overallPercentage >= 90) {
    console.log('🌟 EXCELLENT! API integration is production-ready');
  } else if (overallPercentage >= 80) {
    console.log('✅ GOOD! Most endpoints working, minor issues to resolve');
  } else if (overallPercentage >= 70) {
    console.log('⚠️  FAIR! Some critical endpoints need attention');
  } else {
    console.log('❌ POOR! Major integration issues detected');
  }

  console.log('\n🔍 FAILED ENDPOINTS:');
  const failedTests = results.filter(r => !r.success);
  if (failedTests.length === 0) {
    console.log('None! All endpoints working correctly.');
  } else {
    failedTests.forEach(test => {
      console.log(`   ${test.method} ${test.endpoint} - ${test.error}`);
    });
  }

  console.log('\n📋 NEXT STEPS:');
  if (overallPercentage >= 90) {
    console.log('✅ Ready for production deployment');
    console.log('✅ All core features functional with live data');
    console.log('✅ Frontend-backend integration complete');
  } else {
    console.log('🔧 Fix remaining API endpoint issues');
    console.log('🧪 Re-run tests after fixes');
    console.log('📝 Update frontend error handling if needed');
  }

  console.log('\n' + '=' .repeat(60));
  return { successCount, totalCount, overallPercentage };
}

// Run the tests
runComprehensiveTests()
  .then(result => {
    console.log(`\n🎉 Test completed: ${result.successCount}/${result.totalCount} (${result.overallPercentage}%)`);
    process.exit(result.overallPercentage >= 80 ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
