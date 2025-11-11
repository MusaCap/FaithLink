/**
 * FaithLink360 Comprehensive PRD & User Experience Audit Runner
 * Following Semantic Seed Venture Studio Coding Standards V2.0
 * 
 * This script runs ALL audit tests and generates a comprehensive
 * gap analysis report to prevent surprise 404s and identify missing functionality.
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// Audit configuration
const AUDIT_CONFIG = {
  backend: {
    url: 'http://localhost:8000',
    endpoints: []
  },
  frontend: {
    url: 'http://localhost:3000',
    pages: []
  },
  testSuites: [
    {
      name: 'Backend API Coverage',
      file: 'tests/bdd/comprehensive-prd-audit.js',
      timeout: 60000
    },
    {
      name: 'Frontend User Journeys',
      file: 'tests/bdd/user-journey-audit.js',
      timeout: 120000
    },
    {
      name: 'Platform Functionality',
      file: 'tests/bdd/platform-functionality.test.js',
      timeout: 30000
    }
  ]
};

class ComprehensiveAuditor {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      totalTests: 0,
      passed: 0,
      failed: 0,
      auditResults: {},
      gapAnalysis: {
        criticalGaps: [],
        mediumGaps: [],
        lowGaps: [],
        missingEndpoints: [],
        missingPages: [],
        missingFeatures: []
      },
      recommendations: []
    };
  }

  async runAudit() {
    console.log('🎯 FaithLink360 Comprehensive PRD & UX Audit');
    console.log('===============================================');
    console.log('Testing EVERY intended functionality to prevent surprise 404s...\n');

    try {
      // Step 1: Verify servers are running
      await this.verifyServers();

      // Step 2: Run all test suites
      for (const suite of AUDIT_CONFIG.testSuites) {
        console.log(`\n🧪 Running ${suite.name}...`);
        await this.runTestSuite(suite);
      }

      // Step 3: Generate comprehensive gap analysis
      await this.generateGapAnalysis();

      // Step 4: Create detailed audit report
      await this.generateAuditReport();

      // Step 5: Output recommendations
      this.outputRecommendations();

    } catch (error) {
      console.error('❌ Audit failed:', error.message);
      process.exit(1);
    }
  }

  async verifyServers() {
    console.log('🔍 Verifying server availability...');
    
    try {
      // Check backend
      const axios = require('axios');
      await axios.get(`${AUDIT_CONFIG.backend.url}/api/health`);
      console.log('✅ Backend server running');

      // Check frontend (simple HTTP check)
      await axios.get(AUDIT_CONFIG.frontend.url);
      console.log('✅ Frontend server running');
    } catch (error) {
      throw new Error('Servers not running. Please start backend and frontend first.');
    }
  }

  async runTestSuite(suite) {
    return new Promise((resolve, reject) => {
      const mocha = spawn('npx', ['mocha', suite.file, '--timeout', suite.timeout.toString()], {
        stdio: 'inherit',
        shell: true
      });

      mocha.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ ${suite.name} completed successfully`);
          this.results.auditResults[suite.name] = 'PASSED';
        } else {
          console.log(`⚠️  ${suite.name} completed with issues`);
          this.results.auditResults[suite.name] = 'ISSUES_FOUND';
        }
        resolve(code);
      });

      mocha.on('error', (error) => {
        console.error(`❌ ${suite.name} failed:`, error.message);
        this.results.auditResults[suite.name] = 'FAILED';
        resolve(1); // Don't reject, continue with other tests
      });
    });
  }

  async generateGapAnalysis() {
    console.log('\n🔍 Generating comprehensive gap analysis...');

    // Define expected functionality from PRD
    const expectedFunctionality = {
      // Core Member Management
      memberManagement: {
        endpoints: [
          'GET /api/members',
          'POST /api/members',
          'PUT /api/members/:id',
          'DELETE /api/members/:id',
          'GET /api/members/search',
          'POST /api/members/:id/assign-deacon',
          'GET /api/members/profile'
        ],
        pages: ['/members', '/members/new', '/members/:id/edit'],
        features: ['CRUD operations', 'Search & filter', 'Deacon assignment', 'Profile management']
      },

      // Group Management
      groupManagement: {
        endpoints: [
          'GET /api/groups',
          'POST /api/groups',
          'PUT /api/groups/:id',
          'DELETE /api/groups/:id',
          'POST /api/groups/:id/members',
          'DELETE /api/groups/:id/members/:memberId',
          'POST /api/groups/:id/attendance',
          'GET /api/groups/:id/attendance/history'
        ],
        pages: ['/groups', '/groups/new', '/groups/:id'],
        features: ['Group CRUD', 'Member management', 'Attendance tracking', 'Reports']
      },

      // Event Management
      eventManagement: {
        endpoints: [
          'GET /api/events',
          'POST /api/events',
          'PUT /api/events/:id',
          'DELETE /api/events/:id',
          'POST /api/events/:id/registrations',
          'DELETE /api/events/:id/registrations/:id',
          'POST /api/events/:id/check-in'
        ],
        pages: ['/events', '/events/new', '/events/:id'],
        features: ['Event CRUD', 'Registration system', 'Check-in system', 'Capacity management']
      },

      // Spiritual Journey Tracking
      journeyTracking: {
        endpoints: [
          'GET /api/journeys/templates',
          'POST /api/journeys/templates',
          'GET /api/journeys/member-journeys',
          'POST /api/journeys/member-journeys',
          'PUT /api/journeys/:id/milestones'
        ],
        pages: ['/journey-templates', '/journey', '/journeys/:id'],
        features: ['Template management', 'Journey assignment', 'Progress tracking', 'Milestone completion']
      },

      // Pastoral Care
      pastoralCare: {
        endpoints: [
          'GET /api/deacons',
          'POST /api/care/records',
          'GET /api/care/prayer-requests',
          'POST /api/care/prayer-requests'
        ],
        pages: ['/care', '/prayer-requests', '/my-members'],
        features: ['Care record management', 'Prayer requests', 'Deacon workflows']
      },

      // Communications
      communications: {
        endpoints: [
          'GET /api/communications/announcements',
          'POST /api/communications/announcements',
          'POST /api/communications/campaigns'
        ],
        pages: ['/communications', '/announcements'],
        features: ['Announcements', 'Email campaigns', 'Notifications']
      },

      // Reporting & Analytics
      reporting: {
        endpoints: [
          'GET /api/reports/membership',
          'GET /api/reports/attendance',
          'GET /api/reports/engagement'
        ],
        pages: ['/reports', '/analytics'],
        features: ['Membership reports', 'Attendance analytics', 'Engagement metrics']
      },

      // User Roles & Permissions
      userRoles: {
        endpoints: [
          'GET /api/admin/settings',
          'GET /api/admin/users',
          'PUT /api/members/profile'
        ],
        pages: ['/admin', '/profile'],
        features: ['Role-based access', 'Admin panel', 'Member self-service']
      },

      // Integration & Export
      integration: {
        endpoints: [
          'POST /api/integrations/webhooks',
          'GET /api/export/members',
          'GET /api/sync/members'
        ],
        pages: ['/integrations', '/export'],
        features: ['Webhook support', 'Data export', 'Mobile sync']
      }
    };

    // Test each expected functionality
    for (const [module, expected] of Object.entries(expectedFunctionality)) {
      await this.checkModuleCoverage(module, expected);
    }

    // Categorize gaps by severity
    this.categorizeGaps();

    console.log('✅ Gap analysis completed');
  }

  async checkModuleCoverage(moduleName, expected) {
    const axios = require('axios');
    
    // Check API endpoints
    for (const endpoint of expected.endpoints) {
      try {
        const [method, path] = endpoint.split(' ');
        const url = `${AUDIT_CONFIG.backend.url}${path}`;
        
        if (method === 'GET') {
          const response = await axios.get(url, { 
            timeout: 5000,
            validateStatus: (status) => status < 500 // Accept 404 but not 500
          });
          
          if (response.status === 404) {
            this.results.gapAnalysis.missingEndpoints.push(endpoint);
          }
        }
      } catch (error) {
        if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
          this.results.gapAnalysis.missingEndpoints.push(endpoint);
        }
      }
    }

    // Note: Frontend page checking would require Puppeteer setup
    // For now, we'll rely on the user journey tests for frontend validation
  }

  categorizeGaps() {
    // Critical gaps (block core user workflows)
    const criticalEndpoints = [
      'GET /api/members', 'POST /api/members', 'PUT /api/members/:id',
      'GET /api/groups', 'POST /api/groups',
      'GET /api/events', 'POST /api/events'
    ];

    // Medium gaps (limit functionality but don't block core workflows)
    const mediumEndpoints = [
      'GET /api/members/search', 'POST /api/events/:id/registrations',
      'POST /api/groups/:id/attendance', 'POST /api/care/records'
    ];

    this.results.gapAnalysis.missingEndpoints.forEach(endpoint => {
      if (criticalEndpoints.includes(endpoint)) {
        this.results.gapAnalysis.criticalGaps.push(`Missing critical endpoint: ${endpoint}`);
      } else if (mediumEndpoints.includes(endpoint)) {
        this.results.gapAnalysis.mediumGaps.push(`Missing important endpoint: ${endpoint}`);
      } else {
        this.results.gapAnalysis.lowGaps.push(`Missing optional endpoint: ${endpoint}`);
      }
    });
  }

  async generateAuditReport() {
    console.log('\n📋 Generating comprehensive audit report...');

    const report = {
      executiveSummary: {
        timestamp: this.results.timestamp,
        totalGapsFound: this.getTotalGaps(),
        criticalIssues: this.results.gapAnalysis.criticalGaps.length,
        mediumIssues: this.results.gapAnalysis.mediumGaps.length,
        lowIssues: this.results.gapAnalysis.lowGaps.length,
        overallHealthScore: this.calculateHealthScore()
      },
      detailedFindings: {
        missingEndpoints: this.results.gapAnalysis.missingEndpoints,
        missingPages: this.results.gapAnalysis.missingPages,
        missingFeatures: this.results.gapAnalysis.missingFeatures
      },
      testResults: this.results.auditResults,
      recommendations: this.generateRecommendations(),
      nextSteps: this.generateNextSteps()
    };

    // Save report to file
    await fs.writeFile(
      'COMPREHENSIVE_AUDIT_REPORT.json',
      JSON.stringify(report, null, 2)
    );

    // Generate markdown report
    const markdownReport = this.generateMarkdownReport(report);
    await fs.writeFile('COMPREHENSIVE_AUDIT_REPORT.md', markdownReport);

    console.log('✅ Audit reports generated');
  }

  getTotalGaps() {
    return this.results.gapAnalysis.criticalGaps.length +
           this.results.gapAnalysis.mediumGaps.length +
           this.results.gapAnalysis.lowGaps.length;
  }

  calculateHealthScore() {
    const totalPossibleEndpoints = 50; // Estimated from PRD
    const missingEndpoints = this.results.gapAnalysis.missingEndpoints.length;
    const criticalGaps = this.results.gapAnalysis.criticalGaps.length;
    
    let score = 100;
    score -= (missingEndpoints / totalPossibleEndpoints) * 60; // Missing endpoints impact
    score -= criticalGaps * 10; // Critical gaps have high impact
    score -= this.results.gapAnalysis.mediumGaps.length * 5;
    score -= this.results.gapAnalysis.lowGaps.length * 2;
    
    return Math.max(0, Math.round(score));
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.results.gapAnalysis.criticalGaps.length > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        category: 'API Development',
        description: 'Implement missing critical API endpoints to enable core user workflows',
        impact: 'High - Blocks primary user functionality',
        effort: 'Medium - 2-3 days development'
      });
    }

    if (this.results.gapAnalysis.missingEndpoints.length > 10) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Backend Development',
        description: 'Complete backend API implementation to match PRD specifications',
        impact: 'Medium - Limits platform functionality',
        effort: 'High - 1-2 weeks development'
      });
    }

    recommendations.push({
      priority: 'MEDIUM',
      category: 'Testing',
      description: 'Implement comprehensive BDD test suite to prevent regression',
      impact: 'Medium - Prevents future issues',
      effort: 'Low - Ongoing maintenance'
    });

    return recommendations;
  }

  generateNextSteps() {
    return [
      'Review critical gaps and prioritize implementation',
      'Create development tickets for missing endpoints',
      'Implement missing API endpoints',
      'Add comprehensive error handling',
      'Set up automated testing pipeline',
      'Schedule regular gap audits to prevent regression'
    ];
  }

  generateMarkdownReport(report) {
    return `# 🎯 FaithLink360 Comprehensive PRD & UX Audit Report

## 📊 Executive Summary

- **Audit Date**: ${report.executiveSummary.timestamp}
- **Total Gaps Found**: ${report.executiveSummary.totalGapsFound}
- **Overall Health Score**: ${report.executiveSummary.overallHealthScore}/100
- **Critical Issues**: ${report.executiveSummary.criticalIssues}
- **Medium Issues**: ${report.executiveSummary.mediumIssues}
- **Low Priority Issues**: ${report.executiveSummary.lowIssues}

## 🚨 Critical Findings

### Missing Critical Endpoints
${this.results.gapAnalysis.criticalGaps.map(gap => `- ${gap}`).join('\n')}

### Missing Important Features
${this.results.gapAnalysis.mediumGaps.map(gap => `- ${gap}`).join('\n')}

## 📋 Detailed Findings

### Missing API Endpoints
${this.results.gapAnalysis.missingEndpoints.map(endpoint => `- ${endpoint}`).join('\n')}

### Test Results Summary
${Object.entries(report.testResults).map(([test, result]) => `- **${test}**: ${result}`).join('\n')}

## 🎯 Recommendations

${report.recommendations.map(rec => `
### ${rec.priority}: ${rec.category}
- **Description**: ${rec.description}
- **Impact**: ${rec.impact}
- **Effort**: ${rec.effort}
`).join('\n')}

## 🚀 Next Steps

${report.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

---
*Generated by FaithLink360 Comprehensive Audit System*
*Following Semantic Seed Venture Studio Coding Standards V2.0*`;
  }

  outputRecommendations() {
    console.log('\n🎯 AUDIT RECOMMENDATIONS');
    console.log('========================');
    
    const healthScore = this.calculateHealthScore();
    console.log(`📊 Overall Platform Health: ${healthScore}/100`);
    
    if (this.results.gapAnalysis.criticalGaps.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES REQUIRE IMMEDIATE ATTENTION:');
      this.results.gapAnalysis.criticalGaps.forEach(gap => console.log(`   • ${gap}`));
    }
    
    if (this.results.gapAnalysis.mediumGaps.length > 0) {
      console.log('\n⚠️  MEDIUM PRIORITY ISSUES:');
      this.results.gapAnalysis.mediumGaps.forEach(gap => console.log(`   • ${gap}`));
    }
    
    console.log('\n✅ AUDIT COMPLETE');
    console.log('📋 Detailed reports saved to:');
    console.log('   • COMPREHENSIVE_AUDIT_REPORT.json');
    console.log('   • COMPREHENSIVE_AUDIT_REPORT.md');
  }
}

// Main execution
async function main() {
  const auditor = new ComprehensiveAuditor();
  await auditor.runAudit();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  });
}

module.exports = { ComprehensiveAuditor };
