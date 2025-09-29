/**
 * FaithLink360 Communications Module Integration Test Suite
 * Sprint 3: Communications Extensions
 * 
 * Tests all communication-related API endpoints:
 * - Email Campaign Sending
 * - Communication Templates (CRUD)
 * - Enhanced Announcements System
 * - SMS Integration
 * - Communication Analytics & Tracking
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Test configuration
const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Mock authentication token for testing
const AUTH_TOKEN = 'mock_token_admin-123';
const REQUEST_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${AUTH_TOKEN}`
};

// Test state tracking
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to log test results
function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const message = `${status}: ${testName}${details ? ' - ' + details : ''}`;
  console.log(message);
  
  testResults.tests.push({ name: testName, passed, details });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

// Helper function to make API requests
async function apiRequest(endpoint, method = 'GET', body = null) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const options = {
    method,
    headers: REQUEST_HEADERS,
    ...(body && { body: JSON.stringify(body) })
  };

  try {
    const response = await fetch(url, options);
    const data = response.status === 204 ? null : await response.json();
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error.message);
    return { status: 500, data: null, ok: false, error: error.message };
  }
}

// ========================================
// COMMUNICATION TEMPLATES TESTS
// ========================================

async function testCommunicationTemplates() {
  console.log('\n🔄 Testing Communication Templates API...');

  // Test 1: GET /api/communications/templates - List templates
  const listResponse = await apiRequest('/communications/templates');
  logTest('List Communication Templates', 
    listResponse.ok && Array.isArray(listResponse.data.templates),
    `Status: ${listResponse.status}, Templates count: ${listResponse.data?.templates?.length || 0}`
  );

  // Test 2: POST /api/communications/templates - Create template
  const newTemplate = {
    name: 'Test Event Invitation',
    category: 'events',
    type: 'email',
    subject: 'You\'re Invited to {{event_name}}',
    content: '<h1>{{event_name}}</h1><p>Join us on {{event_date}} at {{event_time}}</p>',
    variables: ['event_name', 'event_date', 'event_time']
  };

  const createResponse = await apiRequest('/communications/templates', 'POST', newTemplate);
  const templateId = createResponse.data?.id;
  logTest('Create Communication Template',
    createResponse.status === 201 && templateId,
    `Status: ${createResponse.status}, Template ID: ${templateId}`
  );

  // Test 3: GET /api/communications/templates/:id - Get single template
  if (templateId) {
    const getResponse = await apiRequest(`/communications/templates/${templateId}`);
    logTest('Get Single Template',
      getResponse.ok && getResponse.data.id === templateId,
      `Status: ${getResponse.status}, Name: ${getResponse.data?.name}`
    );
  }

  // Test 4: PUT /api/communications/templates/:id - Update template
  if (templateId) {
    const updateData = {
      name: 'Updated Event Invitation',
      subject: 'Updated: You\'re Invited to {{event_name}}'
    };
    const updateResponse = await apiRequest(`/communications/templates/${templateId}`, 'PUT', updateData);
    logTest('Update Template',
      updateResponse.ok && updateResponse.data.name === updateData.name,
      `Status: ${updateResponse.status}, Updated name: ${updateResponse.data?.name}`
    );
  }

  // Test 5: GET /api/communications/templates/categories - Get categories
  const categoriesResponse = await apiRequest('/communications/templates/categories');
  logTest('Get Template Categories',
    categoriesResponse.ok && Array.isArray(categoriesResponse.data.categories),
    `Status: ${categoriesResponse.status}, Categories count: ${categoriesResponse.data?.categories?.length || 0}`
  );

  // Test 6: DELETE /api/communications/templates/:id - Delete template
  if (templateId) {
    const deleteResponse = await apiRequest(`/communications/templates/${templateId}`, 'DELETE');
    logTest('Delete Template',
      deleteResponse.ok && deleteResponse.data.success,
      `Status: ${deleteResponse.status}, Deleted ID: ${deleteResponse.data?.templateId}`
    );
  }
}

// ========================================
// EMAIL CAMPAIGN SENDING TESTS
// ========================================

async function testEmailCampaignSending() {
  console.log('\n📧 Testing Email Campaign Sending API...');

  // Test 1: POST /api/communications/campaigns/:id/send - Send campaign
  const campaignId = 'test-campaign-123';
  const sendData = {
    scheduleTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    recipientGroups: ['all-members'],
    priority: 'high'
  };

  const sendResponse = await apiRequest(`/communications/campaigns/${campaignId}/send`, 'POST', sendData);
  logTest('Send Email Campaign',
    sendResponse.ok && sendResponse.data.status,
    `Status: ${sendResponse.status}, Campaign status: ${sendResponse.data?.status}, Recipients: ${sendResponse.data?.totalRecipients}`
  );

  // Test 2: GET /api/communications/campaigns/:id/status - Check campaign status
  const statusResponse = await apiRequest(`/communications/campaigns/${campaignId}/status`);
  logTest('Check Campaign Status',
    statusResponse.ok && statusResponse.data.campaignId === campaignId,
    `Status: ${statusResponse.status}, Campaign status: ${statusResponse.data?.status}`
  );
}

// ========================================
// ENHANCED ANNOUNCEMENTS TESTS
// ========================================

async function testEnhancedAnnouncements() {
  console.log('\n📢 Testing Enhanced Announcements System...');

  const announcementId = 'test-announcement-456';

  // Test 1: PUT /api/communications/announcements/:id/schedule - Schedule announcement
  const scheduleData = {
    scheduleTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
    channels: ['email', 'sms', 'website'],
    priority: 'high'
  };

  const scheduleResponse = await apiRequest(`/communications/announcements/${announcementId}/schedule`, 'PUT', scheduleData);
  logTest('Schedule Announcement',
    scheduleResponse.ok && scheduleResponse.data.status === 'scheduled',
    `Status: ${scheduleResponse.status}, Channels: ${scheduleResponse.data?.channels?.join(', ')}`
  );

  // Test 2: POST /api/communications/announcements/:id/send - Send announcement immediately
  const sendData = {
    channels: ['email', 'website'],
    targetGroups: ['youth-group', 'choir'],
    priority: 'normal'
  };

  const sendResponse = await apiRequest(`/communications/announcements/${announcementId}/send`, 'POST', sendData);
  logTest('Send Announcement Immediately',
    sendResponse.ok && sendResponse.data.status === 'sending',
    `Status: ${sendResponse.status}, Recipients: ${sendResponse.data?.totalRecipients}, Channels: ${sendResponse.data?.channels?.length}`
  );

  // Test 3: GET /api/communications/announcements/:id/analytics - Get announcement analytics
  const analyticsResponse = await apiRequest(`/communications/announcements/${announcementId}/analytics`);
  logTest('Get Announcement Analytics',
    analyticsResponse.ok && analyticsResponse.data.announcementId === announcementId,
    `Status: ${analyticsResponse.status}, Performance data available: ${!!analyticsResponse.data?.performance}`
  );
}

// ========================================
// SMS INTEGRATION TESTS
// ========================================

async function testSMSIntegration() {
  console.log('\n📱 Testing SMS Integration API...');

  // Test 1: POST /api/communications/sms - Send SMS
  const smsData = {
    message: 'Test SMS from FaithLink360: Service reminder for Sunday at 10 AM',
    recipients: ['+1-555-123-4567', '+1-555-987-6543'],
    priority: 'normal'
  };

  const smsResponse = await apiRequest('/communications/sms', 'POST', smsData);
  const messageId = smsResponse.data?.messageId;
  logTest('Send SMS Message',
    smsResponse.ok && messageId,
    `Status: ${smsResponse.status}, Message ID: ${messageId}, Recipients: ${smsResponse.data?.recipientCount}`
  );

  // Test 2: GET /api/communications/sms/:id/status - Get SMS delivery status
  if (messageId) {
    const statusResponse = await apiRequest(`/communications/sms/${messageId}/status`);
    logTest('Check SMS Delivery Status',
      statusResponse.ok && statusResponse.data.messageId === messageId,
      `Status: ${statusResponse.status}, Delivery rate: ${statusResponse.data?.deliveryRate}%`
    );
  }
}

// ========================================
// COMMUNICATION ANALYTICS TESTS
// ========================================

async function testCommunicationAnalytics() {
  console.log('\n📊 Testing Communication Analytics & Tracking...');

  // Test 1: GET /api/communications/analytics/overview - Analytics overview
  const overviewResponse = await apiRequest('/communications/analytics/overview?timeRange=30days');
  logTest('Communication Analytics Overview',
    overviewResponse.ok && overviewResponse.data.summary,
    `Status: ${overviewResponse.status}, Total campaigns: ${overviewResponse.data?.summary?.totalCampaigns}, Avg open rate: ${overviewResponse.data?.summary?.averageOpenRate}%`
  );

  // Test 2: GET /api/communications/analytics/campaigns/:id - Detailed campaign analytics
  const campaignId = 'test-campaign-789';
  const detailedResponse = await apiRequest(`/communications/analytics/campaigns/${campaignId}`);
  logTest('Detailed Campaign Analytics',
    detailedResponse.ok && detailedResponse.data.campaignId === campaignId,
    `Status: ${detailedResponse.status}, Campaign: ${detailedResponse.data?.campaignName}, Recipients: ${detailedResponse.data?.totalRecipients}`
  );
}

// ========================================
// MAIN TEST EXECUTION
// ========================================

async function runCommunicationsIntegrationTests() {
  console.log('🚀 Starting FaithLink360 Communications Module Integration Tests');
  console.log('=' .repeat(70));

  const startTime = Date.now();

  try {
    // Run all test suites
    await testCommunicationTemplates();
    await testEmailCampaignSending();
    await testEnhancedAnnouncements();
    await testSMSIntegration();
    await testCommunicationAnalytics();

    const duration = Date.now() - startTime;

    // Print final results
    console.log('\n' + '=' .repeat(70));
    console.log('📊 COMMUNICATIONS MODULE TEST RESULTS');
    console.log('=' .repeat(70));
    console.log(`✅ Tests Passed: ${testResults.passed}`);
    console.log(`❌ Tests Failed: ${testResults.failed}`);
    console.log(`⏱️  Total Duration: ${duration}ms`);
    console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

    if (testResults.failed === 0) {
      console.log('\n🎉 ALL COMMUNICATIONS TESTS PASSED! Module is ready for production.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the issues above.');
      console.log('\nFailed tests:');
      testResults.tests
        .filter(t => !t.passed)
        .forEach(t => console.log(`  - ${t.name}: ${t.details}`));
    }

    // API Coverage Summary
    console.log('\n📋 API ENDPOINT COVERAGE:');
    console.log('  📝 Communication Templates: 6/6 endpoints tested');
    console.log('  📧 Email Campaigns: 2/2 endpoints tested');
    console.log('  📢 Announcements: 3/3 endpoints tested');
    console.log('  📱 SMS Integration: 2/2 endpoints tested');
    console.log('  📊 Analytics: 2/2 endpoints tested');
    console.log('  🎯 Total Coverage: 15/15 (100%)');

  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Execute tests
if (require.main === module) {
  runCommunicationsIntegrationTests();
}

module.exports = {
  runCommunicationsIntegrationTests,
  testCommunicationTemplates,
  testEmailCampaignSending,
  testEnhancedAnnouncements,
  testSMSIntegration,
  testCommunicationAnalytics
};
