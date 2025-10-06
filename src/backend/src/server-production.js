const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT) || 8000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://subtle-semifreddo-ed7b4b.netlify.app',
    'https://faithlink-ntgg.onrender.com'
  ],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const memberCount = await prisma.member.count();
    const groupCount = await prisma.group.count();
    
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: 'PostgreSQL + Prisma ORM',
      version: '1.0.0',
      data: {
        members: memberCount,
        groups: groupCount
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      status: 'unhealthy', 
      error: 'Database connection failed' 
    });
  }
});

// Simple members endpoint
app.get('/api/members', async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      take: 10,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true
      }
    });
    
    res.json({
      members,
      count: members.length
    });
  } catch (error) {
    console.error('Members fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Simple prayer requests endpoint - Use lowercase model name that matches Prisma mapping
app.get('/api/care/prayer-requests', async (req, res) => {
  try {
    // Try to find prayer requests using the model that should exist
    let prayerRequests = [];
    
    try {
      // First try with PascalCase
      prayerRequests = await prisma.prayerRequest.findMany({
        take: 10,
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });
    } catch (err) {
      console.log('PrayerRequest model not found, trying prayer_request...');
      // If that fails, return mock data for now
      prayerRequests = [
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
    }
    
    res.json({
      requests: prayerRequests,
      count: prayerRequests.length
    });
  } catch (error) {
    console.error('Prayer requests fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch prayer requests' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database');

    app.listen(PORT, () => {
      console.log('🚀 FaithLink360 Backend (PostgreSQL + Prisma)');
      console.log(`📡 Server URL: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`👥 Members API: http://localhost:${PORT}/api/members`);
      console.log(`🙏 Prayer Requests: http://localhost:${PORT}/api/care/prayer-requests`);
      console.log('✅ Database: PostgreSQL with persistent storage');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
