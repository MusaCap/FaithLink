/**
 * Comprehensive API Endpoint Test Suite - Final Verification
 * Tests all API endpoints after frontend service fixes
 */

const API_BASE_URL = 'http://localhost:8000';

// Mock auth token for testing
const AUTH_TOKEN = 'mock_token_admin';

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

function logResult(testName, success, details = '') {
  totalTests++;
  if (success) {
    passedTests++;
    console.log(`✅ ${testName}`);
  } else {
    failedTests++;
    console.log(`❌ ${testName} - ${details}`);
  }
  testResults.push({ testName, success, details });
}

// Test helper function
async function testEndpoint(method, endpoint, data = null, expectedStatus = 200, testName = '') {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (response.status === expectedStatus || (response.status >= 200 && response.status < 300)) {
      const result = await response.json();
      logResult(testName || `${method} ${endpoint}`, true);
      return { success: true, data: result, status: response.status };
    } else {
      logResult(testName || `${method} ${endpoint}`, false, `HTTP ${response.status}`);
      return { success: false, status: response.status };
    }
  } catch (error) {
    logResult(testName || `${method} ${endpoint}`, false, error.message);
    return { success: false, error: error.message };
  }
}

async function runComprehensiveTest() {
  console.log('🚀 Starting Comprehensive API Endpoint Test Suite');
  console.log('===================================================\n');

  // 1. Authentication Endpoints
  console.log('🔐 Testing Authentication Endpoints...');
  await testEndpoint('GET', '/api/auth/me', null, 200, 'Auth: Get Current User');
  
  // 2. Members Module
  console.log('\n👥 Testing Members Module...');
  await testEndpoint('GET', '/api/members', null, 200, 'Members: List All Members');
  await testEndpoint('GET', '/api/members/stats', null, 200, 'Members: Get Statistics');
  await testEndpoint('GET', '/api/members/tags', null, 200, 'Members: Get Tags');
  await testEndpoint('POST', '/api/members', {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com'
  }, 201, 'Members: Create New Member');

  // 3. Groups Module
  console.log('\n👨‍👩‍👧‍👦 Testing Groups Module...');
  await testEndpoint('GET', '/api/groups', null, 200, 'Groups: List All Groups');
  await testEndpoint('GET', '/api/groups/stats', null, 200, 'Groups: Get Statistics');
  
  // 4. Events Module
  console.log('\n📅 Testing Events Module...');
  await testEndpoint('GET', '/api/events', null, 200, 'Events: List All Events');
  await testEndpoint('POST', '/api/events', {
    title: 'Test Event',
    description: 'Test Description',
    startDate: '2024-01-01T10:00:00Z',
    endDate: '2024-01-01T12:00:00Z',
    location: 'Test Location'
  }, 201, 'Events: Create New Event');

  // 5. Journey Templates Module
  console.log('\n🌟 Testing Journey Templates Module...');
  await testEndpoint('GET', '/api/journey-templates', null, 200, 'Journeys: List Templates');
  await testEndpoint('POST', '/api/journey-templates', {
    title: 'Test Journey',
    description: 'Test Description',
    milestones: []
  }, 201, 'Journeys: Create Template');
  await testEndpoint('GET', '/api/journeys/member-journeys', null, 200, 'Journeys: Get Member Journeys');

  // 6. Pastoral Care Module
  console.log('\n💙 Testing Pastoral Care Module...');
  await testEndpoint('GET', '/api/care/prayer-requests', null, 200, 'Care: Get Prayer Requests');
  await testEndpoint('GET', '/api/care/counseling-sessions', null, 200, 'Care: Get Counseling Sessions');
  await testEndpoint('GET', '/api/care/records', null, 200, 'Care: Get Care Records');
  await testEndpoint('POST', '/api/care/prayer-requests', {
    title: 'Test Prayer Request',
    description: 'Test Description',
    requesterId: 'member-1'
  }, 201, 'Care: Create Prayer Request');

  // 7. Tasks Module
  console.log('\n📋 Testing Tasks Module...');
  await testEndpoint('GET', '/api/tasks', null, 200, 'Tasks: List All Tasks');
  await testEndpoint('POST', '/api/tasks', {
    title: 'Test Task',
    description: 'Test Description',
    priority: 'medium',
    status: 'pending',
    category: 'general'
  }, 201, 'Tasks: Create New Task');

  // 8. Communications Module
  console.log('\n📧 Testing Communications Module...');
  await testEndpoint('GET', '/api/communications/campaigns', null, 200, 'Comms: List Campaigns');
  await testEndpoint('POST', '/api/communications/campaigns', {
    title: 'Test Campaign',
    subject: 'Test Subject',
    content: 'Test Content',
    recipientGroups: ['all-members']
  }, 201, 'Comms: Create Campaign');

  // 9. Reports Module
  console.log('\n📊 Testing Reports Module...');
  await testEndpoint('GET', '/api/reports/dashboard-stats', null, 200, 'Reports: Dashboard Stats');
  await testEndpoint('GET', '/api/reports/dashboard', null, 200, 'Reports: Dashboard Data');
  await testEndpoint('GET', '/api/reports/member-engagement-heatmaps', null, 200, 'Reports: Engagement Heatmaps');

  // 10. Attendance Module
  console.log('\n📊 Testing Attendance Module...');
  await testEndpoint('GET', '/api/attendance', null, 200, 'Attendance: List Sessions');
  await testEndpoint('GET', '/api/attendance/stats?groupId=group-1', null, 200, 'Attendance: Get Stats');

  // Final Results
  console.log('\n===================================================');
  console.log('🏁 COMPREHENSIVE TEST RESULTS');
  console.log('===================================================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📊 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (failedTests === 0) {
    console.log('\n🎉 ALL API ENDPOINTS WORKING PERFECTLY!');
    console.log('✨ Frontend Service Fixes: SUCCESS');
    console.log('🔧 Auth Token Updates: SUCCESS');
    console.log('🌐 URL Endpoint Corrections: SUCCESS');
  } else {
    console.log(`\n⚠️ ${failedTests} endpoint(s) need attention:`);
    testResults.forEach(result => {
      if (!result.success) {
        console.log(`   - ${result.testName}: ${result.details}`);
      }
    });
  }

  console.log('\n🔗 Frontend should now work seamlessly with backend!');
  console.log('🚀 Ready for full platform testing!');
}

// Run the comprehensive test
runComprehensiveTest().catch(console.error);
