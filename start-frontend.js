// Simple frontend server starter for FaithLink360
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting FaithLink360 Frontend Server...');

const frontendDir = path.join(__dirname, 'src', 'frontend');
console.log(`📂 Frontend directory: ${frontendDir}`);

// Start Next.js dev server
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: frontendDir,
  stdio: 'inherit',
  shell: true
});

frontend.on('error', (err) => {
  console.error('❌ Frontend server error:', err);
});

frontend.on('close', (code) => {
  console.log(`📊 Frontend server exited with code: ${code}`);
});

console.log('🎯 Frontend server starting...');
console.log('🌐 Expected URL: http://localhost:3000');

// Test connectivity after 10 seconds
setTimeout(() => {
  const http = require('http');
  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET',
    timeout: 5000
  }, (res) => {
    console.log('✅ Frontend server is responding');
  });
  
  req.on('error', (err) => {
    console.log('⚠️ Frontend server not yet accessible:', err.message);
  });
  
  req.end();
}, 10000);
