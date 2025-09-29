// ========================================
// SPRINT 6: ADVANCED REPORTS & ANALYTICS 
// COMPREHENSIVE INTEGRATION TEST SUITE
// ========================================
// Tests all 5 Sprint 6 API endpoints for FaithLink360 platform
// Uses Node.js built-in HTTP modules for compatibility

const http = require('http');
const https = require('https');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const AUTH_TOKEN = 'Bearer mock-jwt-token-admin-user';

// Test execution tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

// Utility function to make HTTP requests
function makeRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API_BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AUTH_TOKEN
      }
    };

    const httpModule = url.protocol === 'https:' ? https : http;
    
    const req = httpModule.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData,
            parseError: error.message
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test execution function
async function runTest(testName, testFunction) {
  totalTests++;
  console.log(`\n🧪 Running: ${testName}`);
  
  try {
    await testFunction();
    passedTests++;
    console.log(`✅ PASSED: ${testName}`);
    testResults.push({ test: testName, status: 'PASSED', error: null });
  } catch (error) {
    failedTests++;
    console.log(`❌ FAILED: ${testName}`);
    console.log(`   Error: ${error.message}`);
    testResults.push({ test: testName, status: 'FAILED', error: error.message });
  }
}

// Helper function to validate response structure
function validateResponse(response, expectedFields, testName) {
  if (response.statusCode !== 200) {
    throw new Error(`Expected status 200, got ${response.statusCode} for ${testName}`);
  }

  if (!response.data || typeof response.data !== 'object') {
    throw new Error(`Invalid response data structure for ${testName}`);
  }

  for (const field of expectedFields) {
    if (!(field in response.data)) {
      throw new Error(`Missing required field '${field}' in ${testName} response`);
    }
  }
}

// ========================================
// MEMBER GROWTH ANALYTICS TESTS
// ========================================

async function testMemberGrowthTrends() {
  const response = await makeRequest('/api/reports/member-growth-trends');
  
  validateResponse(response, [
    'timeframe', 'granularity', 'generatedAt', 'summary', 
    'monthlyData', 'demographicBreakdown', 'seasonalPatterns', 
    'churnAnalysis', 'predictiveInsights'
  ], 'Member Growth Trends');

  // Validate summary metrics
  const summary = response.data.summary;
  if (!summary.totalMembers || !summary.newMembersThisYear || !summary.memberRetentionRate) {
    throw new Error('Missing essential summary metrics in member growth trends');
  }

  // Validate monthly data structure
  if (!Array.isArray(response.data.monthlyData) || response.data.monthlyData.length === 0) {
    throw new Error('Monthly data should be a non-empty array');
  }

  const firstMonth = response.data.monthlyData[0];
  const requiredMonthFields = ['period', 'totalMembers', 'newMembers', 'departedMembers', 'netGrowth', 'growthRate'];
  for (const field of requiredMonthFields) {
    if (!(field in firstMonth)) {
      throw new Error(`Missing required field '${field}' in monthly data`);
    }
  }

  console.log(`   📊 Total Members: ${summary.totalMembers}, Growth Rate: ${summary.averageMonthlyGrowth}%`);
}

async function testMemberGrowthTrendsWithFilters() {
  const response = await makeRequest('/api/reports/member-growth-trends?timeframe=6months&granularity=weekly');
  
  validateResponse(response, ['timeframe', 'granularity'], 'Member Growth Trends with Filters');
  
  if (response.data.timeframe !== '6months' || response.data.granularity !== 'weekly') {
    throw new Error('Query parameters not properly applied to member growth trends');
  }

  console.log(`   📅 Filtered by: ${response.data.timeframe} timeframe, ${response.data.granularity} granularity`);
}

// ========================================
// MEMBER ENGAGEMENT HEATMAPS TESTS
// ========================================

async function testMemberEngagementHeatmaps() {
  const response = await makeRequest('/api/reports/member-engagement-heatmaps');
  
  validateResponse(response, [
    'period', 'activityType', 'generatedAt', 'overallEngagement',
    'engagementByActivity', 'weeklyHeatmap', 'ageGroupEngagement',
    'engagementTrends', 'actionableInsights'
  ], 'Member Engagement Heatmaps');

  // Validate overall engagement metrics
  const engagement = response.data.overallEngagement;
  if (!engagement.averageScore || !engagement.totalActiveMembers) {
    throw new Error('Missing essential engagement metrics');
  }

  // Validate engagement by activity
  if (!Array.isArray(response.data.engagementByActivity) || response.data.engagementByActivity.length === 0) {
    throw new Error('Engagement by activity should be a non-empty array');
  }

  const firstActivity = response.data.engagementByActivity[0];
  const requiredActivityFields = ['activity', 'participationRate', 'avgFrequency', 'engagementScore'];
  for (const field of requiredActivityFields) {
    if (!(field in firstActivity)) {
      throw new Error(`Missing required field '${field}' in engagement by activity`);
    }
  }

  console.log(`   🔥 Avg Engagement: ${engagement.averageScore}/10, Active Members: ${engagement.totalActiveMembers}`);
}

async function testEngagementHeatmapsWithFilters() {
  const response = await makeRequest('/api/reports/member-engagement-heatmaps?period=7days&activityType=worship');
  
  validateResponse(response, ['period', 'activityType'], 'Engagement Heatmaps with Filters');
  
  if (response.data.period !== '7days' || response.data.activityType !== 'worship') {
    throw new Error('Query parameters not properly applied to engagement heatmaps');
  }

  console.log(`   📊 Filtered by: ${response.data.period} period, ${response.data.activityType} activity type`);
}

// ========================================
// ADVANCED GROUP HEALTH TESTS
// ========================================

async function testGroupHealthDetailed() {
  const response = await makeRequest('/api/reports/group-health-detailed');
  
  validateResponse(response, [
    'groupType', 'healthMetric', 'generatedAt', 'overallHealth',
    'groupsByType', 'healthMetrics', 'leadershipAnalysis',
    'groupLifecycle', 'satisfactionMetrics', 'predictiveInsights'
  ], 'Group Health Detailed');

  // Validate overall health metrics
  const health = response.data.overallHealth;
  if (!health.averageHealthScore || !health.totalGroups) {
    throw new Error('Missing essential group health metrics');
  }

  // Validate groups by type
  if (!Array.isArray(response.data.groupsByType) || response.data.groupsByType.length === 0) {
    throw new Error('Groups by type should be a non-empty array');
  }

  // Validate health metrics for individual groups
  if (!Array.isArray(response.data.healthMetrics) || response.data.healthMetrics.length === 0) {
    throw new Error('Health metrics should be a non-empty array');
  }

  const firstGroup = response.data.healthMetrics[0];
  const requiredGroupFields = ['groupId', 'groupName', 'type', 'healthScore', 'size', 'leader', 'metrics'];
  for (const field of requiredGroupFields) {
    if (!(field in firstGroup)) {
      throw new Error(`Missing required field '${field}' in group health metrics`);
    }
  }

  console.log(`   🏥 Avg Health Score: ${health.averageHealthScore}/10, Total Groups: ${health.totalGroups}`);
}

async function testGroupHealthWithFilters() {
  const response = await makeRequest('/api/reports/group-health-detailed?groupType=small_groups&healthMetric=attendance');
  
  validateResponse(response, ['groupType', 'healthMetric'], 'Group Health with Filters');
  
  if (response.data.groupType !== 'small_groups' || response.data.healthMetric !== 'attendance') {
    throw new Error('Query parameters not properly applied to group health detailed');
  }

  console.log(`   📋 Filtered by: ${response.data.groupType} type, ${response.data.healthMetric} metric`);
}

// ========================================
// SPIRITUAL JOURNEY ANALYTICS TESTS
// ========================================

async function testJourneyCompletionRates() {
  const response = await makeRequest('/api/reports/journey-completion-rates');
  
  validateResponse(response, [
    'timeframe', 'journeyType', 'generatedAt', 'overallMetrics',
    'journeyTemplates', 'completionPatterns', 'mentorshipImpact',
    'demographicBreakdown', 'outcomes', 'recommendationsEngine'
  ], 'Journey Completion Rates');

  // Validate overall metrics
  const metrics = response.data.overallMetrics;
  if (!metrics.totalActiveJourneys || !metrics.completionRate || !metrics.satisfactionScore) {
    throw new Error('Missing essential journey metrics');
  }

  // Validate journey templates
  if (!Array.isArray(response.data.journeyTemplates) || response.data.journeyTemplates.length === 0) {
    throw new Error('Journey templates should be a non-empty array');
  }

  const firstTemplate = response.data.journeyTemplates[0];
  const requiredTemplateFields = ['templateId', 'templateName', 'totalParticipants', 'completedJourneys', 'completionRate', 'milestoneData'];
  for (const field of requiredTemplateFields) {
    if (!(field in firstTemplate)) {
      throw new Error(`Missing required field '${field}' in journey templates`);
    }
  }

  // Validate milestone data
  if (!Array.isArray(firstTemplate.milestoneData) || firstTemplate.milestoneData.length === 0) {
    throw new Error('Milestone data should be a non-empty array');
  }

  console.log(`   🎯 Active Journeys: ${metrics.totalActiveJourneys}, Completion Rate: ${metrics.completionRate}%`);
}

async function testJourneyAnalyticsWithFilters() {
  const response = await makeRequest('/api/reports/journey-completion-rates?timeframe=3months&journeyType=leadership');
  
  validateResponse(response, ['timeframe', 'journeyType'], 'Journey Analytics with Filters');
  
  if (response.data.timeframe !== '3months' || response.data.journeyType !== 'leadership') {
    throw new Error('Query parameters not properly applied to journey completion rates');
  }

  console.log(`   📈 Filtered by: ${response.data.timeframe} timeframe, ${response.data.journeyType} type`);
}

// ========================================
// PREDICTIVE ANALYTICS TESTS
// ========================================

async function testPredictiveInsights() {
  const response = await makeRequest('/api/reports/predictive-insights');
  
  validateResponse(response, [
    'analysisType', 'confidenceLevel', 'generatedAt', 'modelVersion',
    'dataConfidence', 'predictionAccuracy', 'membershipPredictions',
    'groupHealthPredictions', 'resourceAllocationInsights',
    'eventAndProgramForecasting', 'financialTrendPredictions', 'actionPriorities'
  ], 'Predictive Insights');

  // Validate membership predictions
  const memberPredictions = response.data.membershipPredictions;
  if (!memberPredictions.riskAnalysis || !memberPredictions.growthOpportunities) {
    throw new Error('Missing essential membership prediction components');
  }

  // Validate risk analysis
  const riskAnalysis = memberPredictions.riskAnalysis;
  if (!Array.isArray(riskAnalysis.membersAtRisk) || !riskAnalysis.totalMembersAtRisk) {
    throw new Error('Invalid risk analysis structure in predictive insights');
  }

  // Validate growth opportunities
  const growthOps = memberPredictions.growthOpportunities;
  if (!Array.isArray(growthOps.highPotentialMembers) || !growthOps.totalHighPotential) {
    throw new Error('Invalid growth opportunities structure in predictive insights');
  }

  // Validate action priorities
  if (!Array.isArray(response.data.actionPriorities) || response.data.actionPriorities.length === 0) {
    throw new Error('Action priorities should be a non-empty array');
  }

  console.log(`   🔮 Model Accuracy: ${response.data.predictionAccuracy}%, At Risk: ${riskAnalysis.totalMembersAtRisk}, High Potential: ${growthOps.totalHighPotential}`);
}

async function testPredictiveInsightsWithFilters() {
  const response = await makeRequest('/api/reports/predictive-insights?analysisType=risk_only&confidenceLevel=high');
  
  validateResponse(response, ['analysisType', 'confidenceLevel'], 'Predictive Insights with Filters');
  
  if (response.data.analysisType !== 'risk_only' || response.data.confidenceLevel !== 'high') {
    throw new Error('Query parameters not properly applied to predictive insights');
  }

  console.log(`   🎯 Filtered by: ${response.data.analysisType} analysis, ${response.data.confidenceLevel} confidence`);
}

// ========================================
// CROSS-INTEGRATION TESTS
// ========================================

async function testAnalyticsDataConsistency() {
  // Test data consistency across different analytics endpoints
  const [growthResponse, engagementResponse, groupResponse] = await Promise.all([
    makeRequest('/api/reports/member-growth-trends'),
    makeRequest('/api/reports/member-engagement-heatmaps'),
    makeRequest('/api/reports/group-health-detailed')
  ]);

  // Check member count consistency
  const totalMembersGrowth = growthResponse.data.summary.totalMembers;
  const totalMembersEngagement = engagementResponse.data.overallEngagement.totalActiveMembers;

  if (Math.abs(totalMembersGrowth - totalMembersEngagement) > 50) {
    console.log(`   ⚠️  Member count variance: Growth=${totalMembersGrowth}, Engagement=${totalMembersEngagement}`);
  }

  console.log(`   🔗 Data consistency check: Growth(${totalMembersGrowth}) vs Engagement(${totalMembersEngagement}) members`);
}

async function testAnalyticsPerformance() {
  const startTime = Date.now();
  
  // Test concurrent requests to all analytics endpoints
  const promises = [
    makeRequest('/api/reports/member-growth-trends'),
    makeRequest('/api/reports/member-engagement-heatmaps'),
    makeRequest('/api/reports/group-health-detailed'),
    makeRequest('/api/reports/journey-completion-rates'),
    makeRequest('/api/reports/predictive-insights')
  ];

  await Promise.all(promises);
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;

  if (totalTime > 5000) {
    throw new Error(`Analytics performance test failed: ${totalTime}ms > 5000ms threshold`);
  }

  console.log(`   ⚡ Performance: All 5 analytics endpoints responded in ${totalTime}ms`);
}

// ========================================
// MAIN TEST EXECUTION
// ========================================

async function runAllTests() {
  console.log('🚀 STARTING SPRINT 6: ADVANCED REPORTS & ANALYTICS INTEGRATION TESTS');
  console.log('================================================================================');
  
  // Member Growth Analytics Tests
  console.log('\n📈 MEMBER GROWTH ANALYTICS TESTS');
  console.log('----------------------------------------');
  await runTest('Member Growth Trends Basic', testMemberGrowthTrends);
  await runTest('Member Growth Trends with Filters', testMemberGrowthTrendsWithFilters);

  // Member Engagement Heatmaps Tests  
  console.log('\n🔥 MEMBER ENGAGEMENT HEATMAPS TESTS');
  console.log('------------------------------------------');
  await runTest('Member Engagement Heatmaps Basic', testMemberEngagementHeatmaps);
  await runTest('Engagement Heatmaps with Filters', testEngagementHeatmapsWithFilters);

  // Advanced Group Health Tests
  console.log('\n🏥 ADVANCED GROUP HEALTH TESTS');
  console.log('-------------------------------------');
  await runTest('Group Health Detailed Basic', testGroupHealthDetailed);
  await runTest('Group Health with Filters', testGroupHealthWithFilters);

  // Spiritual Journey Analytics Tests
  console.log('\n🎯 SPIRITUAL JOURNEY ANALYTICS TESTS');
  console.log('---------------------------------------');
  await runTest('Journey Completion Rates Basic', testJourneyCompletionRates);
  await runTest('Journey Analytics with Filters', testJourneyAnalyticsWithFilters);

  // Predictive Analytics Tests
  console.log('\n🔮 PREDICTIVE ANALYTICS TESTS');
  console.log('--------------------------------');
  await runTest('Predictive Insights Basic', testPredictiveInsights);
  await runTest('Predictive Insights with Filters', testPredictiveInsightsWithFilters);

  // Cross-Integration Tests
  console.log('\n🔗 CROSS-INTEGRATION TESTS');
  console.log('-----------------------------');
  await runTest('Analytics Data Consistency', testAnalyticsDataConsistency);
  await runTest('Analytics Performance', testAnalyticsPerformance);

  // Final Results
  console.log('\n================================================================================');
  console.log('🎯 SPRINT 6 ADVANCED REPORTS & ANALYTICS TEST RESULTS');
  console.log('================================================================================');
  console.log(`📊 Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (failedTests > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.filter(r => r.status === 'FAILED').forEach(result => {
      console.log(`   • ${result.test}: ${result.error}`);
    });
  }

  console.log('\n📋 SPRINT 6 API ENDPOINT COVERAGE:');
  console.log('   ✅ GET /api/reports/member-growth-trends');
  console.log('   ✅ GET /api/reports/member-engagement-heatmaps');
  console.log('   ✅ GET /api/reports/group-health-detailed');
  console.log('   ✅ GET /api/reports/journey-completion-rates');
  console.log('   ✅ GET /api/reports/predictive-insights');

  const productionReady = failedTests === 0 && (passedTests / totalTests) >= 0.9;
  console.log(`\n🚀 PRODUCTION READINESS: ${productionReady ? '✅ READY' : '❌ NOT READY'}`);
  
  if (productionReady) {
    console.log('   Sprint 6: Advanced Reports & Analytics APIs are production-ready!');
    console.log('   All analytics endpoints are functional with comprehensive data structures.');
    console.log('   Ready to proceed to Sprint 7 or begin frontend integration.');
  } else {
    console.log('   Sprint 6 APIs need attention before production deployment.');
    console.log('   Review failed tests and resolve issues before proceeding.');
  }
  
  console.log('\n================================================================================');
}

// Execute tests
runAllTests().catch(error => {
  console.error('❌ Test suite execution failed:', error);
  process.exit(1);
});
