// Test specific endpoints with actual data IDs
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const AUTH_HEADERS = {
  'Authorization': 'Bearer mock-jwt-token-admin-user-admin',
  'Content-Type': 'application/json'
};

async function testSpecificEndpoints() {
  console.log('🔍 Testing Specific Problematic Endpoints...\n');

  // Test Journey Templates with real data
  try {
    console.log('1️⃣ Testing Journey Templates...');
    const templatesResponse = await axios.get(`${BASE_URL}/api/journey-templates`, { headers: AUTH_HEADERS });
    console.log(`✅ Journey Templates List: ${templatesResponse.data.templates?.length || 0} templates found`);
    
    if (templatesResponse.data.templates?.length > 0) {
      const firstTemplate = templatesResponse.data.templates[0];
      console.log(`📋 Testing with template ID: ${firstTemplate.id}`);
      
      // Test GET by ID
      const templateResponse = await axios.get(`${BASE_URL}/api/journey-templates/${firstTemplate.id}`, { headers: AUTH_HEADERS });
      console.log(`✅ Journey Template by ID: ${templateResponse.status}`);
      
      // Test PUT
      const updateResponse = await axios.put(`${BASE_URL}/api/journey-templates/${firstTemplate.id}`, 
        { title: 'Updated Template' }, { headers: AUTH_HEADERS });
      console.log(`✅ Journey Template UPDATE: ${updateResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Journey Templates Error: ${error.response?.status || error.message}`);
  }

  // Test Communications with real data
  try {
    console.log('\n2️⃣ Testing Communications...');
    const campaignsResponse = await axios.get(`${BASE_URL}/api/communications/campaigns`, { headers: AUTH_HEADERS });
    console.log(`✅ Communications List: ${campaignsResponse.data.campaigns?.length || 0} campaigns found`);
    
    if (campaignsResponse.data.campaigns?.length > 0) {
      const firstCampaign = campaignsResponse.data.campaigns[0];
      console.log(`📧 Testing with campaign ID: ${firstCampaign.id}`);
      
      // Test GET by ID
      const campaignResponse = await axios.get(`${BASE_URL}/api/communications/campaigns/${firstCampaign.id}`, { headers: AUTH_HEADERS });
      console.log(`✅ Campaign by ID: ${campaignResponse.status}`);
      
      // Test PUT
      const updateResponse = await axios.put(`${BASE_URL}/api/communications/campaigns/${firstCampaign.id}`, 
        { title: 'Updated Campaign' }, { headers: AUTH_HEADERS });
      console.log(`✅ Campaign UPDATE: ${updateResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Communications Error: ${error.response?.status || error.message}`);
  }

  // Test Tasks with real data
  try {
    console.log('\n3️⃣ Testing Tasks...');
    const tasksResponse = await axios.get(`${BASE_URL}/api/tasks`, { headers: AUTH_HEADERS });
    console.log(`✅ Tasks List: ${tasksResponse.data.tasks?.length || 0} tasks found`);
    
    if (tasksResponse.data.tasks?.length > 0) {
      const firstTask = tasksResponse.data.tasks[0];
      console.log(`📋 Testing with task ID: ${firstTask.id}`);
      
      // Test GET by ID
      const taskResponse = await axios.get(`${BASE_URL}/api/tasks/${firstTask.id}`, { headers: AUTH_HEADERS });
      console.log(`✅ Task by ID: ${taskResponse.status}`);
      
      // Test PUT
      const updateResponse = await axios.put(`${BASE_URL}/api/tasks/${firstTask.id}`, 
        { status: 'in_progress' }, { headers: AUTH_HEADERS });
      console.log(`✅ Task UPDATE: ${updateResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Tasks Error: ${error.response?.status || error.message}`);
  }

  // Test DELETE endpoints with new data
  try {
    console.log('\n4️⃣ Testing DELETE endpoints...');
    
    // Create and delete a member
    const newMember = await axios.post(`${BASE_URL}/api/members`, 
      { firstName: 'Test', lastName: 'User', email: 'test@example.com' }, { headers: AUTH_HEADERS });
    console.log(`✅ Member Created: ${newMember.data.id}`);
    
    const deleteMember = await axios.delete(`${BASE_URL}/api/members/${newMember.data.id}`, { headers: AUTH_HEADERS });
    console.log(`✅ Member DELETED: ${deleteMember.status}`);
    
    // Create and delete a group
    const newGroup = await axios.post(`${BASE_URL}/api/groups`, 
      { name: 'Test Group' }, { headers: AUTH_HEADERS });
    console.log(`✅ Group Created: ${newGroup.data.id}`);
    
    const deleteGroup = await axios.delete(`${BASE_URL}/api/groups/${newGroup.data.id}`, { headers: AUTH_HEADERS });
    console.log(`✅ Group DELETED: ${deleteGroup.status}`);

  } catch (error) {
    console.log(`❌ DELETE Error: ${error.response?.status || error.message}`);
  }

  console.log('\n✅ Specific endpoint testing complete!');
}

testSpecificEndpoints().catch(console.error);
