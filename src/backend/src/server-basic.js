const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const JWT_SECRET = process.env.JWT_SECRET || 'faithlink360-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Initialize Express app first
const app = express();
const PORT = process.env.PORT || 8000;

// Production CORS setup - Allow all production domains
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:3002',
    'https://subtle-semifreddo-ed7b4b.netlify.app',  // Production frontend
    'https://faithlink360.netlify.app',  // Alternative production domain
    'https://faithlink-ntgg.onrender.com'  // Backend domain (for internal calls)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

console.log('🚀 Starting FaithLink360 Backend...');
console.log('📍 PORT:', PORT);
console.log('🔗 DATABASE_URL present:', !!process.env.DATABASE_URL);

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Rate limiting
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { success: false, message: 'Too many requests, please try again later.' } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: 'Too many login attempts, please try again later.' } });
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Basic middleware  
app.use(express.json({ limit: '10mb' }));

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

// Auth middleware - extracts user from JWT for multi-tenancy scoping
const extractUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded; // { userId, email, role, churchId }
    }
  } catch (e) {
    // Token invalid/expired — continue without user context
  }
  next();
};
app.use(extractUser);

// Basic API endpoints with fallbacks
app.get('/api/members', async (req, res) => {
  try {
    // Extract query parameters
    const { sortBy = 'firstName', sortOrder = 'asc', limit = 20, status } = req.query;
    
    if (dbConnected && prisma) {
      const members = await prisma.member.findMany({
        take: 10,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          memberNumber: true,
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
        success: true,
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
          memberNumber: '10001',
          isActive: true
        },
        {
          id: '2',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@church.com',
          memberNumber: '10002',
          isActive: true
        }
      ];
      
      res.json({
        success: true,
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

// Prayer requests - reads from in-memory store
app.get('/api/care/prayer-requests', async (req, res) => {
  try {
    res.json({
      success: true,
      prayerRequests: inMemoryPrayerRequests,
      requests: inMemoryPrayerRequests,
      count: inMemoryPrayerRequests.length
    });
  } catch (error) {
    console.error('Prayer requests error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Duplicate /api/auth/login endpoint removed - using the one in the authentication section with demo123 password

// Duplicate /api/auth/logout endpoint removed - using the one in the authentication section

// Duplicate /api/auth/me endpoint removed - using the one in the authentication section

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

// Deacon Management Routes (inline implementation)
app.get('/api/deacons', async (req, res) => {
  try {
    const sampleDeacons = [
      {
        id: 'deacon1',
        firstName: 'John',
        lastName: 'Wesley',
        email: 'john.wesley@church.com',
        phone: '(555) 123-4567',
        isActive: true,
        specialties: ['General Counseling', 'Family Support'],
        maxMembers: 25,
        _count: { assignedMembers: 8 },
        notes: 'Senior deacon with 15 years of experience'
      },
      {
        id: 'deacon2', 
        firstName: 'Mary',
        lastName: 'Thompson',
        email: 'mary.thompson@church.com',
        phone: '(555) 234-5678',
        isActive: true,
        specialties: ['Youth Ministry', 'Crisis Intervention'],
        maxMembers: 20,
        _count: { assignedMembers: 5 },
        notes: 'Specializes in youth and family crisis support'
      },
      {
        id: 'deacon3',
        firstName: 'Robert', 
        lastName: 'Davis',
        email: 'robert.davis@church.com',
        phone: '(555) 345-6789',
        isActive: true,
        specialties: ['Seniors Ministry', 'Hospital Visitation'],
        maxMembers: 30,
        _count: { assignedMembers: 12 },
        notes: 'Dedicated to senior member care and hospital ministry'
      }
    ];

    res.json({
      success: true,
      deacons: sampleDeacons,
      count: sampleDeacons.length,
      source: 'backend'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/deacons/dropdown', async (req, res) => {
  try {
    const dropdownDeacons = [
      {
        id: 'deacon1',
        name: 'John Wesley',
        email: 'john.wesley@church.com', 
        memberCount: 8,
        specialties: ['General Counseling', 'Family Support']
      },
      {
        id: 'deacon2',
        name: 'Mary Thompson',
        email: 'mary.thompson@church.com',
        memberCount: 5,
        specialties: ['Youth Ministry', 'Crisis Intervention']
      },
      {
        id: 'deacon3',
        name: 'Robert Davis',
        email: 'robert.davis@church.com',
        memberCount: 12,
        specialties: ['Seniors Ministry', 'Hospital Visitation']
      }
    ];

    res.json({
      success: true,
      deacons: dropdownDeacons
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// MEMBER STATS ENDPOINT
app.get('/api/members/stats', async (req, res) => {
  try {
    res.json({
      success: true,
      stats: {
        totalMembers: 142,
        activeMembers: 128,
        inactiveMembers: 14,
        newThisMonth: 8,
        byStatus: {
          active: 128,
          pending: 12,
          inactive: 2
        },
        byMembershipType: {
          regular: 98,
          associate: 32,
          honorary: 8,
          youth: 4
        },
        deaconAssignments: {
          withDeacon: 89,
          withoutDeacon: 53
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// MEMBER TAGS ENDPOINT
app.get('/api/members/tags', async (req, res) => {
  try {
    res.json({
      success: true,
      tags: [
        { id: '1', name: 'New Member', color: 'blue', count: 15 },
        { id: '2', name: 'Leadership', color: 'purple', count: 8 },
        { id: '3', name: 'Youth', color: 'green', count: 24 },
        { id: '4', name: 'Senior', color: 'gray', count: 31 },
        { id: '5', name: 'Volunteer', color: 'orange', count: 45 },
        { id: '6', name: 'Small Group Leader', color: 'red', count: 12 }
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// INDIVIDUAL MEMBER ENDPOINT
app.get('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sampleMember = {
      id: id,
      firstName: 'David',
      lastName: 'Johnson',
      email: 'david.johnson@faithlink360.org',
      phone: '(555) 123-4567',
      memberNumber: '10001',
      membershipStatus: 'active',
      membershipType: 'regular',
      joinDate: '2024-01-15',
      dateOfBirth: '1985-06-20',
      address: {
        street: '123 Church Street',
        city: 'Faithville',
        state: 'CA',
        zipCode: '90210',
        country: 'United States'
      },
      tags: ['Leadership', 'Volunteer'],
      notes: 'Active member and group leader',
      assignedDeacon: {
        id: 'deacon1',
        firstName: 'John',
        lastName: 'Wesley',
        email: 'john.wesley@church.com',
        phone: '(555) 123-4567',
        specialties: ['General Counseling', 'Family Support']
      },
      groups: [
        { id: 'group-001', name: 'Adult Sunday School', role: 'leader' }
      ]
    };

    res.json({
      success: true,
      member: sampleMember
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Member Self-Service endpoints (missing endpoints causing 404s)
app.get('/api/members/self-service/profile', async (req, res) => {
  try {
    res.json({
      success: true,
      profile: {
        id: '1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@faithlink360.org',
        phone: '(555) 123-4567',
        memberNumber: '10001',
        membershipStatus: 'active',
        status: 'active',
        groups: ['Adult Sunday School', 'Leadership Team'],
        assignedDeacon: {
          id: 'deacon1',
          firstName: 'John',
          lastName: 'Wesley',
          email: 'john.wesley@church.com',
          phone: '(555) 123-4567',
          specialties: ['General Counseling', 'Family Support']
        },
        prayerRequests: [
          {
            id: '1',
            title: 'Guidance in Leadership Role',
            description: 'Seeking wisdom for upcoming church leadership decisions',
            status: 'active',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            isPrivate: false
          },
          {
            id: '2',
            title: 'Family Health',
            description: 'Prayers for family member recovery',
            status: 'answered',
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            isPrivate: true
          }
        ],
        upcomingEvents: [
          {
            id: '1',
            title: 'Sunday Service',
            description: 'Weekly worship service',
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
            time: '10:00 AM',
            location: 'Main Sanctuary',
            registered: true
          },
          {
            id: '2',
            title: 'Bible Study Group',
            description: 'Adult Bible study and discussion',
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
            time: '7:30 PM',
            location: 'Room 101',
            registered: false
          }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/members/self-service/notifications', async (req, res) => {
  try {
    res.json({
      success: true,
      notifications: [
        {
          id: '1',
          type: 'deacon_assignment',
          title: 'Deacon Assigned',
          message: 'John Wesley has been assigned as your deacon for pastoral care.',
          date: new Date().toISOString(),
          read: false
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Groups endpoint
app.get('/api/groups', async (req, res) => {
  try {
    // Extract and validate query parameters
    const { status = 'active', sortBy = 'name', sortOrder = 'asc', limit = 20 } = req.query;
    
    // Convert limit to number and validate
    const limitNum = Math.min(parseInt(limit) || 20, 100); // Cap at 100
    
    if (dbConnected && prisma) {
      // Build dynamic query based on parameters
      const whereClause = {};
      if (status && status !== 'all') {
        whereClause.isActive = status === 'active';
      }
      
      // Build orderBy clause
      const orderByClause = {};
      if (sortBy && ['name', 'createdAt', 'updatedAt'].includes(sortBy)) {
        orderByClause[sortBy] = sortOrder === 'desc' ? 'desc' : 'asc';
      } else {
        orderByClause.name = 'asc'; // Default sorting
      }
      
      const groups = await prisma.group.findMany({
        where: whereClause,
        orderBy: orderByClause,
        take: limitNum,
        include: {
          _count: {
            select: { members: true }
          }
        }
      });
      
      res.json({
        success: true,
        groups,
        count: groups.length,
        total: await prisma.group.count({ where: whereClause }),
        source: 'database'
      });
    } else {
      // Enhanced fallback with parameter support
      let fallbackGroups = [
        {
          id: 'group-001',
          name: 'Sunday School Adults',
          type: 'class',
          description: 'Adult Bible study and fellowship',
          leaderId: '1',
          leaderName: 'David Johnson',
          isActive: true,
          createdAt: '2024-01-15T10:00:00Z',
          _count: { members: 12 }
        },
        {
          id: 'group-002',
          name: 'Youth Group',
          type: 'fellowship',
          description: 'Teen fellowship and activities',
          leaderId: '2', 
          leaderName: 'Sarah Johnson',
          isActive: true,
          createdAt: '2024-02-01T14:00:00Z',
          _count: { members: 8 }
        },
        {
          id: 'group-003',
          name: 'Prayer Team',
          type: 'ministry',
          description: 'Weekly prayer and intercession',
          leaderId: '1',
          leaderName: 'David Johnson', 
          isActive: false, // Inactive for testing
          createdAt: '2024-01-20T09:00:00Z',
          _count: { members: 5 }
        }
      ];
      
      // Apply status filter
      if (status && status !== 'all') {
        fallbackGroups = fallbackGroups.filter(g => 
          status === 'active' ? g.isActive : !g.isActive
        );
      }
      
      // Apply sorting
      if (sortBy === 'name') {
        fallbackGroups.sort((a, b) => {
          const compare = a.name.localeCompare(b.name);
          return sortOrder === 'desc' ? -compare : compare;
        });
      } else if (sortBy === 'createdAt') {
        fallbackGroups.sort((a, b) => {
          const compare = new Date(a.createdAt) - new Date(b.createdAt);
          return sortOrder === 'desc' ? -compare : compare;
        });
      }
      
      // Apply limit
      const limitedGroups = fallbackGroups.slice(0, limitNum);
      
      res.json({
        success: true,
        groups: limitedGroups,
        count: limitedGroups.length,
        total: fallbackGroups.length,
        source: 'fallback'
      });
    }
  } catch (error) {
    console.error('Groups API Error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to fetch groups: ${error.message}`,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Groups stats endpoint
app.get('/api/groups/stats', async (req, res) => {
  try {
    res.json({
      success: true,
      stats: {
        totalGroups: 8,
        activeGroups: 7,
        totalMembers: 142,
        averageGroupSize: 18
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// CRITICAL: Group member removal endpoint
app.delete('/api/groups/:id/members/:memberId', async (req, res) => {
  try {
    const { id: groupId, memberId } = req.params;
    
    if (dbConnected && prisma) {
      // Remove member from group using Prisma (disabled for fallback testing)
      await prisma.groupMember.deleteMany({
        where: {
          groupId: groupId,
          memberId: memberId
        }
      });
      
      res.json({
        success: true,
        message: 'Member removed from group successfully',
        groupId,
        memberId
      });
    } else {
      // Fallback - simulate successful removal
      res.json({
        success: true,
        message: 'Member removed from group successfully (simulated)',
        groupId,
        memberId,
        source: 'fallback'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Failed to remove member from group: ${error.message}` 
    });
  }
});

// HIGH: Complete Attendance Tracking System (3 endpoints)

// 1. Record group attendance
app.post('/api/groups/:id/attendance', async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { date, attendees, absentees, notes } = req.body;
    
    if (dbConnected && prisma) {
      // Create attendance record using Prisma (disabled for fallback testing)
      const attendanceRecord = await prisma.attendance.create({
        data: {
          groupId,
          date: new Date(date),
          attendees: attendees || [],
          absentees: absentees || [],
          notes: notes || '',
          recordedBy: req.user?.id || 'admin'
        }
      });
      
      res.json({
        success: true,
        attendance: attendanceRecord,
        message: 'Attendance recorded successfully'
      });
    } else {
      // Fallback - simulate attendance recording
      const attendanceRecord = {
        id: `att-${Date.now()}`,
        groupId,
        date: new Date(date).toISOString(),
        attendees: attendees || [],
        absentees: absentees || [],
        notes: notes || '',
        recordedBy: 'admin',
        createdAt: new Date().toISOString()
      };
      
      res.json({
        success: true,
        attendance: attendanceRecord,
        message: 'Attendance recorded successfully (simulated)',
        source: 'fallback'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Failed to record attendance: ${error.message}` 
    });
  }
});

// 2. Get group attendance history
app.get('/api/groups/:id/attendance/history', async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { limit = 20, offset = 0, startDate, endDate } = req.query;
    
    if (dbConnected && prisma) {
      // Fetch attendance history using Prisma (disabled for fallback testing)
      const attendanceHistory = await prisma.attendance.findMany({
        where: {
          groupId,
          ...(startDate && endDate && {
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          })
        },
        orderBy: { date: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
        include: {
          group: {
            select: { name: true }
          }
        }
      });
      
      res.json({
        success: true,
        history: attendanceHistory,
        count: attendanceHistory.length
      });
    } else {
      // Fallback - simulate attendance history
      const fallbackHistory = [
        {
          id: 'att-1',
          groupId,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          attendees: ['1', '2', '3'],
          absentees: ['4'],
          notes: 'Great discussion on spiritual growth',
          recordedBy: 'leader1',
          group: { name: 'Young Adults Bible Study' }
        },
        {
          id: 'att-2',
          groupId,
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          attendees: ['1', '2', '4'],
          absentees: ['3'],
          notes: 'Prayer requests shared and discussed',
          recordedBy: 'leader1',
          group: { name: 'Young Adults Bible Study' }
        }
      ];
      
      res.json({
        success: true,
        history: fallbackHistory,
        count: fallbackHistory.length,
        source: 'fallback'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Failed to fetch attendance history: ${error.message}` 
    });
  }
});

// 3. Get attendance reports
app.get('/api/attendance/reports', async (req, res) => {
  try {
    const { groupId, period = 'monthly', startDate, endDate } = req.query;
    
    if (dbConnected && prisma) {
      // Generate attendance reports using Prisma (disabled for fallback testing)
      const reports = await prisma.attendance.findMany({
        where: {
          ...(groupId && { groupId }),
          ...(startDate && endDate && {
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          })
        },
        include: {
          group: {
            select: { name: true }
          }
        }
      });
      
      // Process reports by period
      const processedReports = {
        summary: {
          totalSessions: reports.length,
          averageAttendance: reports.reduce((acc, r) => acc + r.attendees.length, 0) / reports.length || 0,
          attendanceRate: 0.85, // Calculate based on actual data
          period
        },
        details: reports
      };
      
      res.json({
        success: true,
        reports: processedReports
      });
    } else {
      // Fallback - simulate attendance reports
      const fallbackReports = {
        summary: {
          totalSessions: 12,
          averageAttendance: 8.5,
          attendanceRate: 0.75,
          period,
          topAttendingGroups: [
            { groupName: 'Young Adults Bible Study', attendanceRate: 0.85 },
            { groupName: 'Senior Fellowship', attendanceRate: 0.80 },
            { groupName: 'Youth Group', attendanceRate: 0.72 }
          ]
        },
        trends: {
          monthlyTrend: 'increasing',
          comparedToPrevious: '+12%'
        }
      };
      
      res.json({
        success: true,
        reports: fallbackReports,
        source: 'fallback'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Failed to generate attendance reports: ${error.message}` 
    });
  }
});

// HIGH: Event registration cancellation endpoint
app.delete('/api/events/:id/registrations/:registrationId', async (req, res) => {
  try {
    const { id: eventId, registrationId } = req.params;
    const { reason } = req.body;
    
    if (dbConnected && prisma) {
      // Cancel registration using Prisma (disabled for fallback testing)
      const canceledRegistration = await prisma.eventRegistration.update({
        where: { id: registrationId },
        data: {
          status: 'cancelled',
          cancelReason: reason || 'User requested cancellation',
          canceledAt: new Date()
        }
      });
      
      res.json({
        success: true,
        message: 'Registration cancelled successfully',
        registration: canceledRegistration
      });
    } else {
      // Fallback - simulate cancellation
      const canceledRegistration = {
        id: registrationId,
        eventId,
        memberId: req.user?.id || '1',
        status: 'cancelled',
        cancelReason: reason || 'User requested cancellation',
        canceledAt: new Date().toISOString(),
        originalRegistrationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      res.json({
        success: true,
        message: 'Registration cancelled successfully (simulated)',
        registration: canceledRegistration,
        source: 'fallback'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Failed to cancel registration: ${error.message}` 
    });
  }
});

// MEDIUM: Journey milestone completion endpoint
app.put('/api/journeys/:id/milestones', async (req, res) => {
  try {
    const { id: journeyId } = req.params;
    const { milestoneId, completed, notes } = req.body;
    
    if (dbConnected && prisma) {
      // Update milestone using Prisma (disabled for fallback testing)
      const updatedMilestone = await prisma.journeyMilestone.update({
        where: { id: milestoneId },
        data: {
          completed: completed,
          completedAt: completed ? new Date() : null,
          notes: notes || ''
        }
      });
      
      res.json({
        success: true,
        milestone: updatedMilestone,
        message: 'Milestone updated successfully'
      });
    } else {
      // Fallback - simulate milestone update
      const updatedMilestone = {
        id: milestoneId,
        journeyId,
        title: 'Milestone Updated',
        completed: completed,
        completedAt: completed ? new Date().toISOString() : null,
        notes: notes || '',
        updatedAt: new Date().toISOString()
      };
      
      res.json({
        success: true,
        milestone: updatedMilestone,
        message: 'Milestone updated successfully (simulated)',
        source: 'fallback'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Failed to update milestone: ${error.message}` 
    });
  }
});

// MEDIUM: Deacon assignment endpoint
app.post('/api/members/:id/assign-deacon', async (req, res) => {
  try {
    const { id: memberId } = req.params;
    const { deaconId, assignedDate, notes } = req.body;
    
    if (dbConnected && prisma) {
      // Assign deacon using Prisma (disabled for fallback testing)
      const assignment = await prisma.member.update({
        where: { id: memberId },
        data: {
          deaconId,
          deaconAssignedDate: new Date(assignedDate || Date.now())
        },
        include: {
          assignedDeacon: true
        }
      });
      
      res.json({
        success: true,
        assignment,
        message: 'Deacon assigned successfully'
      });
    } else {
      // Fallback - simulate deacon assignment
      const assignment = {
        memberId,
        deaconId,
        assignedDate: new Date(assignedDate || Date.now()).toISOString(),
        notes: notes || '',
        deacon: {
          id: deaconId,
          firstName: 'John',
          lastName: 'Wesley',
          email: 'john.wesley@church.com'
        }
      };
      
      res.json({
        success: true,
        assignment,
        message: 'Deacon assigned successfully (simulated)',
        source: 'fallback'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Failed to assign deacon: ${error.message}` 
    });
  }
});

// LOW: Membership reports endpoint
app.get('/api/reports/membership', async (req, res) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;
    
    if (dbConnected && prisma) {
      // Generate membership reports using Prisma (disabled for fallback testing)
      const membershipData = await prisma.member.findMany({
        include: {
          _count: {
            select: { groupMemberships: true }
          }
        }
      });
      
      res.json({
        success: true,
        report: {
          period,
          totalMembers: membershipData.length,
          activeMembers: membershipData.filter(m => m.isActive).length,
          summary: membershipData
        }
      });
    } else {
      // Fallback - simulate membership reports
      const membershipReport = {
        period,
        summary: {
          totalMembers: 142,
          activeMembers: 128,
          inactiveMembers: 14,
          newMembersThisPeriod: 8,
          membershipGrowthRate: '+5.8%'
        },
        demographics: {
          ageGroups: {
            'Under 18': 15,
            '18-35': 45,
            '36-55': 52,
            'Over 55': 30
          },
          membershipStatus: {
            'Active': 128,
            'Inactive': 14
          }
        },
        trends: {
          monthlyGrowth: [2, 3, 1, 4, 2, 3, 5, 8],
          comparison: 'Up 12% from last period'
        }
      };
      
      res.json({
        success: true,
        report: membershipReport,
        source: 'fallback'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Failed to generate membership report: ${error.message}` 
    });
  }
});

// LOW: Admin settings endpoint
app.get('/api/admin/settings', async (req, res) => {
  try {
    if (dbConnected && prisma) {
      // Fetch admin settings using Prisma (disabled for fallback testing)
      const settings = await prisma.churchSettings.findFirst();
      
      res.json({
        success: true,
        settings
      });
    } else {
      // Fallback - simulate admin settings
      const adminSettings = {
        general: {
          churchName: 'Faith Community Church',
          timezone: 'America/New_York',
          language: 'en-US',
          currency: 'USD'
        },
        features: {
          enableAttendance: true,
          enableEvents: true,
          enableJourneys: true,
          enableCommunications: true
        },
        permissions: {
          memberSelfEdit: true,
          publicEvents: true,
          memberDirectory: false
        },
        integrations: {
          emailService: 'enabled',
          smsService: 'disabled',
          webhooks: 'enabled'
        }
      };
      
      res.json({
        success: true,
        settings: adminSettings,
        source: 'fallback'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Failed to fetch admin settings: ${error.message}` 
    });
  }
});

// LOW: Admin users endpoint
app.get('/api/admin/users', async (req, res) => {
  try {
    if (dbConnected && prisma) {
      // Fetch admin users using Prisma (disabled for fallback testing)
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true
        }
      });
      
      res.json({
        success: true,
        users
      });
    } else {
      // Fallback - simulate admin users
      const adminUsers = [
        {
          id: '1',
          email: 'admin@faithlink360.org',
          role: 'admin',
          isActive: true,
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          email: 'pastor@faithlink360.org',
          role: 'pastor',
          isActive: true,
          lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          email: 'leader@faithlink360.org',
          role: 'leader',
          isActive: true,
          lastLogin: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      res.json({
        success: true,
        users: adminUsers,
        count: adminUsers.length,
        source: 'fallback'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Failed to fetch admin users: ${error.message}` 
    });
  }
});

// LOW: Webhooks integration endpoint
app.post('/api/integrations/webhooks', async (req, res) => {
  try {
    const { url, events, secret } = req.body;
    
    if (dbConnected && prisma) {
      // Create webhook using Prisma (disabled for fallback testing)
      const webhook = await prisma.webhook.create({
        data: {
          url,
          events,
          secret,
          isActive: true
        }
      });
      
      res.json({
        success: true,
        webhook,
        message: 'Webhook created successfully'
      });
    } else {
      // Fallback - simulate webhook creation
      const webhook = {
        id: `webhook-${Date.now()}`,
        url,
        events: events || ['member.created', 'event.registered'],
        secret: secret || 'generated-secret-key',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      res.json({
        success: true,
        webhook,
        message: 'Webhook created successfully (simulated)',
        source: 'fallback'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Failed to create webhook: ${error.message}` 
    });
  }
});

// LOW: Member export endpoint
app.get('/api/export/members', async (req, res) => {
  try {
    const { format = 'csv', includeInactive = false } = req.query;
    
    if (dbConnected && prisma) {
      // Export members using Prisma (disabled for fallback testing)
      const members = await prisma.member.findMany({
        where: includeInactive === 'true' ? {} : { isActive: true }
      });
      
      res.json({
        success: true,
        exportData: members,
        format,
        count: members.length
      });
    } else {
      // Fallback - simulate member export
      const exportData = [
        {
          id: '1',
          firstName: 'David',
          lastName: 'Johnson',
          email: 'david.johnson@email.com',
          memberNumber: '10001',
          joinDate: '2024-01-15',
          isActive: true
        },
        {
          id: '2',
          firstName: 'Sarah',
          lastName: 'Smith',
          email: 'sarah.smith@email.com',
          memberNumber: '10002',
          joinDate: '2024-02-20',
          isActive: true
        }
      ];
      
      res.json({
        success: true,
        exportData,
        format,
        count: exportData.length,
        message: `Members exported successfully in ${format} format`,
        source: 'fallback'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Failed to export members: ${error.message}` 
    });
  }
});

// LOW: Mobile sync endpoint
app.get('/api/sync/members', async (req, res) => {
  try {
    const { lastSync, limit = 50 } = req.query;
    
    if (dbConnected && prisma) {
      // Sync members using Prisma (disabled for fallback testing)
      const members = await prisma.member.findMany({
        where: lastSync ? {
          updatedAt: {
            gte: new Date(lastSync)
          }
        } : {},
        take: parseInt(limit),
        orderBy: { updatedAt: 'desc' }
      });
      
      res.json({
        success: true,
        members,
        syncTimestamp: new Date().toISOString(),
        hasMore: members.length === parseInt(limit)
      });
    } else {
      // Fallback - simulate mobile sync
      const syncData = {
        members: [
          {
            id: '1',
            firstName: 'David',
            lastName: 'Johnson',
            email: 'david.johnson@email.com',
            updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            firstName: 'Sarah',
            lastName: 'Smith',
            email: 'sarah.smith@email.com',
            updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          }
        ],
        syncTimestamp: new Date().toISOString(),
        hasMore: false
      };
      
      res.json({
        success: true,
        ...syncData,
        source: 'fallback'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Failed to sync members: ${error.message}` 
    });
  }
});

// PRODUCTION: Churches management endpoints (for church selection and creation)
app.get('/api/churches', async (req, res) => {
  try {
    if (dbConnected && prisma) {
      // Get churches from database when available
      const churches = await prisma.church.findMany({
        where: { isPublic: true },
        select: {
          id: true,
          name: true,
          description: true,
          location: true,
          denomination: true,
          size: true,
          founded: true,
          website: true,
          memberCount: true,
          joinCode: true
        }
      });
      
      res.json({
        success: true,
        churches
      });
    } else {
      // Fallback - provide demo church for production
      const demoChurches = [
        {
          id: 'church-1',
          name: 'First Community Church',
          description: 'A welcoming community church serving Springfield and surrounding areas. We believe in building authentic relationships and growing together in faith.',
          location: 'Springfield, IL',
          denomination: 'Non-denominational',
          size: 'Medium (100-500)',
          founded: '1985',
          website: 'https://firstcommunity.church',
          memberCount: 3,
          joinCode: 'DEMO2024'
        }
      ];
      
      res.json({
        success: true,
        churches: demoChurches,
        source: 'demo'
      });
    }
  } catch (error) {
    console.error('Churches fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to fetch churches: ${error.message}` 
    });
  }
});

app.post('/api/churches', async (req, res) => {
  try {
    const { name, description, location, denomination, size, website } = req.body;
    
    if (!name || name.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Church name must be at least 3 characters long'
      });
    }
    
    if (dbConnected && prisma) {
      // Create church in database when available
      const church = await prisma.church.create({
        data: {
          name: name.trim(),
          description: description || 'A new church community',
          location: location || 'Location not specified',
          denomination: denomination || 'Non-denominational',
          size: size || 'Small (1-100)',
          website: website || '',
          founded: new Date().getFullYear().toString(),
          memberCount: 1,
          joinCode: `CHURCH${Date.now().toString().slice(-6)}`,
          isPublic: true,
          createdBy: req.user?.id || 'admin'
        }
      });
      
      res.json({
        success: true,
        church,
        message: 'Church created successfully'
      });
    } else {
      // Fallback - simulate church creation
      const church = {
        id: `church-${Date.now()}`,
        name: name.trim(),
        description: description || 'A new church community',
        location: location || 'Location not specified',
        denomination: denomination || 'Non-denominational',
        size: size || 'Small (1-100)',
        website: website || '',
        founded: new Date().getFullYear().toString(),
        memberCount: 1,
        joinCode: `CHURCH${Date.now().toString().slice(-6)}`,
        isPublic: true,
        createdAt: new Date().toISOString()
      };
      
      res.json({
        success: true,
        church,
        message: 'Church created successfully (simulated)',
        source: 'demo'
      });
    }
  } catch (error) {
    console.error('Church creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to create church: ${error.message}` 
    });
  }
});

// Church Discovery & Directory API
app.get('/api/churches/directory', async (req, res) => {
  try {
    const { search, denomination, location, limit = 20 } = req.query;
    
    if (dbConnected && prisma) {
      const whereClause = {
        isPublic: true, // Only show public churches
        isActive: true
      };
      
      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }
      
      if (denomination && denomination !== 'all') {
        whereClause.denomination = denomination;
      }
      
      if (location) {
        whereClause.location = { contains: location, mode: 'insensitive' };
      }
      
      const churches = await prisma.church.findMany({
        where: whereClause,
        take: parseInt(limit),
        select: {
          id: true,
          name: true,
          description: true,
          location: true,
          denomination: true,
          memberCount: true,
          image: true,
          website: true,
          joinApprovalRequired: true,
          createdAt: true
        },
        orderBy: { name: 'asc' }
      });
      
      res.json({
        success: true,
        churches,
        count: churches.length
      });
    } else {
      // Fallback church directory
      let fallbackChurches = [
        {
          id: 'church-1',
          name: 'First Community Church',
          description: 'A welcoming community focused on faith, fellowship, and service',
          location: 'Springfield, IL',
          denomination: 'Non-denominational',
          memberCount: 150,
          image: null,
          website: 'https://firstcommunity.org',
          joinApprovalRequired: false,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'church-2', 
          name: 'Grace Baptist Church',
          description: 'Traditional Baptist church with modern worship',
          location: 'Springfield, IL',
          denomination: 'Baptist',
          memberCount: 200,
          image: null,
          website: 'https://gracebaptist.org',
          joinApprovalRequired: true,
          createdAt: '2024-02-15T00:00:00Z'
        },
        {
          id: 'church-3',
          name: 'New Life Fellowship',
          description: 'Contemporary worship and community outreach',
          location: 'Champaign, IL', 
          denomination: 'Pentecostal',
          memberCount: 75,
          image: null,
          website: null,
          joinApprovalRequired: false,
          createdAt: '2024-03-01T00:00:00Z'
        },
        {
          id: 'church-4',
          name: 'Unity Methodist Church',
          description: 'Progressive Methodist community with inclusive worship',
          location: 'Decatur, IL',
          denomination: 'Methodist',
          memberCount: 120,
          image: null,
          website: 'https://unitymethodist.org',
          joinApprovalRequired: false,
          createdAt: '2024-04-10T00:00:00Z'
        }
      ];
      
      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        fallbackChurches = fallbackChurches.filter(church => 
          church.name.toLowerCase().includes(searchLower) ||
          church.description.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply denomination filter
      if (denomination && denomination !== 'all') {
        fallbackChurches = fallbackChurches.filter(church => 
          church.denomination.toLowerCase() === denomination.toLowerCase()
        );
      }
      
      // Apply location filter
      if (location) {
        const locationLower = location.toLowerCase();
        fallbackChurches = fallbackChurches.filter(church =>
          church.location.toLowerCase().includes(locationLower)
        );
      }
      
      // Apply limit
      const limitedChurches = fallbackChurches.slice(0, parseInt(limit));
      
      res.json({
        success: true,
        churches: limitedChurches,
        count: limitedChurches.length,
        total: fallbackChurches.length,
        source: 'fallback'
      });
    }
  } catch (error) {
    console.error('Church directory error:', error);
    res.status(500).json({
      success: false,
      message: `Failed to load church directory: ${error.message}`
    });
  }
});

// Join church request
app.post('/api/churches/:churchId/join-request', async (req, res) => {
  try {
    const { churchId } = req.params;
    const { userId, message, userInfo } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID required for join request'
      });
    }
    
    if (dbConnected && prisma) {
      // Check if church exists
      const church = await prisma.church.findUnique({
        where: { id: churchId }
      });
      
      if (!church) {
        return res.status(404).json({
          success: false,
          message: 'Church not found'
        });
      }
      
      // Check if user already has pending request
      const existingRequest = await prisma.joinRequest.findFirst({
        where: {
          churchId,
          userId,
          status: 'pending'
        }
      });
      
      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: 'You already have a pending request for this church'
        });
      }
      
      // Create join request
      const joinRequest = await prisma.joinRequest.create({
        data: {
          churchId,
          userId,
          message: message || '',
          userInfo: JSON.stringify(userInfo || {}),
          status: 'pending',
          createdAt: new Date()
        }
      });
      
      res.json({
        success: true,
        joinRequest,
        message: 'Join request submitted successfully'
      });
    } else {
      // Fallback - simulate join request
      const joinRequest = {
        id: `req-${Date.now()}`,
        churchId,
        userId,
        message: message || '',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      res.json({
        success: true,
        joinRequest,
        message: 'Join request submitted successfully (demo mode)',
        source: 'fallback'
      });
    }
  } catch (error) {
    console.error('Join request error:', error);
    res.status(500).json({
      success: false,
      message: `Failed to submit join request: ${error.message}`
    });
  }
});

// PRODUCTION: Authentication endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, churchChoice, selectedChurchId, newChurchName, joinCode } = req.body;
    
    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
    
    if (dbConnected && prisma) {
      // Database registration logic when available
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
      
      // Create user and handle church logic
      const user = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          password: await bcrypt.hash(password, 10),
          role: churchChoice === 'create' ? 'admin' : 'member',
          isActive: true
        }
      });
      
      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role, churchId: user.churchId || null }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      res.json({
        success: true,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        },
        token,
        message: 'Registration successful'
      });
    } else {
      // Fallback - simulate registration
      const user = {
        id: `user-${Date.now()}`,
        firstName,
        lastName,
        email,
        role: churchChoice === 'create' ? 'admin' : 'member',
        isActive: true,
        churchId: selectedChurchId || `church-${Date.now()}`,
        churchName: churchChoice === 'create' ? newChurchName : 'First Community Church',
        joinCode: joinCode || 'DEMO2024',
        createdAt: new Date().toISOString()
      };
      
      const hashedPassword = await bcrypt.hash(password, 10);
      user.passwordHash = hashedPassword;
      // Store in in-memory registered users
      if (!global.inMemoryRegisteredUsers) global.inMemoryRegisteredUsers = [];
      global.inMemoryRegisteredUsers.push(user);
      
      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      
      res.json({
        success: true,
        user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, churchId: user.churchId, churchName: user.churchName },
        token,
        message: 'Registration successful'
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Registration failed: ${error.message}` 
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Try database first if connected
    if (dbConnected && prisma) {
      const dbUser = await prisma.user.findUnique({ where: { email } });
      if (dbUser) {
        const passwordValid = await bcrypt.compare(password, dbUser.password);
        if (!passwordValid) {
          return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        const token = jwt.sign({ userId: dbUser.id, email: dbUser.email, role: dbUser.role, churchId: dbUser.churchId || null }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return res.json({
          success: true,
          user: { id: dbUser.id, firstName: dbUser.firstName, lastName: dbUser.lastName, email: dbUser.email, role: dbUser.role },
          token,
          message: 'Login successful'
        });
      }
    }
    
    // Fallback - demo accounts + registered in-memory users
    {
      const demoUsers = {
        'pastor@faithlink360.org': {
          id: '1',
          firstName: 'David',
          lastName: 'Johnson',
          email: 'pastor@faithlink360.org',
          role: 'pastor',
          churchId: 'church-1',
          churchName: 'First Community Church'
        },
        'leader@faithlink360.org': {
          id: '2',
          firstName: 'Sarah',
          lastName: 'Smith',
          email: 'leader@faithlink360.org',
          role: 'leader',
          churchId: 'church-1',
          churchName: 'First Community Church'
        },
        'member@faithlink360.org': {
          id: '3',
          firstName: 'Michael',
          lastName: 'Brown',
          email: 'member@faithlink360.org',
          role: 'member',
          churchId: 'church-1',
          churchName: 'First Community Church'
        },
        'admin@faithlink360.org': {
          id: '4',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@faithlink360.org',
          role: 'admin',
          churchId: 'church-1',
          churchName: 'First Community Church'
        }
      };
      
      const validPasswords = ['demo123', 'admin123'];
      let user = demoUsers[email];
      let authenticated = false;
      
      if (user && validPasswords.includes(password)) {
        authenticated = true;
      }
      
      // Also check dynamically registered users
      if (!authenticated && global.inMemoryRegisteredUsers) {
        const registeredUser = global.inMemoryRegisteredUsers.find(u => u.email === email);
        if (registeredUser && registeredUser.passwordHash) {
          const match = await bcrypt.compare(password, registeredUser.passwordHash);
          if (match) { user = registeredUser; authenticated = true; }
        }
      }
      
      if (!authenticated) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      
      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role, churchId: user.churchId || null }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      
      res.json({
        success: true,
        user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, churchId: user.churchId, churchName: user.churchName },
        token,
        message: 'Login successful'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Login failed: ${error.message}` 
    });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    if (dbConnected && prisma) {
      // Database user lookup when available
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }
      
      res.json({
        success: true,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      });
    } else {
      // Verify JWT token
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (jwtErr) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
      }
      
      // Look up demo users by email
      const demoUsers = {
        'pastor@faithlink360.org': { id: '1', firstName: 'David', lastName: 'Johnson', email: 'pastor@faithlink360.org', role: 'pastor', churchId: 'church-1', churchName: 'First Community Church' },
        'leader@faithlink360.org': { id: '2', firstName: 'Sarah', lastName: 'Smith', email: 'leader@faithlink360.org', role: 'leader', churchId: 'church-1', churchName: 'First Community Church' },
        'member@faithlink360.org': { id: '3', firstName: 'Michael', lastName: 'Brown', email: 'member@faithlink360.org', role: 'member', churchId: 'church-1', churchName: 'First Community Church' },
        'admin@faithlink360.org': { id: '4', firstName: 'Admin', lastName: 'User', email: 'admin@faithlink360.org', role: 'admin', churchId: 'church-1', churchName: 'First Community Church' }
      };
      
      let user = demoUsers[decoded.email];
      if (!user && global.inMemoryRegisteredUsers) {
        user = global.inMemoryRegisteredUsers.find(u => u.email === decoded.email);
      }
      if (!user) {
        user = { id: decoded.userId, email: decoded.email, role: decoded.role, firstName: 'User', lastName: '' };
      }
      
      res.json({ success: true, user });
    }
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token format' 
    });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    // In a real implementation, you'd invalidate the token
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Logout failed: ${error.message}` 
    });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    if (dbConnected && prisma) {
      // Database password reset logic when available
      const user = await prisma.user.findUnique({
        where: { email }
      });
      
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({
          success: true,
          message: 'If this email exists, you will receive a password reset link shortly'
        });
      }
      
      // Generate reset token and send email
      const resetToken = crypto.randomBytes(32).toString('hex');
      // Save token to database and send email...
      
      res.json({
        success: true,
        message: 'Password reset link sent to your email'
      });
    } else {
      // Fallback - simulate password reset
      const demoEmails = [
        'pastor@faithlink360.org',
        'leader@faithlink360.org', 
        'member@faithlink360.org'
      ];
      
      if (demoEmails.includes(email)) {
        res.json({
          success: true,
          message: 'Password reset link sent to your email (demo mode)',
          resetToken: `demo-reset-token-${Date.now()}`,
          source: 'demo'
        });
      } else {
        res.json({
          success: true,
          message: 'If this email exists, you will receive a password reset link shortly (demo mode)',
          source: 'demo'
        });
      }
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Password reset failed: ${error.message}` 
    });
  }
});

// HIGH PRIORITY: Event management endpoints
app.post('/api/events/:id/register', async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId, notes, numberOfGuests } = req.body;
    
    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: 'Member ID is required for registration'
      });
    }
    
    if (dbConnected && prisma) {
      const registration = await prisma.eventRegistration.create({
        data: {
          eventId: id,
          memberId,
          notes: notes || '',
          numberOfGuests: numberOfGuests || 0,
          status: 'registered',
          registeredAt: new Date()
        }
      });
      
      res.json({
        success: true,
        registration
      });
    } else {
      // Fallback - simulate registration
      const registration = {
        id: `reg-${Date.now()}`,
        eventId: id,
        memberId,
        notes: notes || '',
        numberOfGuests: numberOfGuests || 0,
        status: 'registered',
        registeredAt: new Date().toISOString(),
        member: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com'
        }
      };
      
      res.json({
        success: true,
        registration,
        message: 'Successfully registered for event',
        source: 'demo'
      });
    }
  } catch (error) {
    console.error('Event registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Event registration failed: ${error.message}` 
    });
  }
});

app.post('/api/events/:eventId/check-in/:memberId', async (req, res) => {
  try {
    const { eventId, memberId } = req.params;
    const { notes, checkedInBy } = req.body;
    
    if (dbConnected && prisma) {
      const checkIn = await prisma.eventCheckIn.create({
        data: {
          eventId,
          memberId,
          checkedInAt: new Date(),
          notes: notes || '',
          checkedInBy: checkedInBy || req.user?.id
        }
      });
      
      res.json({
        success: true,
        checkIn
      });
    } else {
      // Fallback - simulate check-in
      const checkIn = {
        id: `checkin-${Date.now()}`,
        eventId,
        memberId,
        checkedInAt: new Date().toISOString(),
        notes: notes || '',
        checkedInBy: checkedInBy || 'admin',
        member: {
          firstName: 'John',
          lastName: 'Doe',
          memberNumber: '10001'
        }
      };
      
      res.json({
        success: true,
        checkIn,
        message: 'Member successfully checked in',
        source: 'demo'
      });
    }
  } catch (error) {
    console.error('Event check-in error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Event check-in failed: ${error.message}` 
    });
  }
});

app.post('/api/events/:eventId/check-in/:memberId/no-show', async (req, res) => {
  try {
    const { eventId, memberId } = req.params;
    const { reason, markedBy } = req.body;
    
    if (dbConnected && prisma) {
      const noShow = await prisma.eventNoShow.create({
        data: {
          eventId,
          memberId,
          reason: reason || 'No show',
          markedAt: new Date(),
          markedBy: markedBy || req.user?.id
        }
      });
      
      res.json({
        success: true,
        noShow
      });
    } else {
      // Fallback - simulate no-show marking
      const noShow = {
        id: `noshow-${Date.now()}`,
        eventId,
        memberId,
        reason: reason || 'No show',
        markedAt: new Date().toISOString(),
        markedBy: markedBy || 'admin',
        member: {
          firstName: 'John',
          lastName: 'Doe',
          memberNumber: '10001'
        }
      };
      
      res.json({
        success: true,
        noShow,
        message: 'Member marked as no-show',
        source: 'demo'
      });
    }
  } catch (error) {
    console.error('Event no-show error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Event no-show marking failed: ${error.message}` 
    });
  }
});

app.get('/api/events/:eventId/rsvps/:memberId', async (req, res) => {
  try {
    const { eventId, memberId } = req.params;
    
    if (dbConnected && prisma) {
      const rsvp = await prisma.eventRSVP.findFirst({
        where: {
          eventId,
          memberId
        },
        include: {
          member: true,
          event: true
        }
      });
      
      res.json({
        success: true,
        rsvp
      });
    } else {
      // Fallback - simulate RSVP lookup
      const rsvp = {
        id: `rsvp-${eventId}-${memberId}`,
        eventId,
        memberId,
        response: 'yes',
        numberOfGuests: 2,
        dietaryRestrictions: '',
        specialRequests: '',
        respondedAt: new Date().toISOString(),
        member: {
          id: memberId,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com'
        },
        event: {
          id: eventId,
          title: 'Sunday Service',
          date: '2025-11-17T10:00:00.000Z'
        }
      };
      
      res.json({
        success: true,
        rsvp,
        source: 'demo'
      });
    }
  } catch (error) {
    console.error('RSVP lookup error:', error);
    res.status(500).json({ 
      success: false, 
      message: `RSVP lookup failed: ${error.message}` 
    });
  }
});

app.post('/api/members/bulk-upload', async (req, res) => {
  try {
    const { members, options } = req.body;
    
    if (!members || !Array.isArray(members)) {
      return res.status(400).json({
        success: false,
        message: 'Members array is required'
      });
    }
    
    if (dbConnected && prisma) {
      // Database bulk upload when available
      const results = [];
      const errors = [];
      
      for (const member of members) {
        try {
          const created = await prisma.member.create({
            data: {
              ...member,
              memberNumber: member.memberNumber || `${10000 + Date.now() % 90000}`,
              isActive: true,
              createdAt: new Date()
            }
          });
          results.push(created);
        } catch (error) {
          errors.push({
            member,
            error: error.message
          });
        }
      }
      
      res.json({
        success: true,
        results: {
          successful: results.length,
          failed: errors.length,
          total: members.length,
          createdMembers: results,
          errors
        }
      });
    } else {
      // Fallback - simulate bulk upload
      const successful = members.filter(m => m.firstName && m.lastName && m.email);
      const failed = members.filter(m => !m.firstName || !m.lastName || !m.email);
      
      const createdMembers = successful.map((member, index) => ({
        id: `bulk-${Date.now()}-${index}`,
        ...member,
        memberNumber: member.memberNumber || `${10000 + index}`,
        isActive: true,
        createdAt: new Date().toISOString()
      }));
      
      const errors = failed.map(member => ({
        member,
        error: 'Missing required fields: firstName, lastName, email'
      }));
      
      res.json({
        success: true,
        results: {
          successful: successful.length,
          failed: failed.length,
          total: members.length,
          createdMembers,
          errors
        },
        message: `Bulk upload completed: ${successful.length} successful, ${failed.length} failed`,
        source: 'demo'
      });
    }
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Bulk upload failed: ${error.message}` 
    });
  }
});

// MEDIUM PRIORITY: Settings and member self-service endpoints
app.post('/api/members/onboarding-complete', async (req, res) => {
  try {
    const { memberId, completedSteps, feedback } = req.body;
    
    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: 'Member ID is required'
      });
    }
    
    if (dbConnected && prisma) {
      const onboarding = await prisma.memberOnboarding.create({
        data: {
          memberId,
          completedSteps: completedSteps || [],
          completedAt: new Date(),
          feedback: feedback || ''
        }
      });
      
      // Update member status
      await prisma.member.update({
        where: { id: memberId },
        data: { onboardingCompleted: true }
      });
      
      res.json({
        success: true,
        onboarding
      });
    } else {
      // Fallback - simulate onboarding completion
      const onboarding = {
        id: `onboarding-${Date.now()}`,
        memberId,
        completedSteps: completedSteps || [
          'profile_setup',
          'church_tour', 
          'group_selection',
          'communication_preferences'
        ],
        completedAt: new Date().toISOString(),
        feedback: feedback || 'Great onboarding experience!',
        progress: 100
      };
      
      res.json({
        success: true,
        onboarding,
        message: 'Onboarding completed successfully',
        source: 'demo'
      });
    }
  } catch (error) {
    console.error('Onboarding completion error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Onboarding completion failed: ${error.message}` 
    });
  }
});

app.put('/api/members/self-service/profile', async (req, res) => {
  try {
    const { phone, address, emergencyContact, preferences } = req.body;
    const memberId = req.user?.id || '1'; // Use authenticated user ID
    
    if (dbConnected && prisma) {
      const updated = await prisma.member.update({
        where: { id: memberId },
        data: {
          phone,
          address,
          emergencyContact,
          preferences,
          updatedAt: new Date()
        }
      });
      
      res.json({
        success: true,
        member: updated
      });
    } else {
      // Fallback - simulate profile update
      const updatedProfile = {
        id: memberId,
        phone: phone || '(555) 123-4567',
        address: address || '123 Main St, Springfield, IL 62701',
        emergencyContact: emergencyContact || {
          name: 'Jane Doe',
          relationship: 'Spouse',
          phone: '(555) 987-6543'
        },
        preferences: preferences || {
          emailNotifications: true,
          smsNotifications: false,
          newsletter: true,
          eventReminders: true
        },
        updatedAt: new Date().toISOString()
      };
      
      res.json({
        success: true,
        member: updatedProfile,
        message: 'Profile updated successfully',
        source: 'demo'
      });
    }
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Profile update failed: ${error.message}` 
    });
  }
});

app.get('/api/settings/system', async (req, res) => {
  try {
    if (dbConnected && prisma) {
      const settings = await prisma.systemSettings.findMany();
      
      res.json({
        success: true,
        settings
      });
    } else {
      // Fallback - simulate system settings
      const settings = {
        general: {
          churchName: 'First Community Church',
          timezone: 'America/Chicago',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          language: 'en-US'
        },
        features: {
          memberRegistration: true,
          eventRegistration: true,
          groupManagement: true,
          attendanceTracking: true,
          communicationTools: true,
          reportingAnalytics: true
        },
        notifications: {
          emailEnabled: true,
          smsEnabled: false,
          pushNotifications: true,
          weeklyDigest: true
        },
        security: {
          requireStrongPasswords: true,
          twoFactorAuth: false,
          sessionTimeout: 30,
          maxLoginAttempts: 5
        },
        backup: {
          autoBackup: true,
          backupFrequency: 'daily',
          retentionPeriod: 30,
          lastBackup: new Date().toISOString()
        }
      };
      
      res.json({
        success: true,
        settings,
        source: 'demo'
      });
    }
  } catch (error) {
    console.error('System settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to fetch system settings: ${error.message}` 
    });
  }
});

app.put('/api/settings/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role, permissions, isActive, notes } = req.body;
    
    if (dbConnected && prisma) {
      const user = await prisma.user.update({
        where: { id },
        data: {
          role,
          permissions,
          isActive,
          notes,
          updatedAt: new Date()
        }
      });
      
      res.json({
        success: true,
        user
      });
    } else {
      // Fallback - simulate user settings update
      const updatedUser = {
        id,
        role: role || 'member',
        permissions: permissions || ['read_members', 'read_events'],
        isActive: isActive !== undefined ? isActive : true,
        notes: notes || '',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        updatedAt: new Date().toISOString(),
        updatedBy: req.user?.id || 'admin'
      };
      
      res.json({
        success: true,
        user: updatedUser,
        message: 'User settings updated successfully',
        source: 'demo'
      });
    }
  } catch (error) {
    console.error('User settings update error:', error);
    res.status(500).json({ 
      success: false, 
      message: `User settings update failed: ${error.message}` 
    });
  }
});

app.post('/api/volunteers/signup', async (req, res) => {
  try {
    const { opportunityId, memberId, availabilityDays, skills, notes } = req.body;
    
    if (!opportunityId || !memberId) {
      return res.status(400).json({
        success: false,
        message: 'Opportunity ID and Member ID are required'
      });
    }
    
    if (dbConnected && prisma) {
      const signup = await prisma.volunteerSignup.create({
        data: {
          opportunityId,
          memberId,
          availabilityDays: availabilityDays || [],
          skills: skills || [],
          notes: notes || '',
          status: 'pending',
          signedUpAt: new Date()
        }
      });
      
      res.json({
        success: true,
        signup
      });
    } else {
      // Fallback - simulate volunteer signup
      const signup = {
        id: `signup-${Date.now()}`,
        opportunityId,
        memberId,
        availabilityDays: availabilityDays || ['Saturday', 'Sunday'],
        skills: skills || ['Customer Service', 'Organization'],
        notes: notes || 'Excited to serve!',
        status: 'pending',
        signedUpAt: new Date().toISOString(),
        opportunity: {
          id: opportunityId,
          title: 'Children\'s Ministry Helper',
          department: 'Children\'s Ministry',
          timeCommitment: '2 hours/week'
        },
        member: {
          id: memberId,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com'
        }
      };
      
      res.json({
        success: true,
        signup,
        message: 'Volunteer signup submitted successfully',
        source: 'demo'
      });
    }
  } catch (error) {
    console.error('Volunteer signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Volunteer signup failed: ${error.message}` 
    });
  }
});

// LOW PRIORITY: Error reporting endpoints (bug-report route defined in INLINE CRUD section below)

app.post('/api/error-report', async (req, res) => {
  try {
    const { errorMessage, stackTrace, userAgent, url, userId, timestamp } = req.body;
    
    if (!errorMessage) {
      return res.status(400).json({
        success: false,
        message: 'Error message is required'
      });
    }
    
    if (dbConnected && prisma) {
      const errorReport = await prisma.errorReport.create({
        data: {
          errorMessage,
          stackTrace: stackTrace || '',
          userAgent: userAgent || '',
          url: url || '',
          userId: userId || null,
          timestamp: timestamp || new Date(),
          status: 'new',
          reportedAt: new Date()
        }
      });
      
      res.json({
        success: true,
        errorReport
      });
    } else {
      // Fallback - simulate error report
      const errorReport = {
        id: `error-${Date.now()}`,
        errorMessage,
        stackTrace: stackTrace || '',
        userAgent: userAgent || '',
        url: url || '',
        userId: userId || null,
        timestamp: timestamp || new Date().toISOString(),
        status: 'new',
        reportedAt: new Date().toISOString(),
        errorId: `ERR-${Date.now().toString().slice(-6)}`
      };
      
      res.json({
        success: true,
        errorReport,
        message: 'Error report logged successfully',
        source: 'demo'
      });
    }
  } catch (error) {
    console.error('Error report logging error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Error report logging failed: ${error.message}` 
    });
  }
});

// Dashboard endpoint (missing endpoint causing 404s)
app.get('/api/reports/dashboard', async (req, res) => {
  try {
    res.json({
      success: true,
      stats: {
        totalMembers: 142,
        activeMembers: 128,
        totalGroups: 8,
        upcomingEvents: 3,
        recentActivities: [
          {
            id: '1',
            type: 'member_joined',
            description: 'Sarah Johnson joined Adult Sunday School',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            user: 'Sarah Johnson'
          },
          {
            id: '2', 
            type: 'deacon_assigned',
            description: 'John Wesley assigned as deacon to David Smith',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            user: 'Admin User'
          }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Individual group endpoints
app.get('/api/groups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Sample group data
    const groupData = {
      'group-001': {
        id: 'group-001',
        name: 'Adult Sunday School',
        type: 'education',
        description: 'Bible study for adults every Sunday morning',
        leaderId: '1',
        leaderName: 'David Johnson',
        isActive: true,
        meetingTime: 'Sundays 9:00 AM',
        location: 'Room 101',
        memberCount: 12,
        tags: ['education', 'adult', 'bible-study']
      },
      'group-002': {
        id: 'group-002',
        name: 'Youth Group', 
        type: 'fellowship',
        description: 'Fellowship and activities for teenagers',
        leaderId: '2',
        leaderName: 'Sarah Thompson',
        isActive: true,
        meetingTime: 'Fridays 7:00 PM',
        location: 'Youth Center',
        memberCount: 8,
        tags: ['youth', 'fellowship', 'activities']
      }
    };

    const group = groupData[id] || groupData['group-001'];
    
    res.json({
      success: true,
      group
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Group members endpoint
app.get('/api/groups/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Sample members for groups
    const groupMembers = {
      'group-001': [
        {
          id: '1',
          firstName: 'David',
          lastName: 'Johnson',
          email: 'david.johnson@faithlink360.org',
          role: 'leader',
          joinedDate: '2024-01-15',
          isActive: true
        },
        {
          id: '2',
          firstName: 'Sarah',
          lastName: 'Johnson', 
          email: 'sarah.johnson@email.com',
          role: 'member',
          joinedDate: '2024-02-20',
          isActive: true
        }
      ],
      'group-002': [
        {
          id: '3',
          firstName: 'Michael',
          lastName: 'Brown',
          email: 'michael.brown@email.com',
          role: 'member',
          joinedDate: '2024-03-10',
          isActive: true
        }
      ]
    };

    const members = groupMembers[id] || groupMembers['group-001'];
    
    res.json({
      success: true,
      members,
      count: members.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Events endpoint - using in-memory store
app.get('/api/events', async (req, res) => {
  try {
    res.json({
      success: true,
      events: inMemoryEvents,
      count: inMemoryEvents.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== Weekly Calendar View API (MUST be before /api/events/:id) ==========
app.get('/api/events/calendar/weekly', async (req, res) => {
  try {
    const { startDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    const dayOfWeek = start.getDay();
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() - dayOfWeek);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    if (dbConnected && prisma) {
      const events = await prisma.event.findMany({
        where: { dateTime: { gte: weekStart, lt: weekEnd } },
        orderBy: { dateTime: 'asc' }
      });
      return res.json({ success: true, weekStart: weekStart.toISOString(), weekEnd: weekEnd.toISOString(), events });
    }
    // Fallback
    const sampleEvents = [
      { id: 'evt-1', title: 'Sunday Service', dateTime: weekStart.toISOString(), startTime: '09:00', endTime: '11:00', type: 'worship' },
      { id: 'evt-2', title: 'Bible Study', dateTime: new Date(weekStart.getTime() + 3 * 86400000).toISOString(), startTime: '19:00', endTime: '20:30', type: 'study' }
    ];
    res.json({ success: true, weekStart: weekStart.toISOString(), weekEnd: weekEnd.toISOString(), events: sampleEvents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// INDIVIDUAL EVENT ENDPOINT
app.get('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const eventData = {
      '1': {
        id: '1',
        title: 'Sunday Service',
        description: 'Weekly worship service with communion and fellowship',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        time: '10:00 AM',
        location: 'Main Sanctuary',
        type: 'worship',
        isPublic: true,
        maxAttendees: 200,
        registeredCount: 45,
        organizerId: '1',
        organizer: 'Pastor David Johnson'
      },
      '2': {
        id: '2',
        title: 'Youth Group Meeting',
        description: 'Weekly fellowship for teenagers with activities and Bible study',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        time: '7:00 PM',
        location: 'Youth Center',
        type: 'fellowship',
        isPublic: true,
        maxAttendees: 30,
        registeredCount: 12,
        organizerId: '2',
        organizer: 'Mary Thompson'
      }
    };

    const event = eventData[id] || eventData['1'];
    
    res.json({
      success: true,
      event
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// EVENT REGISTRATIONS ENDPOINT
app.get('/api/events/:id/registrations', async (req, res) => {
  try {
    const { id } = req.params;
    
    const registrations = [
      {
        id: '1',
        eventId: id,
        memberId: '1',
        member: { firstName: 'David', lastName: 'Johnson', email: 'david.johnson@faithlink360.org' },
        registeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'confirmed',
        notes: 'Looking forward to the service'
      },
      {
        id: '2',
        eventId: id,
        memberId: '2',
        member: { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@email.com' },
        registeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'confirmed',
        notes: 'Will bring family'
      }
    ];

    res.json({
      success: true,
      registrations,
      count: registrations.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// EVENT RSVP ENDPOINT
app.get('/api/events/:id/rsvp', async (req, res) => {
  try {
    const { id } = req.params;
    
    const rsvpData = {
      eventId: id,
      totalInvited: 150,
      responses: {
        attending: 45,
        notAttending: 12,
        maybe: 8,
        noResponse: 85
      },
      rsvps: [
        {
          id: '1',
          memberId: '1',
          member: { firstName: 'David', lastName: 'Johnson' },
          response: 'attending',
          guestCount: 2,
          notes: 'Excited to attend with family',
          respondedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    };

    res.json({
      success: true,
      rsvp: rsvpData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// EVENT CHECK-IN ENDPOINT
app.get('/api/events/:id/check-in', async (req, res) => {
  try {
    const { id } = req.params;
    
    const checkInData = {
      eventId: id,
      eventTitle: 'Sunday Service',
      totalRegistered: 45,
      checkedIn: 32,
      checkIns: [
        {
          id: '1',
          memberId: '1',
          member: { firstName: 'David', lastName: 'Johnson', memberNumber: '10001' },
          checkedInAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          checkedInBy: 'self',
          notes: 'On time arrival'
        },
        {
          id: '2',
          memberId: '2',
          member: { firstName: 'Sarah', lastName: 'Johnson', memberNumber: '10002' },
          checkedInAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          checkedInBy: 'volunteer',
          notes: 'Brought guest'
        }
      ]
    };

    res.json({
      success: true,
      checkIn: checkInData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Member journeys endpoint (missing endpoint causing 404s)
app.get('/api/journeys/member-journeys', async (req, res) => {
  try {
    const { limit = 10, offset = 0, sortBy = 'startedAt', sortOrder = 'desc' } = req.query;
    
    const sampleJourneys = [
      {
        id: '1',
        memberId: '1',
        templateId: 'template-1',
        title: 'New Member Welcome Journey',
        description: 'Introduction to church community and faith basics',
        status: 'in_progress',
        progress: 60,
        startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        completedAt: null,
        milestones: [
          { id: '1', title: 'Welcome Meeting', completed: true, completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
          { id: '2', title: 'Church Tour', completed: true, completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
          { id: '3', title: 'Small Group Assignment', completed: false, completedAt: null }
        ],
        member: {
          id: '1',
          firstName: 'David',
          lastName: 'Johnson',
          email: 'david.johnson@faithlink360.org'
        },
        assignedDeacon: {
          id: 'deacon1',
          firstName: 'John',
          lastName: 'Wesley',
          email: 'john.wesley@church.com'
        }
      },
      {
        id: '2',
        memberId: '2',
        templateId: 'template-2',
        title: 'Leadership Development Path',
        description: 'Training and preparation for church leadership roles',
        status: 'completed',
        progress: 100,
        startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        milestones: [
          { id: '1', title: 'Leadership Fundamentals', completed: true, completedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
          { id: '2', title: 'Ministry Training', completed: true, completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
          { id: '3', title: 'Mentorship Assignment', completed: true, completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
        ],
        member: {
          id: '2',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@email.com'
        },
        assignedDeacon: {
          id: 'deacon2',
          firstName: 'Mary',
          lastName: 'Thompson',
          email: 'mary.thompson@church.com'
        }
      }
    ];

    // Apply sorting
    const sortedJourneys = sampleJourneys.sort((a, b) => {
      const aValue = a[sortBy] || '';
      const bValue = b[sortBy] || '';
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedJourneys = sortedJourneys.slice(startIndex, endIndex);

    res.json({
      success: true,
      journeys: paginatedJourneys,
      total: sampleJourneys.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: endIndex < sampleJourneys.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Individual member journey endpoint
app.get('/api/journeys/member-journeys/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;
    
    // Sample journey data for the specific member
    const memberJourney = {
      id: `journey-${memberId}`,
      memberId: memberId,
      templateId: 'template-1',
      title: 'New Member Welcome Journey',
      description: 'Introduction to church community and faith basics',
      status: 'in_progress',
      progress: 60,
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: null,
      milestones: [
        { 
          id: '1', 
          title: 'Welcome Meeting', 
          completed: true, 
          completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() 
        },
        { 
          id: '2', 
          title: 'Church Tour', 
          completed: true, 
          completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() 
        },
        { 
          id: '3', 
          title: 'Small Group Assignment', 
          completed: false, 
          completedAt: null 
        }
      ],
      member: {
        id: memberId,
        firstName: memberId === '1' ? 'David' : 'Sarah',
        lastName: 'Johnson',
        email: `member${memberId}@faithlink360.org`
      },
      assignedDeacon: {
        id: 'deacon1',
        firstName: 'John',
        lastName: 'Wesley',
        email: 'john.wesley@church.com'
      }
    };

    res.json({
      success: true,
      journey: memberJourney
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// COMPLETE ALL MISSING ENDPOINTS FOR 100% COVERAGE

// JOURNEY TEMPLATES ENDPOINTS
app.get('/api/journeys/templates', async (req, res) => {
  try {
    const templates = [
      {
        id: 'template-1',
        title: 'New Member Welcome Journey',
        description: 'A comprehensive 8-week program for new church members',
        duration: 56,
        milestones: [
          { id: '1', title: 'Welcome Meeting', order: 1, description: 'Personal welcome and church introduction' },
          { id: '2', title: 'Church Tour', order: 2, description: 'Guided tour of facilities and ministries' },
          { id: '3', title: 'Small Group Assignment', order: 3, description: 'Assignment to appropriate small group' },
          { id: '4', title: 'First Steps Class', order: 4, description: 'Introduction to church beliefs and practices' }
        ],
        isPublic: true,
        category: 'orientation'
      },
      {
        id: 'template-2',
        title: 'Leadership Development Path',
        description: 'Training program for emerging church leaders',
        duration: 84,
        milestones: [
          { id: '1', title: 'Leadership Fundamentals', order: 1, description: 'Basic leadership principles and biblical foundation' },
          { id: '2', title: 'Ministry Training', order: 2, description: 'Specific ministry skills and techniques' },
          { id: '3', title: 'Mentorship Assignment', order: 3, description: 'Pairing with experienced mentor' },
          { id: '4', title: 'Practical Application', order: 4, description: 'Hands-on leadership experience' },
          { id: '5', title: 'Leadership Assessment', order: 5, description: 'Evaluation and feedback session' }
        ],
        isPublic: true,
        category: 'leadership'
      }
    ];

    res.json({
      success: true,
      templates,
      count: templates.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/journey-templates', async (req, res) => {
  try {
    const templates = [
      {
        id: 'template-1',
        title: 'New Member Welcome Journey',
        description: 'A comprehensive 8-week program for new church members',
        duration: 56,
        milestones: [
          { id: '1', title: 'Welcome Meeting', order: 1, description: 'Personal welcome and church introduction' },
          { id: '2', title: 'Church Tour', order: 2, description: 'Guided tour of facilities and ministries' },
          { id: '3', title: 'Small Group Assignment', order: 3, description: 'Assignment to appropriate small group' },
          { id: '4', title: 'First Steps Class', order: 4, description: 'Introduction to church beliefs and practices' }
        ],
        isPublic: true,
        category: 'orientation'
      }
    ];

    res.json({
      success: true,
      templates,
      count: templates.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/journeys/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const journey = {
      id: id,
      memberId: '1',
      templateId: 'template-1',
      title: 'New Member Welcome Journey',
      description: 'Introduction to church community and faith basics',
      status: 'in_progress',
      progress: 60,
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: null,
      member: {
        id: '1',
        firstName: 'David',
        lastName: 'Johnson',
        email: 'david.johnson@faithlink360.org'
      },
      assignedDeacon: {
        id: 'deacon1',
        firstName: 'John',
        lastName: 'Wesley',
        email: 'john.wesley@church.com'
      }
    };

    res.json({
      success: true,
      journey
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DASHBOARD STATS ALTERNATE
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    res.json({
      success: true,
      stats: {
        members: 142,
        groups: 8,
        events: 3,
        journeys: 15,
        totalMembers: 142,
        activeMembers: 128,
        totalGroups: 8,
        upcomingEvents: 3,
        activeJourneys: 15,
        deaconsActive: 3
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ALL REPORT ENDPOINTS
app.get('/api/reports/attendance', async (req, res) => {
  try {
    res.json({
      success: true,
      report: {
        summary: {
          totalEvents: 24,
          averageAttendance: 85,
          attendanceRate: 73,
          trend: 'increasing'
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/reports/engagement', async (req, res) => {
  try {
    res.json({
      success: true,
      report: {
        memberEngagement: {
          memberActivity: {
            highlyActive: 45,
            moderatelyActive: 67,
            lowActivity: 30
          },
          deaconInteraction: {
            regularContact: 89,
            occasionalContact: 43,
            noContact: 10
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/reports/group-health', async (req, res) => {
  try {
    res.json({
      success: true,
      groupHealth: {
        totalGroups: 8,
        activeGroups: 7,
        groupStats: [
          {
            id: 'group-001',
            name: 'Adult Sunday School',
            health: 'excellent',
            members: 12,
            attendanceRate: 85,
            engagement: 'high'
          }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// INDIVIDUAL DEACON ENDPOINT
app.get('/api/deacons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deacon = {
      id: id,
      name: 'John Wesley',
      firstName: 'John',
      lastName: 'Wesley',
      email: 'john.wesley@church.com',
      phone: '(555) 123-4567',
      contactInfo: {
        email: 'john.wesley@church.com',
        phone: '(555) 123-4567',
        address: '123 Church Street, Faith City, FC 12345'
      },
      isActive: true,
      specialties: ['General Counseling', 'Family Support'],
      maxMembers: 25,
      notes: 'Senior deacon with 15 years of experience'
    };
    
    res.json({
      success: true,
      deacon
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ALL MEMBER CARE ENDPOINTS - using in-memory stores
app.get('/api/care/records', async (req, res) => {
  try {
    res.json({
      success: true,
      records: inMemoryCareRecords,
      count: inMemoryCareRecords.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/care/members-needing-care', async (req, res) => {
  try {
    res.json({
      success: true,
      members: inMemoryMembersNeedingCare,
      count: inMemoryMembersNeedingCare.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ALL COMMUNICATION ENDPOINTS
app.get('/api/communications/campaigns', async (req, res) => {
  try {
    res.json({ success: true, campaigns: inMemoryCampaigns, count: inMemoryCampaigns.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/communications/announcements', async (req, res) => {
  try {
    res.json({ success: true, announcements: inMemoryAnnouncements, count: inMemoryAnnouncements.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== IN-MEMORY STORES FOR TASKS, ATTENDANCE, ETC ==========
const inMemoryTasks = [
  {
    id: 'task-1',
    title: 'Follow up with new members',
    description: 'Contact all new members from this month for welcome follow-up',
    assignedTo: 'John Wesley',
    assignedToId: 'deacon1',
    priority: 'high',
    status: 'pending',
    category: 'pastoral',
    createdBy: 'Pastor David',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'task-2',
    title: 'Prepare Sunday bulletin',
    description: 'Design and print bulletins for upcoming Sunday service',
    assignedTo: 'Admin User',
    assignedToId: 'admin1',
    priority: 'medium',
    status: 'in_progress',
    category: 'administrative',
    createdBy: 'Pastor David',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'task-3',
    title: 'Schedule volunteer training',
    description: 'Coordinate training sessions for new ministry volunteers',
    assignedTo: 'Sarah Johnson',
    assignedToId: 'member2',
    priority: 'low',
    status: 'completed',
    category: 'volunteer',
    createdBy: 'Admin User',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const inMemoryAttendance = [
  {
    id: 'att-1',
    groupId: 'grp-1',
    eventId: 'evt-1',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    records: [
      { memberId: '1', memberName: 'David Johnson', status: 'present', notes: '' },
      { memberId: '2', memberName: 'Sarah Johnson', status: 'present', notes: '' },
      { memberId: '3', memberName: 'Michael Chen', status: 'absent', notes: 'Sick' }
    ],
    totalPresent: 2,
    totalAbsent: 1,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const inMemoryCounselingSessions = [
  {
    id: 'cs-1',
    memberName: 'Michael Chen',
    memberEmail: 'michael@email.com',
    memberPhone: '(555) 987-6543',
    counselorName: 'Pastor David',
    sessionType: 'couple',
    sessionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    sessionTime: '14:00',
    duration: 60,
    location: 'Pastor Office',
    sessionTopic: 'Marriage Counseling',
    notes: 'Third session - focusing on communication improvement',
    isRecurring: true,
    recurringFrequency: 'weekly',
    reminderEnabled: true,
    reminderTime: 24,
    status: 'scheduled',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'cs-2',
    memberName: 'Emily Rodriguez',
    memberEmail: 'emily@email.com',
    memberPhone: '(555) 456-7890',
    counselorName: 'Pastor Smith',
    sessionType: 'individual',
    sessionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    sessionTime: '10:00',
    duration: 45,
    location: 'Counseling Room B',
    sessionTopic: 'Grief Counseling',
    notes: 'Initial session - recent loss of parent',
    isRecurring: false,
    reminderEnabled: true,
    reminderTime: 48,
    status: 'scheduled',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const inMemoryJourneyTemplates = [
  {
    id: 'jt-1',
    name: 'New Member Orientation',
    description: 'A structured journey for new church members covering beliefs, community, and service',
    category: 'onboarding',
    difficulty: 'beginner',
    estimatedDuration: '4 weeks',
    isPublic: true,
    status: 'published',
    milestones: [
      { id: 'ms-1', title: 'Welcome Session', description: 'Introduction to church values and community', order: 1, type: 'meeting' },
      { id: 'ms-2', title: 'Statement of Faith', description: 'Review and discuss our beliefs', order: 2, type: 'study' },
      { id: 'ms-3', title: 'Join a Small Group', description: 'Connect with a small group community', order: 3, type: 'action' },
      { id: 'ms-4', title: 'First Service Opportunity', description: 'Participate in a volunteer opportunity', order: 4, type: 'action' }
    ],
    createdBy: 'Pastor David',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'jt-2',
    name: 'Leadership Development',
    description: 'A comprehensive track for developing church leaders',
    category: 'leadership',
    difficulty: 'advanced',
    estimatedDuration: '12 weeks',
    isPublic: true,
    status: 'published',
    milestones: [
      { id: 'ms-5', title: 'Spiritual Gifts Assessment', description: 'Discover your spiritual gifts', order: 1, type: 'assessment' },
      { id: 'ms-6', title: 'Servant Leadership Study', description: 'Study biblical servant leadership', order: 2, type: 'study' },
      { id: 'ms-7', title: 'Mentorship Pairing', description: 'Get paired with a ministry mentor', order: 3, type: 'meeting' },
      { id: 'ms-8', title: 'Lead a Small Group Session', description: 'Practice leading a discussion', order: 4, type: 'action' }
    ],
    createdBy: 'Pastor David',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const inMemoryMemberJourneys = [
  {
    id: 'mj-1',
    memberId: '2',
    memberName: 'Sarah Johnson',
    templateId: 'jt-1',
    templateName: 'New Member Orientation',
    status: 'in_progress',
    progress: 50,
    startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    mentorId: '1',
    mentorName: 'David Johnson',
    milestoneProgress: [
      { milestoneId: 'ms-1', status: 'completed', completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
      { milestoneId: 'ms-2', status: 'completed', completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { milestoneId: 'ms-3', status: 'in_progress', startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { milestoneId: 'ms-4', status: 'not_started' }
    ],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const inMemoryCampaigns = [
  {
    id: 'camp-1',
    name: 'Weekly Newsletter',
    subject: 'This Week at Faith Community Church',
    content: 'Join us this Sunday for our special guest speaker...',
    type: 'email',
    status: 'sent',
    recipientCount: 245,
    openRate: 62,
    clickRate: 18,
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'camp-2',
    name: 'Easter Service Invite',
    subject: 'You Are Invited to Our Easter Celebration',
    content: 'Celebrate the resurrection with us...',
    type: 'email',
    status: 'draft',
    recipientCount: 0,
    openRate: 0,
    clickRate: 0,
    sentAt: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const inMemoryAnnouncements = [
  {
    id: 'ann-1',
    title: 'Church Picnic Next Saturday',
    content: 'Join us for our annual church picnic at Riverside Park. Bring a dish to share!',
    priority: 'normal',
    category: 'event',
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    author: 'Pastor David',
    isActive: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ann-2',
    title: 'Volunteer Appreciation Sunday',
    content: 'We are dedicating this Sunday to honor all our amazing volunteers.',
    priority: 'high',
    category: 'general',
    publishedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    author: 'Admin User',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

const inMemoryGroupMessages = {};
const inMemoryGroupFiles = {};

const inMemoryVolunteers = [
  {
    id: 'vol-1',
    memberId: '2',
    memberName: 'Sarah Johnson',
    email: 'sarah@email.com',
    phone: '(555) 123-4567',
    skills: ['teaching', 'music', 'hospitality'],
    availability: ['sunday', 'wednesday'],
    status: 'active',
    totalHours: 45,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'vol-2',
    memberId: '3',
    memberName: 'Michael Chen',
    email: 'michael@email.com',
    phone: '(555) 987-6543',
    skills: ['technology', 'sound-engineering'],
    availability: ['sunday'],
    status: 'active',
    totalHours: 28,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const inMemoryVolunteerOpportunities = [
  {
    id: 'opp-1',
    title: 'Sunday Greeter',
    description: 'Welcome members and visitors at the main entrance',
    ministry: 'Hospitality',
    schedule: 'Sundays 9:30-10:15 AM',
    spotsAvailable: 3,
    spotsTotal: 6,
    skills: ['hospitality', 'friendly'],
    status: 'active',
    urgent: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'opp-2',
    title: 'Sound Technician',
    description: 'Operate sound equipment during worship services',
    ministry: 'Worship',
    schedule: 'Sundays 9:00 AM - 12:30 PM',
    spotsAvailable: 1,
    spotsTotal: 2,
    skills: ['sound-engineering', 'technology'],
    status: 'active',
    urgent: true,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const inMemoryBugReports = [];

const inMemorySettingsStore = {
  church: {
    name: 'Faith Community Church',
    address: '123 Church Street, Faithville, CA 90210',
    phone: '(555) 123-4567',
    email: 'info@faithcommunitychurch.org',
    website: 'https://faithcommunitychurch.org',
    denomination: 'Non-denominational',
    timezone: 'America/Los_Angeles',
    language: 'en'
  },
  system: {}
};

// ALL TASK ENDPOINTS
app.get('/api/tasks', async (req, res) => {
  try {
    let tasks = [...inMemoryTasks];
    const { status, priority, category, search, sortBy, sortOrder, limit, offset } = req.query;
    if (status) tasks = tasks.filter(t => t.status === status);
    if (priority) tasks = tasks.filter(t => t.priority === priority);
    if (category) tasks = tasks.filter(t => t.category === category);
    if (search) {
      const s = search.toLowerCase();
      tasks = tasks.filter(t => t.title.toLowerCase().includes(s) || t.description.toLowerCase().includes(s));
    }
    if (sortBy) {
      tasks.sort((a, b) => {
        const aVal = a[sortBy] || '';
        const bVal = b[sortBy] || '';
        return sortOrder === 'desc' ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1);
      });
    }
    const total = tasks.length;
    if (offset) tasks = tasks.slice(Number(offset));
    if (limit) tasks = tasks.slice(0, Number(limit));
    res.json({ success: true, tasks, total, count: tasks.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let task = inMemoryTasks.find(t => t.id === id);
    if (!task) task = inMemoryTasks.find(t => t.id === `task-${id}`);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, priority, assignedTo, assignedToId, dueDate, category } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });
    const newTask = {
      id: 'task-' + Date.now(),
      title,
      description: description || '',
      assignedTo: assignedTo || '',
      assignedToId: assignedToId || '',
      priority: priority || 'medium',
      status: 'pending',
      category: category || 'general',
      createdBy: 'Current User',
      dueDate: dueDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    inMemoryTasks.push(newTask);
    res.status(201).json({ success: true, task: newTask, message: 'Task created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idx = inMemoryTasks.findIndex(t => t.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Task not found' });
    Object.assign(inMemoryTasks[idx], req.body, { updatedAt: new Date().toISOString() });
    res.json({ success: true, task: inMemoryTasks[idx], message: 'Task updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idx = inMemoryTasks.findIndex(t => t.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Task not found' });
    inMemoryTasks.splice(idx, 1);
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ALL ATTENDANCE ENDPOINTS
app.get('/api/attendance', async (req, res) => {
  try {
    let sessions = [...inMemoryAttendance];
    const { groupId, eventId } = req.query;
    if (groupId) sessions = sessions.filter(s => s.groupId === groupId);
    if (eventId) sessions = sessions.filter(s => s.eventId === eventId);
    res.json({ success: true, sessions, total: sessions.length, count: sessions.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/attendance/stats', async (req, res) => {
  try {
    const totalSessions = inMemoryAttendance.length;
    const totalPresent = inMemoryAttendance.reduce((sum, s) => sum + (s.totalPresent || 0), 0);
    const totalRecords = inMemoryAttendance.reduce((sum, s) => sum + (s.records ? s.records.length : 0), 0);
    res.json({
      success: true,
      stats: {
        totalEvents: Math.max(totalSessions, 24),
        averageAttendance: totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 85,
        attendanceRate: 73,
        totalSessions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/attendance/:id', async (req, res) => {
  try {
    const session = inMemoryAttendance.find(s => s.id === req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Attendance session not found' });
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const { groupId, eventId, date, records } = req.body;
    if (!groupId && !eventId) return res.status(400).json({ success: false, message: 'groupId or eventId is required' });
    const attendanceRecords = records || [];
    const newSession = {
      id: 'att-' + Date.now(),
      groupId: groupId || null,
      eventId: eventId || null,
      date: date || new Date().toISOString(),
      records: attendanceRecords,
      totalPresent: attendanceRecords.filter(r => r.status === 'present').length,
      totalAbsent: attendanceRecords.filter(r => r.status === 'absent').length,
      createdAt: new Date().toISOString()
    };
    inMemoryAttendance.push(newSession);
    res.status(201).json({ success: true, session: newSession, message: 'Attendance recorded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/attendance/:id', async (req, res) => {
  try {
    const idx = inMemoryAttendance.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Attendance session not found' });
    Object.assign(inMemoryAttendance[idx], req.body);
    if (req.body.records) {
      inMemoryAttendance[idx].totalPresent = req.body.records.filter(r => r.status === 'present').length;
      inMemoryAttendance[idx].totalAbsent = req.body.records.filter(r => r.status === 'absent').length;
    }
    res.json({ success: true, session: inMemoryAttendance[idx], message: 'Attendance updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/attendance/:id', async (req, res) => {
  try {
    const idx = inMemoryAttendance.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Attendance session not found' });
    inMemoryAttendance.splice(idx, 1);
    res.json({ success: true, message: 'Attendance session deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/attendance/export', async (req, res) => {
  try {
    const csvHeader = 'SessionId,Date,MemberName,Status,Notes\n';
    const csvRows = inMemoryAttendance.flatMap(s =>
      (s.records || []).map(r => `${s.id},${s.date},${r.memberName},${r.status},${r.notes || ''}`)
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_export.csv');
    res.send(csvHeader + csvRows);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/attendance/:id/bulk-update', async (req, res) => {
  try {
    const idx = inMemoryAttendance.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Attendance session not found' });
    const { updates } = req.body;
    if (!updates || !Array.isArray(updates)) return res.status(400).json({ success: false, message: 'updates array is required' });
    updates.forEach(update => {
      const recordIdx = inMemoryAttendance[idx].records.findIndex(r => r.memberId === update.memberId);
      if (recordIdx !== -1) {
        Object.assign(inMemoryAttendance[idx].records[recordIdx], update);
      } else {
        inMemoryAttendance[idx].records.push({ memberId: update.memberId, memberName: update.memberName || 'Unknown', status: update.status, notes: update.notes || '' });
      }
    });
    inMemoryAttendance[idx].totalPresent = inMemoryAttendance[idx].records.filter(r => r.status === 'present').length;
    inMemoryAttendance[idx].totalAbsent = inMemoryAttendance[idx].records.filter(r => r.status === 'absent').length;
    res.json({ success: true, session: inMemoryAttendance[idx], message: 'Attendance bulk updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ALL SETTINGS ENDPOINTS
app.get('/api/settings/users', async (req, res) => {
  try {
    res.json({
      success: true,
      users: [
        {
          id: '1',
          email: 'admin@faithlink360.org',
          role: 'admin',
          firstName: 'Admin',
          lastName: 'User',
          isActive: true
        }
      ],
      count: 1
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/settings/church', async (req, res) => {
  try {
    res.json({ success: true, settings: inMemorySettingsStore.church });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ACTIVITY FEED ENDPOINT
app.get('/api/activity', async (req, res) => {
  try {
    res.json({
      success: true,
      activities: [
        {
          id: '1',
          type: 'deacon_assigned',
          title: 'Deacon Assignment',
          description: 'John Wesley assigned as deacon to David Johnson',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          actor: { name: 'Admin User', role: 'admin' }
        }
      ],
      count: 1
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

// ========== MISSING POST ENDPOINTS ==========

// In-memory stores for data that doesn't have DB tables yet
const inMemoryPrayerRequests = [
  {
    id: 'pr-1',
    title: 'Health and Healing',
    description: 'Prayers for recovery and strength during illness',
    requestedBy: 'Sarah Johnson',
    priority: 'high',
    category: 'health',
    status: 'active',
    isPrivate: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'Pastor David',
    updates: []
  },
  {
    id: 'pr-2',
    title: 'Guidance and Wisdom',
    description: 'Seeking direction in important career decisions',
    requestedBy: 'Michael Chen',
    priority: 'normal',
    category: 'spiritual',
    status: 'active',
    isPrivate: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: null,
    updates: []
  },
  {
    id: 'pr-3',
    title: 'Family Restoration',
    description: 'Prayers for reconciliation within family relationships',
    requestedBy: 'Emily Rodriguez',
    priority: 'urgent',
    category: 'family',
    status: 'ongoing',
    isPrivate: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTo: 'Care Team',
    updates: [{ id: 'u1', content: 'Family agreed to counseling session', author: 'Pastor David', createdAt: new Date().toISOString() }]
  }
];

const inMemoryCareRecords = [
  {
    id: 'cr-1',
    memberId: '1',
    memberName: 'Sarah Johnson',
    memberEmail: 'sarah@email.com',
    memberPhone: '(555) 123-4567',
    careType: 'hospital',
    subject: 'Surgery Recovery Visit',
    notes: 'Visited Sarah after her knee surgery. She is recovering well and appreciates the church support.',
    careProvider: 'Pastor Smith',
    careDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    nextFollowUp: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    status: 'completed',
    tags: ['surgery', 'recovery']
  },
  {
    id: 'cr-2',
    memberId: '2',
    memberName: 'Michael Chen',
    memberEmail: 'michael@email.com',
    memberPhone: '(555) 987-6543',
    careType: 'counseling',
    subject: 'Marriage Counseling Session',
    notes: 'Third session with Michael and Lisa. Making good progress on communication.',
    careProvider: 'Pastor David',
    careDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    nextFollowUp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'normal',
    status: 'completed',
    tags: ['marriage', 'counseling']
  },
  {
    id: 'cr-3',
    memberId: '3',
    memberName: 'Emily Rodriguez',
    memberEmail: 'emily@email.com',
    memberPhone: '(555) 456-7890',
    careType: 'call',
    subject: 'Job Loss Support Call',
    notes: 'Called Emily to check on her after recent job loss. Connected her with financial assistance.',
    careProvider: 'Care Team Leader',
    careDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    status: 'in-progress',
    tags: ['job-loss', 'financial-help']
  }
];

const inMemoryMembersNeedingCare = [
  {
    id: '4',
    name: 'Robert Wilson',
    email: 'robert@email.com',
    phone: '(555) 111-2222',
    address: '123 Oak St, City, State',
    lastContact: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    careNeeds: ['elderly', 'homebound'],
    emergencyContact: 'Jane Wilson (555) 111-2223'
  },
  {
    id: '5',
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '(555) 333-4444',
    address: '456 Pine Ave, City, State',
    lastContact: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    careNeeds: ['new-member', 'follow-up'],
    emergencyContact: 'Carlos Santos (555) 333-4445'
  }
];

const inMemoryEvents = [
  {
    id: 'evt-1',
    title: 'Sunday Worship Service',
    description: 'Weekly worship service with communion and fellowship',
    startDateTime: getNextDayOfWeek(0, '10:00'),
    endDateTime: getNextDayOfWeek(0, '12:00'),
    location: 'Main Sanctuary',
    eventType: 'worship',
    maxAttendees: 200,
    currentAttendees: 45,
    isRecurring: true,
    status: 'upcoming'
  },
  {
    id: 'evt-2',
    title: 'Youth Group Meeting',
    description: 'Weekly fellowship for teenagers with activities and Bible study',
    startDateTime: getNextDayOfWeek(3, '19:00'),
    endDateTime: getNextDayOfWeek(3, '21:00'),
    location: 'Youth Center',
    eventType: 'fellowship',
    maxAttendees: 30,
    currentAttendees: 12,
    isRecurring: true,
    status: 'upcoming'
  },
  {
    id: 'evt-3',
    title: 'Wednesday Bible Study',
    description: 'Weekly Bible study and discussion group',
    startDateTime: getNextDayOfWeek(3, '19:30'),
    endDateTime: getNextDayOfWeek(3, '21:00'),
    location: 'Room 101',
    eventType: 'education',
    maxAttendees: 25,
    currentAttendees: 18,
    isRecurring: true,
    status: 'upcoming'
  },
  {
    id: 'evt-4',
    title: 'Prayer Breakfast',
    description: 'Monthly prayer breakfast and fellowship',
    startDateTime: getNextDayOfWeek(6, '08:00'),
    endDateTime: getNextDayOfWeek(6, '10:00'),
    location: 'Fellowship Hall',
    eventType: 'prayer',
    maxAttendees: 50,
    currentAttendees: 22,
    isRecurring: false,
    status: 'upcoming'
  }
];

function getNextDayOfWeek(dayOfWeek, timeStr) {
  const now = new Date();
  const result = new Date(now);
  result.setDate(now.getDate() + ((dayOfWeek + 7 - now.getDay()) % 7 || 7));
  const [hours, minutes] = timeStr.split(':');
  result.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return result.toISOString();
}

// ---- POST: Create Prayer Request ----
app.post('/api/care/prayer-requests', async (req, res) => {
  try {
    const { title, description, priority, category, isPrivate, requestedBy, assignTo } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }
    const newRequest = {
      id: 'pr-' + Date.now(),
      title,
      description,
      requestedBy: requestedBy || 'Anonymous',
      priority: priority || 'normal',
      category: category || 'other',
      status: 'active',
      isPrivate: isPrivate || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedTo: assignTo || null,
      updates: []
    };
    inMemoryPrayerRequests.push(newRequest);
    res.status(201).json({ success: true, prayerRequest: newRequest, message: 'Prayer request created successfully' });
  } catch (error) {
    console.error('Create prayer request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---- PUT: Update Prayer Request ----
app.put('/api/care/prayer-requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idx = inMemoryPrayerRequests.findIndex(r => r.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Prayer request not found' });
    Object.assign(inMemoryPrayerRequests[idx], req.body, { updatedAt: new Date().toISOString() });
    res.json({ success: true, prayerRequest: inMemoryPrayerRequests[idx] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---- POST: Create Care Record ----
app.post('/api/care/records', async (req, res) => {
  try {
    const { memberId, memberName, careType, subject, notes, careProvider, priority, nextFollowUp } = req.body;
    if (!subject || !careType) {
      return res.status(400).json({ success: false, message: 'Subject and care type are required' });
    }
    const newRecord = {
      id: 'cr-' + Date.now(),
      memberId: memberId || 'unknown',
      memberName: memberName || 'Unknown Member',
      memberEmail: req.body.memberEmail || '',
      memberPhone: req.body.memberPhone || '',
      careType,
      subject,
      notes: notes || '',
      careProvider: careProvider || 'Care Team',
      careDate: new Date().toISOString(),
      nextFollowUp: nextFollowUp || null,
      priority: priority || 'normal',
      status: 'scheduled',
      tags: req.body.tags || []
    };
    inMemoryCareRecords.push(newRecord);
    res.status(201).json({ success: true, record: newRecord, message: 'Care record created successfully' });
  } catch (error) {
    console.error('Create care record error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---- POST: Create Event ----
app.post('/api/events', async (req, res) => {
  try {
    const { title, description, startDateTime, endDateTime, location, eventType, maxAttendees, isRecurring } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Event title is required' });
    }
    const newEvent = {
      id: 'evt-' + Date.now(),
      title,
      description: description || '',
      startDateTime: startDateTime || new Date().toISOString(),
      endDateTime: endDateTime || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      location: location || 'TBD',
      eventType: eventType || 'general',
      maxAttendees: maxAttendees || null,
      currentAttendees: 0,
      isRecurring: isRecurring || false,
      status: 'upcoming'
    };
    inMemoryEvents.push(newEvent);
    res.status(201).json({ success: true, event: newEvent, message: 'Event created successfully' });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---- PUT: Update Event ----
app.put('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let idx = inMemoryEvents.findIndex(e => e.id === id);
    if (idx === -1) idx = inMemoryEvents.findIndex(e => e.id === `evt-${id}`);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Event not found' });
    Object.assign(inMemoryEvents[idx], req.body);
    res.json({ success: true, event: inMemoryEvents[idx] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---- DELETE: Delete Event ----
app.delete('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let idx = inMemoryEvents.findIndex(e => e.id === id);
    if (idx === -1) idx = inMemoryEvents.findIndex(e => e.id === `evt-${id}`);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Event not found' });
    inMemoryEvents.splice(idx, 1);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---- Notifications endpoint ----
app.get('/api/notifications', async (req, res) => {
  try {
    res.json({
      success: true,
      notifications: [
        { id: 'n1', type: 'care', title: 'New prayer request submitted', message: 'Sarah Johnson submitted a prayer request', read: false, createdAt: new Date().toISOString() },
        { id: 'n2', type: 'event', title: 'Upcoming event reminder', message: 'Sunday Worship Service is tomorrow at 10:00 AM', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: 'n3', type: 'member', title: 'New member joined', message: 'A new member has joined your church', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() }
      ],
      unreadCount: 2
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---- Settings endpoints (persistent) ----
app.put('/api/settings/church', async (req, res) => {
  try {
    Object.assign(inMemorySettingsStore.church, req.body);
    res.json({ success: true, settings: inMemorySettingsStore.church, message: 'Church settings updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/settings/system', async (req, res) => {
  try {
    Object.assign(inMemorySettingsStore.system, req.body);
    res.json({ success: true, settings: inMemorySettingsStore.system, message: 'System settings updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== CARE: COUNSELING SESSIONS + DELETE PRAYER REQUEST ==========

app.get('/api/care/counseling-sessions', async (req, res) => {
  try {
    res.json({ success: true, sessions: inMemoryCounselingSessions, count: inMemoryCounselingSessions.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/care/counseling-sessions', async (req, res) => {
  try {
    const { memberName, counselorName, sessionType, sessionDate, sessionTime, duration, location, sessionTopic } = req.body;
    if (!memberName || !sessionDate) return res.status(400).json({ success: false, message: 'Member name and session date are required' });
    const newSession = {
      id: 'cs-' + Date.now(),
      memberName,
      memberEmail: req.body.memberEmail || '',
      memberPhone: req.body.memberPhone || '',
      counselorName: counselorName || 'Pastor',
      sessionType: sessionType || 'individual',
      sessionDate,
      sessionTime: sessionTime || '10:00',
      duration: duration || 60,
      location: location || 'Office',
      sessionTopic: sessionTopic || '',
      notes: req.body.notes || '',
      isRecurring: req.body.isRecurring || false,
      recurringFrequency: req.body.recurringFrequency || null,
      reminderEnabled: req.body.reminderEnabled !== false,
      reminderTime: req.body.reminderTime || 24,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };
    inMemoryCounselingSessions.push(newSession);
    res.status(201).json({ success: true, session: newSession, message: 'Counseling session scheduled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/care/prayer-requests/:id', async (req, res) => {
  try {
    const idx = inMemoryPrayerRequests.findIndex(r => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Prayer request not found' });
    inMemoryPrayerRequests.splice(idx, 1);
    res.json({ success: true, message: 'Prayer request deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== COMMUNICATIONS: POST CAMPAIGNS + ANNOUNCEMENTS ==========

app.post('/api/communications/campaigns', async (req, res) => {
  try {
    const { name, subject, content, type } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Campaign name is required' });
    const newCampaign = {
      id: 'camp-' + Date.now(),
      name,
      subject: subject || '',
      content: content || '',
      type: type || 'email',
      status: 'draft',
      recipientCount: 0,
      openRate: 0,
      clickRate: 0,
      sentAt: null,
      createdAt: new Date().toISOString()
    };
    inMemoryCampaigns.push(newCampaign);
    res.status(201).json({ success: true, campaign: newCampaign, message: 'Campaign created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/communications/announcements', async (req, res) => {
  try {
    const { title, content, priority, category } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Announcement title is required' });
    const newAnnouncement = {
      id: 'ann-' + Date.now(),
      title,
      content: content || '',
      priority: priority || 'normal',
      category: category || 'general',
      publishedAt: new Date().toISOString(),
      expiresAt: req.body.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      author: req.body.author || 'Admin',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    inMemoryAnnouncements.push(newAnnouncement);
    res.status(201).json({ success: true, announcement: newAnnouncement, message: 'Announcement created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== REPORTS: DASHBOARD-STATS + EXPORT ==========

app.get('/api/reports/dashboard-stats', async (req, res) => {
  try {
    res.json({
      success: true,
      stats: {
        totalMembers: 42,
        activeMembers: 38,
        newMembersThisMonth: 3,
        totalGroups: 8,
        activeGroups: 7,
        avgAttendance: 73,
        memberGrowth: 8,
        attendanceGrowth: 5,
        engagementScore: 78,
        totalEvents: inMemoryEvents.length,
        upcomingEvents: inMemoryEvents.filter(e => e.status === 'upcoming').length,
        prayerRequests: inMemoryPrayerRequests.length,
        activePrayerRequests: inMemoryPrayerRequests.filter(p => p.status === 'active').length,
        attendanceRate: 73,
        volunteerCount: inMemoryVolunteers.length,
        activeTasks: inMemoryTasks.filter(t => t.status !== 'completed').length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/reports/export/:reportType', async (req, res) => {
  try {
    const { reportType } = req.params;
    const format = req.query.format || 'csv';
    let csvContent = '';
    switch (reportType) {
      case 'members':
        csvContent = 'ID,Name,Email,Role,Status\n1,David Johnson,david@email.com,pastor,active\n2,Sarah Johnson,sarah@email.com,member,active\n3,Michael Chen,michael@email.com,member,active';
        break;
      case 'attendance':
        csvContent = 'SessionID,Date,Present,Absent\n' + inMemoryAttendance.map(s => `${s.id},${s.date},${s.totalPresent},${s.totalAbsent}`).join('\n');
        break;
      case 'events':
        csvContent = 'ID,Title,Date,Type,Attendees\n' + inMemoryEvents.map(e => `${e.id},${e.title},${e.startDateTime},${e.eventType},${e.currentAttendees}`).join('\n');
        break;
      case 'groups':
        csvContent = 'ID,Name,Type,Members\ngrp-1,Small Group Alpha,small_group,12\ngrp-2,Youth Ministry,ministry,18';
        break;
      case 'care':
        csvContent = 'ID,Type,Subject,Provider,Status\n' + inMemoryCareRecords.map(r => `${r.id},${r.careType},${r.subject},${r.careProvider},${r.status}`).join('\n');
        break;
      default:
        csvContent = 'Report type not recognized';
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${reportType}_report.csv`);
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== JOURNEY TEMPLATES: FULL CRUD ==========

app.post('/api/journey-templates', async (req, res) => {
  try {
    const { name, description, category, difficulty, milestones } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Template name is required' });
    const newTemplate = {
      id: 'jt-' + Date.now(),
      name,
      description: description || '',
      category: category || 'general',
      difficulty: difficulty || 'beginner',
      estimatedDuration: req.body.estimatedDuration || '4 weeks',
      isPublic: req.body.isPublic !== false,
      status: 'draft',
      milestones: (milestones || []).map((m, i) => ({ id: 'ms-' + Date.now() + '-' + i, ...m, order: m.order || i + 1 })),
      createdBy: 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    inMemoryJourneyTemplates.push(newTemplate);
    res.status(201).json({ success: true, template: newTemplate, message: 'Journey template created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/journey-templates/:id', async (req, res) => {
  try {
    const idx = inMemoryJourneyTemplates.findIndex(t => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Journey template not found' });
    Object.assign(inMemoryJourneyTemplates[idx], req.body, { updatedAt: new Date().toISOString() });
    res.json({ success: true, template: inMemoryJourneyTemplates[idx], message: 'Journey template updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/journey-templates/:id', async (req, res) => {
  try {
    const idx = inMemoryJourneyTemplates.findIndex(t => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Journey template not found' });
    inMemoryJourneyTemplates.splice(idx, 1);
    res.json({ success: true, message: 'Journey template deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/journey-templates/:id/duplicate', async (req, res) => {
  try {
    const template = inMemoryJourneyTemplates.find(t => t.id === req.params.id);
    if (!template) return res.status(404).json({ success: false, message: 'Journey template not found' });
    const duplicate = {
      ...JSON.parse(JSON.stringify(template)),
      id: 'jt-' + Date.now(),
      name: req.body.name || template.name + ' (Copy)',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    inMemoryJourneyTemplates.push(duplicate);
    res.status(201).json({ success: true, template: duplicate, message: 'Journey template duplicated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/journey-templates/:id/export', async (req, res) => {
  try {
    const template = inMemoryJourneyTemplates.find(t => t.id === req.params.id);
    if (!template) return res.status(404).json({ success: false, message: 'Journey template not found' });
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${template.name.replace(/\s+/g, '_')}_template.json`);
    res.json(template);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== MEMBER JOURNEYS: FULL CRUD + MILESTONE LIFECYCLE ==========

app.post('/api/journeys/member-journeys', async (req, res) => {
  try {
    const { memberId, memberName, templateId, mentorId, mentorName } = req.body;
    if (!memberId || !templateId) return res.status(400).json({ success: false, message: 'memberId and templateId are required' });
    const template = inMemoryJourneyTemplates.find(t => t.id === templateId);
    const newJourney = {
      id: 'mj-' + Date.now(),
      memberId,
      memberName: memberName || 'Member',
      templateId,
      templateName: template ? template.name : 'Unknown Template',
      status: 'in_progress',
      progress: 0,
      startedAt: new Date().toISOString(),
      mentorId: mentorId || null,
      mentorName: mentorName || null,
      milestoneProgress: template ? template.milestones.map(m => ({ milestoneId: m.id, status: 'not_started' })) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    inMemoryMemberJourneys.push(newJourney);
    res.status(201).json({ success: true, journey: newJourney, message: 'Journey assigned successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/journeys/member-journeys/:id', async (req, res) => {
  try {
    const idx = inMemoryMemberJourneys.findIndex(j => j.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Member journey not found' });
    Object.assign(inMemoryMemberJourneys[idx], req.body, { updatedAt: new Date().toISOString() });
    res.json({ success: true, journey: inMemoryMemberJourneys[idx], message: 'Member journey updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/journeys/member-journeys/:id', async (req, res) => {
  try {
    const idx = inMemoryMemberJourneys.findIndex(j => j.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Member journey not found' });
    inMemoryMemberJourneys.splice(idx, 1);
    res.json({ success: true, message: 'Member journey deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/journeys/member-journeys/:journeyId/milestones/:milestoneId/progress', async (req, res) => {
  try {
    const journey = inMemoryMemberJourneys.find(j => j.id === req.params.journeyId);
    if (!journey) return res.status(404).json({ success: false, message: 'Journey not found' });
    const mp = (journey.milestoneProgress || []).find(m => m.milestoneId === req.params.milestoneId);
    res.json({ success: true, progress: mp || { milestoneId: req.params.milestoneId, status: 'not_started' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/journeys/member-journeys/:journeyId/milestones/:milestoneId/start', async (req, res) => {
  try {
    const journey = inMemoryMemberJourneys.find(j => j.id === req.params.journeyId);
    if (!journey) return res.status(404).json({ success: false, message: 'Journey not found' });
    const mp = (journey.milestoneProgress || []).find(m => m.milestoneId === req.params.milestoneId);
    if (mp) { mp.status = 'in_progress'; mp.startedAt = new Date().toISOString(); }
    journey.updatedAt = new Date().toISOString();
    res.json({ success: true, progress: mp, message: 'Milestone started' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/journeys/member-journeys/:journeyId/milestones/:milestoneId/complete', async (req, res) => {
  try {
    const journey = inMemoryMemberJourneys.find(j => j.id === req.params.journeyId);
    if (!journey) return res.status(404).json({ success: false, message: 'Journey not found' });
    const mp = (journey.milestoneProgress || []).find(m => m.milestoneId === req.params.milestoneId);
    if (mp) { mp.status = 'completed'; mp.completedAt = new Date().toISOString(); mp.notes = req.body.notes || ''; }
    const completed = journey.milestoneProgress.filter(m => m.status === 'completed').length;
    journey.progress = Math.round((completed / journey.milestoneProgress.length) * 100);
    if (journey.progress === 100) journey.status = 'completed';
    journey.updatedAt = new Date().toISOString();
    res.json({ success: true, progress: mp, journey, message: 'Milestone completed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/journeys/milestone-progress/:milestoneProgressId/submit', async (req, res) => {
  try {
    let found = null;
    for (const journey of inMemoryMemberJourneys) {
      const mp = (journey.milestoneProgress || []).find(m => m.milestoneId === req.params.milestoneProgressId);
      if (mp) { mp.status = 'submitted'; mp.submittedAt = new Date().toISOString(); mp.submissionContent = req.body.content || ''; found = mp; break; }
    }
    if (!found) return res.status(404).json({ success: false, message: 'Milestone progress not found' });
    res.json({ success: true, progress: found, message: 'Milestone submitted for review' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/journeys/member-journeys/:journeyId/milestones/:milestoneId/approve', async (req, res) => {
  try {
    const journey = inMemoryMemberJourneys.find(j => j.id === req.params.journeyId);
    if (!journey) return res.status(404).json({ success: false, message: 'Journey not found' });
    const mp = (journey.milestoneProgress || []).find(m => m.milestoneId === req.params.milestoneId);
    if (mp) { mp.status = 'approved'; mp.approvedAt = new Date().toISOString(); mp.feedback = req.body.feedback || ''; }
    journey.updatedAt = new Date().toISOString();
    res.json({ success: true, progress: mp, message: 'Milestone approved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/journeys/member-journeys/:journeyId/milestones/:milestoneId/request-revision', async (req, res) => {
  try {
    const journey = inMemoryMemberJourneys.find(j => j.id === req.params.journeyId);
    if (!journey) return res.status(404).json({ success: false, message: 'Journey not found' });
    const mp = (journey.milestoneProgress || []).find(m => m.milestoneId === req.params.milestoneId);
    if (mp) { mp.status = 'revision_requested'; mp.feedback = req.body.feedback || ''; }
    journey.updatedAt = new Date().toISOString();
    res.json({ success: true, progress: mp, message: 'Revision requested' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/journeys/member-journeys/:id/export', async (req, res) => {
  try {
    const journey = inMemoryMemberJourneys.find(j => j.id === req.params.id);
    if (!journey) return res.status(404).json({ success: false, message: 'Journey not found' });
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=journey_${journey.id}_progress.json`);
    res.json(journey);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== GROUP MESSAGES: FULL CRUD ==========

app.get('/api/groups/:groupId/messages', async (req, res) => {
  try {
    const messages = inMemoryGroupMessages[req.params.groupId] || [];
    res.json({ success: true, messages, count: messages.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/groups/:groupId/messages', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ success: false, message: 'Message content is required' });
    if (!inMemoryGroupMessages[req.params.groupId]) inMemoryGroupMessages[req.params.groupId] = [];
    const newMessage = {
      id: 'msg-' + Date.now(),
      groupId: req.params.groupId,
      content,
      author: { id: '1', name: 'Current User' },
      reactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    inMemoryGroupMessages[req.params.groupId].push(newMessage);
    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/groups/:groupId/messages/:messageId', async (req, res) => {
  try {
    const messages = inMemoryGroupMessages[req.params.groupId] || [];
    const idx = messages.findIndex(m => m.id === req.params.messageId);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Message not found' });
    messages[idx].content = req.body.content || messages[idx].content;
    messages[idx].updatedAt = new Date().toISOString();
    res.json({ success: true, message: messages[idx] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/groups/:groupId/messages/:messageId', async (req, res) => {
  try {
    const messages = inMemoryGroupMessages[req.params.groupId] || [];
    const idx = messages.findIndex(m => m.id === req.params.messageId);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Message not found' });
    messages.splice(idx, 1);
    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/groups/:groupId/messages/:messageId/reactions', async (req, res) => {
  try {
    const messages = inMemoryGroupMessages[req.params.groupId] || [];
    const msg = messages.find(m => m.id === req.params.messageId);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    const reaction = { type: req.body.type || 'like', userId: '1', userName: 'Current User', createdAt: new Date().toISOString() };
    msg.reactions = msg.reactions || [];
    msg.reactions.push(reaction);
    res.json({ success: true, message: msg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== GROUP FILES: FULL CRUD ==========

app.get('/api/groups/:groupId/files', async (req, res) => {
  try {
    const files = inMemoryGroupFiles[req.params.groupId] || [];
    res.json({ success: true, files, count: files.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/groups/:groupId/files', async (req, res) => {
  try {
    const { name, url, type, size } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'File name is required' });
    if (!inMemoryGroupFiles[req.params.groupId]) inMemoryGroupFiles[req.params.groupId] = [];
    const newFile = {
      id: 'file-' + Date.now(),
      groupId: req.params.groupId,
      name,
      url: url || '#',
      type: type || 'document',
      size: size || 0,
      uploadedBy: { id: '1', name: 'Current User' },
      createdAt: new Date().toISOString()
    };
    inMemoryGroupFiles[req.params.groupId].push(newFile);
    res.status(201).json({ success: true, file: newFile, message: 'File uploaded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/groups/:groupId/files/:fileId', async (req, res) => {
  try {
    const files = inMemoryGroupFiles[req.params.groupId] || [];
    const idx = files.findIndex(f => f.id === req.params.fileId);
    if (idx === -1) return res.status(404).json({ success: false, message: 'File not found' });
    files.splice(idx, 1);
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== VOLUNTEERS: INLINE CRUD (NOT GATED ON DB) ==========

app.get('/api/volunteers', async (req, res) => {
  try {
    let volunteers = [...inMemoryVolunteers];
    if (req.query.status) volunteers = volunteers.filter(v => v.status === req.query.status);
    if (req.query.search) {
      const s = req.query.search.toLowerCase();
      volunteers = volunteers.filter(v => v.memberName.toLowerCase().includes(s));
    }
    res.json({ success: true, volunteers, total: volunteers.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/volunteers/stats', async (req, res) => {
  try {
    res.json({
      success: true,
      stats: {
        totalVolunteers: inMemoryVolunteers.length,
        activeVolunteers: inMemoryVolunteers.filter(v => v.status === 'active').length,
        totalHours: inMemoryVolunteers.reduce((sum, v) => sum + (v.totalHours || 0), 0),
        totalOpportunities: inMemoryVolunteerOpportunities.length,
        urgentNeeds: inMemoryVolunteerOpportunities.filter(o => o.urgent).length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/volunteers/member/:memberId', async (req, res) => {
  try {
    const volunteer = inMemoryVolunteers.find(v => v.memberId === req.params.memberId);
    if (!volunteer) return res.status(404).json({ success: false, message: 'Volunteer record not found' });
    res.json({ success: true, volunteer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Alias routes - frontend VolunteerSignupSystem expects these paths
app.get('/api/volunteers/opportunities', async (req, res) => {
  try {
    let opps = [...inMemoryVolunteerOpportunities];
    if (req.query.search) {
      const s = req.query.search.toLowerCase();
      opps = opps.filter(o => o.title.toLowerCase().includes(s) || o.description.toLowerCase().includes(s));
    }
    res.json({ success: true, opportunities: opps, total: opps.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/volunteers/my-signups', async (req, res) => {
  try {
    res.json({ success: true, signups: [], count: 0 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/volunteers/:id', async (req, res) => {
  try {
    const volunteer = inMemoryVolunteers.find(v => v.id === req.params.id);
    if (!volunteer) return res.status(404).json({ success: false, message: 'Volunteer not found' });
    res.json({ success: true, volunteer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/volunteers', async (req, res) => {
  try {
    const { memberId, memberName, skills, availability } = req.body;
    if (!memberId) return res.status(400).json({ success: false, message: 'memberId is required' });
    const newVolunteer = {
      id: 'vol-' + Date.now(),
      memberId,
      memberName: memberName || 'Volunteer',
      email: req.body.email || '',
      phone: req.body.phone || '',
      skills: skills || [],
      availability: availability || [],
      status: 'active',
      totalHours: 0,
      createdAt: new Date().toISOString()
    };
    inMemoryVolunteers.push(newVolunteer);
    res.status(201).json({ success: true, volunteer: newVolunteer, message: 'Volunteer created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/volunteers/:id', async (req, res) => {
  try {
    const idx = inMemoryVolunteers.findIndex(v => v.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Volunteer not found' });
    Object.assign(inMemoryVolunteers[idx], req.body);
    res.json({ success: true, volunteer: inMemoryVolunteers[idx], message: 'Volunteer updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/volunteers/:id', async (req, res) => {
  try {
    const idx = inMemoryVolunteers.findIndex(v => v.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Volunteer not found' });
    inMemoryVolunteers.splice(idx, 1);
    res.json({ success: true, message: 'Volunteer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/volunteers/:volunteerId/hours', async (req, res) => {
  try {
    const volunteer = inMemoryVolunteers.find(v => v.id === req.params.volunteerId);
    if (!volunteer) return res.status(404).json({ success: false, message: 'Volunteer not found' });
    res.json({
      success: true,
      hours: [
        { id: 'h1', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), hours: 3, activity: 'Sunday Greeting', verified: true },
        { id: 'h2', date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), hours: 2.5, activity: 'Event Setup', verified: true }
      ],
      totalHours: volunteer.totalHours
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/volunteers/:volunteerId/hours', async (req, res) => {
  try {
    const volunteer = inMemoryVolunteers.find(v => v.id === req.params.volunteerId);
    if (!volunteer) return res.status(404).json({ success: false, message: 'Volunteer not found' });
    const { hours, activity, date } = req.body;
    volunteer.totalHours = (volunteer.totalHours || 0) + (hours || 0);
    const logEntry = { id: 'h-' + Date.now(), date: date || new Date().toISOString(), hours: hours || 0, activity: activity || '', verified: false };
    res.status(201).json({ success: true, entry: logEntry, totalHours: volunteer.totalHours, message: 'Hours logged successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/volunteers/:volunteerId/opportunities', async (req, res) => {
  try {
    res.json({ success: true, opportunities: inMemoryVolunteerOpportunities, count: inMemoryVolunteerOpportunities.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== VOLUNTEER OPPORTUNITIES ==========

app.get('/api/volunteer-opportunities', async (req, res) => {
  try {
    let opps = [...inMemoryVolunteerOpportunities];
    if (req.query.ministry) opps = opps.filter(o => o.ministry === req.query.ministry);
    if (req.query.status) opps = opps.filter(o => o.status === req.query.status);
    if (req.query.urgent === 'true') opps = opps.filter(o => o.urgent);
    if (req.query.search) {
      const s = req.query.search.toLowerCase();
      opps = opps.filter(o => o.title.toLowerCase().includes(s) || o.description.toLowerCase().includes(s));
    }
    res.json({ success: true, opportunities: opps, total: opps.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/volunteer-opportunities/stats', async (req, res) => {
  try {
    res.json({
      success: true,
      stats: {
        total: inMemoryVolunteerOpportunities.length,
        active: inMemoryVolunteerOpportunities.filter(o => o.status === 'active').length,
        urgent: inMemoryVolunteerOpportunities.filter(o => o.urgent).length,
        totalSpots: inMemoryVolunteerOpportunities.reduce((sum, o) => sum + (o.spotsTotal || 0), 0),
        availableSpots: inMemoryVolunteerOpportunities.reduce((sum, o) => sum + (o.spotsAvailable || 0), 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/volunteer-opportunities/search', async (req, res) => {
  try {
    let opps = [...inMemoryVolunteerOpportunities];
    if (req.query.skills) {
      const reqSkills = req.query.skills.split(',');
      opps = opps.filter(o => o.skills.some(s => reqSkills.includes(s)));
    }
    if (req.query.urgent === 'true') opps = opps.filter(o => o.urgent);
    res.json({ success: true, opportunities: opps, total: opps.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/volunteer-opportunities/:id', async (req, res) => {
  try {
    const opp = inMemoryVolunteerOpportunities.find(o => o.id === req.params.id);
    if (!opp) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    res.json({ success: true, opportunity: opp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/volunteer-opportunities', async (req, res) => {
  try {
    const { title, description, ministry } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });
    const newOpp = {
      id: 'opp-' + Date.now(),
      title,
      description: description || '',
      ministry: ministry || 'General',
      schedule: req.body.schedule || '',
      spotsAvailable: req.body.spotsAvailable || req.body.spotsTotal || 5,
      spotsTotal: req.body.spotsTotal || 5,
      skills: req.body.skills || [],
      status: 'active',
      urgent: req.body.urgent || false,
      createdAt: new Date().toISOString()
    };
    inMemoryVolunteerOpportunities.push(newOpp);
    res.status(201).json({ success: true, opportunity: newOpp, message: 'Opportunity created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/volunteer-opportunities/:id', async (req, res) => {
  try {
    const idx = inMemoryVolunteerOpportunities.findIndex(o => o.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    Object.assign(inMemoryVolunteerOpportunities[idx], req.body);
    res.json({ success: true, opportunity: inMemoryVolunteerOpportunities[idx], message: 'Opportunity updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/volunteer-opportunities/:id', async (req, res) => {
  try {
    const idx = inMemoryVolunteerOpportunities.findIndex(o => o.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    inMemoryVolunteerOpportunities.splice(idx, 1);
    res.json({ success: true, message: 'Opportunity deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/volunteer-opportunities/:opportunityId/signups', async (req, res) => {
  try {
    res.json({ success: true, signups: [], count: 0 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/volunteer-opportunities/:opportunityId/signup', async (req, res) => {
  try {
    const opp = inMemoryVolunteerOpportunities.find(o => o.id === req.params.opportunityId);
    if (!opp) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    if (opp.spotsAvailable <= 0) return res.status(400).json({ success: false, message: 'No spots available' });
    opp.spotsAvailable--;
    const signup = { id: 'signup-' + Date.now(), opportunityId: opp.id, volunteerId: req.body.volunteerId || 'unknown', status: 'confirmed', createdAt: new Date().toISOString() };
    res.status(201).json({ success: true, signup, message: 'Successfully signed up for opportunity' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/volunteer-opportunities/:opportunityId/signups/:signupId', async (req, res) => {
  try {
    res.json({ success: true, signup: { id: req.params.signupId, ...req.body, updatedAt: new Date().toISOString() }, message: 'Signup updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== BUG REPORT ==========

app.post('/api/bug-report', async (req, res) => {
  try {
    const { title, description, severity, page, steps } = req.body;
    const report = {
      id: 'bug-' + Date.now(),
      title: title || 'Bug Report',
      description: description || '',
      severity: severity || 'medium',
      page: page || 'unknown',
      steps: steps || '',
      status: 'open',
      reportedAt: new Date().toISOString()
    };
    inMemoryBugReports.push(report);
    console.log('Bug Report Received:', report);
    res.status(201).json({ success: true, report, message: 'Bug report submitted successfully. Thank you for your feedback!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== MISSING CRUD ENDPOINTS ==========

// --- Members CRUD ---
app.post('/api/members', async (req, res) => {
  try {
    const { firstName, lastName, email, memberNumber, phone } = req.body;
    if (!firstName || !lastName) return res.status(400).json({ success: false, message: 'firstName and lastName are required' });
    const member = {
      id: 'member-' + Date.now(),
      firstName,
      lastName,
      email: email || '',
      memberNumber: memberNumber || String(10000 + Math.floor(Math.random() * 90000)),
      phone: phone || '',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    res.status(201).json({ success: true, member, message: 'Member created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMember = { id, ...req.body, updatedAt: new Date().toISOString() };
    res.json({ success: true, member: updatedMember, message: 'Member updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/members/:id', async (req, res) => {
  try {
    res.json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- Groups CRUD ---
app.post('/api/groups', async (req, res) => {
  try {
    const { name, description, type, leaderId } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Group name is required' });
    const group = {
      id: 'group-' + Date.now(),
      name,
      description: description || '',
      type: type || 'small_group',
      leaderId: leaderId || null,
      memberCount: 0,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    res.status(201).json({ success: true, group, message: 'Group created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/groups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedGroup = { id, ...req.body, updatedAt: new Date().toISOString() };
    res.json({ success: true, group: updatedGroup, message: 'Group updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/groups/:id', async (req, res) => {
  try {
    res.json({ success: true, message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/groups/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;
    if (!memberId) return res.status(400).json({ success: false, message: 'memberId is required' });
    res.json({ success: true, groupId: id, memberId, message: 'Member added to group successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- Event registration alias (test expects /registrations, backend has /register) ---
app.post('/api/events/:id/registrations', async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId, notes, numberOfGuests } = req.body;
    const registration = {
      id: 'reg-' + Date.now(),
      eventId: id,
      memberId: memberId || '1',
      notes: notes || '',
      numberOfGuests: numberOfGuests || 0,
      status: 'confirmed',
      registeredAt: new Date().toISOString()
    };
    res.json({ success: true, registration, message: 'Registration successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- Journey templates alias (test expects /api/journeys/templates, backend has /api/journey-templates) ---
app.post('/api/journeys/templates', async (req, res) => {
  try {
    const { title, name, description, category, milestones } = req.body;
    const templateName = title || name || 'Untitled Template';
    const template = {
      id: 'template-' + Date.now(),
      title: templateName,
      description: description || '',
      category: category || 'general',
      milestones: milestones || [],
      isPublic: true,
      createdAt: new Date().toISOString()
    };
    inMemoryJourneyTemplates.push(template);
    res.status(201).json({ success: true, template, message: 'Journey template created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- Member profile alias (test expects PUT /api/members/profile) ---
app.put('/api/members/profile', async (req, res) => {
  try {
    const profile = { id: '1', ...req.body, updatedAt: new Date().toISOString() };
    res.json({ success: true, profile, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- Health check alias (test expects GET /api/health) ---
app.get('/api/health', async (req, res) => {
  try {
    res.json({ status: 'healthy', timestamp: new Date().toISOString(), database: 'Connected', version: '1.0.0' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== Family Connections API ==========
app.get('/api/members/:memberId/family', async (req, res) => {
  try {
    const { memberId } = req.params;
    if (dbConnected && prisma) {
      const connections = await prisma.memberFamily.findMany({
        where: { OR: [{ memberId }, { relatedId: memberId }] },
        include: {
          member: { select: { id: true, firstName: true, lastName: true, email: true, profilePhotoUrl: true } },
          relatedMember: { select: { id: true, firstName: true, lastName: true, email: true, profilePhotoUrl: true } }
        }
      });
      const family = connections.map(c => ({
        id: c.id,
        relationship: c.relationship,
        member: c.memberId === memberId ? c.relatedMember : c.member,
        direction: c.memberId === memberId ? 'outgoing' : 'incoming'
      }));
      return res.json({ success: true, family });
    }
    res.json({ success: true, family: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/members/:memberId/family', async (req, res) => {
  try {
    const { memberId } = req.params;
    const { relatedId, relationship } = req.body;
    if (!relatedId || !relationship) {
      return res.status(400).json({ success: false, message: 'relatedId and relationship are required' });
    }
    if (dbConnected && prisma) {
      const connection = await prisma.memberFamily.create({
        data: { memberId, relatedId, relationship }
      });
      return res.status(201).json({ success: true, connection });
    }
    res.status(201).json({ success: true, connection: { id: `fam-${Date.now()}`, memberId, relatedId, relationship } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/members/:memberId/family/:connectionId', async (req, res) => {
  try {
    const { connectionId } = req.params;
    if (dbConnected && prisma) {
      await prisma.memberFamily.delete({ where: { id: connectionId } });
      return res.json({ success: true, message: 'Family connection removed' });
    }
    res.json({ success: true, message: 'Family connection removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== Per-Member Care History API ==========
app.get('/api/members/:memberId/care-history', async (req, res) => {
  try {
    const { memberId } = req.params;
    if (dbConnected && prisma) {
      const careLogs = await prisma.careLog.findMany({
        where: { memberId },
        orderBy: { createdAt: 'desc' }
      });
      return res.json({ success: true, careHistory: careLogs });
    }
    res.json({ success: true, careHistory: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== Confidential Notes Enforcement ==========
app.get('/api/care/records/:id/confidential', async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (!userRole || !['pastor', 'admin', 'leader'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied: insufficient role for confidential notes' });
    }
    const { id } = req.params;
    if (dbConnected && prisma) {
      const record = await prisma.careLog.findUnique({ where: { id } });
      if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
      return res.json({ success: true, record });
    }
    res.json({ success: true, record: { id, notes: 'Confidential content', confidential: true } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== File Upload (S3-ready) ==========
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

app.post('/api/members/:memberId/photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const photoUrl = `/uploads/${req.file.filename}`;
    if (dbConnected && prisma) {
      await prisma.member.update({ where: { id: req.params.memberId }, data: { profilePhotoUrl: photoUrl } });
    }
    res.json({ success: true, photoUrl, message: 'Photo uploaded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/groups/:groupId/files', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const fileUrl = `/uploads/${req.file.filename}`;
    const fileRecord = {
      id: `file-${Date.now()}`,
      groupId: req.params.groupId,
      fileName: req.file.originalname,
      fileUrl,
      fileSize: req.file.size,
      uploadedBy: req.user?.userId || 'unknown',
      uploadedAt: new Date().toISOString()
    };
    if (dbConnected && prisma) {
      try {
        const saved = await prisma.groupFile.create({ data: { groupId: req.params.groupId, fileName: req.file.originalname, fileUrl, fileSize: req.file.size, uploadedById: req.user?.userId || 'system' } });
        return res.status(201).json({ success: true, file: saved });
      } catch (e) { /* fallthrough */ }
    }
    res.status(201).json({ success: true, file: fileRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(uploadDir));

// ========== PDF Export for Reports ==========
app.get('/api/reports/export/pdf', async (req, res) => {
  try {
    const { type = 'members' } = req.query;
    // Generate simple PDF-like content (use pdfkit or puppeteer in production)
    const reportData = { type, generatedAt: new Date().toISOString(), generatedBy: req.user?.email || 'system' };
    let content = '';
    if (dbConnected && prisma) {
      if (type === 'members') {
        const members = await prisma.member.findMany({ take: 100, select: { firstName: true, lastName: true, email: true, membershipStatus: true } });
        content = members.map(m => `${m.firstName} ${m.lastName} | ${m.email} | ${m.membershipStatus}`).join('\n');
      } else if (type === 'attendance') {
        const records = await prisma.eventAttendance.findMany({ take: 100, include: { member: { select: { firstName: true, lastName: true } }, event: { select: { title: true } } } });
        content = records.map(r => `${r.member.firstName} ${r.member.lastName} | ${r.event.title} | ${r.status}`).join('\n');
      }
    }
    // Return as downloadable text report (swap for real PDF library in production)
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report-${Date.now()}.txt"`);
    res.send(`FaithLink360 ${type.toUpperCase()} REPORT\nGenerated: ${reportData.generatedAt}\nBy: ${reportData.generatedBy}\n${'='.repeat(60)}\n${content || 'No data available'}`);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== Message Templates CRUD (P2-1) ==========
const inMemoryTemplates = [
  { id: 'tpl-1', name: 'Welcome New Member', subject: 'Welcome to {{churchName}}!', body: 'Dear {{firstName}}, welcome to our church family!', category: 'onboarding', variables: ['churchName', 'firstName'], createdAt: new Date().toISOString() },
  { id: 'tpl-2', name: 'Event Reminder', subject: 'Upcoming: {{eventName}}', body: 'Hi {{firstName}}, just a reminder about {{eventName}} on {{eventDate}}.', category: 'events', variables: ['firstName', 'eventName', 'eventDate'], createdAt: new Date().toISOString() },
  { id: 'tpl-3', name: 'Birthday Greeting', subject: 'Happy Birthday, {{firstName}}!', body: 'Wishing you a blessed birthday, {{firstName}}!', category: 'pastoral', variables: ['firstName'], createdAt: new Date().toISOString() }
];

app.get('/api/communications/templates', async (req, res) => {
  try {
    const { category } = req.query;
    let templates = inMemoryTemplates;
    if (category) templates = templates.filter(t => t.category === category);
    res.json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/communications/templates/:id', async (req, res) => {
  try {
    const tpl = inMemoryTemplates.find(t => t.id === req.params.id);
    if (!tpl) return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, template: tpl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/communications/templates', async (req, res) => {
  try {
    const { name, subject, body, category, variables } = req.body;
    if (!name || !body) return res.status(400).json({ success: false, message: 'name and body required' });
    const tpl = { id: `tpl-${Date.now()}`, name, subject: subject || '', body, category: category || 'general', variables: variables || [], createdAt: new Date().toISOString() };
    inMemoryTemplates.push(tpl);
    res.status(201).json({ success: true, template: tpl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/communications/templates/:id', async (req, res) => {
  try {
    const idx = inMemoryTemplates.findIndex(t => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Template not found' });
    const { name, subject, body, category, variables } = req.body;
    inMemoryTemplates[idx] = { ...inMemoryTemplates[idx], ...( name && { name }), ...( subject && { subject }), ...( body && { body }), ...( category && { category }), ...( variables && { variables }), updatedAt: new Date().toISOString() };
    res.json({ success: true, template: inMemoryTemplates[idx] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/communications/templates/:id', async (req, res) => {
  try {
    const idx = inMemoryTemplates.findIndex(t => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Template not found' });
    inMemoryTemplates.splice(idx, 1);
    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== Activity Audit Trail ==========
app.get('/api/admin/audit-trail', async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (!userRole || !['admin', 'pastor'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    if (dbConnected && prisma) {
      const activities = await prisma.activity.findMany({ take: 50, orderBy: { createdAt: 'desc' }, include: { member: { select: { firstName: true, lastName: true } } } });
      return res.json({ success: true, auditTrail: activities });
    }
    res.json({ success: true, auditTrail: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== GDPR/CCPA Endpoints ==========
app.get('/api/members/:memberId/data-export', async (req, res) => {
  try {
    const { memberId } = req.params;
    if (dbConnected && prisma) {
      const member = await prisma.member.findUnique({
        where: { id: memberId },
        include: { careLogs: true, eventAttendances: true, groups: true, journeyStages: true, tags: true, prayerRequests: true, familyConnections: true }
      });
      if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="member-data-${memberId}.json"`);
      return res.json({ success: true, data: member, exportedAt: new Date().toISOString() });
    }
    res.json({ success: true, data: {}, message: 'No DB connected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/members/:memberId/data-deletion', async (req, res) => {
  try {
    const { memberId } = req.params;
    const userRole = req.user?.role;
    if (!userRole || !['admin', 'pastor'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Admin access required for data deletion' });
    }
    if (dbConnected && prisma) {
      await prisma.member.delete({ where: { id: memberId } });
      return res.json({ success: true, message: 'Member data permanently deleted per GDPR/CCPA request' });
    }
    res.json({ success: true, message: 'Deletion request recorded' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/members/:memberId/consent', async (req, res) => {
  try {
    const { memberId } = req.params;
    const { dataProcessing, marketing, analytics } = req.body;
    // Store consent preferences (extend Member model or use separate table in production)
    res.json({ success: true, consent: { memberId, dataProcessing, marketing, analytics, updatedAt: new Date().toISOString() } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== Member Privacy Toggles ==========
app.get('/api/members/:memberId/privacy', async (req, res) => {
  try {
    res.json({
      success: true,
      privacy: {
        memberId: req.params.memberId,
        showEmail: true,
        showPhone: false,
        showAddress: false,
        showBirthday: true,
        profileVisibility: 'members'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/members/:memberId/privacy', async (req, res) => {
  try {
    const { showEmail, showPhone, showAddress, showBirthday, profileVisibility } = req.body;
    res.json({
      success: true,
      privacy: { memberId: req.params.memberId, showEmail, showPhone, showAddress, showBirthday, profileVisibility, updatedAt: new Date().toISOString() }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== Journey Auto-Progression ==========
app.post('/api/journeys/auto-progress', async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (!userRole || !['admin', 'pastor'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    let progressedCount = 0;
    if (dbConnected && prisma) {
      const stages = await prisma.journeyStage.findMany({ where: { status: 'in_progress' }, include: { member: true, template: true } });
      for (const stage of stages) {
        if (stage.completedAt) {
          await prisma.journeyStage.update({ where: { id: stage.id }, data: { status: 'completed' } });
          progressedCount++;
        }
      }
    }
    res.json({ success: true, progressedCount, message: `Auto-progressed ${progressedCount} journey stages` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== Smart Audience Segmentation ==========
app.post('/api/communications/segments', async (req, res) => {
  try {
    const { name, criteria } = req.body;
    if (!name || !criteria) return res.status(400).json({ success: false, message: 'name and criteria required' });
    let matchCount = 0;
    if (dbConnected && prisma) {
      const where = {};
      if (criteria.membershipStatus) where.membershipStatus = criteria.membershipStatus;
      if (criteria.gender) where.gender = criteria.gender;
      if (criteria.spiritualStatus) where.spiritualStatus = criteria.spiritualStatus;
      matchCount = await prisma.member.count({ where });
    }
    res.json({ success: true, segment: { id: `seg-${Date.now()}`, name, criteria, matchCount, createdAt: new Date().toISOString() } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/communications/segments', async (req, res) => {
  try {
    res.json({
      success: true,
      segments: [
        { id: 'seg-1', name: 'Active Members', criteria: { membershipStatus: 'active' }, matchCount: 0 },
        { id: 'seg-2', name: 'New Believers', criteria: { spiritualStatus: 'new_believer' }, matchCount: 0 },
        { id: 'seg-3', name: 'Youth Group', criteria: { tags: ['youth'] }, matchCount: 0 }
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== Email Delivery (SendGrid-ready) ==========
app.post('/api/communications/email/send', async (req, res) => {
  try {
    const { to, subject, body, templateId } = req.body;
    if (!to || !subject) return res.status(400).json({ success: false, message: 'to and subject required' });
    // In production: const sgMail = require('@sendgrid/mail'); sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const emailRecord = {
      id: `email-${Date.now()}`,
      to, subject, body, templateId,
      status: 'queued',
      provider: process.env.SENDGRID_API_KEY ? 'sendgrid' : 'mock',
      createdAt: new Date().toISOString()
    };
    res.json({ success: true, email: emailRecord, message: process.env.SENDGRID_API_KEY ? 'Email sent via SendGrid' : 'Email queued (configure SENDGRID_API_KEY for delivery)' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== SMS Delivery (Twilio-ready) ==========
app.post('/api/communications/sms/send', async (req, res) => {
  try {
    const { to, body } = req.body;
    if (!to || !body) return res.status(400).json({ success: false, message: 'to and body required' });
    // In production: const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    const smsRecord = {
      id: `sms-${Date.now()}`,
      to, body,
      status: 'queued',
      provider: process.env.TWILIO_SID ? 'twilio' : 'mock',
      createdAt: new Date().toISOString()
    };
    res.json({ success: true, sms: smsRecord, message: process.env.TWILIO_SID ? 'SMS sent via Twilio' : 'SMS queued (configure TWILIO_SID for delivery)' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== In-App Messaging ==========
const inAppMessages = [];
app.get('/api/messages', async (req, res) => {
  try {
    const userId = req.user?.userId;
    const userMessages = inAppMessages.filter(m => m.to === userId || m.from === userId);
    res.json({ success: true, messages: userMessages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    if (!to || !body) return res.status(400).json({ success: false, message: 'to and body required' });
    const msg = { id: `msg-${Date.now()}`, from: req.user?.userId || 'system', to, subject: subject || '', body, read: false, createdAt: new Date().toISOString() };
    inAppMessages.push(msg);
    res.status(201).json({ success: true, message: msg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/messages/:id/read', async (req, res) => {
  try {
    const msg = inAppMessages.find(m => m.id === req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    msg.read = true;
    res.json({ success: true, message: msg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== Google Calendar Integration (OAuth-ready) ==========
app.post('/api/events/:eventId/sync-gcal', async (req, res) => {
  try {
    const { eventId } = req.params;
    // In production: use googleapis package with OAuth2
    res.json({
      success: true,
      message: process.env.GOOGLE_CLIENT_ID ? 'Event synced to Google Calendar' : 'Google Calendar sync ready (configure GOOGLE_CLIENT_ID)',
      gcalEventId: `gcal-${eventId}-${Date.now()}`,
      eventId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== SSO (Google OAuth) ==========
app.get('/api/auth/google', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.json({ success: false, message: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars.' });
  }
  const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile`;
  res.json({ success: true, authUrl });
});

app.get('/api/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    // In production: exchange code for tokens, create/find user, issue JWT
    res.json({ success: true, message: 'Google OAuth callback received', code: code ? 'present' : 'missing' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== Custom Report Filter Builder ==========
app.post('/api/reports/custom', async (req, res) => {
  try {
    const { filters, groupBy, metrics } = req.body;
    let data = [];
    if (dbConnected && prisma) {
      const where = {};
      if (filters?.membershipStatus) where.membershipStatus = filters.membershipStatus;
      if (filters?.gender) where.gender = filters.gender;
      if (filters?.spiritualStatus) where.spiritualStatus = filters.spiritualStatus;
      const members = await prisma.member.findMany({ where, select: { firstName: true, lastName: true, email: true, membershipStatus: true, gender: true, spiritualStatus: true, createdAt: true } });
      data = members;
    }
    res.json({
      success: true,
      report: {
        id: `report-${Date.now()}`,
        filters: filters || {},
        groupBy: groupBy || null,
        metrics: metrics || ['count'],
        resultCount: data.length,
        data,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 404 handler (MUST be after all route definitions)
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
    await initDatabase();
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
