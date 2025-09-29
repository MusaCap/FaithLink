// Test script to verify group creation endpoint
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testGroupCreation() {
  console.log('🧪 Testing Group Creation Endpoint...\n');

  try {
    // Test POST /api/groups
    const groupData = {
      name: 'Test Small Group',
      description: 'A test small group for fellowship',
      category: 'Small Group',
      meetingDay: 'Wednesday',
      meetingTime: '7:00 PM',
      location: 'Room 101',
      maxMembers: 12,
      isPrivate: false
    };

    const response = await axios.post(`${BASE_URL}/api/groups`, groupData, {
      headers: {
        'Authorization': 'Bearer mock-jwt-token-admin-user-admin',
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 201) {
      console.log('✅ Group Creation: SUCCESS');
      console.log(`📝 Created group: ${response.data.name}`);
      console.log(`🆔 Group ID: ${response.data.id}`);
      console.log(`👤 Leader: ${response.data.leaderName}`);
      console.log(`📅 Meeting: ${response.data.meetingSchedule.day} at ${response.data.meetingSchedule.time}`);
      
      // Test fetching the created group
      const fetchResponse = await axios.get(`${BASE_URL}/api/groups/${response.data.id}`, {
        headers: {
          'Authorization': 'Bearer mock-jwt-token-admin-user-admin'
        }
      });
      
      if (fetchResponse.status === 200) {
        console.log('✅ Group Fetch: SUCCESS');
        console.log(`📋 Fetched group: ${fetchResponse.data.group.name}`);
      }

      return true;
    }
  } catch (error) {
    console.log('❌ Group Creation: FAILED');
    console.log(`Error: ${error.message}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return false;
  }
}

testGroupCreation().then(success => {
  if (success) {
    console.log('\n🎉 Group creation endpoint is working correctly!');
  } else {
    console.log('\n❌ Group creation endpoint has issues.');
  }
});
