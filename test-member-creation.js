const fetch = require('node-fetch');

async function testMemberCreation() {
  console.log('🧪 Testing Member Creation Endpoint');
  
  try {
    const response = await fetch('http://localhost:8000/api/members', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock_admin_token'
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '555-1234',
        role: 'member',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345'
        }
      })
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Member created successfully:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to create member:');
      console.log(errorText);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

testMemberCreation();
