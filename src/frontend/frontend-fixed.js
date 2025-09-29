const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // Bind to all interfaces
const port = 3000;

console.log('🔧 Starting FaithLink360 Frontend with Enhanced Logging...');
console.log(`📡 Target: http://localhost:${port}`);
console.log(`🌐 Binding to: ${hostname}:${port}`);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  console.log('✅ Next.js application prepared');
  
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('❌ Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  })
  .once('error', (err) => {
    console.error('❌ ========================================');
    console.error('❌ Frontend Server Failed to Start!');
    console.error('❌ ========================================');
    console.error('❌ Error:', err.message);
    
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use`);
      console.error('💡 Try: netstat -ano | findstr ":3000"');
      console.error('💡 Then: taskkill /PID <PID> /F');
    } else if (err.code === 'EACCES') {
      console.error(`❌ Permission denied for port ${port}`);
      console.error('💡 Try running as administrator');
    }
    
    console.error('❌ ========================================');
    process.exit(1);
  })
  .listen(port, hostname, () => {
    console.log('✅ ========================================');
    console.log('✅ FaithLink360 Frontend Server Started!');
    console.log('✅ ========================================');
    console.log(`📡 Server URL: http://localhost:${port}`);
    console.log(`🌐 Binding: ${hostname}:${port}`);
    console.log(`📅 Started: ${new Date().toISOString()}`);
    console.log(`🔗 Backend API: http://localhost:8000`);
    console.log('✅ ========================================');
    
    // Self-test after 2 seconds
    setTimeout(async () => {
      try {
        console.log('🔍 Running frontend self-test...');
        const response = await fetch(`http://localhost:${port}`);
        if (response.ok) {
          console.log('✅ Frontend self-test passed');
        } else {
          console.log(`⚠️  Frontend self-test returned status: ${response.status}`);
        }
      } catch (error) {
        console.error('❌ Frontend self-test failed:', error.message);
      }
    }, 2000);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('🛑 Shutting down frontend server gracefully...');
    process.exit(0);
  });

}).catch((ex) => {
  console.error('❌ Failed to start Next.js application:', ex);
  process.exit(1);
});
