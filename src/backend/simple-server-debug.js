const express = require('express');
const app = express();
const PORT = 8000;

console.log('🔧 Starting simple debug server...');

app.use(express.json());

app.get('/health', (req, res) => {
  console.log('Health endpoint called');
  res.json({ status: 'OK', message: 'Simple server running' });
});

app.get('/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ message: 'Test successful' });
});

console.log('🚀 About to start listening...');
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🧪 Test: http://localhost:${PORT}/test`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

console.log('🎯 Server setup complete, should be listening now');

// Keep process alive
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

setTimeout(() => {
  console.log('🕐 Server has been running for 5 seconds');
}, 5000);
