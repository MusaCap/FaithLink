const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

console.log('🧪 FaithLink360 Feature Completion Sprint - Comprehensive Test Suite');
console.log('==================================================================');
console.log('Testing all newly implemented modules and APIs...\n');

async function testAPI(endpoint, method = 'GET', data = null, expectedStatus = 200) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      timeout: 5000
    };
    
    if (data) {
      config.data = data;
      config.headers = { 'Content-Type': 'application/json' };
    }
    
    const response = await axios(config);
    
    if (response.status === expectedStatus) {
      console.log(`✅ ${method} ${endpoint} - Status: ${response.status}`);
      return { success: true, data: response.data };
    } else {
      console.log(`❌ ${method} ${endpoint} - Expected: ${expectedStatus}, Got: ${response.status}`);
      return { success: false, error: `Status mismatch` };
    }
  } catch (error) {
    console.log(`❌ ${method} ${endpoint} - Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  let passedTests = 0;
  let totalTests = 0;
  
  console.log('🗨️ COMMUNICATIONS MODULE TESTS');
  console.log('==============================');
  
  // Communications API Tests
  totalTests++;
  const campaignsTest = await testAPI('/api/communications/campaigns');
  if (campaignsTest.success) passedTests++;
  
  totalTests++;
  const announcementsTest = await testAPI('/api/communications/announcements');
  if (announcementsTest.success) passedTests++;
  
  totalTests++;
  const createCampaignTest = await testAPI('/api/communications/campaigns', 'POST', {
    title: 'Test Campaign',
    content: 'Test content',
    recipients: ['test@example.com']
  }, 201);
  if (createCampaignTest.success) passedTests++;
  
  console.log('');
  
  console.log('❤️ PASTORAL CARE MODULE TESTS');
  console.log('===============================');
  
  // Care API Tests
  totalTests++;
  const prayerRequestsTest = await testAPI('/api/care/prayer-requests');
  if (prayerRequestsTest.success) passedTests++;
  
  totalTests++;
  const memberCareTest = await testAPI('/api/care/member-care');
  if (memberCareTest.success) passedTests++;
  
  totalTests++;
  const counselingTest = await testAPI('/api/care/counseling-sessions');
  if (counselingTest.success) passedTests++;
  
  totalTests++;
  const createPrayerTest = await testAPI('/api/care/prayer-requests', 'POST', {
    title: 'Test Prayer Request',
    content: 'Please pray for test',
    category: 'personal'
  }, 201);
  if (createPrayerTest.success) passedTests++;
  
  console.log('');
  
  console.log('📊 REPORTS & ANALYTICS MODULE TESTS');
  console.log('====================================');
  
  // Reports API Tests
  totalTests++;
  const attendanceAnalyticsTest = await testAPI('/api/reports/attendance-analytics');
  if (attendanceAnalyticsTest.success) passedTests++;
  
  totalTests++;
  const memberEngagementTest = await testAPI('/api/reports/member-engagement');
  if (memberEngagementTest.success) passedTests++;
  
  totalTests++;
  const groupHealthTest = await testAPI('/api/reports/group-health');
  if (groupHealthTest.success) passedTests++;
  
  console.log('');
  
  console.log('⚙️ SETTINGS & ADMIN MODULE TESTS');
  console.log('==================================');
  
  // Settings API Tests
  totalTests++;
  const churchSettingsTest = await testAPI('/api/settings/church');
  if (churchSettingsTest.success) passedTests++;
  
  totalTests++;
  const usersTest = await testAPI('/api/settings/users');
  if (usersTest.success) passedTests++;
  
  totalTests++;
  const systemSettingsTest = await testAPI('/api/settings/system');
  if (systemSettingsTest.success) passedTests++;
  
  totalTests++;
  const updateChurchTest = await testAPI('/api/settings/church', 'PUT', {
    name: 'Test Church Update',
    address: '123 Test St'
  });
  if (updateChurchTest.success) passedTests++;
  
  console.log('');
  
  console.log('🎉 ENHANCED EVENT MANAGEMENT TESTS');
  console.log('===================================');
  
  // Enhanced Events API Tests
  totalTests++;
  const eventRegistrationTest = await testAPI('/api/events/1/register', 'POST', {
    attendeeName: 'Test User',
    email: 'test@example.com',
    attendeeCount: 2
  }, 201);
  if (eventRegistrationTest.success) passedTests++;
  
  totalTests++;
  const rsvpListTest = await testAPI('/api/events/1/rsvps');
  if (rsvpListTest.success) passedTests++;
  
  totalTests++;
  const checkInDataTest = await testAPI('/api/events/1/check-in');
  if (checkInDataTest.success) passedTests++;
  
  totalTests++;
  const performCheckInTest = await testAPI('/api/events/1/check-in/1', 'POST', {}, 201);
  if (performCheckInTest.success) passedTests++;
  
  console.log('');
  
  console.log('👥 ADVANCED MEMBER FEATURES TESTS');
  console.log('==================================');
  
  // Member Self-Service API Tests
  totalTests++;
  const memberProfileTest = await testAPI('/api/members/self-service/profile');
  if (memberProfileTest.success) passedTests++;
  
  totalTests++;
  const notificationSettingsTest = await testAPI('/api/members/self-service/notifications');
  if (notificationSettingsTest.success) passedTests++;
  
  totalTests++;
  const updateProfileTest = await testAPI('/api/members/self-service/profile', 'PUT', {
    name: 'Updated Name',
    email: 'updated@example.com'
  });
  if (updateProfileTest.success) passedTests++;
  
  // Volunteer System API Tests
  totalTests++;
  const volunteerOpportunitiesTest = await testAPI('/api/volunteers/opportunities');
  if (volunteerOpportunitiesTest.success) passedTests++;
  
  totalTests++;
  const mySignupsTest = await testAPI('/api/volunteers/my-signups');
  if (mySignupsTest.success) passedTests++;
  
  totalTests++;
  const volunteerSignupTest = await testAPI('/api/volunteers/signup', 'POST', {
    opportunityId: '1',
    availability: 'Weekends',
    experience: 'Previous volunteer work',
    motivation: 'Want to serve the community'
  }, 201);
  if (volunteerSignupTest.success) passedTests++;
  
  console.log('');
  
  console.log('🎯 TEST RESULTS SUMMARY');
  console.log('========================');
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`📊 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! FaithLink360 feature completion sprint successful!');
    return true;
  } else {
    console.log(`❌ ${totalTests - passedTests} tests failed. Review implementation.`);
    return false;
  }
}

// Run the comprehensive test suite
runTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Test suite failed to run:', error);
    process.exit(1);
  });
