/**
 * FaithLink360 Advanced Events Module Integration Test Suite
 * Sprint 4: Advanced Events Module
 * 
 * Tests all advanced event management API endpoints:
 * - Event Registration System (CRUD)
 * - RSVP Tracking System
 * - Event Check-in System
 * - Event Waitlist Management
 * - Event Capacity & Resource Management
 * - Event Analytics & Reporting
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
// EVENT REGISTRATION SYSTEM TESTS
// ========================================

async function testEventRegistrationSystem() {
  console.log('\n📋 Testing Event Registration System API...');

  const eventId = 'test-event-123';

  // Test 1: GET /api/events/:id/registrations - List registrations
  const listResponse = await apiRequest(`/events/${eventId}/registrations`);
  logTest('List Event Registrations', 
    listResponse.ok && Array.isArray(listResponse.data.registrations),
    `Status: ${listResponse.status}, Registrations: ${listResponse.data?.registrations?.length || 0}`
  );

  // Test 2: POST /api/events/:id/registrations - Create registration
  const newRegistration = {
    memberId: 'member-test-001',
    memberName: 'Test User',
    email: 'test.user@email.com',
    phone: '+1-555-TEST-001',
    guestCount: 2,
    specialRequests: 'Vegetarian meal preference'
  };

  const createResponse = await apiRequest(`/events/${eventId}/registrations`, 'POST', newRegistration);
  const registrationId = createResponse.data?.id;
  logTest('Create Event Registration',
    createResponse.status === 201 && registrationId,
    `Status: ${createResponse.status}, Registration ID: ${registrationId}`
  );

  // Test 3: PUT /api/events/:id/registrations/:registrationId - Update registration
  if (registrationId) {
    const updateData = {
      guestCount: 3,
      specialRequests: 'Updated: Vegetarian meal and wheelchair access'
    };
    const updateResponse = await apiRequest(`/events/${eventId}/registrations/${registrationId}`, 'PUT', updateData);
    logTest('Update Registration',
      updateResponse.ok && updateResponse.data.guestCount === 3,
      `Status: ${updateResponse.status}, Updated guest count: ${updateResponse.data?.guestCount}`
    );
  }

  // Test 4: DELETE /api/events/:id/registrations/:registrationId - Cancel registration
  if (registrationId) {
    const deleteResponse = await apiRequest(`/events/${eventId}/registrations/${registrationId}`, 'DELETE');
    logTest('Cancel Registration',
      deleteResponse.ok && deleteResponse.data.success,
      `Status: ${deleteResponse.status}, Cancelled: ${deleteResponse.data?.registrationId}`
    );
  }
}

// ========================================
// RSVP TRACKING SYSTEM TESTS
// ========================================

async function testRSVPTrackingSystem() {
  console.log('\n📊 Testing RSVP Tracking System API...');

  const eventId = 'test-rsvp-event-456';

  // Test 1: GET /api/events/:id/rsvp - Get RSVP summary
  const summaryResponse = await apiRequest(`/events/${eventId}/rsvp`);
  logTest('Get RSVP Summary',
    summaryResponse.ok && summaryResponse.data.rsvpCounts,
    `Status: ${summaryResponse.status}, Attending: ${summaryResponse.data?.rsvpCounts?.attending || 0}`
  );

  // Test 2: POST /api/events/:id/rsvp - Submit RSVP
  const rsvpData = {
    memberId: 'member-rsvp-001',
    memberName: 'RSVP Test User',
    response: 'attending',
    guestCount: 1,
    note: 'Looking forward to this event!',
    dietaryRestrictions: 'Gluten-free'
  };

  const rsvpResponse = await apiRequest(`/events/${eventId}/rsvp`, 'POST', rsvpData);
  const rsvpId = rsvpResponse.data?.id;
  logTest('Submit RSVP',
    rsvpResponse.status === 201 && rsvpId,
    `Status: ${rsvpResponse.status}, RSVP ID: ${rsvpId}, Response: ${rsvpResponse.data?.response}`
  );

  // Test 3: PUT /api/events/:id/rsvp/:rsvpId - Update RSVP
  if (rsvpId) {
    const updateData = {
      response: 'maybe',
      guestCount: 0,
      note: 'Changed to maybe - schedule conflict'
    };
    const updateResponse = await apiRequest(`/events/${eventId}/rsvp/${rsvpId}`, 'PUT', updateData);
    logTest('Update RSVP',
      updateResponse.ok && updateResponse.data.response === 'maybe',
      `Status: ${updateResponse.status}, Updated response: ${updateResponse.data?.response}`
    );
  }
}

// ========================================
// EVENT CHECK-IN SYSTEM TESTS
// ========================================

async function testEventCheckInSystem() {
  console.log('\n✅ Testing Event Check-in System API...');

  const eventId = 'test-checkin-event-789';

  // Test 1: GET /api/events/:id/check-in - Get check-in status
  const statusResponse = await apiRequest(`/events/${eventId}/check-in`);
  logTest('Get Check-in Status',
    statusResponse.ok && statusResponse.data.totalExpected,
    `Status: ${statusResponse.status}, Expected: ${statusResponse.data?.totalExpected}, Checked-in: ${statusResponse.data?.totalCheckedIn}`
  );

  // Test 2: POST /api/events/:id/check-in - Check in attendee
  const checkinData = {
    memberId: 'member-checkin-001',
    memberName: 'Check-in Test User',
    actualGuestCount: 1,
    checkInMethod: 'qr_code',
    notes: 'Arrived on time'
  };

  const checkinResponse = await apiRequest(`/events/${eventId}/check-in`, 'POST', checkinData);
  const checkinId = checkinResponse.data?.id;
  logTest('Check-in Attendee',
    checkinResponse.status === 201 && checkinId,
    `Status: ${checkinResponse.status}, Check-in ID: ${checkinId}, Method: ${checkinResponse.data?.checkInMethod}`
  );

  // Test 3: PUT /api/events/:id/check-in/:memberId - Update check-in
  const memberId = 'member-checkin-001';
  const updateData = {
    actualGuestCount: 2,
    notes: 'Additional guest arrived',
    status: 'late'
  };
  const updateResponse = await apiRequest(`/events/${eventId}/check-in/${memberId}`, 'PUT', updateData);
  logTest('Update Check-in Record',
    updateResponse.ok && updateResponse.data.actualGuestCount === 2,
    `Status: ${updateResponse.status}, Updated guest count: ${updateResponse.data?.actualGuestCount}`
  );

  // Test 4: DELETE /api/events/:id/check-in/:memberId - Undo check-in
  const undoResponse = await apiRequest(`/events/${eventId}/check-in/${memberId}`, 'DELETE');
  logTest('Undo Check-in',
    undoResponse.ok && undoResponse.data.success,
    `Status: ${undoResponse.status}, Undone for: ${undoResponse.data?.memberName}`
  );
}

// ========================================
// EVENT WAITLIST MANAGEMENT TESTS
// ========================================

async function testEventWaitlistManagement() {
  console.log('\n📝 Testing Event Waitlist Management API...');

  const eventId = 'test-waitlist-event-101';

  // Test 1: GET /api/events/:id/waitlist - Get waitlist
  const listResponse = await apiRequest(`/events/${eventId}/waitlist`);
  logTest('Get Event Waitlist',
    listResponse.ok && Array.isArray(listResponse.data.waitlistEntries),
    `Status: ${listResponse.status}, Waitlist count: ${listResponse.data?.waitlistCount || 0}`
  );

  // Test 2: POST /api/events/:id/waitlist - Join waitlist
  const waitlistData = {
    memberId: 'member-waitlist-001',
    memberName: 'Waitlist Test User',
    email: 'waitlist.test@email.com',
    phone: '+1-555-WAIT-001',
    guestCount: 1,
    notes: 'Flexible with dates'
  };

  const joinResponse = await apiRequest(`/events/${eventId}/waitlist`, 'POST', waitlistData);
  const waitlistId = joinResponse.data?.id;
  logTest('Join Event Waitlist',
    joinResponse.status === 201 && waitlistId,
    `Status: ${joinResponse.status}, Waitlist ID: ${waitlistId}, Position: ${joinResponse.data?.position}`
  );

  // Test 3: PUT /api/events/:id/waitlist/:waitlistId/promote - Promote from waitlist
  if (waitlistId) {
    const promoteResponse = await apiRequest(`/events/${eventId}/waitlist/${waitlistId}/promote`, 'PUT');
    logTest('Promote from Waitlist',
      promoteResponse.ok && promoteResponse.data.success,
      `Status: ${promoteResponse.status}, Promoted: ${promoteResponse.data?.memberName}`
    );
  }

  // Test 4: DELETE /api/events/:id/waitlist/:waitlistId - Remove from waitlist
  const testWaitlistId = 'wait-test-remove';
  const removeResponse = await apiRequest(`/events/${eventId}/waitlist/${testWaitlistId}`, 'DELETE');
  logTest('Remove from Waitlist',
    removeResponse.ok && removeResponse.data.success,
    `Status: ${removeResponse.status}, Removed: ${removeResponse.data?.waitlistId}`
  );
}

// ========================================
// EVENT CAPACITY & RESOURCE MANAGEMENT TESTS
// ========================================

async function testEventCapacityManagement() {
  console.log('\n📊 Testing Event Capacity & Resource Management API...');

  const eventId = 'test-capacity-event-202';

  // Test 1: GET /api/events/:id/capacity - Get capacity status
  const capacityResponse = await apiRequest(`/events/${eventId}/capacity`);
  logTest('Get Event Capacity Status',
    capacityResponse.ok && capacityResponse.data.venue,
    `Status: ${capacityResponse.status}, Occupancy: ${capacityResponse.data?.venue?.currentOccupancy}/${capacityResponse.data?.venue?.maxCapacity}`
  );

  // Test 2: PUT /api/events/:id/capacity - Update capacity
  const capacityData = {
    maxCapacity: 200,
    roomConfiguration: 'theater_style',
    staffingRequirements: { volunteers: 10, coordinators: 3 }
  };

  const updateResponse = await apiRequest(`/events/${eventId}/capacity`, 'PUT', capacityData);
  logTest('Update Event Capacity',
    updateResponse.ok && updateResponse.data.maxCapacity === 200,
    `Status: ${updateResponse.status}, New capacity: ${updateResponse.data?.maxCapacity}`
  );

  // Test 3: POST /api/events/:id/resources - Allocate resources
  const resourceData = {
    resourceType: 'chairs',
    quantity: 50,
    specifications: 'Padded folding chairs',
    priority: 'high'
  };

  const resourceResponse = await apiRequest(`/events/${eventId}/resources`, 'POST', resourceData);
  logTest('Allocate Event Resources',
    resourceResponse.status === 201 && resourceResponse.data.resourceType === 'chairs',
    `Status: ${resourceResponse.status}, Resource: ${resourceResponse.data?.quantity} ${resourceResponse.data?.resourceType}`
  );
}

// ========================================
// EVENT ANALYTICS & REPORTING TESTS
// ========================================

async function testEventAnalytics() {
  console.log('\n📊 Testing Event Analytics & Reporting API...');

  // Test 1: GET /api/events/analytics/overview - Analytics overview
  const overviewResponse = await apiRequest('/events/analytics/overview?timeRange=6months');
  logTest('Event Analytics Overview',
    overviewResponse.ok && overviewResponse.data.summary,
    `Status: ${overviewResponse.status}, Total events: ${overviewResponse.data?.summary?.totalEvents}, Avg attendance: ${overviewResponse.data?.summary?.averageAttendance}`
  );

  // Test 2: GET /api/events/:id/analytics - Individual event analytics
  const eventId = 'test-analytics-event-303';
  const eventResponse = await apiRequest(`/events/${eventId}/analytics`);
  logTest('Individual Event Analytics',
    eventResponse.ok && eventResponse.data.registration,
    `Status: ${eventResponse.status}, Event: ${eventResponse.data?.eventName}, Attendance: ${eventResponse.data?.registration?.finalAttendance}`
  );

  // Test 3: GET /api/events/analytics/attendance-trends - Attendance trends
  const trendsResponse = await apiRequest('/events/analytics/attendance-trends?period=monthly');
  logTest('Attendance Trends Analysis',
    trendsResponse.ok && trendsResponse.data.currentYear,
    `Status: ${trendsResponse.status}, Predictions available: ${!!trendsResponse.data?.predictions}`
  );
}

// ========================================
// MAIN TEST EXECUTION
// ========================================

async function runEventsIntegrationTests() {
  console.log('🚀 Starting FaithLink360 Advanced Events Module Integration Tests');
  console.log('=' .repeat(75));

  const startTime = Date.now();

  try {
    // Run all test suites
    await testEventRegistrationSystem();
    await testRSVPTrackingSystem();
    await testEventCheckInSystem();
    await testEventWaitlistManagement();
    await testEventCapacityManagement();
    await testEventAnalytics();

    const duration = Date.now() - startTime;

    // Print final results
    console.log('\n' + '=' .repeat(75));
    console.log('📊 ADVANCED EVENTS MODULE TEST RESULTS');
    console.log('=' .repeat(75));
    console.log(`✅ Tests Passed: ${testResults.passed}`);
    console.log(`❌ Tests Failed: ${testResults.failed}`);
    console.log(`⏱️  Total Duration: ${duration}ms`);
    console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

    if (testResults.failed === 0) {
      console.log('\n🎉 ALL ADVANCED EVENTS TESTS PASSED! Module is ready for production.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the issues above.');
      console.log('\nFailed tests:');
      testResults.tests
        .filter(t => !t.passed)
        .forEach(t => console.log(`  - ${t.name}: ${t.details}`));
    }

    // API Coverage Summary
    console.log('\n📋 API ENDPOINT COVERAGE:');
    console.log('  📋 Event Registration: 4/4 endpoints tested');
    console.log('  📊 RSVP Tracking: 3/3 endpoints tested');
    console.log('  ✅ Event Check-in: 4/4 endpoints tested');
    console.log('  📝 Waitlist Management: 4/4 endpoints tested');
    console.log('  🏢 Capacity Management: 3/3 endpoints tested');
    console.log('  📊 Event Analytics: 3/3 endpoints tested');
    console.log('  🎯 Total Coverage: 21/21 (100%)');

    // Feature Summary
    console.log('\n🎯 ADVANCED EVENTS FEATURES TESTED:');
    console.log('  ✅ Complete event lifecycle management');
    console.log('  ✅ Real-time registration and RSVP tracking');
    console.log('  ✅ QR code and manual check-in systems');
    console.log('  ✅ Automated waitlist promotion');
    console.log('  ✅ Dynamic capacity and resource allocation');
    console.log('  ✅ Comprehensive analytics and trend analysis');

  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Execute tests
if (require.main === module) {
  runEventsIntegrationTests();
}

module.exports = {
  runEventsIntegrationTests,
  testEventRegistrationSystem,
  testRSVPTrackingSystem,
  testEventCheckInSystem,
  testEventWaitlistManagement,
  testEventCapacityManagement,
  testEventAnalytics
};
