const express = require('express');
const app = express();
const PORT = 8003;

console.log('🔧 Starting basic test server...');

app.use(express.json());

app.get('/', (req, res) => {
  console.log('Root endpoint hit');
  res.json({ message: 'Basic test server is working!', port: PORT });
});

app.get('/health', (req, res) => {
  console.log('Health endpoint hit');
  res.json({ status: 'OK', message: 'Test server healthy' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
  console.log(`📊 Test health: http://localhost:${PORT}/health`);
  console.log('🔍 Server is ready for testing...');
});

process.on('SIGINT', () => {
  console.log('🛑 Test server shutting down');
  process.exit(0);
});
