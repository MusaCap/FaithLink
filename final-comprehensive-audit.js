// Final comprehensive audit using real production data IDs
const axios = require('axios');

const BASE_URL = 'http://localhost:8000';
const AUTH_HEADERS = {
  'Authorization': 'Bearer mock-jwt-token-admin-user-admin',
  'Content-Type': 'application/json'
};

async function finalComprehensiveAudit() {
  console.log('🎯 FINAL COMPREHENSIVE AUDIT - FaithLink360 Backend\n');
  console.log('=' .repeat(80));

  const auditResults = {
    working: [],
    missing: [],
    broken: []
  };

  // First, get real IDs from the system
  let realIds = {
    memberId: 'mbr-001',
    groupId: 'grp-001', 
    eventId: 'evt-001',
    templateId: 'jt-001',
    campaignId: 'comm-001',
    taskId: 'task-001',
    careId: 'care-001'
  };

  try {
    // Get real data IDs
    const members = await axios.get(`${BASE_URL}/api/members`, { headers: AUTH_HEADERS });
    const groups = await axios.get(`${BASE_URL}/api/groups`, { headers: AUTH_HEADERS });
    const events = await axios.get(`${BASE_URL}/api/events`, { headers: AUTH_HEADERS });
    const templates = await axios.get(`${BASE_URL}/api/journey-templates`, { headers: AUTH_HEADERS });
    const campaigns = await axios.get(`${BASE_URL}/api/communications/campaigns`, { headers: AUTH_HEADERS });
    const tasks = await axios.get(`${BASE_URL}/api/tasks`, { headers: AUTH_HEADERS });
    const pastoral = await axios.get(`${BASE_URL}/api/pastoral-care`, { headers: AUTH_HEADERS });

    if (members.data.members?.length > 0) realIds.memberId = members.data.members[0].id;
    if (groups.data.groups?.length > 0) realIds.groupId = groups.data.groups[0].id;
    if (events.data.events?.length > 0) realIds.eventId = events.data.events[0].id;
    if (templates.data.templates?.length > 0) realIds.templateId = templates.data.templates[0].id;
    if (campaigns.data.campaigns?.length > 0) realIds.campaignId = campaigns.data.campaigns[0].id;
    if (tasks.data.tasks?.length > 0) realIds.taskId = tasks.data.tasks[0].id;
    if (pastoral.data.records?.length > 0) realIds.careId = pastoral.data.records[0].id;

    console.log('📋 Using Real IDs:', realIds);
  } catch (error) {
    console.log('⚠️  Using default IDs for testing');
  }

  // Define all expected CRUD endpoints with real IDs
  const expectedEndpoints = [
    // Members Module
    { module: 'Members', method: 'GET', endpoint: '/api/members', description: 'List members' },
    { module: 'Members', method: 'GET', endpoint: `/api/members/${realIds.memberId}`, description: 'Get member by ID' },
    { module: 'Members', method: 'POST', endpoint: '/api/members', description: 'Create member', data: { firstName: 'Test', lastName: 'User', email: 'test@test.com' } },
    { module: 'Members', method: 'PUT', endpoint: `/api/members/${realIds.memberId}`, description: 'Update member', data: { firstName: 'Updated' } },

    // Groups Module  
    { module: 'Groups', method: 'GET', endpoint: '/api/groups', description: 'List groups' },
    { module: 'Groups', method: 'GET', endpoint: `/api/groups/${realIds.groupId}`, description: 'Get group by ID' },
    { module: 'Groups', method: 'POST', endpoint: '/api/groups', description: 'Create group', data: { name: 'Test Group' } },
    { module: 'Groups', method: 'PUT', endpoint: `/api/groups/${realIds.groupId}`, description: 'Update group', data: { name: 'Updated Group' } },

    // Events Module
    { module: 'Events', method: 'GET', endpoint: '/api/events', description: 'List events' },
    { module: 'Events', method: 'GET', endpoint: `/api/events/${realIds.eventId}`, description: 'Get event by ID' },
    { module: 'Events', method: 'POST', endpoint: '/api/events', description: 'Create event', data: { title: 'Test Event', startDate: '2025-01-25' } },
    { module: 'Events', method: 'PUT', endpoint: `/api/events/${realIds.eventId}`, description: 'Update event', data: { title: 'Updated Event' } },

    // Journey Templates Module
    { module: 'Journey Templates', method: 'GET', endpoint: '/api/journey-templates', description: 'List journey templates' },
    { module: 'Journey Templates', method: 'GET', endpoint: `/api/journey-templates/${realIds.templateId}`, description: 'Get template by ID' },
    { module: 'Journey Templates', method: 'POST', endpoint: '/api/journey-templates', description: 'Create template', data: { title: 'Test Template', description: 'Test' } },
    { module: 'Journey Templates', method: 'PUT', endpoint: `/api/journey-templates/${realIds.templateId}`, description: 'Update template', data: { title: 'Updated' } },

    // Journeys Module
    { module: 'Journeys', method: 'GET', endpoint: '/api/journeys', description: 'List member journeys' },
    { module: 'Journeys', method: 'POST', endpoint: '/api/journeys', description: 'Assign journey', data: { memberId: realIds.memberId, templateId: realIds.templateId } },
    { module: 'Journeys', method: 'PUT', endpoint: '/api/journeys/jrn-001', description: 'Update journey progress', data: { progress: 50 } },

    // Communications Module
    { module: 'Communications', method: 'GET', endpoint: '/api/communications/campaigns', description: 'List campaigns' },
    { module: 'Communications', method: 'GET', endpoint: `/api/communications/campaigns/${realIds.campaignId}`, description: 'Get campaign by ID' },
    { module: 'Communications', method: 'POST', endpoint: '/api/communications/campaigns', description: 'Create campaign', data: { title: 'Test Campaign', subject: 'Test' } },
    { module: 'Communications', method: 'PUT', endpoint: `/api/communications/campaigns/${realIds.campaignId}`, description: 'Update campaign', data: { title: 'Updated' } },

    // Tasks Module
    { module: 'Tasks', method: 'GET', endpoint: '/api/tasks', description: 'List tasks' },
    { module: 'Tasks', method: 'GET', endpoint: `/api/tasks/${realIds.taskId}`, description: 'Get task by ID' },
    { module: 'Tasks', method: 'POST', endpoint: '/api/tasks', description: 'Create task', data: { title: 'Test Task', assignedTo: realIds.memberId } },
    { module: 'Tasks', method: 'PUT', endpoint: `/api/tasks/${realIds.taskId}`, description: 'Update task', data: { status: 'completed' } },

    // Pastoral Care Module
    { module: 'Pastoral Care', method: 'GET', endpoint: '/api/pastoral-care', description: 'List care records' },
    { module: 'Pastoral Care', method: 'GET', endpoint: `/api/pastoral-care/${realIds.careId}`, description: 'Get care record by ID' },
    { module: 'Pastoral Care', method: 'POST', endpoint: '/api/pastoral-care', description: 'Create care record', data: { memberId: realIds.memberId, type: 'prayer_request' } },
    { module: 'Pastoral Care', method: 'PUT', endpoint: `/api/pastoral-care/${realIds.careId}`, description: 'Update care record', data: { status: 'resolved' } },

    // Event Registration & Check-in
    { module: 'Events', method: 'POST', endpoint: `/api/events/${realIds.eventId}/registrations`, description: 'Event registration', data: { memberId: realIds.memberId } },
    { module: 'Events', method: 'POST', endpoint: `/api/events/${realIds.eventId}/check-in`, description: 'Event check-in', data: { memberId: realIds.memberId } },

    // Reports & Dashboard
    { module: 'Reports', method: 'GET', endpoint: '/api/reports/dashboard', description: 'Dashboard reports' },
    { module: 'Reports', method: 'GET', endpoint: '/api/dashboard/stats', description: 'Dashboard stats' },
    { module: 'Reports', method: 'GET', endpoint: '/api/reports/member-engagement-heatmaps', description: 'Engagement heatmaps' },

    // Health & Auth
    { module: 'System', method: 'GET', endpoint: '/health', description: 'Health check' },
    { module: 'Auth', method: 'GET', endpoint: '/api/auth/me', description: 'User info' },
  ];

  console.log(`\nTesting ${expectedEndpoints.length} expected endpoints...\n`);

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

  // Test DELETE endpoints with newly created data
  console.log('\n🗑️  Testing DELETE operations with new data...');
  try {
    // Create and delete a member
    const newMember = await axios.post(`${BASE_URL}/api/members`, 
      { firstName: 'Delete', lastName: 'Test', email: 'delete@test.com' }, { headers: AUTH_HEADERS });
    const deleteMember = await axios.delete(`${BASE_URL}/api/members/${newMember.data.id}`, { headers: AUTH_HEADERS });
    console.log(`✅ Members: DELETE /api/members/${newMember.data.id} (${deleteMember.status})`);
    auditResults.working.push({ module: 'Members', method: 'DELETE', endpoint: `/api/members/:id`, description: 'Delete member', status: deleteMember.status });
    
    // Create and delete a group
    const newGroup = await axios.post(`${BASE_URL}/api/groups`, 
      { name: 'Delete Test Group' }, { headers: AUTH_HEADERS });
    const deleteGroup = await axios.delete(`${BASE_URL}/api/groups/${newGroup.data.id}`, { headers: AUTH_HEADERS });
    console.log(`✅ Groups: DELETE /api/groups/${newGroup.data.id} (${deleteGroup.status})`);
    auditResults.working.push({ module: 'Groups', method: 'DELETE', endpoint: `/api/groups/:id`, description: 'Delete group', status: deleteGroup.status });

    // Create and delete an event
    const newEvent = await axios.post(`${BASE_URL}/api/events`, 
      { title: 'Delete Test Event', startDate: '2025-01-25' }, { headers: AUTH_HEADERS });
    const deleteEvent = await axios.delete(`${BASE_URL}/api/events/${newEvent.data.id}`, { headers: AUTH_HEADERS });
    console.log(`✅ Events: DELETE /api/events/${newEvent.data.id} (${deleteEvent.status})`);
    auditResults.working.push({ module: 'Events', method: 'DELETE', endpoint: `/api/events/:id`, description: 'Delete event', status: deleteEvent.status });

  } catch (error) {
    console.log(`❌ DELETE operations error: ${error.message}`);
  }

  // Print final summary
  console.log('\n' + '=' .repeat(80));
  console.log('🎯 FINAL AUDIT RESULTS');
  console.log('=' .repeat(80));
  console.log(`✅ Working Endpoints: ${auditResults.working.length}`);
  console.log(`❌ Missing Endpoints (404): ${auditResults.missing.length}`);
  console.log(`💥 Broken Endpoints: ${auditResults.broken.length}`);
  
  const totalExpected = expectedEndpoints.length + 3; // +3 for DELETE operations
  const successRate = Math.round((auditResults.working.length / totalExpected) * 100);
  console.log(`📈 SUCCESS RATE: ${successRate}% (${auditResults.working.length}/${totalExpected})`);

  if (successRate >= 90) {
    console.log('\n🎉 EXCELLENT! Platform achieved 90%+ endpoint coverage!');
    console.log('✅ FaithLink360 backend is production-ready with comprehensive CRUD functionality');
  } else if (successRate >= 75) {
    console.log('\n👍 GOOD! Platform achieved 75%+ endpoint coverage');
    console.log('✅ Most critical functionality is working properly');
  } else {
    console.log('\n⚠️  Platform needs more work to achieve production readiness');
  }

  if (auditResults.missing.length > 0) {
    console.log('\n🚨 REMAINING MISSING ENDPOINTS:');
    console.log('-' .repeat(50));
    auditResults.missing.forEach(endpoint => {
      console.log(`   ${endpoint.method} ${endpoint.endpoint} - ${endpoint.description}`);
    });
  }

  return { successRate, working: auditResults.working.length, total: totalExpected };
}

// Run the final audit
finalComprehensiveAudit().catch(console.error);
