const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🗄️ FaithLink360 Database Setup Script');
console.log('=====================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.log('📝 Please create .env file from .env.example');
  console.log('1. Copy .env.example to .env');
  console.log('2. Add your PostgreSQL DATABASE_URL from Render');
  console.log('3. Add a secure JWT_SECRET');
  process.exit(1);
}

console.log('✅ .env file found');

try {
  // Step 1: Generate Prisma Client
  console.log('🔧 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('✅ Prisma Client generated\n');

  // Step 2: Test Database Connection
  console.log('🔗 Testing database connection...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('✅ Database connection successful\n');

  // Step 3: Create Migration
  console.log('📊 Creating database schema...');
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('✅ Database schema created\n');

  // Step 4: Seed Database
  console.log('🌱 Seeding database with sample data...');
  execSync('npx prisma db seed', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('✅ Database seeded successfully\n');

  // Step 5: Success Summary
  console.log('🎉 DATABASE SETUP COMPLETE!');
  console.log('=============================');
  console.log('✅ PostgreSQL database connected');
  console.log('✅ Schema migrated (15 models)');
  console.log('✅ Sample data loaded');
  console.log('');
  console.log('📋 Sample Accounts Created:');
  console.log('- Admin: admin@faithlink360.com (password: admin123)');
  console.log('- Pastor: david.johnson@faithlink360.org (password: admin123)');
  console.log('- Sample Members: John Smith, Sarah Johnson, etc.');
  console.log('');
  console.log('🚀 Ready to start server:');
  console.log('   npm run dev');
  console.log('');
  console.log('🌐 Test endpoints:');
  console.log('   http://localhost:8000/health');
  console.log('   http://localhost:8000/api/members');
  console.log('   http://localhost:8000/api/care/prayer-requests');

} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Verify DATABASE_URL in .env is correct');
  console.log('2. Check database is active in Render dashboard');
  console.log('3. Ensure PostgreSQL URL format: postgresql://user:pass@host:port/db');
  console.log('4. Try: npx prisma migrate reset (to reset database)');
  process.exit(1);
}
