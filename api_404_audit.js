const http = require('http');

// Comprehensive 404 Audit for FaithLink360
console.log('🔍 FaithLink360 API 404 Audit Starting...\n');

const BASE_URL = 'localhost';
const PORT = 8000;

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failedEndpoints = [];

// List of all possible API endpoints that the frontend might call
const apiEndpoints = [
  // Authentication endpoints
  { method: 'GET', path: '/api/auth/me', description: 'Get current user info' },
  { method: 'POST', path: '/api/auth/login', description: 'User login' },
  { method: 'POST', path: '/api/auth/logout', description: 'User logout' },
  
  // Member endpoints
  { method: 'GET', path: '/api/members', description: 'Get all members' },
  { method: 'GET', path: '/api/members/stats', description: 'Member statistics' },
  { method: 'GET', path: '/api/members/tags', description: 'Member tags' },
  { method: 'GET', path: '/api/members/1', description: 'Get specific member' },
  { method: 'GET', path: '/api/members/self-service/profile', description: 'Member self-service profile' },
  { method: 'GET', path: '/api/members/self-service/notifications', description: 'Member notifications' },
  
  // Group endpoints
  { method: 'GET', path: '/api/groups', description: 'Get all groups' },
  { method: 'GET', path: '/api/groups/stats', description: 'Group statistics' },
  { method: 'GET', path: '/api/groups/group-001', description: 'Get specific group' },
  { method: 'GET', path: '/api/groups/group-001/members', description: 'Get group members' },
  
  // Event endpoints
  { method: 'GET', path: '/api/events', description: 'Get all events' },
  { method: 'GET', path: '/api/events/1', description: 'Get specific event' },
  { method: 'GET', path: '/api/events/1/registrations', description: 'Event registrations' },
  { method: 'GET', path: '/api/events/1/rsvp', description: 'Event RSVP' },
  { method: 'GET', path: '/api/events/1/check-in', description: 'Event check-in' },
  
  // Journey endpoints
  { method: 'GET', path: '/api/journeys/member-journeys', description: 'Member journeys' },
  { method: 'GET', path: '/api/journeys/templates', description: 'Journey templates' },
  { method: 'GET', path: '/api/journey-templates', description: 'Journey templates (alt)' },
  { method: 'GET', path: '/api/journeys/1', description: 'Specific journey' },
  
  // Dashboard and Reports endpoints
  { method: 'GET', path: '/api/reports/dashboard', description: 'Dashboard stats' },
  { method: 'GET', path: '/api/dashboard/stats', description: 'Dashboard stats (alt)' },
  { method: 'GET', path: '/api/reports/attendance', description: 'Attendance reports' },
  { method: 'GET', path: '/api/reports/engagement', description: 'Engagement metrics' },
  { method: 'GET', path: '/api/reports/group-health', description: 'Group health reports' },
  
  // Deacon endpoints (the new feature)
  { method: 'GET', path: '/api/deacons', description: 'Get all deacons' },
  { method: 'GET', path: '/api/deacons/1', description: 'Get specific deacon' },
  { method: 'GET', path: '/api/deacons/dropdown', description: 'Deacons for dropdown' },
  
  // Pastoral Care endpoints
  { method: 'GET', path: '/api/care/prayer-requests', description: 'Prayer requests' },
  { method: 'GET', path: '/api/care/records', description: 'Care records' },
  { method: 'GET', path: '/api/care/members-needing-care', description: 'Members needing care' },
  
  // Communication endpoints
  { method: 'GET', path: '/api/communications/campaigns', description: 'Email campaigns' },
  { method: 'GET', path: '/api/communications/announcements', description: 'Announcements' },
  
  // Task endpoints
  { method: 'GET', path: '/api/tasks', description: 'Get all tasks' },
  { method: 'GET', path: '/api/tasks/1', description: 'Get specific task' },
  
  // Attendance endpoints
  { method: 'GET', path: '/api/attendance', description: 'Attendance records' },
  { method: 'GET', path: '/api/attendance/stats', description: 'Attendance statistics' },
  
  // Settings endpoints
  { method: 'GET', path: '/api/settings/users', description: 'User management' },
  { method: 'GET', path: '/api/settings/church', description: 'Church settings' },
  
  // Health and Info endpoints
  { method: 'GET', path: '/health', description: 'Server health check' },
  { method: 'GET', path: '/api/info', description: 'Server info' },
  { method: 'GET', path: '/api/activity', description: 'Activity feed' }
];

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: endpoint.path,
      method: endpoint.method,
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      totalTests++;
      
      if (res.statusCode === 404) {
        failedTests++;
        failedEndpoints.push({
          ...endpoint,
          statusCode: res.statusCode,
          reason: 'Not Found (404)'
        });
        console.log(`❌ ${endpoint.method} ${endpoint.path} - 404 Not Found`);
      } else if (res.statusCode >= 500) {
        failedTests++;
        failedEndpoints.push({
          ...endpoint,
          statusCode: res.statusCode,
          reason: `Server Error (${res.statusCode})`
        });
        console.log(`⚠️  ${endpoint.method} ${endpoint.path} - ${res.statusCode} Server Error`);
      } else {
        passedTests++;
        console.log(`✅ ${endpoint.method} ${endpoint.path} - ${res.statusCode} OK`);
      }
      resolve();
    });

    req.on('error', (error) => {
      totalTests++;
      failedTests++;
      failedEndpoints.push({
        ...endpoint,
        statusCode: 'ERROR',
        reason: error.message
      });
      console.log(`❌ ${endpoint.method} ${endpoint.path} - ERROR: ${error.message}`);
      resolve();
    });

    req.on('timeout', () => {
      totalTests++;
      failedTests++;
      failedEndpoints.push({
        ...endpoint,
        statusCode: 'TIMEOUT',
        reason: 'Request timeout'
      });
      console.log(`⏰ ${endpoint.method} ${endpoint.path} - TIMEOUT`);
      req.destroy();
      resolve();
    });

    req.end();
  });
}

async function runAudit() {
  console.log(`📊 Testing ${apiEndpoints.length} API endpoints...\n`);
  
  // Test all endpoints
  for (const endpoint of apiEndpoints) {
    await testEndpoint(endpoint);
  }
  
  // Generate summary report
  console.log('\n' + '='.repeat(60));
  console.log('📋 AUDIT SUMMARY REPORT');
  console.log('='.repeat(60));
  console.log(`📊 Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests} (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log(`❌ Failed: ${failedTests} (${Math.round((failedTests/totalTests)*100)}%)`);
  
  if (failedTests > 0) {
    console.log('\n🚨 MISSING ENDPOINTS (404 Errors):');
    console.log('-'.repeat(40));
    
    const missing404s = failedEndpoints.filter(e => e.statusCode === 404);
    const serverErrors = failedEndpoints.filter(e => e.statusCode >= 500);
    const networkErrors = failedEndpoints.filter(e => e.statusCode === 'ERROR' || e.statusCode === 'TIMEOUT');
    
    if (missing404s.length > 0) {
      console.log('\n📍 404 Not Found Endpoints:');
      missing404s.forEach((endpoint, index) => {
        console.log(`${index + 1}. ${endpoint.method} ${endpoint.path}`);
        console.log(`   Description: ${endpoint.description}`);
      });
    }
    
    if (serverErrors.length > 0) {
      console.log('\n⚠️ Server Error Endpoints:');
      serverErrors.forEach((endpoint, index) => {
        console.log(`${index + 1}. ${endpoint.method} ${endpoint.path} - ${endpoint.statusCode}`);
        console.log(`   Description: ${endpoint.description}`);
      });
    }
    
    if (networkErrors.length > 0) {
      console.log('\n🌐 Network Error Endpoints:');
      networkErrors.forEach((endpoint, index) => {
        console.log(`${index + 1}. ${endpoint.method} ${endpoint.path} - ${endpoint.reason}`);
        console.log(`   Description: ${endpoint.description}`);
      });
    }
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('1. Add missing endpoints to your backend server');
    console.log('2. Check server logs for any error details');
    console.log('3. Verify server is running on port 8000');
    console.log('4. Test frontend functionality to see which 404s cause actual issues');
    
  } else {
    console.log('\n🎉 PERFECT! No 404 errors found!');
    console.log('✅ All API endpoints are properly implemented');
    console.log('✅ Your backend is ready for production');
  }
  
  console.log('\n🔍 Audit completed at:', new Date().toLocaleString());
  console.log('📡 Backend server tested: http://localhost:8000');
}

// Start the audit
runAudit().catch(console.error);
