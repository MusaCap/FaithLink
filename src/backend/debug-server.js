const express = require('express');
const app = express();
const PORT = 8000;

// Basic middleware
app.use(express.json());

// Simple health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Debug server running'
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'Debug server test endpoint',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🔧 Debug server running on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🧪 Test: http://localhost:${PORT}/test`);
});

// Handle shutdown signals
process.on('SIGINT', () => {
  console.log('🛑 Debug server received SIGINT');
  server.close(() => {
    console.log('🔄 Debug server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('🛑 Debug server received SIGTERM');
  server.close(() => {
    console.log('🔄 Debug server closed');
    process.exit(0);
  });
});

// Handle server errors
server.on('error', (error) => {
  console.error('🚨 Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    process.exit(1);
  }
});

console.log('✅ Debug server initialized, waiting for connections...');
