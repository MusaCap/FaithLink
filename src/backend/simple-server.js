const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'FaithLink360 API',
    version: '1.0.0'
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'FaithLink360 API is running!',
    timestamp: new Date().toISOString()
  });
});

// Mock Groups API
app.get('/api/groups', (req, res) => {
  res.json({
    groups: [
      {
        id: 'group-1',
        name: 'Youth Group',
        description: 'Weekly youth fellowship',
        type: 'youth',
        status: 'active',
        memberCount: 15,
        maxCapacity: 20,
        maxMembers: 20,
        memberIds: ['member-1', 'member-3', 'member-4', 'member-5', 'member-6'],
        leaderName: 'John Smith',
        leader: {
          id: 'member-1',
          name: 'John Smith'
        }
      },
      {
        id: 'group-2', 
        name: 'Bible Study',
        description: 'Weekly Bible study group',
        type: 'bible_study',
        status: 'active',
        memberCount: 8,
        maxCapacity: 12,
        maxMembers: 12,
        memberIds: ['member-2', 'member-7', 'member-8'],
        leaderName: 'Sarah Johnson',
        leader: {
          id: 'member-2',
          name: 'Sarah Johnson'
        }
      }
    ],
    total: 2,
    page: 1,
    limit: 10
  });
});

// Mock Journey Templates API
app.get('/api/journeys/templates', (req, res) => {
  res.json({
    templates: [
      {
        id: 'template-1',
        name: 'New Member Journey',
        description: 'Journey for new church members',
        category: 'onboarding',
        difficulty: 'beginner',
        estimatedDuration: 30,
        milestones: [
          {
            id: 'milestone-1',
            title: 'Welcome Session',
            description: 'Attend the welcome session',
            order: 1,
            requiredForCompletion: true
          }
        ]
      }
    ],
    total: 1,
    page: 1,
    limit: 10
  });
});

// Mock Attendance API
app.get('/api/attendance', (req, res) => {
  res.json({
    sessions: [
      {
        id: 'session-1',
        groupId: 'group-1',
        date: new Date().toISOString(),
        attendees: [
          {
            memberId: 'member-1',
            status: 'present',
            name: 'John Smith'
          },
          {
            memberId: 'member-2',
            status: 'absent',
            name: 'Sarah Johnson'
          }
        ]
      }
    ],
    total: 1,
    page: 1,
    limit: 10
  });
});

// Mock Authentication API
const demoUsers = [
  {
    id: 'user-1',
    email: 'admin@faithlink.com',
    password: 'password123',
    role: 'ADMIN',
    member: {
      id: 'member-1',
      firstName: 'Admin',
      lastName: 'User',
      profilePhotoUrl: null
    }
  },
  {
    id: 'user-2',
    email: 'pastor@faithlink.com',
    password: 'password123',
    role: 'PASTOR',
    member: {
      id: 'member-2',
      firstName: 'Pastor',
      lastName: 'John',
      profilePhotoUrl: null
    }
  },
  {
    id: 'user-3',
    email: 'leader@faithlink.com',
    password: 'password123',
    role: 'GROUP_LEADER',
    member: {
      id: 'member-3',
      firstName: 'Sarah',
      lastName: 'Johnson',
      profilePhotoUrl: null
    }
  },
  {
    id: 'user-4',
    email: 'member@faithlink.com',
    password: 'password123',
    role: 'MEMBER',
    member: {
      id: 'member-4',
      firstName: 'John',
      lastName: 'Doe',
      profilePhotoUrl: null
    }
  }
];

// Mock JWT token (in real app, use proper JWT)
function generateMockToken(user) {
  return `mock_token_${user.id}_${Date.now()}`;
}

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required',
      timestamp: new Date().toISOString()
    });
  }

  // Find user by email
  const user = demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user || user.password !== password) {
    return res.status(401).json({
      error: 'Invalid credentials',
      timestamp: new Date().toISOString()
    });
  }

  // Generate mock token
  const accessToken = generateMockToken(user);

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        member: user.member
      },
      accessToken: accessToken
    },
    message: 'Login successful',
    timestamp: new Date().toISOString()
  });
});

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName, role = 'MEMBER' } = req.body;
  
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      error: 'All fields are required',
      timestamp: new Date().toISOString()
    });
  }

  // Check if user already exists
  const existingUser = demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(409).json({
      error: 'User already exists',
      message: 'An account with this email address already exists',
      timestamp: new Date().toISOString()
    });
  }

  // Create new user (in real app, save to database)
  const newUser = {
    id: `user-${Date.now()}`,
    email: email.toLowerCase(),
    password,
    role,
    member: {
      id: `member-${Date.now()}`,
      firstName,
      lastName,
      profilePhotoUrl: null
    }
  };

  demoUsers.push(newUser);

  const accessToken = generateMockToken(newUser);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        member: newUser.member
      },
      accessToken: accessToken
    },
    message: 'Account created successfully',
    timestamp: new Date().toISOString()
  });
});

// GET /api/auth/me
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Access token required',
      timestamp: new Date().toISOString()
    });
  }

  const token = authHeader.substring(7);
  
  // For demo purposes, accept any token format and return admin user
  // In real app, verify JWT and extract user info
  let user = demoUsers[0]; // Default to admin user
  
  // Try to extract user ID from mock token format
  const tokenParts = token.split('_');
  if (tokenParts.length >= 3 && tokenParts[0] === 'mock' && tokenParts[1] === 'token') {
    const userId = tokenParts[2];
    const foundUser = demoUsers.find(u => u.id === userId);
    if (foundUser) {
      user = foundUser;
    }
  }
  
  if (!user) {
    return res.status(401).json({
      error: 'User not found',
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: true,
        createdAt: new Date().toISOString(),
        member: user.member
      }
    },
    timestamp: new Date().toISOString()
  });
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 FaithLink360 API server running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  /health`);
  console.log(`   GET  /api/test`);
  console.log(`   GET  /api/groups`);
  console.log(`   GET  /api/journeys/templates`);
  console.log(`   GET  /api/attendance`);
  console.log(`   GET  /journeys/member-journeys`);
  console.log(`   GET  /api/dashboard/stats`);
  console.log(`   GET  /api/events`);
  console.log(`   GET  /api/members`);
  console.log(`   POST /api/auth/login`);
  console.log(`   POST /api/auth/register`);
  console.log(`   GET  /api/auth/me`);
  console.log(`   POST /api/auth/logout`);
  console.log(``);
  console.log(`🔐 Demo Login Accounts:`);
  console.log(`   admin@faithlink.com / password123 (Admin)`);
  console.log(`   pastor@faithlink.com / password123 (Pastor)`);
  console.log(`   leader@faithlink.com / password123 (Group Leader)`);
  console.log(`   member@faithlink.com / password123 (Member)`);
});

// Mock Member Journeys API
app.get('/journeys/member-journeys', (req, res) => {
  res.json({
    journeys: [
      {
        id: 'journey-1',
        templateId: 'template-1',
        memberId: 'member-1',
        title: 'New Member Journey',
        status: 'in_progress',
        progress: 65,
        startedAt: new Date().toISOString(),
        completedAt: null,
        milestones: [
          { id: 'milestone-1', title: 'Welcome', status: 'completed' },
          { id: 'milestone-2', title: 'First Steps', status: 'in_progress' },
          { id: 'milestone-3', title: 'Getting Involved', status: 'not_started' }
        ]
      }
    ],
    total: 1,
    page: 1,
    limit: 10
  });
});

// Mock Dashboard Statistics API
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    totalMembers: 42,
    activeGroups: 8,
    ongoingJourneys: 15,
    upcomingEvents: 3,
    recentActivity: [
      { type: 'member_joined', message: 'New member Sarah joined Youth Group', timestamp: new Date().toISOString() },
      { type: 'journey_completed', message: 'John completed Leadership Training', timestamp: new Date().toISOString() }
    ]
  });
});

// Mock Events API
app.get('/api/events', (req, res) => {
  res.json({
    events: [
      {
        id: 'event-1',
        title: 'Sunday Service',
        description: 'Weekly worship service',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Main Sanctuary',
        attendees: 120
      }
    ],
    total: 1,
    page: 1,
    limit: 10
  });
});

// Mock Members API
app.get('/api/members', (req, res) => {
  res.json({
    members: [
      {
        id: 'member-1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@example.com',
        role: 'member',
        status: 'active'
      },
      {
        id: 'member-2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@example.com',
        role: 'group_leader',
        status: 'active'
      }
    ],
    total: 2,
    page: 1,
    limit: 10
  });
});

// 404 handler - must be AFTER all routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});
