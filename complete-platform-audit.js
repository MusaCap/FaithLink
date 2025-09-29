const fetch = require('node-fetch');

class PlatformAuditor {
  constructor() {
    this.backendUrl = 'http://localhost:8000';
    this.frontendUrl = 'http://localhost:3000';
    this.results = {
      backend: { passed: 0, failed: 0, tests: [] },
      frontend: { passed: 0, failed: 0, tests: [] },
      integration: { passed: 0, failed: 0, tests: [] },
      gaps: []
    };
    this.mockAuthToken = 'mock-admin-token-for-testing';
  }

  async testEndpoint(method, endpoint, data = null, description = '') {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.mockAuthToken}`
        }
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.backendUrl}${endpoint}`, options);
      const responseData = await response.text();
      
      let parsedData;
      try {
        parsedData = JSON.parse(responseData);
      } catch {
        parsedData = responseData;
      }

      const success = response.status < 400;
      const result = {
        method,
        endpoint,
        status: response.status,
        success,
        description,
        response: success ? 'OK' : (parsedData.message || parsedData.error || responseData)
      };

      this.results.backend.tests.push(result);
      if (success) {
        this.results.backend.passed++;
        console.log(`✅ ${method} ${endpoint} - ${description}`);
      } else {
        this.results.backend.failed++;
        console.log(`❌ ${method} ${endpoint} - ${description} (${response.status})`);
      }

      return { success, data: parsedData, status: response.status };
    } catch (error) {
      this.results.backend.failed++;
      this.results.backend.tests.push({
        method,
        endpoint,
        status: 'ERROR',
        success: false,
        description,
        response: error.message
      });
      console.log(`❌ ${method} ${endpoint} - ${description} (ERROR: ${error.message})`);
      return { success: false, error: error.message };
    }
  }

  async testFrontendRoute(route, description = '') {
    try {
      const response = await fetch(`${this.frontendUrl}${route}`);
      const success = response.status < 400;
      
      const result = {
        route,
        status: response.status,
        success,
        description
      };

      this.results.frontend.tests.push(result);
      if (success) {
        this.results.frontend.passed++;
        console.log(`✅ Frontend ${route} - ${description}`);
      } else {
        this.results.frontend.failed++;
        console.log(`❌ Frontend ${route} - ${description} (${response.status})`);
      }

      return { success, status: response.status };
    } catch (error) {
      this.results.frontend.failed++;
      this.results.frontend.tests.push({
        route,
        status: 'ERROR',
        success: false,
        description,
        response: error.message
      });
      console.log(`❌ Frontend ${route} - ${description} (ERROR: ${error.message})`);
      return { success: false, error: error.message };
    }
  }

  async runCompleteBackendAudit() {
    console.log('\n🔍 =========================');
    console.log('🔍 COMPLETE BACKEND API AUDIT');
    console.log('🔍 =========================\n');

    // Health Check
    await this.testEndpoint('GET', '/health', null, 'System Health Check');

    // AUTHENTICATION ENDPOINTS
    console.log('\n👤 Authentication & Authorization:');
    await this.testEndpoint('POST', '/api/auth/login', { email: 'admin@example.com', password: 'password' }, 'User Login');
    await this.testEndpoint('POST', '/api/auth/register', { name: 'Test User', email: 'test@example.com', password: 'password' }, 'User Registration');
    await this.testEndpoint('GET', '/api/auth/me', null, 'Current User Info');
    await this.testEndpoint('POST', '/api/auth/logout', null, 'User Logout');

    // MEMBERS ENDPOINTS
    console.log('\n👥 Members Management:');
    await this.testEndpoint('GET', '/api/members', null, 'List All Members');
    await this.testEndpoint('GET', '/api/members/stats', null, 'Member Statistics');
    await this.testEndpoint('GET', '/api/members/tags', null, 'Member Tags');
    await this.testEndpoint('POST', '/api/members', { 
      name: 'Test Member', 
      email: 'member@test.com', 
      phone: '123-456-7890',
      role: 'member'
    }, 'Create New Member');
    await this.testEndpoint('GET', '/api/members/mem-1', null, 'Get Specific Member');
    await this.testEndpoint('PUT', '/api/members/mem-1', { name: 'Updated Member' }, 'Update Member');

    // GROUPS ENDPOINTS
    console.log('\n👨‍👩‍👧‍👦 Groups Management:');
    await this.testEndpoint('GET', '/api/groups', null, 'List All Groups');
    await this.testEndpoint('GET', '/api/groups/stats', null, 'Group Statistics');
    await this.testEndpoint('POST', '/api/groups', {
      name: 'Test Group',
      description: 'Test Description',
      type: 'small_group',
      category: 'fellowship'
    }, 'Create New Group');
    await this.testEndpoint('GET', '/api/groups/grp-1', null, 'Get Specific Group');
    await this.testEndpoint('PUT', '/api/groups/grp-1', { name: 'Updated Group' }, 'Update Group');
    await this.testEndpoint('GET', '/api/groups/grp-1/members', null, 'Get Group Members');
    await this.testEndpoint('POST', '/api/groups/grp-1/members', { memberId: 'mem-1' }, 'Add Member to Group');
    await this.testEndpoint('DELETE', '/api/groups/grp-1/members/mem-1', null, 'Remove Member from Group');

    // EVENTS ENDPOINTS
    console.log('\n📅 Events Management:');
    await this.testEndpoint('GET', '/api/events', null, 'List All Events');
    await this.testEndpoint('POST', '/api/events', {
      title: 'Test Event',
      description: 'Test Description',
      startDate: '2024-12-01T10:00:00Z',
      endDate: '2024-12-01T12:00:00Z',
      location: 'Test Location'
    }, 'Create New Event');
    await this.testEndpoint('GET', '/api/events/evt-1', null, 'Get Specific Event');
    await this.testEndpoint('PUT', '/api/events/evt-1', { title: 'Updated Event' }, 'Update Event');
    await this.testEndpoint('GET', '/api/events/evt-1/registrations', null, 'Get Event Registrations');
    await this.testEndpoint('POST', '/api/events/evt-1/registrations', { memberId: 'mem-1' }, 'Register for Event');

    // JOURNEY TEMPLATES ENDPOINTS
    console.log('\n🌟 Journey Templates:');
    await this.testEndpoint('GET', '/api/journey-templates', null, 'List Journey Templates');
    await this.testEndpoint('POST', '/api/journey-templates', {
      title: 'Test Template',
      description: 'Test Description',
      category: 'discipleship',
      difficulty: 'beginner',
      estimatedDuration: 30
    }, 'Create Journey Template');
    await this.testEndpoint('GET', '/api/journey-templates/tpl-1', null, 'Get Specific Template');
    await this.testEndpoint('PUT', '/api/journey-templates/tpl-1', { title: 'Updated Template' }, 'Update Template');

    // MEMBER JOURNEYS ENDPOINTS
    console.log('\n🛤️ Member Journeys:');
    await this.testEndpoint('GET', '/api/journeys/member-journeys', null, 'List Member Journeys');
    await this.testEndpoint('POST', '/api/journeys/member-journeys', {
      memberId: 'mem-1',
      templateId: 'tpl-1',
      mentorId: 'mem-2'
    }, 'Assign Journey to Member');
    await this.testEndpoint('GET', '/api/journeys/member-journeys/jrn-1', null, 'Get Specific Member Journey');
    await this.testEndpoint('PUT', '/api/journeys/member-journeys/jrn-1', { status: 'in_progress' }, 'Update Journey Status');

    // SPIRITUAL JOURNEY EXTENSIONS
    console.log('\n🙏 Spiritual Journey Extensions:');
    await this.testEndpoint('GET', '/api/journeys/devotions', null, 'Get Daily Devotions');
    await this.testEndpoint('POST', '/api/journeys/devotions', {
      memberId: 'mem-1',
      bibleReading: 'John 3:16',
      reflection: 'Test reflection'
    }, 'Record Devotion Entry');
    await this.testEndpoint('GET', '/api/journeys/spiritual-gifts', null, 'Get Spiritual Gifts Assessment');
    await this.testEndpoint('POST', '/api/journeys/spiritual-gifts', {
      memberId: 'mem-1',
      responses: { teaching: 5, leadership: 4 }
    }, 'Submit Gifts Assessment');
    await this.testEndpoint('GET', '/api/journeys/serving-opportunities', null, 'Get Serving Opportunities');
    await this.testEndpoint('GET', '/api/journeys/milestones', null, 'Get Journey Milestones');
    await this.testEndpoint('GET', '/api/journeys/analytics', null, 'Get Journey Analytics');
    await this.testEndpoint('GET', '/api/journeys/reflections', null, 'Get Personal Reflections');

    // ATTENDANCE ENDPOINTS
    console.log('\n📋 Attendance Management:');
    await this.testEndpoint('GET', '/api/attendance', null, 'List Attendance Sessions');
    await this.testEndpoint('GET', '/api/attendance/stats', null, 'Attendance Statistics');
    await this.testEndpoint('POST', '/api/attendance', {
      groupId: 'grp-1',
      eventId: 'evt-1',
      date: '2024-12-01',
      attendees: [{ memberId: 'mem-1', status: 'present' }]
    }, 'Record Attendance Session');

    // PASTORAL CARE ENDPOINTS
    console.log('\n💙 Pastoral Care:');
    await this.testEndpoint('GET', '/api/care/prayer-requests', null, 'List Prayer Requests');
    await this.testEndpoint('POST', '/api/care/prayer-requests', {
      title: 'Test Prayer Request',
      description: 'Test Description',
      requesterId: 'mem-1',
      priority: 'medium'
    }, 'Create Prayer Request');
    await this.testEndpoint('GET', '/api/care/counseling-sessions', null, 'List Counseling Sessions');
    await this.testEndpoint('POST', '/api/care/counseling-sessions', {
      memberId: 'mem-1',
      counselorId: 'mem-2',
      scheduledDate: '2024-12-01T14:00:00Z',
      type: 'general'
    }, 'Schedule Counseling Session');
    await this.testEndpoint('GET', '/api/care/records', null, 'Get Care Records');

    // COMMUNICATIONS ENDPOINTS
    console.log('\n📧 Communications:');
    await this.testEndpoint('GET', '/api/communications/campaigns', null, 'List Email Campaigns');
    await this.testEndpoint('POST', '/api/communications/campaigns', {
      name: 'Test Campaign',
      subject: 'Test Subject',
      content: 'Test Content',
      recipientGroups: ['grp-1']
    }, 'Create Email Campaign');
    await this.testEndpoint('GET', '/api/communications/announcements', null, 'List Announcements');
    await this.testEndpoint('POST', '/api/communications/announcements', {
      title: 'Test Announcement',
      content: 'Test Content',
      priority: 'medium'
    }, 'Create Announcement');

    // TASKS ENDPOINTS
    console.log('\n📋 Tasks Management:');
    await this.testEndpoint('GET', '/api/tasks', null, 'List All Tasks');
    await this.testEndpoint('POST', '/api/tasks', {
      title: 'Test Task',
      description: 'Test Description',
      assignedTo: 'mem-1',
      dueDate: '2024-12-01',
      priority: 'medium'
    }, 'Create New Task');
    await this.testEndpoint('GET', '/api/tasks/tsk-1', null, 'Get Specific Task');
    await this.testEndpoint('PUT', '/api/tasks/tsk-1', { status: 'in_progress' }, 'Update Task Status');

    // REPORTS ENDPOINTS
    console.log('\n📊 Reports & Analytics:');
    await this.testEndpoint('GET', '/api/reports/dashboard', null, 'Dashboard Summary');
    await this.testEndpoint('GET', '/api/reports/members', null, 'Member Reports');
    await this.testEndpoint('GET', '/api/reports/groups', null, 'Group Reports');
    await this.testEndpoint('GET', '/api/reports/events', null, 'Event Reports');
    await this.testEndpoint('GET', '/api/reports/attendance', null, 'Attendance Reports');
    await this.testEndpoint('GET', '/api/reports/journeys', null, 'Journey Reports');
    await this.testEndpoint('GET', '/api/reports/engagement', null, 'Engagement Analytics');
  }

  async runFrontendRouteAudit() {
    console.log('\n🖥️ ===========================');
    console.log('🖥️ FRONTEND ROUTES AUDIT');
    console.log('🖥️ ===========================\n');

    // Main Application Routes
    await this.testFrontendRoute('/', 'Homepage/Dashboard');
    await this.testFrontendRoute('/login', 'Login Page');
    await this.testFrontendRoute('/register', 'Registration Page');
    await this.testFrontendRoute('/dashboard', 'Main Dashboard');

    // Member Management Routes
    console.log('\n👥 Member Management Routes:');
    await this.testFrontendRoute('/members', 'Members List');
    await this.testFrontendRoute('/members/new', 'Create Member');
    await this.testFrontendRoute('/members/mem-1', 'Member Detail');
    await this.testFrontendRoute('/members/mem-1/edit', 'Edit Member');

    // Group Management Routes
    console.log('\n👨‍👩‍👧‍👦 Group Management Routes:');
    await this.testFrontendRoute('/groups', 'Groups List');
    await this.testFrontendRoute('/groups/new', 'Create Group');
    await this.testFrontendRoute('/groups/grp-1', 'Group Detail');
    await this.testFrontendRoute('/groups/grp-1/edit', 'Edit Group');

    // Event Management Routes
    console.log('\n📅 Event Management Routes:');
    await this.testFrontendRoute('/events', 'Events List');
    await this.testFrontendRoute('/events/new', 'Create Event');
    await this.testFrontendRoute('/events/evt-1', 'Event Detail');
    await this.testFrontendRoute('/events/evt-1/edit', 'Edit Event');

    // Journey Templates Routes
    console.log('\n🌟 Journey Templates Routes:');
    await this.testFrontendRoute('/journey-templates', 'Journey Templates List');
    await this.testFrontendRoute('/journey-templates/new', 'Create Journey Template');
    await this.testFrontendRoute('/journey-templates/tpl-1', 'Journey Template Detail');

    // Member Journeys Routes
    console.log('\n🛤️ Member Journeys Routes:');
    await this.testFrontendRoute('/journeys', 'Member Journeys List');
    await this.testFrontendRoute('/journeys/assign', 'Assign Journey');
    await this.testFrontendRoute('/journeys/jrn-1', 'Journey Progress Detail');

    // Attendance Routes
    console.log('\n📋 Attendance Routes:');
    await this.testFrontendRoute('/attendance', 'Attendance Management');
    await this.testFrontendRoute('/attendance/new', 'Record Attendance');
    await this.testFrontendRoute('/attendance/session-1', 'Attendance Session Detail');

    // Pastoral Care Routes
    console.log('\n💙 Pastoral Care Routes:');
    await this.testFrontendRoute('/care', 'Pastoral Care Dashboard');
    await this.testFrontendRoute('/care/prayer-requests', 'Prayer Requests');
    await this.testFrontendRoute('/care/counseling', 'Counseling Sessions');

    // Communications Routes
    console.log('\n📧 Communications Routes:');
    await this.testFrontendRoute('/communications', 'Communications Dashboard');
    await this.testFrontendRoute('/communications/campaigns', 'Email Campaigns');
    await this.testFrontendRoute('/communications/announcements', 'Announcements');

    // Tasks Routes
    console.log('\n📋 Tasks Routes:');
    await this.testFrontendRoute('/tasks', 'Tasks Management');
    await this.testFrontendRoute('/tasks/new', 'Create Task');
    await this.testFrontendRoute('/tasks/tsk-1', 'Task Detail');

    // Reports Routes
    console.log('\n📊 Reports Routes:');
    await this.testFrontendRoute('/reports', 'Reports Dashboard');
    await this.testFrontendRoute('/reports/members', 'Member Reports');
    await this.testFrontendRoute('/reports/groups', 'Group Reports');

    // Additional Routes
    console.log('\n🔧 Additional Routes:');
    await this.testFrontendRoute('/settings', 'Settings');
    await this.testFrontendRoute('/profile', 'User Profile');
    await this.testFrontendRoute('/activity', 'Activity Feed');
  }

  generateComprehensiveReport() {
    const totalBackend = this.results.backend.passed + this.results.backend.failed;
    const totalFrontend = this.results.frontend.passed + this.results.frontend.failed;
    const backendSuccess = totalBackend > 0 ? ((this.results.backend.passed / totalBackend) * 100).toFixed(1) : 0;
    const frontendSuccess = totalFrontend > 0 ? ((this.results.frontend.passed / totalFrontend) * 100).toFixed(1) : 0;

    console.log('\n📋 ====================================');
    console.log('📋 COMPREHENSIVE PLATFORM AUDIT REPORT');
    console.log('📋 ====================================\n');

    console.log('🎯 BACKEND API RESULTS:');
    console.log(`   Total Endpoints Tested: ${totalBackend}`);
    console.log(`   ✅ Passed: ${this.results.backend.passed}`);
    console.log(`   ❌ Failed: ${this.results.backend.failed}`);
    console.log(`   📊 Success Rate: ${backendSuccess}%\n`);

    console.log('🖥️ FRONTEND ROUTES RESULTS:');
    console.log(`   Total Routes Tested: ${totalFrontend}`);
    console.log(`   ✅ Passed: ${this.results.frontend.passed}`);
    console.log(`   ❌ Failed: ${this.results.frontend.failed}`);
    console.log(`   📊 Success Rate: ${frontendSuccess}%\n`);

    if (this.results.backend.failed > 0) {
      console.log('❌ FAILED BACKEND ENDPOINTS:');
      this.results.backend.tests
        .filter(test => !test.success)
        .forEach(test => {
          console.log(`   ${test.method} ${test.endpoint} - ${test.description} (${test.status})`);
        });
      console.log('');
    }

    if (this.results.frontend.failed > 0) {
      console.log('❌ FAILED FRONTEND ROUTES:');
      this.results.frontend.tests
        .filter(test => !test.success)
        .forEach(test => {
          console.log(`   ${test.route} - ${test.description} (${test.status})`);
        });
      console.log('');
    }

    const overallSuccess = totalBackend + totalFrontend > 0 ? 
      (((this.results.backend.passed + this.results.frontend.passed) / (totalBackend + totalFrontend)) * 100).toFixed(1) : 0;

    console.log('🏁 OVERALL PLATFORM STATUS:');
    console.log(`   📊 Overall Success Rate: ${overallSuccess}%`);
    console.log(`   🔄 Total Tests Executed: ${totalBackend + totalFrontend}`);
    console.log(`   ✅ Total Passed: ${this.results.backend.passed + this.results.frontend.passed}`);
    console.log(`   ❌ Total Failed: ${this.results.backend.failed + this.results.frontend.failed}\n`);

    if (overallSuccess >= 95) {
      console.log('🎉 PLATFORM STATUS: PRODUCTION READY! ✅');
    } else if (overallSuccess >= 80) {
      console.log('⚠️ PLATFORM STATUS: NEEDS MINOR FIXES 🟡');
    } else {
      console.log('🚨 PLATFORM STATUS: CRITICAL ISSUES REQUIRE ATTENTION 🔴');
    }
  }

  async runCompleteAudit() {
    console.log('🚀 Starting Comprehensive Platform Audit...\n');
    
    await this.runCompleteBackendAudit();
    await this.runFrontendRouteAudit();
    this.generateComprehensiveReport();
    
    return this.results;
  }
}

// Execute the comprehensive audit
async function main() {
  const auditor = new PlatformAuditor();
  await auditor.runCompleteAudit();
}

main().catch(console.error);
