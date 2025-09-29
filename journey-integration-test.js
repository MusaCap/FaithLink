const fetch = require('node-fetch');

// Configuration
const API_BASE_URL = 'http://localhost:3000';
const AUTH_TOKEN = 'mock-jwt-token-for-testing';

// Test Results Tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

// Helper function for API calls
async function apiCall(endpoint, method = 'GET', body = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }
  };
  
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

// Test helper function
function runTest(testName, testFn) {
  return new Promise(async (resolve) => {
    totalTests++;
    console.log(`\n🧪 Running: ${testName}`);
    
    try {
      const result = await testFn();
      if (result.success) {
        passedTests++;
        console.log(`✅ PASS: ${testName}`);
        testResults.push({ test: testName, status: 'PASS', message: result.message || 'Test passed' });
      } else {
        failedTests++;
        console.log(`❌ FAIL: ${testName} - ${result.message}`);
        testResults.push({ test: testName, status: 'FAIL', message: result.message });
      }
    } catch (error) {
      failedTests++;
      console.log(`❌ ERROR: ${testName} - ${error.message}`);
      testResults.push({ test: testName, status: 'ERROR', message: error.message });
    }
    
    resolve();
  });
}

// ===========================================
// SPRINT 5: SPIRITUAL JOURNEY EXTENSIONS TESTS
// ===========================================

console.log('🙏 FaithLink360 - Sprint 5: Spiritual Journey Extensions Integration Tests');
console.log('📋 Testing 19 API endpoints across 6 feature areas\n');

async function runJourneyTests() {
  
  // ===========================================
  // 1. DAILY DEVOTIONS TRACKING TESTS (4 endpoints)
  // ===========================================
  
  await runTest('GET /api/journeys/devotions - Retrieve devotions history', async () => {
    const response = await apiCall('/api/journeys/devotions?memberId=member-123&dateRange=30days');
    
    if (response.status !== 200) {
      return { success: false, message: `Expected 200, got ${response.status}` };
    }
    
    const data = response.data;
    if (!data.devotions || !Array.isArray(data.devotions)) {
      return { success: false, message: 'Missing or invalid devotions array' };
    }
    
    if (!data.currentStreak || !data.consistency) {
      return { success: false, message: 'Missing streak or consistency data' };
    }
    
    return { success: true, message: `${data.devotions.length} devotions, ${data.currentStreak} day streak` };
  });

  await runTest('POST /api/journeys/devotions - Record new devotion', async () => {
    const devotionData = {
      memberId: 'member-123',
      date: '2025-01-16',
      passage: 'John 3:16',
      title: 'God\'s Love',
      notes: 'Amazing passage about God\'s love',
      duration: 15,
      reflection: {
        keyVerse: 'John 3:16',
        insight: 'God loves us unconditionally',
        application: 'Share this love with others'
      },
      tags: ['love', 'salvation']
    };
    
    const response = await apiCall('/api/journeys/devotions', 'POST', devotionData);
    
    if (response.status !== 201) {
      return { success: false, message: `Expected 201, got ${response.status}` };
    }
    
    const data = response.data;
    if (!data.id || data.passage !== 'John 3:16') {
      return { success: false, message: 'Invalid devotion creation response' };
    }
    
    return { success: true, message: `Devotion created: ${data.passage} (${data.duration} min)` };
  });

  await runTest('PUT /api/journeys/devotions/:id - Update devotion entry', async () => {
    const updateData = {
      notes: 'Updated reflection notes',
      duration: 20,
      tags: ['updated', 'reflection']
    };
    
    const response = await apiCall('/api/journeys/devotions/dev-001', 'PUT', updateData);
    
    if (response.status !== 200) {
      return { success: false, message: `Expected 200, got ${response.status}` };
    }
    
    const data = response.data;
    if (!data.updatedAt || data.notes !== 'Updated reflection notes') {
      return { success: false, message: 'Devotion update failed or incomplete' };
    }
    
    return { success: true, message: `Devotion updated: ${data.id}` };
  });

  await runTest('GET /api/journeys/devotions/plans - Get reading plans', async () => {
    const response = await apiCall('/api/journeys/devotions/plans');
    
    if (response.status !== 200) {
      return { success: false, message: `Expected 200, got ${response.status}` };
    }
    
    const data = response.data;
    if (!data.plans || !Array.isArray(data.plans)) {
      return { success: false, message: 'Missing or invalid plans array' };
    }
    
    return { success: true, message: `${data.plans.length} reading plans available` };
  });

  // ===========================================
  // 2. SPIRITUAL GIFTS ASSESSMENT TESTS (3 endpoints)
  // ===========================================

  await runTest('GET /api/journeys/spiritual-gifts - Get gifts assessment results', async () => {
    const response = await apiCall('/api/journeys/spiritual-gifts?memberId=member-123');
    
    if (response.status !== 200) {
      return { success: false, message: `Expected 200, got ${response.status}` };
    }
    
    const data = response.data;
    if (!data.primaryGifts || !Array.isArray(data.primaryGifts)) {
      return { success: false, message: 'Missing primary gifts data' };
    }
    
    if (!data.giftCombination || !data.recommendations) {
      return { success: false, message: 'Missing gift combination or recommendations' };
    }
    
    return { success: true, message: `Primary gifts: ${data.primaryGifts.map(g => g.gift).join(', ')}` };
  });

  await runTest('POST /api/journeys/spiritual-gifts - Submit assessment', async () => {
    const assessmentData = {
      memberId: 'member-123',
      responses: [
        { questionId: 'q001', answer: 5 },
        { questionId: 'q002', answer: 4 },
        { questionId: 'q003', answer: 3 }
      ],
      assessmentType: 'full'
    };
    
    const response = await apiCall('/api/journeys/spiritual-gifts', 'POST', assessmentData);
    
    if (response.status !== 201) {
      return { success: false, message: `Expected 201, got ${response.status}` };
    }
    
    const data = response.data;
    if (!data.id || !data.results || !data.results.topGift) {
      return { success: false, message: 'Invalid assessment submission response' };
    }
    
    return { success: true, message: `Assessment processed: Top gift - ${data.results.topGift}` };
  });

  await runTest('GET /api/journeys/spiritual-gifts/questions - Get assessment questions', async () => {
    const response = await apiCall('/api/journeys/spiritual-gifts/questions?assessmentType=full');
    
    if (response.status !== 200) {
      return { success: false, message: `Expected 200, got ${response.status}` };
    }
    
    const data = response.data;
    if (!data.questions || !Array.isArray(data.questions)) {
      return { success: false, message: 'Missing questions array' };
    }
    
    return { success: true, message: `${data.questions.length} assessment questions available` };
  });

  // ===========================================
  // 3. SERVING OPPORTUNITIES TESTS (2 endpoints)
  // ===========================================

  await runTest('GET /api/journeys/serving-opportunities - Get serving opportunities', async () => {
    const response = await apiCall('/api/journeys/serving-opportunities?category=all&page=1&limit=20');
    
    if (response.status !== 200) {
      return { success: false, message: `Expected 200, got ${response.status}` };
    }
    
    const data = response.data;
    if (!data.opportunities || !Array.isArray(data.opportunities)) {
      return { success: false, message: 'Missing opportunities array' };
    }
    
    if (!data.categories || !data.urgentNeeds) {
      return { success: false, message: 'Missing categories or urgent needs data' };
    }
    
    return { success: true, message: `${data.totalOpportunities} opportunities available` };
  });

  await runTest('POST /api/journeys/serving-opportunities/:id/apply - Apply for opportunity', async () => {
    const applicationData = {
      memberId: 'member-123',
      memberName: 'John Smith',
      motivation: 'I love working with children and teaching them about Jesus',
      availability: { sunday: true, weeknight: false },
      experience: 'Previous Sunday school teaching experience'
    };
    
    const response = await apiCall('/api/journeys/serving-opportunities/opp-001/apply', 'POST', applicationData);
    
    if (response.status !== 201) {
      return { success: false, message: `Expected 201, got ${response.status}` };
    }
    
    const data = response.data;
    if (!data.id || !data.status || data.status !== 'pending_review') {
      return { success: false, message: 'Invalid application submission response' };
    }
    
    return { success: true, message: `Application submitted: ${data.id}` };
  });

  // ===========================================
  // 4. JOURNEY MILESTONE TRACKING TESTS (2 endpoints)
  // ===========================================

  await runTest('GET /api/journeys/milestones - Get member milestones', async () => {
    const response = await apiCall('/api/journeys/milestones?memberId=member-123');
    
    if (response.status !== 200) {
      return { success: false, message: `Expected 200, got ${response.status}` };
    }
    
    const data = response.data;
    if (!data.milestones || !Array.isArray(data.milestones)) {
      return { success: false, message: 'Missing milestones array' };
    }
    
    if (typeof data.overallProgress !== 'number' || !data.currentPhase) {
      return { success: false, message: 'Missing progress or phase data' };
    }
    
    return { success: true, message: `${data.overallProgress}% progress in ${data.currentPhase} phase` };
  });

  await runTest('PUT /api/journeys/milestones/:id - Update milestone progress', async () => {
    const updateData = {
      status: 'completed',
      notes: 'Milestone completed successfully',
      celebrationMessage: 'Congratulations on completing this milestone!'
    };
    
    const response = await apiCall('/api/journeys/milestones/milestone-004', 'PUT', updateData);
    
    if (response.status !== 200) {
      return { success: false, message: `Expected 200, got ${response.status}` };
    }
    
    const data = response.data;
    if (data.status !== 'completed' || !data.updatedAt) {
      return { success: false, message: 'Milestone update failed or incomplete' };
    }
    
    return { success: true, message: `Milestone updated: ${data.id} - ${data.status}` };
  });

  // ===========================================
  // 5. SPIRITUAL GROWTH ANALYTICS TESTS (2 endpoints)
  // ===========================================

  await runTest('GET /api/journeys/analytics - Get growth analytics', async () => {
    const response = await apiCall('/api/journeys/analytics?memberId=member-123&period=year');
    
    if (response.status !== 200) {
      return { success: false, message: `Expected 200, got ${response.status}` };
    }
    
    const data = response.data;
    if (!data.overviewMetrics || !data.devotionalAnalytics || !data.serviceAnalytics) {
      return { success: false, message: 'Missing analytics sections' };
    }
    
    if (typeof data.overviewMetrics.overallGrowthScore !== 'number') {
      return { success: false, message: 'Invalid growth score data' };
    }
    
    return { success: true, message: `Growth score: ${data.overviewMetrics.overallGrowthScore}/10` };
  });

  await runTest('GET /api/journeys/analytics/trends - Get growth trends', async () => {
    const response = await apiCall('/api/journeys/analytics/trends?memberId=member-123&timeframe=12months');
    
    if (response.status !== 200) {
      return { success: false, message: `Expected 200, got ${response.status}` };
    }
    
    const data = response.data;
    if (!data.dataPoints || !Array.isArray(data.dataPoints)) {
      return { success: false, message: 'Missing data points array' };
    }
    
    if (!data.trendAnalysis || !data.trendAnalysis.overallDirection) {
      return { success: false, message: 'Missing trend analysis data' };
    }
    
    return { success: true, message: `Trend: ${data.trendAnalysis.overallDirection}, ${data.dataPoints.length} data points` };
  });

  // ===========================================
  // 6. PERSONAL REFLECTION & NOTES TESTS (6 endpoints)
  // ===========================================

  await runTest('GET /api/journeys/reflections - Get personal reflections', async () => {
    const response = await apiCall('/api/journeys/reflections?memberId=member-123&category=all&page=1');
    
    if (response.status !== 200) {
      return { success: false, message: `Expected 200, got ${response.status}` };
    }
    
    const data = response.data;
    if (!data.reflections || !Array.isArray(data.reflections)) {
      return { success: false, message: 'Missing reflections array' };
    }
    
    if (!data.statistics || typeof data.totalReflections !== 'number') {
      return { success: false, message: 'Missing reflection statistics' };
    }
    
    return { success: true, message: `${data.totalReflections} reflections, ${data.statistics.averagePerWeek} per week` };
  });

  await runTest('POST /api/journeys/reflections - Create new reflection', async () => {
    const reflectionData = {
      memberId: 'member-123',
      category: 'devotional',
      title: 'God\'s Faithfulness',
      content: 'Reflecting on how God has been faithful throughout this challenging season of life.',
      tags: ['faithfulness', 'challenges', 'growth'],
      relatedVerse: 'Lamentations 3:22-23',
      mood: 'hopeful',
      prayerRequests: ['Continued faith', 'Strength for challenges'],
      actionItems: ['Memorize verse', 'Share testimony'],
      isPrivate: false
    };
    
    const response = await apiCall('/api/journeys/reflections', 'POST', reflectionData);
    
    if (response.status !== 201) {
      return { success: false, message: `Expected 201, got ${response.status}` };
    }
    
    const data = response.data;
    if (!data.id || data.title !== reflectionData.title) {
      return { success: false, message: 'Invalid reflection creation response' };
    }
    
    return { success: true, message: `Reflection created: "${data.title}" (${data.wordCount} words)` };
  });

  await runTest('PUT /api/journeys/reflections/:id - Update reflection', async () => {
    const updateData = {
      title: 'Updated Reflection Title',
      content: 'Updated reflection content with new insights',
      mood: 'grateful',
      tags: ['updated', 'grateful', 'growth']
    };
    
    const response = await apiCall('/api/journeys/reflections/ref-001', 'PUT', updateData);
    
    if (response.status !== 200) {
      return { success: false, message: `Expected 200, got ${response.status}` };
    }
    
    const data = response.data;
    if (!data.updatedAt || data.title !== updateData.title) {
      return { success: false, message: 'Reflection update failed or incomplete' };
    }
    
    return { success: true, message: `Reflection updated: ${data.id}` };
  });

  await runTest('DELETE /api/journeys/reflections/:id - Delete reflection', async () => {
    const response = await apiCall('/api/journeys/reflections/ref-001', 'DELETE');
    
    if (response.status !== 200) {
      return { success: false, message: `Expected 200, got ${response.status}` };
    }
    
    const data = response.data;
    if (!data.deletedAt || !data.message) {
      return { success: false, message: 'Invalid deletion response' };
    }
    
    return { success: true, message: `Reflection deleted: ${data.id}` };
  });

  await runTest('PUT /api/journeys/reflections/:id/actions/:actionId - Update action item', async () => {
    const updateData = {
      completed: true,
      text: 'Updated action item text'
    };
    
    const response = await apiCall('/api/journeys/reflections/ref-002/actions/action-001', 'PUT', updateData);
    
    if (response.status !== 200) {
      return { success: false, message: `Expected 200, got ${response.status}` };
    }
    
    const data = response.data;
    if (!data.completed || !data.updatedAt) {
      return { success: false, message: 'Action item update failed' };
    }
    
    return { success: true, message: `Action item updated: ${data.id} - completed` };
  });

  await runTest('GET /api/journeys/reflections/export - Export reflections', async () => {
    const response = await apiCall('/api/journeys/reflections/export?memberId=member-123&format=json');
    
    if (response.status !== 200) {
      return { success: false, message: `Expected 200, got ${response.status}` };
    }
    
    const data = response.data;
    if (!data.downloadUrl || !data.fileSize) {
      return { success: false, message: 'Missing export details' };
    }
    
    return { success: true, message: `Export ready: ${data.totalReflections} reflections, ${data.fileSize}` };
  });

  // ===========================================
  // TEST RESULTS SUMMARY
  // ===========================================

  console.log('\n' + '='.repeat(60));
  console.log('📊 SPRINT 5: SPIRITUAL JOURNEY EXTENSIONS TEST RESULTS');
  console.log('='.repeat(60));
  
  console.log(`\n📋 Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  // Feature Area Breakdown
  console.log('\n📊 FEATURE AREA COVERAGE:');
  console.log('• Daily Devotions Tracking: 4/4 endpoints tested');
  console.log('• Spiritual Gifts Assessment: 3/3 endpoints tested');
  console.log('• Serving Opportunities: 2/2 endpoints tested');
  console.log('• Journey Milestone Tracking: 2/2 endpoints tested');
  console.log('• Spiritual Growth Analytics: 2/2 endpoints tested');
  console.log('• Personal Reflection & Notes: 6/6 endpoints tested');
  console.log(`\n🎯 Total API Coverage: 19/19 endpoints (100%)`);

  // API Endpoints Summary
  console.log('\n🔗 TESTED API ENDPOINTS:');
  const endpoints = [
    'GET /api/journeys/devotions',
    'POST /api/journeys/devotions', 
    'PUT /api/journeys/devotions/:id',
    'GET /api/journeys/devotions/plans',
    'GET /api/journeys/spiritual-gifts',
    'POST /api/journeys/spiritual-gifts',
    'GET /api/journeys/spiritual-gifts/questions',
    'GET /api/journeys/serving-opportunities',
    'POST /api/journeys/serving-opportunities/:id/apply',
    'GET /api/journeys/milestones',
    'PUT /api/journeys/milestones/:id',
    'GET /api/journeys/analytics',
    'GET /api/journeys/analytics/trends',
    'GET /api/journeys/reflections',
    'POST /api/journeys/reflections',
    'PUT /api/journeys/reflections/:id',
    'DELETE /api/journeys/reflections/:id',
    'PUT /api/journeys/reflections/:id/actions/:actionId',
    'GET /api/journeys/reflections/export'
  ];
  
  endpoints.forEach((endpoint, index) => {
    const test = testResults[index];
    const status = test?.status === 'PASS' ? '✅' : '❌';
    console.log(`${status} ${endpoint}`);
  });

  // Detailed Failed Tests
  if (failedTests > 0) {
    console.log('\n❌ FAILED TEST DETAILS:');
    testResults.filter(test => test.status !== 'PASS').forEach(test => {
      console.log(`• ${test.test}: ${test.message}`);
    });
  }

  // Production Readiness Assessment
  console.log('\n🚀 PRODUCTION READINESS:');
  const readinessScore = (passedTests / totalTests) * 100;
  if (readinessScore >= 95) {
    console.log('✅ EXCELLENT - Ready for production deployment');
  } else if (readinessScore >= 85) {
    console.log('⚠️  GOOD - Minor issues to address before production');
  } else {
    console.log('❌ NEEDS WORK - Significant issues require attention');
  }

  console.log('\n🙏 Sprint 5: Spiritual Journey Extensions testing complete!');
  console.log('Next: Frontend integration testing and production validation\n');
}

// Error handling and execution
runJourneyTests().catch(error => {
  console.error('❌ Test suite error:', error);
  process.exit(1);
});
