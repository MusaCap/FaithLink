const express = require('express');
const cors = require('cors');
const productionSeed = require('./data/production-seed.js');
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Explicitly bind to all interfaces

console.log('🔧 Starting FaithLink360 Backend with Enhanced Logging...');
console.log(`📡 Target: http://localhost:${PORT}`);
console.log(`🌐 Binding to: ${HOST}:${PORT}`);

// Enhanced error handling
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection:', reason);
});

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Enhanced logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health endpoint with database check
app.get('/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'FaithLink360 Backend (Fixed)',
    version: '1.0.0',
    port: PORT,
    environment: 'development',
    uptime: process.uptime(),
    database: {
      connected: true,
      type: 'SQLite (Mock)',
      status: 'operational'
    }
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('🧪 Test endpoint requested');
  res.status(200).json({
    message: 'Backend API is working correctly',
    timestamp: new Date().toISOString(),
    server: 'Fixed Backend'
  });
});

// Members API endpoints (comprehensive CRUD matching frontend expectations)
app.get('/api/members', (req, res) => {
  console.log('👥 Members list endpoint requested');
  const { page = 1, limit = 10, search, status = 'active', sortBy = 'firstName', sortOrder = 'asc' } = req.query;
  
  const mockMembers = [
    {
      id: 'member-1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@faithlink.org',
      phone: '(555) 123-4567',
      address: '123 Main St, Anytown, ST 12345',
      birthDate: '1985-06-15',
      membershipDate: '2023-01-15',
      status: 'active',
      membershipType: 'ADULT',
      emergencyContact: {
        name: 'Jane Smith',
        phone: '(555) 987-6543',
        relationship: 'Spouse'
      },
      groups: [
        { id: 'group-1', name: 'Men\'s Bible Study', role: 'MEMBER' }
      ],
      journeys: [
        { id: 'journey-1', templateTitle: 'New Member Journey', status: 'IN_PROGRESS', progress: 65 }
      ],
      createdAt: '2023-01-15T10:00:00Z',
      updatedAt: '2025-01-20T10:00:00Z'
    },
    {
      id: 'member-2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@faithlink.org',
      phone: '(555) 234-5678',
      address: '456 Oak Ave, Anytown, ST 12345',
      birthDate: '1990-03-22',
      membershipDate: '2023-03-20',
      status: 'active',
      membershipType: 'ADULT',
      emergencyContact: {
        name: 'Mike Johnson',
        phone: '(555) 876-5432',
        relationship: 'Spouse'
      },
      groups: [
        { id: 'group-2', name: 'Ladies Prayer Group', role: 'CO_LEADER' }
      ],
      journeys: [
        { id: 'journey-2', templateTitle: 'Leadership Development', status: 'COMPLETED', progress: 100 }
      ],
      createdAt: '2023-03-20T10:00:00Z',
      updatedAt: '2025-01-20T10:00:00Z'
    },
    {
      id: 'member-3',
      firstName: 'Michael',
      lastName: 'Wilson',
      email: 'mike@faithlink.org',
      phone: '(555) 345-6789',
      address: '789 Pine St, Anytown, ST 12345',
      birthDate: '1978-11-08',
      membershipDate: '2022-08-10',
      status: 'active',
      membershipType: 'ADULT',
      emergencyContact: {
        name: 'Lisa Wilson',
        phone: '(555) 765-4321',
        relationship: 'Spouse'
      },
      groups: [
        { id: 'group-1', name: 'Men\'s Bible Study', role: 'MEMBER' },
        { id: 'group-3', name: 'Worship Team', role: 'LEADER' }
      ],
      journeys: [],
      createdAt: '2022-08-10T10:00:00Z',
      updatedAt: '2025-01-20T10:00:00Z'
    }
  ];

  // Filter members based on search and status
  let filteredMembers = mockMembers;
  if (search) {
    const searchLower = search.toLowerCase();
    filteredMembers = filteredMembers.filter(member => 
      member.firstName.toLowerCase().includes(searchLower) || 
      member.lastName.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower)
    );
  }
  if (status && status !== 'all') {
    filteredMembers = filteredMembers.filter(member => member.status === status);
  }

  // Sort members
  filteredMembers.sort((a, b) => {
    const aValue = a[sortBy] || '';
    const bValue = b[sortBy] || '';
    const comparison = aValue.localeCompare(bValue);
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const total = filteredMembers.length;
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + parseInt(limit));

  res.status(200).json({
    members: paginatedMembers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  });
});

app.get('/api/members/:id', (req, res) => {
  console.log(`👤 Single member ${req.params.id} endpoint requested`);
  
  const mockMember = {
    id: req.params.id,
    firstName: 'John',
    lastName: 'Smith',
    email: 'john@faithlink.org',
    phone: '(555) 123-4567',
    address: '123 Main St, Anytown, ST 12345',
    birthDate: '1985-06-15',
    membershipDate: '2023-01-15',
    status: 'active',
    membershipType: 'ADULT',
    emergencyContact: {
      name: 'Jane Smith',
      phone: '(555) 987-6543',
      relationship: 'Spouse'
    },
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      newsletter: true
    },
    groups: [
      {
        id: 'group-1',
        name: 'Men\'s Bible Study',
        role: 'MEMBER',
        joinedAt: '2023-02-01T10:00:00Z'
      }
    ],
    journeys: [
      {
        id: 'journey-1',
        templateId: 'template-1',
        templateTitle: 'New Member Journey',
        status: 'IN_PROGRESS',
        progress: 65,
        startedAt: '2023-01-20T10:00:00Z'
      }
    ],
    attendance: {
      totalSessions: 45,
      attendedSessions: 38,
      attendanceRate: 84.4
    },
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2025-01-20T10:00:00Z'
  };

  res.status(200).json(mockMember);
});

app.post('/api/members', (req, res) => {
  console.log('📝 Create member endpoint requested');
  const memberData = req.body;
  
  const newMember = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',
    membershipType: 'ADULT',
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      newsletter: true
    },
    groups: [],
    journeys: [],
    ...memberData
  };

  res.status(201).json(newMember);
});

app.put('/api/members/:id', (req, res) => {
  console.log(`✏️ Update member ${req.params.id} endpoint requested`);
  const updateData = req.body;
  
  const updatedMember = {
    id: req.params.id,
    updatedAt: new Date().toISOString(),
    ...updateData
  };

  res.status(200).json(updatedMember);
});

app.delete('/api/members/:id', (req, res) => {
  console.log(`🗑️ Delete member ${req.params.id} endpoint requested`);
  
  res.status(200).json({
    message: 'Member deleted successfully',
    memberId: req.params.id
  });
});

app.get('/api/members/stats', (req, res) => {
  console.log('📊 Member stats endpoint requested');
  
  const mockStats = {
    totalMembers: 250,
    activeMembers: 235,
    inactiveMembers: 15,
    newThisMonth: 12,
    membershipTypes: {
      ADULT: 180,
      YOUTH: 45,
      CHILD: 25
    },
    ageGroups: {
      '0-17': 25,
      '18-35': 75,
      '36-55': 95,
      '56+': 55
    },
    growthTrend: [
      { month: 'Oct', count: 238 },
      { month: 'Nov', count: 242 },
      { month: 'Dec', count: 245 },
      { month: 'Jan', count: 250 }
    ]
  };

  res.status(200).json(mockStats);
});

app.get('/api/groups', (req, res) => {
  console.log('👨‍👩‍👧‍👦 Groups endpoint requested');
  res.status(200).json({
    groups: [
      { id: '1', name: 'Youth Group', memberCount: 15 },
      { id: '2', name: 'Bible Study', memberCount: 8 }
    ],
    total: 2
  });
});

app.get('/api/groups/:id', (req, res) => {
  console.log(`👥 Group ${req.params.id} endpoint requested`);
  res.status(200).json({
    id: req.params.id,
    name: 'Youth Group',
    description: 'A group for young adults',
    memberCount: 15,
    leaderId: '1',
    meetingTime: 'Sundays 6:00 PM'
  });
});

app.post('/api/groups', (req, res) => {
  console.log('📝 Create group endpoint requested');
  res.status(201).json({
    id: '3',
    name: req.body.name || 'New Group',
    description: req.body.description || 'A new group',
    memberCount: 0,
    leaderId: req.body.leaderId || '1'
  });
});

app.put('/api/groups/:id', (req, res) => {
  console.log(`✏️ Update group ${req.params.id} endpoint requested`);
  res.status(200).json({
    id: req.params.id,
    name: req.body.name || 'Updated Group',
    description: req.body.description || 'Updated description',
    memberCount: req.body.memberCount || 15,
    leaderId: req.body.leaderId || '1'
  });
});

app.delete('/api/groups/:id', (req, res) => {
  console.log(`🗑️ Delete group ${req.params.id} endpoint requested`);
  res.status(200).json({ success: true, message: 'Group deleted successfully' });
});

app.get('/api/groups/:id/members', (req, res) => {
  console.log(`👥 Group ${req.params.id} members endpoint requested`);
  res.status(200).json([
    { id: '1', firstName: 'John', lastName: 'Smith', role: 'member' },
    { id: '2', firstName: 'Sarah', lastName: 'Johnson', role: 'co_leader' }
  ]);
});

app.post('/api/groups/:id/members', (req, res) => {
  console.log(`➕ Add member to group ${req.params.id} endpoint requested`);
  res.status(201).json({
    id: req.body.memberId,
    firstName: 'New',
    lastName: 'Member',
    role: req.body.role || 'member'
  });
});

app.get('/api/events', (req, res) => {
  console.log('📅 Events list endpoint requested');
  const { page = 1, limit = 10, type, upcoming, search, startDate, endDate } = req.query;
  
  const mockEvents = [
    {
      id: 'event-1',
      title: 'Sunday Morning Service',
      description: 'Weekly worship service with sermon and communion',
      type: 'SERVICE',
      startDate: '2025-01-26T10:00:00Z',
      endDate: '2025-01-26T11:30:00Z',
      location: 'Main Sanctuary',
      capacity: 300,
      registrationCount: 45,
      requiresRegistration: false,
      organizerId: 'user-1',
      organizer: {
        id: 'user-1',
        name: 'Pastor David',
        email: 'pastor@faithlink.org'
      },
      tags: ['worship', 'weekly'],
      status: 'SCHEDULED',
      createdAt: '2025-01-01T10:00:00Z',
      updatedAt: '2025-01-20T10:00:00Z'
    },
    {
      id: 'event-2',
      title: 'Community Outreach Day',
      description: 'Serving meals at the local shelter and community cleanup',
      type: 'OUTREACH',
      startDate: '2025-01-28T09:00:00Z',
      endDate: '2025-01-28T15:00:00Z',
      location: 'Downtown Community Center',
      capacity: 50,
      registrationCount: 32,
      requiresRegistration: true,
      organizerId: 'user-2',
      organizer: {
        id: 'user-2',
        name: 'Sarah Johnson',
        email: 'sarah@faithlink.org'
      },
      tags: ['outreach', 'community', 'service'],
      status: 'SCHEDULED',
      createdAt: '2025-01-05T10:00:00Z',
      updatedAt: '2025-01-20T10:00:00Z'
    },
    {
      id: 'event-3',
      title: 'Youth Group Pizza Night',
      description: 'Fun fellowship time with games, pizza, and Bible study',
      type: 'FELLOWSHIP',
      startDate: '2025-01-31T18:00:00Z',
      endDate: '2025-01-31T21:00:00Z',
      location: 'Youth Center',
      capacity: 30,
      registrationCount: 24,
      requiresRegistration: true,
      organizerId: 'user-3',
      organizer: {
        id: 'user-3',
        name: 'Tommy Rodriguez',
        email: 'tommy@faithlink.org'
      },
      tags: ['youth', 'fellowship', 'pizza'],
      status: 'SCHEDULED',
      createdAt: '2025-01-10T10:00:00Z',
      updatedAt: '2025-01-20T10:00:00Z'
    },
    {
      id: 'event-4',
      title: 'Marriage Enrichment Retreat',
      description: 'Weekend retreat for married couples focusing on strengthening relationships',
      type: 'RETREAT',
      startDate: '2025-02-14T18:00:00Z',
      endDate: '2025-02-16T12:00:00Z',
      location: 'Mountain View Retreat Center',
      capacity: 20,
      registrationCount: 16,
      requiresRegistration: true,
      organizerId: 'user-1',
      organizer: {
        id: 'user-1',
        name: 'Pastor David',
        email: 'pastor@faithlink.org'
      },
      tags: ['marriage', 'retreat', 'couples'],
      status: 'SCHEDULED',
      createdAt: '2024-12-15T10:00:00Z',
      updatedAt: '2025-01-20T10:00:00Z'
    }
  ];

  // Filter events
  let filteredEvents = mockEvents;
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredEvents = filteredEvents.filter(event => 
      event.title.toLowerCase().includes(searchLower) || 
      event.description.toLowerCase().includes(searchLower)
    );
  }
  
  if (type && type !== 'all') {
    filteredEvents = filteredEvents.filter(event => event.type === type);
  }
  
  if (upcoming === 'true') {
    const now = new Date();
    filteredEvents = filteredEvents.filter(event => new Date(event.startDate) > now);
  }
  
  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : new Date('1970-01-01');
    const end = endDate ? new Date(endDate) : new Date('2030-12-31');
    filteredEvents = filteredEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate >= start && eventDate <= end;
    });
  }

  // Sort by date
  filteredEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  const total = filteredEvents.length;
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + parseInt(limit));

  res.status(200).json({
    events: paginatedEvents,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  });
});

app.get('/api/events/:id', (req, res) => {
  console.log(`📅 Single event ${req.params.id} requested`);
  
  const mockEvent = {
    id: req.params.id,
    title: 'Sunday Morning Service',
    description: 'Weekly worship service with sermon and communion',
    type: 'SERVICE',
    startDate: '2025-01-26T10:00:00Z',
    endDate: '2025-01-26T11:30:00Z',
    location: 'Main Sanctuary',
    capacity: 300,
    registrationCount: 45,
    requiresRegistration: false,
    organizerId: 'user-1',
    organizer: {
      id: 'user-1',
      name: 'Pastor David',
      email: 'pastor@faithlink.org',
      phone: '(555) 123-0000'
    },
    tags: ['worship', 'weekly'],
    status: 'SCHEDULED',
    registrations: [
      {
        id: 'reg-1',
        attendeeName: 'John Smith',
        email: 'john@faithlink.org',
        phone: '(555) 123-4567',
        attendeeCount: 2,
        specialRequests: 'Wheelchair access needed',
        registeredAt: '2025-01-20T10:00:00Z',
        status: 'CONFIRMED'
      },
      {
        id: 'reg-2',
        attendeeName: 'Sarah Johnson',
        email: 'sarah@faithlink.org',
        phone: '(555) 234-5678',
        attendeeCount: 1,
        specialRequests: '',
        registeredAt: '2025-01-21T14:30:00Z',
        status: 'CONFIRMED'
      }
    ],
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-20T10:00:00Z'
  };

  res.status(200).json(mockEvent);
});

app.post('/api/events', (req, res) => {
  console.log('📅 Create event endpoint requested');
  const eventData = req.body;
  
  const newEvent = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'SCHEDULED',
    registrationCount: 0,
    registrations: [],
    ...eventData
  };

  res.status(201).json(newEvent);
});

app.put('/api/events/:id', (req, res) => {
  console.log(`📅 Update event ${req.params.id} requested`);
  const updateData = req.body;
  
  const updatedEvent = {
    id: req.params.id,
    updatedAt: new Date().toISOString(),
    ...updateData
  };

  res.status(200).json(updatedEvent);
});

app.delete('/api/events/:id', (req, res) => {
  console.log(`📅 Delete event ${req.params.id} requested`);
  
  res.status(200).json({
    message: 'Event deleted successfully',
    eventId: req.params.id
  });
});

// Reports API endpoints (replacing mock data with live API integration)
app.get('/api/reports/attendance', (req, res) => {
  console.log('📊 Reports - Attendance analytics endpoint requested');
  const { range = 'month', service = 'all' } = req.query;
  
  const mockAttendanceData = [
    { date: '2025-01-05', service: 'Sunday Morning', expected: 280, actual: 245, percentage: 87.5 },
    { date: '2025-01-05', service: 'Sunday Evening', expected: 150, actual: 128, percentage: 85.3 },
    { date: '2025-01-12', service: 'Sunday Morning', expected: 280, actual: 268, percentage: 95.7 },
    { date: '2025-01-12', service: 'Sunday Evening', expected: 150, actual: 142, percentage: 94.7 },
    { date: '2025-01-19', service: 'Sunday Morning', expected: 280, actual: 251, percentage: 89.6 },
    { date: '2025-01-19', service: 'Sunday Evening', expected: 150, actual: 135, percentage: 90.0 },
    { date: '2025-01-26', service: 'Sunday Morning', expected: 280, actual: 275, percentage: 98.2 },
    { date: '2025-01-26', service: 'Sunday Evening', expected: 150, actual: 148, percentage: 98.7 }
  ];

  const mockTrends = [
    { period: 'This Month', average: 92.1, change: 5.3, trend: 'up' },
    { period: 'Last Month', average: 86.8, change: -2.1, trend: 'down' },
    { period: 'Last Quarter', average: 88.9, change: 1.2, trend: 'up' },
    { period: 'Year to Date', average: 87.4, change: 3.8, trend: 'up' }
  ];

  // Filter by service if specified
  let filteredData = mockAttendanceData;
  if (service !== 'all') {
    filteredData = mockAttendanceData.filter(item => item.service === service);
  }

  res.status(200).json({
    attendance: filteredData,
    trends: mockTrends,
    summary: {
      averageAttendance: filteredData.reduce((sum, item) => sum + item.percentage, 0) / filteredData.length,
      totalServices: filteredData.length,
      highestAttendance: Math.max(...filteredData.map(item => item.percentage)),
      lowestAttendance: Math.min(...filteredData.map(item => item.percentage))
    }
  });
});

app.get('/api/reports/engagement', (req, res) => {
  console.log('📈 Reports - Member engagement metrics endpoint requested');
  const { range = 'month' } = req.query;
  
  const mockEngagementData = {
    memberActivity: [
      { memberId: 'member-1', name: 'John Smith', totalActivities: 15, attendanceRate: 92, groupParticipation: 3, volunteerHours: 8 },
      { memberId: 'member-2', name: 'Sarah Johnson', totalActivities: 22, attendanceRate: 96, groupParticipation: 2, volunteerHours: 12 },
      { memberId: 'member-3', name: 'Michael Wilson', totalActivities: 18, attendanceRate: 88, groupParticipation: 4, volunteerHours: 15 }
    ],
    engagementTrends: [
      { week: 'Week 1', activeMembers: 180, newEngagements: 12, totalInteractions: 450 },
      { week: 'Week 2', activeMembers: 185, newEngagements: 15, totalInteractions: 480 },
      { week: 'Week 3', activeMembers: 192, newEngagements: 8, totalInteractions: 520 },
      { week: 'Week 4', activeMembers: 198, newEngagements: 18, totalInteractions: 550 }
    ],
    metrics: {
      totalActiveMembers: 198,
      engagementScore: 78.5,
      averageActivitiesPerMember: 4.2,
      memberRetentionRate: 94.3
    },
    categories: [
      { category: 'Worship Services', engagement: 85, members: 235 },
      { category: 'Small Groups', engagement: 62, members: 148 },
      { category: 'Volunteer Activities', engagement: 45, members: 95 },
      { category: 'Events & Fellowship', engagement: 71, members: 165 }
    ]
  };

  res.status(200).json(mockEngagementData);
});

// Missing self-service endpoints
app.get('/api/members/self-service/groups', (req, res) => {
  console.log('👥 Member self-service groups endpoint requested');
  
  const mockGroups = [
    {
      id: 'group-1',
      name: 'Men\'s Bible Study',
      description: 'Weekly Bible study for men',
      memberRole: 'MEMBER',
      joinedAt: '2023-02-01T10:00:00Z',
      nextMeeting: '2025-01-25T19:00:00Z',
      location: 'Conference Room A'
    },
    {
      id: 'group-2',
      name: 'Worship Team',
      description: 'Sunday worship music ministry',
      memberRole: 'LEADER',
      joinedAt: '2022-06-15T10:00:00Z',
      nextMeeting: '2025-01-24T18:00:00Z',
      location: 'Sanctuary'
    }
  ];
  
  res.status(200).json({ groups: mockGroups });
});

app.get('/api/members/self-service/events', (req, res) => {
  console.log('📅 Member self-service events endpoint requested');
  
  const mockEvents = [
    {
      id: 'event-1',
      title: 'Community Outreach Day',
      date: '2025-01-28T09:00:00Z',
      location: 'Downtown Community Center',
      registrationStatus: 'REGISTERED',
      registeredAt: '2025-01-20T14:30:00Z'
    },
    {
      id: 'event-2',
      title: 'Youth Group Pizza Night',
      date: '2025-01-31T18:00:00Z',
      location: 'Youth Center',
      registrationStatus: 'NOT_REGISTERED',
      registeredAt: null
    }
  ];
  
  res.status(200).json({ events: mockEvents });
});

// Missing volunteer signups endpoint
app.get('/api/volunteers/signups', (req, res) => {
  console.log('🤝 Volunteer signups endpoint requested');
  
  const mockSignups = [
    {
      id: 'signup-1',
      opportunityId: 'opp-1',
      opportunityTitle: 'Sunday Service Greeter',
      signupDate: '2025-01-20T10:00:00Z',
      scheduledDate: '2025-01-26T09:00:00Z',
      status: 'CONFIRMED',
      notes: 'Looking forward to serving!'
    },
    {
      id: 'signup-2',
      opportunityId: 'opp-2',
      opportunityTitle: 'Food Bank Helper',
      signupDate: '2025-01-18T15:30:00Z',
      scheduledDate: '2025-01-25T14:00:00Z',
      status: 'PENDING',
      notes: 'Available for 3-hour shift'
    }
  ];
  
  res.status(200).json({ signups: mockSignups });
});

app.get('/api/reports/groups', (req, res) => {
  console.log('👥 Reports - Group health dashboard endpoint requested');
  const { range = 'month' } = req.query;
  
  const mockGroupHealthData = {
    groups: [
      {
        id: 'group-1',
        name: 'Men\'s Bible Study',
        memberCount: 12,
        capacity: 15,
        healthScore: 92,
        attendanceRate: 88,
        growthRate: 15,
        lastActivity: '2025-01-22T19:00:00Z',
        leader: 'Pastor Mike',
        status: 'healthy'
      },
      {
        id: 'group-2',
        name: 'Ladies Prayer Group',
        memberCount: 18,
        capacity: 20,
        healthScore: 87,
        attendanceRate: 94,
        growthRate: 8,
        lastActivity: '2025-01-21T10:00:00Z',
        leader: 'Sarah Johnson',
        status: 'healthy'
      },
      {
        id: 'group-3',
        name: 'Youth Group',
        memberCount: 25,
        capacity: 30,
        healthScore: 75,
        attendanceRate: 72,
        growthRate: -5,
        lastActivity: '2025-01-20T18:00:00Z',
        leader: 'Tommy Rodriguez',
        status: 'needs_attention'
      }
    ],
    overview: {
      totalGroups: 8,
      healthyGroups: 6,
      groupsNeedingAttention: 2,
      averageHealthScore: 84.7,
      totalMembers: 156,
      averageAttendance: 85.2
    },
    trends: [
      { month: 'Oct', healthScore: 81.2, memberCount: 145 },
      { month: 'Nov', healthScore: 82.8, memberCount: 150 },
      { month: 'Dec', healthScore: 84.1, memberCount: 153 },
      { month: 'Jan', healthScore: 84.7, memberCount: 156 }
    ]
  };

  res.status(200).json(mockGroupHealthData);
});

// Fix duplicate reports/dashboard endpoint - remove the first one and keep this comprehensive one
app.get('/api/reports/dashboard', (req, res) => {
  console.log('📊 Reports - Dashboard overview endpoint requested');
  
  const mockDashboardData = {
    quickStats: {
      totalMembers: 250,
      activeGroups: 8,
      upcomingEvents: 5,
      recentActivities: 42
    },
    recentActivity: [
      {
        id: '1',
        type: 'member_joined',
        description: 'New member Sarah Williams joined',
        timestamp: '2025-01-22T14:30:00Z',
        icon: 'user-plus'
      },
      {
        id: '2',
        type: 'event_registered',
        description: '15 members registered for Community Outreach',
        timestamp: '2025-01-22T12:15:00Z',
        icon: 'calendar'
      },
      {
        id: '3',
        type: 'group_meeting',
        description: 'Men\'s Bible Study completed session',
        timestamp: '2025-01-21T19:30:00Z',
        icon: 'users'
      }
    ],
    upcomingEvents: [
      {
        id: 'event-1',
        title: 'Sunday Morning Service',
        date: '2025-01-26T10:00:00Z',
        attendees: 45,
        location: 'Main Sanctuary'
      },
      {
        id: 'event-2',
        title: 'Community Outreach',
        date: '2025-01-28T09:00:00Z',
        attendees: 32,
        location: 'Downtown Center'
      }
    ],
    alerts: [
      {
        id: '1',
        type: 'attention',
        message: 'Youth Group attendance below average - needs attention',
        priority: 'medium',
        timestamp: '2025-01-22T08:00:00Z'
      }
    ]
  };

  res.status(200).json(mockDashboardData);
});

// Care API endpoint
app.get('/api/care', (req, res) => {
  console.log('🤲 Care logs endpoint requested');
  res.status(200).json({
    careLogs: [
      { id: '1', memberId: '1', type: 'PRAYER', notes: 'Prayer request for healing', createdAt: '2025-09-01' },
      { id: '2', memberId: '2', type: 'VISIT', notes: 'Home visit completed', createdAt: '2025-08-30' }
    ],
    total: 2
  });
});

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login endpoint requested');
  res.status(200).json({
    success: true,
    token: 'mock_jwt_token_12345',
    user: {
      id: '1',
      email: 'admin@faithlink360.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin'
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  console.log('📝 Register endpoint requested');
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: {
      id: '3',
      email: req.body.email || 'newuser@faithlink.com',
      name: req.body.name || 'New User',
      role: 'member'
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  console.log('👤 User info endpoint requested');
  res.status(200).json({
    id: '1',
    email: 'admin@faithlink.com',
    name: 'Admin User',
    role: 'admin',
    authenticated: true
  });
});

// Journeys API endpoint
app.get('/api/journeys', (req, res) => {
  console.log('🛤️ Journeys endpoint requested');
  res.status(200).json({
    journeys: [
      { id: '1', title: 'New Member Journey', status: 'active', participants: 8 },
      { id: '2', title: 'Leadership Development', status: 'completed', participants: 5 }
    ],
    total: 2
  });
});

app.get('/api/journeys/member-journeys/:id', (req, res) => {
  console.log(`📊 Journey ${req.params.id} endpoint requested`);
  const journeyId = req.params.id;
  
  // Mock data for individual journey with milestones
  const mockJourney = {
    id: journeyId,
    memberId: '1',
    memberName: 'John Smith',
    templateId: '1',
    journeyTemplateName: 'New Member Journey',
    description: 'A comprehensive journey for new church members to get connected and grow spiritually',
    progress: 60,
    status: 'in_progress',
    startedAt: '2025-09-01T00:00:00Z',
    assignedBy: 'Pastor Smith',
    mentorId: '2',
    mentorName: 'Pastor Smith',
    milestones: [
      {
        id: '1',
        title: 'Welcome & Orientation',
        description: 'Complete church orientation and meet key staff members',
        order: 1,
        status: 'completed',
        completedAt: '2025-09-02T00:00:00Z',
        submissions: [
          {
            id: '1',
            content: 'Attended orientation session and met with Pastor Smith. Very welcoming community!',
            submittedAt: '2025-09-02T00:00:00Z',
            approvedAt: '2025-09-02T10:00:00Z',
            feedback: 'Great to meet you John! Welcome to our church family.'
          }
        ]
      },
      {
        id: '2',
        title: 'Connect with a Small Group',
        description: 'Join a small group that fits your schedule and interests',
        order: 2,
        status: 'completed',
        completedAt: '2025-09-08T00:00:00Z',
        submissions: [
          {
            id: '2',
            content: 'Joined the Young Adults Bible Study group. Looking forward to building relationships!',
            submittedAt: '2025-09-08T00:00:00Z',
            approvedAt: '2025-09-08T15:00:00Z',
            feedback: 'Excellent choice! That group has amazing fellowship.'
          }
        ]
      },
      {
        id: '3',
        title: 'Discover Your Spiritual Gifts',
        description: 'Complete spiritual gifts assessment and explore serving opportunities',
        order: 3,
        status: 'in_progress',
        submissions: []
      },
      {
        id: '4',
        title: 'Find Your Serving Role',
        description: 'Begin serving in a ministry that matches your gifts and passions',
        order: 4,
        status: 'not_started',
        submissions: []
      },
      {
        id: '5',
        title: 'Establish Daily Devotions',
        description: 'Develop a consistent daily prayer and Bible reading routine',
        order: 5,
        status: 'not_started',
        submissions: []
      }
    ]
  };
  
  res.status(200).json(mockJourney);
});

app.post('/journeys/member-journeys', (req, res) => {
  console.log('📝 Create member journey endpoint requested');
  res.status(201).json({
    id: '3',
    memberId: req.body.memberId,
    templateId: req.body.templateId,
    progress: 0,
    status: 'in_progress'
  });
});

app.put('/journeys/member-journeys/:id', (req, res) => {
  console.log(`✏️ Update member journey ${req.params.id} endpoint requested`);
  res.status(200).json({
    id: req.params.id,
    ...req.body,
    updatedAt: new Date().toISOString()
  });
});

// Dashboard stats endpoint
app.get('/api/dashboard/stats', (req, res) => {
  console.log('📊 Dashboard stats endpoint requested');
  res.status(200).json({
    totalMembers: 248,
    activeGroups: 18,
    thisWeekEvents: 7,
    groupAttendance: 85
  });
});

// Communications API endpoints
app.get('/api/communications/campaigns', (req, res) => {
  console.log('📧 Email campaigns list endpoint requested');
  const mockCampaigns = [
    {
      id: '1',
      title: 'Weekly Newsletter - September',
      subject: 'This Week at FaithLink Community Church',
      content: '<div>Join us for worship this Sunday...</div>',
      status: 'sent',
      recipients: 245,
      targetGroups: ['All Members', 'Visitors'],
      sentAt: '2025-09-08T08:00:00Z',
      openRate: 72,
      clickRate: 18,
      createdBy: 'Admin User',
      createdAt: '2025-09-07T10:00:00Z'
    },
    {
      id: '2',
      title: 'Upcoming Easter Services',
      subject: 'Celebrate Easter with Us - Special Service Times',
      content: '<div>We are excited to celebrate the resurrection...</div>',
      status: 'scheduled',
      recipients: 320,
      targetGroups: ['All Members', 'Visitors', 'Community'],
      scheduledFor: '2025-09-15T07:00:00Z',
      createdBy: 'Pastor Smith',
      createdAt: '2025-09-05T14:00:00Z'
    },
    {
      id: '3',
      title: 'Youth Group Fundraiser',
      subject: 'Support Our Youth Mission Trip',
      content: '<div>Our youth group is raising funds for their summer mission...</div>',
      status: 'draft',
      recipients: 156,
      targetGroups: ['Youth Parents', 'All Members'],
      createdBy: 'Youth Pastor',
      createdAt: '2025-09-10T09:00:00Z'
    }
  ];

  res.status(200).json({
    campaigns: mockCampaigns,
    total: mockCampaigns.length
  });
});

app.post('/api/communications/campaigns', (req, res) => {
  console.log('✉️ Create email campaign endpoint requested');
  const campaignData = req.body;
  
  res.status(201).json({
    id: Date.now().toString(),
    ...campaignData,
    status: campaignData.scheduleType === 'now' ? 'sending' : 'scheduled',
    createdAt: new Date().toISOString(),
    createdBy: 'Current User'
  });
});

app.put('/api/communications/campaigns/:id', (req, res) => {
  console.log(`📝 Update email campaign ${req.params.id} endpoint requested`);
  const campaignData = req.body;
  
  res.status(200).json({
    id: req.params.id,
    ...campaignData,
    updatedAt: new Date().toISOString()
  });
});

app.delete('/api/communications/campaigns/:id', (req, res) => {
  console.log(`🗑️ Delete email campaign ${req.params.id} endpoint requested`);
  res.status(200).json({
    message: 'Campaign deleted successfully',
    id: req.params.id
  });
});

app.get('/api/communications/announcements', (req, res) => {
  console.log('📢 Announcements list endpoint requested');
  const mockAnnouncements = [
    {
      id: '1',
      title: 'Sunday Service Time Change',
      content: 'Starting October 1st, our Sunday service time will change to 10:30 AM to accommodate our growing congregation.',
      priority: 'high',
      targetAudience: ['All Members'],
      channels: ['email', 'dashboard', 'website'],
      status: 'active',
      startDate: '2025-09-10T00:00:00Z',
      endDate: '2025-10-01T00:00:00Z',
      createdBy: 'Pastor Smith',
      createdAt: '2025-09-09T10:00:00Z'
    },
    {
      id: '2',
      title: 'Building Maintenance - Parking Lot',
      content: 'The main parking lot will be resurfaced this weekend. Please use the side entrance and overflow parking.',
      priority: 'normal',
      targetAudience: ['All Members', 'Visitors'],
      channels: ['email', 'sms', 'dashboard'],
      status: 'active',
      startDate: '2025-09-12T00:00:00Z',
      endDate: '2025-09-15T00:00:00Z',
      createdBy: 'Admin User',
      createdAt: '2025-09-10T08:00:00Z'
    },
    {
      id: '3',
      title: 'New Small Group Leaders Needed',
      content: 'We are looking for dedicated members to lead new small groups starting in October. Contact Pastor David for more information.',
      priority: 'normal',
      targetAudience: ['Members'],
      channels: ['dashboard', 'website'],
      status: 'active',
      startDate: '2025-09-08T00:00:00Z',
      createdBy: 'Pastor David',
      createdAt: '2025-09-08T12:00:00Z'
    }
  ];

  res.status(200).json({
    announcements: mockAnnouncements,
    total: mockAnnouncements.length
  });
});

app.post('/api/communications/announcements', (req, res) => {
  console.log('📣 Create announcement endpoint requested');
  const announcementData = req.body;
  
  res.status(201).json({
    id: Date.now().toString(),
    ...announcementData,
    status: announcementData.scheduleType === 'now' ? 'active' : 'scheduled',
    createdAt: new Date().toISOString(),
    createdBy: 'Current User'
  });
});

app.put('/api/communications/announcements/:id', (req, res) => {
  console.log(`📝 Update announcement ${req.params.id} endpoint requested`);
  const announcementData = req.body;
  
  res.status(200).json({
    id: req.params.id,
    ...announcementData,
    updatedAt: new Date().toISOString()
  });
});

app.delete('/api/communications/announcements/:id', (req, res) => {
  console.log(`🗑️ Delete announcement ${req.params.id} endpoint requested`);
  res.status(200).json({
    message: 'Announcement deleted successfully',
    id: req.params.id
  });
});

// Care API endpoints (legacy - moved to comprehensive implementation below)

app.get('/api/care/records', (req, res) => {
  console.log('📋 Care records list endpoint requested');
  const mockCareRecords = [
    {
      id: '1',
      memberId: '1',
      memberName: 'Sarah Johnson',
      memberEmail: 'sarah@email.com',
      memberPhone: '(555) 123-4567',
      careType: 'hospital',
      subject: 'Surgery Recovery Visit',
      notes: 'Visited Sarah after her knee surgery. She is recovering well and appreciates the church support. Needs help with groceries for next 2 weeks.',
      careProvider: 'Pastor Smith',
      careDate: '2025-01-14T14:00:00Z',
      nextFollowUp: '2025-01-21T10:00:00Z',
      priority: 'high',
      status: 'completed',
      tags: ['surgery', 'recovery', 'elderly']
    },
    {
      id: '2',
      memberId: '2',
      memberName: 'Michael Chen',
      memberEmail: 'michael@email.com',
      memberPhone: '(555) 987-6543',
      careType: 'counseling',
      subject: 'Marriage Counseling Session',
      notes: 'Third session with Michael and Lisa. Making good progress on communication. Scheduled next appointment.',
      careProvider: 'Pastor David',
      careDate: '2025-01-13T16:00:00Z',
      nextFollowUp: '2025-01-20T16:00:00Z',
      priority: 'normal',
      status: 'completed',
      tags: ['marriage', 'counseling']
    },
    {
      id: '3',
      memberId: '3',
      memberName: 'Emily Rodriguez',
      memberEmail: 'emily@email.com',
      memberPhone: '(555) 456-7890',
      careType: 'call',
      subject: 'Job Loss Support Call',
      notes: 'Called Emily to check on her after recent job loss. Connected her with job search resources and financial assistance program.',
      careProvider: 'Care Team Leader',
      careDate: '2025-01-12T10:30:00Z',
      priority: 'high',
      status: 'completed',
      tags: ['job-loss', 'financial-help']
    }
  ];

  res.status(200).json({
    records: mockCareRecords,
    total: mockCareRecords.length
  });
});

app.post('/api/care/records', (req, res) => {
  console.log('📝 Create care record endpoint requested');
  const recordData = req.body;
  
  res.status(201).json({
    id: Date.now().toString(),
    ...recordData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
});

app.get('/api/care/members-needing-care', (req, res) => {
  console.log('👥 Members needing care endpoint requested');
  const mockMembersNeedingCare = [
    {
      id: '4',
      name: 'Robert Wilson',
      email: 'robert@email.com',
      phone: '(555) 111-2222',
      address: '123 Oak St, City, State',
      lastContact: '2024-12-15T00:00:00Z',
      careNeeds: ['elderly', 'homebound'],
      emergencyContact: 'Jane Wilson (555) 111-2223'
    },
    {
      id: '5',
      name: 'Maria Santos',
      email: 'maria@email.com',
      phone: '(555) 333-4444',
      address: '456 Pine Ave, City, State',
      lastContact: '2025-01-05T00:00:00Z',
      careNeeds: ['new-member', 'follow-up'],
      emergencyContact: 'Carlos Santos (555) 333-4445'
    },
    {
      id: '6',
      name: 'Thomas Baker',
      email: 'thomas@email.com',
      phone: '(555) 777-8888',
      address: '789 Elm Street, City, State',
      lastContact: '2024-11-20T00:00:00Z',
      careNeeds: ['elderly', 'transportation', 'isolated'],
      emergencyContact: 'Linda Baker (555) 777-8889'
    }
  ];

  res.status(200).json({
    members: mockMembersNeedingCare,
    total: mockMembersNeedingCare.length
  });
});

app.get('/api/care/counseling-sessions', (req, res) => {
  console.log('💬 Counseling sessions list endpoint requested');
  const mockCounselingSessions = [
    {
      id: '1',
      memberName: 'Michael and Lisa Chen',
      counselorName: 'Pastor David',
      sessionType: 'couple',
      status: 'completed',
      scheduledDate: '2025-01-13T16:00:00Z',
      duration: 60,
      location: 'Counseling Room A',
      sessionTopic: 'Marriage Counseling',
      notes: 'Good progress on communication. Scheduled follow-up.'
    },
    {
      id: '2',
      memberName: 'Jennifer Williams',
      counselorName: 'Dr. Sarah Wilson (Licensed Therapist)',
      sessionType: 'individual',
      status: 'scheduled',
      scheduledDate: '2025-01-16T14:00:00Z',
      duration: 45,
      location: 'Pastor\'s Office',
      sessionTopic: 'Grief Counseling',
      notes: 'First session for grief support after loss of spouse.'
    },
    {
      id: '3',
      memberName: 'Johnson Family',
      counselorName: 'Pastor Smith',
      sessionType: 'family',
      status: 'scheduled',
      scheduledDate: '2025-01-18T10:00:00Z',
      duration: 90,
      location: 'Conference Room',
      sessionTopic: 'Family Issues',
      notes: 'Working through teenage daughter behavioral issues.'
    }
  ];

  res.status(200).json({
    sessions: mockCounselingSessions,
    total: mockCounselingSessions.length
  });
});

app.post('/api/care/counseling-sessions', (req, res) => {
  console.log('📅 Schedule counseling session endpoint requested');
  const sessionData = req.body;
  
  res.status(201).json({
    id: Date.now().toString(),
    ...sessionData,
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
});

app.put('/api/care/counseling-sessions/:id', (req, res) => {
  console.log(`📝 Update counseling session ${req.params.id} endpoint requested`);
  const sessionData = req.body;
  
  res.status(200).json({
    id: req.params.id,
    ...sessionData,
    updatedAt: new Date().toISOString()
  });
});

app.delete('/api/care/counseling-sessions/:id', (req, res) => {
  console.log(`🗑️ Cancel counseling session ${req.params.id} endpoint requested`);
  res.status(200).json({
    message: 'Counseling session cancelled successfully',
    id: req.params.id
  });
});

// Reports API endpoints
app.get('/api/reports/dashboard-stats', (req, res) => {
  console.log('📊 Dashboard stats for reports endpoint requested');
  const { range = 'last30days' } = req.query;
  
  const mockStats = {
    totalMembers: 248,
    activeGroups: 18,
    avgAttendance: 85,
    memberGrowth: 12,
    attendanceGrowth: 8,
    engagementScore: 78
  };

  res.status(200).json({
    stats: mockStats,
    range: range
  });
});

app.get('/api/reports/attendance', (req, res) => {
  console.log('📅 Attendance analytics endpoint requested');
  const { range = 'last30days', service = 'all' } = req.query;
  
  const mockAttendanceData = [
    { date: '2025-01-05', service: 'Sunday Morning', expected: 280, actual: 245, percentage: 87.5 },
    { date: '2025-01-05', service: 'Sunday Evening', expected: 150, actual: 128, percentage: 85.3 },
    { date: '2025-01-12', service: 'Sunday Morning', expected: 280, actual: 268, percentage: 95.7 },
    { date: '2025-01-12', service: 'Sunday Evening', expected: 150, actual: 142, percentage: 94.7 },
    { date: '2025-01-19', service: 'Sunday Morning', expected: 280, actual: 251, percentage: 89.6 },
    { date: '2025-01-19', service: 'Sunday Evening', expected: 150, actual: 135, percentage: 90.0 },
    { date: '2025-01-26', service: 'Sunday Morning', expected: 280, actual: 275, percentage: 98.2 },
    { date: '2025-01-26', service: 'Sunday Evening', expected: 150, actual: 148, percentage: 98.7 }
  ];

  const mockTrends = [
    { period: 'Last Month', average: 86.8, change: -2.1, trend: 'down' },
    { period: 'Last Quarter', average: 88.9, change: 1.2, trend: 'up' },
    { period: 'Year to Date', average: 87.4, change: 3.8, trend: 'up' }
  ];

  res.status(200).json({
    attendance: mockAttendanceData,
    trends: mockTrends,
    range: range,
    service: service
  });
});

app.get('/api/reports/engagement', (req, res) => {
  console.log('📈 Member engagement metrics endpoint requested');
  const { range = 'last30days' } = req.query;
  
  const mockMetrics = [
    { metric: 'Overall Engagement Score', value: 78, change: 5.2, trend: 'up', description: 'Average engagement across all metrics' },
    { metric: 'Active Participants', value: 156, change: 8.1, trend: 'up', description: 'Members with 70%+ engagement score' },
    { metric: 'Journey Completion Rate', value: 67, change: -2.3, trend: 'down', description: 'Members completing assigned journeys' },
    { metric: 'Group Participation', value: 84, change: 3.7, trend: 'up', description: 'Members actively involved in groups' },
    { metric: 'Prayer Request Activity', value: 42, change: 12.5, trend: 'up', description: 'Members submitting/updating prayer requests' },
    { metric: 'Event Attendance Rate', value: 73, change: -1.8, trend: 'down', description: 'Average attendance at church events' }
  ];

  const mockActivities = [
    {
      memberId: '1', memberName: 'Sarah Johnson', attendanceScore: 95, participationScore: 88,
      journeyProgress: 92, prayerRequests: 3, groupInvolvement: 90, overallScore: 91, status: 'highly-engaged'
    },
    {
      memberId: '2', memberName: 'Michael Chen', attendanceScore: 82, participationScore: 75,
      journeyProgress: 78, prayerRequests: 1, groupInvolvement: 85, overallScore: 80, status: 'highly-engaged'
    },
    {
      memberId: '3', memberName: 'Emily Rodriguez', attendanceScore: 70, participationScore: 65,
      journeyProgress: 58, prayerRequests: 2, groupInvolvement: 72, overallScore: 67, status: 'moderately-engaged'
    },
    {
      memberId: '4', memberName: 'Robert Wilson', attendanceScore: 45, participationScore: 38,
      journeyProgress: 25, prayerRequests: 0, groupInvolvement: 40, overallScore: 38, status: 'low-engagement'
    },
    {
      memberId: '5', memberName: 'Maria Santos', attendanceScore: 25, participationScore: 20,
      journeyProgress: 15, prayerRequests: 0, groupInvolvement: 22, overallScore: 21, status: 'at-risk'
    }
  ];

  const mockCategories = [
    { category: 'Highly Engaged', members: 89, percentage: 36, color: 'bg-green-500' },
    { category: 'Moderately Engaged', members: 94, percentage: 38, color: 'bg-blue-500' },
    { category: 'Low Engagement', members: 48, percentage: 19, color: 'bg-yellow-500' },
    { category: 'At Risk', members: 17, percentage: 7, color: 'bg-red-500' }
  ];

  res.status(200).json({
    metrics: mockMetrics,
    activities: mockActivities,
    categories: mockCategories,
    range: range
  });
});

app.get('/api/reports/group-health', (req, res) => {
  console.log('🏥 Group health dashboard endpoint requested');
  const { range = 'last30days' } = req.query;
  
  const mockGroups = [
    {
      id: '1', name: 'Young Adults Ministry', leader: 'Pastor David', memberCount: 24, targetSize: 25,
      attendanceRate: 95, engagementScore: 92, growthRate: 15, lastMeeting: '2025-01-14T19:00:00Z',
      status: 'thriving', healthScore: 94, issues: [], 
      strengths: ['High attendance', 'Active participation', 'Growing membership']
    },
    {
      id: '2', name: 'Men\'s Fellowship', leader: 'John Smith', memberCount: 18, targetSize: 20,
      attendanceRate: 89, engagementScore: 85, growthRate: 8, lastMeeting: '2025-01-13T08:00:00Z',
      status: 'healthy', healthScore: 87, issues: ['Need new members'],
      strengths: ['Strong fellowship', 'Consistent meetings']
    },
    {
      id: '3', name: 'Ladies Bible Study', leader: 'Sarah Johnson', memberCount: 16, targetSize: 18,
      attendanceRate: 87, engagementScore: 88, growthRate: 5, lastMeeting: '2025-01-15T10:00:00Z',
      status: 'healthy', healthScore: 85, issues: [],
      strengths: ['Deep Bible study', 'Prayer support']
    },
    {
      id: '4', name: 'Youth Group', leader: 'Michael Chen', memberCount: 14, targetSize: 20,
      attendanceRate: 71, engagementScore: 68, growthRate: -2, lastMeeting: '2025-01-12T18:00:00Z',
      status: 'needs-attention', healthScore: 65, 
      issues: ['Low attendance', 'Need engaging activities', 'Member retention'],
      strengths: ['Enthusiastic core group']
    },
    {
      id: '5', name: 'Senior Saints', leader: 'Robert Wilson', memberCount: 8, targetSize: 15,
      attendanceRate: 62, engagementScore: 58, growthRate: -8, lastMeeting: '2025-01-10T14:00:00Z',
      status: 'at-risk', healthScore: 52,
      issues: ['Declining attendance', 'Transportation issues', 'Health concerns', 'Need more activities'],
      strengths: ['Strong relationships']
    }
  ];

  const mockMetrics = [
    { label: 'Average Group Size', value: 15.3, target: 18, status: 'warning', description: 'Current average size vs target' },
    { label: 'Overall Attendance Rate', value: 79, target: 85, status: 'warning', description: 'Average attendance across all groups' },
    { label: 'Groups Meeting Regularly', value: 95, target: 100, status: 'good', description: 'Percentage of groups with regular meetings' },
    { label: 'Leadership Health', value: 88, target: 90, status: 'good', description: 'Leader engagement and effectiveness' },
    { label: 'Member Retention Rate', value: 82, target: 90, status: 'warning', description: 'Members staying in groups long-term' },
    { label: 'New Member Integration', value: 76, target: 80, status: 'warning', description: 'Success rate of integrating new members' }
  ];

  res.status(200).json({
    groups: mockGroups,
    metrics: mockMetrics,
    range: range
  });
});

app.get('/api/reports/export/:reportType', (req, res) => {
  console.log(`📥 Export ${req.params.reportType} report endpoint requested`);
  const { range = 'last30days' } = req.query;
  const reportType = req.params.reportType;

  // Generate CSV content based on report type
  let csvContent = '';
  
  switch (reportType) {
    case 'attendance':
      csvContent = 'Date,Service,Expected,Actual,Percentage\n2025-01-05,Sunday Morning,280,245,87.5\n2025-01-05,Sunday Evening,150,128,85.3';
      break;
    case 'engagement':
      csvContent = 'Member Name,Attendance Score,Participation Score,Journey Progress,Overall Score,Status\nSarah Johnson,95,88,92,91,highly-engaged\nMichael Chen,82,75,78,80,highly-engaged';
      break;
    case 'groups':
      csvContent = 'Group Name,Leader,Members,Attendance Rate,Health Score,Status\nYoung Adults Ministry,Pastor David,24,95,94,thriving\nMens Fellowship,John Smith,18,89,87,healthy';
      break;
    default:
      csvContent = 'Report Type,Generated Date\n' + reportType + ',' + new Date().toISOString();
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report-${new Date().toISOString().split('T')[0]}.csv"`);
  res.status(200).send(csvContent);
});

// Settings API endpoints
app.get('/api/settings/church', (req, res) => {
  console.log('⛪ Church settings endpoint requested');
  
  const mockChurchSettings = {
    name: 'FaithLink Community Church',
    address: '123 Faith Street, Community City, CA 90210',
    phone: '(555) 123-4567',
    email: 'info@faithlinkcommunity.org',
    website: 'https://faithlinkcommunity.org',
    denomination: 'Non-denominational',
    timezone: 'America/Los_Angeles',
    language: 'en'
  };

  res.status(200).json({
    settings: mockChurchSettings
  });
});

app.put('/api/settings/church', (req, res) => {
  console.log('⛪ Update church settings endpoint requested');
  const updatedSettings = req.body;
  
  res.status(200).json({
    message: 'Church settings updated successfully',
    settings: updatedSettings
  });
});

app.get('/api/settings/users', (req, res) => {
  console.log('👥 Users management endpoint requested');
  
  const mockUsers = [
    {
      id: '1', name: 'Pastor David Miller', email: 'pastor@faithlink.org', phone: '(555) 123-4567',
      role: 'pastor', status: 'active', joinDate: '2023-01-15', lastLogin: '2025-01-19T14:30:00Z',
      groups: ['young-adults', 'leadership-team']
    },
    {
      id: '2', name: 'Sarah Johnson', email: 'sarah@faithlink.org', phone: '(555) 234-5678',
      role: 'group_leader', status: 'active', joinDate: '2023-03-20', lastLogin: '2025-01-19T10:15:00Z',
      groups: ['ladies-bible-study']
    },
    {
      id: '3', name: 'Michael Chen', email: 'michael@faithlink.org', phone: '(555) 345-6789',
      role: 'group_leader', status: 'active', joinDate: '2023-06-10', lastLogin: '2025-01-18T16:45:00Z',
      groups: ['youth-group']
    },
    {
      id: '4', name: 'Emily Rodriguez', email: 'emily@faithlink.org',
      role: 'member', status: 'active', joinDate: '2023-09-05', lastLogin: '2025-01-17T09:20:00Z'
    },
    {
      id: '5', name: 'John Smith', email: 'john@faithlink.org',
      role: 'admin', status: 'active', joinDate: '2022-11-01', lastLogin: '2025-01-19T15:00:00Z'
    }
  ];

  res.status(200).json({
    users: mockUsers
  });
});

app.post('/api/settings/users', (req, res) => {
  console.log('👤 Create user endpoint requested');
  const newUser = req.body;
  
  const createdUser = {
    id: Date.now().toString(),
    ...newUser,
    status: 'active',
    joinDate: new Date().toISOString(),
    lastLogin: null
  };

  res.status(201).json({
    message: 'User created successfully',
    user: createdUser
  });
});

app.put('/api/settings/users/:id', (req, res) => {
  console.log(`👤 Update user ${req.params.id} endpoint requested`);
  const updatedUser = req.body;
  
  res.status(200).json({
    message: 'User updated successfully',
    user: { ...updatedUser, id: req.params.id }
  });
});

app.delete('/api/settings/users/:id', (req, res) => {
  console.log(`🗑️ Delete user ${req.params.id} endpoint requested`);
  
  res.status(200).json({
    message: 'User deleted successfully',
    id: req.params.id
  });
});

app.get('/api/settings/system', (req, res) => {
  console.log('⚙️ System settings endpoint requested');
  
  const mockSystemSettings = {
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      smsNotifications: false,
      notificationFrequency: 'daily'
    },
    security: {
      requireTwoFactor: false,
      sessionTimeout: 480,
      passwordPolicy: 'medium',
      allowGuestAccess: false
    },
    integrations: {
      emailProvider: 'smtp',
      smtpConfig: {
        host: 'smtp.gmail.com',
        port: 587,
        username: '',
        password: '',
        secure: true
      },
      backupEnabled: true,
      backupFrequency: 'weekly'
    },
    appearance: {
      theme: 'light',
      primaryColor: '#3B82F6',
      logoUrl: '',
      customCss: ''
    }
  };

  res.status(200).json({
    settings: mockSystemSettings
  });
});

app.put('/api/settings/system', (req, res) => {
  console.log('⚙️ Update system settings endpoint requested');
  const updatedSettings = req.body;
  
  res.status(200).json({
    message: 'System settings updated successfully',
    settings: updatedSettings
  });
});

// Enhanced Events API endpoints
app.post('/api/events/:id/register', (req, res) => {
  console.log(`📝 Event registration for event ${req.params.id} endpoint requested`);
  const registration = req.body;
  
  const mockRegistration = {
    id: Date.now().toString(),
    eventId: req.params.id,
    ...registration,
    registrationDate: new Date().toISOString(),
    status: 'confirmed'
  };

  res.status(201).json({
    message: 'Registration successful',
    registration: mockRegistration
  });
});

app.get('/api/events/:id/rsvps', (req, res) => {
  console.log(`📊 Event RSVPs for event ${req.params.id} endpoint requested`);
  
  const mockRsvps = [
    {
      id: '1', memberName: 'Sarah Johnson', email: 'sarah@faithlink.org', phone: '(555) 234-5678',
      attendeeCount: 2, status: 'confirmed', registrationDate: '2025-01-15T10:30:00Z',
      specialRequests: 'Vegetarian meal', emergencyContact: 'Mike Johnson', emergencyPhone: '(555) 234-5679'
    },
    {
      id: '2', memberName: 'Michael Chen', email: 'michael@faithlink.org', phone: '(555) 345-6789',
      attendeeCount: 1, status: 'confirmed', registrationDate: '2025-01-16T14:20:00Z'
    },
    {
      id: '3', memberName: 'Emily Rodriguez', email: 'emily@faithlink.org',
      attendeeCount: 3, status: 'tentative', registrationDate: '2025-01-17T09:15:00Z',
      specialRequests: 'Wheelchair accessible seating'
    },
    {
      id: '4', memberName: 'Robert Wilson', email: 'robert@faithlink.org', phone: '(555) 456-7890',
      attendeeCount: 1, status: 'declined', registrationDate: '2025-01-18T16:45:00Z'
    },
    {
      id: '5', memberName: 'Maria Santos', email: 'maria@faithlink.org',
      attendeeCount: 2, status: 'no-response', registrationDate: '2025-01-19T11:00:00Z'
    }
  ];

  res.status(200).json({
    rsvps: mockRsvps
  });
});

app.put('/api/events/:id/rsvps/:rsvpId', (req, res) => {
  console.log(`✏️ Update RSVP ${req.params.rsvpId} for event ${req.params.id} endpoint requested`);
  const { status } = req.body;

  res.status(200).json({
    message: 'RSVP status updated successfully',
    rsvpId: req.params.rsvpId,
    status: status
  });
});

app.get('/api/events/:id/check-in', (req, res) => {
  console.log(`✅ Event check-in data for event ${req.params.id} endpoint requested`);
  
  const mockAttendees = [
    {
      id: '1', memberName: 'Sarah Johnson', email: 'sarah@faithlink.org',
      attendeeCount: 2, status: 'checked-in', checkInTime: '2025-01-19T09:45:00Z',
      registrationId: 'reg-001'
    },
    {
      id: '2', memberName: 'Michael Chen', email: 'michael@faithlink.org',
      attendeeCount: 1, status: 'checked-in', checkInTime: '2025-01-19T09:52:00Z',
      registrationId: 'reg-002'
    },
    {
      id: '3', memberName: 'Emily Rodriguez', email: 'emily@faithlink.org',
      attendeeCount: 3, status: 'registered', registrationId: 'reg-003'
    },
    {
      id: '4', memberName: 'Robert Wilson', email: 'robert@faithlink.org',
      attendeeCount: 1, status: 'registered', registrationId: 'reg-004'
    },
    {
      id: '5', memberName: 'Maria Santos', email: 'maria@faithlink.org',
      attendeeCount: 2, status: 'no-show', registrationId: 'reg-005'
    },
    {
      id: '6', memberName: 'David Kim', email: 'david@faithlink.org',
      attendeeCount: 1, status: 'checked-in', checkInTime: '2025-01-19T10:15:00Z',
      registrationId: 'reg-006'
    }
  ];

  res.status(200).json({
    attendees: mockAttendees
  });
});

app.post('/api/events/:id/check-in/:attendeeId', (req, res) => {
  console.log(`✅ Check-in attendee ${req.params.attendeeId} for event ${req.params.id} endpoint requested`);
  const { checkInTime } = req.body;

  res.status(200).json({
    message: 'Attendee checked in successfully',
    attendeeId: req.params.attendeeId,
    checkInTime: checkInTime
  });
});

app.delete('/api/events/:id/check-in/:attendeeId', (req, res) => {
  console.log(`↩️ Undo check-in for attendee ${req.params.attendeeId} for event ${req.params.id} endpoint requested`);

  res.status(200).json({
    message: 'Check-in undone successfully',
    attendeeId: req.params.attendeeId
  });
});

app.post('/api/events/:id/check-in/:attendeeId/no-show', (req, res) => {
  console.log(`❌ Mark attendee ${req.params.attendeeId} as no-show for event ${req.params.id} endpoint requested`);

  res.status(200).json({
    message: 'Attendee marked as no-show',
    attendeeId: req.params.attendeeId
  });
});

// Member Self-Service API endpoints
app.get('/api/members/self-service/profile', (req, res) => {
  console.log('👤 Member self-service profile endpoint requested');
  
  const mockProfile = {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@faithlink.org',
    phone: '(555) 234-5678',
    address: '123 Faith Street, Community City, CA 90210',
    birthDate: '1990-05-15',
    membershipDate: '2023-03-20',
    status: 'active',
    groups: ['Ladies Bible Study', 'Worship Team'],
    journeys: [
      { id: '1', title: 'New Member Journey', progress: 100, status: 'completed' },
      { id: '2', title: 'Leadership Development', progress: 65, status: 'in_progress' },
      { id: '3', title: 'Bible Study Foundations', progress: 0, status: 'not_started' }
    ],
    prayerRequests: [
      { id: '1', title: 'Healing for family member', status: 'active', date: '2025-01-15' },
      { id: '2', title: 'Job interview success', status: 'answered', date: '2025-01-10' }
    ],
    upcomingEvents: [
      { id: '1', title: 'Sunday Service', date: '2025-01-21T10:00:00Z', location: 'Main Sanctuary', registered: true },
      { id: '2', title: 'Ladies Bible Study', date: '2025-01-22T19:00:00Z', location: 'Conference Room', registered: true },
      { id: '3', title: 'Community Outreach', date: '2025-01-25T12:00:00Z', location: 'Downtown Shelter', registered: false }
    ]
  };

  res.status(200).json({
    profile: mockProfile
  });
});

app.put('/api/members/self-service/profile', (req, res) => {
  console.log('👤 Update member self-service profile endpoint requested');
  const updatedProfile = req.body;
  
  res.status(200).json({
    message: 'Profile updated successfully',
    profile: updatedProfile
  });
});

app.get('/api/members/self-service/notifications', (req, res) => {
  console.log('🔔 Member notification settings endpoint requested');
  
  const mockSettings = {
    email: true,
    sms: false,
    pushNotifications: true,
    eventReminders: true,
    prayerUpdates: true,
    journeyProgress: true
  };

  res.status(200).json({
    settings: mockSettings
  });
});

app.put('/api/members/self-service/notifications', (req, res) => {
  console.log('🔔 Update member notification settings endpoint requested');
  const updatedSettings = req.body;
  
  res.status(200).json({
    message: 'Notification settings updated successfully',
    settings: updatedSettings
  });
});

app.get('/api/members/self-service/report', (req, res) => {
  console.log('📄 Member report download endpoint requested');
  
  // Generate mock PDF report content
  const reportContent = 'Mock PDF report content for member';
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="membership-report.pdf"');
  res.status(200).send(reportContent);
});

// Volunteer System API endpoints
app.get('/api/volunteers/opportunities', (req, res) => {
  console.log('🤝 Volunteer opportunities endpoint requested');
  
  const mockOpportunities = [
    {
      id: '1',
      title: 'Sunday School Teacher',
      description: 'Teach children ages 6-10 during Sunday service. Curriculum and materials provided.',
      department: 'Children\'s Ministry',
      location: 'Classroom A',
      startDate: '2025-02-01',
      endDate: '2025-06-30',
      timeCommitment: '2 hours/week on Sundays',
      skillsRequired: ['Experience with children', 'Public speaking', 'Patience'],
      contactPerson: 'Maria Santos',
      contactEmail: 'maria@faithlink.org',
      spotsAvailable: 2,
      spotsTotal: 3,
      isRecurring: true,
      status: 'open',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Worship Team Musician',
      description: 'Play guitar or keyboard for Sunday morning worship services.',
      department: 'Worship Ministry',
      location: 'Main Sanctuary',
      startDate: '2025-01-28',
      timeCommitment: '3 hours/week (practice + service)',
      skillsRequired: ['Musical proficiency', 'Team collaboration'],
      contactPerson: 'David Kim',
      contactEmail: 'david@faithlink.org',
      spotsAvailable: 1,
      spotsTotal: 2,
      isRecurring: true,
      status: 'open',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Community Outreach Coordinator',
      description: 'Help organize and lead monthly community service projects.',
      department: 'Outreach Ministry',
      location: 'Various locations',
      startDate: '2025-02-15',
      endDate: '2025-12-31',
      timeCommitment: '4-6 hours/month',
      skillsRequired: ['Organization', 'Leadership', 'Communication'],
      contactPerson: 'Pastor David',
      contactEmail: 'pastor@faithlink.org',
      spotsAvailable: 3,
      spotsTotal: 5,
      isRecurring: false,
      status: 'open',
      priority: 'high'
    },
    {
      id: '4',
      title: 'Tech Support Volunteer',
      description: 'Provide technical support for live streaming and sound during services.',
      department: 'Technical Ministry',
      location: 'Tech Booth',
      startDate: '2025-01-30',
      timeCommitment: '2 hours/week on Sundays',
      skillsRequired: ['Basic tech knowledge', 'Attention to detail'],
      contactPerson: 'Michael Chen',
      contactEmail: 'tech@faithlink.org',
      spotsAvailable: 0,
      spotsTotal: 2,
      isRecurring: true,
      status: 'filled',
      priority: 'medium'
    },
    {
      id: '5',
      title: 'Food Pantry Assistant',
      description: 'Help sort and distribute food donations to families in need.',
      department: 'Community Care',
      location: 'Fellowship Hall',
      startDate: '2025-02-01',
      timeCommitment: '3 hours/month on Saturdays',
      skillsRequired: ['Physical ability to lift', 'Compassionate heart'],
      contactPerson: 'Sarah Johnson',
      contactEmail: 'outreach@faithlink.org',
      spotsAvailable: 4,
      spotsTotal: 6,
      isRecurring: true,
      status: 'open',
      priority: 'urgent'
    }
  ];

  res.status(200).json({
    opportunities: mockOpportunities
  });
});

app.get('/api/volunteers/my-signups', (req, res) => {
  console.log('📝 Member volunteer signups endpoint requested');
  
  const mockSignups = [
    {
      id: '1',
      opportunityId: '2',
      memberName: 'Current User',
      email: 'user@faithlink.org',
      phone: '(555) 123-4567',
      availability: 'Sunday mornings',
      experience: '5 years playing guitar',
      motivation: 'Want to serve God through music ministry',
      signupDate: '2025-01-18',
      status: 'approved'
    }
  ];

  res.status(200).json({
    signups: mockSignups
  });
});

app.post('/api/volunteers/signup', (req, res) => {
  console.log('✍️ Volunteer signup endpoint requested');
  const signupData = req.body;
  
  const newSignup = {
    id: Date.now().toString(),
    memberName: 'Current User',
    email: 'user@faithlink.org',
    signupDate: new Date().toISOString(),
    status: 'pending',
    ...signupData
  };

  res.status(201).json({
    message: 'Volunteer signup submitted successfully',
    signup: newSignup
  });
});

// Spiritual Gifts API endpoints
app.get('/api/spiritual-gifts', (req, res) => {
  console.log('🎁 Spiritual gifts list endpoint requested');
  const spiritualGifts = [
    { id: 'leadership', name: 'Leadership', description: 'The ability to influence and guide others toward common goals', category: 'leadership' },
    { id: 'teaching', name: 'Teaching', description: 'The ability to communicate biblical truths effectively', category: 'teaching' },
    { id: 'serving', name: 'Serving/Helps', description: 'The desire and ability to assist others in practical ways', category: 'serving' },
    { id: 'hospitality', name: 'Hospitality', description: 'The gift of making others feel welcomed and cared for', category: 'serving' },
    { id: 'administration', name: 'Administration', description: 'The ability to organize and coordinate activities effectively', category: 'leadership' },
    { id: 'music', name: 'Music/Worship', description: 'The ability to lead others in worship through music', category: 'creative' },
    { id: 'creative', name: 'Creative Arts', description: 'The ability to express faith through various art forms', category: 'creative' },
    { id: 'encouragement', name: 'Encouragement', description: 'The ability to strengthen and support others in their faith', category: 'teaching' },
    { id: 'evangelism', name: 'Evangelism', description: 'The ability to share the gospel effectively with others', category: 'teaching' },
    { id: 'intercession', name: 'Intercession/Prayer', description: 'The calling to pray consistently and effectively for others', category: 'serving' }
  ];

  res.status(200).json({
    gifts: spiritualGifts,
    total: spiritualGifts.length
  });
});

app.post('/api/spiritual-gifts/assessment', (req, res) => {
  console.log('📊 Spiritual gifts assessment submission endpoint requested');
  const { responses } = req.body;
  
  // Mock assessment results calculation
  const mockResults = [
    { giftId: 'teaching', score: 23, percentage: 92 },
    { giftId: 'leadership', score: 21, percentage: 84 },
    { giftId: 'encouragement', score: 19, percentage: 76 },
    { giftId: 'serving', score: 17, percentage: 68 },
    { giftId: 'hospitality', score: 15, percentage: 60 }
  ];

  res.status(200).json({
    results: mockResults,
    savedAt: new Date().toISOString()
  });
});

// Ministry Opportunities API endpoints
app.get('/api/ministries', (req, res) => {
  console.log('⛪ Ministry opportunities list endpoint requested');
  const ministries = [
    {
      id: 'worship-team',
      name: 'Worship Team',
      department: 'Worship & Arts',
      description: 'Lead the congregation in worship through music, vocals, and technical support',
      timeCommitment: '4-6 hours/week',
      schedule: 'Sundays + 1 practice/week',
      location: 'Main Sanctuary',
      teamSize: 12,
      currentNeeds: 3,
      leader: 'Pastor Michael',
      skills: ['Musical instruments', 'Vocals', 'Sound/Tech'],
      spiritualGifts: ['music', 'creative', 'serving'],
      isUrgent: true
    },
    {
      id: 'childrens-ministry',
      name: "Children's Ministry",
      department: 'Family Ministries',
      description: 'Teach and care for children ages 0-12 during services and special events',
      timeCommitment: '2-3 hours/week',
      schedule: 'Sunday mornings',
      location: 'Children\'s Wing',
      teamSize: 18,
      currentNeeds: 5,
      leader: 'Sarah Johnson',
      skills: ['Working with children', 'Teaching', 'Patience'],
      spiritualGifts: ['teaching', 'serving', 'hospitality']
    },
    {
      id: 'hospitality-team',
      name: 'Hospitality Team',
      department: 'Connections',
      description: 'Welcome guests and help create a warm, inviting atmosphere for all who visit',
      timeCommitment: '2 hours/week',
      schedule: 'Sunday mornings',
      location: 'Main Lobby',
      teamSize: 15,
      currentNeeds: 4,
      leader: 'Linda Martinez',
      skills: ['People skills', 'Welcoming nature', 'Organization'],
      spiritualGifts: ['hospitality', 'serving', 'encouragement']
    }
  ];

  res.status(200).json({
    ministries: ministries,
    total: ministries.length
  });
});

app.post('/api/ministries/interest', (req, res) => {
  console.log('💝 Ministry interest submission endpoint requested');
  const { ministryId, interestLevel, notes } = req.body;
  
  res.status(201).json({
    id: Date.now().toString(),
    ministryId,
    interestLevel,
    notes,
    submittedAt: new Date().toISOString(),
    status: 'submitted'
  });
});

// Daily Devotions API endpoints
app.get('/api/devotions', (req, res) => {
  console.log('📖 Devotions list endpoint requested');
  const mockDevotions = [
    {
      id: '2025-09-09',
      date: '2025-09-09',
      scripture: 'Psalm 23',
      prayerTime: 15,
      reflection: 'God is my shepherd and I lack nothing. This brings such peace.',
      keyVerse: 'The Lord is my shepherd, I lack nothing.',
      prayerRequests: ['Healing for mom', 'Wisdom in work decisions'],
      gratitude: ['Health', 'Family time', 'Church community'],
      completed: true
    }
  ];

  res.status(200).json({
    devotions: mockDevotions,
    total: mockDevotions.length
  });
});

app.post('/api/devotions', (req, res) => {
  console.log('📝 Create devotion entry endpoint requested');
  const devotionData = req.body;
  
  res.status(201).json({
    id: devotionData.date,
    ...devotionData,
    createdAt: new Date().toISOString()
  });
});

// Tasks API endpoints
app.get('/api/tasks', (req, res) => {
  console.log('📋 Tasks list endpoint requested');
  const mockTasks = [
    {
      id: '1',
      title: 'Welcome new member orientation',
      description: 'Conduct orientation for Sarah Johnson',
      priority: 'high',
      status: 'pending',
      category: 'member_care',
      assigneeId: '1',
      assigneeName: 'Pastor Smith',
      dueDate: '2025-09-15T00:00:00Z',
      createdAt: '2025-09-10T00:00:00Z'
    },
    {
      id: '2',
      title: 'Prepare Sunday sermon',
      description: 'Research and prepare sermon on Romans 8',
      priority: 'high',
      status: 'in_progress',
      category: 'ministry',
      assigneeId: '1',
      assigneeName: 'Pastor Smith',
      dueDate: '2025-09-14T00:00:00Z',
      createdAt: '2025-09-09T00:00:00Z'
    },
    {
      id: '3',
      title: 'Follow up with prayer requests',
      description: 'Contact members who submitted prayer requests',
      priority: 'medium',
      status: 'completed',
      category: 'pastoral_care',
      assigneeId: '2',
      assigneeName: 'Admin User',
      dueDate: '2025-09-12T00:00:00Z',
      completedAt: '2025-09-11T00:00:00Z',
      createdAt: '2025-09-08T00:00:00Z'
    }
  ];

  res.status(200).json({
    tasks: mockTasks,
    total: mockTasks.length
  });
});

app.post('/api/tasks', (req, res) => {
  console.log('📝 Create task endpoint requested');
  console.log('Task data:', req.body);
  res.status(201).json({
    id: Math.random().toString(36).substr(2, 9),
    title: req.body.title,
    description: req.body.description,
    priority: req.body.priority || 'medium',
    status: 'pending',
    assignedTo: req.body.assignedTo,
    assignedToId: req.body.assignedToId,
    dueDate: req.body.dueDate,
    category: req.body.category,
    createdAt: new Date().toISOString(),
    createdBy: req.body.createdBy || 'Admin User'
  });
});

app.put('/api/tasks/:id', (req, res) => {
  console.log(`📝 Update task ${req.params.id} endpoint requested`);
  console.log('Update data:', req.body);
  res.status(200).json({
    id: req.params.id,
    ...req.body,
    updatedAt: new Date().toISOString()
  });
});

app.delete('/api/tasks/:id', (req, res) => {
  console.log(`🗑️ Delete task ${req.params.id} endpoint requested`);
  res.status(200).json({ message: 'Task deleted successfully' });
});

app.get('/api/dashboard/recent-activity', (req, res) => {
  console.log('🔄 Recent activity endpoint requested');
  res.status(200).json([
    { id: '1', type: 'member_joined', description: 'John Smith joined Youth Group', timestamp: new Date().toISOString() },
    { id: '2', type: 'event_created', description: 'Prayer Meeting scheduled', timestamp: new Date().toISOString() }
  ]);
});

// Attendance API endpoints (matching frontend service expectations)
app.get('/api/attendance/sessions', (req, res) => {
  console.log('📊 Attendance sessions endpoint requested');
  const { groupId, startDate, endDate, page = 1, limit = 10 } = req.query;
  
  // Mock sessions data that matches AttendanceSession interface
  const mockSessions = [
    {
      id: '1',
      groupId: groupId || 'group-1',
      sessionDate: '2025-01-20T10:00:00Z',
      notes: 'Regular Sunday morning Bible study session',
      createdAt: '2025-01-20T09:45:00Z',
      updatedAt: '2025-01-20T10:30:00Z',
      group: {
        id: groupId || 'group-1',
        name: 'Men\'s Bible Study',
        description: 'Weekly men\'s Bible study group'
      },
      attendances: [
        {
          id: 'att-1',
          sessionId: '1',
          memberId: 'member-1',
          status: 'present',
          notes: 'Active participation',
          member: {
            id: 'member-1',
            name: 'John Smith',
            email: 'john@faithlink.org'
          }
        },
        {
          id: 'att-2',
          sessionId: '1',
          memberId: 'member-2',
          status: 'absent',
          notes: 'Family emergency',
          member: {
            id: 'member-2',
            name: 'Mike Johnson',
            email: 'mike@faithlink.org'
          }
        }
      ]
    },
    {
      id: '2',
      groupId: groupId || 'group-1',
      sessionDate: '2025-01-13T10:00:00Z',
      notes: 'Discussion on faith and family',
      createdAt: '2025-01-13T09:45:00Z',
      updatedAt: '2025-01-13T10:30:00Z',
      group: {
        id: groupId || 'group-1',
        name: 'Men\'s Bible Study',
        description: 'Weekly men\'s Bible study group'
      },
      attendances: [
        {
          id: 'att-3',
          sessionId: '2',
          memberId: 'member-1',
          status: 'present',
          notes: 'Great insights shared',
          member: {
            id: 'member-1',
            name: 'John Smith',
            email: 'john@faithlink.org'
          }
        },
        {
          id: 'att-4',
          sessionId: '2',
          memberId: 'member-2',
          status: 'late',
          notes: 'Arrived 15 minutes late',
          member: {
            id: 'member-2',
            name: 'Mike Johnson',
            email: 'mike@faithlink.org'
          }
        }
      ]
    }
  ];

  // Filter by date range if provided
  let filteredSessions = mockSessions;
  if (startDate || endDate) {
    filteredSessions = mockSessions.filter(session => {
      const sessionDate = new Date(session.sessionDate);
      const start = startDate ? new Date(startDate) : new Date('1970-01-01');
      const end = endDate ? new Date(endDate) : new Date('2030-12-31');
      return sessionDate >= start && sessionDate <= end;
    });
  }

  const total = filteredSessions.length;
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const paginatedSessions = filteredSessions.slice(startIndex, startIndex + parseInt(limit));

  res.status(200).json({
    sessions: paginatedSessions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  });
});

app.get('/api/attendance/:sessionId', (req, res) => {
  console.log(`📊 Single attendance session ${req.params.sessionId} requested`);
  
  const mockSession = {
    id: req.params.sessionId,
    groupId: 'group-1',
    sessionDate: '2025-01-20T10:00:00Z',
    notes: 'Regular Sunday morning Bible study session',
    createdAt: '2025-01-20T09:45:00Z',
    updatedAt: '2025-01-20T10:30:00Z',
    group: {
      id: 'group-1',
      name: 'Men\'s Bible Study',
      description: 'Weekly men\'s Bible study group'
    },
    attendances: [
      {
        id: 'att-1',
        sessionId: req.params.sessionId,
        memberId: 'member-1',
        status: 'present',
        notes: 'Active participation',
        member: {
          id: 'member-1',
          name: 'John Smith',
          email: 'john@faithlink.org'
        }
      },
      {
        id: 'att-2',
        sessionId: req.params.sessionId,
        memberId: 'member-2',
        status: 'absent',
        notes: 'Family emergency',
        member: {
          id: 'member-2',
          name: 'Mike Johnson',
          email: 'mike@faithlink.org'
        }
      }
    ]
  };

  res.status(200).json(mockSession);
});

app.post('/api/attendance', (req, res) => {
  console.log('📊 Create attendance session endpoint requested');
  const sessionData = req.body;
  
  const newSession = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attendances: [],
    ...sessionData
  };

  res.status(201).json(newSession);
});

app.put('/api/attendance/:sessionId', (req, res) => {
  console.log(`📊 Update attendance session ${req.params.sessionId} requested`);
  const updateData = req.body;
  
  const updatedSession = {
    id: req.params.sessionId,
    updatedAt: new Date().toISOString(),
    ...updateData
  };

  res.status(200).json(updatedSession);
});

app.delete('/api/attendance/:sessionId', (req, res) => {
  console.log(`📊 Delete attendance session ${req.params.sessionId} requested`);
  
  res.status(200).json({
    message: 'Attendance session deleted successfully',
    sessionId: req.params.sessionId
  });
});

// Add missing attendance member stats endpoint
app.get('/api/attendance/member-stats/:memberId', (req, res) => {
  console.log(`📊 Member attendance stats for ${req.params.memberId} requested`);
  
  const mockMemberStats = {
    memberId: req.params.memberId,
    totalSessions: 24,
    attendedSessions: 20,
    attendanceRate: 83.3,
    recentAttendance: [
      { date: '2025-01-20', attended: true, sessionId: 'session-1' },
      { date: '2025-01-13', attended: true, sessionId: 'session-2' },
      { date: '2025-01-06', attended: false, sessionId: 'session-3' },
      { date: '2024-12-30', attended: true, sessionId: 'session-4' },
      { date: '2024-12-23', attended: true, sessionId: 'session-5' }
    ],
    streakInfo: {
      currentStreak: 2,
      longestStreak: 8,
      streakType: 'attendance'
    },
    monthlyStats: [
      { month: 'January 2025', attended: 3, total: 4, rate: 75.0 },
      { month: 'December 2024', attended: 4, total: 4, rate: 100.0 },
      { month: 'November 2024', attended: 3, total: 4, rate: 75.0 }
    ]
  };
  
  res.status(200).json(mockMemberStats);
});

app.get('/api/attendance/stats', (req, res) => {
  console.log('📊 Attendance stats endpoint requested');
  const { groupId, startDate, endDate } = req.query;
  
  const mockStats = {
    groupId,
    totalSessions: 8,
    averageAttendance: 85.5,
    totalMembers: 12,
    attendanceByStatus: {
      present: 78,
      absent: 12,
      late: 6,
      excused: 4
    },
    trends: [
      { date: '2025-01-06', rate: 83.3 },
      { date: '2025-01-13', rate: 91.7 },
      { date: '2025-01-20', rate: 83.3 }
    ],
    topAttenders: [
      { memberId: 'member-1', name: 'John Smith', attendanceRate: 100 },
      { memberId: 'member-3', name: 'David Wilson', attendanceRate: 87.5 }
    ]
  };

  res.status(200).json(mockStats);
});

app.post('/api/attendance/:sessionId/bulk-update', (req, res) => {
  console.log(`📊 Bulk update attendance for session ${req.params.sessionId} requested`);
  const { updates } = req.body;
  
  const updatedSession = {
    id: req.params.sessionId,
    updatedAt: new Date().toISOString(),
    attendances: updates.map((update, index) => ({
      id: `att-${index + 1}`,
      sessionId: req.params.sessionId,
      ...update
    }))
  };

  res.status(200).json(updatedSession);
});

app.get('/api/attendance/export', (req, res) => {
  console.log('📊 Export attendance data requested');
  const { format = 'csv' } = req.query;
  
  const csvData = `Date,Group,Member,Status,Notes
2025-01-20,Men's Bible Study,John Smith,Present,Active participation
2025-01-20,Men's Bible Study,Mike Johnson,Absent,Family emergency
2025-01-13,Men's Bible Study,John Smith,Present,Great insights shared
2025-01-13,Men's Bible Study,Mike Johnson,Late,Arrived 15 minutes late`;

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance-export.csv"');
    res.status(200).send(csvData);
  } else {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance-export.xlsx"');
    res.status(200).send(csvData); // In real implementation, would convert to Excel
  }
});

// Groups API endpoints (matching frontend groupService expectations)
app.get('/api/groups', (req, res) => {
  console.log('👥 Groups list endpoint requested');
  const { page = 1, limit = 10, search, type, status = 'active' } = req.query;
  
  const mockGroups = [
    {
      id: 'group-1',
      name: 'Men\'s Bible Study',
      description: 'Weekly men\'s Bible study focusing on practical Christian living',
      type: 'BIBLE_STUDY',
      status: 'active',
      meetingDay: 'Sunday',
      meetingTime: '10:00',
      location: 'Conference Room A',
      capacity: 15,
      currentMemberCount: 12,
      leaderId: 'user-1',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2025-01-20T10:00:00Z',
      leader: {
        id: 'user-1',
        name: 'Pastor David',
        email: 'pastor@faithlink.org'
      },
      members: [
        { id: 'member-1', name: 'John Smith', role: 'MEMBER' },
        { id: 'member-2', name: 'Mike Johnson', role: 'MEMBER' }
      ]
    },
    {
      id: 'group-2',
      name: 'Ladies Prayer Group',
      description: 'Weekly prayer and fellowship group for women',
      type: 'PRAYER',
      status: 'active',
      meetingDay: 'Wednesday',
      meetingTime: '19:00',
      location: 'Fellowship Hall',
      capacity: 20,
      currentMemberCount: 18,
      leaderId: 'user-2',
      createdAt: '2024-02-01T19:00:00Z',
      updatedAt: '2025-01-20T19:00:00Z',
      leader: {
        id: 'user-2',
        name: 'Sarah Johnson',
        email: 'sarah@faithlink.org'
      },
      members: [
        { id: 'member-3', name: 'Mary Williams', role: 'MEMBER' },
        { id: 'member-4', name: 'Lisa Davis', role: 'CO_LEADER' }
      ]
    },
    {
      id: 'group-3',
      name: 'Youth Group',
      description: 'High school youth group with games, worship, and Bible study',
      type: 'YOUTH',
      status: 'active',
      meetingDay: 'Friday',
      meetingTime: '18:30',
      location: 'Youth Center',
      capacity: 30,
      currentMemberCount: 24,
      leaderId: 'user-3',
      createdAt: '2024-03-10T18:30:00Z',
      updatedAt: '2025-01-20T18:30:00Z',
      leader: {
        id: 'user-3',
        name: 'Tommy Rodriguez',
        email: 'tommy@faithlink.org'
      },
      members: [
        { id: 'member-5', name: 'Alex Chen', role: 'MEMBER' },
        { id: 'member-6', name: 'Emma Wilson', role: 'MEMBER' }
      ]
    }
  ];

  // Filter groups based on search and type
  let filteredGroups = mockGroups;
  if (search) {
    const searchLower = search.toLowerCase();
    filteredGroups = filteredGroups.filter(group => 
      group.name.toLowerCase().includes(searchLower) || 
      group.description.toLowerCase().includes(searchLower)
    );
  }
  if (type && type !== 'all') {
    filteredGroups = filteredGroups.filter(group => group.type === type);
  }
  if (status && status !== 'all') {
    filteredGroups = filteredGroups.filter(group => group.status === status);
  }

  const total = filteredGroups.length;
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const paginatedGroups = filteredGroups.slice(startIndex, startIndex + parseInt(limit));

  res.status(200).json({
    groups: paginatedGroups,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  });
});

app.get('/api/groups/:id', (req, res) => {
  console.log(`👥 Single group ${req.params.id} requested`);
  
  const mockGroup = {
    id: req.params.id,
    name: 'Men\'s Bible Study',
    description: 'Weekly men\'s Bible study focusing on practical Christian living',
    type: 'BIBLE_STUDY',
    status: 'active',
    meetingDay: 'Sunday',
    meetingTime: '10:00',
    location: 'Conference Room A',
    capacity: 15,
    currentMemberCount: 12,
    leaderId: 'user-1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2025-01-20T10:00:00Z',
    leader: {
      id: 'user-1',
      name: 'Pastor David',
      email: 'pastor@faithlink.org'
    },
    members: [
      {
        id: 'member-1',
        userId: 'user-4',
        role: 'MEMBER',
        joinedAt: '2024-01-20T10:00:00Z',
        user: {
          id: 'user-4',
          name: 'John Smith',
          email: 'john@faithlink.org',
          phone: '(555) 123-4567'
        }
      },
      {
        id: 'member-2',
        userId: 'user-5',
        role: 'MEMBER',
        joinedAt: '2024-02-01T10:00:00Z',
        user: {
          id: 'user-5',
          name: 'Mike Johnson',
          email: 'mike@faithlink.org',
          phone: '(555) 234-5678'
        }
      }
    ],
    recentSessions: [
      {
        id: 'session-1',
        date: '2025-01-20T10:00:00Z',
        attendance: 10,
        notes: 'Great discussion on faith'
      },
      {
        id: 'session-2',
        date: '2025-01-13T10:00:00Z',
        attendance: 12,
        notes: 'Full attendance'
      }
    ]
  };

  res.status(200).json(mockGroup);
});

app.post('/api/groups', (req, res) => {
  console.log('👥 Create group endpoint requested');
  const groupData = req.body;
  
  const newGroup = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentMemberCount: 0,
    status: 'active',
    ...groupData
  };

  res.status(201).json(newGroup);
});

app.put('/api/groups/:id', (req, res) => {
  console.log(`👥 Update group ${req.params.id} requested`);
  const updateData = req.body;
  
  const updatedGroup = {
    id: req.params.id,
    updatedAt: new Date().toISOString(),
    ...updateData
  };

  res.status(200).json(updatedGroup);
});

app.delete('/api/groups/:id', (req, res) => {
  console.log(`👥 Delete group ${req.params.id} requested`);
  
  res.status(200).json({
    message: 'Group deleted successfully',
    groupId: req.params.id
  });
});

app.post('/api/groups/:id/members', (req, res) => {
  console.log(`👥 Add member to group ${req.params.id} requested`);
  const memberData = req.body;
  
  const newMember = {
    id: Date.now().toString(),
    groupId: req.params.id,
    joinedAt: new Date().toISOString(),
    ...memberData
  };

  res.status(201).json(newMember);
});

app.delete('/api/groups/:id/members/:memberId', (req, res) => {
  console.log(`👥 Remove member ${req.params.memberId} from group ${req.params.id} requested`);
  
  res.status(200).json({
    message: 'Member removed from group successfully',
    groupId: req.params.id,
    memberId: req.params.memberId
  });
});

// Journey Templates API endpoints (matching frontend expectations)
app.get('/api/journeys/templates', (req, res) => {
  console.log('🌟 Journey templates endpoint requested');
  const { page = 1, limit = 10, category, difficulty } = req.query;
  
  const mockTemplates = [
    {
      id: 'template-1',
      title: 'New Member Journey',
      description: 'A comprehensive journey for new church members to get acquainted with our community',
      category: 'NEW_MEMBER',
      difficulty: 'BEGINNER',
      estimatedDuration: 30,
      isActive: true,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2025-01-20T10:00:00Z',
      milestones: [
        {
          id: 'milestone-1',
          title: 'Welcome & Introduction',
          description: 'Learn about our church history and mission',
          order: 1,
          estimatedDays: 7,
          resources: ['Welcome Packet', 'Church History Video']
        },
        {
          id: 'milestone-2',
          title: 'Meet Your Pastor',
          description: 'Schedule a one-on-one meeting with pastoral staff',
          order: 2,
          estimatedDays: 14,
          resources: ['Pastor Contact Info', 'Meeting Scheduler']
        }
      ]
    },
    {
      id: 'template-2',
      title: 'Leadership Development',
      description: 'Develop leadership skills and spiritual maturity',
      category: 'LEADERSHIP',
      difficulty: 'INTERMEDIATE',
      estimatedDuration: 90,
      isActive: true,
      createdAt: '2024-02-01T10:00:00Z',
      updatedAt: '2025-01-20T10:00:00Z',
      milestones: [
        {
          id: 'milestone-3',
          title: 'Servant Leadership Study',
          description: 'Complete biblical leadership course',
          order: 1,
          estimatedDays: 30,
          resources: ['Leadership Book', 'Study Guide']
        }
      ]
    }
  ];

  let filteredTemplates = mockTemplates;
  if (category && category !== 'all') {
    filteredTemplates = filteredTemplates.filter(template => template.category === category);
  }
  if (difficulty && difficulty !== 'all') {
    filteredTemplates = filteredTemplates.filter(template => template.difficulty === difficulty);
  }

  const total = filteredTemplates.length;
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const paginatedTemplates = filteredTemplates.slice(startIndex, startIndex + parseInt(limit));

  res.status(200).json({
    templates: paginatedTemplates,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  });
});

app.get('/api/journeys/templates/:id', (req, res) => {
  console.log(`📋 Single journey template ${req.params.id} requested`);
  
  const mockTemplate = {
    id: req.params.id,
    title: 'New Member Journey',
    description: 'A comprehensive journey for new church members to get acquainted with our community',
    category: 'NEW_MEMBER',
    difficulty: 'BEGINNER',
    estimatedDuration: 30,
    isActive: true,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2025-01-20T10:00:00Z',
    milestones: [
      {
        id: 'milestone-1',
        title: 'Welcome & Introduction',
        description: 'Learn about our church history and mission',
        order: 1,
        estimatedDays: 7,
        resources: ['Welcome Packet', 'Church History Video']
      },
      {
        id: 'milestone-2',
        title: 'Meet Your Pastor',
        description: 'Schedule a one-on-one meeting with pastoral staff',
        order: 2,
        estimatedDays: 14,
        resources: ['Pastor Contact Info', 'Meeting Scheduler']
      },
      {
        id: 'milestone-3',
        title: 'Join a Small Group',
        description: 'Find and join a small group that fits your interests',
        order: 3,
        estimatedDays: 21,
        resources: ['Small Group Directory', 'Group Leaders Contact']
      }
    ]
  };

  res.status(200).json(mockTemplate);
});

app.post('/api/journeys/templates', (req, res) => {
  console.log('📋 Create journey template endpoint requested');
  const templateData = req.body;
  
  const newTemplate = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    ...templateData
  };

  res.status(201).json(newTemplate);
});

app.put('/api/journeys/templates/:id', (req, res) => {
  console.log(`📋 Update journey template ${req.params.id} requested`);
  const updateData = req.body;
  
  const updatedTemplate = {
    id: req.params.id,
    updatedAt: new Date().toISOString(),
    ...updateData
  };

  res.status(200).json(updatedTemplate);
});

app.delete('/api/journeys/templates/:id', (req, res) => {
  console.log(`📋 Delete journey template ${req.params.id} requested`);
  
  res.status(200).json({
    message: 'Journey template deleted successfully',
    templateId: req.params.id
  });
});

// Member Journeys API endpoints
app.get('/api/journeys/member-journeys', (req, res) => {
  console.log('🎯 Member journeys endpoint requested');
  const { page = 1, limit = 10, memberId, status, templateId } = req.query;
  
  const mockJourneys = [
    {
      id: 'journey-1',
      memberId: 'member-1',
      templateId: 'template-1',
      status: 'IN_PROGRESS',
      progress: 65,
      startedAt: '2025-01-01T10:00:00Z',
      updatedAt: '2025-01-20T10:00:00Z',
      member: {
        id: 'member-1',
        name: 'John Smith',
        email: 'john@faithlink.org'
      },
      template: {
        id: 'template-1',
        title: 'New Member Journey',
        category: 'NEW_MEMBER'
      },
      currentMilestone: {
        id: 'milestone-2',
        title: 'Meet Your Pastor',
        order: 2
      },
      milestones: [
        {
          id: 'milestone-1',
          status: 'COMPLETED',
          completedAt: '2025-01-08T10:00:00Z'
        },
        {
          id: 'milestone-2',
          status: 'IN_PROGRESS',
          startedAt: '2025-01-08T10:00:00Z'
        }
      ]
    }
  ];

  let filteredJourneys = mockJourneys;
  if (memberId) {
    filteredJourneys = filteredJourneys.filter(journey => journey.memberId === memberId);
  }
  if (status && status !== 'all') {
    filteredJourneys = filteredJourneys.filter(journey => journey.status === status);
  }
  if (templateId) {
    filteredJourneys = filteredJourneys.filter(journey => journey.templateId === templateId);
  }

  const total = filteredJourneys.length;
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const paginatedJourneys = filteredJourneys.slice(startIndex, startIndex + parseInt(limit));

  res.status(200).json({
    journeys: paginatedJourneys,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  });
});

app.get('/api/journeys/member-journeys/:id', (req, res) => {
  console.log(`🎯 Single member journey ${req.params.id} requested`);
  
  const mockJourney = {
    id: req.params.id,
    memberId: 'member-1',
    templateId: 'template-1',
    status: 'IN_PROGRESS',
    progress: 65,
    startedAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-20T10:00:00Z',
    member: {
      id: 'member-1',
      name: 'John Smith',
      email: 'john@faithlink.org'
    },
    template: {
      id: 'template-1',
      title: 'New Member Journey',
      category: 'NEW_MEMBER',
      milestones: [
        {
          id: 'milestone-1',
          title: 'Welcome & Introduction',
          description: 'Learn about our church history and mission',
          order: 1
        },
        {
          id: 'milestone-2',
          title: 'Meet Your Pastor',
          description: 'Schedule a one-on-one meeting with pastoral staff',
          order: 2
        }
      ]
    },
    milestones: [
      {
        id: 'milestone-1',
        status: 'COMPLETED',
        completedAt: '2025-01-08T10:00:00Z',
        notes: 'Completed welcome orientation'
      },
      {
        id: 'milestone-2',
        status: 'IN_PROGRESS',
        startedAt: '2025-01-08T10:00:00Z',
        notes: 'Meeting scheduled for next week'
      }
    ]
  };

  res.status(200).json(mockJourney);
});

app.post('/api/journeys/assign', (req, res) => {
  console.log('🎯 Assign journey endpoint requested');
  const assignmentData = req.body;
  
  const newJourney = {
    id: Date.now().toString(),
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'NOT_STARTED',
    progress: 0,
    ...assignmentData
  };

  res.status(201).json(newJourney);
});

app.put('/api/journeys/member-journeys/:id/milestone/:milestoneId', (req, res) => {
  console.log(`🎯 Update milestone ${req.params.milestoneId} for journey ${req.params.id} requested`);
  const updateData = req.body;
  
  res.status(200).json({
    message: 'Milestone updated successfully',
    journeyId: req.params.id,
    milestoneId: req.params.milestoneId,
    ...updateData
  });
});

// ========================================
// TASKS MANAGEMENT API - SPRINT 1
// ========================================

// GET /api/tasks - List tasks with advanced filtering, sorting, and pagination
app.get('/api/tasks', (req, res) => {
  console.log('📋 Tasks list endpoint requested');
  
  const { 
    page = 1, 
    limit = 10, 
    search, 
    status, 
    priority, 
    assignedToId, 
    category, 
    sortBy = 'createdAt', 
    sortOrder = 'desc',
    overdue 
  } = req.query;

  // Mock tasks data matching frontend TaskService expectations
  const mockTasks = [
    {
      id: 'task-1',
      title: 'Follow up with new member - John Smith',
      description: 'Schedule meet and greet coffee with John Smith who joined last Sunday. Introduce him to the men\'s ministry and help him get connected.',
      priority: 'high',
      status: 'pending',
      assignedTo: 'Pastor Mike',
      assignedToId: 'member-1',
      dueDate: '2025-01-25T17:00:00Z',
      createdAt: '2025-01-20T10:30:00Z',
      updatedAt: '2025-01-20T10:30:00Z',
      category: 'pastoral_care',
      createdBy: 'admin-1'
    },
    {
      id: 'task-2',
      title: 'Prepare Easter Sunday logistics',
      description: 'Coordinate with worship team, facilities, and volunteers for Easter Sunday service. Ensure extra seating, parking coordination, and children\'s ministry setup.',
      priority: 'medium',
      status: 'in_progress',
      assignedTo: 'Sarah Johnson',
      assignedToId: 'member-2',
      dueDate: '2025-04-15T08:00:00Z',
      createdAt: '2025-01-15T09:00:00Z',
      updatedAt: '2025-01-21T14:20:00Z',
      category: 'event_planning',
      createdBy: 'admin-1'
    },
    {
      id: 'task-3',
      title: 'Repair fellowship hall sound system',
      description: 'The microphone system in the fellowship hall is cutting out intermittently. Contact audio technician and schedule repair before next week\'s community dinner.',
      priority: 'high',
      status: 'pending',
      assignedTo: 'Maintenance Team',
      assignedToId: 'member-3',
      dueDate: '2025-01-22T12:00:00Z',
      createdAt: '2025-01-19T16:45:00Z',
      updatedAt: '2025-01-19T16:45:00Z',
      category: 'maintenance',
      createdBy: 'admin-1'
    },
    {
      id: 'task-4',
      title: 'Update church website with new service times',
      description: 'Update the website to reflect our new Sunday service schedule: 9:00 AM and 11:00 AM services starting February 1st.',
      priority: 'medium',
      status: 'completed',
      assignedTo: 'Tech Team',
      assignedToId: 'member-4',
      dueDate: '2025-01-30T17:00:00Z',
      createdAt: '2025-01-18T11:00:00Z',
      updatedAt: '2025-01-20T15:30:00Z',
      category: 'administrative',
      createdBy: 'admin-1'
    },
    {
      id: 'task-5',
      title: 'Organize food drive for local shelter',
      description: 'Coordinate with local homeless shelter to organize monthly food drive. Create flyers, coordinate volunteers, and set up collection points.',
      priority: 'low',
      status: 'in_progress',
      assignedTo: 'Outreach Team',
      assignedToId: 'member-5',
      dueDate: '2025-02-01T18:00:00Z',
      createdAt: '2025-01-17T13:15:00Z',
      updatedAt: '2025-01-20T09:45:00Z',
      category: 'outreach',
      createdBy: 'admin-1'
    }
  ];

  let filteredTasks = [...mockTasks];

  // Apply filters
  if (search) {
    const searchLower = search.toLowerCase();
    filteredTasks = filteredTasks.filter(task => 
      task.title.toLowerCase().includes(searchLower) ||
      task.description.toLowerCase().includes(searchLower)
    );
  }

  if (status) {
    filteredTasks = filteredTasks.filter(task => task.status === status);
  }

  if (priority) {
    filteredTasks = filteredTasks.filter(task => task.priority === priority);
  }

  if (assignedToId) {
    filteredTasks = filteredTasks.filter(task => task.assignedToId === assignedToId);
  }

  if (category) {
    filteredTasks = filteredTasks.filter(task => task.category === category);
  }

  if (overdue === 'true') {
    const now = new Date();
    filteredTasks = filteredTasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed'
    );
  }

  // Apply sorting
  const sortMultiplier = sortOrder === 'desc' ? -1 : 1;
  filteredTasks.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (sortBy === 'dueDate' || sortBy === 'createdAt' || sortBy === 'updatedAt') {
      aVal = new Date(aVal || '1900-01-01');
      bVal = new Date(bVal || '1900-01-01');
    }
    
    if (aVal < bVal) return -1 * sortMultiplier;
    if (aVal > bVal) return 1 * sortMultiplier;
    return 0;
  });

  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  const response = {
    tasks: paginatedTasks,
    total: filteredTasks.length,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(filteredTasks.length / limit),
    filters: {
      search,
      status,
      priority,
      assignedToId,
      category,
      sortBy,
      sortOrder,
      overdue
    }
  };

  console.log(`📋 Returning ${paginatedTasks.length} tasks (${filteredTasks.length} total after filters)`);
  res.status(200).json(response);
});

// GET /api/tasks/:id - Single task details
app.get('/api/tasks/:id', (req, res) => {
  console.log(`📋 Single task ${req.params.id} requested`);
  
  const mockTask = {
    id: req.params.id,
    title: 'Follow up with new member - John Smith',
    description: 'Schedule meet and greet coffee with John Smith who joined last Sunday. Introduce him to the men\'s ministry and help him get connected. Follow up within 3 days of initial contact.',
    priority: 'high',
    status: 'pending',
    assignedTo: 'Pastor Mike',
    assignedToId: 'member-1',
    dueDate: '2025-01-25T17:00:00Z',
    createdAt: '2025-01-20T10:30:00Z',
    updatedAt: '2025-01-20T10:30:00Z',
    category: 'pastoral_care',
    createdBy: 'admin-1',
    assignmentHistory: [
      {
        assignedTo: 'Pastor Mike',
        assignedBy: 'admin-1',
        assignedAt: '2025-01-20T10:30:00Z',
        notes: 'Initial assignment for pastoral follow-up'
      }
    ],
    comments: [
      {
        id: 'comment-1',
        author: 'Pastor Mike',
        content: 'I\'ll reach out to John today and schedule coffee for this week.',
        createdAt: '2025-01-20T14:15:00Z'
      }
    ],
    relatedMember: {
      id: 'member-new-1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '(555) 123-4567'
    }
  };

  res.status(200).json(mockTask);
});

// POST /api/tasks - Create new task
app.post('/api/tasks', (req, res) => {
  console.log('📋 Create task endpoint requested');
  
  const { 
    title, 
    description, 
    priority = 'medium', 
    assignedToId, 
    assignedTo, 
    dueDate, 
    category = 'administrative' 
  } = req.body;

  // Validation
  if (!title || !description) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Title and description are required',
      timestamp: new Date().toISOString()
    });
  }

  const newTask = {
    id: `task-${Date.now()}`,
    title,
    description,
    priority,
    status: 'pending',
    assignedTo: assignedTo || null,
    assignedToId: assignedToId || null,
    dueDate: dueDate || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category,
    createdBy: 'current-user-id' // In real app, get from auth token
  };

  console.log(`📋 Task created: ${newTask.title}`);
  res.status(201).json(newTask);
});

// PUT /api/tasks/:id - Update task
app.put('/api/tasks/:id', (req, res) => {
  console.log(`📋 Update task ${req.params.id} requested`);
  
  const taskId = req.params.id;
  const updateData = req.body;
  
  const updatedTask = {
    id: taskId,
    ...updateData,
    updatedAt: new Date().toISOString()
  };

  console.log(`📋 Task updated: ${taskId}`);
  res.status(200).json(updatedTask);
});

// DELETE /api/tasks/:id - Delete task (soft delete)
app.delete('/api/tasks/:id', (req, res) => {
  console.log(`📋 Delete task ${req.params.id} requested`);
  
  const response = {
    success: true,
    message: 'Task deleted successfully',
    taskId: req.params.id,
    deletedAt: new Date().toISOString()
  };

  console.log(`📋 Task deleted: ${req.params.id}`);
  res.status(200).json(response);
});

// POST /api/tasks/:id/assign - Assign task to member
app.post('/api/tasks/:id/assign', (req, res) => {
  console.log(`📋 Assign task ${req.params.id} requested`);
  
  const { assignedToId, assignedTo, notes } = req.body;
  
  if (!assignedToId && !assignedTo) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Either assignedToId or assignedTo is required',
      timestamp: new Date().toISOString()
    });
  }

  const assignment = {
    taskId: req.params.id,
    assignedToId,
    assignedTo,
    assignedBy: 'current-user-id', // In real app, get from auth token
    assignedAt: new Date().toISOString(),
    notes: notes || null
  };

  console.log(`📋 Task assigned: ${req.params.id} to ${assignedTo || assignedToId}`);
  res.status(200).json({
    success: true,
    assignment,
    message: 'Task assigned successfully'
  });
});

// GET /api/tasks/my-tasks - Get current user's assigned tasks
app.get('/api/tasks/my-tasks', (req, res) => {
  console.log('📋 My tasks endpoint requested');
  
  // In real app, get user ID from auth token
  const currentUserId = 'member-1'; // Mock current user
  
  const myTasks = [
    {
      id: 'task-1',
      title: 'Follow up with new member - John Smith',
      description: 'Schedule meet and greet coffee with John Smith',
      priority: 'high',
      status: 'pending',
      dueDate: '2025-01-25T17:00:00Z',
      category: 'pastoral_care',
      assignedAt: '2025-01-20T10:30:00Z'
    },
    {
      id: 'task-6',
      title: 'Prepare sermon notes for next Sunday',
      description: 'Research and prepare sermon on Matthew 5:14-16',
      priority: 'high',
      status: 'in_progress',
      dueDate: '2025-01-26T08:00:00Z',
      category: 'pastoral_care',
      assignedAt: '2025-01-19T15:00:00Z'
    }
  ];

  console.log(`📋 Returning ${myTasks.length} tasks for current user`);
  res.status(200).json({
    tasks: myTasks,
    total: myTasks.length,
    userId: currentUserId
  });
});

// PUT /api/tasks/:id/status - Update task status
app.put('/api/tasks/:id/status', (req, res) => {
  console.log(`📋 Update task ${req.params.id} status requested`);
  
  const { status, notes } = req.body;
  
  if (!status) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Status is required',
      timestamp: new Date().toISOString()
    });
  }

  const validStatuses = ['pending', 'in_progress', 'completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: `Status must be one of: ${validStatuses.join(', ')}`,
      timestamp: new Date().toISOString()
    });
  }

  const statusUpdate = {
    taskId: req.params.id,
    oldStatus: 'pending', // In real app, get from database
    newStatus: status,
    updatedBy: 'current-user-id',
    updatedAt: new Date().toISOString(),
    notes: notes || null
  };

  console.log(`📋 Task status updated: ${req.params.id} → ${status}`);
  res.status(200).json({
    success: true,
    statusUpdate,
    message: `Task status updated to ${status}`
  });
});

// GET /api/tasks/categories - Get task categories
app.get('/api/tasks/categories', (req, res) => {
  console.log('📋 Task categories endpoint requested');
  
  const categories = [
    { id: 'pastoral_care', name: 'Pastoral Care', description: 'Member care and spiritual guidance' },
    { id: 'event_planning', name: 'Event Planning', description: 'Church events and activities' },
    { id: 'maintenance', name: 'Maintenance', description: 'Facility and equipment maintenance' },
    { id: 'administrative', name: 'Administrative', description: 'General administrative tasks' },
    { id: 'follow_up', name: 'Follow-up', description: 'Member and visitor follow-up' },
    { id: 'outreach', name: 'Outreach', description: 'Community outreach and evangelism' }
  ];

  res.status(200).json({ categories });
});

// GET /api/tasks/stats - Get task statistics
app.get('/api/tasks/stats', (req, res) => {
  console.log('📋 Task stats endpoint requested');
  
  const stats = {
    totalTasks: 12,
    pendingTasks: 5,
    inProgressTasks: 4,
    completedTasks: 3,
    overdueTasks: 2,
    tasksByPriority: {
      high: 4,
      medium: 5,
      low: 3
    },
    tasksByCategory: {
      pastoral_care: 3,
      event_planning: 2,
      maintenance: 2,
      administrative: 3,
      follow_up: 1,
      outreach: 1
    },
    averageCompletionTime: 2.5, // days
    mostActiveAssignee: {
      name: 'Pastor Mike',
      taskCount: 6
    }
  };

  res.status(200).json(stats);
});

// ========================================
// END TASKS MANAGEMENT API
// ========================================

// ========================================
// PASTORAL CARE MODULE API - SPRINT 2
// ========================================

// GET /api/care/prayer-requests - List prayer requests
app.get('/api/care/prayer-requests', (req, res) => {
  console.log('🙏 Prayer requests list endpoint requested');
  
  const { 
    page = 1, 
    limit = 10, 
    search, 
    category, 
    priority, 
    status = 'all',
    isPrivate,
    sortBy = 'createdAt', 
    sortOrder = 'desc' 
  } = req.query;

  // Mock prayer requests data
  const mockPrayerRequests = [
    {
      id: 'prayer-1',
      title: 'Healing for John\'s cancer treatment',
      description: 'John Smith was diagnosed with lung cancer and starts chemotherapy next week. Pray for strength during treatment and complete healing.',
      category: 'health',
      priority: 'urgent',
      status: 'active',
      isPrivate: false,
      requestedBy: 'Sarah Johnson',
      requestedById: 'member-2',
      assignedTo: 'Pastor Mike',
      assignedToId: 'member-1',
      createdAt: '2025-01-18T09:30:00Z',
      updatedAt: '2025-01-18T09:30:00Z',
      followUpDate: '2025-01-25T00:00:00Z',
      updates: [
        {
          id: 'update-1',
          content: 'John completed his first chemo session successfully. Spirits are high.',
          createdAt: '2025-01-20T14:00:00Z',
          createdBy: 'Pastor Mike'
        }
      ]
    },
    {
      id: 'prayer-2',
      title: 'Job search guidance',
      description: 'Recently laid off from tech job. Seeking God\'s direction for next steps and provision during this time.',
      category: 'work',
      priority: 'normal',
      status: 'active',
      isPrivate: true,
      requestedBy: 'Anonymous',
      requestedById: 'member-anonymous',
      assignedTo: 'Care Team',
      assignedToId: 'care-team-1',
      createdAt: '2025-01-17T16:45:00Z',
      updatedAt: '2025-01-19T10:15:00Z',
      followUpDate: '2025-01-24T00:00:00Z',
      updates: []
    },
    {
      id: 'prayer-3',
      title: 'Marriage counseling support',
      description: 'Going through difficult time in marriage. Please pray for wisdom, patience, and restoration.',
      category: 'family',
      priority: 'high',
      status: 'resolved',
      isPrivate: true,
      requestedBy: 'Mike & Lisa Thompson',
      requestedById: 'member-3',
      assignedTo: 'Pastor Mike',
      assignedToId: 'member-1',
      createdAt: '2025-01-10T11:20:00Z',
      updatedAt: '2025-01-20T15:30:00Z',
      resolvedAt: '2025-01-20T15:30:00Z',
      followUpDate: null,
      updates: [
        {
          id: 'update-2',
          content: 'Couple attended marriage retreat last weekend. Great breakthrough!',
          createdAt: '2025-01-19T09:00:00Z',
          createdBy: 'Pastor Mike'
        }
      ]
    },
    {
      id: 'prayer-4',
      title: 'Financial struggles',
      description: 'Struggling to pay rent this month after unexpected medical bills. Pray for provision and wisdom.',
      category: 'financial',
      priority: 'high',
      status: 'active',
      isPrivate: false,
      requestedBy: 'David Wilson',
      requestedById: 'member-4',
      assignedTo: 'Deacon Johnson',
      assignedToId: 'member-5',
      createdAt: '2025-01-19T08:15:00Z',
      updatedAt: '2025-01-19T08:15:00Z',
      followUpDate: '2025-01-22T00:00:00Z',
      updates: []
    },
    {
      id: 'prayer-5',
      title: 'Spiritual growth and discipleship',
      description: 'New believer seeking to grow deeper in faith. Pray for understanding of Scripture and godly mentorship.',
      category: 'spiritual',
      priority: 'normal',
      status: 'active',
      isPrivate: false,
      requestedBy: 'Emily Chen',
      requestedById: 'member-6',
      assignedTo: 'Women\'s Ministry Leader',
      assignedToId: 'member-7',
      createdAt: '2025-01-16T13:45:00Z',
      updatedAt: '2025-01-18T10:20:00Z',
      followUpDate: '2025-01-23T00:00:00Z',
      updates: [
        {
          id: 'update-3',
          content: 'Connected Emily with Sarah for weekly discipleship meetings.',
          createdAt: '2025-01-18T10:20:00Z',
          createdBy: 'Women\'s Ministry Leader'
        }
      ]
    }
  ];

  let filteredRequests = [...mockPrayerRequests];

  // Apply filters
  if (search) {
    const searchLower = search.toLowerCase();
    filteredRequests = filteredRequests.filter(request => 
      request.title.toLowerCase().includes(searchLower) ||
      request.description.toLowerCase().includes(searchLower) ||
      request.requestedBy.toLowerCase().includes(searchLower)
    );
  }

  if (category) {
    filteredRequests = filteredRequests.filter(request => request.category === category);
  }

  if (priority) {
    filteredRequests = filteredRequests.filter(request => request.priority === priority);
  }

  if (status && status !== 'all') {
    filteredRequests = filteredRequests.filter(request => request.status === status);
  }

  if (isPrivate !== undefined) {
    const privateFilter = isPrivate === 'true';
    filteredRequests = filteredRequests.filter(request => request.isPrivate === privateFilter);
  }

  // Apply sorting
  const sortMultiplier = sortOrder === 'desc' ? -1 : 1;
  filteredRequests.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'followUpDate') {
      aVal = new Date(aVal || '1900-01-01');
      bVal = new Date(bVal || '1900-01-01');
    }
    
    if (aVal < bVal) return -1 * sortMultiplier;
    if (aVal > bVal) return 1 * sortMultiplier;
    return 0;
  });

  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  const response = {
    requests: paginatedRequests,
    total: filteredRequests.length,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(filteredRequests.length / limit),
    filters: {
      search, category, priority, status, isPrivate, sortBy, sortOrder
    }
  };

  console.log(`🙏 Returning ${paginatedRequests.length} prayer requests (${filteredRequests.length} total after filters)`);
  res.status(200).json(response);
});

// GET /api/care/prayer-requests/:id - Single prayer request details
app.get('/api/care/prayer-requests/:id', (req, res) => {
  console.log(`🙏 Single prayer request ${req.params.id} requested`);
  
  const mockPrayerRequest = {
    id: req.params.id,
    title: 'Healing for John\'s cancer treatment',
    description: 'John Smith was diagnosed with lung cancer and starts chemotherapy next week. Pray for strength during treatment and complete healing. The doctors are optimistic but the journey ahead will be challenging.',
    category: 'health',
    priority: 'urgent',
    status: 'active',
    isPrivate: false,
    requestedBy: 'Sarah Johnson',
    requestedById: 'member-2',
    assignedTo: 'Pastor Mike',
    assignedToId: 'member-1',
    createdAt: '2025-01-18T09:30:00Z',
    updatedAt: '2025-01-20T14:00:00Z',
    followUpDate: '2025-01-25T00:00:00Z',
    relatedMember: {
      id: 'member-john',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '(555) 123-4567'
    },
    assignmentHistory: [
      {
        assignedTo: 'Pastor Mike',
        assignedBy: 'Care Coordinator',
        assignedAt: '2025-01-18T09:45:00Z',
        notes: 'Assigned to pastor for urgent prayer request'
      }
    ],
    updates: [
      {
        id: 'update-1',
        content: 'John completed his first chemo session successfully. Spirits are high and he\'s grateful for all the prayers.',
        createdAt: '2025-01-20T14:00:00Z',
        createdBy: 'Pastor Mike',
        isPublic: true
      },
      {
        id: 'update-2',
        content: 'Visited John at the hospital. Family is staying strong.',
        createdAt: '2025-01-19T16:30:00Z',
        createdBy: 'Pastor Mike',
        isPublic: false
      }
    ],
    prayerTeam: [
      { id: 'member-1', name: 'Pastor Mike', role: 'Primary' },
      { id: 'member-8', name: 'Elder Johnson', role: 'Support' },
      { id: 'member-9', name: 'Prayer Chain Leader', role: 'Coordinator' }
    ]
  };

  res.status(200).json(mockPrayerRequest);
});

// POST /api/care/prayer-requests - Create new prayer request
app.post('/api/care/prayer-requests', (req, res) => {
  console.log('🙏 Create prayer request endpoint requested');
  
  const { 
    title, 
    description, 
    category = 'other', 
    priority = 'normal', 
    isPrivate = false,
    requestedBy,
    assignTo
  } = req.body;

  // Validation
  if (!title || !description) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Title and description are required',
      timestamp: new Date().toISOString()
    });
  }

  const newPrayerRequest = {
    id: `prayer-${Date.now()}`,
    title,
    description,
    category,
    priority,
    status: 'active',
    isPrivate,
    requestedBy: requestedBy || 'Anonymous',
    requestedById: 'current-user-id', // In real app, get from auth token
    assignedTo: assignTo || 'Care Team',
    assignedToId: assignTo ? 'assigned-user-id' : 'care-team-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    updates: []
  };

  console.log(`🙏 Prayer request created: ${newPrayerRequest.title}`);
  res.status(201).json(newPrayerRequest);
});

// PUT /api/care/prayer-requests/:id - Update prayer request
app.put('/api/care/prayer-requests/:id', (req, res) => {
  console.log(`🙏 Update prayer request ${req.params.id} requested`);
  
  const requestId = req.params.id;
  const updateData = req.body;
  
  const updatedPrayerRequest = {
    id: requestId,
    ...updateData,
    updatedAt: new Date().toISOString()
  };

  console.log(`🙏 Prayer request updated: ${requestId}`);
  res.status(200).json(updatedPrayerRequest);
});

// DELETE /api/care/prayer-requests/:id - Delete prayer request (soft delete)
app.delete('/api/care/prayer-requests/:id', (req, res) => {
  console.log(`🙏 Delete prayer request ${req.params.id} requested`);
  
  const response = {
    success: true,
    message: 'Prayer request deleted successfully',
    prayerRequestId: req.params.id,
    deletedAt: new Date().toISOString()
  };

  console.log(`🙏 Prayer request deleted: ${req.params.id}`);
  res.status(200).json(response);
});

// POST /api/care/prayer-requests/:id/update - Add update to prayer request
app.post('/api/care/prayer-requests/:id/update', (req, res) => {
  console.log(`🙏 Add update to prayer request ${req.params.id} requested`);
  
  const { content, isPublic = true } = req.body;
  
  if (!content) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Update content is required',
      timestamp: new Date().toISOString()
    });
  }

  const newUpdate = {
    id: `update-${Date.now()}`,
    prayerRequestId: req.params.id,
    content,
    isPublic,
    createdAt: new Date().toISOString(),
    createdBy: 'current-user-name' // In real app, get from auth token
  };

  console.log(`🙏 Update added to prayer request: ${req.params.id}`);
  res.status(201).json({
    success: true,
    update: newUpdate,
    message: 'Prayer request update added successfully'
  });
});

// GET /api/care/prayer-requests/categories - Get prayer request categories
app.get('/api/care/prayer-requests/categories', (req, res) => {
  console.log('🙏 Prayer request categories endpoint requested');
  
  const categories = [
    { id: 'health', name: 'Health & Healing', description: 'Medical issues, surgeries, chronic conditions' },
    { id: 'family', name: 'Family & Relationships', description: 'Marriage, children, family conflicts' },
    { id: 'work', name: 'Work & Career', description: 'Job searches, workplace issues, career decisions' },
    { id: 'spiritual', name: 'Spiritual Growth', description: 'Faith journey, discipleship, spiritual struggles' },
    { id: 'financial', name: 'Financial Needs', description: 'Financial hardship, stewardship, provision' },
    { id: 'other', name: 'Other', description: 'General prayer needs not covered by other categories' }
  ];

  res.status(200).json({ categories });
});

// GET /api/care/prayer-requests/stats - Get prayer request statistics
app.get('/api/care/prayer-requests/stats', (req, res) => {
  console.log('🙏 Prayer request stats endpoint requested');
  
  const stats = {
    totalRequests: 24,
    activeRequests: 18,
    resolvedRequests: 6,
    urgentRequests: 3,
    privateRequests: 8,
    requestsByCategory: {
      health: 8,
      family: 5,
      work: 4,
      spiritual: 3,
      financial: 2,
      other: 2
    },
    requestsByPriority: {
      urgent: 3,
      high: 7,
      normal: 12,
      low: 2
    },
    averageResponseTime: 0.75, // hours
    mostActivePrayerWarrior: {
      name: 'Pastor Mike',
      requestCount: 12
    },
    recentActivity: [
      {
        type: 'new_request',
        title: 'Prayer for healing',
        time: '2 hours ago'
      },
      {
        type: 'update_added',
        title: 'Job search update',
        time: '4 hours ago'
      },
      {
        type: 'request_resolved',
        title: 'Marriage counseling',
        time: '1 day ago'
      }
    ]
  };

  res.status(200).json(stats);
});

// ========================================
// CARE RECORDS API
// ========================================

// GET /api/care/records - List care records
app.get('/api/care/records', (req, res) => {
  console.log('💙 Care records list endpoint requested');
  
  const { 
    page = 1, 
    limit = 10, 
    memberId, 
    careType, 
    careProvider,
    dateFrom,
    dateTo,
    sortBy = 'careDate', 
    sortOrder = 'desc' 
  } = req.query;

  // Mock care records data
  const mockCareRecords = [
    {
      id: 'care-1',
      memberId: 'member-1',
      memberName: 'John Smith',
      careType: 'hospital',
      subject: 'Post-surgery hospital visit',
      notes: 'Visited John after his knee surgery. Family present and spirits good. Prayed together and discussed recovery timeline. Will follow up next week.',
      careProvider: 'Pastor Mike',
      careProviderId: 'provider-1',
      careDate: '2025-01-20T15:30:00Z',
      nextFollowUp: '2025-01-27T15:30:00Z',
      priority: 'normal',
      status: 'completed',
      tags: ['surgery', 'recovery', 'family_support'],
      duration: 45, // minutes
      location: 'City Hospital Room 204',
      createdAt: '2025-01-20T16:00:00Z',
      updatedAt: '2025-01-20T16:00:00Z'
    },
    {
      id: 'care-2',
      memberId: 'member-2',
      memberName: 'Sarah Johnson',
      careType: 'call',
      subject: 'Weekly check-in call',
      notes: 'Called Sarah to check on her job search progress. She had an interview this week and is feeling more hopeful. Encouraged her with Scripture from Jeremiah 29:11.',
      careProvider: 'Deacon Wilson',
      careProviderId: 'provider-2',
      careDate: '2025-01-19T14:00:00Z',
      nextFollowUp: '2025-01-26T14:00:00Z',
      priority: 'normal',
      status: 'completed',
      tags: ['job_search', 'encouragement'],
      duration: 20,
      location: 'Phone call',
      createdAt: '2025-01-19T14:30:00Z',
      updatedAt: '2025-01-19T14:30:00Z'
    },
    {
      id: 'care-3',
      memberId: 'member-3',
      memberName: 'Mike Thompson',
      careType: 'counseling',
      subject: 'Marriage counseling session',
      notes: 'Met with Mike and Lisa for their third counseling session. Working through communication issues. Assigned homework exercises for the week.',
      careProvider: 'Pastor Mike',
      careProviderId: 'provider-1',
      careDate: '2025-01-18T18:00:00Z',
      nextFollowUp: '2025-01-25T18:00:00Z',
      priority: 'high',
      status: 'scheduled',
      tags: ['marriage', 'counseling', 'communication'],
      duration: 60,
      location: 'Church Office',
      createdAt: '2025-01-18T19:00:00Z',
      updatedAt: '2025-01-18T19:00:00Z'
    },
    {
      id: 'care-4',
      memberId: 'member-4',
      memberName: 'Emily Chen',
      careType: 'visit',
      subject: 'New member home visit',
      notes: 'First home visit with Emily and her family. Discussed their church background and answered questions about our ministries. Very welcoming family.',
      careProvider: 'Elder Johnson',
      careProviderId: 'provider-3',
      careDate: '2025-01-17T19:30:00Z',
      nextFollowUp: '2025-01-31T19:30:00Z',
      priority: 'normal',
      status: 'completed',
      tags: ['new_member', 'home_visit', 'integration'],
      duration: 90,
      location: '123 Oak Street',
      createdAt: '2025-01-17T21:00:00Z',
      updatedAt: '2025-01-17T21:00:00Z'
    },
    {
      id: 'care-5',
      memberId: 'member-5',
      memberName: 'David Wilson',
      careType: 'follow-up',
      subject: 'Financial assistance follow-up',
      notes: 'Followed up on financial assistance provided last month. Family is doing better, David found part-time work. Continue to monitor situation.',
      careProvider: 'Deacon Smith',
      careProviderId: 'provider-4',
      careDate: '2025-01-16T12:00:00Z',
      nextFollowUp: '2025-02-16T12:00:00Z',
      priority: 'normal',
      status: 'completed',
      tags: ['financial_assistance', 'employment', 'follow_up'],
      duration: 30,
      location: 'Church Office',
      createdAt: '2025-01-16T12:30:00Z',
      updatedAt: '2025-01-16T12:30:00Z'
    }
  ];

  let filteredRecords = [...mockCareRecords];

  // Apply filters
  if (memberId) {
    filteredRecords = filteredRecords.filter(record => record.memberId === memberId);
  }

  if (careType) {
    filteredRecords = filteredRecords.filter(record => record.careType === careType);
  }

  if (careProvider) {
    filteredRecords = filteredRecords.filter(record => 
      record.careProvider.toLowerCase().includes(careProvider.toLowerCase())
    );
  }

  if (dateFrom) {
    filteredRecords = filteredRecords.filter(record => 
      new Date(record.careDate) >= new Date(dateFrom)
    );
  }

  if (dateTo) {
    filteredRecords = filteredRecords.filter(record => 
      new Date(record.careDate) <= new Date(dateTo)
    );
  }

  // Apply sorting
  const sortMultiplier = sortOrder === 'desc' ? -1 : 1;
  filteredRecords.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (sortBy === 'careDate' || sortBy === 'createdAt' || sortBy === 'nextFollowUp') {
      aVal = new Date(aVal || '1900-01-01');
      bVal = new Date(bVal || '1900-01-01');
    }
    
    if (aVal < bVal) return -1 * sortMultiplier;
    if (aVal > bVal) return 1 * sortMultiplier;
    return 0;
  });

  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

  const response = {
    careRecords: paginatedRecords,
    total: filteredRecords.length,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(filteredRecords.length / limit),
    filters: {
      memberId, careType, careProvider, dateFrom, dateTo, sortBy, sortOrder
    }
  };

  console.log(`💙 Returning ${paginatedRecords.length} care records (${filteredRecords.length} total after filters)`);
  res.status(200).json(response);
});

// POST /api/care/records - Create new care record
app.post('/api/care/records', (req, res) => {
  console.log('💙 Create care record endpoint requested');
  
  const { 
    memberId,
    memberName,
    careType,
    subject,
    notes,
    careDate = new Date().toISOString(),
    nextFollowUp,
    priority = 'normal',
    tags = [],
    duration,
    location
  } = req.body;

  // Validation
  if (!memberId || !careType || !subject || !notes) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'memberId, careType, subject, and notes are required',
      timestamp: new Date().toISOString()
    });
  }

  const newCareRecord = {
    id: `care-${Date.now()}`,
    memberId,
    memberName: memberName || 'Unknown Member',
    careType,
    subject,
    notes,
    careProvider: 'Current User', // In real app, get from auth token
    careProviderId: 'current-user-id',
    careDate,
    nextFollowUp,
    priority,
    status: 'completed',
    tags: Array.isArray(tags) ? tags : [],
    duration: duration || null,
    location: location || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  console.log(`💙 Care record created: ${newCareRecord.subject}`);
  res.status(201).json(newCareRecord);
});

// GET /api/care/records/:id - Single care record details
app.get('/api/care/records/:id', (req, res) => {
  console.log(`💙 Single care record ${req.params.id} requested`);
  
  const mockCareRecord = {
    id: req.params.id,
    memberId: 'member-1',
    memberName: 'John Smith',
    careType: 'hospital',
    subject: 'Post-surgery hospital visit',
    notes: 'Visited John after his knee surgery. Family present and spirits good. Prayed together and discussed recovery timeline. Will follow up next week. John expressed gratitude for the church support during this difficult time.',
    careProvider: 'Pastor Mike',
    careProviderId: 'provider-1',
    careDate: '2025-01-20T15:30:00Z',
    nextFollowUp: '2025-01-27T15:30:00Z',
    priority: 'normal',
    status: 'completed',
    tags: ['surgery', 'recovery', 'family_support'],
    duration: 45,
    location: 'City Hospital Room 204',
    createdAt: '2025-01-20T16:00:00Z',
    updatedAt: '2025-01-20T16:00:00Z',
    relatedPrayerRequests: [
      { id: 'prayer-1', title: 'Healing for John\'s surgery' }
    ],
    followUpActions: [
      { action: 'Schedule follow-up visit', dueDate: '2025-01-27T00:00:00Z', status: 'pending' },
      { action: 'Connect with family for support needs', dueDate: '2025-01-25T00:00:00Z', status: 'pending' }
    ]
  };

  res.status(200).json(mockCareRecord);
});

// PUT /api/care/records/:id - Update care record
app.put('/api/care/records/:id', (req, res) => {
  console.log(`💙 Update care record ${req.params.id} requested`);
  
  const recordId = req.params.id;
  const updateData = req.body;
  
  const updatedCareRecord = {
    id: recordId,
    ...updateData,
    updatedAt: new Date().toISOString()
  };

  console.log(`💙 Care record updated: ${recordId}`);
  res.status(200).json(updatedCareRecord);
});

// DELETE /api/care/records/:id - Delete care record (soft delete)
app.delete('/api/care/records/:id', (req, res) => {
  console.log(`💙 Delete care record ${req.params.id} requested`);
  
  const response = {
    success: true,
    message: 'Care record deleted successfully',
    careRecordId: req.params.id,
    deletedAt: new Date().toISOString()
  };

  console.log(`💙 Care record deleted: ${req.params.id}`);
  res.status(200).json(response);
});

// ========================================
// COUNSELING SCHEDULER API
// ========================================

// GET /api/care/counseling-sessions - List counseling sessions
app.get('/api/care/counseling-sessions', (req, res) => {
  console.log('🗓️ Counseling sessions list endpoint requested');
  
  const { 
    page = 1, 
    limit = 10, 
    counselorId, 
    memberId, 
    status = 'all',
    sessionType,
    dateFrom,
    dateTo,
    sortBy = 'sessionDate', 
    sortOrder = 'asc' 
  } = req.query;

  // Mock counseling sessions data
  const mockCounselingSessions = [
    {
      id: 'session-1',
      memberId: 'member-3',
      memberName: 'Mike Thompson',
      spouseName: 'Lisa Thompson',
      counselorId: 'counselor-1',
      counselorName: 'Pastor Mike',
      sessionType: 'marriage',
      sessionNumber: 4,
      totalSessions: 8,
      subject: 'Communication and Conflict Resolution',
      notes: 'Worked on active listening exercises. Both showing improvement in communication patterns. Assigned homework for daily check-ins.',
      sessionDate: '2025-01-25T18:00:00Z',
      duration: 60,
      status: 'scheduled',
      priority: 'high',
      location: 'Church Counseling Room',
      homeworkAssigned: [
        'Daily 15-minute check-in conversations',
        'Complete love languages assessment',
        'Practice conflict resolution steps'
      ],
      nextSession: '2025-02-01T18:00:00Z',
      createdAt: '2025-01-18T10:00:00Z',
      updatedAt: '2025-01-20T14:30:00Z'
    },
    {
      id: 'session-2',
      memberId: 'member-4',
      memberName: 'David Wilson',
      counselorId: 'counselor-2',
      counselorName: 'Elder Johnson',
      sessionType: 'individual',
      sessionNumber: 2,
      totalSessions: 6,
      subject: 'Financial Stress and Faith',
      notes: 'Discussed budgeting strategies and trusting God during financial difficulties. David is making progress with anxiety management.',
      sessionDate: '2025-01-23T16:30:00Z',
      duration: 50,
      status: 'completed',
      priority: 'normal',
      location: 'Elder Johnson\'s Office',
      homeworkAssigned: [
        'Create weekly budget plan',
        'Daily Scripture meditation on provision',
        'Track anxiety triggers'
      ],
      nextSession: '2025-01-30T16:30:00Z',
      createdAt: '2025-01-16T09:00:00Z',
      updatedAt: '2025-01-23T17:00:00Z'
    },
    {
      id: 'session-3',
      memberId: 'member-5',
      memberName: 'Sarah Johnson',
      counselorId: 'counselor-3',
      counselorName: 'Women\'s Ministry Leader',
      sessionType: 'grief',
      sessionNumber: 1,
      totalSessions: 4,
      subject: 'Initial Grief Counseling Assessment',
      notes: 'First session after loss of father. Established trust and discussed coping mechanisms. Sarah is open to the counseling process.',
      sessionDate: '2025-01-22T14:00:00Z',
      duration: 45,
      status: 'completed',
      priority: 'high',
      location: 'Women\'s Ministry Room',
      homeworkAssigned: [
        'Grief journaling - daily entries',
        'Connect with grief support group',
        'Practice grounding techniques'
      ],
      nextSession: '2025-01-29T14:00:00Z',
      createdAt: '2025-01-15T11:00:00Z',
      updatedAt: '2025-01-22T15:00:00Z'
    },
    {
      id: 'session-4',
      memberId: 'member-6',
      memberName: 'Emily Chen',
      counselorId: 'counselor-1',
      counselorName: 'Pastor Mike',
      sessionType: 'spiritual',
      sessionNumber: 3,
      totalSessions: 5,
      subject: 'Spiritual Growth and Discipleship',
      notes: 'Emily is growing in her understanding of Scripture. Discussed baptism and church membership. Very encouraging progress.',
      sessionDate: '2025-01-28T19:00:00Z',
      duration: 45,
      status: 'scheduled',
      priority: 'normal',
      location: 'Church Office',
      homeworkAssigned: [
        'Read Romans chapters 6-8',
        'Complete discipleship workbook pages 15-20',
        'Attend new member class next Sunday'
      ],
      nextSession: '2025-02-04T19:00:00Z',
      createdAt: '2025-01-14T10:30:00Z',
      updatedAt: '2025-01-21T16:00:00Z'
    }
  ];

  let filteredSessions = [...mockCounselingSessions];

  // Apply filters
  if (counselorId) {
    filteredSessions = filteredSessions.filter(session => session.counselorId === counselorId);
  }

  if (memberId) {
    filteredSessions = filteredSessions.filter(session => session.memberId === memberId);
  }

  if (status && status !== 'all') {
    filteredSessions = filteredSessions.filter(session => session.status === status);
  }

  if (sessionType) {
    filteredSessions = filteredSessions.filter(session => session.sessionType === sessionType);
  }

  if (dateFrom) {
    filteredSessions = filteredSessions.filter(session => 
      new Date(session.sessionDate) >= new Date(dateFrom)
    );
  }

  if (dateTo) {
    filteredSessions = filteredSessions.filter(session => 
      new Date(session.sessionDate) <= new Date(dateTo)
    );
  }

  // Apply sorting
  const sortMultiplier = sortOrder === 'desc' ? -1 : 1;
  filteredSessions.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (sortBy === 'sessionDate' || sortBy === 'createdAt' || sortBy === 'nextSession') {
      aVal = new Date(aVal || '1900-01-01');
      bVal = new Date(bVal || '1900-01-01');
    }
    
    if (aVal < bVal) return -1 * sortMultiplier;
    if (aVal > bVal) return 1 * sortMultiplier;
    return 0;
  });

  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedSessions = filteredSessions.slice(startIndex, endIndex);

  const response = {
    counselingSessions: paginatedSessions,
    total: filteredSessions.length,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(filteredSessions.length / limit),
    filters: {
      counselorId, memberId, status, sessionType, dateFrom, dateTo, sortBy, sortOrder
    }
  };

  console.log(`🗓️ Returning ${paginatedSessions.length} counseling sessions (${filteredSessions.length} total after filters)`);
  res.status(200).json(response);
});

// POST /api/care/counseling-sessions - Schedule new counseling session
app.post('/api/care/counseling-sessions', (req, res) => {
  console.log('🗓️ Create counseling session endpoint requested');
  
  const { 
    memberId,
    memberName,
    spouseName,
    counselorId,
    sessionType,
    subject,
    sessionDate,
    duration = 60,
    location,
    notes,
    totalSessions = 1
  } = req.body;

  // Validation
  if (!memberId || !counselorId || !sessionType || !sessionDate) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'memberId, counselorId, sessionType, and sessionDate are required',
      timestamp: new Date().toISOString()
    });
  }

  const newSession = {
    id: `session-${Date.now()}`,
    memberId,
    memberName: memberName || 'Unknown Member',
    spouseName: spouseName || null,
    counselorId,
    counselorName: 'Current Counselor', // In real app, get from counselor lookup
    sessionType,
    sessionNumber: 1,
    totalSessions,
    subject: subject || `${sessionType} counseling session`,
    notes: notes || '',
    sessionDate,
    duration,
    status: 'scheduled',
    priority: sessionType === 'crisis' ? 'urgent' : 'normal',
    location: location || 'Church Counseling Room',
    homeworkAssigned: [],
    nextSession: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  console.log(`🗓️ Counseling session scheduled: ${newSession.subject}`);
  res.status(201).json(newSession);
});

// GET /api/care/counseling-sessions/:id - Single counseling session details
app.get('/api/care/counseling-sessions/:id', (req, res) => {
  console.log(`🗓️ Single counseling session ${req.params.id} requested`);
  
  const mockSession = {
    id: req.params.id,
    memberId: 'member-3',
    memberName: 'Mike Thompson',
    spouseName: 'Lisa Thompson',
    counselorId: 'counselor-1',
    counselorName: 'Pastor Mike',
    sessionType: 'marriage',
    sessionNumber: 4,
    totalSessions: 8,
    subject: 'Communication and Conflict Resolution',
    notes: 'Worked on active listening exercises. Both showing improvement in communication patterns. Mike is better at expressing feelings without blame. Lisa is practicing patience during discussions. Assigned homework for daily check-ins.',
    sessionDate: '2025-01-25T18:00:00Z',
    duration: 60,
    status: 'scheduled',
    priority: 'high',
    location: 'Church Counseling Room',
    homeworkAssigned: [
      'Daily 15-minute check-in conversations',
      'Complete love languages assessment',
      'Practice conflict resolution steps from handout'
    ],
    previousHomeworkReview: {
      completed: ['Daily prayer together', 'Weekly date nights'],
      challenges: ['Finding time for long conversations', 'Avoiding defensive responses']
    },
    nextSession: '2025-02-01T18:00:00Z',
    sessionHistory: [
      {
        sessionNumber: 1,
        date: '2025-01-04T18:00:00Z',
        focus: 'Initial assessment and goal setting',
        status: 'completed'
      },
      {
        sessionNumber: 2,
        date: '2025-01-11T18:00:00Z',
        focus: 'Communication patterns analysis',
        status: 'completed'
      },
      {
        sessionNumber: 3,
        date: '2025-01-18T18:00:00Z',
        focus: 'Conflict de-escalation techniques',
        status: 'completed'
      }
    ],
    goals: [
      { goal: 'Improve daily communication', progress: 75, status: 'in_progress' },
      { goal: 'Reduce conflict frequency', progress: 60, status: 'in_progress' },
      { goal: 'Increase emotional intimacy', progress: 40, status: 'in_progress' }
    ],
    createdAt: '2025-01-18T10:00:00Z',
    updatedAt: '2025-01-20T14:30:00Z'
  };

  res.status(200).json(mockSession);
});

// PUT /api/care/counseling-sessions/:id - Update counseling session
app.put('/api/care/counseling-sessions/:id', (req, res) => {
  console.log(`🗓️ Update counseling session ${req.params.id} requested`);
  
  const sessionId = req.params.id;
  const updateData = req.body;
  
  const updatedSession = {
    id: sessionId,
    ...updateData,
    updatedAt: new Date().toISOString()
  };

  console.log(`🗓️ Counseling session updated: ${sessionId}`);
  res.status(200).json(updatedSession);
});

// DELETE /api/care/counseling-sessions/:id - Cancel counseling session
app.delete('/api/care/counseling-sessions/:id', (req, res) => {
  console.log(`🗓️ Cancel counseling session ${req.params.id} requested`);
  
  const response = {
    success: true,
    message: 'Counseling session cancelled successfully',
    sessionId: req.params.id,
    cancelledAt: new Date().toISOString()
  };

  console.log(`🗓️ Counseling session cancelled: ${req.params.id}`);
  res.status(200).json(response);
});

// GET /api/care/counseling-sessions/types - Get counseling session types
app.get('/api/care/counseling-sessions/types', (req, res) => {
  console.log('🗓️ Counseling session types endpoint requested');
  
  const sessionTypes = [
    { id: 'marriage', name: 'Marriage Counseling', description: 'Couples counseling and relationship guidance' },
    { id: 'individual', name: 'Individual Counseling', description: 'One-on-one pastoral counseling' },
    { id: 'family', name: 'Family Counseling', description: 'Family dynamics and parenting guidance' },
    { id: 'grief', name: 'Grief Counseling', description: 'Loss and bereavement support' },
    { id: 'spiritual', name: 'Spiritual Direction', description: 'Faith growth and spiritual guidance' },
    { id: 'crisis', name: 'Crisis Intervention', description: 'Urgent pastoral care and crisis support' }
  ];

  res.status(200).json({ sessionTypes });
});

// ========================================
// MEMBER CARE HISTORY API
// ========================================

// GET /api/care/member/:id/history - Get complete care history for a member
app.get('/api/care/member/:id/history', (req, res) => {
  console.log(`💙 Member care history for ${req.params.id} requested`);
  
  const memberId = req.params.id;
  const { limit = 20, offset = 0, type = 'all' } = req.query;

  const mockCareHistory = {
    member: {
      id: memberId,
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '(555) 123-4567',
      joinDate: '2024-03-15T00:00:00Z'
    },
    careStats: {
      totalInteractions: 12,
      prayerRequests: 3,
      counselingSessions: 0,
      visits: 4,
      calls: 5,
      lastContact: '2025-01-20T15:30:00Z',
      primaryCareProvider: 'Pastor Mike'
    },
    careHistory: [
      {
        id: 'history-1',
        type: 'care_record',
        date: '2025-01-20T15:30:00Z',
        title: 'Post-surgery hospital visit',
        description: 'Visited John after his knee surgery. Family present and spirits good.',
        careProvider: 'Pastor Mike',
        category: 'hospital',
        priority: 'normal',
        status: 'completed'
      },
      {
        id: 'history-2',
        type: 'prayer_request',
        date: '2025-01-18T09:30:00Z',
        title: 'Healing for surgery recovery',
        description: 'Prayer request for successful knee surgery and quick recovery.',
        careProvider: 'Prayer Team',
        category: 'health',
        priority: 'urgent',
        status: 'active'
      },
      {
        id: 'history-3',
        type: 'care_record',
        date: '2025-01-15T14:00:00Z',
        title: 'Pre-surgery encouragement call',
        description: 'Called to pray with John before his scheduled surgery.',
        careProvider: 'Pastor Mike',
        category: 'call',
        priority: 'normal',
        status: 'completed'
      },
      {
        id: 'history-4',
        type: 'care_record',
        date: '2025-01-10T19:30:00Z',
        title: 'Home visit - new member follow-up',
        description: 'Welcome visit to get to know John and his family better.',
        careProvider: 'Elder Johnson',
        category: 'visit',
        priority: 'normal',
        status: 'completed'
      },
      {
        id: 'history-5',
        type: 'prayer_request',
        date: '2024-12-20T10:15:00Z',
        title: 'Job interview success',
        description: 'Prayer for upcoming job interview at local company.',
        careProvider: 'Care Team',
        category: 'work',
        priority: 'normal',
        status: 'resolved'
      }
    ],
    upcomingCare: [
      {
        type: 'follow_up_visit',
        date: '2025-01-27T15:30:00Z',
        title: 'Post-surgery follow-up',
        careProvider: 'Pastor Mike'
      }
    ],
    careNotes: [
      'John is very receptive to pastoral care and appreciates church support',
      'Family is actively involved in church activities',
      'Has expressed interest in small group ministry after recovery'
    ]
  };

  // Apply type filter if specified
  if (type !== 'all') {
    mockCareHistory.careHistory = mockCareHistory.careHistory.filter(item => item.type === type);
  }

  // Apply pagination
  const paginatedHistory = mockCareHistory.careHistory.slice(offset, offset + parseInt(limit));
  mockCareHistory.careHistory = paginatedHistory;
  mockCareHistory.pagination = {
    limit: parseInt(limit),
    offset: parseInt(offset),
    total: 5,
    hasMore: offset + limit < 5
  };

  console.log(`💙 Returning care history for member: ${memberId}`);
  res.status(200).json(mockCareHistory);
});

// ========================================
// CARE TEAM DASHBOARD API
// ========================================

// GET /api/care/dashboard - Get care team dashboard data
app.get('/api/care/dashboard', (req, res) => {
  console.log('🎯 Care team dashboard endpoint requested');
  
  const dashboardData = {
    overview: {
      activePrayerRequests: 18,
      urgentRequests: 3,
      scheduledSessions: 8,
      overdueTasks: 2,
      membersInCare: 35,
      averageResponseTime: 0.75 // hours
    },
    recentActivity: [
      {
        id: 'activity-1',
        type: 'new_prayer_request',
        title: 'New prayer request from Sarah Johnson',
        description: 'Job search guidance needed',
        time: '2 hours ago',
        priority: 'normal',
        assignedTo: 'Care Team'
      },
      {
        id: 'activity-2',
        type: 'session_completed',
        title: 'Counseling session completed',
        description: 'Mike & Lisa Thompson - Marriage counseling #3',
        time: '4 hours ago',
        priority: 'normal',
        assignedTo: 'Pastor Mike'
      },
      {
        id: 'activity-3',
        type: 'follow_up_due',
        title: 'Follow-up visit due',
        description: 'John Smith post-surgery check-in',
        time: '1 day ago',
        priority: 'high',
        assignedTo: 'Pastor Mike'
      }
    ],
    upcomingSchedule: [
      {
        id: 'schedule-1',
        type: 'counseling_session',
        title: 'Marriage Counseling - Thompson Family',
        time: '2025-01-25T18:00:00Z',
        duration: 60,
        counselor: 'Pastor Mike',
        location: 'Church Counseling Room'
      },
      {
        id: 'schedule-2',
        type: 'home_visit',
        title: 'New Member Visit - Chen Family',
        time: '2025-01-26T19:00:00Z',
        duration: 90,
        counselor: 'Elder Johnson',
        location: '456 Elm Street'
      }
    ],
    careProviderWorkload: [
      {
        providerId: 'provider-1',
        name: 'Pastor Mike',
        activeCases: 12,
        urgentCases: 2,
        thisWeekSessions: 5,
        availability: 'high'
      },
      {
        providerId: 'provider-2',
        name: 'Elder Johnson',
        activeCases: 8,
        urgentCases: 1,
        thisWeekSessions: 3,
        availability: 'medium'
      },
      {
        providerId: 'provider-3',
        name: 'Deacon Wilson',
        activeCases: 6,
        urgentCases: 0,
        thisWeekSessions: 2,
        availability: 'high'
      }
    ],
    alertsAndReminders: [
      {
        id: 'alert-1',
        type: 'urgent',
        title: 'Urgent Prayer Request',
        message: 'David Wilson financial crisis - immediate attention needed',
        dueDate: '2025-01-21T12:00:00Z'
      },
      {
        id: 'alert-2',
        type: 'reminder',
        title: 'Follow-up Overdue',
        message: 'Emily Chen new member visit follow-up is 2 days overdue',
        dueDate: '2025-01-19T00:00:00Z'
      }
    ]
  };

  console.log('🎯 Care team dashboard data returned');
  res.status(200).json(dashboardData);
});

// GET /api/care/dashboard/stats - Get detailed care statistics
app.get('/api/care/dashboard/stats', (req, res) => {
  console.log('📊 Care dashboard stats endpoint requested');
  
  const { timeRange = '30days' } = req.query;
  
  const stats = {
    timeRange,
    generatedAt: new Date().toISOString(),
    prayerRequests: {
      total: 47,
      active: 18,
      resolved: 29,
      byCategory: {
        health: 15,
        family: 12,
        work: 8,
        spiritual: 7,
        financial: 3,
        other: 2
      },
      byPriority: {
        urgent: 3,
        high: 12,
        normal: 28,
        low: 4
      },
      averageResolutionTime: 14.5 // days
    },
    counselingSessions: {
      total: 23,
      completed: 18,
      scheduled: 5,
      cancelled: 0,
      byType: {
        marriage: 8,
        individual: 7,
        family: 4,
        grief: 2,
        spiritual: 1,
        crisis: 1
      },
      successRate: 94 // percentage
    },
    careRecords: {
      total: 156,
      visits: 45,
      calls: 67,
      emails: 32,
      other: 12,
      averageResponseTime: 0.75 // hours
    },
    memberEngagement: {
      membersInCare: 89,
      newCareRequests: 12,
      activeCareProviders: 8,
      memberSatisfactionScore: 4.8 // out of 5
    },
    trends: {
      prayerRequestTrend: '+12%', // compared to previous period
      sessionCompletionTrend: '+8%',
      responseTimeTrend: '-15%', // improvement
      memberEngagementTrend: '+25%'
    }
  };

  console.log(`📊 Care stats returned for ${timeRange}`);
  res.status(200).json(stats);
});

// ========================================
// COMMUNICATIONS EXTENSIONS MODULE - SPRINT 3
// ========================================

// POST /api/communications/campaigns/:id/send - Send email campaign
app.post('/api/communications/campaigns/:id/send', (req, res) => {
  console.log(`📧 Send email campaign ${req.params.id} requested`);
  
  const campaignId = req.params.id;
  const { 
    sendToAll = false, 
    memberIds = [], 
    groupIds = [], 
    scheduleTime,
    testRun = false
  } = req.body;

  // Mock campaign send response
  const sendResult = {
    campaignId,
    status: 'sending',
    totalRecipients: sendToAll ? 156 : memberIds.length + (groupIds.length * 25),
    estimatedDeliveryTime: scheduleTime || new Date(Date.now() + 300000).toISOString(), // 5 min
    batchId: `batch-${Date.now()}`,
    testRun,
    sendStartedAt: new Date().toISOString(),
    recipientBreakdown: {
      directMembers: memberIds.length,
      groupMembers: groupIds.length * 25,
      total: sendToAll ? 156 : memberIds.length + (groupIds.length * 25)
    },
    deliveryStats: {
      queued: sendToAll ? 156 : memberIds.length + (groupIds.length * 25),
      sent: 0,
      delivered: 0,
      failed: 0,
      opened: 0,
      clicked: 0
    }
  };

  console.log(`📧 Campaign ${campaignId} queued for sending to ${sendResult.totalRecipients} recipients`);
  res.status(200).json(sendResult);
});

// GET /api/communications/campaigns/:id/status - Get campaign send status
app.get('/api/communications/campaigns/:id/status', (req, res) => {
  console.log(`📊 Campaign status for ${req.params.id} requested`);
  
  const mockStatus = {
    campaignId: req.params.id,
    status: 'completed',
    totalRecipients: 156,
    lastUpdated: new Date().toISOString(),
    deliveryStats: {
      queued: 0,
      sent: 156,
      delivered: 148,
      failed: 8,
      bounced: 3,
      opened: 89,
      clicked: 34,
      unsubscribed: 2
    },
    deliveryRate: 94.9,
    openRate: 60.1,
    clickRate: 23.0,
    unsubscribeRate: 1.4,
    errors: [
      'Invalid email address: old-email@invalid.com',
      'Mailbox full: full-inbox@example.com'
    ]
  };

  res.status(200).json(mockStatus);
});

// GET /api/communications/templates - List communication templates
app.get('/api/communications/templates', (req, res) => {
  console.log('📝 Communication templates list requested');
  
  const { category, type, page = 1, limit = 10 } = req.query;

  const mockTemplates = [
    {
      id: 'template-1',
      name: 'Weekly Newsletter',
      category: 'newsletter',
      type: 'email',
      subject: 'This Week at {{church_name}}',
      content: '<h1>Welcome to {{church_name}}</h1><p>Here are this week\'s highlights...</p>',
      variables: ['church_name', 'pastor_name', 'service_time'],
      isActive: true,
      usageCount: 24,
      createdAt: '2024-12-01T10:00:00Z',
      updatedAt: '2025-01-15T14:30:00Z'
    },
    {
      id: 'template-2', 
      name: 'Event Invitation',
      category: 'events',
      type: 'email',
      subject: 'You\'re Invited: {{event_name}}',
      content: '<h2>{{event_name}}</h2><p>Join us {{event_date}} at {{event_location}}</p>',
      variables: ['event_name', 'event_date', 'event_location', 'rsvp_link'],
      isActive: true,
      usageCount: 18,
      createdAt: '2024-11-15T09:00:00Z',
      updatedAt: '2025-01-10T11:15:00Z'
    },
    {
      id: 'template-3',
      name: 'Prayer Request Update',
      category: 'pastoral_care',
      type: 'email',
      subject: 'Prayer Update: {{request_title}}',
      content: '<h3>Prayer Update</h3><p>{{update_content}}</p><p>Continue praying for {{request_title}}</p>',
      variables: ['request_title', 'update_content', 'requester_name'],
      isActive: true,
      usageCount: 12,
      createdAt: '2024-12-20T16:00:00Z',
      updatedAt: '2025-01-12T13:45:00Z'
    },
    {
      id: 'template-4',
      name: 'Welcome New Member',
      category: 'welcome',
      type: 'email',
      subject: 'Welcome to the {{church_name}} Family!',
      content: '<h1>Welcome {{member_name}}!</h1><p>We\'re excited to have you join our church family...</p>',
      variables: ['member_name', 'church_name', 'pastor_name', 'welcome_event'],
      isActive: true,
      usageCount: 8,
      createdAt: '2024-10-05T12:00:00Z',
      updatedAt: '2024-12-30T10:20:00Z'
    },
    {
      id: 'template-5',
      name: 'Urgent Announcement',
      category: 'announcements',
      type: 'sms',
      subject: null,
      content: 'URGENT: {{announcement_text}} - {{church_name}}',
      variables: ['announcement_text', 'church_name', 'contact_info'],
      isActive: true,
      usageCount: 3,
      createdAt: '2024-11-01T08:00:00Z',
      updatedAt: '2025-01-08T15:00:00Z'
    }
  ];

  let filteredTemplates = [...mockTemplates];

  if (category) {
    filteredTemplates = filteredTemplates.filter(t => t.category === category);
  }
  
  if (type) {
    filteredTemplates = filteredTemplates.filter(t => t.type === type);
  }

  const startIndex = (page - 1) * limit;
  const paginatedTemplates = filteredTemplates.slice(startIndex, startIndex + parseInt(limit));

  const response = {
    templates: paginatedTemplates,
    total: filteredTemplates.length,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(filteredTemplates.length / limit)
  };

  console.log(`📝 Returning ${paginatedTemplates.length} templates`);
  res.status(200).json(response);
});

// POST /api/communications/templates - Create communication template
app.post('/api/communications/templates', (req, res) => {
  console.log('📝 Create communication template requested');
  
  const { name, category, type, subject, content, variables = [] } = req.body;

  if (!name || !category || !type || !content) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'name, category, type, and content are required',
      timestamp: new Date().toISOString()
    });
  }

  const newTemplate = {
    id: `template-${Date.now()}`,
    name,
    category,
    type,
    subject: type === 'sms' ? null : subject,
    content,
    variables: Array.isArray(variables) ? variables : [],
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  console.log(`📝 Template created: ${newTemplate.name}`);
  res.status(201).json(newTemplate);
});

// GET /api/communications/templates/:id - Get single template
app.get('/api/communications/templates/:id', (req, res) => {
  console.log(`📝 Template ${req.params.id} requested`);
  
  const mockTemplate = {
    id: req.params.id,
    name: 'Weekly Newsletter',
    category: 'newsletter',
    type: 'email',
    subject: 'This Week at {{church_name}}',
    content: `<h1>Welcome to {{church_name}}</h1>
<p>Dear {{member_name}},</p>
<p>Here are this week's highlights and upcoming events:</p>
<h2>This Sunday's Service</h2>
<p>Join us at {{service_time}} for worship and fellowship.</p>
<h2>Upcoming Events</h2>
<ul>
  <li>{{event_1}}</li>
  <li>{{event_2}}</li>
</ul>
<p>Blessings,<br>{{pastor_name}}</p>`,
    variables: ['church_name', 'member_name', 'service_time', 'pastor_name', 'event_1', 'event_2'],
    isActive: true,
    usageCount: 24,
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2025-01-15T14:30:00Z',
    usageHistory: [
      { date: '2025-01-15T14:30:00Z', campaignName: 'January Newsletter', recipientCount: 156 },
      { date: '2025-01-08T14:30:00Z', campaignName: 'New Year Newsletter', recipientCount: 142 }
    ]
  };

  res.status(200).json(mockTemplate);
});

// PUT /api/communications/templates/:id - Update template
app.put('/api/communications/templates/:id', (req, res) => {
  console.log(`📝 Update template ${req.params.id} requested`);
  
  const { name, category, type, subject, content, variables, isActive } = req.body;
  
  const updatedTemplate = {
    id: req.params.id,
    name: name || 'Updated Template',
    category: category || 'general',
    type: type || 'email',
    subject: type === 'sms' ? null : subject,
    content: content || 'Updated content',
    variables: variables || [],
    isActive: isActive !== undefined ? isActive : true,
    updatedAt: new Date().toISOString()
  };

  console.log(`📝 Template updated: ${updatedTemplate.name}`);
  res.status(200).json(updatedTemplate);
});

// DELETE /api/communications/templates/:id - Delete template
app.delete('/api/communications/templates/:id', (req, res) => {
  console.log(`📝 Delete template ${req.params.id} requested`);
  
  const response = {
    success: true,
    message: 'Template deleted successfully',
    templateId: req.params.id,
    deletedAt: new Date().toISOString()
  };

  console.log(`📝 Template deleted: ${req.params.id}`);
  res.status(200).json(response);
});

// GET /api/communications/templates/categories - Get template categories
app.get('/api/communications/templates/categories', (req, res) => {
  console.log('📝 Template categories requested');
  
  const categories = [
    { id: 'newsletter', name: 'Newsletter', description: 'Weekly/monthly church newsletters' },
    { id: 'events', name: 'Events', description: 'Event invitations and updates' },
    { id: 'pastoral_care', name: 'Pastoral Care', description: 'Prayer requests and care updates' },
    { id: 'welcome', name: 'Welcome', description: 'New member welcome messages' },
    { id: 'announcements', name: 'Announcements', description: 'General church announcements' },
    { id: 'seasonal', name: 'Seasonal', description: 'Holiday and seasonal messages' }
  ];

  res.status(200).json({ categories });
});

// POST /api/communications/sms - Send SMS messages
app.post('/api/communications/sms', (req, res) => {
  console.log('📱 SMS send request received');
  
  const { 
    message, 
    recipients, 
    templateId,
    scheduleTime,
    priority = 'normal'
  } = req.body;

  if (!message || !recipients || recipients.length === 0) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'message and recipients are required',
      timestamp: new Date().toISOString()
    });
  }

  const smsResult = {
    messageId: `sms-${Date.now()}`,
    status: 'sending',
    message: message.substring(0, 160) + (message.length > 160 ? '...' : ''),
    recipientCount: recipients.length,
    estimatedCost: recipients.length * 0.05, // $0.05 per SMS
    deliveryStats: {
      queued: recipients.length,
      sent: 0,
      delivered: 0,
      failed: 0
    },
    priority,
    scheduleTime: scheduleTime || new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  console.log(`📱 SMS queued for ${recipients.length} recipients`);
  res.status(200).json(smsResult);
});

// GET /api/communications/sms/:id/status - Get SMS delivery status
app.get('/api/communications/sms/:id/status', (req, res) => {
  console.log(`📱 SMS status for ${req.params.id} requested`);
  
  const mockStatus = {
    messageId: req.params.id,
    status: 'completed',
    recipientCount: 45,
    lastUpdated: new Date().toISOString(),
    deliveryStats: {
      queued: 0,
      sent: 45,
      delivered: 42,
      failed: 3
    },
    deliveryRate: 93.3,
    estimatedCost: 2.25,
    actualCost: 2.10,
    errors: [
      'Invalid phone number: +1-555-INVALID',
      'Number not reachable: +1-555-123-0000'
    ]
  };

  res.status(200).json(mockStatus);
});

// ========================================
// ENHANCED ANNOUNCEMENTS SYSTEM
// ========================================

// PUT /api/communications/announcements/:id/schedule - Schedule announcement
app.put('/api/communications/announcements/:id/schedule', (req, res) => {
  console.log(`📅 Schedule announcement ${req.params.id} requested`);
  
  const { scheduleTime, channels = ['email'], priority = 'normal' } = req.body;
  
  if (!scheduleTime) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'scheduleTime is required',
      timestamp: new Date().toISOString()
    });
  }

  const scheduledAnnouncement = {
    announcementId: req.params.id,
    status: 'scheduled',
    scheduleTime,
    channels,
    priority,
    estimatedRecipients: channels.includes('email') ? 156 : 0 + channels.includes('sms') ? 89 : 0,
    scheduledAt: new Date().toISOString()
  };

  console.log(`📅 Announcement ${req.params.id} scheduled for ${scheduleTime}`);
  res.status(200).json(scheduledAnnouncement);
});

// POST /api/communications/announcements/:id/send - Send announcement immediately
app.post('/api/communications/announcements/:id/send', (req, res) => {
  console.log(`📢 Send announcement ${req.params.id} requested`);
  
  const { channels = ['email', 'website'], targetGroups = [], priority = 'normal' } = req.body;

  const sendResult = {
    announcementId: req.params.id,
    status: 'sending',
    channels,
    targetGroups,
    priority,
    totalRecipients: targetGroups.length > 0 ? targetGroups.length * 25 : 156,
    batchId: `batch-announce-${Date.now()}`,
    sendStartedAt: new Date().toISOString(),
    deliveryStats: {
      email: channels.includes('email') ? { queued: 156, sent: 0, failed: 0 } : null,
      sms: channels.includes('sms') ? { queued: 89, sent: 0, failed: 0 } : null,
      website: channels.includes('website') ? { published: true } : null
    }
  };

  console.log(`📢 Announcement ${req.params.id} sending to ${sendResult.totalRecipients} recipients`);
  res.status(200).json(sendResult);
});

// GET /api/communications/announcements/:id/analytics - Get announcement analytics
app.get('/api/communications/announcements/:id/analytics', (req, res) => {
  console.log(`📊 Announcement analytics for ${req.params.id} requested`);
  
  const mockAnalytics = {
    announcementId: req.params.id,
    title: 'Church Building Renovation Update',
    sentDate: '2025-01-15T10:00:00Z',
    channels: ['email', 'website', 'sms'],
    totalRecipients: 156,
    performance: {
      email: {
        sent: 156,
        delivered: 148,
        opened: 92,
        clicked: 28,
        openRate: 62.2,
        clickRate: 18.9
      },
      sms: {
        sent: 89,
        delivered: 86,
        deliveryRate: 96.6
      },
      website: {
        published: true,
        views: 342,
        avgTimeOnPage: 45
      }
    },
    engagement: {
      totalViews: 434,
      avgEngagementTime: 38,
      mostClickedLink: 'renovation-photos.html',
      deviceBreakdown: {
        mobile: 68,
        desktop: 24,
        tablet: 8
      }
    },
    feedback: {
      replies: 12,
      positiveResponses: 10,
      questions: 3
    }
  };

  res.status(200).json(mockAnalytics);
});

// ========================================
// COMMUNICATION ANALYTICS & TRACKING
// ========================================

// GET /api/communications/analytics/overview - Communication analytics overview
app.get('/api/communications/analytics/overview', (req, res) => {
  console.log('📊 Communication analytics overview requested');
  
  const { timeRange = '30days' } = req.query;
  
  const analytics = {
    timeRange,
    generatedAt: new Date().toISOString(),
    summary: {
      totalCampaigns: 12,
      totalRecipients: 1847,
      averageOpenRate: 58.3,
      averageClickRate: 21.7,
      totalSMSSent: 234,
      smsDeliveryRate: 94.8
    },
    emailPerformance: {
      campaignsSent: 12,
      totalEmailsSent: 1847,
      delivered: 1782,
      opened: 1039,
      clicked: 387,
      unsubscribed: 23,
      bounced: 42,
      deliveryRate: 96.5,
      openRate: 58.3,
      clickRate: 21.7,
      unsubscribeRate: 1.3
    },
    smsPerformance: {
      messagesSent: 8,
      totalSMSSent: 234,
      delivered: 222,
      failed: 12,
      deliveryRate: 94.8,
      totalCost: 11.70,
      avgCostPerMessage: 0.05
    },
    topPerformingCampaigns: [
      { id: 'camp-1', name: 'Christmas Service Invitation', openRate: 78.2, clickRate: 34.5 },
      { id: 'camp-2', name: 'New Year Prayer Service', openRate: 72.1, clickRate: 28.9 },
      { id: 'camp-3', name: 'Weekly Newsletter - Jan 15', openRate: 65.4, clickRate: 22.3 }
    ],
    engagementTrends: {
      openRateTrend: '+5.2%',
      clickRateTrend: '+12.8%',
      unsubscribeTrend: '-0.3%',
      smsDeliveryTrend: '+2.1%'
    }
  };

  console.log(`📊 Analytics returned for ${timeRange}`);
  res.status(200).json(analytics);
});

// GET /api/communications/analytics/campaigns/:id - Detailed campaign analytics
app.get('/api/communications/analytics/campaigns/:id', (req, res) => {
  console.log(`📊 Detailed analytics for campaign ${req.params.id} requested`);
  
  const detailedAnalytics = {
    campaignId: req.params.id,
    campaignName: 'Christmas Service Invitation',
    sentDate: '2024-12-20T09:00:00Z',
    subject: 'Join Us for Christmas Eve Service',
    totalRecipients: 156,
    deliveryTimeline: [
      { time: '09:00', sent: 50, delivered: 48, opened: 12 },
      { time: '09:15', sent: 106, delivered: 102, opened: 31 },
      { time: '09:30', sent: 156, delivered: 148, opened: 67 }
    ],
    deviceBreakdown: {
      mobile: { opens: 89, clicks: 34, percentage: 68.2 },
      desktop: { opens: 28, clicks: 12, percentage: 21.4 },
      tablet: { opens: 14, clicks: 6, percentage: 10.4 }
    },
    geographicBreakdown: [
      { location: 'Local Area', opens: 112, clicks: 43 },
      { location: 'Nearby Cities', opens: 19, clicks: 9 }
    ],
    linkPerformance: [
      { url: 'service-details.html', clicks: 28, uniqueClicks: 25 },
      { url: 'rsvp-form.html', clicks: 18, uniqueClicks: 16 },
      { url: 'directions.html', clicks: 12, uniqueClicks: 11 }
    ],
    hourlyEngagement: {
      '09': 12, '10': 23, '11': 18, '12': 8, '13': 15,
      '14': 22, '15': 19, '16': 14, '17': 11, '18': 9
    }
  };

  res.status(200).json(detailedAnalytics);
});

// ========================================
// END COMMUNICATIONS EXTENSIONS MODULE
// ========================================

// ========================================
// SPRINT 4: ADVANCED EVENTS MODULE
// ========================================

// ========================================
// EVENT REGISTRATION SYSTEM
// ========================================

// GET /api/events/:id/registrations - Get event registrations
app.get('/api/events/:id/registrations', (req, res) => {
  console.log(`📋 Event registrations for ${req.params.id} requested`);
  
  const { page = 1, limit = 50, status = 'all', search = '' } = req.query;
  
  const mockRegistrations = {
    eventId: req.params.id,
    eventName: 'Christmas Eve Service',
    totalRegistrations: 89,
    availableSpots: 21,
    capacity: 120,
    registrations: [
      {
        id: 'reg-001',
        memberId: 'member-123',
        memberName: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-123-4567',
        status: 'confirmed',
        registrationDate: '2025-01-10T14:30:00Z',
        guestCount: 2,
        specialRequests: 'Wheelchair accessible seating',
        checkedIn: false,
        checkinTime: null
      },
      {
        id: 'reg-002',
        memberId: 'member-456',
        memberName: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-987-6543',
        status: 'pending',
        registrationDate: '2025-01-12T09:15:00Z',
        guestCount: 0,
        specialRequests: null,
        checkedIn: false,
        checkinTime: null
      },
      {
        id: 'reg-003',
        memberId: 'member-789',
        memberName: 'Mike Wilson',
        email: 'mike.wilson@email.com',
        phone: '+1-555-456-7890',
        status: 'confirmed',
        registrationDate: '2025-01-08T16:45:00Z',
        guestCount: 1,
        specialRequests: 'Vegetarian meal preference',
        checkedIn: true,
        checkinTime: '2025-01-15T18:30:00Z'
      }
    ],
    statistics: {
      confirmed: 67,
      pending: 15,
      cancelled: 7,
      checkedIn: 23,
      totalGuests: 134,
      averageGuestsPerRegistration: 1.5
    },
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: 89,
      pages: Math.ceil(89 / parseInt(limit))
    }
  };

  console.log(`📋 ${mockRegistrations.registrations.length} registrations returned`);
  res.status(200).json(mockRegistrations);
});

// POST /api/events/:id/registrations - Create new event registration
app.post('/api/events/:id/registrations', (req, res) => {
  console.log(`📝 New registration for event ${req.params.id} requested`);
  
  const {
    memberId,
    memberName,
    email,
    phone,
    guestCount = 0,
    specialRequests,
    emergencyContact
  } = req.body;

  if (!memberId) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'memberId is required',
      timestamp: new Date().toISOString()
    });
  }

  const newRegistration = {
    id: `reg-${Date.now()}`,
    eventId: req.params.id,
    memberId,
    memberName,
    email,
    phone: phone || null,
    status: 'confirmed',
    registrationDate: new Date().toISOString(),
    guestCount: parseInt(guestCount),
    specialRequests: specialRequests || null,
    emergencyContact: emergencyContact || null,
    confirmationCode: `EVT-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
    checkedIn: false,
    checkinTime: null
  };

  console.log(`📝 Registration created: ${newRegistration.id} for ${memberName}`);
  res.status(201).json(newRegistration);
});

// PUT /api/events/:id/registrations/:registrationId - Update registration
app.put('/api/events/:id/registrations/:registrationId', (req, res) => {
  console.log(`📝 Update registration ${req.params.registrationId} for event ${req.params.id}`);
  
  const { status, guestCount, specialRequests, emergencyContact } = req.body;
  
  const updatedRegistration = {
    id: req.params.registrationId,
    eventId: req.params.id,
    memberId: 'member-123',
    memberName: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-123-4567',
    status: status || 'confirmed',
    registrationDate: '2025-01-10T14:30:00Z',
    guestCount: guestCount !== undefined ? parseInt(guestCount) : 2,
    specialRequests: specialRequests || 'Updated request',
    emergencyContact: emergencyContact || null,
    updatedAt: new Date().toISOString(),
    checkedIn: false,
    checkinTime: null
  };

  console.log(`📝 Registration updated: ${updatedRegistration.id}`);
  res.status(200).json(updatedRegistration);
});

// DELETE /api/events/:id/registrations/:registrationId - Cancel registration
app.delete('/api/events/:id/registrations/:registrationId', (req, res) => {
  console.log(`❌ Cancel registration ${req.params.registrationId} for event ${req.params.id}`);
  
  const cancelResponse = {
    success: true,
    message: 'Registration cancelled successfully',
    registrationId: req.params.registrationId,
    eventId: req.params.id,
    cancelledAt: new Date().toISOString(),
    refundEligible: true,
    refundAmount: 25.00
  };

  console.log(`❌ Registration cancelled: ${req.params.registrationId}`);
  res.status(200).json(cancelResponse);
});

// ========================================
// RSVP TRACKING SYSTEM
// ========================================

// GET /api/events/:id/rsvp - Get RSVP status and summary
app.get('/api/events/:id/rsvp', (req, res) => {
  console.log(`📊 RSVP summary for event ${req.params.id} requested`);
  
  const rsvpSummary = {
    eventId: req.params.id,
    eventName: 'Youth Group Pizza Night',
    rsvpDeadline: '2025-01-20T23:59:59Z',
    totalInvited: 45,
    totalResponded: 32,
    responseRate: 71.1,
    rsvpCounts: {
      attending: 28,
      notAttending: 4,
      maybe: 0,
      noResponse: 13
    },
    attendingBreakdown: {
      members: 28,
      guests: 12,
      totalExpected: 40
    },
    recentResponses: [
      {
        id: 'rsvp-001',
        memberId: 'member-234',
        memberName: 'Emily Davis',
        response: 'attending',
        guestCount: 1,
        responseDate: '2025-01-14T10:30:00Z',
        note: 'Looking forward to it!'
      },
      {
        id: 'rsvp-002',
        memberId: 'member-567',
        memberName: 'Alex Brown',
        response: 'not_attending',
        guestCount: 0,
        responseDate: '2025-01-13T15:45:00Z',
        note: 'Family commitment that evening'
      }
    ],
    statistics: {
      averageResponseTime: '2.3 days',
      mostCommonResponse: 'attending',
      peakResponseTime: '6PM - 8PM'
    }
  };

  console.log(`📊 RSVP data: ${rsvpSummary.rsvpCounts.attending}/${rsvpSummary.totalInvited} attending`);
  res.status(200).json(rsvpSummary);
});

// POST /api/events/:id/rsvp - Submit or update RSVP
app.post('/api/events/:id/rsvp', (req, res) => {
  console.log(`📝 RSVP submission for event ${req.params.id}`);
  
  const {
    memberId,
    memberName,
    response, // 'attending', 'not_attending', 'maybe'
    guestCount = 0,
    note,
    dietaryRestrictions,
    contactInfo
  } = req.body;

  if (!memberId || !memberName || !response) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'memberId, memberName, and response are required',
      timestamp: new Date().toISOString()
    });
  }

  const validResponses = ['attending', 'not_attending', 'maybe'];
  if (!validResponses.includes(response)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'response must be one of: attending, not_attending, maybe',
      timestamp: new Date().toISOString()
    });
  }

  const rsvpResponse = {
    id: `rsvp-${Date.now()}`,
    eventId: req.params.id,
    memberId,
    memberName,
    response,
    guestCount: parseInt(guestCount),
    note: note || null,
    dietaryRestrictions: dietaryRestrictions || null,
    contactInfo: contactInfo || null,
    responseDate: new Date().toISOString(),
    confirmationSent: true,
    reminderCount: 0
  };

  console.log(`📝 RSVP recorded: ${memberName} - ${response} (+${guestCount} guests)`);
  res.status(201).json(rsvpResponse);
});

// PUT /api/events/:id/rsvp/:rsvpId - Update existing RSVP
app.put('/api/events/:id/rsvp/:rsvpId', (req, res) => {
  console.log(`📝 Update RSVP ${req.params.rsvpId} for event ${req.params.id}`);
  
  const { response, guestCount, note, dietaryRestrictions } = req.body;
  
  const updatedRsvp = {
    id: req.params.rsvpId,
    eventId: req.params.id,
    memberId: 'member-123',
    memberName: 'John Smith',
    response: response || 'attending',
    guestCount: guestCount !== undefined ? parseInt(guestCount) : 2,
    note: note || 'Updated RSVP',
    dietaryRestrictions: dietaryRestrictions || null,
    responseDate: '2025-01-10T14:30:00Z',
    updatedAt: new Date().toISOString(),
    confirmationSent: true
  };

  console.log(`📝 RSVP updated: ${updatedRsvp.id}`);
  res.status(200).json(updatedRsvp);
});

// ========================================
// EVENT CHECK-IN SYSTEM
// ========================================

// GET /api/events/:id/check-in - Get check-in status and statistics
app.get('/api/events/:id/check-in', (req, res) => {
  console.log(`✅ Check-in status for event ${req.params.id} requested`);
  
  const checkinStatus = {
    eventId: req.params.id,
    eventName: 'Sunday Morning Service',
    eventDate: '2025-01-19T10:00:00Z',
    checkInOpen: true,
    checkInStartTime: '2025-01-19T09:00:00Z',
    totalExpected: 120,
    totalCheckedIn: 87,
    checkInRate: 72.5,
    onTimeRate: 85.1,
    lateArrivals: 13,
    recentCheckIns: [
      {
        id: 'checkin-001',
        registrationId: 'reg-456',
        memberId: 'member-789',
        memberName: 'Lisa Anderson',
        checkInTime: '2025-01-19T09:45:00Z',
        guestCount: 2,
        actualGuests: 1,
        status: 'on_time',
        notes: 'One guest couldn\'t make it'
      },
      {
        id: 'checkin-002',
        registrationId: 'reg-123',
        memberId: 'member-456',
        memberName: 'David Chen',
        checkInTime: '2025-01-19T10:15:00Z',
        guestCount: 0,
        actualGuests: 0,
        status: 'late',
        notes: 'Traffic delay'
      }
    ],
    statistics: {
      averageCheckInTime: '09:52 AM',
      peakCheckInPeriod: '09:30 AM - 09:50 AM',
      walkInRegistrations: 8,
      noShows: 15,
      guestVariance: -7 // 7 fewer guests than expected
    },
    checkInMethods: {
      qr_code: 45,
      manual_lookup: 32,
      walk_in: 8,
      mobile_app: 2
    }
  };

  console.log(`✅ Check-in data: ${checkinStatus.totalCheckedIn}/${checkinStatus.totalExpected} checked in`);
  res.status(200).json(checkinStatus);
});

// POST /api/events/:id/check-in - Check in attendee
app.post('/api/events/:id/check-in', (req, res) => {
  console.log(`✅ Check-in request for event ${req.params.id}`);
  
  const {
    registrationId,
    memberId,
    memberName,
    actualGuestCount,
    checkInMethod = 'manual_lookup',
    notes
  } = req.body;

  if (!memberId) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'memberId is required',
      timestamp: new Date().toISOString()
    });
  }

  const checkInRecord = {
    id: `checkin-${Date.now()}`,
    eventId: req.params.id,
    registrationId: registrationId || null,
    memberId,
    memberName,
    checkInTime: new Date().toISOString(),
    expectedGuestCount: 2,
    actualGuestCount: actualGuestCount !== undefined ? parseInt(actualGuestCount) : 2,
    checkInMethod,
    status: 'on_time', // or 'late', 'early'
    notes: notes || null,
    checkedInBy: 'volunteer-001',
    qrCode: `QR-${Math.random().toString(36).substr(2, 12).toUpperCase()}`
  };

  console.log(`✅ Member checked in: ${memberName} with ${checkInRecord.actualGuestCount} guests`);
  res.status(201).json(checkInRecord);
});

// PUT /api/events/:id/check-in/:memberId - Update check-in record
app.put('/api/events/:id/check-in/:memberId', (req, res) => {
  console.log(`✅ Update check-in for member ${req.params.memberId} at event ${req.params.id}`);
  
  const { actualGuestCount, notes, status } = req.body;
  
  const updatedCheckIn = {
    id: `checkin-update-${Date.now()}`,
    eventId: req.params.id,
    memberId: req.params.memberId,
    memberName: 'John Smith',
    checkInTime: '2025-01-19T09:45:00Z',
    updatedAt: new Date().toISOString(),
    expectedGuestCount: 2,
    actualGuestCount: actualGuestCount !== undefined ? parseInt(actualGuestCount) : 2,
    status: status || 'on_time',
    notes: notes || 'Updated check-in record',
    lastModifiedBy: 'volunteer-002'
  };

  console.log(`✅ Check-in updated for member: ${req.params.memberId}`);
  res.status(200).json(updatedCheckIn);
});

// DELETE /api/events/:id/check-in/:memberId - Undo check-in
app.delete('/api/events/:id/check-in/:memberId', (req, res) => {
  console.log(`❌ Undo check-in for member ${req.params.memberId} at event ${req.params.id}`);
  
  const undoResponse = {
    success: true,
    message: 'Check-in successfully removed',
    eventId: req.params.id,
    memberId: req.params.memberId,
    memberName: 'John Smith',
    undoneAt: new Date().toISOString(),
    reason: 'Member left early - requested undo'
  };

  console.log(`❌ Check-in undone for member: ${req.params.memberId}`);
  res.status(200).json(undoResponse);
});

// ========================================
// EVENT WAITLIST MANAGEMENT
// ========================================

// GET /api/events/:id/waitlist - Get event waitlist
app.get('/api/events/:id/waitlist', (req, res) => {
  console.log(`📝 Waitlist for event ${req.params.id} requested`);
  
  const { page = 1, limit = 25 } = req.query;
  
  const waitlistData = {
    eventId: req.params.id,
    eventName: 'Summer Church Retreat',
    eventDate: '2025-07-15T10:00:00Z',
    capacity: 50,
    registeredCount: 50,
    waitlistCount: 12,
    estimatedWaitTime: '2-3 weeks',
    autoPromote: true,
    waitlistEntries: [
      {
        id: 'wait-001',
        position: 1,
        memberId: 'member-234',
        memberName: 'Jennifer Martinez',
        email: 'jennifer.martinez@email.com',
        phone: '+1-555-234-5678',
        joinedWaitlistDate: '2025-01-12T14:20:00Z',
        guestCount: 1,
        priority: 'normal',
        notes: 'Willing to help with setup',
        notificationPreference: 'email'
      },
      {
        id: 'wait-002',
        position: 2,
        memberId: 'member-567',
        memberName: 'Robert Kim',
        email: 'robert.kim@email.com',
        phone: '+1-555-567-8901',
        joinedWaitlistDate: '2025-01-13T09:45:00Z',
        guestCount: 2,
        priority: 'high', // repeat attendee
        notes: 'Regular retreat participant',
        notificationPreference: 'sms'
      },
      {
        id: 'wait-003',
        position: 3,
        memberId: 'member-890',
        memberName: 'Amanda Foster',
        email: 'amanda.foster@email.com',
        phone: '+1-555-890-1234',
        joinedWaitlistDate: '2025-01-14T16:30:00Z',
        guestCount: 0,
        priority: 'normal',
        notes: null,
        notificationPreference: 'email'
      }
    ],
    statistics: {
      averageWaitTime: '1.8 weeks',
      promotionRate: 78.5,
      dropOffRate: 12.3,
      lastPromotionDate: '2025-01-10T10:00:00Z',
      nextPromotionEstimate: '2025-01-18T10:00:00Z'
    },
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: 12,
      pages: Math.ceil(12 / parseInt(limit))
    }
  };

  console.log(`📝 Waitlist: ${waitlistData.waitlistCount} people waiting`);
  res.status(200).json(waitlistData);
});

// POST /api/events/:id/waitlist - Join event waitlist
app.post('/api/events/:id/waitlist', (req, res) => {
  console.log(`📝 New waitlist entry for event ${req.params.id}`);
  
  const {
    memberId,
    memberName,
    email,
    phone,
    guestCount = 0,
    notes,
    notificationPreference = 'email'
  } = req.body;

  if (!memberId || !memberName || !email) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'memberId, memberName, and email are required',
      timestamp: new Date().toISOString()
    });
  }

  const waitlistEntry = {
    id: `wait-${Date.now()}`,
    eventId: req.params.id,
    position: 13, // Next available position
    memberId,
    memberName,
    email,
    phone: phone || null,
    joinedWaitlistDate: new Date().toISOString(),
    guestCount: parseInt(guestCount),
    priority: 'normal',
    notes: notes || null,
    notificationPreference,
    estimatedWaitTime: '3-4 weeks',
    confirmationSent: true
  };

  console.log(`📝 Added to waitlist: ${memberName} at position ${waitlistEntry.position}`);
  res.status(201).json(waitlistEntry);
});

// PUT /api/events/:id/waitlist/:waitlistId/promote - Promote from waitlist
app.put('/api/events/:id/waitlist/:waitlistId/promote', (req, res) => {
  console.log(`⬆️ Promote waitlist entry ${req.params.waitlistId} for event ${req.params.id}`);
  
  const promotionResult = {
    success: true,
    waitlistId: req.params.waitlistId,
    eventId: req.params.id,
    memberId: 'member-234',
    memberName: 'Jennifer Martinez',
    oldPosition: 1,
    newStatus: 'registered',
    registrationId: `reg-${Date.now()}`,
    promotedAt: new Date().toISOString(),
    confirmationSent: true,
    deadlineToAccept: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48 hours
  };

  console.log(`⬆️ Promoted from waitlist: ${promotionResult.memberName}`);
  res.status(200).json(promotionResult);
});

// DELETE /api/events/:id/waitlist/:waitlistId - Remove from waitlist
app.delete('/api/events/:id/waitlist/:waitlistId', (req, res) => {
  console.log(`❌ Remove from waitlist ${req.params.waitlistId} for event ${req.params.id}`);
  
  const removeResponse = {
    success: true,
    message: 'Successfully removed from waitlist',
    waitlistId: req.params.waitlistId,
    eventId: req.params.id,
    memberName: 'Jennifer Martinez',
    removedAt: new Date().toISOString(),
    reason: 'Member request'
  };

  console.log(`❌ Removed from waitlist: ${req.params.waitlistId}`);
  res.status(200).json(removeResponse);
});

// ========================================
// EVENT CAPACITY & RESOURCE MANAGEMENT
// ========================================

// GET /api/events/:id/capacity - Get event capacity and resource status
app.get('/api/events/:id/capacity', (req, res) => {
  console.log(`📊 Capacity status for event ${req.params.id} requested`);
  
  const capacityStatus = {
    eventId: req.params.id,
    eventName: 'Wedding Reception',
    eventDate: '2025-06-14T18:00:00Z',
    venue: {
      name: 'Fellowship Hall',
      maxCapacity: 150,
      currentOccupancy: 87,
      availableSpaces: 63,
      occupancyRate: 58.0,
      roomConfiguration: 'banquet_style'
    },
    registration: {
      totalRegistered: 89,
      confirmedAttending: 87,
      estimatedGuests: 134,
      waitlistCount: 0,
      lastMinuteRegistrations: 5
    },
    resources: {
      tables: {
        required: 12,
        available: 15,
        assigned: 10,
        status: 'sufficient'
      },
      chairs: {
        required: 134,
        available: 200,
        assigned: 140,
        status: 'sufficient'
      },
      audioVisual: {
        microphones: { required: 2, available: 4, status: 'sufficient' },
        projectors: { required: 1, available: 2, status: 'sufficient' },
        speakers: { required: 4, available: 6, status: 'sufficient' }
      },
      catering: {
        meals: { ordered: 140, confirmed: 134, dietary_special: 12 },
        beverages: { ordered: 150, confirmed: 140 },
        status: 'confirmed'
      }
    },
    staffing: {
      volunteers: {
        required: 8,
        assigned: 6,
        confirmed: 5,
        status: 'needs_attention'
      },
      coordinators: {
        required: 2,
        assigned: 2,
        confirmed: 2,
        status: 'sufficient'
      },
      security: {
        required: 1,
        assigned: 1,
        confirmed: 1,
        status: 'sufficient'
      }
    },
    alerts: [
      {
        type: 'warning',
        category: 'staffing',
        message: 'Need 2 more volunteers for setup and cleanup',
        priority: 'medium',
        dueDate: '2025-06-10T10:00:00Z'
      }
    ],
    recommendations: [
      'Consider opening waitlist - room has additional capacity',
      'Recruit 2 more volunteers for optimal event coverage',
      'Confirm final headcount 48 hours before event'
    ]
  };

  console.log(`📊 Capacity: ${capacityStatus.venue.currentOccupancy}/${capacityStatus.venue.maxCapacity} occupied`);
  res.status(200).json(capacityStatus);
});

// PUT /api/events/:id/capacity - Update capacity limits
app.put('/api/events/:id/capacity', (req, res) => {
  console.log(`📊 Update capacity for event ${req.params.id}`);
  
  const {
    maxCapacity,
    roomConfiguration,
    resourceAllocations,
    staffingRequirements
  } = req.body;

  const updatedCapacity = {
    eventId: req.params.id,
    maxCapacity: maxCapacity || 150,
    roomConfiguration: roomConfiguration || 'banquet_style',
    updatedAt: new Date().toISOString(),
    changes: {
      capacityChanged: maxCapacity ? true : false,
      resourcesUpdated: resourceAllocations ? true : false,
      staffingUpdated: staffingRequirements ? true : false
    },
    impact: {
      waitlistEligible: maxCapacity > 87 ? maxCapacity - 87 : 0,
      resourceAdjustmentNeeded: resourceAllocations ? true : false,
      notificationsSent: true
    }
  };

  console.log(`📊 Capacity updated: ${updatedCapacity.maxCapacity} max capacity`);
  res.status(200).json(updatedCapacity);
});

// POST /api/events/:id/resources - Allocate additional resources
app.post('/api/events/:id/resources', (req, res) => {
  console.log(`🔧 Resource allocation for event ${req.params.id}`);
  
  const {
    resourceType, // 'tables', 'chairs', 'audioVisual', 'catering', 'staffing'
    quantity,
    specifications,
    priority = 'normal'
  } = req.body;

  if (!resourceType || !quantity) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'resourceType and quantity are required',
      timestamp: new Date().toISOString()
    });
  }

  const resourceAllocation = {
    id: `resource-${Date.now()}`,
    eventId: req.params.id,
    resourceType,
    quantity: parseInt(quantity),
    specifications: specifications || null,
    priority,
    requestedAt: new Date().toISOString(),
    status: 'pending_approval',
    estimatedCost: quantity * 5.00, // $5 per unit
    approvalRequired: quantity > 10,
    deliveryDate: '2025-06-13T14:00:00Z',
    contactPerson: 'facilities-manager'
  };

  console.log(`🔧 Resource requested: ${quantity} ${resourceType}`);
  res.status(201).json(resourceAllocation);
});

// ========================================
// EVENT ANALYTICS & REPORTING
// ========================================

// GET /api/events/analytics/overview - Event analytics overview
app.get('/api/events/analytics/overview', (req, res) => {
  console.log('📊 Event analytics overview requested');
  
  const { timeRange = '6months', eventType = 'all' } = req.query;
  
  const analytics = {
    timeRange,
    eventType,
    generatedAt: new Date().toISOString(),
    summary: {
      totalEvents: 48,
      totalAttendees: 3247,
      averageAttendance: 67.6,
      registrationRate: 82.4,
      showUpRate: 78.9,
      cancelationRate: 8.3
    },
    attendanceTrends: {
      monthly: [
        { month: '2024-08', events: 6, attendance: 456 },
        { month: '2024-09', events: 8, attendance: 623 },
        { month: '2024-10', events: 7, attendance: 542 },
        { month: '2024-11', events: 9, attendance: 712 },
        { month: '2024-12', events: 12, attendance: 678 },
        { month: '2025-01', events: 6, attendance: 236 }
      ],
      weeklyAverage: 76.4,
      seasonalTrends: {
        spring: 82.1,
        summer: 65.3,
        fall: 89.7,
        winter: 71.2
      }
    },
    popularEvents: [
      { 
        id: 'evt-001', 
        name: 'Christmas Eve Service', 
        attendance: 245, 
        registrationRate: 98.2,
        satisfaction: 4.8
      },
      { 
        id: 'evt-002', 
        name: 'Easter Sunrise Service', 
        attendance: 198, 
        registrationRate: 89.4,
        satisfaction: 4.6
      },
      { 
        id: 'evt-003', 
        name: 'Youth Summer Camp', 
        attendance: 89, 
        registrationRate: 95.7,
        satisfaction: 4.9
      }
    ],
    eventTypes: {
      worship_services: { count: 18, avgAttendance: 89.2, trend: '+5.2%' },
      community_events: { count: 12, avgAttendance: 45.6, trend: '+12.8%' },
      educational: { count: 8, avgAttendance: 23.4, trend: '-2.1%' },
      social_gatherings: { count: 6, avgAttendance: 67.8, trend: '+8.4%' },
      outreach: { count: 4, avgAttendance: 34.2, trend: '+15.3%' }
    },
    demographics: {
      ageGroups: {
        '18-25': 18.2,
        '26-35': 24.6,
        '36-50': 31.4,
        '51-65': 19.8,
        '65+': 6.0
      },
      membershipStatus: {
        members: 72.3,
        regular_attendees: 18.9,
        visitors: 8.8
      },
      familySize: {
        single: 28.4,
        couple: 35.2,
        family_small: 24.1,
        family_large: 12.3
      }
    },
    engagement: {
      repeatAttendanceRate: 67.4,
      volunteerParticipation: 23.8,
      feedbackResponseRate: 34.2,
      averageSatisfaction: 4.6,
      recommendationRate: 89.3
    }
  };

  console.log(`📊 Analytics: ${analytics.summary.totalEvents} events, ${analytics.summary.totalAttendees} attendees`);
  res.status(200).json(analytics);
});

// GET /api/events/:id/analytics - Individual event analytics
app.get('/api/events/:id/analytics', (req, res) => {
  console.log(`📊 Analytics for event ${req.params.id} requested`);
  
  const eventAnalytics = {
    eventId: req.params.id,
    eventName: 'Annual Church Picnic',
    eventDate: '2024-08-15T12:00:00Z',
    duration: '4 hours',
    weather: 'Sunny, 78°F',
    registration: {
      totalRegistered: 156,
      confirmed: 142,
      noShows: 23,
      walkIns: 18,
      finalAttendance: 137,
      showUpRate: 87.8,
      capacityUtilization: 91.3
    },
    timeline: {
      registrationOpened: '2024-07-01T10:00:00Z',
      earlyBirdDeadline: '2024-07-15T23:59:59Z',
      finalDeadline: '2024-08-10T23:59:59Z',
      peakRegistrationPeriod: '2024-07-20 to 2024-07-25',
      lastMinuteRegistrations: 12
    },
    demographics: {
      adults: 89,
      children: 48,
      families: 34,
      singles: 21,
      newMembers: 8,
      visitors: 15
    },
    activities: {
      mostPopular: 'BBQ Lunch',
      leastPopular: 'Craft Station',
      participationRates: {
        'BBQ Lunch': 98.5,
        'Games & Sports': 76.6,
        'Live Music': 85.4,
        'Craft Station': 34.3,
        'Face Painting': 67.2
      }
    },
    feedback: {
      responsesReceived: 52,
      responseRate: 38.0,
      averageRating: 4.7,
      wouldRecommend: 94.2,
      topComments: [
        'Great food and fellowship!',
        'Kids had a wonderful time',
        'Well organized event'
      ],
      suggestions: [
        'More shade areas needed',
        'Earlier start time preferred',
        'More vegetarian options'
      ]
    },
    costs: {
      totalBudget: 1200.00,
      actualSpent: 1087.50,
      underBudget: 112.50,
      costPerAttendee: 7.94,
      revenue: 890.00,
      netCost: -197.50
    },
    volunteers: {
      totalVolunteers: 15,
      hoursContributed: 89,
      rolesFilled: 12,
      noShows: 2,
      satisfaction: 4.3
    }
  };

  console.log(`📊 Event analytics: ${eventAnalytics.registration.finalAttendance} attendees, ${eventAnalytics.feedback.averageRating}/5 rating`);
  res.status(200).json(eventAnalytics);
});

// GET /api/events/analytics/attendance-trends - Attendance trend analysis
app.get('/api/events/analytics/attendance-trends', (req, res) => {
  console.log('📈 Attendance trends analysis requested');
  
  const { period = 'monthly', eventType = 'all', compareYear = false } = req.query;
  
  const trends = {
    period,
    eventType,
    generatedAt: new Date().toISOString(),
    currentYear: {
      jan: { events: 4, avgAttendance: 67, trend: '+5.2%' },
      feb: { events: 3, avgAttendance: 72, trend: '+8.1%' },
      mar: { events: 5, avgAttendance: 89, trend: '+12.4%' },
      apr: { events: 6, avgAttendance: 94, trend: '+6.7%' },
      may: { events: 7, avgAttendance: 82, trend: '-4.3%' },
      jun: { events: 8, avgAttendance: 76, trend: '-7.2%' }
    },
    predictions: {
      nextMonth: {
        estimatedEvents: 6,
        predictedAttendance: 85,
        confidence: 78.4
      },
      nextQuarter: {
        estimatedEvents: 18,
        predictedAttendance: 82,
        confidence: 71.2
      }
    },
    insights: [
      'Spring months show highest attendance growth',
      'Summer events typically have 15% lower attendance',
      'Holiday events consistently exceed capacity',
      'Sunday services maintain steady 85+ attendance'
    ],
    recommendations: [
      'Schedule major events in March-May for optimal attendance',
      'Consider indoor alternatives for summer events',
      'Implement waitlist for holiday services',
      'Promote weeknight events to boost mid-week engagement'
    ]
  };

  console.log('📈 Attendance trends generated');
  res.status(200).json(trends);
});

// ========================================
// END ADVANCED EVENTS MODULE
// ========================================

// ========================================
// SPRINT 5: SPIRITUAL JOURNEY EXTENSIONS
// ========================================

// ========================================
// DAILY DEVOTIONS TRACKING SYSTEM
// ========================================

// GET /api/journeys/devotions - Get devotions history and statistics
app.get('/api/journeys/devotions', (req, res) => {
  console.log('📖 Daily devotions history requested');
  
  const { memberId, dateRange = '30days', page = 1, limit = 50 } = req.query;
  
  const devotionsData = {
    memberId: memberId || 'member-123',
    memberName: 'John Smith',
    dateRange,
    currentStreak: 12,
    longestStreak: 28,
    totalDays: 156,
    consistency: 78.4,
    devotions: [
      {
        id: 'dev-001',
        date: '2025-01-15',
        completed: true,
        devotionPlan: 'Daily Bible Reading Plan',
        passage: 'Matthew 5:1-16',
        title: 'The Beatitudes',
        notes: 'Powerful message about blessed living. Need to focus more on being a peacemaker.',
        duration: 15, // minutes
        reflection: {
          keyVerse: 'Matthew 5:9',
          insight: 'Peacemakers are called children of God',
          application: 'Look for opportunities to bring peace in conflicts this week'
        },
        tags: ['sermon_on_mount', 'beatitudes', 'character']
      },
      {
        id: 'dev-002',
        date: '2025-01-14',
        completed: true,
        devotionPlan: 'Daily Bible Reading Plan',
        passage: 'Matthew 4:18-25',
        title: 'Jesus Calls the First Disciples',
        notes: 'Amazing how the disciples immediately left everything to follow Jesus.',
        duration: 12,
        reflection: {
          keyVerse: 'Matthew 4:19',
          insight: 'Following Jesus requires immediate obedience',
          application: 'What is Jesus calling me to leave behind?'
        },
        tags: ['discipleship', 'calling', 'obedience']
      },
      {
        id: 'dev-003',
        date: '2025-01-13',
        completed: false,
        devotionPlan: 'Daily Bible Reading Plan',
        passage: 'Matthew 4:1-17',
        title: 'Jesus Tempted and Begins Ministry',
        notes: null,
        duration: 0,
        reflection: null,
        tags: []
      }
    ],
    statistics: {
      weeklyProgress: [
        { week: 'Jan 6-12', completed: 5, planned: 7, percentage: 71.4 },
        { week: 'Dec 30-Jan 5', completed: 6, planned: 7, percentage: 85.7 },
        { week: 'Dec 23-29', completed: 4, planned: 7, percentage: 57.1 }
      ],
      monthlyTrends: {
        january: { completed: 12, planned: 15, percentage: 80.0 },
        december: { completed: 26, planned: 31, percentage: 83.9 },
        november: { completed: 22, planned: 30, percentage: 73.3 }
      },
      favoritePassages: [
        'Psalms 23', 'John 3:16', 'Romans 8:28', 'Philippians 4:13'
      ],
      averageDuration: 14.2,
      topTags: ['grace', 'faith', 'discipleship', 'prayer', 'love']
    },
    readingPlans: [
      { id: 'plan-001', name: 'Daily Bible Reading Plan', progress: 15, totalDays: 365 },
      { id: 'plan-002', name: 'Psalms & Proverbs', progress: 42, totalDays: 62 },
      { id: 'plan-003', name: 'New Testament in 90 Days', progress: 8, totalDays: 90 }
    ],
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: 156,
      pages: Math.ceil(156 / parseInt(limit))
    }
  };

  console.log(`📖 Devotions: ${devotionsData.currentStreak} day streak, ${devotionsData.consistency}% consistency`);
  res.status(200).json(devotionsData);
});

// POST /api/journeys/devotions - Record new devotion entry
app.post('/api/journeys/devotions', (req, res) => {
  console.log('📖 New devotion entry requested');
  
  const {
    memberId,
    date,
    devotionPlan,
    passage,
    title,
    notes,
    duration,
    reflection,
    tags = []
  } = req.body;

  if (!memberId || !date || !passage) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'memberId, date, and passage are required',
      timestamp: new Date().toISOString()
    });
  }

  const newDevotion = {
    id: `dev-${Date.now()}`,
    memberId,
    date,
    completed: true,
    devotionPlan: devotionPlan || 'Personal Study',
    passage,
    title: title || 'Daily Devotion',
    notes: notes || null,
    duration: parseInt(duration) || 10,
    reflection: reflection || null,
    tags: Array.isArray(tags) ? tags : [],
    recordedAt: new Date().toISOString(),
    streakUpdated: true,
    encouragement: 'Great job staying consistent with your devotions!'
  };

  console.log(`📖 Devotion recorded: ${newDevotion.passage} (${newDevotion.duration} min)`);
  res.status(201).json(newDevotion);
});

// PUT /api/journeys/devotions/:id - Update devotion entry
app.put('/api/journeys/devotions/:id', (req, res) => {
  console.log(`📖 Update devotion ${req.params.id}`);
  
  const { notes, reflection, tags, duration } = req.body;
  
  const updatedDevotion = {
    id: req.params.id,
    memberId: 'member-123',
    date: '2025-01-15',
    passage: 'Matthew 5:1-16',
    title: 'The Beatitudes',
    notes: notes || 'Updated notes',
    duration: duration !== undefined ? parseInt(duration) : 15,
    reflection: reflection || {
      keyVerse: 'Matthew 5:9',
      insight: 'Updated insight',
      application: 'Updated application'
    },
    tags: tags || ['updated'],
    updatedAt: new Date().toISOString()
  };

  console.log(`📖 Devotion updated: ${updatedDevotion.id}`);
  res.status(200).json(updatedDevotion);
});

// GET /api/journeys/devotions/plans - Get available reading plans
app.get('/api/journeys/devotions/plans', (req, res) => {
  console.log('📚 Reading plans requested');
  
  const readingPlans = [
    {
      id: 'plan-001',
      name: 'Daily Bible Reading Plan',
      description: 'Read through the entire Bible in one year',
      duration: 365,
      difficulty: 'medium',
      category: 'full_bible',
      popularity: 4.8,
      enrolledCount: 247
    },
    {
      id: 'plan-002',
      name: 'Psalms & Proverbs',
      description: 'Read one Psalm and one Proverb chapter daily',
      duration: 62,
      difficulty: 'easy',
      category: 'wisdom',
      popularity: 4.6,
      enrolledCount: 189
    },
    {
      id: 'plan-003',
      name: 'New Testament in 90 Days',
      description: 'Complete the New Testament in three months',
      duration: 90,
      difficulty: 'hard',
      category: 'new_testament',
      popularity: 4.4,
      enrolledCount: 134
    },
    {
      id: 'plan-004',
      name: 'Jesus\' Life & Ministry',
      description: 'Follow Jesus through the Gospels',
      duration: 40,
      difficulty: 'easy',
      category: 'gospels',
      popularity: 4.7,
      enrolledCount: 203
    }
  ];

  console.log(`📚 ${readingPlans.length} reading plans available`);
  res.status(200).json({ plans: readingPlans });
});

// ========================================
// SPIRITUAL GIFTS ASSESSMENT SYSTEM
// ========================================

// GET /api/journeys/spiritual-gifts - Get spiritual gifts assessment results
app.get('/api/journeys/spiritual-gifts', (req, res) => {
  console.log('🎁 Spiritual gifts assessment results requested');
  
  const { memberId } = req.query;
  
  const giftsAssessment = {
    memberId: memberId || 'member-123',
    memberName: 'John Smith',
    lastAssessmentDate: '2024-11-15T10:30:00Z',
    assessmentVersion: '2.1',
    completionStatus: 'completed',
    primaryGifts: [
      {
        gift: 'Teaching',
        score: 92,
        strength: 'very_strong',
        description: 'Exceptional ability to explain complex spiritual concepts clearly',
        examples: [
          'Leading Bible study groups effectively',
          'Helping new members understand doctrine',
          'Creating educational materials'
        ],
        servingOpportunities: [
          'Adult Sunday School Teacher',
          'New Member Class Facilitator',
          'Youth Bible Study Leader'
        ]
      },
      {
        gift: 'Encouragement',
        score: 87,
        strength: 'strong',
        description: 'Natural ability to motivate and uplift others in their faith',
        examples: [
          'Providing comfort during difficult times',
          'Motivating others to spiritual growth',
          'Supporting struggling believers'
        ],
        servingOpportunities: [
          'Pastoral Care Team',
          'Grief Support Group Leader',
          'Prayer Ministry Coordinator'
        ]
      }
    ],
    secondaryGifts: [
      { gift: 'Leadership', score: 74, strength: 'moderate' },
      { gift: 'Hospitality', score: 69, strength: 'moderate' },
      { gift: 'Administration', score: 62, strength: 'developing' }
    ],
    giftCombination: {
      type: 'Teacher-Encourager',
      description: 'Natural educator who builds up others through instruction',
      idealRoles: [
        'Small Group Leader',
        'Mentorship Coordinator',
        'Discipleship Director'
      ]
    },
    growthAreas: [
      {
        area: 'Evangelism',
        currentScore: 45,
        suggestions: [
          'Practice sharing your testimony',
          'Join the outreach committee',
          'Attend evangelism training'
        ]
      },
      {
        area: 'Mercy',
        currentScore: 52,
        suggestions: [
          'Volunteer with community service projects',
          'Visit elderly or sick members',
          'Participate in compassion ministry'
        ]
      }
    ],
    personalityAlignment: {
      type: 'ENFJ',
      compatibility: 'high',
      notes: 'Your extroverted and feeling nature aligns well with teaching and encouragement gifts'
    },
    recommendations: [
      'Consider leading a small group Bible study',
      'Explore mentoring opportunities with new believers',
      'Develop your leadership gift through training programs',
      'Practice using your gifts outside your comfort zone'
    ]
  };

  console.log(`🎁 Gifts: Primary - ${giftsAssessment.primaryGifts.map(g => g.gift).join(', ')}`);
  res.status(200).json(giftsAssessment);
});

// POST /api/journeys/spiritual-gifts - Submit spiritual gifts assessment
app.post('/api/journeys/spiritual-gifts', (req, res) => {
  console.log('🎁 New spiritual gifts assessment submission');
  
  const {
    memberId,
    responses, // Array of question responses
    assessmentType = 'full'
  } = req.body;

  if (!memberId || !responses || !Array.isArray(responses)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'memberId and responses array are required',
      timestamp: new Date().toISOString()
    });
  }

  // Mock assessment processing
  const assessmentResult = {
    id: `assessment-${Date.now()}`,
    memberId,
    submittedAt: new Date().toISOString(),
    assessmentType,
    totalQuestions: responses.length,
    completionTime: '12 minutes',
    results: {
      topGift: 'Teaching',
      topScore: 92,
      confidence: 'high',
      processingStatus: 'completed'
    },
    nextSteps: [
      'Review your detailed results',
      'Explore recommended serving opportunities',
      'Schedule a meeting with pastoral staff',
      'Consider joining relevant ministry teams'
    ],
    followUpScheduled: true,
    reportGenerated: true,
    reportId: `report-${Date.now()}`
  };

  console.log(`🎁 Assessment processed: Top gift - ${assessmentResult.results.topGift}`);
  res.status(201).json(assessmentResult);
});

// GET /api/journeys/spiritual-gifts/questions - Get assessment questions
app.get('/api/journeys/spiritual-gifts/questions', (req, res) => {
  console.log('❓ Spiritual gifts assessment questions requested');
  
  const { assessmentType = 'full' } = req.query;
  
  const questions = [
    {
      id: 'q001',
      category: 'teaching',
      question: 'I enjoy explaining biblical concepts to others in a way they can understand.',
      type: 'likert_scale', // 1-5 scale
      required: true
    },
    {
      id: 'q002',
      category: 'encouragement',
      question: 'People often come to me when they need emotional or spiritual support.',
      type: 'likert_scale',
      required: true
    },
    {
      id: 'q003',
      category: 'leadership',
      question: 'I naturally take charge in group situations and help organize activities.',
      type: 'likert_scale',
      required: true
    },
    {
      id: 'q004',
      category: 'mercy',
      question: 'I feel deeply moved when I see people suffering and want to help.',
      type: 'likert_scale',
      required: true
    },
    {
      id: 'q005',
      category: 'evangelism',
      question: 'I feel comfortable sharing my faith with non-believers.',
      type: 'likert_scale',
      required: true
    }
  ];

  const assessmentInfo = {
    assessmentType,
    totalQuestions: questions.length,
    estimatedTime: '10-15 minutes',
    instructions: 'Rate each statement from 1 (strongly disagree) to 5 (strongly agree) based on how it describes you.',
    questions: questions.slice(0, assessmentType === 'quick' ? 15 : questions.length)
  };

  console.log(`❓ ${assessmentInfo.questions.length} questions provided`);
  res.status(200).json(assessmentInfo);
});

// ========================================
// SERVING OPPORTUNITIES SYSTEM
// ========================================

// GET /api/journeys/serving-opportunities - Get available serving opportunities
app.get('/api/journeys/serving-opportunities', (req, res) => {
  console.log('🤝 Serving opportunities requested');
  
  const { 
    category = 'all', 
    timeCommitment = 'all',
    skillLevel = 'all',
    spiritualGift = 'all',
    page = 1,
    limit = 20 
  } = req.query;

  const opportunities = [
    {
      id: 'opp-001',
      title: 'Children\'s Sunday School Teacher',
      category: 'education',
      description: 'Teach Sunday school for ages 6-10, helping children learn biblical stories and principles',
      timeCommitment: {
        frequency: 'weekly',
        duration: '1.5 hours',
        schedule: 'Sunday mornings 9:00-10:30 AM'
      },
      requirements: {
        spiritualGifts: ['Teaching', 'Mercy', 'Encouragement'],
        skills: ['Communication', 'Patience', 'Creativity'],
        experience: 'beginner',
        backgroundCheck: true,
        training: 'required'
      },
      team: {
        leader: 'Sarah Johnson',
        currentMembers: 4,
        needsMembers: 2,
        urgency: 'high'
      },
      impact: {
        description: 'Directly influence young hearts and minds for Christ',
        recentTestimonial: 'My daughter loves her Sunday school class and quotes Bible verses at home!'
      },
      nextSteps: [
        'Complete background check',
        'Attend children\'s ministry orientation',
        'Shadow current teacher for 2 weeks'
      ]
    },
    {
      id: 'opp-002',
      title: 'Worship Team Vocalist',
      category: 'worship',
      description: 'Join our worship team as a backup vocalist for Sunday services',
      timeCommitment: {
        frequency: 'bi-weekly',
        duration: '3 hours',
        schedule: 'Rehearsal Thursday 7-9 PM, Service Sunday 8:30-11:30 AM'
      },
      requirements: {
        spiritualGifts: ['Music', 'Worship'],
        skills: ['Singing', 'Harmony', 'Stage Presence'],
        experience: 'intermediate',
        backgroundCheck: false,
        training: 'optional'
      },
      team: {
        leader: 'David Chen',
        currentMembers: 6,
        needsMembers: 2,
        urgency: 'medium'
      },
      impact: {
        description: 'Lead the congregation in worship and create an atmosphere for God\'s presence',
        recentTestimonial: 'The worship team helps me connect with God every Sunday morning'
      },
      nextSteps: [
        'Audition with worship leader',
        'Attend rehearsal as observer',
        'Commit to 6-month term'
      ]
    },
    {
      id: 'opp-003',
      title: 'Community Food Pantry Volunteer',
      category: 'outreach',
      description: 'Help distribute food to families in need in our local community',
      timeCommitment: {
        frequency: 'monthly',
        duration: '3 hours',
        schedule: 'Second Saturday of each month, 9 AM - 12 PM'
      },
      requirements: {
        spiritualGifts: ['Mercy', 'Service', 'Helps'],
        skills: ['Organization', 'Compassion', 'Physical Labor'],
        experience: 'beginner',
        backgroundCheck: false,
        training: 'basic'
      },
      team: {
        leader: 'Maria Rodriguez',
        currentMembers: 12,
        needsMembers: 3,
        urgency: 'low'
      },
      impact: {
        description: 'Provide practical help and show Christ\'s love to struggling families',
        recentTestimonial: 'This ministry showed me God\'s love when my family was going through a tough time'
      },
      nextSteps: [
        'Attend volunteer orientation',
        'Complete food safety training',
        'Join WhatsApp volunteer group'
      ]
    }
  ];

  const servingData = {
    category,
    timeCommitment,
    skillLevel,
    spiritualGift,
    totalOpportunities: opportunities.length,
    opportunities: opportunities,
    categories: [
      { id: 'education', name: 'Education & Teaching', count: 8 },
      { id: 'worship', name: 'Worship & Arts', count: 6 },
      { id: 'outreach', name: 'Outreach & Evangelism', count: 12 },
      { id: 'pastoral_care', name: 'Pastoral Care', count: 7 },
      { id: 'administration', name: 'Administration', count: 4 },
      { id: 'hospitality', name: 'Hospitality', count: 9 }
    ],
    urgentNeeds: [
      'Children\'s Sunday School Teacher',
      'Parking Lot Attendant',
      'Audio/Visual Technician'
    ],
    matchedGifts: spiritualGift !== 'all' ? [spiritualGift] : [],
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: opportunities.length,
      pages: Math.ceil(opportunities.length / parseInt(limit))
    }
  };

  console.log(`🤝 ${servingData.totalOpportunities} serving opportunities available`);
  res.status(200).json(servingData);
});

// POST /api/journeys/serving-opportunities/:id/apply - Apply for serving opportunity
app.post('/api/journeys/serving-opportunities/:id/apply', (req, res) => {
  console.log(`🤝 Application for serving opportunity ${req.params.id}`);
  
  const {
    memberId,
    memberName,
    motivation,
    availability,
    experience,
    questions
  } = req.body;

  if (!memberId) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'memberId is required',
      timestamp: new Date().toISOString()
    });
  }

  const application = {
    id: `app-${Date.now()}`,
    opportunityId: req.params.id,
    memberId,
    memberName,
    motivation: motivation || '',
    availability: availability || {},
    experience: experience || '',
    questions: questions || '',
    applicationDate: new Date().toISOString(),
    status: 'pending_review',
    nextSteps: [
      'Team leader will review your application',
      'You may be contacted for an interview',
      'Background check will be initiated if required',
      'Training will be scheduled upon approval'
    ],
    expectedResponseTime: '3-5 business days',
    contactPerson: {
      name: 'Ministry Coordinator',
      email: 'ministry@faithlink.org',
      phone: '+1-555-MINISTRY'
    }
  };

  console.log(`🤝 Application submitted: ${application.id} by ${memberName}`);
  res.status(201).json(application);
});

// ========================================
// JOURNEY MILESTONE TRACKING SYSTEM
// ========================================

// GET /api/journeys/milestones - Get journey milestones for member
app.get('/api/journeys/milestones', (req, res) => {
  console.log('🎯 Journey milestones requested');
  
  const { memberId } = req.query;
  
  const milestonesData = {
    memberId: memberId || 'member-123',
    memberName: 'John Smith',
    journeyStartDate: '2024-03-15T00:00:00Z',
    currentPhase: 'Growing',
    overallProgress: 67.5,
    milestones: [
      {
        id: 'milestone-001',
        category: 'foundation',
        title: 'Welcome & Orientation',
        description: 'Complete church welcome process and new member orientation',
        status: 'completed',
        completedDate: '2024-03-22T10:30:00Z',
        progress: 100,
        requirements: [
          { task: 'Attend welcome service', completed: true },
          { task: 'Meet with pastor', completed: true },
          { task: 'Complete member form', completed: true },
          { task: 'Receive welcome packet', completed: true }
        ]
      },
      {
        id: 'milestone-002',
        category: 'foundation',
        title: 'Spiritual Foundations',
        description: 'Establish regular spiritual disciplines and biblical understanding',
        status: 'completed',
        completedDate: '2024-05-18T00:00:00Z',
        progress: 100,
        requirements: [
          { task: 'Complete baptism', completed: true },
          { task: 'Start daily devotions (30 days)', completed: true },
          { task: 'Attend foundations class', completed: true },
          { task: 'Read through one Gospel', completed: true }
        ]
      },
      {
        id: 'milestone-003',
        category: 'connection',
        title: 'Community Connection',
        description: 'Build meaningful relationships within the church community',
        status: 'in_progress',
        completedDate: null,
        progress: 75,
        requirements: [
          { task: 'Join a small group', completed: true },
          { task: 'Attend fellowship events (3)', completed: true },
          { task: 'Make 3 church friendships', completed: true },
          { task: 'Invite someone to church', completed: false }
        ]
      },
      {
        id: 'milestone-004',
        category: 'growth',
        title: 'Spiritual Discovery',
        description: 'Discover spiritual gifts and begin serving in ministry',
        status: 'in_progress',
        completedDate: null,
        progress: 60,
        requirements: [
          { task: 'Take spiritual gifts assessment', completed: true },
          { task: 'Meet with ministry leader', completed: true },
          { task: 'Begin serving in ministry', completed: false },
          { task: 'Complete 20 hours of service', completed: false }
        ]
      },
      {
        id: 'milestone-005',
        category: 'leadership',
        title: 'Leadership Development',
        description: 'Develop leadership skills and mentor others',
        status: 'not_started',
        completedDate: null,
        progress: 0,
        requirements: [
          { task: 'Complete leadership training', completed: false },
          { task: 'Lead a small group or ministry', completed: false },
          { task: 'Mentor a new member', completed: false },
          { task: 'Participate in church governance', completed: false }
        ]
      }
    ],
    phaseDefinitions: [
      { phase: 'Foundation', description: 'Getting established in faith and community', color: '#4CAF50' },
      { phase: 'Connection', description: 'Building relationships and finding belonging', color: '#2196F3' },
      { phase: 'Growing', description: 'Discovering gifts and growing in service', color: '#FF9800' },
      { phase: 'Leadership', description: 'Leading others and multiplying ministry', color: '#9C27B0' },
      { phase: 'Legacy', description: 'Mentoring leaders and leaving a lasting impact', color: '#F44336' }
    ],
    nextActions: [
      'Invite a friend or neighbor to church',
      'Begin serving in children\'s ministry',
      'Complete remaining 10 service hours',
      'Consider leadership training program'
    ],
    encouragement: 'You\'re making great progress on your spiritual journey! Keep growing in your relationship with God and others.'
  };

  console.log(`🎯 Milestones: ${milestonesData.overallProgress}% overall progress, ${milestonesData.currentPhase} phase`);
  res.status(200).json(milestonesData);
});

// PUT /api/journeys/milestones/:id - Update milestone progress
app.put('/api/journeys/milestones/:id', (req, res) => {
  console.log(`🎯 Update milestone ${req.params.id}`);
  
  const { 
    status,
    completedRequirements = [],
    notes,
    celebrationMessage
  } = req.body;

  const updatedMilestone = {
    id: req.params.id,
    category: 'growth',
    title: 'Spiritual Discovery',
    status: status || 'in_progress',
    progress: status === 'completed' ? 100 : 75,
    completedDate: status === 'completed' ? new Date().toISOString() : null,
    updatedAt: new Date().toISOString(),
    notes: notes || null,
    celebrationMessage: celebrationMessage || 'Great progress on your spiritual journey!',
    nextMilestone: status === 'completed' ? 'Leadership Development' : null,
    rewardsUnlocked: status === 'completed' ? ['Service Leader Badge', 'Growth Certificate'] : []
  };

  console.log(`🎯 Milestone updated: ${updatedMilestone.id} - ${updatedMilestone.status}`);
  res.status(200).json(updatedMilestone);
});

// ========================================
// SPIRITUAL GROWTH ANALYTICS SYSTEM
// ========================================

// GET /api/journeys/analytics - Get comprehensive spiritual growth analytics
app.get('/api/journeys/analytics', (req, res) => {
  console.log('📊 Spiritual growth analytics requested');
  
  const { memberId, period = 'year' } = req.query;
  
  const analyticsData = {
    memberId: memberId || 'member-123',
    memberName: 'John Smith',
    period,
    generatedAt: new Date().toISOString(),
    overviewMetrics: {
      overallGrowthScore: 8.2,
      growthTrend: 'increasing',
      consistencyRating: 'excellent',
      engagementLevel: 'high',
      spiritualMaturityLevel: 'growing',
      activeDays: 287,
      totalActiveDays: 365
    },
    devotionalAnalytics: {
      totalDevotions: 156,
      currentStreak: 12,
      longestStreak: 28,
      averagePerWeek: 4.2,
      consistencyTrend: 'improving',
      favoriteBooks: [
        { book: 'Psalms', count: 23, percentage: 14.7 },
        { book: 'Matthew', count: 18, percentage: 11.5 },
        { book: 'Romans', count: 15, percentage: 9.6 }
      ],
      averageDuration: 14.2,
      reflectionQuality: {
        score: 7.8,
        improvement: 'steady',
        keyInsights: 'Strong personal application focus'
      }
    },
    serviceAnalytics: {
      totalHours: 47,
      activeMinistries: 2,
      servingConsistency: 8.5,
      impactScore: 9.1,
      leadershipDevelopment: 'emerging',
      ministryAreas: [
        { area: 'Children\'s Ministry', hours: 32, growth: 'strong' },
        { area: 'Worship Team', hours: 15, growth: 'steady' }
      ],
      feedbackScore: 4.7,
      teamCollaboration: 'excellent'
    },
    milestoneProgress: {
      currentPhase: 'Growing',
      overallProgress: 67.5,
      completedMilestones: 2,
      inProgressMilestones: 2,
      upcomingMilestones: 1,
      projectedCompletion: '2025-08-15T00:00:00Z',
      accelerationFactor: 1.15
    },
    spiritualGiftsUtilization: {
      primaryGifts: ['Teaching', 'Encouragement'],
      utilizationScore: 8.4,
      growthAreas: ['Leadership', 'Evangelism'],
      developmentPlan: 'Focused on expanding teaching opportunities',
      giftAlignment: 'strong'
    },
    communityEngagement: {
      smallGroupParticipation: 'active',
      fellowshipAttendance: 78.3,
      relationshipBuilding: 'strong',
      mentorshipInvolvement: 'developing',
      prayerPartnership: 'active'
    },
    growthPatterns: {
      seasonalTrends: [
        { season: 'Winter', growthRate: 6.8 },
        { season: 'Spring', growthRate: 8.1 },
        { season: 'Summer', growthRate: 7.9 },
        { season: 'Fall', growthRate: 8.7 }
      ],
      weeklyPatterns: {
        mostActiveDay: 'Sunday',
        consistentDays: ['Tuesday', 'Thursday', 'Sunday'],
        challengingDays: ['Saturday', 'Monday']
      },
      growthAccelerators: [
        'Consistent devotional time',
        'Active service participation',
        'Small group engagement',
        'Regular fellowship'
      ],
      potentialBarriers: [
        'Weekend schedule conflicts',
        'Work stress periods',
        'Travel disruptions'
      ]
    },
    recommendations: [
      {
        category: 'devotional',
        priority: 'high',
        suggestion: 'Consider joining the early morning prayer group',
        expectedImpact: 'Strengthen consistency and community connection'
      },
      {
        category: 'service',
        priority: 'medium',
        suggestion: 'Explore leadership opportunities in children\'s ministry',
        expectedImpact: 'Develop leadership gifts and expand influence'
      },
      {
        category: 'growth',
        priority: 'high',
        suggestion: 'Begin mentoring a new believer',
        expectedImpact: 'Accelerate spiritual maturity through teaching others'
      }
    ],
    predictiveInsights: {
      nextMilestoneETA: '2025-04-15T00:00:00Z',
      potentialLeadershipReadiness: '2025-09-01T00:00:00Z',
      riskFactors: ['schedule consistency', 'leadership confidence'],
      growthOpportunities: ['teaching expansion', 'mentorship', 'small group leadership']
    }
  };

  console.log(`📊 Analytics: ${analyticsData.overviewMetrics.overallGrowthScore}/10 growth score, ${analyticsData.overviewMetrics.spiritualMaturityLevel} level`);
  res.status(200).json(analyticsData);
});

// GET /api/journeys/analytics/trends - Get detailed growth trends over time
app.get('/api/journeys/analytics/trends', (req, res) => {
  console.log('📈 Growth trends analytics requested');
  
  const { memberId, timeframe = '12months' } = req.query;
  
  const trendsData = {
    memberId: memberId || 'member-123',
    timeframe,
    dataPoints: [
      { month: '2024-01', growthScore: 6.2, devotions: 18, serviceHours: 2 },
      { month: '2024-02', growthScore: 6.8, devotions: 22, serviceHours: 3 },
      { month: '2024-03', growthScore: 7.1, devotions: 24, serviceHours: 4 },
      { month: '2024-04', growthScore: 7.4, devotions: 21, serviceHours: 5 },
      { month: '2024-05', growthScore: 7.8, devotions: 26, serviceHours: 4 },
      { month: '2024-06', growthScore: 8.0, devotions: 25, serviceHours: 6 },
      { month: '2024-07', growthScore: 8.1, devotions: 23, serviceHours: 5 },
      { month: '2024-08', growthScore: 8.3, devotions: 27, serviceHours: 7 },
      { month: '2024-09', growthScore: 8.0, devotions: 20, serviceHours: 4 },
      { month: '2024-10', growthScore: 8.4, devotions: 26, serviceHours: 6 },
      { month: '2024-11', growthScore: 8.6, devotions: 28, serviceHours: 8 },
      { month: '2024-12', growthScore: 8.2, devotions: 24, serviceHours: 5 }
    ],
    trendAnalysis: {
      overallDirection: 'upward',
      growthRate: 2.8,
      volatility: 'low',
      seasonalPatterns: 'fall_peak',
      correlations: {
        devotionsToGrowth: 0.73,
        serviceToGrowth: 0.68,
        combinedImpact: 0.84
      }
    }
  };

  console.log('📈 Trends: Overall upward growth with fall peak pattern');
  res.status(200).json(trendsData);
});

// ========================================
// PERSONAL REFLECTION & NOTES SYSTEM
// ========================================

// GET /api/journeys/reflections - Get personal reflections and notes
app.get('/api/journeys/reflections', (req, res) => {
  console.log('📝 Personal reflections requested');
  
  const { 
    memberId, 
    category = 'all', 
    dateRange = '30days',
    page = 1, 
    limit = 20 
  } = req.query;

  const reflectionsData = {
    memberId: memberId || 'member-123',
    memberName: 'John Smith',
    category,
    dateRange,
    totalReflections: 43,
    reflections: [
      {
        id: 'ref-001',
        category: 'devotional',
        title: 'God\'s Grace in Difficult Times',
        content: 'Today\'s reading in Romans 8:28 really spoke to my heart. I\'ve been struggling with work stress lately, but I\'m reminded that God works all things together for good. I need to trust His plan even when I can\'t see it.',
        tags: ['grace', 'trust', 'work_stress', 'romans'],
        createdAt: '2025-01-15T07:30:00Z',
        updatedAt: '2025-01-15T07:30:00Z',
        relatedVerse: 'Romans 8:28',
        mood: 'hopeful',
        prayerRequests: ['Wisdom at work', 'Peace in uncertainty'],
        actionItems: [
          'Memorize Romans 8:28',
          'Share with small group this week'
        ],
        isPrivate: false,
        shareWithPastor: false
      },
      {
        id: 'ref-002',
        category: 'service',
        title: 'Children\'s Ministry Breakthrough',
        content: 'Had an amazing moment in Sunday School today. Little Emma finally understood the story of David and Goliath and connected it to facing her fear of the dark. Seeing her face light up reminded me why I love serving in children\'s ministry.',
        tags: ['childrens_ministry', 'breakthrough', 'david_goliath', 'fear'],
        createdAt: '2025-01-12T14:45:00Z',
        updatedAt: '2025-01-12T14:45:00Z',
        relatedVerse: '1 Samuel 17:45',
        mood: 'joyful',
        prayerRequests: ['Wisdom in teaching', 'Children\'s spiritual growth'],
        actionItems: [
          'Prepare more interactive lessons',
          'Follow up with Emma\'s parents'
        ],
        isPrivate: false,
        shareWithPastor: true
      },
      {
        id: 'ref-003',
        category: 'prayer',
        title: 'Answered Prayer - Job Situation',
        content: 'Praise God! The situation at work that I\'ve been praying about for weeks finally got resolved today. My boss apologized for the misunderstanding and I got the project assignment I wanted. God\'s timing is perfect.',
        tags: ['answered_prayer', 'work', 'timing', 'praise'],
        createdAt: '2025-01-10T19:20:00Z',
        updatedAt: '2025-01-10T19:20:00Z',
        relatedVerse: 'Philippians 4:19',
        mood: 'grateful',
        prayerRequests: [],
        actionItems: [
          'Share testimony with small group',
          'Write thank you note to prayer partners'
        ],
        isPrivate: false,
        shareWithPastor: false
      }
    ],
    categories: [
      { id: 'devotional', name: 'Devotional Insights', count: 18 },
      { id: 'prayer', name: 'Prayer & Answered Prayer', count: 12 },
      { id: 'service', name: 'Service Reflections', count: 8 },
      { id: 'growth', name: 'Personal Growth', count: 5 }
    ],
    recentTags: ['grace', 'trust', 'answered_prayer', 'service', 'growth'],
    statistics: {
      averagePerWeek: 3.2,
      longestReflection: 287, // words
      mostActiveCategory: 'devotional',
      privateReflections: 8,
      sharedWithPastor: 3,
      actionItemsCompleted: 15,
      actionItemsPending: 7
    },
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: 43,
      pages: Math.ceil(43 / parseInt(limit))
    }
  };

  console.log(`📝 Reflections: ${reflectionsData.totalReflections} total, ${reflectionsData.statistics.averagePerWeek} per week`);
  res.status(200).json(reflectionsData);
});

// POST /api/journeys/reflections - Create new personal reflection
app.post('/api/journeys/reflections', (req, res) => {
  console.log('📝 New reflection entry requested');
  
  const {
    memberId,
    category,
    title,
    content,
    tags = [],
    relatedVerse,
    mood,
    prayerRequests = [],
    actionItems = [],
    isPrivate = false,
    shareWithPastor = false
  } = req.body;

  if (!memberId || !title || !content) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'memberId, title, and content are required',
      timestamp: new Date().toISOString()
    });
  }

  const newReflection = {
    id: `ref-${Date.now()}`,
    memberId,
    category: category || 'personal',
    title,
    content,
    tags: Array.isArray(tags) ? tags : [],
    relatedVerse: relatedVerse || null,
    mood: mood || 'neutral',
    prayerRequests: Array.isArray(prayerRequests) ? prayerRequests : [],
    actionItems: Array.isArray(actionItems) ? actionItems.map((item, index) => ({
      id: `action-${Date.now()}-${index}`,
      text: item,
      completed: false,
      createdAt: new Date().toISOString()
    })) : [],
    isPrivate,
    shareWithPastor,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    wordCount: content.split(' ').length,
    encouragement: 'Your reflection has been saved. Keep growing in your walk with God!'
  };

  console.log(`📝 Reflection created: "${newReflection.title}" (${newReflection.wordCount} words)`);
  res.status(201).json(newReflection);
});

// PUT /api/journeys/reflections/:id - Update reflection
app.put('/api/journeys/reflections/:id', (req, res) => {
  console.log(`📝 Update reflection ${req.params.id}`);
  
  const { 
    title, 
    content, 
    tags, 
    mood, 
    prayerRequests, 
    actionItems,
    isPrivate,
    shareWithPastor 
  } = req.body;

  const updatedReflection = {
    id: req.params.id,
    memberId: 'member-123',
    category: 'devotional',
    title: title || 'Updated Reflection',
    content: content || 'Updated content',
    tags: tags || ['updated'],
    mood: mood || 'peaceful',
    prayerRequests: prayerRequests || [],
    actionItems: actionItems || [],
    isPrivate: isPrivate !== undefined ? isPrivate : false,
    shareWithPastor: shareWithPastor !== undefined ? shareWithPastor : false,
    updatedAt: new Date().toISOString(),
    wordCount: content ? content.split(' ').length : 50,
    editHistory: {
      lastEditedAt: new Date().toISOString(),
      editCount: 1
    }
  };

  console.log(`📝 Reflection updated: ${updatedReflection.id}`);
  res.status(200).json(updatedReflection);
});

// DELETE /api/journeys/reflections/:id - Delete reflection
app.delete('/api/journeys/reflections/:id', (req, res) => {
  console.log(`📝 Delete reflection ${req.params.id}`);
  
  const deletedReflection = {
    id: req.params.id,
    deletedAt: new Date().toISOString(),
    message: 'Reflection deleted successfully',
    recoverable: true,
    recoveryPeriod: '30 days'
  };

  console.log(`📝 Reflection deleted: ${deletedReflection.id}`);
  res.status(200).json(deletedReflection);
});

// PUT /api/journeys/reflections/:id/actions/:actionId - Update action item
app.put('/api/journeys/reflections/:id/actions/:actionId', (req, res) => {
  console.log(`✅ Update action item ${req.params.actionId} in reflection ${req.params.id}`);
  
  const { completed, text } = req.body;
  
  const updatedAction = {
    id: req.params.actionId,
    reflectionId: req.params.id,
    text: text || 'Updated action item',
    completed: completed !== undefined ? completed : false,
    updatedAt: new Date().toISOString(),
    completedAt: completed ? new Date().toISOString() : null,
    encouragement: completed ? 'Great job completing this action item!' : null
  };

  console.log(`✅ Action item updated: ${updatedAction.id} - ${completed ? 'completed' : 'pending'}`);
  res.status(200).json(updatedAction);
});

// GET /api/journeys/reflections/export - Export reflections for backup
app.get('/api/journeys/reflections/export', (req, res) => {
  console.log('📤 Reflections export requested');
  
  const { memberId, format = 'json' } = req.query;
  
  const exportData = {
    memberId: memberId || 'member-123',
    exportedAt: new Date().toISOString(),
    format,
    totalReflections: 43,
    dateRange: {
      from: '2024-03-15T00:00:00Z',
      to: new Date().toISOString()
    },
    downloadUrl: `https://api.faithlink.org/exports/reflections-${memberId}-${Date.now()}.${format}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    fileSize: '2.3 MB',
    includePrivate: false, // Security: private reflections require additional authorization
    message: 'Your reflection export is ready for download'
  };

  console.log(`📤 Export generated: ${exportData.totalReflections} reflections, ${exportData.fileSize}`);
  res.status(200).json(exportData);
});

// ========================================
// END SPIRITUAL JOURNEY EXTENSIONS
// ========================================

// ========================================
// SPRINT 6: ADVANCED REPORTS & ANALYTICS
// ========================================

// ========================================
// MEMBER GROWTH ANALYTICS SYSTEM
// ========================================

// GET /api/reports/member-growth-trends - Long-term member growth analysis
app.get('/api/reports/member-growth-trends', (req, res) => {
  console.log('📈 Member growth trends analytics requested');
  
  const { timeframe = '12months', granularity = 'monthly' } = req.query;
  
  const growthTrends = {
    timeframe,
    granularity,
    generatedAt: new Date().toISOString(),
    summary: {
      totalMembers: 847,
      newMembersThisYear: 156,
      memberRetentionRate: 91.2,
      averageMonthlyGrowth: 4.8,
      growthTrend: 'steady_increase',
      projectedYearEndTotal: 925
    },
    monthlyData: [
      {
        period: '2024-01',
        totalMembers: 691,
        newMembers: 18,
        departedMembers: 3,
        netGrowth: 15,
        growthRate: 2.2,
        retentionRate: 95.7
      },
      {
        period: '2024-02', 
        totalMembers: 708,
        newMembers: 22,
        departedMembers: 5,
        netGrowth: 17,
        growthRate: 2.4,
        retentionRate: 94.1
      },
      {
        period: '2024-03',
        totalMembers: 731,
        newMembers: 29,
        departedMembers: 6,
        netGrowth: 23,
        growthRate: 3.2,
        retentionRate: 93.8
      },
      {
        period: '2024-04',
        totalMembers: 752,
        newMembers: 25,
        departedMembers: 4,
        netGrowth: 21,
        growthRate: 2.9,
        retentionRate: 94.9
      },
      {
        period: '2024-05',
        totalMembers: 768,
        newMembers: 19,
        departedMembers: 3,
        netGrowth: 16,
        growthRate: 2.1,
        retentionRate: 95.8
      },
      {
        period: '2024-06',
        totalMembers: 785,
        newMembers: 21,
        departedMembers: 4,
        netGrowth: 17,
        growthRate: 2.2,
        retentionRate: 94.7
      },
      {
        period: '2024-07',
        totalMembers: 803,
        newMembers: 24,
        departedMembers: 6,
        netGrowth: 18,
        growthRate: 2.3,
        retentionRate: 93.2
      },
      {
        period: '2024-08',
        totalMembers: 819,
        newMembers: 20,
        departedMembers: 4,
        netGrowth: 16,
        growthRate: 2.0,
        retentionRate: 95.1
      },
      {
        period: '2024-09',
        totalMembers: 832,
        newMembers: 17,
        departedMembers: 4,
        netGrowth: 13,
        growthRate: 1.6,
        retentionRate: 94.8
      },
      {
        period: '2024-10',
        totalMembers: 841,
        newMembers: 14,
        departedMembers: 5,
        netGrowth: 9,
        growthRate: 1.1,
        retentionRate: 93.5
      },
      {
        period: '2024-11',
        totalMembers: 847,
        newMembers: 12,
        departedMembers: 6,
        netGrowth: 6,
        growthRate: 0.7,
        retentionRate: 92.9
      },
      {
        period: '2024-12',
        totalMembers: 847,
        newMembers: 8,
        departedMembers: 8,
        netGrowth: 0,
        growthRate: 0.0,
        retentionRate: 90.5
      }
    ],
    demographicBreakdown: {
      ageGroups: [
        { range: '18-25', members: 89, percentage: 10.5, growth: 'high' },
        { range: '26-35', members: 186, percentage: 22.0, growth: 'steady' },
        { range: '36-50', members: 271, percentage: 32.0, growth: 'moderate' },
        { range: '51-65', members: 203, percentage: 26.0, growth: 'stable' },
        { range: '65+', members: 98, percentage: 11.6, growth: 'declining' }
      ],
      familyStatus: [
        { category: 'Single', members: 198, percentage: 23.4, growth: 'high' },
        { category: 'Married no children', members: 152, percentage: 17.9, growth: 'steady' },
        { category: 'Married with children', members: 387, percentage: 45.7, growth: 'moderate' },
        { category: 'Single parent', members: 74, percentage: 8.7, growth: 'stable' },
        { category: 'Widowed', members: 36, percentage: 4.3, growth: 'declining' }
      ],
      membershipLength: [
        { range: '0-1 year', members: 156, percentage: 18.4 },
        { range: '1-3 years', members: 203, percentage: 24.0 },
        { range: '3-7 years', members: 271, percentage: 32.0 },
        { range: '7-15 years', members: 152, percentage: 17.9 },
        { range: '15+ years', members: 65, percentage: 7.7 }
      ]
    },
    seasonalPatterns: {
      highGrowthPeriods: ['September', 'January', 'Easter'],
      lowGrowthPeriods: ['July', 'December', 'Summer'],
      averageSeasonalVariation: 2.8,
      peakGrowthMonth: 'September',
      lowestGrowthMonth: 'July'
    },
    churnAnalysis: {
      overallChurnRate: 8.8,
      churnByTenure: [
        { tenure: '0-6 months', churnRate: 23.1, reason: 'Lack of connection' },
        { tenure: '6-12 months', churnRate: 15.7, reason: 'Life changes' },
        { tenure: '1-3 years', churnRate: 8.9, reason: 'Relocation' },
        { tenure: '3+ years', churnRate: 3.2, reason: 'Doctrinal differences' }
      ],
      topChurnReasons: [
        'Relocation/moving away',
        'Life transitions',
        'Lack of community connection',
        'Schedule conflicts',
        'Doctrinal disagreements'
      ]
    },
    predictiveInsights: {
      projectedGrowth: {
        nextMonth: 8.2,
        next3Months: 24.7,
        next6Months: 47.3,
        nextYear: 92.1
      },
      riskFactors: [
        'Declining retention in holiday periods',
        'Slower integration of new members',
        'Limited small group capacity'
      ],
      opportunities: [
        'Strong young adult demographic growth',
        'High referral rates from existing families',
        'Increased community outreach effectiveness'
      ]
    }
  };

  console.log(`📈 Growth trends: ${growthTrends.summary.averageMonthlyGrowth}% avg monthly growth, ${growthTrends.summary.memberRetentionRate}% retention`);
  res.status(200).json(growthTrends);
});

// GET /api/reports/member-engagement-heatmaps - Member activity and engagement visualization
app.get('/api/reports/member-engagement-heatmaps', (req, res) => {
  console.log('🔥 Member engagement heatmaps requested');
  
  const { period = '30days', activityType = 'all' } = req.query;
  
  const engagementData = {
    period,
    activityType,
    generatedAt: new Date().toISOString(),
    overallEngagement: {
      averageScore: 7.8,
      highlyEngaged: 312, // 36.8% of members
      moderatelyEngaged: 387, // 45.7% 
      lowEngagement: 148, // 17.5%
      totalActiveMembers: 847
    },
    engagementByActivity: [
      {
        activity: 'Sunday Worship',
        participationRate: 78.4,
        avgFrequency: 3.2, // per month
        engagementScore: 8.9,
        trendDirection: 'stable'
      },
      {
        activity: 'Small Groups',
        participationRate: 42.6,
        avgFrequency: 2.8,
        engagementScore: 9.1,
        trendDirection: 'increasing'
      },
      {
        activity: 'Volunteer Service',
        participationRate: 31.4,
        avgFrequency: 1.9,
        engagementScore: 8.7,
        trendDirection: 'stable'
      },
      {
        activity: 'Events & Programs',
        participationRate: 56.8,
        avgFrequency: 1.4,
        engagementScore: 7.8,
        trendDirection: 'increasing'
      },
      {
        activity: 'Online Engagement',
        participationRate: 64.2,
        avgFrequency: 8.7, // per month
        engagementScore: 6.9,
        trendDirection: 'stable'
      }
    ],
    weeklyHeatmap: [
      // Sunday to Saturday, Hour 0-23
      {
        day: 'Sunday',
        hourlyActivity: [
          { hour: 8, activity: 24 }, { hour: 9, activity: 189 }, { hour: 10, activity: 456 },
          { hour: 11, activity: 398 }, { hour: 12, activity: 234 }, { hour: 13, activity: 89 },
          { hour: 14, activity: 67 }, { hour: 15, activity: 45 }, { hour: 16, activity: 78 },
          { hour: 17, activity: 123 }, { hour: 18, activity: 167 }, { hour: 19, activity: 89 }
        ]
      },
      {
        day: 'Wednesday', 
        hourlyActivity: [
          { hour: 18, activity: 67 }, { hour: 19, activity: 145 }, { hour: 20, activity: 178 },
          { hour: 21, activity: 89 }
        ]
      }
    ],
    ageGroupEngagement: [
      { ageRange: '18-25', engagementScore: 8.9, preferredActivities: ['Events', 'Small Groups', 'Online'] },
      { ageRange: '26-35', engagementScore: 8.2, preferredActivities: ['Small Groups', 'Volunteer', 'Worship'] },
      { ageRange: '36-50', engagementScore: 7.8, preferredActivities: ['Worship', 'Volunteer', 'Events'] },
      { ageRange: '51-65', engagementScore: 7.9, preferredActivities: ['Worship', 'Small Groups', 'Service'] },
      { ageRange: '65+', engagementScore: 8.4, preferredActivities: ['Worship', 'Fellowship', 'Service'] }
    ],
    engagementTrends: {
      monthlyChanges: [
        { month: 'September', change: +12.4, driver: 'Fall kickoff events' },
        { month: 'October', change: +8.7, driver: 'Small group launches' },
        { month: 'November', change: +3.2, driver: 'Thanksgiving activities' },
        { month: 'December', change: -5.8, driver: 'Holiday disruptions' },
        { month: 'January', change: +15.6, driver: 'New Year commitments' }
      ],
      correlations: [
        { factor: 'Small group participation', correlation: 0.89, impact: 'very_high' },
        { factor: 'Volunteer involvement', correlation: 0.76, impact: 'high' },
        { factor: 'Event attendance', correlation: 0.65, impact: 'moderate' },
        { factor: 'Online interaction', correlation: 0.54, impact: 'moderate' }
      ]
    },
    actionableInsights: [
      {
        priority: 'high',
        insight: 'Members in small groups show 89% higher overall engagement',
        recommendation: 'Focus on expanding small group capacity and participation'
      },
      {
        priority: 'medium', 
        insight: 'Wednesday evening activities have strong attendance but low online follow-up',
        recommendation: 'Implement post-event digital engagement strategies'
      },
      {
        priority: 'medium',
        insight: 'Young adults (18-25) show highest engagement but lowest retention after 18 months',
        recommendation: 'Develop targeted mentorship and leadership development programs'
      }
    ]
  };

  console.log(`🔥 Engagement: ${engagementData.overallEngagement.averageScore}/10 avg score, ${engagementData.overallEngagement.highlyEngaged} highly engaged members`);
  res.status(200).json(engagementData);
});

// ========================================
// ADVANCED GROUP HEALTH ANALYTICS SYSTEM
// ========================================

// GET /api/reports/group-health-detailed - Comprehensive group analytics and health metrics
app.get('/api/reports/group-health-detailed', (req, res) => {
  console.log('🏥 Advanced group health analytics requested');
  
  const { groupType = 'all', healthMetric = 'all' } = req.query;
  
  const groupHealthData = {
    groupType,
    healthMetric,
    generatedAt: new Date().toISOString(),
    overallHealth: {
      averageHealthScore: 8.1,
      totalGroups: 47,
      healthyGroups: 34, // 72.3%
      needsAttention: 9,  // 19.1%
      critical: 4,        // 8.5%
      newGroupsLastYear: 12
    },
    groupsByType: [
      {
        type: 'Small Groups',
        count: 28,
        averageSize: 12.4,
        healthScore: 8.3,
        attendanceRate: 78.6,
        leadershipStability: 91.2,
        growthRate: 15.7
      },
      {
        type: 'Life Groups',
        count: 12,
        averageSize: 8.7,
        healthScore: 8.7,
        attendanceRate: 84.2,
        leadershipStability: 95.8,
        growthRate: 8.3
      },
      {
        type: 'Ministry Teams',
        count: 7,
        averageSize: 15.2,
        healthScore: 7.9,
        attendanceRate: 71.4,
        leadershipStability: 87.5,
        growthRate: 22.1
      }
    ],
    healthMetrics: [
      {
        groupId: 'sg-001',
        groupName: 'Young Professionals',
        type: 'Small Group',
        healthScore: 9.2,
        size: 14,
        leader: 'Sarah Johnson',
        metrics: {
          attendance: { rate: 89.3, trend: 'increasing', consistency: 'high' },
          engagement: { score: 9.4, participation: 92.1, discussion: 'excellent' },
          growth: { rate: 28.6, newMembers: 4, referrals: 7 },
          leadership: { effectiveness: 9.6, preparation: 'excellent', feedback: 4.8 },
          community: { connection: 8.9, support: 9.1, fellowship: 8.7 }
        },
        strengths: ['Strong leader', 'High engagement', 'Active community building'],
        challenges: ['Meeting space capacity', 'Scheduling conflicts'],
        recommendations: ['Consider multiplying into two groups', 'Develop apprentice leader']
      },
      {
        groupId: 'lg-003',
        groupName: 'Seasoned Saints',
        type: 'Life Group',
        healthScore: 8.8,
        size: 9,
        leader: 'Robert Chen',
        metrics: {
          attendance: { rate: 92.7, trend: 'stable', consistency: 'very_high' },
          engagement: { score: 8.9, participation: 88.9, discussion: 'good' },
          growth: { rate: 0.0, newMembers: 0, referrals: 2 },
          leadership: { effectiveness: 9.2, preparation: 'excellent', feedback: 4.9 },
          community: { connection: 9.4, support: 9.6, fellowship: 9.2 }
        },
        strengths: ['Deep relationships', 'Consistent attendance', 'Mutual support'],
        challenges: ['No growth', 'Aging demographics', 'Limited outreach'],
        recommendations: ['Focus on mentoring younger members', 'Intergenerational partnerships']
      },
      {
        groupId: 'mt-002',
        groupName: 'Worship Team',
        type: 'Ministry Team',
        healthScore: 7.4,
        size: 18,
        leader: 'David Martinez',
        metrics: {
          attendance: { rate: 67.8, trend: 'declining', consistency: 'medium' },
          engagement: { score: 8.2, participation: 72.2, discussion: 'good' },
          growth: { rate: 33.3, newMembers: 6, referrals: 3 },
          leadership: { effectiveness: 7.8, preparation: 'good', feedback: 4.2 },
          community: { connection: 7.1, support: 7.6, fellowship: 6.9 }
        },
        strengths: ['Growing membership', 'Skilled musicians', 'Heart for worship'],
        challenges: ['Inconsistent attendance', 'Scheduling conflicts', 'Leadership strain'],
        recommendations: ['Develop team leaders', 'Improve communication', 'Create backup scheduling']
      }
    ],
    leadershipAnalysis: {
      totalLeaders: 47,
      leaderRetention: 87.2,
      leaderSatisfaction: 8.4,
      leadershipDevelopment: {
        inTraining: 12,
        readyToLead: 8,
        needsMentoring: 15,
        burnoutRisk: 6
      },
      leadershipEffectiveness: [
        { effectiveness: 'excellent', count: 18, percentage: 38.3 },
        { effectiveness: 'good', count: 21, percentage: 44.7 },
        { effectiveness: 'needs_improvement', count: 6, percentage: 12.8 },
        { effectiveness: 'critical', count: 2, percentage: 4.3 }
      ]
    },
    groupLifecycle: {
      forming: { count: 8, avgAge: '2 months', healthScore: 6.8 },
      storming: { count: 6, avgAge: '6 months', healthScore: 7.2 },
      norming: { count: 15, avgAge: '14 months', healthScore: 8.1 },
      performing: { count: 14, avgAge: '3.2 years', healthScore: 8.9 },
      adjourning: { count: 4, avgAge: '5.8 years', healthScore: 7.6 }
    },
    satisfactionMetrics: {
      memberSatisfaction: 8.6,
      leaderSatisfaction: 8.4,
      netPromoterScore: 73,
      retentionRate: 89.4,
      complaintResolution: 94.7
    },
    predictiveInsights: {
      groupsAtRisk: [
        'mt-002: Worship Team - Leadership strain and declining attendance',
        'sg-007: College Students - Graduation transitions affecting stability',
        'lg-005: Empty Nesters - Lack of new member integration'
      ],
      growthOpportunities: [
        'sg-001: Young Professionals - Ready for multiplication',
        'mt-001: Children\'s Ministry - High demand for expansion',
        'lg-002: New Parents - Strong community building potential'
      ],
      resourceNeeds: [
        'Additional small group leaders (8 needed)',
        'Meeting space expansion (3 groups at capacity)',
        'Leadership development training (15 leaders need mentoring)'
      ]
    }
  };

  console.log(`🏥 Group Health: ${groupHealthData.overallHealth.averageHealthScore}/10 avg score, ${groupHealthData.overallHealth.healthyGroups}/${groupHealthData.overallHealth.totalGroups} healthy groups`);
  res.status(200).json(groupHealthData);
});

// ========================================
// SPIRITUAL JOURNEY ANALYTICS SYSTEM
// ========================================

// GET /api/reports/journey-completion-rates - Spiritual growth tracking and analytics
app.get('/api/reports/journey-completion-rates', (req, res) => {
  console.log('🎯 Spiritual journey completion analytics requested');
  
  const { timeframe = '6months', journeyType = 'all' } = req.query;
  
  const journeyAnalytics = {
    timeframe,
    journeyType,
    generatedAt: new Date().toISOString(),
    overallMetrics: {
      totalActiveJourneys: 312,
      completionRate: 68.4,
      averageCompletionTime: '4.2 months',
      memberParticipation: 36.8, // % of total members
      satisfactionScore: 8.7
    },
    journeyTemplates: [
      {
        templateId: 'jt-001',
        templateName: 'New Member Foundations',
        totalParticipants: 89,
        completedJourneys: 76,
        completionRate: 85.4,
        averageCompletionTime: '2.8 months',
        averageRating: 9.1,
        milestoneData: [
          { milestone: 'Church History & Values', completionRate: 96.6, avgTimeToComplete: '2 weeks' },
          { milestone: 'Small Group Integration', completionRate: 91.0, avgTimeToComplete: '4 weeks' },
          { milestone: 'Spiritual Gifts Discovery', completionRate: 87.6, avgTimeToComplete: '6 weeks' },
          { milestone: 'Service Opportunity Selection', completionRate: 78.7, avgTimeToComplete: '10 weeks' },
          { milestone: 'Mentorship Pairing', completionRate: 85.4, avgTimeToComplete: '12 weeks' }
        ]
      },
      {
        templateId: 'jt-002', 
        templateName: 'Leadership Development Track',
        totalParticipants: 67,
        completedJourneys: 41,
        completionRate: 61.2,
        averageCompletionTime: '6.8 months',
        averageRating: 8.9,
        milestoneData: [
          { milestone: 'Biblical Leadership Principles', completionRate: 89.6, avgTimeToComplete: '4 weeks' },
          { milestone: 'Communication & Conflict Resolution', completionRate: 82.1, avgTimeToComplete: '6 weeks' },
          { milestone: 'Team Building & Vision Casting', completionRate: 74.6, avgTimeToComplete: '8 weeks' },
          { milestone: 'Practical Ministry Experience', completionRate: 68.7, avgTimeToComplete: '12 weeks' },
          { milestone: 'Leadership Assessment & Feedback', completionRate: 61.2, avgTimeToComplete: '20 weeks' }
        ]
      },
      {
        templateId: 'jt-003',
        templateName: 'Discipleship Intensive',
        totalParticipants: 45,
        completedJourneys: 38,
        completionRate: 84.4,
        averageCompletionTime: '5.1 months',
        averageRating: 9.4,
        milestoneData: [
          { milestone: 'Bible Study Methods', completionRate: 97.8, avgTimeToComplete: '3 weeks' },
          { milestone: 'Prayer & Spiritual Disciplines', completionRate: 93.3, avgTimeToComplete: '5 weeks' },
          { milestone: 'Evangelism & Outreach Training', completionRate: 88.9, avgTimeToComplete: '8 weeks' },
          { milestone: 'Discipleship Practicum', completionRate: 86.7, avgTimeToComplete: '14 weeks' },
          { milestone: 'Ministry Calling Discernment', completionRate: 84.4, avgTimeToComplete: '18 weeks' }
        ]
      },
      {
        templateId: 'jt-004',
        templateName: 'Marriage Enrichment Journey',
        totalParticipants: 58,
        completedJourneys: 52,
        completionRate: 89.7,
        averageCompletionTime: '3.4 months',
        averageRating: 9.2,
        milestoneData: [
          { milestone: 'Communication Foundations', completionRate: 100.0, avgTimeToComplete: '2 weeks' },
          { milestone: 'Conflict Resolution Skills', completionRate: 96.6, avgTimeToComplete: '4 weeks' },
          { milestone: 'Financial Stewardship Together', completionRate: 93.1, avgTimeToComplete: '6 weeks' },
          { milestone: 'Spiritual Leadership in Marriage', completionRate: 91.4, avgTimeToComplete: '10 weeks' },
          { milestone: 'Legacy & Vision Planning', completionRate: 89.7, avgTimeToComplete: '12 weeks' }
        ]
      },
      {
        templateId: 'jt-005',
        templateName: 'Youth Leadership Pipeline',
        totalParticipants: 53,
        completedJourneys: 29,
        completionRate: 54.7,
        averageCompletionTime: '7.2 months',
        averageRating: 8.3,
        milestoneData: [
          { milestone: 'Identity in Christ', completionRate: 92.5, avgTimeToComplete: '3 weeks' },
          { milestone: 'Peer Leadership Skills', completionRate: 77.4, avgTimeToComplete: '6 weeks' },
          { milestone: 'Event Planning & Execution', completionRate: 69.8, avgTimeToComplete: '10 weeks' },
          { milestone: 'Mentoring Younger Students', completionRate: 62.3, avgTimeToComplete: '16 weeks' },
          { milestone: 'Transition to Adult Leadership', completionRate: 54.7, avgTimeToComplete: '24 weeks' }
        ]
      }
    ],
    completionPatterns: {
      dropoffPoints: [
        { stage: 'Initial commitment', dropoffRate: 8.7, commonReasons: ['Schedule conflicts', 'Overwhelming expectations'] },
        { stage: 'Mid-journey fatigue', dropoffRate: 15.3, commonReasons: ['Loss of motivation', 'Life changes'] },
        { stage: 'Practical application', dropoffRate: 12.1, commonReasons: ['Lack of opportunities', 'Insufficient support'] },
        { stage: 'Final milestones', dropoffRate: 6.8, commonReasons: ['Time constraints', 'Assessment anxiety'] }
      ],
      successFactors: [
        { factor: 'Mentor assignment', impactOnCompletion: +28.4 },
        { factor: 'Peer group participation', impactOnCompletion: +22.1 },
        { factor: 'Regular check-ins', impactOnCompletion: +19.7 },
        { factor: 'Flexible pacing', impactOnCompletion: +16.3 },
        { factor: 'Practical application opportunities', impactOnCompletion: +31.2 }
      ]
    },
    mentorshipImpact: {
      journeysWithMentors: 198,
      journeysWithoutMentors: 114,
      mentorshipCompletionRate: 82.3,
      noMentorCompletionRate: 46.5,
      mentorSatisfactionScore: 8.9,
      menteeSatisfactionScore: 9.2,
      mentorRetentionRate: 76.4
    },
    demographicBreakdown: {
      byAge: [
        { ageRange: '18-25', participants: 67, completionRate: 58.2, avgRating: 8.4 },
        { ageRange: '26-35', participants: 89, completionRate: 71.9, avgRating: 8.8 },
        { ageRange: '36-50', participants: 98, completionRate: 76.5, avgRating: 8.9 },
        { ageRange: '51-65', participants: 45, completionRate: 82.2, avgRating: 9.1 },
        { ageRange: '65+', participants: 13, completionRate: 92.3, avgRating: 9.4 }
      ],
      byMembershipLength: [
        { tenure: '0-1 year', participants: 78, completionRate: 85.9, avgRating: 9.0 },
        { tenure: '1-3 years', participants: 134, completionRate: 72.4, avgRating: 8.7 },
        { tenure: '3-7 years', participants: 67, completionRate: 59.7, avgRating: 8.5 },
        { tenure: '7+ years', participants: 33, completionRate: 48.5, avgRating: 8.9 }
      ]
    },
    outcomes: {
      postJourneyEngagement: {
        volunteering: +34.7, // % increase
        smallGroupParticipation: +28.3,
        leadershipRoles: +45.2,
        churchAttendance: +12.4,
        financialGiving: +18.9
      },
      spiritualGrowthIndicators: {
        prayerFrequency: +41.2,
        bibleStudyConsistency: +38.6,
        evangelismConfidence: +52.3,
        spiritualDisciplines: +29.8,
        communityInvolvement: +33.4
      }
    },
    recommendationsEngine: {
      templateImprovements: [
        'Add more flexible pacing options for Leadership Development Track',
        'Increase mentor assignment priority for Youth Leadership Pipeline',
        'Simplify initial commitment process to reduce early dropoff'
      ],
      resourceNeeds: [
        '12 additional mentors needed for optimal mentor-to-mentee ratios',
        'More small group leaders to support journey integration',
        'Digital platform improvements for progress tracking'
      ],
      opportunitiesIdentified: [
        'High success rate for older demographics suggests peer mentoring potential',
        'New member journeys show excellent completion - expand capacity',
        'Marriage enrichment has strong satisfaction - consider specialized tracks'
      ]
    }
  };

  console.log(`🎯 Journey Analytics: ${journeyAnalytics.overallMetrics.completionRate}% completion rate, ${journeyAnalytics.overallMetrics.totalActiveJourneys} active journeys`);
  res.status(200).json(journeyAnalytics);
});

// ========================================
// PREDICTIVE ANALYTICS SYSTEM
// ========================================

// GET /api/reports/predictive-insights - AI-driven predictive analytics and recommendations
app.get('/api/reports/predictive-insights', (req, res) => {
  console.log('🔮 Predictive insights analytics requested');
  
  const { analysisType = 'comprehensive', confidenceLevel = 'medium' } = req.query;
  
  const predictiveInsights = {
    analysisType,
    confidenceLevel,
    generatedAt: new Date().toISOString(),
    modelVersion: '2.1.4',
    dataConfidence: 87.3,
    predictionAccuracy: 84.6, // Based on historical validation
    
    membershipPredictions: {
      riskAnalysis: {
        membersAtRisk: [
          {
            memberId: 'mem-1847',
            memberName: 'Jessica Thompson',
            riskScore: 78.4,
            riskFactors: [
              'Declining attendance (40% drop in 3 months)',
              'No small group participation',
              'Missed last 2 events',
              'Reduced financial giving'
            ],
            predictedOutcome: 'Likely to become inactive within 60 days',
            confidenceLevel: 82.1,
            recommendedActions: [
              'Schedule pastoral care visit',
              'Connect with small group leader for invitation',
              'Follow up on recent life changes or challenges'
            ]
          },
          {
            memberId: 'mem-2156',
            memberName: 'Michael Rodriguez',
            riskScore: 65.8,
            riskFactors: [
              'Recent job change mentioned',
              'Attendance pattern shift to online only',
              'Decreased volunteer participation'
            ],
            predictedOutcome: 'May relocate or reduce involvement within 90 days',
            confidenceLevel: 71.3,
            recommendedActions: [
              'Check on job transition support needs',
              'Offer flexible involvement opportunities',
              'Connect with career transition support group'
            ]
          }
        ],
        totalMembersAtRisk: 23,
        riskCategories: [
          { category: 'Attendance decline', count: 12, avgRiskScore: 72.4 },
          { category: 'Life transitions', count: 8, avgRiskScore: 68.9 },
          { category: 'Engagement drop', count: 15, avgRiskScore: 69.7 },
          { category: 'Financial strain indicators', count: 6, avgRiskScore: 75.2 }
        ]
      },
      growthOpportunities: {
        highPotentialMembers: [
          {
            memberId: 'mem-3421',
            memberName: 'Amanda Clark',
            growthScore: 91.2,
            indicators: [
              'Consistent high engagement',
              'Natural leadership qualities observed',
              'Strong relational connections',
              'Expressed interest in ministry'
            ],
            predictedPath: 'Ready for leadership development within 3 months',
            confidenceLevel: 89.4,
            recommendedOpportunities: [
              'Leadership Development Track enrollment',
              'Small group leader apprenticeship',
              'Ministry team leadership role'
            ]
          },
          {
            memberId: 'mem-4089',
            memberName: 'David Park',
            growthScore: 87.6,
            indicators: [
              'Rapid spiritual maturity',
              'High volunteer consistency',
              'Excellent feedback from mentors',
              'Teaching gift identification'
            ],
            predictedPath: 'Excellent candidate for teaching ministry within 6 months',
            confidenceLevel: 82.8,
            recommendedOpportunities: [
              'Teaching practicum program',
              'Bible study leadership training',
              'Youth ministry involvement'
            ]
          }
        ],
        totalHighPotential: 34,
        readinessCategories: [
          { category: 'Leadership ready', count: 14, avgGrowthScore: 88.3 },
          { category: 'Teaching potential', count: 9, avgGrowthScore: 85.7 },
          { category: 'Mentorship capable', count: 18, avgGrowthScore: 82.1 },
          { category: 'Ministry leadership', count: 12, avgGrowthScore: 86.9 }
        ]
      }
    },
    
    groupHealthPredictions: {
      groupsNeedingIntervention: [
        {
          groupId: 'sg-007',
          groupName: 'College Students',
          interventionScore: 84.2,
          predictedIssues: [
            'Membership instability due to graduation transitions',
            'Leadership gap with senior students graduating',
            'Declining summer attendance patterns'
          ],
          timeframe: 'Next 4 months',
          recommendedInterventions: [
            'Recruit and train underclassmen leaders',
            'Develop summer engagement strategy',
            'Create alumni connection program'
          ],
          successProbability: 76.8
        },
        {
          groupId: 'mt-003',
          groupName: 'Children\'s Ministry Team',
          interventionScore: 79.1,
          predictedIssues: [
            'Volunteer burnout indicators rising',
            'Increased childcare demand vs. volunteer capacity',
            'Safety protocol compliance concerns'
          ],
          timeframe: 'Next 6 weeks',
          recommendedInterventions: [
            'Recruit additional volunteers immediately',
            'Implement volunteer rotation schedule',
            'Provide refresher training on safety protocols'
          ],
          successProbability: 82.4
        }
      ],
      
      multiplicationOpportunities: [
        {
          groupId: 'sg-001',
          groupName: 'Young Professionals',
          multiplicationScore: 92.7,
          readinessIndicators: [
            'At capacity with waiting list',
            'Apprentice leader fully trained',
            'Strong community and connection',
            'Members expressing readiness for leadership'
          ],
          recommendedTimeline: '4-6 weeks',
          projectedOutcome: 'Two healthy groups of 7-8 members each',
          successProbability: 91.3
        }
      ]
    },
    
    resourceAllocationInsights: {
      staffingPredictions: {
        criticalNeeds: [
          {
            role: 'Small Group Coordinator',
            urgency: 'high',
            predictedImpact: 'Group health scores projected to decline 15% without dedicated coordination',
            timeframe: 'Next 2 months',
            justification: 'Current volunteer coordinators showing signs of capacity limits'
          },
          {
            role: 'Youth Ministry Assistant',
            urgency: 'medium',
            predictedImpact: 'Youth engagement may plateau without additional support',
            timeframe: 'Next 6 months',
            justification: 'Growing youth population exceeding current staff capacity'
          }
        ],
        volunteermanagementOptimization: [
          'Implement volunteer rotation to prevent burnout (projected 23% improvement in retention)',
          'Create specialized training tracks (projected 18% increase in effectiveness)',
          'Develop volunteer recognition program (projected 31% improvement in satisfaction)'
        ]
      },
      
      facilityOptimization: {
        spaceUtilization: {
          currentEfficiency: 73.2,
          optimizationOpportunities: [
            'Reconfigure Fellowship Hall for multiple simultaneous small groups (+15% capacity)',
            'Add evening service to distribute Sunday morning capacity pressure',
            'Implement hybrid online/in-person options for overflow events'
          ],
          projectedImprovements: 'Up to 22% increase in effective capacity'
        },
        
        maintenancePredictions: [
          {
            item: 'HVAC System',
            predictedIssue: 'Maintenance required within 3-4 months',
            confidence: 78.9,
            estimatedCost: '$2,400-$3,800',
            impactIfDelayed: 'Potential system failure during peak summer usage'
          }
        ]
      }
    },
    
    eventAndProgramForecasting: {
      attendancePredictions: [
        {
          event: 'Spring Retreat 2025',
          predictedAttendance: 124,
          confidence: 85.2,
          factorsConsidered: [
            'Historical retreat attendance trends',
            'Current small group engagement levels',
            'Economic factors and pricing sensitivity',
            'Competing community events'
          ],
          recommendedActions: [
            'Set registration cap at 130 to account for no-shows',
            'Early bird pricing strategy to drive commitment',
            'Targeted outreach to high-engagement members'
          ]
        }
      ],
      
      programEffectiveness: [
        {
          program: 'New Member Integration',
          effectivenessScore: 78.4,
          trendDirection: 'improving',
          predictedChanges: [
            'Completion rates likely to increase 8-12% with current improvements',
            'Member retention post-program projected at 91.3%'
          ],
          optimizationOpportunities: [
            'Add peer buddy system (projected +15% satisfaction)',
            'Implement monthly check-ins (projected +11% retention)'
          ]
        }
      ]
    },
    
    financialTrendPredictions: {
      givingForecast: {
        nextQuarterProjection: '$127,400',
        confidence: 83.7,
        keyIndicators: [
          'Member engagement levels correlate strongly with giving patterns',
          'Economic conditions showing moderate positive impact',
          'New member integration creating additional giving base'
        ],
        riskFactors: [
          'Seasonal giving dip typically occurs in summer months',
          '3 major donors showing declining giving trends',
          'Potential economic headwinds in local job market'
        ]
      }
    },
    
    actionPriorities: [
      {
        priority: 1,
        action: 'Address at-risk member interventions immediately',
        timeframe: '2 weeks',
        expectedImpact: 'Prevent 15-20 member departures',
        resourcesRequired: 'Pastoral care team coordination'
      },
      {
        priority: 2,
        action: 'Begin leadership development for high-potential members',
        timeframe: '1 month',
        expectedImpact: 'Increase leadership capacity by 40%',
        resourcesRequired: 'Leadership development program resources'
      },
      {
        priority: 3,
        action: 'Implement volunteer optimization strategies',
        timeframe: '6 weeks',
        expectedImpact: 'Reduce volunteer burnout by 25%',
        resourcesRequired: 'Volunteer coordinator time and training materials'
      }
    ]
  };

  console.log(`🔮 Predictive: ${predictiveInsights.membershipPredictions.riskAnalysis.totalMembersAtRisk} at risk, ${predictiveInsights.membershipPredictions.growthOpportunities.totalHighPotential} high potential members`);
  res.status(200).json(predictiveInsights);
});

// ========================================
// END ADVANCED REPORTS & ANALYTICS
// ========================================

// ========================================
// MISSING INTEGRATION ENDPOINTS
// ========================================

// POST /api/journeys - Create/assign spiritual journey
app.post('/api/journeys', (req, res) => {
  console.log('🎯 Journey assignment requested');
  const { memberId, templateId, assignedBy, startDate } = req.body;
  
  if (!memberId || !templateId) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['memberId', 'templateId']
    });
  }

  const newJourney = {
    id: `journey-${Date.now()}`,
    memberId,
    templateId,
    assignedBy: assignedBy || 'system',
    startDate: startDate || new Date().toISOString().split('T')[0],
    status: 'active',
    progress: 0,
    createdAt: new Date().toISOString(),
    milestones: []
  };

  console.log(`🎯 Journey assigned: ${newJourney.id} to member ${memberId}`);
  res.status(201).json(newJourney);
});

// PUT /api/journeys/:id/progress - Update journey progress
app.put('/api/journeys/:id/progress', (req, res) => {
  console.log(`🎯 Journey progress update requested for ${req.params.id}`);
  const { milestoneId, status, completedDate, notes } = req.body;
  
  const progressUpdate = {
    journeyId: req.params.id,
    milestoneId,
    status,
    completedDate: completedDate || new Date().toISOString().split('T')[0],
    notes: notes || '',
    updatedAt: new Date().toISOString()
  };

  console.log(`🎯 Progress updated: ${milestoneId} marked as ${status}`);
  res.status(200).json(progressUpdate);
});

// Removed duplicate Event Registration endpoint - using the original one with updated validation

// POST /api/events/:id/check-in - Event check-in
app.post('/api/events/:eventId/check-in', (req, res) => {
  console.log(`✅ Event check-in requested for event ${req.params.eventId}`);
  const { memberId, checkInTime, checkInMethod } = req.body;
  
  const checkin = {
    id: `checkin-${Date.now()}`,
    eventId: req.params.eventId,
    memberId,
    checkInTime: checkInTime || new Date().toISOString(),
    checkInMethod: checkInMethod || 'manual',
    status: 'checked_in',
    processedBy: 'system'
  };

  console.log(`✅ Check-in processed: Member ${memberId} checked in to event ${req.params.eventId}`);
  res.status(200).json(checkin);
});

// POST /api/pastoral-care - Create pastoral care record
app.post('/api/pastoral-care', (req, res) => {
  console.log('💙 Pastoral care record creation requested');
  const { 
    memberId, 
    careType, 
    priority, 
    description, 
    assignedPastor, 
    status, 
    relatedTaskId 
  } = req.body;
  
  if (!memberId || !careType) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['memberId', 'careType']
    });
  }

  const careRecord = {
    id: `care-${Date.now()}`,
    memberId,
    careType,
    priority: priority || 'medium',
    description: description || '',
    assignedPastor: assignedPastor || 'unassigned',
    status: status || 'active',
    relatedTaskId,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    interactions: []
  };

  console.log(`💙 Care record created: ${careRecord.id} for member ${memberId}`);
  res.status(201).json(careRecord);
});

// PUT /api/pastoral-care/:id - Update pastoral care record
app.put('/api/pastoral-care/:id', (req, res) => {
  console.log(`💙 Pastoral care update requested for ${req.params.id}`);
  const updates = req.body;
  
  const updatedRecord = {
    id: req.params.id,
    ...updates,
    lastUpdated: new Date().toISOString()
  };

  console.log(`💙 Care record updated: ${req.params.id}`);
  res.status(200).json(updatedRecord);
});

// GET /api/members/profile - Member profile (for role-based testing)
app.get('/api/members/profile', (req, res) => {
  console.log('👤 Member profile requested');
  
  const profile = {
    id: 'mem-current',
    firstName: 'Test',
    lastName: 'User',
    email: 'test.user@faithlink.com',
    membershipStatus: 'active',
    joinDate: '2024-01-15',
    roles: ['member'],
    groups: [],
    journeys: []
  };

  res.status(200).json(profile);
});

// ========================================
// END MISSING INTEGRATION ENDPOINTS
// ========================================

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server with enhanced error handling
const server = app.listen(PORT, HOST, () => {
  console.log('✅ ========================================');
  console.log('✅ FaithLink360 Backend Server Started!');
  console.log('✅ ========================================');
  console.log(`📡 Server URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test API: http://localhost:${PORT}/api/test`);
  console.log(`👥 Members API: http://localhost:${PORT}/api/members`);
  console.log(`👨‍👩‍👧‍👦 Groups API: http://localhost:${PORT}/api/groups`);
  console.log(`📅 Events API: http://localhost:${PORT}/api/events`);
  console.log(`🌐 Binding: ${HOST}:${PORT}`);
  console.log(`📅 Started: ${new Date().toISOString()}`);
  console.log('✅ ========================================');
  
  console.log('🚀 Server ready to accept connections!');
});

server.on('error', (error) => {
  console.error('❌ ========================================');
  console.error('❌ Server Failed to Start!');
  console.error('❌ ========================================');
  console.error('❌ Error:', error.message);
  
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.error('💡 Try: netstat -ano | findstr ":8000"');
    console.error('💡 Then: taskkill /PID <PID> /F');
  } else if (error.code === 'EACCES') {
    console.error(`❌ Permission denied for port ${PORT}`);
    console.error('💡 Try running as administrator');
  }
  
  console.error('❌ ========================================');
});

server.on('listening', () => {
  console.log('🎯 Server is actively listening for connections');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down server gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
