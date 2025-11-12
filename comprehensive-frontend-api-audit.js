/**
 * Comprehensive Frontend-to-Backend API Audit
 * 
 * This script scans ALL frontend files to find every API endpoint call
 * and cross-references with backend endpoints to find missing ones.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const BASE_URL = 'http://localhost:8000';
const FRONTEND_DIR = './src/frontend/src';

class ComprehensiveFrontendApiAudit {
  constructor() {
    this.frontendApiCalls = new Set();
    this.backendEndpoints = new Set();
    this.missingEndpoints = [];
    this.workingEndpoints = [];
    this.errorEndpoints = [];
  }

  // Recursively scan all frontend files
  scanFrontendFiles(dir) {
    try {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        
        if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
          this.scanFrontendFiles(fullPath);
        } else if (file.isFile() && (file.name.endsWith('.tsx') || file.name.endsWith('.ts') || file.name.endsWith('.js'))) {
          this.scanFileForApiCalls(fullPath);
        }
      }
    } catch (error) {
      console.log(`⚠️  Could not scan directory: ${dir}`);
    }
  }

  // Extract API calls from file content
  scanFileForApiCalls(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Look for various API call patterns
      const patterns = [
        // fetch() calls
        /fetch\s*\(\s*[`'"]([^`'"]*\/api\/[^`'"]*)[`'"]/g,
        /fetch\s*\(\s*\$\{[^}]*\}([\/api\/[^`'"]*)[`'"]/g,
        
        // axios calls
        /axios\.[a-zA-Z]+\s*\(\s*[`'"]([^`'"]*\/api\/[^`'"]*)[`'"]/g,
        /axios\s*\(\s*{\s*[^}]*url:\s*[`'"]([^`'"]*\/api\/[^`'"]*)[`'"]/g,
        
        // Template literals with API URLs
        /\$\{[^}]*API_URL[^}]*\}([\/api\/[^`'"}\s]*)/g,
        /NEXT_PUBLIC_API_URL[^}]*\}([\/api\/[^`'"}\s]*)/g,
        
        // Direct API path references
        /[`'"]([\/api\/[^`'"]*)[`'"]/g
      ];

      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          let apiPath = match[1];
          
          // Clean up the API path
          if (apiPath.startsWith('/')) {
            // Remove query parameters and fragments
            apiPath = apiPath.split('?')[0].split('#')[0];
            
            // Skip if it's not actually an API path
            if (apiPath.startsWith('/api/')) {
              // Replace dynamic parameters with placeholders
              apiPath = apiPath
                .replace(/\/\$\{[^}]+\}/g, '/:id') // ${id} -> :id
                .replace(/\/[0-9]+/g, '/:id')      // /123 -> :id
                .replace(/\/\w+Id/g, '/:id')       // /memberId -> :id
                
              this.frontendApiCalls.add(apiPath);
            }
          }
        }
      }
    } catch (error) {
      console.log(`⚠️  Could not read file: ${filePath}`);
    }
  }

  // Test if backend endpoint exists
  async testBackendEndpoint(endpoint) {
    try {
      // Convert endpoint pattern to testable URL
      let testUrl = endpoint.replace(/:([a-zA-Z]+)/g, '1'); // Replace :id with 1
      
      const methods = ['GET', 'POST', 'PUT', 'DELETE'];
      
      for (const method of methods) {
        try {
          const response = await axios({
            method,
            url: `${BASE_URL}${testUrl}`,
            timeout: 3000,
            validateStatus: (status) => status < 500,
            data: method === 'POST' || method === 'PUT' ? { test: true } : undefined,
            headers: { 'Content-Type': 'application/json' }
          });
          
          this.backendEndpoints.add(`${method} ${endpoint}`);
          this.workingEndpoints.push({
            method,
            endpoint,
            status: response.status,
            url: testUrl
          });
          return true;
        } catch (error) {
          // Continue to next method
        }
      }
      
      // No methods worked
      this.missingEndpoints.push(endpoint);
      return false;
      
    } catch (error) {
      this.errorEndpoints.push({ endpoint, error: error.message });
      return false;
    }
  }

  // Find common API patterns
  identifyMissingPatterns() {
    const allEndpoints = Array.from(this.frontendApiCalls);
    const resourcePatterns = new Map();
    
    // Group endpoints by resource
    for (const endpoint of allEndpoints) {
      const parts = endpoint.split('/');
      if (parts.length >= 3) {
        const resource = parts[2]; // /api/[resource]/...
        if (!resourcePatterns.has(resource)) {
          resourcePatterns.set(resource, []);
        }
        resourcePatterns.get(resource).push(endpoint);
      }
    }
    
    console.log('\n📊 RESOURCE PATTERN ANALYSIS');
    console.log('=============================');
    
    for (const [resource, endpoints] of resourcePatterns.entries()) {
      console.log(`\n🔍 ${resource.toUpperCase()} Resource (${endpoints.length} endpoints):`);
      endpoints.forEach(ep => console.log(`   ${ep}`));
    }
    
    return resourcePatterns;
  }

  async runComprehensiveAudit() {
    console.log('🔍 COMPREHENSIVE FRONTEND-TO-BACKEND API AUDIT');
    console.log('===============================================');
    console.log('Scanning ALL frontend files for API endpoint expectations...\n');

    // Step 1: Scan all frontend files
    console.log('📁 Scanning frontend directory...');
    this.scanFrontendFiles(FRONTEND_DIR);
    
    console.log(`✅ Found ${this.frontendApiCalls.size} unique API endpoints expected by frontend\n`);
    
    // Step 2: List all found endpoints
    console.log('📋 FRONTEND API EXPECTATIONS:');
    console.log('==============================');
    const sortedEndpoints = Array.from(this.frontendApiCalls).sort();
    sortedEndpoints.forEach((endpoint, index) => {
      console.log(`${(index + 1).toString().padStart(2)}: ${endpoint}`);
    });
    
    // Step 3: Test each endpoint against backend
    console.log('\n🧪 TESTING BACKEND ENDPOINT AVAILABILITY...');
    console.log('=============================================');
    
    for (const endpoint of sortedEndpoints) {
      process.stdout.write(`Testing ${endpoint}... `);
      const exists = await this.testBackendEndpoint(endpoint);
      console.log(exists ? '✅ EXISTS' : '❌ MISSING');
      
      // Small delay to avoid overwhelming server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Step 4: Analyze patterns
    this.identifyMissingPatterns();
    
    // Step 5: Generate comprehensive report
    console.log('\n📊 COMPREHENSIVE AUDIT RESULTS');
    console.log('===============================');
    console.log(`📈 Total Frontend Expectations: ${this.frontendApiCalls.size}`);
    console.log(`✅ Working Endpoints: ${this.workingEndpoints.length}`);
    console.log(`❌ Missing Endpoints: ${this.missingEndpoints.length}`);
    console.log(`⚠️  Error Testing: ${this.errorEndpoints.length}`);
    
    const successRate = ((this.workingEndpoints.length / this.frontendApiCalls.size) * 100).toFixed(1);
    console.log(`📊 Success Rate: ${successRate}%\n`);
    
    if (this.missingEndpoints.length > 0) {
      console.log('🚨 MISSING ENDPOINTS REQUIRING IMPLEMENTATION:');
      console.log('==============================================');
      this.missingEndpoints.forEach((endpoint, index) => {
        console.log(`${(index + 1).toString().padStart(2)}. ${endpoint}`);
      });
      console.log('\n💡 These endpoints need to be implemented in the backend!\n');
    }
    
    if (this.workingEndpoints.length > 0) {
      console.log('✅ CONFIRMED WORKING ENDPOINTS:');
      console.log('===============================');
      this.workingEndpoints.forEach(ep => {
        console.log(`   ${ep.method} ${ep.endpoint} (${ep.status})`);
      });
    }
    
    if (this.errorEndpoints.length > 0) {
      console.log('\n⚠️  ENDPOINTS WITH TESTING ERRORS:');
      console.log('==================================');
      this.errorEndpoints.forEach(ep => {
        console.log(`   ${ep.endpoint}: ${ep.error}`);
      });
    }
    
    // Step 6: Generate actionable recommendations
    console.log('\n🎯 ACTIONABLE RECOMMENDATIONS');
    console.log('==============================');
    
    if (this.missingEndpoints.length === 0) {
      console.log('🎉 PERFECT! All frontend API expectations are met by backend!');
    } else {
      console.log(`🚨 URGENT: Implement ${this.missingEndpoints.length} missing endpoints before production`);
      console.log('🔧 Priority order for implementation:');
      
      // Categorize missing endpoints by importance
      const critical = this.missingEndpoints.filter(ep => 
        ep.includes('/auth/') || ep.includes('/churches') || ep.includes('/register')
      );
      const high = this.missingEndpoints.filter(ep => 
        ep.includes('/members') || ep.includes('/groups') || ep.includes('/events')
      );
      const medium = this.missingEndpoints.filter(ep => 
        ep.includes('/reports') || ep.includes('/admin') || ep.includes('/settings')
      );
      const low = this.missingEndpoints.filter(ep => 
        !critical.includes(ep) && !high.includes(ep) && !medium.includes(ep)
      );
      
      if (critical.length > 0) {
        console.log('\n   🚨 CRITICAL (Authentication & Core):');
        critical.forEach(ep => console.log(`      - ${ep}`));
      }
      if (high.length > 0) {
        console.log('\n   ⚠️  HIGH (Core Features):');
        high.forEach(ep => console.log(`      - ${ep}`));
      }
      if (medium.length > 0) {
        console.log('\n   📋 MEDIUM (Admin Features):');
        medium.forEach(ep => console.log(`      - ${ep}`));
      }
      if (low.length > 0) {
        console.log('\n   📝 LOW (Additional Features):');
        low.forEach(ep => console.log(`      - ${ep}`));
      }
    }
    
    console.log('\n✅ COMPREHENSIVE FRONTEND-BACKEND AUDIT COMPLETE!');
    
    // Return results for further processing
    return {
      totalExpected: this.frontendApiCalls.size,
      working: this.workingEndpoints.length,
      missing: this.missingEndpoints.length,
      successRate: parseFloat(successRate),
      missingEndpoints: this.missingEndpoints,
      workingEndpoints: this.workingEndpoints,
      allExpectedEndpoints: Array.from(this.frontendApiCalls)
    };
  }
}

// Run the audit
async function main() {
  try {
    const audit = new ComprehensiveFrontendApiAudit();
    const results = await audit.runComprehensiveAudit();
    
    // Save results to file for reference
    fs.writeFileSync('COMPREHENSIVE_FRONTEND_API_AUDIT_RESULTS.json', 
      JSON.stringify(results, null, 2));
      
    console.log('\n📄 Results saved to: COMPREHENSIVE_FRONTEND_API_AUDIT_RESULTS.json');
    
  } catch (error) {
    console.error('❌ Audit failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { ComprehensiveFrontendApiAudit };
