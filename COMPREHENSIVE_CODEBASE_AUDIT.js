const fs = require('fs');
const path = require('path');

class ComprehensiveCodebaseAudit {
  constructor() {
    this.projectRoot = __dirname;
    this.audit = {
      prd_requirements: [],
      backend_modules: {},
      frontend_modules: {},
      components: {},
      services: {},
      database: {},
      testing: {},
      documentation: {},
      infrastructure: {},
      gaps: [],
      recommendations: []
    };
  }

  // PRD Requirements from the document
  getPRDRequirements() {
    return [
      {
        module: "Member Management",
        requirements: [
          "Create, edit, search member profiles",
          "Fields: name, email, phone, age, gender, address, marital status, spiritual status, family connections, ministries, interests",
          "Upload profile photo",
          "Attach spiritual journey and care history", 
          "Assign to groups",
          "Tag system for custom attributes"
        ]
      },
      {
        module: "Spiritual Journey Mapping",
        requirements: [
          "Predefined and customizable journey templates",
          "Milestones (baptism, membership class, leadership training)",
          "Assign journey stages to individuals",
          "Auto-progressions and manual updates",
          "Flag for pastoral follow-up",
          "Journey analytics dashboard"
        ]
      },
      {
        module: "Group Management", 
        requirements: [
          "Create/edit/delete groups",
          "Assign members and leaders to groups",
          "Track attendance (manual or check-in)",
          "Share files, messages, and notes within groups",
          "View engagement analytics per group"
        ]
      },
      {
        module: "Communication Center",
        requirements: [
          "Send group or individual messages via Email/SMS/In-app",
          "Create message templates",
          "Track delivery/open rates",
          "Schedule messages",
          "Smart segmentation"
        ]
      },
      {
        module: "Events & Attendance",
        requirements: [
          "Create/edit events",
          "RSVP and check-in features",
          "Attendance dashboard",
          "Calendar view (monthly, weekly)"
        ]
      },
      {
        module: "Care Management",
        requirements: [
          "Log and track care visits, prayer requests, counseling sessions",
          "Assign care follow-ups",
          "Confidential notes (role-based access)",
          "Care activity history per member",
          "Flag members for urgent needs"
        ]
      },
      {
        module: "Dashboards & Reporting",
        requirements: [
          "Admin dashboard: overall engagement, churn risk, group health",
          "Member dashboard: milestones completed, attendance rate",
          "Custom filters: age, activity level, group, life stage",
          "Export reports (CSV/PDF)"
        ]
      }
    ];
  }

  // Check if file exists
  fileExists(relativePath) {
    const fullPath = path.join(this.projectRoot, relativePath);
    return fs.existsSync(fullPath);
  }

  // Check if directory exists and count files
  auditDirectory(relativePath, description) {
    const fullPath = path.join(this.projectRoot, relativePath);
    if (!fs.existsSync(fullPath)) {
      return { exists: false, files: 0, description };
    }
    
    const files = fs.readdirSync(fullPath, { withFileTypes: true });
    const tsxFiles = files.filter(f => f.name.endsWith('.tsx')).length;
    const tsFiles = files.filter(f => f.name.endsWith('.ts')).length;
    const jsFiles = files.filter(f => f.name.endsWith('.js')).length;
    
    return {
      exists: true,
      files: files.length,
      tsxFiles,
      tsFiles,
      jsFiles,
      description,
      fileList: files.map(f => f.name)
    };
  }

  // Audit backend endpoints
  auditBackendEndpoints() {
    console.log('🔍 Auditing Backend API Endpoints...');
    
    if (!this.fileExists('src/backend/server-production.js')) {
      return { exists: false, endpoints: [] };
    }

    const serverFile = path.join(this.projectRoot, 'src/backend/server-production.js');
    const content = fs.readFileSync(serverFile, 'utf8');
    
    // Extract API endpoints
    const getEndpoints = content.match(/app\.get\(['"`]([^'"`]+)['"`]/g) || [];
    const postEndpoints = content.match(/app\.post\(['"`]([^'"`]+)['"`]/g) || [];
    const putEndpoints = content.match(/app\.put\(['"`]([^'"`]+)['"`]/g) || [];
    const deleteEndpoints = content.match(/app\.delete\(['"`]([^'"`]+)['"`]/g) || [];
    
    return {
      exists: true,
      get: getEndpoints.length,
      post: postEndpoints.length, 
      put: putEndpoints.length,
      delete: deleteEndpoints.length,
      total: getEndpoints.length + postEndpoints.length + putEndpoints.length + deleteEndpoints.length,
      endpoints: {
        GET: getEndpoints,
        POST: postEndpoints,
        PUT: putEndpoints,
        DELETE: deleteEndpoints
      }
    };
  }

  // Audit frontend pages
  auditFrontendPages() {
    console.log('🔍 Auditing Frontend Pages...');
    
    const pagesDir = 'src/frontend/src/app';
    const pages = this.auditDirectory(pagesDir, 'Next.js App Router Pages');
    
    return pages;
  }

  // Audit components
  auditComponents() {
    console.log('🔍 Auditing React Components...');
    
    const componentsDir = 'src/frontend/src/components';
    const components = this.auditDirectory(componentsDir, 'React Components');
    
    return components;
  }

  // Audit services
  auditServices() {
    console.log('🔍 Auditing Frontend Services...');
    
    const servicesDir = 'src/frontend/src/services';
    const services = this.auditDirectory(servicesDir, 'Frontend API Services');
    
    return services;
  }

  // Map implementation to PRD requirements
  mapPRDToImplementation() {
    console.log('🔍 Mapping PRD Requirements to Implementation...');
    
    const prdRequirements = this.getPRDRequirements();
    const implementation = {};
    
    prdRequirements.forEach(module => {
      implementation[module.module] = {
        requirements: module.requirements,
        implementation_status: {},
        completeness: 0
      };
      
      // Check specific implementations for each module
      switch(module.module) {
        case "Member Management":
          implementation[module.module].implementation_status = {
            "Create, edit, search member profiles": this.fileExists('src/frontend/src/components/members/MemberForm.tsx'),
            "Profile fields": this.fileExists('src/frontend/src/types/member.ts'),
            "Upload profile photo": this.checkFeatureInFile('src/frontend/src/components/members/MemberForm.tsx', 'photo'),
            "Attach spiritual journey": this.checkFeatureInFile('src/frontend/src/types/member.ts', 'spiritualJourney'),
            "Assign to groups": this.checkFeatureInFile('src/frontend/src/types/member.ts', 'groupMemberships'),
            "Tag system": this.checkFeatureInFile('src/frontend/src/types/member.ts', 'tags')
          };
          break;
          
        case "Spiritual Journey Mapping":
          implementation[module.module].implementation_status = {
            "Journey templates": this.fileExists('src/frontend/src/app/journey-templates/page.tsx'),
            "Milestones": this.checkFeatureInFile('src/backend/data/production-seed.js', 'milestones'),
            "Assign journey stages": this.fileExists('src/frontend/src/app/journeys/assign/page.tsx'),
            "Manual updates": this.fileExists('src/frontend/src/components/journey/JourneyProgress.tsx'),
            "Analytics dashboard": this.fileExists('src/frontend/src/components/reports/MemberEngagementMetrics.tsx')
          };
          break;
          
        case "Group Management":
          implementation[module.module].implementation_status = {
            "CRUD groups": this.fileExists('src/frontend/src/app/groups/new/page.tsx'),
            "Assign members/leaders": this.fileExists('src/frontend/src/components/groups'),
            "Track attendance": this.fileExists('src/frontend/src/components/attendance'),
            "Share files/messages": this.checkFeatureInFile('src/frontend/src/types/group.ts', 'files'),
            "Engagement analytics": this.fileExists('src/frontend/src/components/reports/GroupHealthDashboard.tsx')
          };
          break;
          
        case "Communication Center":
          implementation[module.module].implementation_status = {
            "Send messages": this.fileExists('src/frontend/src/app/communications/new/page.tsx'),
            "Message templates": this.checkBackendEndpoint('communications/templates'),
            "Track delivery/open rates": this.checkBackendEndpoint('communications/analytics'),
            "Schedule messages": this.checkFeatureInFile('src/frontend/src/app/communications/new/page.tsx', 'schedule'),
            "Smart segmentation": this.checkFeatureInFile('src/frontend/src/app/communications/new/page.tsx', 'groups')
          };
          break;
          
        case "Events & Attendance":
          implementation[module.module].implementation_status = {
            "Create/edit events": this.fileExists('src/frontend/src/app/events/new/page.tsx'),
            "RSVP features": this.fileExists('src/frontend/src/components/events/RSVPTracker.tsx'),
            "Check-in features": this.fileExists('src/frontend/src/components/events/EventCheckIn.tsx'),
            "Attendance dashboard": this.fileExists('src/frontend/src/components/reports/AttendanceAnalytics.tsx'),
            "Calendar view": this.fileExists('src/frontend/src/app/events/page.tsx')
          };
          break;
          
        case "Care Management":
          implementation[module.module].implementation_status = {
            "Log care visits": this.fileExists('src/frontend/src/components/care/MemberCareTracker.tsx'),
            "Prayer requests": this.fileExists('src/frontend/src/components/care/PrayerRequestForm.tsx'),
            "Counseling sessions": this.fileExists('src/frontend/src/components/care/CounselingScheduler.tsx'),
            "Care follow-ups": this.checkFeatureInFile('src/frontend/src/components/care/MemberCareTracker.tsx', 'followUp'),
            "Care history": this.checkFeatureInFile('src/frontend/src/types/member.ts', 'careHistory')
          };
          break;
          
        case "Dashboards & Reporting":
          implementation[module.module].implementation_status = {
            "Admin dashboard": this.fileExists('src/frontend/src/components/dashboard/AdminDashboard.tsx'),
            "Member dashboard": this.fileExists('src/frontend/src/components/dashboard/MemberDashboard.tsx'),
            "Custom filters": this.checkFeatureInFile('src/frontend/src/types/member.ts', 'MemberSearchFilters'),
            "Export reports": this.checkFeatureInFile('src/frontend/src/components/reports', 'export')
          };
          break;
      }
      
      // Calculate completeness
      const statuses = Object.values(implementation[module.module].implementation_status);
      const completed = statuses.filter(status => status === true).length;
      implementation[module.module].completeness = Math.round((completed / statuses.length) * 100);
    });
    
    return implementation;
  }

  // Check if feature exists in file
  checkFeatureInFile(filePath, feature) {
    if (!this.fileExists(filePath)) return false;
    
    try {
      const fullPath = path.join(this.projectRoot, filePath);
      const content = fs.readFileSync(fullPath, 'utf8');
      return content.toLowerCase().includes(feature.toLowerCase());
    } catch (error) {
      return false;
    }
  }

  // Check if backend endpoint exists
  checkBackendEndpoint(endpoint) {
    if (!this.fileExists('src/backend/server-production.js')) return false;
    
    try {
      const serverFile = path.join(this.projectRoot, 'src/backend/server-production.js');
      const content = fs.readFileSync(serverFile, 'utf8');
      return content.includes(`/api/${endpoint}`);
    } catch (error) {
      return false;
    }
  }

  // Generate comprehensive audit report
  async generateAuditReport() {
    console.log('🚀 Starting Comprehensive FaithLink360 Codebase Audit');
    console.log('=' .repeat(60));
    
    // Audit all components
    const backendEndpoints = this.auditBackendEndpoints();
    const frontendPages = this.auditFrontendPages();
    const components = this.auditComponents();
    const services = this.auditServices();
    const prdMapping = this.mapPRDToImplementation();
    
    // Additional audits
    const database = this.auditDirectory('src/backend/data', 'Database/Seed Data');
    const tests = this.auditDirectory('tests', 'Test Files');
    const docs = this.auditDirectory('.', 'Documentation').fileList.filter(f => f.endsWith('.md'));
    
    console.log('\n📊 === CODEBASE AUDIT RESULTS ===');
    console.log('=' .repeat(40));
    
    console.log('\n🔧 BACKEND INFRASTRUCTURE:');
    console.log(`📡 API Endpoints: ${backendEndpoints.total} total`);
    console.log(`   • GET: ${backendEndpoints.get}`);
    console.log(`   • POST: ${backendEndpoints.post}`);
    console.log(`   • PUT: ${backendEndpoints.put}`);
    console.log(`   • DELETE: ${backendEndpoints.delete}`);
    
    console.log('\n🎨 FRONTEND ARCHITECTURE:');
    console.log(`📄 Pages: ${frontendPages.tsxFiles} TSX files`);
    console.log(`🧩 Components: ${components.tsxFiles} TSX files`);
    console.log(`⚙️  Services: ${services.tsFiles} TS files`);
    
    console.log('\n📊 PRD COMPLIANCE ANALYSIS:');
    let totalRequirements = 0;
    let completedRequirements = 0;
    
    Object.entries(prdMapping).forEach(([module, data]) => {
      const moduleRequirements = Object.keys(data.implementation_status).length;
      const moduleCompleted = Object.values(data.implementation_status).filter(s => s === true).length;
      
      totalRequirements += moduleRequirements;
      completedRequirements += moduleCompleted;
      
      console.log(`${data.completeness >= 80 ? '✅' : data.completeness >= 60 ? '⚠️' : '❌'} ${module}: ${data.completeness}% (${moduleCompleted}/${moduleRequirements})`);
    });
    
    const overallCompliance = Math.round((completedRequirements / totalRequirements) * 100);
    
    console.log('\n🎯 OVERALL RESULTS:');
    console.log(`📈 PRD Compliance: ${overallCompliance}% (${completedRequirements}/${totalRequirements})`);
    console.log(`📚 Documentation: ${docs.length} markdown files`);
    console.log(`🧪 Testing: ${tests.exists ? `${tests.files} test files` : 'No tests found'}`);
    console.log(`💾 Database: ${database.exists ? `${database.files} data files` : 'No database files'}`);
    
    // Gap Analysis
    console.log('\n⚠️  === GAP ANALYSIS ===');
    Object.entries(prdMapping).forEach(([module, data]) => {
      const gaps = Object.entries(data.implementation_status)
        .filter(([req, status]) => status === false)
        .map(([req]) => req);
      
      if (gaps.length > 0) {
        console.log(`\n❌ ${module} GAPS:`);
        gaps.forEach(gap => console.log(`   • ${gap}`));
      }
    });
    
    // Recommendations
    console.log('\n💡 === RECOMMENDATIONS FOR 100% COMPLIANCE ===');
    
    if (overallCompliance >= 90) {
      console.log('🌟 EXCELLENT: Platform is near production-ready!');
      console.log('• Focus on polishing remaining features');
      console.log('• Add comprehensive testing suite');
      console.log('• Enhance documentation');
    } else if (overallCompliance >= 75) {
      console.log('✅ GOOD: Strong foundation with some gaps');
      console.log('• Prioritize high-impact missing features');
      console.log('• Complete core module implementations');
      console.log('• Add integration testing');
    } else {
      console.log('⚠️  NEEDS WORK: Significant development required');
      console.log('• Focus on core module completion first');
      console.log('• Implement missing CRUD operations');
      console.log('• Build out component libraries');
    }
    
    console.log('\n🎯 NEXT PRIORITIES:');
    console.log('1. Complete missing PRD requirements');
    console.log('2. Add comprehensive error handling');
    console.log('3. Implement data export/import features');
    console.log('4. Add mobile optimization');
    console.log('5. Implement advanced analytics');
    
    return {
      overallCompliance,
      backendEndpoints: backendEndpoints.total,
      frontendPages: frontendPages.tsxFiles,
      components: components.tsxFiles,
      prdMapping,
      recommendations: overallCompliance >= 90 ? 'Production Ready' : overallCompliance >= 75 ? 'Near Complete' : 'Needs Development'
    };
  }
}

// Run the comprehensive audit
const auditor = new ComprehensiveCodebaseAudit();
auditor.generateAuditReport().catch(console.error);
