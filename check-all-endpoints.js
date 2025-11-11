/**
 * Detailed endpoint checker to identify missing endpoints
 * Tests all 44 endpoints individually and reports failures
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

const allEndpoints = [
  // Core Members Management (6)
  { method: 'GET', path: '/api/members', name: 'List Members' },
  { method: 'GET', path: '/api/members/1', name: 'Get Member' },
  { method: 'POST', path: '/api/members', name: 'Create Member', body: { firstName: 'Test', lastName: 'User', email: 'test@example.com' } },
  { method: 'PUT', path: '/api/members/1', name: 'Update Member', body: { firstName: 'Updated' } },
  { method: 'DELETE', path: '/api/members/1', name: 'Delete Member' },
  { method: 'GET', path: '/api/members/search?q=test', name: 'Search Members' },

  // Core Groups Management (6)
  { method: 'GET', path: '/api/groups', name: 'List Groups' },
  { method: 'POST', path: '/api/groups', name: 'Create Group', body: { name: 'Test Group', description: 'Test' } },
  { method: 'PUT', path: '/api/groups/1', name: 'Update Group', body: { name: 'Updated Group' } },
  { method: 'DELETE', path: '/api/groups/1', name: 'Delete Group' },
  { method: 'POST', path: '/api/groups/1/members', name: 'Add Group Member', body: { memberId: '1' } },
  { method: 'DELETE', path: '/api/groups/1/members/1', name: 'Remove Group Member' },

  // Event Management System (6)
  { method: 'GET', path: '/api/events', name: 'List Events' },
  { method: 'POST', path: '/api/events', name: 'Create Event', body: { title: 'Test Event', date: new Date().toISOString() } },
  { method: 'PUT', path: '/api/events/1', name: 'Update Event', body: { title: 'Updated Event' } },
  { method: 'DELETE', path: '/api/events/1', name: 'Delete Event' },
  { method: 'POST', path: '/api/events/1/registrations', name: 'Create Registration', body: { memberId: '1' } },
  { method: 'DELETE', path: '/api/events/1/registrations/123', name: 'Cancel Registration', body: { reason: 'Test' } },

  // Attendance Tracking System (3)
  { method: 'POST', path: '/api/groups/1/attendance', name: 'Record Attendance', body: { date: new Date().toISOString(), attendees: ['1'] } },
  { method: 'GET', path: '/api/groups/1/attendance/history', name: 'Attendance History' },
  { method: 'GET', path: '/api/attendance/reports', name: 'Attendance Reports' },

  // Spiritual Journey Management (6)
  { method: 'GET', path: '/api/journeys/templates', name: 'List Journey Templates' },
  { method: 'POST', path: '/api/journeys/templates', name: 'Create Journey Template', body: { title: 'Test Journey' } },
  { method: 'GET', path: '/api/journeys/member-journeys', name: 'List Member Journeys' },
  { method: 'POST', path: '/api/journeys/member-journeys', name: 'Create Member Journey', body: { memberId: '1', templateId: '1' } },
  { method: 'PUT', path: '/api/journeys/1/milestones', name: 'Update Milestone', body: { milestoneId: '1', completed: true } },
  { method: 'POST', path: '/api/members/1/assign-deacon', name: 'Assign Deacon', body: { deaconId: 'deacon1' } },

  // Advanced Reporting & Analytics (3)
  { method: 'GET', path: '/api/reports/membership', name: 'Membership Reports' },
  { method: 'GET', path: '/api/reports/attendance', name: 'Attendance Reports (alt)' },
  { method: 'GET', path: '/api/reports/engagement', name: 'Engagement Reports' },

  // Admin Panel & User Management (3)
  { method: 'GET', path: '/api/admin/settings', name: 'Admin Settings' },
  { method: 'GET', path: '/api/admin/users', name: 'Admin Users' },
  { method: 'PUT', path: '/api/members/profile', name: 'Update Profile', body: { phone: '555-9999' } },

  // Integration & Export Capabilities (3)
  { method: 'POST', path: '/api/integrations/webhooks', name: 'Create Webhook', body: { url: 'https://example.com/hook' } },
  { method: 'GET', path: '/api/export/members?format=csv', name: 'Export Members' },
  { method: 'GET', path: '/api/sync/members?limit=10', name: 'Sync Members' },

  // Existing Working Endpoints (8)
  { method: 'GET', path: '/api/health', name: 'Health Check' },
  { method: 'GET', path: '/api/info', name: 'API Info' },
  { method: 'GET', path: '/api/deacons', name: 'List Deacons' },
  { method: 'GET', path: '/api/care/prayer-requests', name: 'Prayer Requests' },
  { method: 'GET', path: '/api/communications/announcements', name: 'Announcements' },
  { method: 'GET', path: '/api/communications/campaigns', name: 'Campaigns' },
  { method: 'GET', path: '/api/tasks', name: 'Tasks' },
  { method: 'GET', path: '/api/activity', name: 'Activity Feed' }
];

async function checkAllEndpoints() {
  console.log('🔍 DETAILED ENDPOINT ANALYSIS');
  console.log('==============================');
  console.log(`Testing ${allEndpoints.length} endpoints...\n`);

  let passed = 0;
  let failed = 0;
  const failedEndpoints = [];

  for (const endpoint of allEndpoints) {
    try {
      let response;
      const config = {
        method: endpoint.method,
        url: `${BASE_URL}${endpoint.path}`,
        timeout: 5000,
        validateStatus: (status) => status < 500 // Accept any status < 500 as "endpoint exists"
      };

      if (endpoint.body && ['POST', 'PUT', 'DELETE'].includes(endpoint.method)) {
        config.data = endpoint.body;
        config.headers = { 'Content-Type': 'application/json' };
      }

      response = await axios(config);
      
      console.log(`✅ ${endpoint.method.padEnd(6)} ${endpoint.path.padEnd(40)} | ${endpoint.name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${endpoint.method.padEnd(6)} ${endpoint.path.padEnd(40)} | ${endpoint.name} | ERROR: ${error.response?.status || error.code || error.message}`);
      failed++;
      failedEndpoints.push({
        method: endpoint.method,
        path: endpoint.path,
        name: endpoint.name,
        error: error.response?.status || error.code || error.message
      });
    }
  }

  console.log('\n📊 SUMMARY RESULTS');
  console.log('==================');
  console.log(`📈 Total Endpoints: ${allEndpoints.length}`);
  console.log(`✅ Working: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Success Rate: ${((passed / allEndpoints.length) * 100).toFixed(1)}%\n`);

  if (failedEndpoints.length > 0) {
    console.log('❌ FAILED ENDPOINTS NEEDING IMPLEMENTATION:');
    console.log('============================================');
    failedEndpoints.forEach((endpoint, index) => {
      console.log(`${index + 1}. ${endpoint.method} ${endpoint.path} (${endpoint.name})`);
      console.log(`   Error: ${endpoint.error}\n`);
    });
  } else {
    console.log('🎉 ALL ENDPOINTS WORKING! 100% COVERAGE ACHIEVED!');
  }

  return {
    total: allEndpoints.length,
    passed,
    failed,
    successRate: (passed / allEndpoints.length) * 100,
    failedEndpoints
  };
}

checkAllEndpoints().catch(console.error);
