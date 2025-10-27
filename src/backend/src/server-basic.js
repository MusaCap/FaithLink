const express = require('express');
const cors = require('cors');

// Initialize Express app first
const app = express();
const PORT = process.env.PORT || 8000;

console.log('🚀 Starting FaithLink360 Backend...');
console.log('📍 PORT:', PORT);
console.log('🔗 DATABASE_URL present:', !!process.env.DATABASE_URL);

// Basic middleware
app.use(cors({
  origin: '*', // Allow all origins for now
  credentials: true
}));
app.use(express.json());

// Initialize Prisma with error handling
let prisma = null;
let dbConnected = false;

async function initDatabase() {
  try {
    console.log('📦 Loading Prisma Client...');
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
    
    console.log('🔗 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    dbConnected = true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('🔄 Server will start without database connection');
    dbConnected = false;
  }
}

// Health check - works with or without database
app.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'PostgreSQL + Prisma ORM' : 'Disconnected',
      version: '1.0.0'
    };

    if (dbConnected && prisma) {
      try {
        const memberCount = await prisma.member.count();
        health.data = { members: memberCount };
      } catch (dbError) {
        console.log('Database query failed:', dbError.message);
        health.data = { members: 'unavailable' };
      }
    } else {
      health.data = { members: 'database_disconnected' };
    }

    res.json(health);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'unhealthy', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Basic API endpoints with fallbacks
app.get('/api/members', async (req, res) => {
  try {
    if (dbConnected && prisma) {
      const members = await prisma.member.findMany({
        take: 10,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isActive: true,
          deaconId: true,
          assignedDeacon: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });
      
      res.json({
        members,
        count: members.length,
        source: 'database'
      });
    } else {
      // Fallback data when database is unavailable
      const fallbackMembers = [
        {
          id: '1',
          firstName: 'David',
          lastName: 'Johnson',
          email: 'david.johnson@church.com',
          isActive: true
        },
        {
          id: '2',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@church.com',
          isActive: true
        }
      ];
      
      res.json({
        members: fallbackMembers,
        count: fallbackMembers.length,
        source: 'fallback'
      });
    }
  } catch (error) {
    console.error('Members endpoint error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch members',
      details: error.message 
    });
  }
});

// Prayer requests with fallback
app.get('/api/care/prayer-requests', async (req, res) => {
  try {
    // Always return fallback data for now to avoid model issues
    const fallbackRequests = [
      {
        id: '1',
        title: 'Health and Healing',
        description: 'Prayers for recovery and strength',
        status: 'active',
        member: {
          firstName: 'David',
          lastName: 'Johnson'
        }
      },
      {
        id: '2',
        title: 'Guidance and Wisdom', 
        description: 'Seeking direction in important decisions',
        status: 'active',
        member: {
          firstName: 'Admin',
          lastName: 'User'
        }
      }
    ];
    
    res.json({
      requests: fallbackRequests,
      count: fallbackRequests.length,
      source: 'fallback'
    });
  } catch (error) {
    console.error('Prayer requests error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch prayer requests',
      details: error.message 
    });
  }
});

// Simplified authentication endpoints (no bcrypt dependency for now)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', email);
    
    // Simple authentication without bcrypt for demo
    const validCredentials = [
      { email: 'david.johnson@faithlink360.org', password: 'password123', firstName: 'David', lastName: 'Johnson' },
      { email: 'admin@faithlink360.org', password: 'admin123', firstName: 'Admin', lastName: 'User' },
      { email: 'pastor@faithlink360.org', password: 'pastor123', firstName: 'Pastor', lastName: 'Smith' }
    ];
    
    const user = validCredentials.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Generate simple token (no JWT dependency for now)
      const token = `token_${user.email}_${Date.now()}`;
      
      res.json({
        data: {
          accessToken: token,
          user: {
            id: user.email === 'david.johnson@faithlink360.org' ? '1' : 
                user.email === 'admin@faithlink360.org' ? '2' : '3',
            email: user.email,
            member: {
              id: user.email === 'david.johnson@faithlink360.org' ? '1' : 
                  user.email === 'admin@faithlink360.org' ? '2' : '3',
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              isActive: true
            }
          }
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    // Simple token parsing (extract email from token)
    if (token.startsWith('token_')) {
      const parts = token.split('_');
      const email = parts[1];
      
      const userData = {
        'david.johnson@faithlink360.org': { id: '1', firstName: 'David', lastName: 'Johnson' },
        'admin@faithlink360.org': { id: '2', firstName: 'Admin', lastName: 'User' },
        'pastor@faithlink360.org': { id: '3', firstName: 'Pastor', lastName: 'Smith' }
      };
      
      const user = userData[email];
      if (user) {
        res.json({
          data: {
            user: {
              id: user.id,
              email: email,
              member: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: email,
                isActive: true
              }
            }
          }
        });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } else {
      res.status(401).json({ message: 'Invalid token format' });
    }
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Volunteer Management Routes
if (dbConnected) {
  try {
    const volunteerRoutes = require('./routes/volunteers');
    const volunteerOpportunityRoutes = require('./routes/volunteer-opportunities');
    
    app.use('/api/volunteers', volunteerRoutes);
    app.use('/api/volunteer-opportunities', volunteerOpportunityRoutes);
    
    console.log('✅ Volunteer routes loaded successfully');
  } catch (error) {
    console.log('⚠️ Volunteer routes not available:', error.message);
  }
}

// Deacon Management Routes
if (dbConnected) {
  try {
    const deaconRoutes = require('./routes/deacons');
    app.use('/api/deacons', deaconRoutes);
    console.log('✅ Deacon routes loaded successfully');
  } catch (error) {
    console.log('⚠️ Deacon routes not available:', error.message);
  }
}

// Basic info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'FaithLink360 Backend',
    version: '1.0.0',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
async function startServer() {
  try {
    // Initialize database connection (optional)
    await initDatabase();
    
    // Start server regardless of database status
    app.listen(PORT, '0.0.0.0', () => {
      console.log('🚀 FaithLink360 Backend Started!');
      console.log(`📡 Server URL: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`📊 Info: http://localhost:${PORT}/api/info`);
      console.log(`👥 Members: http://localhost:${PORT}/api/members`);
      console.log(`🙏 Prayer Requests: http://localhost:${PORT}/api/care/prayer-requests`);
      console.log(`🗄️ Database: ${dbConnected ? 'Connected' : 'Fallback Mode'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');
  if (prisma) {
    await prisma.$disconnect();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down...');
  if (prisma) {
    await prisma.$disconnect();
  }
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();
