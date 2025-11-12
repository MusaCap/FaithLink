/**
 * Comprehensive Endpoint Validation
 * 
 * Tests all endpoints with proper parameters and authentication
 * to ensure they're configured correctly for production use.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

class ComprehensiveEndpointValidator {
  constructor() {
    this.authToken = null;
    this.results = {
      working: [],
      errors: [],
      authentication: [],
      validation: []
    };
  }

  // Get auth token for authenticated requests
  async getAuthToken() {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'pastor@faithlink360.org',
        password: 'demo123'
      });
      
      if (response.data.success && response.data.token) {
        this.authToken = response.data.token;
        console.log('✅ Authentication token obtained');
        return true;
      }
    } catch (error) {
      console.log('⚠️  Could not obtain auth token, using demo token');
      this.authToken = 'demo-jwt-token-12345';
      return false;
    }
  }

  // Test individual endpoint with proper configuration
  async testEndpoint(method, path, testData, requiresAuth = false) {
    try {
      const config = {
        method,
        url: `${BASE_URL}${path}`,
        timeout: 5000,
        validateStatus: () => true,
        headers: { 
          'Content-Type': 'application/json'
        }
      };

      // Add auth header if required
      if (requiresAuth && this.authToken) {
        config.headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      // Add test data for POST/PUT requests
      if ((method === 'POST' || method === 'PUT') && testData) {
        config.data = testData;
      }

      const response = await axios(config);
      
      const result = {
        method,
        path,
        status: response.status,
        success: response.status >= 200 && response.status < 400,
        data: response.data,
        requiresAuth
      };

      if (result.success) {
        this.results.working.push(result);
        return { success: true, result };
      } else if (response.status === 401) {
        this.results.authentication.push(result);
        return { success: false, result, type: 'auth' };
      } else if (response.status === 400) {
        this.results.validation.push(result);
        return { success: false, result, type: 'validation' };
      } else {
        this.results.errors.push(result);
        return { success: false, result, type: 'error' };
      }
    } catch (error) {
      const result = {
        method,
        path,
        status: 'ERROR',
        success: false,
        error: error.message,
        requiresAuth
      };
      this.results.errors.push(result);
      return { success: false, result, type: 'error' };
    }
  }

  async runComprehensiveValidation() {
    console.log('🔍 COMPREHENSIVE ENDPOINT VALIDATION');
    console.log('=====================================');
    console.log('Testing all endpoints with proper parameters and authentication...\n');

    // Step 1: Get authentication token
    await this.getAuthToken();
    console.log('');

    // Step 2: Test all endpoints with proper parameters
    const endpointTests = [
      // CRITICAL: Authentication endpoints
      {
        method: 'POST',
        path: '/api/auth/forgot-password',
        data: { email: 'pastor@faithlink360.org' },
        requiresAuth: false
      },
      {
        method: 'POST', 
        path: '/api/auth/register',
        data: { 
          firstName: 'Test', 
          lastName: 'User', 
          email: 'test@example.com', 
          password: 'test123456',
          churchChoice: 'join',
          selectedChurchId: 'church-1'
        },
        requiresAuth: false
      },
      {
        method: 'POST',
        path: '/api/auth/login',
        data: { email: 'pastor@faithlink360.org', password: 'demo123' },
        requiresAuth: false
      },
      {
        method: 'GET',
        path: '/api/auth/me',
        data: null,
        requiresAuth: true
      },
      {
        method: 'POST',
        path: '/api/auth/logout',
        data: {},
        requiresAuth: false
      },

      // CRITICAL: Churches endpoints
      {
        method: 'GET',
        path: '/api/churches',
        data: null,
        requiresAuth: false
      },
      {
        method: 'POST',
        path: '/api/churches',
        data: { 
          name: 'Test Community Church',
          description: 'A test church community',
          location: 'Test City, TX',
          denomination: 'Non-denominational'
        },
        requiresAuth: false
      },

      // HIGH: Event management endpoints
      {
        method: 'POST',
        path: '/api/events/1/register',
        data: { 
          memberId: '1',
          notes: 'Looking forward to this event',
          numberOfGuests: 2
        },
        requiresAuth: false
      },
      {
        method: 'POST',
        path: '/api/events/1/check-in/1',
        data: { 
          notes: 'Checked in successfully',
          checkedInBy: 'admin'
        },
        requiresAuth: false
      },
      {
        method: 'POST',
        path: '/api/events/1/check-in/1/no-show',
        data: { 
          reason: 'Family emergency',
          markedBy: 'admin'
        },
        requiresAuth: false
      },
      {
        method: 'GET',
        path: '/api/events/1/rsvps/1',
        data: null,
        requiresAuth: false
      },
      {
        method: 'POST',
        path: '/api/members/bulk-upload',
        data: { 
          members: [
            {
              firstName: 'John',
              lastName: 'Smith',
              email: 'john.smith@example.com',
              phone: '555-0123'
            },
            {
              firstName: 'Jane',
              lastName: 'Doe', 
              email: 'jane.doe@example.com',
              phone: '555-0124'
            }
          ],
          options: { validateEmails: true }
        },
        requiresAuth: false
      },

      // MEDIUM: Member self-service endpoints
      {
        method: 'POST',
        path: '/api/members/onboarding-complete',
        data: { 
          memberId: '1',
          completedSteps: ['profile_setup', 'church_tour'],
          feedback: 'Great onboarding experience!'
        },
        requiresAuth: false
      },
      {
        method: 'PUT',
        path: '/api/members/self-service/profile',
        data: { 
          phone: '555-123-4567',
          address: '123 Main St, Springfield, IL 62701',
          emergencyContact: {
            name: 'Jane Smith',
            relationship: 'Spouse',
            phone: '555-987-6543'
          }
        },
        requiresAuth: true
      },
      {
        method: 'GET',
        path: '/api/members/self-service/notifications',
        data: null,
        requiresAuth: true
      },

      // MEDIUM: Settings endpoints
      {
        method: 'GET',
        path: '/api/settings/church',
        data: null,
        requiresAuth: false
      },
      {
        method: 'GET',
        path: '/api/settings/system',
        data: null,
        requiresAuth: false
      },
      {
        method: 'GET',
        path: '/api/settings/users',
        data: null,
        requiresAuth: true
      },
      {
        method: 'PUT',
        path: '/api/settings/users/1',
        data: { 
          role: 'leader',
          permissions: ['read_members', 'read_events', 'manage_groups'],
          isActive: true,
          notes: 'Promoted to leader role'
        },
        requiresAuth: true
      },

      // MEDIUM: Volunteer endpoints
      {
        method: 'POST',
        path: '/api/volunteers/signup',
        data: { 
          opportunityId: 'opp-1',
          memberId: '1',
          availabilityDays: ['Saturday', 'Sunday'],
          skills: ['Customer Service', 'Organization'],
          notes: 'Excited to serve in this ministry!'
        },
        requiresAuth: false
      },

      // LOW: Error reporting endpoints  
      {
        method: 'POST',
        path: '/api/bug-report',
        data: { 
          title: 'Test Bug Report',
          description: 'This is a test bug report to validate the endpoint',
          steps: '1. Navigate to page\n2. Click button\n3. See error',
          userAgent: 'Mozilla/5.0 Test Browser',
          url: '/test-page',
          userId: '1'
        },
        requiresAuth: false
      },
      {
        method: 'POST',
        path: '/api/error-report',
        data: { 
          errorMessage: 'Test error message',
          stackTrace: 'Error stack trace here',
          userAgent: 'Mozilla/5.0 Test Browser',
          url: '/test-page',
          userId: '1',
          timestamp: new Date().toISOString()
        },
        requiresAuth: false
      }
    ];

    // Test each endpoint
    for (const test of endpointTests) {
      process.stdout.write(`Testing ${test.method} ${test.path}${test.requiresAuth ? ' (AUTH)' : ''}... `);
      
      const result = await this.testEndpoint(test.method, test.path, test.data, test.requiresAuth);
      
      if (result.success) {
        console.log(`✅ SUCCESS (${result.result.status})`);
      } else if (result.type === 'auth') {
        console.log(`🔐 AUTH REQUIRED (${result.result.status})`);
      } else if (result.type === 'validation') {
        console.log(`⚠️  VALIDATION ERROR (${result.result.status})`);
      } else {
        console.log(`❌ ERROR (${result.result.status})`);
      }

      // Small delay to avoid overwhelming server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Generate comprehensive report
    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 COMPREHENSIVE VALIDATION RESULTS');
    console.log('====================================');
    
    const totalTests = this.results.working.length + this.results.errors.length + 
                      this.results.authentication.length + this.results.validation.length;
    
    console.log(`📈 Total Endpoints Tested: ${totalTests}`);
    console.log(`✅ Working Correctly: ${this.results.working.length}`);
    console.log(`🔐 Authentication Required: ${this.results.authentication.length}`);
    console.log(`⚠️  Validation Issues: ${this.results.validation.length}`);
    console.log(`❌ Errors: ${this.results.errors.length}`);
    
    const successRate = ((this.results.working.length / totalTests) * 100).toFixed(1);
    console.log(`📊 Success Rate: ${successRate}%`);

    // Detailed breakdown
    if (this.results.working.length > 0) {
      console.log('\n✅ WORKING ENDPOINTS:');
      console.log('=====================');
      this.results.working.forEach(result => {
        console.log(`   ${result.method} ${result.path} (${result.status})${result.requiresAuth ? ' 🔐' : ''}`);
      });
    }

    if (this.results.authentication.length > 0) {
      console.log('\n🔐 AUTHENTICATION ISSUES:');
      console.log('=========================');
      this.results.authentication.forEach(result => {
        console.log(`   ${result.method} ${result.path} (${result.status})`);
        if (result.data && result.data.message) {
          console.log(`      Message: ${result.data.message}`);
        }
      });
    }

    if (this.results.validation.length > 0) {
      console.log('\n⚠️  VALIDATION ISSUES:');
      console.log('=====================');
      this.results.validation.forEach(result => {
        console.log(`   ${result.method} ${result.path} (${result.status})`);
        if (result.data && result.data.message) {
          console.log(`      Message: ${result.data.message}`);
        }
      });
    }

    if (this.results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      console.log('==========');
      this.results.errors.forEach(result => {
        console.log(`   ${result.method} ${result.path} (${result.status})`);
        if (result.error) {
          console.log(`      Error: ${result.error}`);
        } else if (result.data && result.data.message) {
          console.log(`      Message: ${result.data.message}`);
        }
      });
    }

    // Recommendations
    console.log('\n🎯 RECOMMENDATIONS:');
    console.log('===================');
    
    if (this.results.validation.length > 0) {
      console.log('🔧 VALIDATION ISSUES TO FIX:');
      console.log('- Review parameter validation in endpoints returning 400 errors');
      console.log('- Ensure required fields are properly documented');
      console.log('- Add better error messages for missing parameters');
    }

    if (this.results.authentication.length > 0) {
      console.log('🔐 AUTHENTICATION ISSUES TO REVIEW:');
      console.log('- Verify which endpoints truly require authentication');
      console.log('- Consider if some endpoints should be public');
      console.log('- Ensure auth middleware is correctly configured');
    }

    if (this.results.errors.length > 0) {
      console.log('❌ ERRORS TO INVESTIGATE:');
      console.log('- Check server logs for detailed error information');
      console.log('- Verify endpoint routing and middleware configuration');
      console.log('- Test with different parameter combinations');
    }

    if (this.results.working.length === totalTests) {
      console.log('🎉 ALL ENDPOINTS WORKING PERFECTLY!');
      console.log('✅ Production deployment ready!');
    } else {
      console.log(`⚠️  ${totalTests - this.results.working.length} endpoints need attention before production`);
    }

    return {
      totalTests,
      working: this.results.working.length,
      successRate: parseFloat(successRate),
      issues: {
        authentication: this.results.authentication.length,
        validation: this.results.validation.length,
        errors: this.results.errors.length
      }
    };
  }
}

// Run comprehensive validation
async function main() {
  try {
    const validator = new ComprehensiveEndpointValidator();
    const results = await validator.runComprehensiveValidation();
    
    // Save results for reference
    const fs = require('fs');
    fs.writeFileSync('COMPREHENSIVE_ENDPOINT_VALIDATION_RESULTS.json', 
      JSON.stringify(validator.results, null, 2));
      
    console.log('\n📄 Detailed results saved to: COMPREHENSIVE_ENDPOINT_VALIDATION_RESULTS.json');
    
    // Exit with error code if issues found
    if (results.working < results.totalTests) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { ComprehensiveEndpointValidator };
