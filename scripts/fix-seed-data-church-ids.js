// Script to add churchId: 'church-main' to all seed data items that don't have it
const fs = require('fs');
const path = require('path');

const seedDataPath = path.join(__dirname, '../src/backend/data/production-seed.js');

console.log('🔧 Fixing seed data church IDs...');

// Read the current seed data file
let seedContent = fs.readFileSync(seedDataPath, 'utf8');

// Add churchId to all groups that don't have it
seedContent = seedContent.replace(
  /(\s+{[^}]*id: 'grp-[^']+[^}]*)(\s+}/g),
  (match, content, ending) => {
    if (content.includes('churchId:')) {
      return match; // Already has churchId
    }
    // Add churchId before the closing brace
    return content.replace(/(\s+)([^,\s]+:[^,\n]+,?)(\s*)$/m, '$1$2$3$1churchId: \'church-main\',$3') + ending;
  }
);

// Add churchId to all events that don't have it
seedContent = seedContent.replace(
  /(\s+{[^}]*id: 'evt-[^']+[^}]*)(\s+})/g,
  (match, content, ending) => {
    if (content.includes('churchId:')) {
      return match; // Already has churchId
    }
    // Add churchId after category
    return content.replace(/(category: '[^']+',)/, '$1\n      churchId: \'church-main\',') + ending;
  }
);

// Add churchId to all journey templates that don't have it
seedContent = seedContent.replace(
  /(\s+{[^}]*id: 'jt-[^']+[^}]*)(\s+})/g,
  (match, content, ending) => {
    if (content.includes('churchId:')) {
      return match; // Already has churchId
    }
    // Add churchId after category
    return content.replace(/(category: '[^']+',)/, '$1\n      churchId: \'church-main\',') + ending;
  }
);

// Write the updated content back
fs.writeFileSync(seedDataPath, seedContent);

console.log('✅ Seed data church IDs fixed!');
console.log('   - All groups now have churchId: "church-main"');
console.log('   - All events now have churchId: "church-main"');
console.log('   - All journey templates now have churchId: "church-main"');
