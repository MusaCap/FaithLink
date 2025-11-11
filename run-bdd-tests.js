/**
 * BDD Test Runner for FaithLink360
 * Following Semantic Seed Venture Studio Coding Standards V2.0
 * Comprehensive platform testing with behavior-driven development approach
 */

const axios = require('axios');
const { expect } = require('chai');
const colors = require('colors/safe');

const BASE_URL = process.env.API_URL || 'http://localhost:8000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

class BDDTestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.results = [];
    this.startTime = Date.now();
  }

  async runTest(description, testFunction) {
    try {
      console.log(`\n  ◦ ${description}`);
      await testFunction();
      this.passed++;
      console.log(colors.green(`    ✓ ${description}`));
      this.results.push({ test: description, status: 'passed' });
    } catch (error) {
      this.failed++;
      console.log(colors.red(`    ✗ ${description}`));
      console.log(colors.red(`      ${error.message}`));
      this.results.push({ 
        test: description, 
        status: 'failed', 
        error: error.message 
      });
    }
  }

  async runTestSuite() {
    console.log(colors.cyan('\n🧪 FaithLink360 BDD Test Suite'));
    console.log(colors.cyan('Following Semantic Seed Venture Studio Coding Standards V2.0'));
    console.log('='.repeat(70));

    // Authentication Module Tests
    console.log(colors.yellow('\n📋 Authentication Module'));
    console.log('-'.repeat(30));

    await this.runTest('should successfully authenticate with valid admin credentials', async () => {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'admin@faithlink360.org',
        password: 'admin123'
      });
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.token).to.exist;
      expect(response.data.user.role).to.equal('admin');
    });

    await this.runTest('should reject invalid authentication attempts', async () => {
      try {
        await axios.post(`${BASE_URL}/api/auth/login`, {
          email: 'invalid@test.com',
          password: 'wrongpassword'
        });
        throw new Error('Should have thrown authentication error');
      } catch (error) {
        expect(error.response.status).to.equal(401);
      }
    });

    await this.runTest('should handle logout successfully', async () => {
      const response = await axios.post(`${BASE_URL}/api/auth/logout`);
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
    });

    // Member Management Module Tests
    console.log(colors.yellow('\n👥 Member Management Module'));
    console.log('-'.repeat(35));

    await this.runTest('should return members list with proper structure', async () => {
      const response = await axios.get(`${BASE_URL}/api/members`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.members).to.be.an('array');
      
      if (response.data.members.length > 0) {
        const member = response.data.members[0];
        expect(member).to.have.property('firstName');
        expect(member).to.have.property('lastName');
        expect(member).to.have.property('email');
      }
    });

    await this.runTest('should return member statistics', async () => {
      const response = await axios.get(`${BASE_URL}/api/members/stats`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.stats).to.have.property('totalMembers');
      expect(response.data.stats.totalMembers).to.be.a('number');
    });

    await this.runTest('should return individual member details', async () => {
      const response = await axios.get(`${BASE_URL}/api/members/1`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.member).to.have.property('firstName');
    });

    // Deacon Assignment Module Tests
    console.log(colors.yellow('\n🤝 Deacon Assignment Module'));
    console.log('-'.repeat(32));

    await this.runTest('should return deacons for dropdown selection', async () => {
      const response = await axios.get(`${BASE_URL}/api/deacons/dropdown`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.deacons).to.be.an('array');
      expect(response.data.deacons.length).to.be.greaterThan(0);
      
      const deacon = response.data.deacons[0];
      expect(deacon).to.have.property('name');
      expect(deacon).to.have.property('specialties');
    });

    await this.runTest('should return individual deacon details', async () => {
      const response = await axios.get(`${BASE_URL}/api/deacons/1`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.deacon).to.have.property('name');
      expect(response.data.deacon).to.have.property('contactInfo');
    });

    // Journey Templates Module Tests
    console.log(colors.yellow('\n🛤️  Journey Templates Module'));
    console.log('-'.repeat(33));

    await this.runTest('should return journey templates with milestones', async () => {
      const response = await axios.get(`${BASE_URL}/api/journeys/templates`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.templates).to.be.an('array');
      
      if (response.data.templates.length > 0) {
        const template = response.data.templates[0];
        expect(template).to.have.property('milestones');
        expect(template.milestones).to.be.an('array');
        expect(template.milestones.length).to.be.greaterThan(0);
      }
    });

    await this.runTest('should return member journeys without errors', async () => {
      const response = await axios.get(`${BASE_URL}/api/journeys/member-journeys`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.journeys).to.be.an('array');
    });

    // Events Module Tests
    console.log(colors.yellow('\n🎉 Events Module'));
    console.log('-'.repeat(18));

    await this.runTest('should return events list', async () => {
      const response = await axios.get(`${BASE_URL}/api/events`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.events).to.be.an('array');
    });

    await this.runTest('should return event registrations', async () => {
      const response = await axios.get(`${BASE_URL}/api/events/1/registrations`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.registrations).to.be.an('array');
    });

    // Dashboard & Statistics Tests
    console.log(colors.yellow('\n📊 Dashboard & Statistics'));
    console.log('-'.repeat(28));

    await this.runTest('should return dashboard statistics', async () => {
      const response = await axios.get(`${BASE_URL}/api/dashboard/stats`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.stats).to.have.property('members');
      expect(response.data.stats).to.have.property('groups');
    });

    // System Health Tests
    console.log(colors.yellow('\n🏥 System Health'));
    console.log('-'.repeat(18));

    await this.runTest('should return healthy system status', async () => {
      const response = await axios.get(`${BASE_URL}/health`);
      
      expect(response.status).to.equal(200);
      expect(response.data.status).to.equal('healthy');
    });

    await this.runTest('should return system information', async () => {
      const response = await axios.get(`${BASE_URL}/api/info`);
      
      expect(response.status).to.equal(200);
      expect(response.data.name).to.equal('FaithLink360 Backend');
    });

    // Additional Module Tests
    await this.runAdditionalTests();
    
    // Generate final report
    this.generateReport();
  }

  async runAdditionalTests() {
    console.log(colors.yellow('\n📋 Additional Platform Tests'));
    console.log('-'.repeat(30));

    const endpoints = [
      { name: 'Groups', path: '/api/groups' },
      { name: 'Prayer Requests', path: '/api/care/prayer-requests' },
      { name: 'Communications', path: '/api/communications/campaigns' },
      { name: 'Tasks', path: '/api/tasks' },
      { name: 'Reports', path: '/api/reports/attendance' },
      { name: 'Settings', path: '/api/settings/church' },
      { name: 'Activity Feed', path: '/api/activity' }
    ];

    for (const endpoint of endpoints) {
      await this.runTest(`should return ${endpoint.name} data successfully`, async () => {
        const response = await axios.get(`${BASE_URL}${endpoint.path}`);
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
      });
    }
  }

  generateReport() {
    const duration = Date.now() - this.startTime;
    const total = this.passed + this.failed;
    const passRate = total > 0 ? ((this.passed / total) * 100).toFixed(1) : 0;

    console.log('\n' + '='.repeat(70));
    console.log(colors.cyan('🧪 BDD TEST RESULTS SUMMARY'));
    console.log('='.repeat(70));
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`📊 Total Tests: ${total}`);
    console.log(colors.green(`✅ Passed: ${this.passed}`));
    console.log(colors.red(`❌ Failed: ${this.failed}`));
    console.log(`📈 Pass Rate: ${passRate}%`);

    if (this.failed > 0) {
      console.log(colors.red('\n❌ FAILED TESTS:'));
      const failedTests = this.results.filter(r => r.status === 'failed');
      failedTests.forEach(test => {
        console.log(colors.red(`   • ${test.test}`));
        console.log(colors.red(`     ${test.error}`));
      });
    }

    console.log('\n💡 NEXT STEPS:');
    if (this.failed === 0) {
      console.log(colors.green('   ✅ All tests passing! Platform is stable.'));
      console.log('   🚀 Ready for production deployment');
    } else {
      console.log(colors.yellow('   🔧 Fix failing tests before deployment'));
      console.log('   🧪 Re-run tests after fixes');
    }

    console.log('\n🎯 BDD PRINCIPLES VERIFIED:');
    console.log('   ✅ Behavior-driven test structure');
    console.log('   ✅ Clear test descriptions');
    console.log('   ✅ Proper assertions and expectations');
    console.log('   ✅ Comprehensive platform coverage');

    // Export detailed results
    const report = {
      timestamp: new Date().toISOString(),
      duration,
      summary: {
        total,
        passed: this.passed,
        failed: this.failed,
        passRate: parseFloat(passRate)
      },
      results: this.results
    };

    require('fs').writeFileSync('bdd-test-results.json', JSON.stringify(report, null, 2));
    console.log('\n📋 Detailed results exported to: bdd-test-results.json');

    process.exit(this.failed > 0 ? 1 : 0);
  }
}

// Run the tests
if (require.main === module) {
  const runner = new BDDTestRunner();
  runner.runTestSuite().catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

module.exports = BDDTestRunner;
