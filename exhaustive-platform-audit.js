const fetch = require('node-fetch');
const fs = require('fs');

const BASE_URL = 'http://localhost:8000';
const AUTH_TOKEN = 'mock_token_admin';

/**
 * EXHAUSTIVE PLATFORM AUDIT
 * Tests ALL endpoints discovered in comprehensive frontend analysis
 * Based on 108+ expected endpoints from frontend-to-backend mapping
 */

class ExhaustivePlatformAudit {
  constructor() {
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`
    };
    this.results = {
      tested: 0,
      passed: 0,
      failed: 0,
      endpoints: [],
      byModule: {}
    };
    this.validIds = {};
  }

  async getValidProductionIds() {
    console.log('📋 Getting production data for valid IDs...');
    
    try {
      // Get valid member IDs
      const membersResp = await fetch(`${BASE_URL}/api/members`, { headers: this.headers });
      if (membersResp.ok) {
        const membersData = await membersResp.json();
        this.validIds.members = membersData.members?.slice(0, 3).map(m => m.id) || ['mbr-001', 'mbr-002'];
      }

      // Get valid group IDs
      const groupsResp = await fetch(`${BASE_URL}/api/groups`, { headers: this.headers });
      if (groupsResp.ok) {
        const groupsData = await groupsResp.json();
        this.validIds.groups = groupsData.groups?.slice(0, 3).map(g => g.id) || ['grp-001', 'grp-002'];
      }

      // Get valid event IDs
      const eventsResp = await fetch(`${BASE_URL}/api/events`, { headers: this.headers });
      if (eventsResp.ok) {
        const eventsData = await eventsResp.json();
        this.validIds.events = eventsData.events?.slice(0, 3).map(e => e.id) || ['evt-001', 'evt-002'];
      }

      // Get valid journey template IDs
      const templatesResp = await fetch(`${BASE_URL}/api/journey-templates`, { headers: this.headers });
      if (templatesResp.ok) {
        const templatesData = await templatesResp.json();
        this.validIds.templates = templatesData.templates?.slice(0, 3).map(t => t.id) || ['jt-001', 'jt-002'];
      }

      // Get valid task IDs
      const tasksResp = await fetch(`${BASE_URL}/api/tasks`, { headers: this.headers });
      if (tasksResp.ok) {
        const tasksData = await tasksResp.json();
        this.validIds.tasks = tasksData.tasks?.slice(0, 3).map(t => t.id) || ['task-001', 'task-002'];
      }

      console.log('   Found IDs:', {
        members: this.validIds.members?.length || 0,
        groups: this.validIds.groups?.length || 0, 
        events: this.validIds.events?.length || 0,
        templates: this.validIds.templates?.length || 0,
        tasks: this.validIds.tasks?.length || 0
      });

    } catch (error) {
      console.log(`   Error getting production IDs: ${error.message}`);
      // Use fallback IDs
      this.validIds = {
        members: ['mbr-001', 'mbr-002', 'mbr-003'],
        groups: ['grp-001', 'grp-002', 'grp-003'],
        events: ['evt-001', 'evt-002', 'evt-003'],
        templates: ['jt-001', 'jt-002'],
        tasks: ['task-001', 'task-002']
      };
    }
  }

  async testEndpoint(method, endpoint, description, body = null, expectedStatus = [200, 201]) {
    const module = this.getModuleFromEndpoint(endpoint);
    
    try {
      const options = { method, headers: this.headers };
      if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, options);
      const success = expectedStatus.includes(response.status) || (response.status >= 200 && response.status < 400);
      
      const result = {
        method,
        endpoint,
        description,
        status: response.status,
        success,
        module
      };

      this.results.endpoints.push(result);
      this.results.tested++;

      if (!this.results.byModule[module]) {
        this.results.byModule[module] = { tested: 0, passed: 0, failed: 0 };
      }
      this.results.byModule[module].tested++;

      if (success) {
        console.log(`✅ ${method.padEnd(6)} ${endpoint} - ${description}`);
        this.results.passed++;
        this.results.byModule[module].passed++;
      } else {
        console.log(`❌ ${method.padEnd(6)} ${endpoint} - ${description} (${response.status})`);
        this.results.failed++;
        this.results.byModule[module].failed++;
      }

      return success;
    } catch (error) {
      const result = {
        method,
        endpoint,
        description,
        status: 'ERROR',
        success: false,
        error: error.message,
        module
      };

      this.results.endpoints.push(result);
      this.results.tested++;
      this.results.failed++;

      if (!this.results.byModule[module]) {
        this.results.byModule[module] = { tested: 0, passed: 0, failed: 0 };
      }
      this.results.byModule[module].tested++;
      this.results.byModule[module].failed++;

      console.log(`❌ ${method.padEnd(6)} ${endpoint} - ${description} (ERROR: ${error.message})`);
      return false;
    }
  }

  getModuleFromEndpoint(endpoint) {
    if (endpoint.includes('/api/members')) return 'members';
    if (endpoint.includes('/api/groups')) return 'groups';
    if (endpoint.includes('/api/events')) return 'events';
    if (endpoint.includes('/api/journey')) return 'journeys';
    if (endpoint.includes('/api/tasks')) return 'tasks';
    if (endpoint.includes('/api/communications')) return 'communications';
    if (endpoint.includes('/api/reports')) return 'reports';
    if (endpoint.includes('/api/attendance')) return 'attendance';
    if (endpoint.includes('/api/auth')) return 'auth';
    if (endpoint.includes('/api/care')) return 'care';
    if (endpoint.includes('/api/settings')) return 'settings';
    if (endpoint.includes('/api/volunteers')) return 'volunteers';
    return 'other';
  }

  replacePathVariables(endpoint) {
    return endpoint
      .replace(/\$\{[^}]+\}/g, () => {
        if (endpoint.includes('member')) return this.validIds.members?.[0] || 'mbr-001';
        if (endpoint.includes('group')) return this.validIds.groups?.[0] || 'grp-001';
        if (endpoint.includes('event')) return this.validIds.events?.[0] || 'evt-001';
        if (endpoint.includes('template')) return this.validIds.templates?.[0] || 'jt-001';
        if (endpoint.includes('task')) return this.validIds.tasks?.[0] || 'task-001';
        return 'test-id';
      })
      .replace(/DYNAMIC_ID/g, () => {
        if (endpoint.includes('member')) return this.validIds.members?.[0] || 'mbr-001';
        if (endpoint.includes('group')) return this.validIds.groups?.[0] || 'grp-001';
        if (endpoint.includes('event')) return this.validIds.events?.[0] || 'evt-001';
        if (endpoint.includes('template')) return this.validIds.templates?.[0] || 'jt-001';
        if (endpoint.includes('task')) return this.validIds.tasks?.[0] || 'task-001';
        return 'test-id';
      });
  }

  async runExhaustiveAudit() {
    console.log('🚀 EXHAUSTIVE PLATFORM AUDIT - TESTING ALL FRONTEND-DISCOVERED ENDPOINTS\n');
    
    await this.getValidProductionIds();
    console.log('\n🔍 TESTING ALL DISCOVERED ENDPOINTS:\n');

    // Core CRUD endpoints for each module
    console.log('👤 MEMBERS MODULE:');
    await this.testEndpoint('GET', '/api/members', 'List members');
    await this.testEndpoint('POST', '/api/members', 'Create member', { 
      firstName: 'Test', lastName: 'User', email: 'test@example.com' 
    });
    await this.testEndpoint('GET', `/api/members/${this.validIds.members?.[0] || 'mbr-001'}`, 'Get specific member');
    await this.testEndpoint('PUT', `/api/members/${this.validIds.members?.[0] || 'mbr-001'}`, 'Update specific member', {
      firstName: 'Updated'
    });
    await this.testEndpoint('DELETE', `/api/members/${this.validIds.members?.[0] || 'mbr-001'}`, 'Delete specific member');
    await this.testEndpoint('GET', '/api/members/stats', 'Member statistics');
    await this.testEndpoint('GET', '/api/members/tags', 'Member tags');
    await this.testEndpoint('GET', '/api/members/bulk', 'Bulk member operations');
    await this.testEndpoint('GET', '/api/members/search/suggestions?q=john', 'Member search suggestions');

    console.log('\n👥 GROUPS MODULE:');
    await this.testEndpoint('GET', '/api/groups', 'List groups');
    await this.testEndpoint('POST', '/api/groups', 'Create group', {
      name: 'Test Group', description: 'Test Description'
    });
    await this.testEndpoint('GET', `/api/groups/${this.validIds.groups?.[0] || 'grp-001'}`, 'Get specific group');
    await this.testEndpoint('PUT', `/api/groups/${this.validIds.groups?.[0] || 'grp-001'}`, 'Update specific group', {
      name: 'Updated Group'
    });
    await this.testEndpoint('DELETE', `/api/groups/${this.validIds.groups?.[0] || 'grp-001'}`, 'Delete specific group');
    await this.testEndpoint('GET', '/api/groups/stats', 'Group statistics');
    await this.testEndpoint('GET', '/api/groups/bulk', 'Bulk group operations');
    await this.testEndpoint('GET', `/api/groups/${this.validIds.groups?.[0] || 'grp-001'}/members`, 'Group members');
    await this.testEndpoint('POST', `/api/groups/${this.validIds.groups?.[0] || 'grp-001'}/members`, 'Add group member', {
      memberId: this.validIds.members?.[0] || 'mbr-001'
    });
    await this.testEndpoint('DELETE', `/api/groups/${this.validIds.groups?.[0] || 'grp-001'}/members/${this.validIds.members?.[0] || 'mbr-001'}`, 'Remove group member');

    console.log('\n📅 EVENTS MODULE:');
    await this.testEndpoint('GET', '/api/events', 'List events');
    await this.testEndpoint('POST', '/api/events', 'Create event', {
      title: 'Test Event', description: 'Test Description', startDate: new Date().toISOString()
    });
    await this.testEndpoint('GET', `/api/events/${this.validIds.events?.[0] || 'evt-001'}`, 'Get specific event');
    await this.testEndpoint('PUT', `/api/events/${this.validIds.events?.[0] || 'evt-001'}`, 'Update specific event', {
      title: 'Updated Event'
    });
    await this.testEndpoint('DELETE', `/api/events/${this.validIds.events?.[0] || 'evt-001'}`, 'Delete specific event');
    await this.testEndpoint('GET', `/api/events/${this.validIds.events?.[0] || 'evt-001'}/registrations`, 'Event registrations');
    await this.testEndpoint('POST', `/api/events/${this.validIds.events?.[0] || 'evt-001'}/registrations`, 'Register for event', {
      memberId: this.validIds.members?.[0] || 'mbr-001'
    });
    await this.testEndpoint('GET', `/api/events/${this.validIds.events?.[0] || 'evt-001'}/rsvps`, 'Event RSVPs');
    await this.testEndpoint('POST', `/api/events/${this.validIds.events?.[0] || 'evt-001'}/rsvps`, 'RSVP for event', {
      memberId: this.validIds.members?.[0] || 'mbr-001', response: 'yes'
    });
    await this.testEndpoint('GET', `/api/events/${this.validIds.events?.[0] || 'evt-001'}/check-in`, 'Event check-in status');
    await this.testEndpoint('POST', `/api/events/${this.validIds.events?.[0] || 'evt-001'}/check-in`, 'Event check-in', {
      memberId: this.validIds.members?.[0] || 'mbr-001'
    });

    console.log('\n🌟 JOURNEY TEMPLATES MODULE:');
    await this.testEndpoint('GET', '/api/journey-templates', 'List journey templates');
    await this.testEndpoint('POST', '/api/journey-templates', 'Create journey template', {
      title: 'Test Journey', description: 'Test Description'
    });
    await this.testEndpoint('GET', `/api/journey-templates/${this.validIds.templates?.[0] || 'jt-001'}`, 'Get specific template');
    await this.testEndpoint('PUT', `/api/journey-templates/${this.validIds.templates?.[0] || 'jt-001'}`, 'Update specific template', {
      title: 'Updated Journey'
    });
    await this.testEndpoint('DELETE', `/api/journey-templates/${this.validIds.templates?.[0] || 'jt-001'}`, 'Delete specific template');
    await this.testEndpoint('POST', `/api/journey-templates/${this.validIds.templates?.[0] || 'jt-001'}/duplicate`, 'Duplicate template');

    console.log('\n🎯 MEMBER JOURNEYS MODULE:');
    await this.testEndpoint('GET', '/api/journeys', 'List journeys');
    await this.testEndpoint('GET', '/api/journeys/member-journeys', 'List member journeys');
    // Journey assignment - get valid template ID dynamically
    try {
      const templatesResponse = await fetch(`http://localhost:8000/api/journey-templates`, {
        headers: { 'Authorization': 'Bearer mock_admin_token' }
      });
      const templatesData = await templatesResponse.json();
      const validTemplateId = templatesData.templates && templatesData.templates.length > 0 
        ? templatesData.templates[0].id 
        : 'tpl-1758666497159'; // fallback to known valid ID
        
      await this.testEndpoint('POST', '/api/journeys/member-journeys', 'Assign journey to member', 'JOURNEYS', {
        memberId: this.validIds.members[0],
        templateId: validTemplateId,
        mentorId: this.validIds.members[1]
      });
    } catch (error) {
      console.log(`❌ ERROR getting template ID: ${error.message}`);
    }
    await this.testEndpoint('GET', `/api/journeys/member-journeys/${this.validIds.tasks?.[0] || 'task-001'}`, 'Get member journey progress');
    await this.testEndpoint('PUT', `/api/journeys/member-journeys/${this.validIds.tasks?.[0] || 'task-001'}`, 'Update member journey', {
      progress: 75
    });

    console.log('\n📖 SPIRITUAL JOURNEY EXTENSIONS:');
    await this.testEndpoint('GET', '/api/journeys/devotions', 'Get daily devotions');
    await this.testEndpoint('POST', '/api/journeys/devotions', 'Record devotion entry', {
      bibleReading: 'Psalm 23', duration: 15
    });
    await this.testEndpoint('GET', '/api/journeys/spiritual-gifts', 'Get spiritual gifts assessment');
    await this.testEndpoint('POST', '/api/journeys/spiritual-gifts', 'Submit gifts assessment', {
      responses: { teaching: 5, leadership: 4 }
    });
    await this.testEndpoint('GET', '/api/journeys/serving-opportunities', 'Get serving opportunities');
    await this.testEndpoint('GET', '/api/journeys/milestones', 'Get journey milestones');
    await this.testEndpoint('GET', '/api/journeys/analytics', 'Get journey analytics');
    await this.testEndpoint('GET', '/api/journeys/reflections', 'Get personal reflections');

    console.log('\n📋 TASKS MODULE:');
    await this.testEndpoint('GET', '/api/tasks', 'List tasks');
    await this.testEndpoint('POST', '/api/tasks', 'Create task', {
      title: 'Test Task', description: 'Test Description'
    });
    await this.testEndpoint('GET', `/api/tasks/${this.validIds.tasks?.[0] || 'task-001'}`, 'Get specific task');
    await this.testEndpoint('PUT', `/api/tasks/${this.validIds.tasks?.[0] || 'task-001'}`, 'Update specific task', {
      title: 'Updated Task'
    });
    await this.testEndpoint('DELETE', `/api/tasks/${this.validIds.tasks?.[0] || 'task-001'}`, 'Delete specific task');

    console.log('\n📊 ATTENDANCE MODULE:');
    await this.testEndpoint('GET', '/api/attendance', 'List attendance sessions');
    await this.testEndpoint('POST', '/api/attendance', 'Create attendance session', {
      groupId: this.validIds.groups?.[0] || 'grp-001', date: new Date().toISOString()
    });
    await this.testEndpoint('GET', '/api/attendance/stats', 'Attendance statistics');
    await this.testEndpoint('POST', `/api/attendance/${this.validIds.groups?.[0] || 'grp-001'}/bulk-update`, 'Bulk update attendance', {
      attendees: []
    });

    console.log('\n🔐 AUTHENTICATION MODULE:');
    await this.testEndpoint('POST', '/api/auth/register', 'Register user', {
      email: 'test@example.com', password: 'password123'
    });
    await this.testEndpoint('GET', '/api/auth/me', 'Get current user');
    await this.testEndpoint('POST', '/api/auth/refresh', 'Refresh token');
    await this.testEndpoint('POST', '/api/auth/logout', 'Logout');
    await this.testEndpoint('POST', '/api/auth/forgot-password', 'Forgot password', {
      email: 'test@example.com'
    });
    await this.testEndpoint('POST', '/api/auth/reset-password', 'Reset password', {
      token: 'test-token', password: 'newpassword123'
    });

    console.log('\n💙 PASTORAL CARE MODULE:');
    await this.testEndpoint('GET', '/api/care/prayer-requests', 'List prayer requests');
    await this.testEndpoint('POST', '/api/care/prayer-requests', 'Create prayer request', {
      title: 'Test Prayer', requestedBy: this.validIds.members?.[0] || 'mbr-001'
    });
    await this.testEndpoint('GET', '/api/care/records', 'List care records');
    await this.testEndpoint('POST', '/api/care/records', 'Create care record', {
      memberId: this.validIds.members?.[0] || 'mbr-001', notes: 'Test care notes'
    });
    await this.testEndpoint('GET', '/api/care/members-needing-care', 'Members needing care');

    console.log('\n📧 COMMUNICATIONS MODULE:');
    await this.testEndpoint('GET', '/api/communications/campaigns', 'List campaigns');
    await this.testEndpoint('POST', '/api/communications/campaigns', 'Create campaign', {
      title: 'Test Campaign', content: 'Test Content'
    });
    await this.testEndpoint('GET', '/api/communications/announcements', 'List announcements');
    await this.testEndpoint('POST', '/api/communications/announcements', 'Create announcement', {
      title: 'Test Announcement', content: 'Test Content'
    });
    await this.testEndpoint('GET', '/api/communications/templates', 'List templates');
    await this.testEndpoint('POST', '/api/communications/templates', 'Create template', {
      name: 'Test Template', content: 'Test Content'
    });

    console.log('\n🤝 VOLUNTEERS MODULE:');
    await this.testEndpoint('GET', '/api/volunteers/opportunities', 'List volunteer opportunities');
    await this.testEndpoint('POST', '/api/volunteers/opportunities', 'Create volunteer opportunity', {
      title: 'Test Opportunity', description: 'Test Description'
    });
    await this.testEndpoint('GET', '/api/volunteers/my-signups', 'My volunteer signups');
    await this.testEndpoint('POST', '/api/volunteers/signup', 'Volunteer signup', {
      opportunityId: 'opp-001', memberId: this.validIds.members?.[0] || 'mbr-001'
    });

    console.log('\n📈 REPORTS MODULE:');
    await this.testEndpoint('GET', '/api/reports', 'List reports');
    await this.testEndpoint('GET', '/api/reports/members', 'Member reports');
    await this.testEndpoint('GET', '/api/reports/groups', 'Group reports');
    await this.testEndpoint('GET', '/api/reports/events', 'Event reports');
    await this.testEndpoint('GET', '/api/reports/attendance', 'Attendance reports');
    await this.testEndpoint('GET', '/api/reports/journeys', 'Journey reports');
    await this.testEndpoint('GET', '/api/reports/engagement', 'Engagement analytics');
    await this.testEndpoint('GET', '/api/reports/group-health?range=30days', 'Group health reports');

    console.log('\n⚙️ SETTINGS MODULE:');
    await this.testEndpoint('GET', '/api/settings/system', 'System settings');
    await this.testEndpoint('GET', '/api/settings/users', 'User settings');
    await this.testEndpoint('PUT', '/api/settings/system', 'Update system settings', {
      setting: 'value'
    });

    // Print final results
    this.printResults();
    
    return this.results;
  }

  printResults() {
    console.log('\n📊 EXHAUSTIVE AUDIT RESULTS:\n');
    console.log(`📄 Total Endpoints Tested: ${this.results.tested}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${((this.results.passed / this.results.tested) * 100).toFixed(1)}%\n`);

    console.log('📋 RESULTS BY MODULE:\n');
    Object.entries(this.results.byModule).forEach(([module, stats]) => {
      const successRate = ((stats.passed / stats.tested) * 100).toFixed(1);
      console.log(`${module.toUpperCase().padEnd(15)} | ${stats.passed}/${stats.tested} (${successRate}%)`);
    });

    // Save detailed results
    fs.writeFileSync('exhaustive-audit-results.json', JSON.stringify(this.results, null, 2));
    console.log('\n💾 Detailed results saved to: exhaustive-audit-results.json');
  }
}

// Run the exhaustive audit
async function runExhaustiveAudit() {
  const audit = new ExhaustivePlatformAudit();
  return await audit.runExhaustiveAudit();
}

// Execute if run directly
if (require.main === module) {
  runExhaustiveAudit().catch(console.error);
}

module.exports = { ExhaustivePlatformAudit, runExhaustiveAudit };
