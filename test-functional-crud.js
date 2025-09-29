const fetch = require('node-fetch');

class FunctionalCrudTester {
  constructor() {
    this.baseUrl = 'http://localhost:8000';
    this.authToken = 'mock_admin_token';
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    const url = `${this.baseUrl}${endpoint}`;
    console.log(`\n🔄 ${method} ${endpoint}`);
    
    if (data) {
      console.log('📤 Request Data:', JSON.stringify(data, null, 2));
    }

    try {
      const response = await fetch(url, options);
      const responseText = await response.text();
      
      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        try {
          const jsonData = JSON.parse(responseText);
          console.log('✅ Success Response:', JSON.stringify(jsonData, null, 2));
          return { success: true, data: jsonData, status: response.status };
        } catch (parseError) {
          console.log('✅ Success Response (Text):', responseText);
          return { success: true, data: responseText, status: response.status };
        }
      } else {
        console.log('❌ Error Response:', responseText);
        return { success: false, error: responseText, status: response.status };
      }
    } catch (error) {
      console.log('💥 Network Error:', error.message);
      return { success: false, error: error.message, networkError: true };
    }
  }

  async testMemberCreation() {
    console.log('\n🧪 === TESTING MEMBER CREATION ===');
    
    const memberData = {
      firstName: 'John',
      lastName: 'TestUser',
      email: 'john.test@faithlink.com',
      phone: '555-1234',
      membershipStatus: 'active',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345'
      },
      tags: ['new-member', 'visitor'],
      notes: 'Test member created from frontend form',
      emergencyContact: {
        name: 'Jane Test',
        relationship: 'Spouse',
        phone: '555-5678',
        email: 'jane.test@email.com'
      },
      preferences: {
        communicationMethod: 'email',
        newsletter: true,
        eventNotifications: true,
        privacyLevel: 'members'
      }
    };

    return await this.makeRequest('/api/members', 'POST', memberData);
  }

  async testEventCreation() {
    console.log('\n🧪 === TESTING EVENT CREATION ===');
    
    const eventData = {
      title: 'Test Sunday Service',
      description: 'A test church service event',
      startDate: '2025-10-01T10:00:00Z',
      endDate: '2025-10-01T11:30:00Z',
      location: 'Main Sanctuary',
      category: 'Service',
      maxCapacity: 150,
      price: 0,
      requiresRegistration: false,
      isPublic: true
    };

    return await this.makeRequest('/api/events', 'POST', eventData);
  }

  async testCommunicationCampaign() {
    console.log('\n🧪 === TESTING CAMPAIGN CREATION ===');
    
    const campaignData = {
      title: 'Test Newsletter Campaign',
      subject: 'Welcome to Our Church Community',
      content: 'Thank you for joining our church family...',
      type: 'newsletter',
      targetAudience: 'all_members',
      scheduledDate: '2025-10-01T09:00:00Z',
      status: 'draft'
    };

    return await this.makeRequest('/api/communications/campaigns', 'POST', campaignData);
  }

  async testJourneyAssignment() {
    console.log('\n🧪 === TESTING JOURNEY ASSIGNMENT ===');
    
    // First get available members and templates
    const membersResponse = await this.makeRequest('/api/members');
    const templatesResponse = await this.makeRequest('/api/journey-templates');
    
    if (!membersResponse.success || !templatesResponse.success) {
      console.log('❌ Failed to get prerequisite data for journey assignment');
      return { success: false, error: 'Prerequisites failed' };
    }

    const members = membersResponse.data.members || [];
    const templates = templatesResponse.data.templates || [];
    
    if (members.length === 0 || templates.length === 0) {
      console.log('❌ No members or templates available for journey assignment');
      return { success: false, error: 'No data available' };
    }

    const journeyData = {
      memberId: members[0].id,
      templateId: templates[0].id,
      mentorId: members.length > 1 ? members[1].id : null,
      startDate: '2025-10-01T00:00:00Z'
    };

    console.log('Using Member:', members[0].firstName, members[0].lastName, '(' + members[0].id + ')');
    console.log('Using Template:', templates[0].title, '(' + templates[0].id + ')');

    return await this.makeRequest('/api/journeys/member-journeys', 'POST', journeyData);
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive CRUD Functionality Test');
    console.log('=' .repeat(60));

    const results = {};

    // Test member creation
    results.memberCreation = await this.testMemberCreation();

    // Test event creation  
    results.eventCreation = await this.testEventCreation();

    // Test communication campaign
    results.campaignCreation = await this.testCommunicationCampaign();

    // Test journey assignment
    results.journeyAssignment = await this.testJourneyAssignment();

    console.log('\n📊 === TEST RESULTS SUMMARY ===');
    console.log('=' .repeat(40));

    let successCount = 0;
    let totalCount = 0;

    Object.entries(results).forEach(([testName, result]) => {
      totalCount++;
      if (result.success) {
        successCount++;
        console.log(`✅ ${testName}: PASSED`);
      } else {
        console.log(`❌ ${testName}: FAILED - ${result.error || 'Unknown error'}`);
      }
    });

    const successRate = ((successCount / totalCount) * 100).toFixed(1);
    console.log('\n🎯 OVERALL RESULTS:');
    console.log(`✅ Success: ${successCount}/${totalCount} (${successRate}%)`);
    
    if (successCount === totalCount) {
      console.log('🎉 ALL FUNCTIONAL CRUD OPERATIONS WORKING!');
    } else {
      console.log('⚠️  Some functionality issues remain to be fixed');
    }

    return results;
  }
}

// Run the tests
const tester = new FunctionalCrudTester();
tester.runAllTests().catch(console.error);
