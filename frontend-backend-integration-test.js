/**
 * Frontend-Backend Integration Verification Test
 * Tests actual API calls that frontend makes to backend
 */

const fetch = require('node-fetch');

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:8000';
const AUTH_TOKEN = 'mock_token_admin';

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function logResult(testName, success, details = '') {
  totalTests++;
  if (success) {
    passedTests++;
    console.log(`✅ ${testName}`);
  } else {
    failedTests++;
    console.log(`❌ ${testName} - ${details}`);
  }
}

async function testBackendEndpoint(endpoint, method = 'GET', data = null) {
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

    const response = await fetch(`${BACKEND_URL}${endpoint}`, options);
    return {
      success: response.ok,
      status: response.status,
      data: response.ok ? await response.json() : null
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error.message
    };
  }
}

async function testJourneyTemplateBackendFlow() {
  console.log('\n🌟 Testing Journey Template Backend Flow...');
  
  // Test GET templates
  const getResult = await testBackendEndpoint('/api/journey-templates');
  logResult('Journey Templates: GET /api/journey-templates', getResult.success, 
    getResult.success ? '' : `Status: ${getResult.status}`);
  
  // Test POST create template
  const createData = {
    title: 'Backend Test Template',
    description: 'Test template created by backend integration test',
    category: 'spiritual-growth',
    difficulty: 'beginner',
    estimatedDuration: 4,
    isActive: true,
    milestones: [
      {
        title: 'Getting Started',
        description: 'Introduction to the journey',
        order: 1,
        isRequired: true,
        estimatedDays: 7
      }
    ]
  };
  
  const createResult = await testBackendEndpoint('/api/journey-templates', 'POST', createData);
  logResult('Journey Templates: POST create template', createResult.success,
    createResult.success ? '' : `Status: ${createResult.status}`);
  
  if (createResult.success && createResult.data) {
    const templateId = createResult.data.id;
    
    // Test GET specific template
    const getSpecificResult = await testBackendEndpoint(`/api/journey-templates/${templateId}`);
    logResult('Journey Templates: GET specific template', getSpecificResult.success,
      getSpecificResult.success ? '' : `Status: ${getSpecificResult.status}`);
    
    return templateId;
  }
  
  return null;
}

async function testCriticalEndpoints() {
  console.log('\n🔍 Testing Critical Frontend-Backend Endpoints...');
  
  const criticalEndpoints = [
    { endpoint: '/api/auth/me', name: 'Auth: Current User' },
    { endpoint: '/api/members', name: 'Members: List' },
    { endpoint: '/api/members/stats', name: 'Members: Statistics' },
    { endpoint: '/api/groups', name: 'Groups: List' },
    { endpoint: '/api/groups/stats', name: 'Groups: Statistics' },
    { endpoint: '/api/events', name: 'Events: List' },
    { endpoint: '/api/journey-templates', name: 'Journey Templates: List' },
    { endpoint: '/api/journeys/member-journeys', name: 'Member Journeys' },
    { endpoint: '/api/care/prayer-requests', name: 'Prayer Requests' },
    { endpoint: '/api/tasks', name: 'Tasks: List' },
    { endpoint: '/api/communications/campaigns', name: 'Communications' },
    { endpoint: '/api/reports/dashboard', name: 'Dashboard Reports' },
    { endpoint: '/api/attendance', name: 'Attendance Sessions' },
    { endpoint: '/api/attendance/stats', name: 'Attendance Stats' }
  ];
  
  for (const test of criticalEndpoints) {
    const result = await testBackendEndpoint(test.endpoint);
    logResult(test.name, result.success, 
      result.success ? '' : `Status: ${result.status} - ${result.error || 'Unknown error'}`);
  }
}

async function testFrontendAccessibility() {
  console.log('\n🌐 Testing Frontend Server Accessibility...');
  
  try {
    const response = await fetch(FRONTEND_URL);
    logResult('Frontend: Server Accessible', response.ok, 
      response.ok ? '' : `Status: ${response.status}`);
  } catch (error) {
    logResult('Frontend: Server Accessible', false, error.message);
  }
}

async function runIntegrationTests() {
  console.log('🚀 Starting Frontend-Backend Integration Test Suite');
  console.log('====================================================');
  
  await testFrontendAccessibility();
  await testCriticalEndpoints();
  const templateId = await testJourneyTemplateBackendFlow();
  
  console.log('\n====================================================');
  console.log('🏁 INTEGRATION TEST RESULTS');
  console.log('====================================================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📊 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (failedTests > 0) {
    console.log('\n⚠️ CRITICAL: Frontend-Backend integration has issues!');
    console.log('The platform is NOT ready for production until these are resolved.');
  } else {
    console.log('\n✅ All integration tests passed!');
    console.log('Backend API layer is solid and ready for frontend integration.');
  }
  
  return {
    totalTests,
    passedTests,
    failedTests,
    successRate: Math.round((passedTests / totalTests) * 100)
  };
}

module.exports = { runIntegrationTests };

if (require.main === module) {
  runIntegrationTests();
}
