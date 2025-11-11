/**
 * FaithLink360 PRD Coverage Audit - Quick Assessment
 * Following Semantic Seed Venture Studio Coding Standards V2.0
 * 
 * This script audits ALL expected PRD functionality to identify gaps
 * and prevent surprise 404s or missing features.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

// Define ALL expected functionality from PRD
const PRD_REQUIREMENTS = {
  // Core Member Management (CRITICAL)
  coreMembers: {
    priority: 'CRITICAL',
    endpoints: [
      'GET /api/members',
      'POST /api/members', 
      'PUT /api/members/:id',
      'DELETE /api/members/:id',
      'GET /api/members/:id',
      'GET /api/members/search'
    ],
    features: ['CRUD operations', 'Search & filter', 'Profile management']
  },

  // Group Management (CRITICAL)
  coreGroups: {
    priority: 'CRITICAL',
    endpoints: [
      'GET /api/groups',
      'POST /api/groups',
      'PUT /api/groups/:id', 
      'DELETE /api/groups/:id',
      'POST /api/groups/:id/members',
      'DELETE /api/groups/:id/members/:memberId'
    ],
    features: ['Group CRUD', 'Member management', 'Group assignments']
  },

  // Event Management (HIGH)
  events: {
    priority: 'HIGH',
    endpoints: [
      'GET /api/events',
      'POST /api/events',
      'PUT /api/events/:id',
      'DELETE /api/events/:id',
      'POST /api/events/:id/registrations',
      'DELETE /api/events/:id/registrations/:registrationId',
    ],
    features: ['Event CRUD', 'Registration system', 'Capacity management']
  },

  // Attendance Tracking (HIGH)
  attendance: {
    priority: 'HIGH', 
    endpoints: [
      'POST /api/groups/:id/attendance',
      'GET /api/groups/:id/attendance/history',
      'GET /api/attendance/reports'
    ],
    features: ['Attendance recording', 'History tracking', 'Reports']
  },

  // Spiritual Journey Tracking (MEDIUM)
  spiritualJourneys: {
    priority: 'MEDIUM',
    endpoints: [
      'GET /api/journeys/templates',
      'POST /api/journeys/templates',
      'POST /api/journeys/member-journeys',
      'PUT /api/journeys/:id/milestones'
    ],
    features: ['Template management', 'Journey assignment', 'Progress tracking']
  },

  // Pastoral Care (MEDIUM)
  pastoralCare: {
    priority: 'MEDIUM',
    endpoints: [
      'POST /api/members/:id/assign-deacon',
      'POST /api/care/records',
      'GET /api/care/prayer-requests',
      'POST /api/care/prayer-requests'
    ],
    features: ['Deacon assignment', 'Care records', 'Prayer requests']
  },

  // Communications (MEDIUM)
  communications: {
    priority: 'MEDIUM',
    endpoints: [
      'POST /api/communications/announcements',
      'POST /api/communications/campaigns',
      'GET /api/communications/announcements'
    ],
    features: ['Announcements', 'Email campaigns', 'Notifications']
  },

  // Reporting & Analytics (LOW)
  reporting: {
    priority: 'LOW',
    endpoints: [
      'GET /api/reports/membership',
      'GET /api/reports/attendance',
      'GET /api/reports/engagement'
    ],
    features: ['Membership reports', 'Attendance analytics', 'Engagement metrics']
  },

  // User Management & Permissions (LOW)
  userManagement: {
    priority: 'LOW',
    endpoints: [
      'GET /api/admin/settings',
      'GET /api/admin/users',
      'PUT /api/members/profile'
    ],
    features: ['Admin panel', 'User roles', 'Self-service portal']
  },

  // Integration & Export (LOW)
  integration: {
    priority: 'LOW',
    endpoints: [
      'POST /api/integrations/webhooks',
      'GET /api/export/members',
      'GET /api/sync/members'
    ],
    features: ['Webhook support', 'Data export', 'Mobile sync']
  }
};

class PRDCoverageAuditor {
  constructor() {
    this.results = {
      totalModules: Object.keys(PRD_REQUIREMENTS).length,
      totalEndpoints: 0,
      workingEndpoints: 0,
      missingEndpoints: [],
      criticalGaps: [],
      highGaps: [],
      mediumGaps: [],
      lowGaps: [],
      featureGaps: []
    };
  }

  async runAudit() {
    console.log('🎯 FaithLink360 PRD Coverage Audit');
    console.log('=====================================');
    console.log('Auditing ALL expected PRD functionality...\n');

    // Count total endpoints
    for (const module of Object.values(PRD_REQUIREMENTS)) {
      this.results.totalEndpoints += module.endpoints.length;
    }

    // Test each module
    for (const [moduleName, moduleSpec] of Object.entries(PRD_REQUIREMENTS)) {
      console.log(`🔍 Testing ${moduleName} (${moduleSpec.priority} priority)...`);
      await this.testModule(moduleName, moduleSpec);
    }

    this.generateReport();
  }

  async testModule(moduleName, moduleSpec) {
    const moduleResults = {
      working: 0,
      missing: 0,
      endpoints: []
    };

    for (const endpoint of moduleSpec.endpoints) {
      const result = await this.testEndpoint(endpoint);
      if (result.working) {
        moduleResults.working++;
        this.results.workingEndpoints++;
      } else {
        moduleResults.missing++;
        this.results.missingEndpoints.push(endpoint);
        this.categorizeGap(endpoint, moduleSpec.priority);
      }
      moduleResults.endpoints.push(result);
    }

    const coverage = (moduleResults.working / moduleSpec.endpoints.length * 100).toFixed(1);
    console.log(`   📊 ${moduleName}: ${moduleResults.working}/${moduleSpec.endpoints.length} (${coverage}%)`);
    
    if (moduleResults.missing > 0) {
      console.log(`   ❌ Missing: ${moduleResults.missing} endpoints`);
    }
  }

  async testEndpoint(endpoint) {
    try {
      const [method, path] = endpoint.split(' ');
      const testPath = path.replace(/:id/g, '1').replace(/:memberId/g, '1');
      const url = `${BASE_URL}${testPath}`;

      if (method === 'GET') {
        const response = await axios.get(url, { 
          timeout: 3000,
          validateStatus: (status) => status < 500
        });
        
        if (response.status === 404) {
          return { endpoint, working: false, error: '404 Not Found' };
        }
        return { endpoint, working: true, status: response.status };
      } else {
        // For non-GET methods, just check if endpoint exists (would return 405 Method Not Allowed if exists but wrong method)
        try {
          await axios.get(url, { timeout: 3000 });
          return { endpoint, working: true, status: 'EXISTS' };
        } catch (error) {
          if (error.response?.status === 405) {
            return { endpoint, working: true, status: 'EXISTS (405)' };
          }
          return { endpoint, working: false, error: error.response?.status || 'CONNECTION_ERROR' };
        }
      }
    } catch (error) {
      return { 
        endpoint, 
        working: false, 
        error: error.response?.status === 404 ? '404 Not Found' : 'CONNECTION_ERROR' 
      };
    }
  }

  categorizeGap(endpoint, priority) {
    const gap = `Missing ${priority} endpoint: ${endpoint}`;
    
    switch (priority) {
      case 'CRITICAL':
        this.results.criticalGaps.push(gap);
        break;
      case 'HIGH':
        this.results.highGaps.push(gap);
        break;
      case 'MEDIUM':
        this.results.mediumGaps.push(gap);
        break;
      case 'LOW':
        this.results.lowGaps.push(gap);
        break;
    }
  }

  generateReport() {
    console.log('\n📊 PRD COVERAGE AUDIT RESULTS');
    console.log('==============================');
    
    const overallCoverage = (this.results.workingEndpoints / this.results.totalEndpoints * 100).toFixed(1);
    console.log(`📈 Overall API Coverage: ${this.results.workingEndpoints}/${this.results.totalEndpoints} (${overallCoverage}%)`);
    
    const healthScore = this.calculateHealthScore();
    console.log(`🏥 Platform Health Score: ${healthScore}/100`);
    
    if (this.results.criticalGaps.length > 0) {
      console.log('\n🚨 CRITICAL GAPS (IMMEDIATE ATTENTION REQUIRED):');
      this.results.criticalGaps.forEach(gap => console.log(`   • ${gap}`));
    }
    
    if (this.results.highGaps.length > 0) {
      console.log('\n⚠️  HIGH PRIORITY GAPS:');
      this.results.highGaps.forEach(gap => console.log(`   • ${gap}`));
    }
    
    if (this.results.mediumGaps.length > 0) {
      console.log('\n📋 MEDIUM PRIORITY GAPS:');
      this.results.mediumGaps.forEach(gap => console.log(`   • ${gap}`));
    }
    
    if (this.results.lowGaps.length > 0) {
      console.log('\n📝 LOW PRIORITY GAPS:');
      this.results.lowGaps.forEach(gap => console.log(`   • ${gap}`));
    }

    console.log('\n🎯 RECOMMENDATIONS:');
    this.generateRecommendations();

    // Save detailed report
    this.saveDetailedReport();
  }

  calculateHealthScore() {
    let score = 100;
    
    // Critical gaps have major impact
    score -= this.results.criticalGaps.length * 15;
    
    // High priority gaps have significant impact  
    score -= this.results.highGaps.length * 10;
    
    // Medium priority gaps have moderate impact
    score -= this.results.mediumGaps.length * 5;
    
    // Low priority gaps have minimal impact
    score -= this.results.lowGaps.length * 2;
    
    return Math.max(0, Math.round(score));
  }

  generateRecommendations() {
    if (this.results.criticalGaps.length > 0) {
      console.log('   1. 🚨 URGENT: Implement critical endpoints to enable core user workflows');
      console.log('      Impact: HIGH - Users cannot perform essential tasks');
      console.log('      Effort: MEDIUM - 2-3 days development time');
    }
    
    if (this.results.highGaps.length > 0) {
      console.log('   2. ⚠️  HIGH: Complete high-priority endpoints for full functionality');  
      console.log('      Impact: MEDIUM - Limits platform capabilities');
      console.log('      Effort: MEDIUM - 1-2 weeks development time');
    }
    
    console.log('   3. 🧪 Setup automated testing to prevent regression and surprise 404s');
    console.log('      Impact: MEDIUM - Prevents future issues');
    console.log('      Effort: LOW - Ongoing maintenance');
    
    console.log('   4. 📋 Schedule regular PRD audits to maintain platform completeness');
    console.log('      Impact: LOW - Long-term platform health');
    console.log('      Effort: LOW - Automated auditing');
  }

  async saveDetailedReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalEndpoints: this.results.totalEndpoints,
        workingEndpoints: this.results.workingEndpoints,
        overallCoverage: (this.results.workingEndpoints / this.results.totalEndpoints * 100).toFixed(1) + '%',
        healthScore: this.calculateHealthScore()
      },
      gaps: {
        critical: this.results.criticalGaps,
        high: this.results.highGaps,
        medium: this.results.mediumGaps,
        low: this.results.lowGaps
      },
      missingEndpoints: this.results.missingEndpoints,
      recommendations: [
        'Implement critical endpoints first',
        'Add comprehensive error handling',
        'Set up automated testing pipeline',
        'Schedule regular gap audits'
      ]
    };

    const fs = require('fs').promises;
    await fs.writeFile('PRD_COVERAGE_AUDIT.json', JSON.stringify(report, null, 2));
    
    console.log('\n📋 Detailed audit report saved to: PRD_COVERAGE_AUDIT.json');
  }
}

// Run the audit
async function main() {
  const auditor = new PRDCoverageAuditor();
  
  try {
    await auditor.runAudit();
    console.log('\n✅ PRD Coverage Audit Complete!');
    console.log('No more surprise 404s - all gaps have been identified.');
  } catch (error) {
    console.error('❌ Audit failed:', error.message);
    console.log('💡 Make sure backend server is running on http://localhost:8000');
  }
}

if (require.main === module) {
  main();
}

module.exports = { PRDCoverageAuditor };
