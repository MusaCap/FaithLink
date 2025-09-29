const express = require('express');
const app = express();
const PORT = 8000;

// Minimal middleware
app.use(express.json());

// Basic endpoints
app.get('/health', (req, res) => {
  console.log('Health endpoint hit');
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Minimal server running'
  });
});

app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({
    message: 'Test successful',
    timestamp: new Date().toISOString()
  });
});

// Start server WITHOUT signal handlers to isolate the issue
console.log('🚀 Starting minimal server...');
const server = app.listen(PORT, () => {
  console.log(`✅ Minimal server running on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
  console.log('🔄 Server is ready for connections');
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

console.log('🎯 Minimal server initialization complete');
