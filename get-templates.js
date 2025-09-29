const fetch = require('node-fetch');

async function getAvailableTemplates() {
  try {
    const response = await fetch('http://localhost:8000/api/journey-templates', {
      headers: { 'Authorization': 'Bearer mock_admin_token' }
    });
    const data = await response.json();
    
    console.log('📋 Available Journey Templates:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.templates && data.templates.length > 0) {
      console.log('\n🔍 Template IDs available:');
      data.templates.forEach(template => {
        console.log(`   - ${template.id}: "${template.title}"`);
      });
      
      const firstTemplateId = data.templates[0].id;
      console.log(`\n✅ Using first template ID for testing: ${firstTemplateId}`);
      return firstTemplateId;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }
}

getAvailableTemplates().catch(console.error);
