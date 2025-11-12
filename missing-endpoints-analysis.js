/**
 * Missing Endpoints Analysis - Focus on 404 responses
 * 
 * Analyzes which endpoints return 404 and need implementation
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

const FRONTEND_EXPECTED_ENDPOINTS = [
  // Authentication endpoints
  { method: 'POST', path: '/api/auth/forgot-password', priority: 'CRITICAL' },
  
  // Event management endpoints
  { method: 'POST', path: '/api/events/1/register', priority: 'HIGH' },
  { method: 'POST', path: '/api/events/1/check-in/1', priority: 'HIGH' },
  { method: 'POST', path: '/api/events/1/check-in/1/no-show', priority: 'HIGH' },
  { method: 'GET', path: '/api/events/1/rsvps/1', priority: 'HIGH' },
  
  // Member management endpoints  
  { method: 'POST', path: '/api/members/bulk-upload', priority: 'HIGH' },
  { method: 'POST', path: '/api/members/onboarding-complete', priority: 'MEDIUM' },
  { method: 'GET', path: '/api/members/self-service/notifications', priority: 'MEDIUM' },
  { method: 'PUT', path: '/api/members/self-service/profile', priority: 'MEDIUM' },
  
  // Settings endpoints
  { method: 'GET', path: '/api/settings/church', priority: 'MEDIUM' },
  { method: 'GET', path: '/api/settings/system', priority: 'MEDIUM' },
  { method: 'PUT', path: '/api/settings/users/1', priority: 'MEDIUM' },
  
  // Volunteer endpoints
  { method: 'POST', path: '/api/volunteers/signup', priority: 'MEDIUM' },
  
  // Error reporting endpoints
  { method: 'POST', path: '/api/bug-report', priority: 'LOW' },
  { method: 'POST', path: '/api/error-report', priority: 'LOW' },
  
  // Churches endpoints (from production error)
  { method: 'GET', path: '/api/churches', priority: 'CRITICAL' },
  { method: 'POST', path: '/api/churches', priority: 'CRITICAL' },
  
  // Auth endpoints (from production error)
  { method: 'POST', path: '/api/auth/register', priority: 'CRITICAL' },
  { method: 'POST', path: '/api/auth/login', priority: 'CRITICAL' },
  { method: 'GET', path: '/api/auth/me', priority: 'CRITICAL' },
  { method: 'POST', path: '/api/auth/logout', priority: 'CRITICAL' }
];

async function testEndpoint(method, path) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${path}`,
      timeout: 3000,
      validateStatus: () => true, // Don't throw on any HTTP status
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo-token'
      }
    };
    
    // Add test data for POST/PUT requests
    if (method === 'POST' || method === 'PUT') {
      config.data = { test: true, name: 'Test' };
    }
    
    const response = await axios(config);
    
    return {
      status: response.status,
      success: response.status < 400,
      exists: response.status !== 404,
      data: response.data
    };
  } catch (error) {
    return {
      status: 500,
      success: false,
      exists: false,
      error: error.message
    };
  }
}

async function runMissingEndpointsAnalysis() {
  console.log('🔍 MISSING ENDPOINTS ANALYSIS');
  console.log('===============================');
  console.log('Testing specific endpoints that frontend expects...\n');
  
  const results = {
    critical: { missing: [], working: [] },
    high: { missing: [], working: [] },
    medium: { missing: [], working: [] },
    low: { missing: [], working: [] }
  };
  
  for (const endpoint of FRONTEND_EXPECTED_ENDPOINTS) {
    process.stdout.write(`Testing ${endpoint.method} ${endpoint.path}... `);
    
    const result = await testEndpoint(endpoint.method, endpoint.path);
    
    const statusText = result.status === 404 ? '❌ MISSING (404)' : 
                      result.status >= 400 ? `⚠️  ERROR (${result.status})` :
                      `✅ WORKING (${result.status})`;
    
    console.log(statusText);
    
    const priority = endpoint.priority.toLowerCase();
    if (result.status === 404) {
      results[priority].missing.push({
        method: endpoint.method,
        path: endpoint.path,
        priority: endpoint.priority
      });
    } else {
      results[priority].working.push({
        method: endpoint.method,
        path: endpoint.path,
        priority: endpoint.priority,
        status: result.status
      });
    }
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 ANALYSIS RESULTS BY PRIORITY');
  console.log('================================');
  
  const priorities = ['critical', 'high', 'medium', 'low'];
  let totalMissing = 0;
  let totalTested = 0;
  
  for (const priority of priorities) {
    const missing = results[priority].missing.length;
    const working = results[priority].working.length;
    const total = missing + working;
    
    totalMissing += missing;
    totalTested += total;
    
    if (total > 0) {
      console.log(`\n🚨 ${priority.toUpperCase()} Priority (${missing}/${total} missing):`);
      
      if (missing > 0) {
        console.log('   ❌ MISSING ENDPOINTS:');
        results[priority].missing.forEach(ep => {
          console.log(`      ${ep.method} ${ep.path}`);
        });
      }
      
      if (working.length > 0) {
        console.log('   ✅ WORKING ENDPOINTS:');
        results[priority].working.forEach(ep => {
          console.log(`      ${ep.method} ${ep.path} (${ep.status})`);
        });
      }
    }
  }
  
  const successRate = ((totalTested - totalMissing) / totalTested * 100).toFixed(1);
  
  console.log('\n📊 OVERALL SUMMARY');
  console.log('==================');
  console.log(`📈 Total Endpoints Tested: ${totalTested}`);
  console.log(`✅ Working: ${totalTested - totalMissing}`);
  console.log(`❌ Missing: ${totalMissing}`);
  console.log(`📊 Success Rate: ${successRate}%`);
  
  if (totalMissing > 0) {
    console.log('\n🎯 IMPLEMENTATION PRIORITIES');
    console.log('=============================');
    console.log('Implement in this order for production readiness:\n');
    
    for (const priority of priorities) {
      if (results[priority].missing.length > 0) {
        console.log(`${priority.toUpperCase()} PRIORITY (${results[priority].missing.length} endpoints):`);
        results[priority].missing.forEach((ep, index) => {
          console.log(`   ${index + 1}. ${ep.method} ${ep.path}`);
        });
        console.log('');
      }
    }
    
    console.log('💡 Focus on CRITICAL and HIGH priority endpoints first!');
  } else {
    console.log('\n🎉 ALL ENDPOINTS WORKING! Ready for production! 🚀');
  }
  
  return {
    totalTested,
    totalMissing,
    successRate: parseFloat(successRate),
    results
  };
}

// Run the analysis
async function main() {
  try {
    const results = await runMissingEndpointsAnalysis();
    
    // Generate implementation suggestions
    if (results.totalMissing > 0) {
      console.log('\n🔧 NEXT STEPS:');
      console.log('===============');
      console.log('1. Focus on CRITICAL endpoints first (auth, churches)');
      console.log('2. Implement HIGH priority endpoints (events, members)');
      console.log('3. Add MEDIUM priority endpoints (settings, self-service)');
      console.log('4. Consider LOW priority endpoints (error reporting)');
      console.log('\n✅ After implementation, run this audit again to verify!');
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runMissingEndpointsAnalysis };
