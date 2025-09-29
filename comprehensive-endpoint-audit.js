// Comprehensive audit of all FaithLink360 backend endpoints to identify missing CRUD operations
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const AUTH_HEADERS = {
  'Authorization': 'Bearer mock-jwt-token-admin-user-admin',
  'Content-Type': 'application/json'
};

async function auditEndpoints() {
  console.log('🔍 COMPREHENSIVE ENDPOINT AUDIT - FaithLink360 Backend\n');
  console.log('=' .repeat(80));

  const auditResults = {
    working: [],
    missing: [],
    broken: []
  };

  // Define all expected CRUD endpoints for each module
  const expectedEndpoints = [
    // Members Module
    { module: 'Members', method: 'GET', endpoint: '/api/members', description: 'List members' },
    { module: 'Members', method: 'GET', endpoint: '/api/members/mbr-001', description: 'Get member by ID' },
    { module: 'Members', method: 'POST', endpoint: '/api/members', description: 'Create member', data: { firstName: 'Test', lastName: 'User', email: 'test@test.com' } },
    { module: 'Members', method: 'PUT', endpoint: '/api/members/mbr-001', description: 'Update member', data: { firstName: 'Updated' } },
    { module: 'Members', method: 'DELETE', endpoint: '/api/members/test-id', description: 'Delete member' },

    // Groups Module  
    { module: 'Groups', method: 'GET', endpoint: '/api/groups', description: 'List groups' },
    { module: 'Groups', method: 'GET', endpoint: '/api/groups/grp-001', description: 'Get group by ID' },
    { module: 'Groups', method: 'POST', endpoint: '/api/groups', description: 'Create group', data: { name: 'Test Group' } },
    { module: 'Groups', method: 'PUT', endpoint: '/api/groups/grp-001', description: 'Update group', data: { name: 'Updated Group' } },
    { module: 'Groups', method: 'DELETE', endpoint: '/api/groups/test-id', description: 'Delete group' },

    // Events Module
    { module: 'Events', method: 'GET', endpoint: '/api/events', description: 'List events' },
    { module: 'Events', method: 'GET', endpoint: '/api/events/evt-001', description: 'Get event by ID' },
    { module: 'Events', method: 'POST', endpoint: '/api/events', description: 'Create event', data: { title: 'Test Event', startDate: '2025-01-25' } },
    { module: 'Events', method: 'PUT', endpoint: '/api/events/evt-001', description: 'Update event', data: { title: 'Updated Event' } },
    { module: 'Events', method: 'DELETE', endpoint: '/api/events/test-id', description: 'Delete event' },

    // Journey Templates Module
    { module: 'Journey Templates', method: 'GET', endpoint: '/api/journey-templates', description: 'List journey templates' },
    { module: 'Journey Templates', method: 'GET', endpoint: '/api/journey-templates/tpl-001', description: 'Get template by ID' },
    { module: 'Journey Templates', method: 'POST', endpoint: '/api/journey-templates', description: 'Create template', data: { title: 'Test Template', description: 'Test' } },
    { module: 'Journey Templates', method: 'PUT', endpoint: '/api/journey-templates/tpl-001', description: 'Update template', data: { title: 'Updated' } },
    { module: 'Journey Templates', method: 'DELETE', endpoint: '/api/journey-templates/test-id', description: 'Delete template' },

    // Journeys Module
    { module: 'Journeys', method: 'GET', endpoint: '/api/journeys', description: 'List member journeys' },
    { module: 'Journeys', method: 'POST', endpoint: '/api/journeys', description: 'Assign journey', data: { memberId: 'mbr-001', templateId: 'tpl-001' } },
    { module: 'Journeys', method: 'PUT', endpoint: '/api/journeys/jrn-001', description: 'Update journey progress', data: { progress: 50 } },
    { module: 'Journeys', method: 'DELETE', endpoint: '/api/journeys/test-id', description: 'Remove journey assignment' },

    // Communications Module
    { module: 'Communications', method: 'GET', endpoint: '/api/communications/campaigns', description: 'List campaigns' },
    { module: 'Communications', method: 'GET', endpoint: '/api/communications/campaigns/cmp-001', description: 'Get campaign by ID' },
    { module: 'Communications', method: 'POST', endpoint: '/api/communications/campaigns', description: 'Create campaign', data: { title: 'Test Campaign', subject: 'Test' } },
    { module: 'Communications', method: 'PUT', endpoint: '/api/communications/campaigns/cmp-001', description: 'Update campaign', data: { title: 'Updated' } },
    { module: 'Communications', method: 'DELETE', endpoint: '/api/communications/campaigns/test-id', description: 'Delete campaign' },

    // Tasks Module
    { module: 'Tasks', method: 'GET', endpoint: '/api/tasks', description: 'List tasks' },
    { module: 'Tasks', method: 'GET', endpoint: '/api/tasks/tsk-001', description: 'Get task by ID' },
    { module: 'Tasks', method: 'POST', endpoint: '/api/tasks', description: 'Create task', data: { title: 'Test Task', assignedTo: 'mbr-001' } },
    { module: 'Tasks', method: 'PUT', endpoint: '/api/tasks/tsk-001', description: 'Update task', data: { status: 'completed' } },
    { module: 'Tasks', method: 'DELETE', endpoint: '/api/tasks/test-id', description: 'Delete task' },

    // Pastoral Care Module
    { module: 'Pastoral Care', method: 'GET', endpoint: '/api/pastoral-care', description: 'List care records' },
    { module: 'Pastoral Care', method: 'GET', endpoint: '/api/pastoral-care/care-001', description: 'Get care record by ID' },
    { module: 'Pastoral Care', method: 'POST', endpoint: '/api/pastoral-care', description: 'Create care record', data: { memberId: 'mbr-001', type: 'prayer_request' } },
    { module: 'Pastoral Care', method: 'PUT', endpoint: '/api/pastoral-care/care-001', description: 'Update care record', data: { status: 'resolved' } },
    { module: 'Pastoral Care', method: 'DELETE', endpoint: '/api/pastoral-care/test-id', description: 'Delete care record' },

    // Reports & Dashboard
    { module: 'Reports', method: 'GET', endpoint: '/api/reports/dashboard', description: 'Dashboard reports' },
    { module: 'Reports', method: 'GET', endpoint: '/api/dashboard/stats', description: 'Dashboard stats' },
    { module: 'Reports', method: 'GET', endpoint: '/api/reports/member-engagement-heatmaps', description: 'Engagement heatmaps' },

    // Health & Auth
    { module: 'System', method: 'GET', endpoint: '/health', description: 'Health check' },
    { module: 'Auth', method: 'GET', endpoint: '/api/auth/me', description: 'User info' },
  ];

  console.log(`Testing ${expectedEndpoints.length} expected endpoints...\n`);

  for (const test of expectedEndpoints) {
    try {
      let response;
      const url = `${BASE_URL}${test.endpoint}`;

      switch (test.method) {
        case 'GET':
          response = await axios.get(url, { headers: AUTH_HEADERS, timeout: 3000 });
          break;
        case 'POST':
          response = await axios.post(url, test.data || {}, { headers: AUTH_HEADERS, timeout: 3000 });
          break;
        case 'PUT':
          response = await axios.put(url, test.data || {}, { headers: AUTH_HEADERS, timeout: 3000 });
          break;
        case 'DELETE':
          response = await axios.delete(url, { headers: AUTH_HEADERS, timeout: 3000 });
          break;
      }

      if (response.status >= 200 && response.status < 300) {
        auditResults.working.push({
          module: test.module,
          method: test.method,
          endpoint: test.endpoint,
          description: test.description,
          status: response.status
        });
        console.log(`✅ ${test.module}: ${test.method} ${test.endpoint} (${response.status})`);
      } else {
        auditResults.broken.push({
          module: test.module,
          method: test.method,
          endpoint: test.endpoint,
          description: test.description,  
          status: response.status,
          error: `Unexpected status: ${response.status}`
        });
        console.log(`⚠️  ${test.module}: ${test.method} ${test.endpoint} (${response.status})`);
      }

    } catch (error) {
      if (error.response?.status === 404) {
        auditResults.missing.push({
          module: test.module,
          method: test.method,
          endpoint: test.endpoint,
          description: test.description,
          error: '404 Not Found'
        });
        console.log(`❌ ${test.module}: ${test.method} ${test.endpoint} (404 - Missing)`);
      } else {
        auditResults.broken.push({
          module: test.module,
          method: test.method,
          endpoint: test.endpoint,
          description: test.description,
          error: error.message
        });
        console.log(`💥 ${test.module}: ${test.method} ${test.endpoint} (Error: ${error.message})`);
      }
    }
  }

  // Print summary
  console.log('\n' + '=' .repeat(80));
  console.log('📊 AUDIT SUMMARY');
  console.log('=' .repeat(80));
  console.log(`✅ Working Endpoints: ${auditResults.working.length}`);
  console.log(`❌ Missing Endpoints (404): ${auditResults.missing.length}`);
  console.log(`💥 Broken Endpoints: ${auditResults.broken.length}`);
  
  const totalExpected = expectedEndpoints.length;
  const successRate = Math.round((auditResults.working.length / totalExpected) * 100);
  console.log(`📈 Success Rate: ${successRate}% (${auditResults.working.length}/${totalExpected})`);

  if (auditResults.missing.length > 0) {
    console.log('\n🚨 MISSING ENDPOINTS THAT NEED TO BE IMPLEMENTED:');
    console.log('-' .repeat(80));
    
    const missingByModule = {};
    auditResults.missing.forEach(endpoint => {
      if (!missingByModule[endpoint.module]) {
        missingByModule[endpoint.module] = [];
      }
      missingByModule[endpoint.module].push(endpoint);
    });

    Object.keys(missingByModule).forEach(module => {
      console.log(`\n📁 ${module} Module:`);
      missingByModule[module].forEach(endpoint => {
        console.log(`   ${endpoint.method} ${endpoint.endpoint} - ${endpoint.description}`);
      });
    });
  }

  if (auditResults.broken.length > 0) {
    console.log('\n💥 BROKEN ENDPOINTS THAT NEED TO BE FIXED:');
    console.log('-' .repeat(80));
    auditResults.broken.forEach(endpoint => {
      console.log(`${endpoint.method} ${endpoint.endpoint} - ${endpoint.error}`);
    });
  }

  return auditResults;
}

// Run the audit
auditEndpoints().catch(console.error);
