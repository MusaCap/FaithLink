const fetch = require('node-fetch');

async function getMemberIds() {
  try {
    const response = await fetch('http://localhost:8000/api/members', {
      headers: { 'Authorization': 'Bearer mock_admin_token' }
    });
    const data = await response.json();
    
    console.log('👥 Available Members:');
    if (data.members && data.members.length > 0) {
      data.members.forEach(member => {
        console.log(`   - ${member.id}: ${member.firstName} ${member.lastName} (${member.role})`);
      });
      
      console.log(`\n✅ Using first member ID: ${data.members[0].id}`);
      console.log(`✅ Using second member ID: ${data.members[1]?.id || 'N/A'}`);
    } else {
      console.log('   No members found!');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

getMemberIds().catch(console.error);
