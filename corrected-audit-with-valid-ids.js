const fetch = require('node-fetch');

async function getCorrectedAuditResults() {
  const backendUrl = 'http://localhost:8000';
  const authToken = 'mock-admin-token-for-testing';
  
  console.log('🔍 CORRECTED AUDIT - Using Valid Production Data IDs\n');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  };

  // First get actual production data to use real IDs
  console.log('📋 Getting Production Data IDs...');
  
  let validMemberIds = [];
  let validGroupIds = [];
  let validEventIds = [];
  let validTemplateIds = [];
  let validTaskIds = [];

  try {
    // Get members to find valid IDs
    const membersResp = await fetch(`${backendUrl}/api/members`, { headers });
    const membersData = await membersResp.json();
    if (membersData.members) {
      validMemberIds = membersData.members.slice(0, 3).map(m => m.id);
      console.log(`   Found Member IDs: ${validMemberIds.join(', ')}`);
    }

    // Get groups to find valid IDs
    const groupsResp = await fetch(`${backendUrl}/api/groups`, { headers });
    const groupsData = await groupsResp.json();
    if (groupsData.groups) {
      validGroupIds = groupsData.groups.slice(0, 3).map(g => g.id);
      console.log(`   Found Group IDs: ${validGroupIds.join(', ')}`);
    }

    // Get events to find valid IDs
    const eventsResp = await fetch(`${backendUrl}/api/events`, { headers });
    const eventsData = await eventsResp.json();
    if (eventsData.events) {
      validEventIds = eventsData.events.slice(0, 3).map(e => e.id);
      console.log(`   Found Event IDs: ${validEventIds.join(', ')}`);
    }

    // Get journey templates to find valid IDs
    const templatesResp = await fetch(`${backendUrl}/api/journey-templates`, { headers });
    const templatesData = await templatesResp.json();
    if (templatesData.templates) {
      validTemplateIds = templatesData.templates.slice(0, 3).map(t => t.id);
      console.log(`   Found Template IDs: ${validTemplateIds.join(', ')}`);
    }

    // Get tasks to find valid IDs
    const tasksResp = await fetch(`${backendUrl}/api/tasks`, { headers });
    const tasksData = await tasksResp.json();
    if (tasksData.tasks) {
      validTaskIds = tasksData.tasks.slice(0, 3).map(t => t.id);
      console.log(`   Found Task IDs: ${validTaskIds.join(', ')}`);
    }

  } catch (error) {
    console.log(`   Error getting production IDs: ${error.message}`);
  }

  console.log('\n🔍 TESTING ENDPOINTS WITH VALID IDs:\n');

  let passed = 0;
  let failed = 0;

  async function testEndpoint(method, endpoint, description, body = null) {
    try {
      const options = { method, headers };
      if (body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(body);
      }
      const response = await fetch(`${backendUrl}${endpoint}`, options);
      const success = response.status < 400;
      
      if (success) {
        console.log(`✅ ${method} ${endpoint} - ${description}`);
        passed++;
      } else {
        console.log(`❌ ${method} ${endpoint} - ${description} (${response.status})`);
        failed++;
      }
      
      return success;
    } catch (error) {
      console.log(`❌ ${method} ${endpoint} - ${description} (ERROR: ${error.message})`);
      failed++;
      return false;
    }
  }

  // Test individual resource endpoints with valid IDs
  console.log('👤 MEMBER INDIVIDUAL ENDPOINTS:');
  if (validMemberIds.length > 0) {
    await testEndpoint('GET', `/api/members/${validMemberIds[0]}`, 'Get specific member');
    await testEndpoint('PUT', `/api/members/${validMemberIds[0]}`, 'Update specific member');
  }

  console.log('\n👥 GROUP INDIVIDUAL ENDPOINTS:');
  if (validGroupIds.length > 0) {
    await testEndpoint('GET', `/api/groups/${validGroupIds[0]}`, 'Get specific group');
    await testEndpoint('PUT', `/api/groups/${validGroupIds[0]}`, 'Update specific group');
    await testEndpoint('GET', `/api/groups/${validGroupIds[0]}/members`, 'Get group members');
  }

  console.log('\n📅 EVENT INDIVIDUAL ENDPOINTS:');
  if (validEventIds.length > 0) {
    await testEndpoint('GET', `/api/events/${validEventIds[0]}`, 'Get specific event');
    await testEndpoint('PUT', `/api/events/${validEventIds[0]}`, 'Update specific event');
    await testEndpoint('GET', `/api/events/${validEventIds[0]}/registrations`, 'Get event registrations');
  }

  console.log('\n🌟 JOURNEY TEMPLATE INDIVIDUAL ENDPOINTS:');
  if (validTemplateIds.length > 0) {
    await testEndpoint('GET', `/api/journey-templates/${validTemplateIds[0]}`, 'Get specific template');
    await testEndpoint('PUT', `/api/journey-templates/${validTemplateIds[0]}`, 'Update specific template');
  }

  console.log('\n📋 TASK INDIVIDUAL ENDPOINTS:');
  if (validTaskIds.length > 0) {
    await testEndpoint('GET', `/api/tasks/${validTaskIds[0]}`, 'Get specific task');
    await testEndpoint('PUT', `/api/tasks/${validTaskIds[0]}`, 'Update specific task');
  }

  // Test truly missing endpoints
  console.log('\n🚨 TESTING KNOWN MISSING ENDPOINTS:');
  
  // Event registrations
  if (validEventIds.length > 0 && validMemberIds.length > 0) {
    await testEndpoint('POST', `/api/events/${validEventIds[0]}/registrations`, 'Register for event', {
      memberId: validMemberIds[0]
    });
  }

  // Journey assignment endpoints
  if (validMemberIds.length > 0 && validTemplateIds.length > 0) {
    await testEndpoint('POST', '/api/journeys/member-journeys', 'Assign journey to member', {
      memberId: validMemberIds[0],
      templateId: validTemplateIds[0],
      startDate: new Date().toISOString()
    });
  }
  if (validTaskIds.length > 0) {
    await testEndpoint('GET', `/api/journeys/member-journeys/${validTaskIds[0]}`, 'Get member journey progress');
  }

  // Spiritual journey extensions (these should all be missing)
  await testEndpoint('GET', '/api/journeys/devotions', 'Get daily devotions');
  await testEndpoint('POST', '/api/journeys/devotions', 'Record devotion entry');
  await testEndpoint('GET', '/api/journeys/spiritual-gifts', 'Get spiritual gifts assessment');
  await testEndpoint('POST', '/api/journeys/spiritual-gifts', 'Submit gifts assessment');
  await testEndpoint('GET', '/api/journeys/serving-opportunities', 'Get serving opportunities');
  await testEndpoint('GET', '/api/journeys/milestones', 'Get journey milestones');
  await testEndpoint('GET', '/api/journeys/analytics', 'Get journey analytics');
  await testEndpoint('GET', '/api/journeys/reflections', 'Get personal reflections');

  // Communications announcements
  await testEndpoint('GET', '/api/communications/announcements', 'List announcements');
  await testEndpoint('POST', '/api/communications/announcements', 'Create announcement', {
    title: 'Test Announcement',
    content: 'This is a test announcement content.',
    priority: 'medium',
    category: 'general'
  });

  // Advanced reports
  await testEndpoint('GET', '/api/reports/members', 'Member reports');
  await testEndpoint('GET', '/api/reports/groups', 'Group reports');
  await testEndpoint('GET', '/api/reports/events', 'Event reports');
  await testEndpoint('GET', '/api/reports/attendance', 'Attendance reports');
  await testEndpoint('GET', '/api/reports/journeys', 'Journey reports');
  await testEndpoint('GET', '/api/reports/engagement', 'Engagement analytics');

  console.log('\n📊 CORRECTED AUDIT RESULTS:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  return { passed, failed, total: passed + failed };
}

getCorrectedAuditResults().catch(console.error);
