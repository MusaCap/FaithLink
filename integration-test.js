// Quick integration test to verify frontend-backend connectivity
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testEndpoints() {
  console.log('🧪 Testing FaithLink360 API Endpoints...\n');

  try {
    // Test health endpoint
    console.log('Testing /health...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    // Test API test endpoint
    console.log('\nTesting /api/test...');
    const testResponse = await axios.get(`${API_BASE_URL}/api/test`);
    console.log('✅ API test passed:', testResponse.data);

    // Test Groups API
    console.log('\nTesting /api/groups...');
    const groupsResponse = await axios.get(`${API_BASE_URL}/api/groups`);
    console.log('✅ Groups API passed:', {
      totalGroups: groupsResponse.data.total,
      firstGroup: groupsResponse.data.groups[0]?.name
    });

    // Test Journey Templates API
    console.log('\nTesting /api/journeys/templates...');
    const journeyResponse = await axios.get(`${API_BASE_URL}/api/journeys/templates`);
    console.log('✅ Journey Templates API passed:', {
      totalTemplates: journeyResponse.data.total,
      firstTemplate: journeyResponse.data.templates[0]?.name
    });

    // Test Attendance API
    console.log('\nTesting /api/attendance...');
    const attendanceResponse = await axios.get(`${API_BASE_URL}/api/attendance`);
    console.log('✅ Attendance API passed:', {
      totalSessions: attendanceResponse.data.total
    });

    console.log('\n🎉 All API endpoints are working correctly!');
    console.log('🔗 Backend-Frontend integration is ready for testing.');

  } catch (error) {
    console.error('❌ Error testing endpoints:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testEndpoints();
