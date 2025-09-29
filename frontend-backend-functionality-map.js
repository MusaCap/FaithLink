const fs = require('fs');
const path = require('path');

class FunctionalityMapper {
  constructor() {
    this.frontendPath = './src/frontend/src';
    this.componentsMap = new Map();
    this.servicesMap = new Map();
    this.pagesMap = new Map();
    this.functionalityGaps = [];
  }

  // Analyze all frontend components and their backend dependencies
  async analyzeFrontendComponents() {
    console.log('🔍 ANALYZING FRONTEND COMPONENTS AND BACKEND DEPENDENCIES\n');
    
    // Define comprehensive component-to-endpoint mapping
    const componentEndpointMap = {
      // MEMBER MANAGEMENT
      'MemberList.tsx': {
        endpoints: ['GET /api/members', 'GET /api/members/stats'],
        status: 'WORKING',
        functionalFeatures: ['List members', 'Search members', 'Filter members', 'Member statistics'],
        missingFeatures: []
      },
      'MemberDetail.tsx': {
        endpoints: ['GET /api/members/:id'],
        status: 'BROKEN',
        functionalFeatures: [],
        missingFeatures: ['View member details', 'Member profile information', 'Member activity history']
      },
      'MemberForm.tsx': {
        endpoints: ['POST /api/members', 'PUT /api/members/:id'],
        status: 'PARTIALLY_WORKING',
        functionalFeatures: ['Create member form UI'],
        missingFeatures: ['Update existing members', 'Member profile editing']
      },

      // GROUP MANAGEMENT  
      'GroupList.tsx': {
        endpoints: ['GET /api/groups', 'GET /api/groups/stats'],
        status: 'WORKING',
        functionalFeatures: ['List groups', 'Search groups', 'Filter groups', 'Group statistics'],
        missingFeatures: []
      },
      'GroupDetail.tsx': {
        endpoints: ['GET /api/groups/:id', 'GET /api/groups/:id/members'],
        status: 'BROKEN',
        functionalFeatures: [],
        missingFeatures: ['View group details', 'Group member list', 'Group activity tracking']
      },
      'GroupForm.tsx': {
        endpoints: ['POST /api/groups', 'PUT /api/groups/:id'],
        status: 'PARTIALLY_WORKING',
        functionalFeatures: ['Create group form UI'],
        missingFeatures: ['Update existing groups', 'Group editing functionality']
      },
      'GroupMemberManagement.tsx': {
        endpoints: ['POST /api/groups/:id/members', 'DELETE /api/groups/:id/members/:memberId'],
        status: 'BROKEN',
        functionalFeatures: [],
        missingFeatures: ['Add members to groups', 'Remove members from groups', 'Member role management']
      },

      // EVENT MANAGEMENT
      'EventList.tsx': {
        endpoints: ['GET /api/events'],
        status: 'WORKING',
        functionalFeatures: ['List events', 'Search events', 'Filter events'],
        missingFeatures: []
      },
      'EventDetail.tsx': {
        endpoints: ['GET /api/events/:id', 'GET /api/events/:id/registrations'],
        status: 'BROKEN',
        functionalFeatures: [],
        missingFeatures: ['View event details', 'Event registration list', 'Event check-in']
      },
      'EventForm.tsx': {
        endpoints: ['POST /api/events', 'PUT /api/events/:id'],
        status: 'PARTIALLY_WORKING',
        functionalFeatures: ['Create event form UI'],
        missingFeatures: ['Update existing events', 'Event editing functionality']
      },
      'EventRegistration.tsx': {
        endpoints: ['POST /api/events/:id/registrations'],
        status: 'BROKEN',
        functionalFeatures: [],
        missingFeatures: ['Event registration', 'Registration confirmation', 'Registration management']
      },

      // JOURNEY TEMPLATES
      'JourneyTemplateList.tsx': {
        endpoints: ['GET /api/journey-templates'],
        status: 'WORKING',
        functionalFeatures: ['List journey templates', 'Search templates', 'Filter templates'],
        missingFeatures: []
      },
      'JourneyTemplateDetail.tsx': {
        endpoints: ['GET /api/journey-templates/:id'],
        status: 'BROKEN',
        functionalFeatures: ['Template detail page UI'],
        missingFeatures: ['Load template details', 'Template milestone display', 'Template statistics']
      },
      'JourneyTemplateForm.tsx': {
        endpoints: ['POST /api/journey-templates', 'PUT /api/journey-templates/:id'],
        status: 'PARTIALLY_WORKING',
        functionalFeatures: ['Create template form UI', 'Create new templates'],
        missingFeatures: ['Update existing templates', 'Template editing functionality']
      },

      // MEMBER JOURNEYS
      'MemberJourneyList.tsx': {
        endpoints: ['GET /api/journeys/member-journeys'],
        status: 'WORKING',
        functionalFeatures: ['List member journeys', 'Journey progress overview'],
        missingFeatures: []
      },
      'MemberJourneyDetail.tsx': {
        endpoints: ['GET /api/journeys/member-journeys/:id'],
        status: 'BROKEN',
        functionalFeatures: [],
        missingFeatures: ['View journey progress', 'Milestone tracking', 'Journey completion status']
      },
      'JourneyAssignment.tsx': {
        endpoints: ['POST /api/journeys/member-journeys'],
        status: 'BROKEN',
        functionalFeatures: [],
        missingFeatures: ['Assign journeys to members', 'Bulk journey assignment', 'Mentor assignment']
      },

      // SPIRITUAL JOURNEY EXTENSIONS
      'DailyDevotionsTracker.tsx': {
        endpoints: ['GET /api/journeys/devotions', 'POST /api/journeys/devotions'],
        status: 'BROKEN',
        functionalFeatures: [],
        missingFeatures: ['Daily devotions tracking', 'Reading plans', 'Devotion history', 'Streak tracking']
      },
      'SpiritualGiftsAssessment.tsx': {
        endpoints: ['GET /api/journeys/spiritual-gifts', 'POST /api/journeys/spiritual-gifts'],
        status: 'BROKEN',
        functionalFeatures: [],
        missingFeatures: ['Spiritual gifts assessment', 'Assessment results', 'Gift recommendations']
      },
      'ServingRoleFinder.tsx': {
        endpoints: ['GET /api/journeys/serving-opportunities'],
        status: 'BROKEN',
        functionalFeatures: [],
        missingFeatures: ['Ministry opportunities', 'Role matching', 'Service application']
      },

      // ATTENDANCE MANAGEMENT
      'AttendanceForm.tsx': {
        endpoints: ['POST /api/attendance'],
        status: 'BACKEND_ONLY',
        functionalFeatures: ['Backend attendance recording works'],
        missingFeatures: ['Attendance UI frontend', 'Attendance session management', 'Member check-in interface']
      },
      'AttendanceHistory.tsx': {
        endpoints: ['GET /api/attendance', 'GET /api/attendance/stats'],
        status: 'BACKEND_ONLY',
        functionalFeatures: ['Backend attendance data available'],
        missingFeatures: ['Attendance history UI', 'Attendance analytics interface', 'Attendance reports']
      },

      // PASTORAL CARE
      'PrayerRequestForm.tsx': {
        endpoints: ['POST /api/care/prayer-requests'],
        status: 'BACKEND_ONLY',
        functionalFeatures: ['Backend prayer request creation works'],
        missingFeatures: ['Prayer request UI frontend', 'Request management interface']
      },
      'PrayerRequestList.tsx': {
        endpoints: ['GET /api/care/prayer-requests'],
        status: 'BACKEND_ONLY',
        functionalFeatures: ['Backend prayer request data available'],
        missingFeatures: ['Prayer request list UI', 'Request status management', 'Prayer tracking']
      },
      'CounselingScheduler.tsx': {
        endpoints: ['GET /api/care/counseling-sessions', 'POST /api/care/counseling-sessions'],
        status: 'BACKEND_ONLY',
        functionalFeatures: ['Backend counseling session management works'],
        missingFeatures: ['Counseling scheduler UI', 'Session management interface', 'Counselor assignment']
      },
      'MemberCareTracker.tsx': {
        endpoints: ['GET /api/care/records'],
        status: 'BACKEND_ONLY',
        functionalFeatures: ['Backend care records available'],
        missingFeatures: ['Care tracking UI', 'Member care history interface', 'Care plan management']
      },

      // COMMUNICATIONS
      'EmailCampaignBuilder.tsx': {
        endpoints: ['GET /api/communications/campaigns', 'POST /api/communications/campaigns'],
        status: 'BACKEND_ONLY',
        functionalFeatures: ['Backend campaign management works'],
        missingFeatures: ['Campaign builder UI', 'Email template editor', 'Campaign analytics']
      },
      'AnnouncementBuilder.tsx': {
        endpoints: ['GET /api/communications/announcements', 'POST /api/communications/announcements'],
        status: 'BROKEN',
        functionalFeatures: [],
        missingFeatures: ['Announcement system', 'Announcement management UI', 'Announcement distribution']
      },

      // TASK MANAGEMENT
      'TaskList.tsx': {
        endpoints: ['GET /api/tasks'],
        status: 'WORKING',
        functionalFeatures: ['List tasks', 'Task overview'],
        missingFeatures: []
      },
      'TaskDetail.tsx': {
        endpoints: ['GET /api/tasks/:id'],
        status: 'BROKEN',
        functionalFeatures: [],
        missingFeatures: ['Task detail view', 'Task status management', 'Task assignment tracking']
      },
      'TaskCreateForm.tsx': {
        endpoints: ['POST /api/tasks', 'PUT /api/tasks/:id'],
        status: 'PARTIALLY_WORKING',
        functionalFeatures: ['Create task UI', 'Backend task creation works'],
        missingFeatures: ['Task creation frontend', 'Task editing functionality', 'Task assignment interface']
      },

      // REPORTS & ANALYTICS
      'DashboardReports.tsx': {
        endpoints: ['GET /api/reports/dashboard'],
        status: 'WORKING',
        functionalFeatures: ['Dashboard summary', 'Basic analytics'],
        missingFeatures: []
      },
      'MemberAnalytics.tsx': {
        endpoints: ['GET /api/reports/members'],
        status: 'BROKEN',
        functionalFeatures: [],
        missingFeatures: ['Member analytics', 'Member reports', 'Growth tracking']
      },
      'GroupAnalytics.tsx': {
        endpoints: ['GET /api/reports/groups'],
        status: 'BROKEN',
        functionalFeatures: [],
        missingFeatures: ['Group analytics', 'Group health reports', 'Group engagement metrics']
      },
      'AttendanceAnalytics.tsx': {
        endpoints: ['GET /api/reports/attendance'],
        status: 'BROKEN',
        functionalFeatures: [],
        missingFeatures: ['Attendance analytics', 'Attendance trends', 'Attendance reports']
      },
      'JourneyAnalytics.tsx': {
        endpoints: ['GET /api/reports/journeys'],
        status: 'BROKEN',
        functionalFeatures: [],
        missingFeatures: ['Journey analytics', 'Completion rates', 'Journey effectiveness reports']
      },

      // AUTHENTICATION
      'LoginForm.tsx': {
        endpoints: ['POST /api/auth/login'],
        status: 'WORKING',
        functionalFeatures: ['User login', 'Authentication'],
        missingFeatures: []
      },
      'RegisterForm.tsx': {
        endpoints: ['POST /api/auth/register'],
        status: 'BROKEN',
        functionalFeatures: [],
        missingFeatures: ['User registration', 'Account creation']
      }
    };

    return componentEndpointMap;
  }

  generateFunctionalityReport(componentMap) {
    console.log('📊 FRONTEND-BACKEND FUNCTIONALITY MAPPING REPORT\n');
    console.log('=' .repeat(80));

    const statusCounts = {
      WORKING: 0,
      PARTIALLY_WORKING: 0,
      BACKEND_ONLY: 0,
      BROKEN: 0
    };

    const functionalFeatures = [];
    const missingFeatures = [];

    // Categorize by status
    const categorized = {
      WORKING: [],
      PARTIALLY_WORKING: [],
      BACKEND_ONLY: [],
      BROKEN: []
    };

    Object.entries(componentMap).forEach(([component, details]) => {
      statusCounts[details.status]++;
      categorized[details.status].push({ component, ...details });
      functionalFeatures.push(...details.functionalFeatures);
      missingFeatures.push(...details.missingFeatures);
    });

    // Generate report sections
    console.log('🎯 OVERALL FUNCTIONALITY STATUS:');
    console.log(`   Total Components Analyzed: ${Object.keys(componentMap).length}`);
    console.log(`   ✅ Fully Working: ${statusCounts.WORKING} (${((statusCounts.WORKING / Object.keys(componentMap).length) * 100).toFixed(1)}%)`);
    console.log(`   🟡 Partially Working: ${statusCounts.PARTIALLY_WORKING} (${((statusCounts.PARTIALLY_WORKING / Object.keys(componentMap).length) * 100).toFixed(1)}%)`);
    console.log(`   🟠 Backend Only: ${statusCounts.BACKEND_ONLY} (${((statusCounts.BACKEND_ONLY / Object.keys(componentMap).length) * 100).toFixed(1)}%)`);
    console.log(`   ❌ Broken: ${statusCounts.BROKEN} (${((statusCounts.BROKEN / Object.keys(componentMap).length) * 100).toFixed(1)}%)\n`);

    const workingPercent = ((statusCounts.WORKING + statusCounts.PARTIALLY_WORKING * 0.5) / Object.keys(componentMap).length * 100).toFixed(1);
    console.log(`📈 EFFECTIVE FUNCTIONALITY RATE: ${workingPercent}%\n`);

    // Working Features
    console.log('✅ FULLY FUNCTIONAL COMPONENTS:');
    categorized.WORKING.forEach(item => {
      console.log(`   📦 ${item.component}`);
      console.log(`      Endpoints: ${item.endpoints.join(', ')}`);
      console.log(`      Features: ${item.functionalFeatures.join(', ')}\n`);
    });

    // Partially Working Features
    console.log('🟡 PARTIALLY WORKING COMPONENTS:');
    categorized.PARTIALLY_WORKING.forEach(item => {
      console.log(`   📦 ${item.component}`);
      console.log(`      Endpoints: ${item.endpoints.join(', ')}`);
      console.log(`      ✅ Working: ${item.functionalFeatures.join(', ')}`);
      console.log(`      ❌ Missing: ${item.missingFeatures.join(', ')}\n`);
    });

    // Backend Only Features
    console.log('🟠 BACKEND-ONLY COMPONENTS (Frontend UI Missing):');
    categorized.BACKEND_ONLY.forEach(item => {
      console.log(`   📦 ${item.component}`);
      console.log(`      Endpoints: ${item.endpoints.join(', ')}`);
      console.log(`      ✅ Backend: ${item.functionalFeatures.join(', ')}`);
      console.log(`      ❌ Missing UI: ${item.missingFeatures.join(', ')}\n`);
    });

    // Broken Features  
    console.log('❌ COMPLETELY BROKEN COMPONENTS:');
    categorized.BROKEN.forEach(item => {
      console.log(`   📦 ${item.component}`);
      console.log(`      Endpoints: ${item.endpoints.join(', ')}`);
      console.log(`      ❌ Missing: ${item.missingFeatures.join(', ')}\n`);
    });

    // Summary Statistics
    console.log('📊 FEATURE STATISTICS:');
    console.log(`   ✅ Total Functional Features: ${functionalFeatures.length}`);
    console.log(`   ❌ Total Missing Features: ${missingFeatures.length}`);
    console.log(`   📈 Feature Completion Rate: ${((functionalFeatures.length / (functionalFeatures.length + missingFeatures.length)) * 100).toFixed(1)}%\n`);

    // Critical Gaps Summary
    console.log('🚨 CRITICAL FUNCTIONALITY GAPS:');
    const criticalGaps = [
      'Individual resource detail views (members, groups, events)',
      'Resource editing functionality (update operations)',
      'Group member management (add/remove members)',
      'Event registration system',
      'Journey assignment and tracking',
      'Complete spiritual journey extensions module',
      'Attendance management UI',
      'Pastoral care user interfaces',
      'Task management UI completion',
      'Advanced reporting and analytics'
    ];
    
    criticalGaps.forEach((gap, index) => {
      console.log(`   ${index + 1}. ${gap}`);
    });

    console.log('\n' + '=' .repeat(80));
    console.log('🎯 CONCLUSION: Platform requires significant development to complete functionality');
    console.log('   Priority: Focus on CRUD operations and core user workflows first');
    console.log('=' .repeat(80));

    return {
      statusCounts,
      workingPercent: parseFloat(workingPercent),
      functionalFeatures: functionalFeatures.length,
      missingFeatures: missingFeatures.length,
      categorized
    };
  }

  async runCompleteAnalysis() {
    const componentMap = await this.analyzeFrontendComponents();
    const report = this.generateFunctionalityReport(componentMap);
    return { componentMap, report };
  }
}

// Execute the analysis
async function main() {
  const mapper = new FunctionalityMapper();
  await mapper.runCompleteAnalysis();
}

main().catch(console.error);
