const http = require('http');
const express = require('express');

console.log('🔧 Testing basic server connectivity...');

// Test 1: Basic HTTP server
console.log('\n📡 Test 1: Basic HTTP Server');
const basicServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'Basic server OK', port: 8001 }));
});

basicServer.listen(8001, '127.0.0.1', () => {
  console.log('✅ Basic HTTP server listening on http://127.0.0.1:8001');
});

basicServer.on('error', (err) => {
  console.error('❌ Basic server error:', err.message);
});

// Test 2: Express server
console.log('\n📡 Test 2: Express Server');
const app = express();
app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ status: 'Express server OK', port: 8002 });
});

const expressServer = app.listen(8002, '127.0.0.1', () => {
  console.log('✅ Express server listening on http://127.0.0.1:8002');
});

expressServer.on('error', (err) => {
  console.error('❌ Express server error:', err.message);
});

// Test 3: Port availability check
console.log('\n🔍 Test 3: Port Availability Check');
const testPorts = [8000, 3000, 8001, 8002];

testPorts.forEach(port => {
  const testServer = http.createServer();
  testServer.listen(port, () => {
    console.log(`✅ Port ${port} is available`);
    testServer.close();
  });
  testServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Port ${port} is already in use`);
    } else {
      console.log(`❌ Port ${port} error: ${err.message}`);
    }
  });
});

// Auto-test connectivity after 2 seconds
setTimeout(async () => {
  console.log('\n🧪 Testing server connectivity...');
  
  // Test basic server
  try {
    const response = await fetch('http://127.0.0.1:8001');
    const data = await response.json();
    console.log('✅ Basic server test:', data);
  } catch (error) {
    console.log('❌ Basic server test failed:', error.message);
  }
  
  // Test express server
  try {
    const response = await fetch('http://127.0.0.1:8002/test');
    const data = await response.json();
    console.log('✅ Express server test:', data);
  } catch (error) {
    console.log('❌ Express server test failed:', error.message);
  }
}, 2000);

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down test servers...');
  basicServer.close();
  expressServer.close();
  process.exit(0);
});
