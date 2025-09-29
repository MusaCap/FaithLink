// Quick test script to verify server status and run integration tests
const http = require('http');
const { spawn } = require('child_process');

console.log('🔍 Quick Server Test and Integration Runner...');

// Test backend connectivity
const testBackend = () => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/health',
      method: 'GET',
      timeout: 3000
    };
              console.log('📄 Groups response received (non-JSON)');
            }
          }
          
          console.log('\n🎉 Integration test completed successfully!');
          console.log('🔗 Frontend can now connect to backend APIs');
        });
      });
      
      groupsReq.on('error', (err) => console.log('❌ Groups API error:', err.message));
      groupsReq.end();
      
    } else {
      console.log('❌ Backend not responding correctly');
    }
  });
});

req.on('error', (err) => {
  console.log('❌ Connection failed:', err.message);
  console.log('💡 Make sure backend server is running on port 5000');
});

req.setTimeout(3000);
req.end();
