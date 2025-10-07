const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
          isActive: true
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

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (dbConnected && prisma) {
      // Try to authenticate with database
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              isActive: true
            }
          }
        }
      });

      if (user && await bcrypt.compare(password, user.password)) {
        // Generate JWT token
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '24h' }
        );

        res.json({
          data: {
            accessToken: token,
            user: {
              id: user.id,
              email: user.email,
              member: user.member
            }
          }
        });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } else {
      // Fallback authentication for demo purposes
      if (email === 'david.johnson@faithlink360.org' && password === 'password123') {
        const token = jwt.sign(
          { userId: '1', email: email },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '24h' }
        );

        res.json({
          data: {
            accessToken: token,
            user: {
              id: '1',
              email: email,
              member: {
                id: '1',
                firstName: 'David',
                lastName: 'Johnson',
                email: email,
                isActive: true
              }
            }
          }
        });
      } else if (email === 'admin@faithlink360.org' && password === 'admin123') {
        const token = jwt.sign(
          { userId: '2', email: email },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '24h' }
        );

        res.json({
          data: {
            accessToken: token,
            user: {
              id: '2',
              email: email,
              member: {
                id: '2',
                firstName: 'Admin',
                lastName: 'User',
                email: email,
                isActive: true
              }
            }
          }
        });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');

    if (dbConnected && prisma) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              isActive: true
            }
          }
        }
      });

      if (user) {
        res.json({
          data: {
            user: {
              id: user.id,
              email: user.email,
              member: user.member
            }
          }
        });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } else {
      // Fallback user data
      res.json({
        data: {
          user: {
            id: decoded.userId,
            email: decoded.email,
            member: {
              id: decoded.userId,
              firstName: decoded.email === 'david.johnson@faithlink360.org' ? 'David' : 'Admin',
              lastName: decoded.email === 'david.johnson@faithlink360.org' ? 'Johnson' : 'User',
              email: decoded.email,
              isActive: true
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

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
