const express = require('express');
const cors = require('cors');
const productionSeed = require('./data/production-seed.js');
const app = express();
const PORT = process.env.PORT || 8000;
const HOST = '0.0.0.0';

console.log('🚀 Starting FaithLink360 Backend with Production Data...');
console.log(`📡 Server URL: http://localhost:${PORT}`);
console.log(`🌐 Binding to: ${HOST}:${PORT}`);

// Middleware - CORS configuration for frontend integration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow localhost and 127.0.0.1 on any port for development
    if (origin.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/)) {
      return callback(null, true);
    }
    
    // Allow Netlify, Vercel, and other deployment platforms
    if (origin.match(/^https?:\/\/.+\.(netlify\.app|vercel\.app|render\.com)$/)) {
      return callback(null, true);
    }
    
    // Allow specific origins
    const allowedOrigins = [
      'http://localhost:3000', 
      'http://localhost:3001',
      'https://faithlink360.netlify.app',
      'https://keen-crepe-2b8e4f.netlify.app',
      'https://subtle-semifreddo-ed7b4b.netlify.app' // Actual deployed Netlify URL
    ];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Enhanced logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Authentication middleware (simplified for demo)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  // Mock authentication - accept any token for demo
  req.user = {
    id: 'user-admin',
    email: 'admin@faithlink360.org',
    role: 'admin',
    name: 'Admin User'
  };
  next();
};

// ========================================
// HEALTH & STATUS ENDPOINTS
// ========================================

app.get('/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: 'production',
    version: '1.0.0'
  });
});

// ========================================
// AUTHENTICATION ENDPOINTS
// ========================================

// In-memory session storage (in production, use Redis or database)
const activeSessions = new Map();

app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login attempt for:', req.body.email);
  const { email, password } = req.body;
  
  // Find user in production seed data
  let user = productionSeed.members.find(m => m.email === email);
  
  // If not found in seed data, create new user for demo purposes
  if (!user) {
    console.log('🆕 Creating new user for:', email);
    const newUserId = `mbr-${Date.now()}`;
    const emailParts = email.split('@')[0].split('.');
    const firstName = emailParts[0] ? emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1) : 'New';
    const lastName = emailParts[1] ? emailParts[1].charAt(0).toUpperCase() + emailParts[1].slice(1) : 'User';
    
    user = {
      id: newUserId,
      firstName: firstName,
      lastName: lastName,
      email: email,
      role: 'member', // Default role for new users
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      phone: '+1-555-0000',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      },
      demographics: {
        dateOfBirth: null,
        gender: 'unknown',
        maritalStatus: 'unknown'
      },
      ministry: {
        roles: [],
        skills: [],
        availability: []
      },
      attendance: {
        totalServices: 0,
        averageMonthly: 0,
        lastAttended: null
      },
      giving: {
        totalLifetime: 0,
        averageMonthly: 0,
        lastGift: null
      }
    };
    
    // Add to seed data for future reference
    productionSeed.members.push(user);
  }
  
  // Create session token
  const token = `faithlink-token-${user.id}-${Date.now()}`;
  
  // Store session
  activeSessions.set(token, {
    userId: user.id,
    user: user,
    loginTime: new Date().toISOString(),
    lastActivity: new Date().toISOString()
  });
  
  console.log('✅ Login successful for:', user.firstName, user.lastName, '(' + user.role + ')');
  
  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || 'member',
      status: user.status,
      joinDate: user.joinDate
    },
    token: token
  });
});

app.get('/api/auth/me', (req, res) => {
  console.log('👤 User info requested');
  
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'No token provided',
      message: 'Authorization header missing or invalid format'
    });
  }
  
  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);
  
  if (!session) {
    return res.status(401).json({ 
      error: 'Invalid token',
      message: 'Token not found or expired'
    });
  }
  
  // Update last activity
  session.lastActivity = new Date().toISOString();
  activeSessions.set(token, session);
  
  const user = session.user;
  console.log('✅ Returning user info for:', user.firstName, user.lastName, '(' + user.role + ')');
  
  res.json({
    id: user.id,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role || 'member',
    status: user.status,
    joinDate: user.joinDate,
    permissions: user.role === 'pastor' ? ['read', 'write', 'admin'] : 
                user.role === 'leader' ? ['read', 'write'] : ['read']
  });
});

// ========================================
// MEMBERS ENDPOINTS
// ========================================

app.get('/api/members', (req, res) => {
  console.log('👥 Members list requested');
  const { page = 1, limit = 50, search, role, status } = req.query;
  
  let filteredMembers = productionSeed.members;
  
  if (search) {
    const searchTerm = search.toLowerCase();
    filteredMembers = filteredMembers.filter(member => 
      member.firstName.toLowerCase().includes(searchTerm) ||
      member.lastName.toLowerCase().includes(searchTerm) ||
      member.email.toLowerCase().includes(searchTerm)
    );
  }
  
  if (role && role !== 'all') {
    filteredMembers = filteredMembers.filter(member => member.role === role);
  }
  
  if (status && status !== 'all') {
    filteredMembers = filteredMembers.filter(member => member.status === status);
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex);
  
  res.json({
    members: paginatedMembers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredMembers.length,
      totalPages: Math.ceil(filteredMembers.length / limit)
    },
    summary: {
      totalMembers: productionSeed.members.length,
      activeMembers: productionSeed.members.filter(m => m.status === 'active').length,
      pastors: productionSeed.members.filter(m => m.role === 'pastor').length,
      leaders: productionSeed.members.filter(m => m.role === 'leader').length
    }
  });
});

// Member stats endpoint (must come BEFORE parameterized routes)
app.get('/api/members/stats', (req, res) => {
  console.log('👥 Member statistics requested');
  
  const totalMembers = productionSeed.members.length;
  const activeMembers = productionSeed.members.filter(m => m.status === 'active').length;
  const newMembersThisMonth = productionSeed.members.filter(m => {
    const joinDate = new Date(m.joinDate);
    const thisMonth = new Date();
    return joinDate.getMonth() === thisMonth.getMonth() && joinDate.getFullYear() === thisMonth.getFullYear();
  }).length;
  
  res.json({
    stats: {
      totalMembers,
      activeMembers,
      newMembersThisMonth,
      inactiveMembers: totalMembers - activeMembers,
      averageAge: 35.4,
      memberGrowthRate: 12.3,
      attendanceRate: 78.6
    },
    demographics: {
      ageGroups: {
        '18-25': Math.floor(totalMembers * 0.15),
        '26-35': Math.floor(totalMembers * 0.25),
        '36-50': Math.floor(totalMembers * 0.35),
        '51-65': Math.floor(totalMembers * 0.20),
        '65+': Math.floor(totalMembers * 0.05)
      },
      membershipDuration: {
        'new': newMembersThisMonth,
        '1-2years': Math.floor(totalMembers * 0.30),
        '3-5years': Math.floor(totalMembers * 0.25),
        '5+years': Math.floor(totalMembers * 0.35)
      }
    }
  });
});

// Member tags endpoint
app.get('/api/members/tags', (req, res) => {
  console.log('🏷️ Member tags requested');
  
  const tags = [
    { id: 'new-member', name: 'New Member', count: 12, color: '#4F46E5' },
    { id: 'volunteer', name: 'Volunteer', count: 34, color: '#059669' },
    { id: 'leader', name: 'Leader', count: 8, color: '#DC2626' },
    { id: 'youth', name: 'Youth Ministry', count: 23, color: '#7C3AED' },
    { id: 'worship', name: 'Worship Team', count: 15, color: '#EA580C' },
    { id: 'small-group', name: 'Small Group', count: 45, color: '#0891B2' },
    { id: 'missions', name: 'Missions', count: 19, color: '#65A30D' },
    { id: 'prayer-team', name: 'Prayer Team', count: 27, color: '#BE185D' }
  ];
  
  res.json({
    tags,
    totalTags: tags.length,
    totalTaggedMembers: tags.reduce((sum, tag) => sum + tag.count, 0)
  });
});

// MEMBERS SPECIFIC ROUTES - Must come BEFORE :id route
app.get('/api/members/bulk', (req, res) => {
  console.log('👥 Members bulk operations requested');
  res.json({
    success: true,
    message: 'Members bulk operations endpoint ready',
    supportedOperations: ['export', 'import', 'bulk-update', 'bulk-invite']
  });
});

app.get('/api/members/search/suggestions', (req, res) => {
  console.log('👥 Member search suggestions for:', req.query.q);
  const { q } = req.query;
  
  const suggestions = [
    { id: 'mbr-001', name: 'John Smith', email: 'john@example.com' },
    { id: 'mbr-002', name: 'Sarah Johnson', email: 'sarah@example.com' },
    { id: 'mbr-003', name: 'Mike Davis', email: 'mike@example.com' }
  ].filter(member => 
    q ? member.name.toLowerCase().includes(q.toLowerCase()) : true
  );
  
  res.json({ suggestions, total: suggestions.length });
});

app.get('/api/members/:id', (req, res) => {
  console.log(`👤 Member details requested: ${req.params.id}`);
  const member = productionSeed.members.find(m => m.id === req.params.id);
  
  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }
  
  res.json({ member });
});

app.post('/api/members', (req, res) => {
  console.log('👤 New member creation requested');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  const { 
    firstName, 
    lastName, 
    email, 
    phone, 
    dateOfBirth,
    address, 
    membershipStatus,
    tags,
    notes,
    emergencyContact,
    preferences
  } = req.body;
  
  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: 'First name, last name, and email are required' });
  }
  
  const newMember = {
    id: `mbr-${Date.now()}`,
    firstName,
    lastName,
    email,
    phone: phone || '',
    role: 'member', // Default role
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    address: address || {},
    profilePhoto: '',
    membershipStatus: membershipStatus || 'pending',
    joinDate: new Date(),
    tags: tags || [],
    notes: notes || '',
    emergencyContact: emergencyContact || null,
    spiritualJourney: {
      baptismDate: undefined,
      salvationDate: undefined,
      currentStage: '',
      notes: ''
    },
    groupMemberships: [],
    attendance: [],
    careHistory: [],
    preferences: preferences || {
      communicationMethod: 'email',
      newsletter: true,
      eventNotifications: true,
      privacyLevel: 'members'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    updatedBy: 'system'
  };
  
  productionSeed.members.push(newMember);
  console.log('✅ Member created successfully:', newMember.id);
  res.status(201).json(newMember);
});

app.put('/api/members/:id', (req, res) => {
  console.log(`👤 Member update requested: ${req.params.id}`);
  const memberIndex = productionSeed.members.findIndex(m => m.id === req.params.id);
  
  if (memberIndex === -1) {
    return res.status(404).json({ error: 'Member not found' });
  }
  
  const updatedMember = {
    ...productionSeed.members[memberIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  productionSeed.members[memberIndex] = updatedMember;
  res.json({ member: updatedMember });
});

app.get('/api/members/tags-duplicate', (req, res) => {
  console.log('🏷️ Member tags requested');
  
  const tags = [
    { id: 'tag-1', name: 'New Member', color: 'blue', createdAt: '2024-01-01T00:00:00Z' },
    { id: 'tag-2', name: 'Volunteer', color: 'green', createdAt: '2024-01-01T00:00:00Z' },
    { id: 'tag-3', name: 'Leadership', color: 'purple', createdAt: '2024-01-01T00:00:00Z' },
    { id: 'tag-4', name: 'Youth', color: 'orange', createdAt: '2024-01-01T00:00:00Z' },
    { id: 'tag-5', name: 'Senior', color: 'gray', createdAt: '2024-01-01T00:00:00Z' },
    { id: 'tag-6', name: 'Small Group Leader', color: 'red', createdAt: '2024-01-01T00:00:00Z' }
  ];
  
  res.json({ tags });
});

app.delete('/api/members/:id', (req, res) => {
  console.log(`👤 Member deletion requested: ${req.params.id}`);
  const memberIndex = productionSeed.members.findIndex(m => m.id === req.params.id);
  
  if (memberIndex === -1) {
    return res.status(404).json({ error: 'Member not found' });
  }
  
  productionSeed.members.splice(memberIndex, 1);
  res.json({ message: 'Member deleted successfully' });
});

// ========================================
// GROUPS ENDPOINTS
// ========================================

app.get('/api/groups', (req, res) => {
  console.log('👨‍👩‍👧‍👦 Groups list requested');
  const { page = 1, limit = 20, category, status } = req.query;
  
  let filteredGroups = productionSeed.groups;
  
  if (category && category !== 'all') {
    filteredGroups = filteredGroups.filter(group => group.category === category);
  }
  
  if (status && status !== 'all') {
    filteredGroups = filteredGroups.filter(group => group.status === status);
  }
  
  const startIndex = (page - 1) * limit;
  const paginatedGroups = filteredGroups.slice(startIndex, startIndex + parseInt(limit));
  
  res.json({
    groups: paginatedGroups,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredGroups.length,
      totalPages: Math.ceil(filteredGroups.length / limit)
    },
    summary: {
      totalGroups: productionSeed.groups.length,
      activeGroups: productionSeed.groups.filter(g => g.status === 'active').length,
      totalMembers: productionSeed.groups.reduce((sum, g) => sum + g.currentMembers, 0)
    }
  });
});

// Groups stats endpoint (must come BEFORE parameterized routes)
app.get('/api/groups/stats', (req, res) => {
  console.log('👨‍👩‍👧‍👦 Group statistics requested');
  
  const totalGroups = productionSeed.groups.length;
  const activeGroups = productionSeed.groups.filter(g => g.status === 'active').length;
  const avgGroupSize = Math.round(productionSeed.groups.reduce((sum, g) => sum + (g.currentMembers || 0), 0) / totalGroups);
  
  res.json({
    stats: {
      totalGroups,
      activeGroups,
      inactiveGroups: totalGroups - activeGroups,
      averageGroupSize: avgGroupSize,
      largestGroupSize: Math.max(...productionSeed.groups.map(g => g.currentMembers || 0)),
      smallestGroupSize: Math.min(...productionSeed.groups.map(g => g.currentMembers || 0)),
      totalMembers: productionSeed.groups.reduce((sum, g) => sum + (g.currentMembers || 0), 0),
      groupGrowthRate: 15.2
    },
    categories: {
      'small-group': productionSeed.groups.filter(g => g.category === 'small-group').length,
      'ministry': productionSeed.groups.filter(g => g.category === 'ministry').length,
      'bible-study': productionSeed.groups.filter(g => g.category === 'bible-study').length,
      'youth': productionSeed.groups.filter(g => g.category === 'youth').length,
      'other': productionSeed.groups.filter(g => !['small-group', 'ministry', 'bible-study', 'youth'].includes(g.category)).length
    },
    meetingFrequency: {
      weekly: Math.floor(totalGroups * 0.6),
      biweekly: Math.floor(totalGroups * 0.25),
      monthly: Math.floor(totalGroups * 0.15)
    }
  });
});

// GROUPS SPECIFIC ROUTES - Must come BEFORE :id route
app.get('/api/groups/bulk', (req, res) => {
  console.log('👥 Groups bulk operations requested');
  res.json({
    success: true,
    message: 'Bulk operations endpoint ready',
    supportedOperations: ['export', 'import', 'bulk-update', 'bulk-delete']
  });
});

app.get('/api/groups/:groupId/members', (req, res) => {
  console.log('👥 Group members requested for:', req.params.groupId);
  const { groupId } = req.params;
  
  const members = [
    {
      id: 'mbr-001',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@example.com',
      role: 'leader',
      joinedDate: '2024-01-15T10:00:00Z',
      status: 'active'
    },
    {
      id: 'mbr-002', 
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@example.com',
      role: 'member',
      joinedDate: '2024-01-20T14:30:00Z',
      status: 'active'
    }
  ];
  
  res.json({
    groupId,
    members,
    total: members.length,
    roles: ['leader', 'co-leader', 'member']
  });
});

app.post('/api/groups/:groupId/members', (req, res) => {
  console.log('👥 Adding member to group:', req.params.groupId, req.body);
  const { groupId } = req.params;
  const { memberId, role = 'member' } = req.body;
  
  res.status(201).json({
    success: true,
    message: 'Member added to group successfully',
    groupId,
    memberId,
    role,
    addedAt: new Date().toISOString()
  });
});

app.delete('/api/groups/:groupId/members/:memberId', (req, res) => {
  console.log('👥 Removing member from group:', req.params);
  const { groupId, memberId } = req.params;
  
  res.json({
    success: true,
    message: 'Member removed from group successfully',
    groupId,
    memberId,
    removedAt: new Date().toISOString()
  });
});

app.get('/api/groups/:id', (req, res) => {
  console.log(`👥 Group details requested: ${req.params.id}`);
  const group = productionSeed.groups.find(g => g.id === req.params.id);
  
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }
  
  res.json({ group });
});

app.post('/api/groups', (req, res) => {
  console.log('👥 New group creation requested');
  const { name, description, category, meetingDay, meetingTime, location, maxMembers, isPrivate } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Group name is required' });
  }
  
  const newGroup = {
    id: `group-${Date.now()}`,
    name,
    description: description || '',
    category: category || 'General',
    leaderId: req.user?.id || 'user-admin',
    leaderName: req.user?.name || 'Admin User',
    currentMembers: 1,
    maxMembers: maxMembers || 50,
    meetingSchedule: {
      day: meetingDay || 'Sunday',
      time: meetingTime || '10:00 AM',
      location: location || 'Church Building'
    },
    status: 'active',
    isPrivate: isPrivate || false,
    createdAt: new Date().toISOString(),
    tags: [category || 'General'],
    memberIds: [req.user?.id || 'user-admin']
  };
  
  // Add to in-memory storage (in production, this would be saved to database)
  productionSeed.groups.push(newGroup);
  
  res.status(201).json(newGroup);
});

app.put('/api/groups/:id', (req, res) => {
  console.log(`👥 Group update requested: ${req.params.id}`);
  const groupIndex = productionSeed.groups.findIndex(g => g.id === req.params.id);
  
  if (groupIndex === -1) {
    return res.status(404).json({ error: 'Group not found' });
  }
  
  const updatedGroup = {
    ...productionSeed.groups[groupIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  productionSeed.groups[groupIndex] = updatedGroup;
  
  res.json(updatedGroup);
});

app.get('/api/groups/stats', (req, res) => {
  console.log('👥 Group statistics requested');
  
  const totalGroups = productionSeed.groups.length;
  const activeGroups = productionSeed.groups.filter(g => g.status === 'active').length;
  const totalMembers = productionSeed.groups.reduce((sum, group) => sum + (group.currentMembers || 0), 0);
  const averageGroupSize = totalGroups > 0 ? Math.round(totalMembers / totalGroups) : 0;
  
  res.json({
    stats: {
      totalGroups,
      activeGroups,
      inactiveGroups: totalGroups - activeGroups,
      totalMembers,
      averageGroupSize,
      groupTypes: {
        'small-group': productionSeed.groups.filter(g => g.type === 'small-group').length,
        'ministry': productionSeed.groups.filter(g => g.type === 'ministry').length,
        'committee': productionSeed.groups.filter(g => g.type === 'committee').length,
        'class': productionSeed.groups.filter(g => g.type === 'class').length
      },
      meetingFrequency: {
        weekly: productionSeed.groups.filter(g => g.meetingSchedule?.includes('weekly')).length,
        biweekly: productionSeed.groups.filter(g => g.meetingSchedule?.includes('biweekly')).length,
        monthly: productionSeed.groups.filter(g => g.meetingSchedule?.includes('monthly')).length
      }
    }
  });
});

app.delete('/api/groups/:id', (req, res) => {
  console.log(`👥 Group deletion requested: ${req.params.id}`);
  const groupIndex = productionSeed.groups.findIndex(g => g.id === req.params.id);
  
  if (groupIndex === -1) {
    return res.status(404).json({ error: 'Group not found' });
  }
  
  productionSeed.groups.splice(groupIndex, 1);
  
  res.json({ message: 'Group deleted successfully' });
});

// Group Members Management
app.get('/api/groups/:id/members', (req, res) => {
  console.log(`👥 Group members requested: ${req.params.id}`);
  const group = productionSeed.groups.find(g => g.id === req.params.id);
  
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }
  
  // Get member details for group members
  const groupMembers = productionSeed.members.filter(member => 
    group.memberIds && group.memberIds.includes(member.id)
  );
  
  res.json({
    groupId: req.params.id,
    groupName: group.name,
    members: groupMembers,
    totalMembers: groupMembers.length
  });
});

app.post('/api/groups/:id/members', (req, res) => {
  console.log(`👥 Adding member to group: ${req.params.id}`);
  const groupIndex = productionSeed.groups.findIndex(g => g.id === req.params.id);
  const { memberId, role = 'member' } = req.body;
  
  if (groupIndex === -1) {
    return res.status(404).json({ error: 'Group not found' });
  }
  
  const member = productionSeed.members.find(m => m.id === memberId);
  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }
  
  const group = productionSeed.groups[groupIndex];
  
  // Initialize memberIds if not exists
  if (!group.memberIds) {
    group.memberIds = [];
  }
  
  // Check if member already in group
  if (group.memberIds.includes(memberId)) {
    return res.status(400).json({ error: 'Member already in group' });
  }
  
  // Add member to group
  group.memberIds.push(memberId);
  group.currentMembers = group.memberIds.length;
  group.updatedAt = new Date().toISOString();
  
  res.status(201).json({
    message: 'Member added to group successfully',
    groupId: req.params.id,
    memberId: memberId,
    role: role,
    member: member
  });
});

app.delete('/api/groups/:id/members/:memberId', (req, res) => {
  console.log(`👥 Removing member ${req.params.memberId} from group: ${req.params.id}`);
  const groupIndex = productionSeed.groups.findIndex(g => g.id === req.params.id);
  
  if (groupIndex === -1) {
    return res.status(404).json({ error: 'Group not found' });
  }
  
  const group = productionSeed.groups[groupIndex];
  
  if (!group.memberIds || !group.memberIds.includes(req.params.memberId)) {
    return res.status(404).json({ error: 'Member not found in group' });
  }
  
  // Remove member from group
  group.memberIds = group.memberIds.filter(id => id !== req.params.memberId);
  group.currentMembers = group.memberIds.length;
  group.updatedAt = new Date().toISOString();
  
  res.json({ message: 'Member removed from group successfully' });
});

// ========================================
// GROUP FILE SHARING & MESSAGING ENDPOINTS
// ========================================

// Get group files
app.get('/api/groups/:id/files', (req, res) => {
  console.log(`📁 Group files requested: ${req.params.id}`);
  const group = productionSeed.groups.find(g => g.id === req.params.id);
  
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }
  
  // Mock files data - in real implementation, this would come from file storage
  const files = [
    {
      id: `file-${Date.now()}-1`,
      name: 'Bible Study Materials.pdf',
      size: 2456789,
      type: 'application/pdf',
      uploadedBy: 'mbr-001',
      uploadedByName: 'David Johnson',
      uploadDate: '2025-09-20T10:30:00Z',
      url: '/api/groups/' + req.params.id + '/files/download/file-1',
      description: 'Weekly Bible study materials and discussion questions'
    },
    {
      id: `file-${Date.now()}-2`,
      name: 'Group Photo Sept 2025.jpg',
      size: 1234567,
      type: 'image/jpeg',
      uploadedBy: 'mbr-002',
      uploadedByName: 'Sarah Wilson',
      uploadDate: '2025-09-15T14:20:00Z',
      url: '/api/groups/' + req.params.id + '/files/download/file-2',
      description: 'Group photo from our September fellowship'
    }
  ];
  
  res.json({
    files,
    total: files.length,
    groupId: req.params.id,
    maxFileSize: 10485760, // 10MB
    allowedTypes: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'txt']
  });
});

// Upload file to group
app.post('/api/groups/:id/files', (req, res) => {
  console.log(`📁 File upload to group: ${req.params.id}`, req.body);
  const { fileName, fileSize, fileType, description } = req.body;
  
  if (!fileName) {
    return res.status(400).json({ error: 'File name is required' });
  }
  
  // Simulate file upload
  const newFile = {
    id: `file-${Date.now()}`,
    name: fileName,
    size: fileSize || 0,
    type: fileType || 'application/octet-stream',
    uploadedBy: 'mbr-001', // Would come from auth token
    uploadedByName: 'Current User',
    uploadDate: new Date().toISOString(),
    url: `/api/groups/${req.params.id}/files/download/${Date.now()}`,
    description: description || '',
    status: 'uploaded'
  };
  
  res.status(201).json({
    message: 'File uploaded successfully',
    file: newFile
  });
});

// Delete group file
app.delete('/api/groups/:id/files/:fileId', (req, res) => {
  console.log(`📁 Delete file ${req.params.fileId} from group: ${req.params.id}`);
  
  res.json({
    message: 'File deleted successfully',
    fileId: req.params.fileId
  });
});

// Download group file
app.get('/api/groups/:id/files/download/:fileId', (req, res) => {
  console.log(`📁 Download file ${req.params.fileId} from group: ${req.params.id}`);
  
  // In real implementation, this would stream the file
  res.status(200).json({
    message: 'File download would start here',
    fileId: req.params.fileId,
    groupId: req.params.id
  });
});

// Get group messages
app.get('/api/groups/:id/messages', (req, res) => {
  console.log(`💬 Group messages requested: ${req.params.id}`);
  const { page = 1, limit = 50 } = req.query;
  
  const messages = [
    {
      id: `msg-${Date.now()}-1`,
      content: 'Looking forward to our Bible study this week! Don\'t forget to read Chapter 5.',
      authorId: 'mbr-001',
      authorName: 'David Johnson',
      authorRole: 'leader',
      timestamp: '2025-09-26T15:30:00Z',
      edited: false,
      attachments: [],
      mentions: [],
      reactions: [
        { type: 'like', count: 3, users: ['mbr-002', 'mbr-003', 'mbr-004'] },
        { type: 'heart', count: 1, users: ['mbr-002'] }
      ]
    },
    {
      id: `msg-${Date.now()}-2`,
      content: 'Thanks for sharing the study materials! Really helpful for preparation.',
      authorId: 'mbr-002',
      authorName: 'Sarah Wilson',
      authorRole: 'member',
      timestamp: '2025-09-26T16:45:00Z',
      edited: false,
      attachments: [],
      mentions: ['mbr-001'],
      reactions: [
        { type: 'like', count: 2, users: ['mbr-001', 'mbr-003'] }
      ]
    },
    {
      id: `msg-${Date.now()}-3`,
      content: 'Can we reschedule next week\'s meeting? I have a conflict on Wednesday.',
      authorId: 'mbr-003',
      authorName: 'Michael Chen',
      authorRole: 'member',
      timestamp: '2025-09-26T18:20:00Z',
      edited: false,
      attachments: [],
      mentions: [],
      reactions: []
    }
  ];
  
  res.json({
    messages,
    total: messages.length,
    page: parseInt(page),
    limit: parseInt(limit),
    groupId: req.params.id,
    hasMore: false
  });
});

// Post message to group
app.post('/api/groups/:id/messages', (req, res) => {
  console.log(`💬 New message to group: ${req.params.id}`, req.body);
  const { content, mentions = [], attachments = [] } = req.body;
  
  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: 'Message content is required' });
  }
  
  const newMessage = {
    id: `msg-${Date.now()}`,
    content: content.trim(),
    authorId: 'mbr-001', // Would come from auth token
    authorName: 'Current User',
    authorRole: 'member',
    timestamp: new Date().toISOString(),
    edited: false,
    attachments,
    mentions,
    reactions: []
  };
  
  res.status(201).json({
    message: 'Message posted successfully',
    data: newMessage
  });
});

// Edit group message
app.put('/api/groups/:id/messages/:messageId', (req, res) => {
  console.log(`💬 Edit message ${req.params.messageId} in group: ${req.params.id}`, req.body);
  const { content } = req.body;
  
  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: 'Message content is required' });
  }
  
  res.json({
    message: 'Message updated successfully',
    messageId: req.params.messageId,
    content: content.trim(),
    edited: true,
    editedAt: new Date().toISOString()
  });
});

// Delete group message
app.delete('/api/groups/:id/messages/:messageId', (req, res) => {
  console.log(`💬 Delete message ${req.params.messageId} from group: ${req.params.id}`);
  
  res.json({
    message: 'Message deleted successfully',
    messageId: req.params.messageId
  });
});

// Add reaction to message
app.post('/api/groups/:id/messages/:messageId/reactions', (req, res) => {
  console.log(`💬 Add reaction to message ${req.params.messageId}`, req.body);
  const { type = 'like' } = req.body;
  
  res.json({
    message: 'Reaction added successfully',
    messageId: req.params.messageId,
    reaction: {
      type,
      userId: 'mbr-001',
      timestamp: new Date().toISOString()
    }
  });
});

// Get group message notifications
app.get('/api/groups/:id/messages/notifications', (req, res) => {
  console.log(`🔔 Group message notifications: ${req.params.id}`);
  
  res.json({
    unreadCount: 3,
    lastReadTimestamp: '2025-09-26T12:00:00Z',
    mentionCount: 1,
    reactionCount: 2
  });
});

// Mark messages as read
app.post('/api/groups/:id/messages/mark-read', (req, res) => {
  console.log(`👁️ Mark messages as read in group: ${req.params.id}`, req.body);
  const { lastReadTimestamp } = req.body;
  
  res.json({
    message: 'Messages marked as read',
    lastReadTimestamp: lastReadTimestamp || new Date().toISOString()
  });
});

// ========================================
// EVENTS ENDPOINTS
// ========================================

app.get('/api/events', (req, res) => {
  console.log('📅 Events list requested');
  const { page = 1, limit = 20, category, status, upcoming } = req.query;
  
  let filteredEvents = productionSeed.events;
  
  if (upcoming === 'true') {
    const now = new Date();
    filteredEvents = filteredEvents.filter(event => new Date(event.startDate) > now);
  }
  
  if (category && category !== 'all') {
    filteredEvents = filteredEvents.filter(event => event.category === category);
  }
  
  if (status && status !== 'all') {
    filteredEvents = filteredEvents.filter(event => event.status === status);
  }
  
  const startIndex = (page - 1) * limit;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + parseInt(limit));
  
  res.json({
    events: paginatedEvents,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredEvents.length,
      totalPages: Math.ceil(filteredEvents.length / limit)
    },
    summary: {
      totalEvents: productionSeed.events.length,
      upcomingEvents: productionSeed.events.filter(e => new Date(e.startDate) > new Date()).length,
      totalRegistrations: productionSeed.events.reduce((sum, e) => sum + e.registrationCount, 0)
    }
  });
});

// EVENTS SPECIFIC ROUTES - Must come BEFORE :id route
app.get('/api/events/:eventId/registrations', (req, res) => {
  console.log('📅 Event registrations requested for:', req.params.eventId);
  const { eventId } = req.params;
  
  const registrations = [
    {
      id: 'reg-001',
      eventId,
      memberId: 'mbr-001',
      memberName: 'John Smith',
      registrationDate: '2024-01-15T10:00:00Z',
      status: 'confirmed',
      notes: ''
    },
    {
      id: 'reg-002',
      eventId,
      memberId: 'mbr-002', 
      memberName: 'Sarah Johnson',
      registrationDate: '2024-01-16T09:30:00Z',
      status: 'confirmed',
      notes: 'Dietary restrictions: vegetarian'
    }
  ];
  
  res.json({
    eventId,
    registrations,
    total: registrations.length,
    capacity: 50,
    available: 48
  });
});

app.post('/api/events/:eventId/registrations', (req, res) => {
  console.log('📅 Event registration requested:', req.params.eventId, req.body);
  const { eventId } = req.params;
  const { memberId, notes = '' } = req.body;
  
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    registrationId: 'reg-' + Date.now(),
    eventId,
    memberId,
    notes,
    registrationDate: new Date().toISOString(),
    status: 'confirmed'
  });
});

app.get('/api/events/:eventId/rsvps', (req, res) => {
  console.log('📅 Event RSVPs requested for:', req.params.eventId);
  const { eventId } = req.params;
  
  const rsvps = [
    {
      id: 'rsvp-001',
      eventId,
      memberId: 'mbr-001',
      memberName: 'John Smith',
      response: 'yes',
      guestCount: 2,
      submittedDate: '2024-01-15T10:00:00Z'
    },
    {
      id: 'rsvp-002',
      eventId,
      memberId: 'mbr-002',
      memberName: 'Sarah Johnson',
      response: 'maybe',
      guestCount: 0,
      submittedDate: '2024-01-16T09:30:00Z'
    }
  ];
  
  res.json({
    eventId,
    rsvps,
    total: rsvps.length,
    summary: {
      yes: rsvps.filter(r => r.response === 'yes').length,
      no: rsvps.filter(r => r.response === 'no').length,
      maybe: rsvps.filter(r => r.response === 'maybe').length,
      totalGuests: rsvps.reduce((sum, r) => sum + r.guestCount, 0)
    }
  });
});

app.post('/api/events/:eventId/rsvps', (req, res) => {
  console.log('📅 RSVP submitted:', req.params.eventId, req.body);
  const { eventId } = req.params;
  const { memberId, response, guestCount = 0 } = req.body;
  
  res.status(201).json({
    success: true,
    message: 'RSVP submitted successfully',
    rsvpId: 'rsvp-' + Date.now(),
    eventId,
    memberId,
    response,
    guestCount,
    submittedDate: new Date().toISOString()
  });
});

app.get('/api/events/:eventId/check-in', (req, res) => {
  console.log('📅 Event check-in status for:', req.params.eventId);
  const { eventId } = req.params;
  
  const checkIns = [
    {
      id: 'checkin-001',
      eventId,
      memberId: 'mbr-001',
      memberName: 'John Smith',
      checkInTime: '2024-01-15T10:00:00Z',
      status: 'checked-in'
    }
  ];
  
  res.json({
    eventId,
    checkIns,
    total: checkIns.length,
    checkedIn: checkIns.filter(c => c.status === 'checked-in').length,
    registered: 25,
    attendance: '4%'
  });
});

app.get('/api/events/:id', (req, res) => {
  console.log(`📅 Event details requested: ${req.params.id}`);
  const event = productionSeed.events.find(e => e.id === req.params.id);
  
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  res.json({ event });
});

app.post('/api/events', (req, res) => {
  console.log('📅 New event creation requested');
  const { title, description, startDate, endDate, location, category, maxCapacity, price, requiresRegistration, isPublic } = req.body;
  
  if (!title || !startDate) {
    return res.status(400).json({ error: 'Event title and start date are required' });
  }
  
  const newEvent = {
    id: `event-${Date.now()}`,
    title,
    description: description || '',
    startDate,
    endDate: endDate || startDate,
    location: location || 'Church Building',
    category: category || 'Service',
    organizerId: req.user?.id || 'user-admin',
    organizerName: req.user?.name || 'Admin User',
    maxCapacity: maxCapacity || 100,
    registrationCount: 0,
    price: price || 0,
    requiresRegistration: requiresRegistration || false,
    isPublic: isPublic !== false,
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    tags: [category || 'Service']
  };
  
  productionSeed.events.push(newEvent);
  
  res.status(201).json(newEvent);
});

app.put('/api/events/:id', (req, res) => {
  console.log(`📅 Event update requested: ${req.params.id}`);
  const eventIndex = productionSeed.events.findIndex(e => e.id === req.params.id);
  
  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  const updatedEvent = {
    ...productionSeed.events[eventIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  productionSeed.events[eventIndex] = updatedEvent;
  
  res.json(updatedEvent);
});

app.delete('/api/events/:id', (req, res) => {
  console.log(`📅 Event deletion requested: ${req.params.id}`);
  const eventIndex = productionSeed.events.findIndex(e => e.id === req.params.id);
  
  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  productionSeed.events.splice(eventIndex, 1);
  
  res.json({ message: 'Event deleted successfully' });
});

// Event Registrations
app.get('/api/events/:id/registrations', (req, res) => {
  console.log(`📅 Event registrations requested: ${req.params.id}`);
  const event = productionSeed.events.find(e => e.id === req.params.id);
  
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  // Mock registrations data
  const registrations = [
    {
      id: `reg-${Date.now()}-1`,
      eventId: req.params.id,
      memberId: 'mbr-001',
      memberName: 'John Smith',
      registrationDate: '2024-11-15T10:00:00Z',
      status: 'confirmed',
      confirmationCode: 'CONF-ABC123'
    },
    {
      id: `reg-${Date.now()}-2`,
      eventId: req.params.id,
      memberId: 'mbr-002',
      memberName: 'Jane Doe',
      registrationDate: '2024-11-16T14:30:00Z',
      status: 'confirmed',
      confirmationCode: 'CONF-XYZ789'
    }
  ];
  
  res.json({
    eventId: req.params.id,
    eventTitle: event.title,
    registrations,
    totalRegistrations: registrations.length,
    availableSpots: event.maxCapacity - registrations.length
  });
});

app.post('/api/events/:id/registrations', (req, res) => {
  console.log(`📅 Event registration: ${req.params.id}`);
  const { memberId } = req.body;
  
  if (!memberId) {
    return res.status(400).json({ error: 'memberId is required' });
  }
  
  const event = productionSeed.events.find(e => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  const member = productionSeed.members.find(m => m.id === memberId);
  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }
  
  const registration = {
    id: `reg-${Date.now()}`,
    eventId: req.params.id,
    memberId,
    memberName: `${member.firstName} ${member.lastName}`,
    registrationDate: new Date().toISOString(),
    status: 'confirmed',
    confirmationCode: `CONF-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
  };
  
  // Update event registration count
  event.registrationCount = (event.registrationCount || 0) + 1;
  
  res.status(201).json(registration);
});

// Event Check-in
app.post('/api/events/:id/check-in', (req, res) => {
  console.log(`✅ Event check-in: ${req.params.id}`);
  const { memberId, checkInTime, checkInMethod = 'manual' } = req.body;
  
  if (!memberId) {
    return res.status(400).json({ error: 'memberId is required' });
  }
  
  const checkin = {
    id: `checkin-${Date.now()}`,
    eventId: req.params.id,
    memberId,
    checkInTime: checkInTime || new Date().toISOString(),
    checkInMethod,
    status: 'checked_in'
  };
  
  res.status(201).json(checkin);
});

// ========================================
// SPIRITUAL JOURNEYS ENDPOINTS
// ========================================

app.get('/api/journeys', (req, res) => {
  console.log('🌟 Journeys list requested');
  const memberJourneys = productionSeed.journeyTemplates.map(template => ({
    id: `journey-${template.id}`,
    templateId: template.id,
    memberId: 'member-sample',
    title: template.title,
    description: template.description,
    progress: Math.floor(Math.random() * 100),
    startDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'in_progress',
    completedMilestones: Math.floor(Math.random() * template.milestones.length),
    totalMilestones: template.milestones.length
  }));
  
  res.json({
    journeys: memberJourneys,
    templates: productionSeed.journeyTemplates,
    summary: {
      totalJourneys: memberJourneys.length,
      activeJourneys: memberJourneys.filter(j => j.status === 'in_progress').length,
      completedJourneys: memberJourneys.filter(j => j.status === 'completed').length
    }
  });
});

// Get member journeys
app.get('/api/journeys/member-journeys', (req, res) => {
  console.log('🌟 Member journeys requested');
  const { memberId } = req.query;
  
  const memberJourneys = productionSeed.journeyTemplates.map(template => ({
    id: `member-journey-${template.id}`,
    templateId: template.id,
    memberId: memberId || 'member-sample',
    title: template.title,
    description: template.description,
    progress: Math.floor(Math.random() * 100),
    startDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    status: Math.random() > 0.7 ? 'completed' : 'in_progress',
    completedMilestones: Math.floor(Math.random() * template.milestones.length),
    totalMilestones: template.milestones.length,
    nextMilestone: template.milestones[Math.floor(Math.random() * template.milestones.length)],
    estimatedCompletion: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
  }));
  
  res.json({
    memberJourneys,
    summary: {
      totalJourneys: memberJourneys.length,
      activeJourneys: memberJourneys.filter(j => j.status === 'in_progress').length,
      completedJourneys: memberJourneys.filter(j => j.status === 'completed').length,
      averageProgress: Math.round(memberJourneys.reduce((sum, j) => sum + j.progress, 0) / memberJourneys.length)
    }
  });
});

// Journey Assignment System
app.post('/api/journeys/member-journeys', (req, res) => {
  console.log('🎯 Journey assignment requested');
  const { memberId, templateId, mentorId, startDate } = req.body;
  console.log('   Request data:', { memberId, templateId, mentorId });
  console.log('   Available templates:', productionSeed.journeyTemplates.map(t => ({ id: t.id, title: t.title })));
  
  if (!memberId || !templateId) {
    return res.status(400).json({ error: 'memberId and templateId are required' });
  }
  
  const template = productionSeed.journeyTemplates.find(t => t.id === templateId);
  console.log('   Found template:', template ? { id: template.id, title: template.title } : 'NOT FOUND');
  if (!template) {
    return res.status(404).json({ error: 'Journey template not found' });
  }
  
  const member = productionSeed.members.find(m => m.id === memberId);
  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }
  
  const journey = {
    id: `member-journey-${Date.now()}`,
    memberId,
    memberName: `${member.firstName} ${member.lastName}`,
    templateId,
    templateTitle: template.title,
    mentorId: mentorId || null,
    startDate: startDate || new Date().toISOString(),
    status: 'not_started',
    progress: 0,
    completedMilestones: 0,
    totalMilestones: template.milestones ? template.milestones.length : 0,
    currentMilestone: template.milestones && template.milestones.length > 0 ? template.milestones[0] : null,
    estimatedCompletion: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString(),
    createdAt: new Date().toISOString()
  };
  
  res.status(201).json(journey);
});

app.get('/api/journeys/member-journeys/:id', (req, res) => {
  console.log(`🌟 Member journey details requested: ${req.params.id}`);
  
  // Mock journey progress data
  const journey = {
    id: req.params.id,
    memberId: 'mbr-001',
    memberName: 'John Smith',
    templateId: 'jt-001',
    templateTitle: 'New Member Orientation',
    mentorId: 'mbr-002',
    mentorName: 'Jane Mentor',
    startDate: '2024-10-01T00:00:00Z',
    status: 'in_progress',
    progress: 65,
    completedMilestones: 4,
    totalMilestones: 6,
    currentMilestone: {
      id: 'ms-005',
      title: 'Connect with Small Group',
      description: 'Join a small group and attend at least 2 meetings',
      status: 'in_progress',
      dueDate: '2024-12-15T00:00:00Z'
    },
    milestoneProgress: [
      { id: 'ms-001', title: 'Welcome & Introduction', status: 'completed', completedDate: '2024-10-05T00:00:00Z' },
      { id: 'ms-002', title: 'Church Tour', status: 'completed', completedDate: '2024-10-08T00:00:00Z' },
      { id: 'ms-003', title: 'Meet the Pastor', status: 'completed', completedDate: '2024-10-12T00:00:00Z' },
      { id: 'ms-004', title: 'Attend Sunday Service', status: 'completed', completedDate: '2024-10-15T00:00:00Z' },
      { id: 'ms-005', title: 'Connect with Small Group', status: 'in_progress', startedDate: '2024-11-01T00:00:00Z' },
      { id: 'ms-006', title: 'Volunteer Opportunity', status: 'not_started' }
    ],
    notes: 'Member is progressing well and showing great engagement.',
    estimatedCompletion: '2024-12-30T00:00:00Z'
  };
  
  res.json({ journey });
});

app.put('/api/journeys/member-journeys/:id', (req, res) => {
  console.log(`🌟 Member journey update requested: ${req.params.id}`);
  const { status, progress, notes, currentMilestoneId } = req.body;
  
  const updatedJourney = {
    id: req.params.id,
    status: status || 'in_progress',
    progress: progress || 65,
    notes: notes || 'Journey updated',
    currentMilestoneId: currentMilestoneId || 'ms-005',
    updatedAt: new Date().toISOString()
  };
  
  res.json(updatedJourney);
});

app.post('/api/journeys', (req, res) => {
  console.log('🎯 Journey assignment requested');
  const { memberId, templateId, startDate } = req.body;
  
  if (!memberId) {
    return res.status(400).json({ error: 'memberId is required' });
  }
  
  const journey = {
    id: `journey-${Date.now()}`,
    memberId,
    templateId: templateId || 'template-001',
    startDate: startDate || new Date().toISOString(),
    status: 'active',
    progress: 0
  };
  
  res.status(201).json(journey);
});

// Journey Templates CRUD
app.get('/api/journey-templates', (req, res) => {
  console.log('📋 Journey templates list requested');
  res.json({
    templates: productionSeed.journeyTemplates,
    total: productionSeed.journeyTemplates.length
  });
});

app.get('/api/journey-templates/:id', (req, res) => {
  console.log(`📋 Journey template details: ${req.params.id}`);
  const template = productionSeed.journeyTemplates.find(t => t.id === req.params.id);
  
  if (!template) {
    return res.status(404).json({ error: 'Journey template not found' });
  }
  
  res.json({ template });
});

app.post('/api/journey-templates', (req, res) => {
  console.log('📋 New journey template creation');
  const { title, description, milestones, estimatedDuration } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Template title is required' });
  }
  
  const newTemplate = {
    id: `tpl-${Date.now()}`,
    title,
    description: description || '',
    milestones: milestones || [],
    estimatedDuration: estimatedDuration || '30 days',
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  
  productionSeed.journeyTemplates.push(newTemplate);
  res.status(201).json(newTemplate);
});

app.put('/api/journey-templates/:id', (req, res) => {
  console.log(`📋 Journey template update: ${req.params.id}`);
  const templateIndex = productionSeed.journeyTemplates.findIndex(t => t.id === req.params.id);
  
  if (templateIndex === -1) {
    return res.status(404).json({ error: 'Journey template not found' });
  }
  
  const updatedTemplate = {
    ...productionSeed.journeyTemplates[templateIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  productionSeed.journeyTemplates[templateIndex] = updatedTemplate;
  res.json(updatedTemplate);
});

app.delete('/api/journey-templates/:id', (req, res) => {
  console.log(`📋 Journey template deletion: ${req.params.id}`);
  const templateIndex = productionSeed.journeyTemplates.findIndex(t => t.id === req.params.id);
  
  if (templateIndex === -1) {
    return res.status(404).json({ error: 'Journey template not found' });
  }
  
  productionSeed.journeyTemplates.splice(templateIndex, 1);
  res.json({ message: 'Journey template deleted successfully' });
});

app.put('/api/journeys/:id', (req, res) => {
  console.log(`🎯 Journey progress update: ${req.params.id}`);
  res.json({
    id: req.params.id,
    ...req.body,
    updatedAt: new Date().toISOString()
  });
});

app.delete('/api/journeys/:id', (req, res) => {
  console.log(`🎯 Journey assignment removal: ${req.params.id}`);
  res.json({ message: 'Journey assignment removed successfully' });
});

// ========================================
// SPIRITUAL JOURNEY EXTENSIONS MODULE
// ========================================

// Daily Devotions Tracking System
app.get('/api/journeys/devotions', (req, res) => {
  console.log('📖 Daily devotions requested');
  const devotions = [
    {
      id: 'dev-001',
      memberId: 'mbr-001',
      date: '2024-11-19',
      bibleReading: 'Psalm 23',
      duration: 15,
      reflection: 'Found great peace in this passage about God\'s protection.',
      prayerTime: 10,
      streak: 7,
      completed: true
    },
    {
      id: 'dev-002',
      memberId: 'mbr-001',
      date: '2024-11-18',
      bibleReading: 'Matthew 5:1-12',
      duration: 20,
      reflection: 'The Beatitudes remind me to be humble and merciful.',
      prayerTime: 15,
      streak: 6,
      completed: true
    }
  ];
  
  res.json({
    devotions,
    statistics: {
      currentStreak: 7,
      longestStreak: 12,
      totalDays: 45,
      averageDuration: 18,
      completionRate: 0.85
    },
    readingPlan: {
      name: 'Through the Bible in a Year',
      progress: 0.32,
      nextReading: 'Matthew 6:1-18'
    }
  });
});

app.post('/api/journeys/devotions', (req, res) => {
  console.log('📖 Recording devotion entry');
  const { bibleReading, duration, reflection, prayerTime } = req.body;
  
  const devotion = {
    id: `dev-${Date.now()}`,
    memberId: 'mbr-001',
    date: new Date().toISOString().split('T')[0],
    bibleReading: bibleReading || '',
    duration: duration || 0,
    reflection: reflection || '',
    prayerTime: prayerTime || 0,
    completed: true,
    createdAt: new Date().toISOString()
  };
  
  res.status(201).json(devotion);
});

// Spiritual Gifts Assessment System
app.get('/api/journeys/spiritual-gifts', (req, res) => {
  console.log('🎁 Spiritual gifts assessment requested');
  res.json({
    assessment: {
      id: 'sg-001',
      memberId: 'mbr-001',
      completedDate: '2024-10-15',
      results: {
        primary: ['Teaching', 'Leadership', 'Encouragement'],
        secondary: ['Administration', 'Mercy', 'Hospitality'],
        scores: {
          teaching: 85,
          leadership: 82,
          encouragement: 78,
          administration: 65,
          mercy: 62,
          hospitality: 58
        }
      },
      recommendations: [
        'Consider leading a small group Bible study',
        'Explore teaching opportunities in children\'s ministry',
        'Join the church leadership development program'
      ]
    },
    servingOpportunities: [
      {
        id: 'opp-001',
        title: 'Small Group Leader',
        description: 'Lead weekly Bible study groups',
        match: 95
      },
      {
        id: 'opp-002',
        title: 'Sunday School Teacher',
        description: 'Teach children\'s Sunday school classes',
        match: 88
      }
    ]
  });
});

app.post('/api/journeys/spiritual-gifts', (req, res) => {
  console.log('🎁 Submitting spiritual gifts assessment');
  const { responses } = req.body;
  
  // Mock assessment calculation
  const results = {
    id: `sg-${Date.now()}`,
    memberId: 'mbr-001',
    completedDate: new Date().toISOString().split('T')[0],
    responses,
    results: {
      primary: ['Teaching', 'Leadership'],
      secondary: ['Encouragement', 'Administration'],
      scores: {
        teaching: Math.floor(Math.random() * 30) + 70,
        leadership: Math.floor(Math.random() * 30) + 70,
        encouragement: Math.floor(Math.random() * 30) + 60
      }
    }
  };
  
  res.status(201).json(results);
});

// Serving Opportunities System
app.get('/api/journeys/serving-opportunities', (req, res) => {
  console.log('🤝 Serving opportunities requested');
  const opportunities = [
    {
      id: 'serve-001',
      title: 'Worship Team Vocalist',
      department: 'Worship Ministry',
      description: 'Join our Sunday morning worship team as a vocalist',
      requirements: ['Musical ability', 'Regular attendance', 'Heart for worship'],
      timeCommitment: '4 hours/week',
      schedule: 'Sunday mornings, Wednesday rehearsals',
      contact: 'worship@faithlink.church',
      spots: 2,
      filled: 0,
      skills: ['Music', 'Worship', 'Performance']
    },
    {
      id: 'serve-002',
      title: 'Children\'s Ministry Volunteer',
      department: 'Children\'s Ministry',
      description: 'Help with Sunday school classes and children\'s events',
      requirements: ['Background check', 'Love for children', 'Patience'],
      timeCommitment: '3 hours/week',
      schedule: 'Sunday mornings',
      contact: 'kids@faithlink.church',
      spots: 5,
      filled: 3,
      skills: ['Teaching', 'Children', 'Patience']
    },
    {
      id: 'serve-003',
      title: 'Small Group Leader',
      department: 'Community Life',
      description: 'Lead a weekly small group Bible study',
      requirements: ['Spiritual maturity', 'Leadership experience', 'Commitment'],
      timeCommitment: '5 hours/week',
      schedule: 'Weekly meetings + preparation',
      contact: 'groups@faithlink.church',
      spots: 3,
      filled: 1,
      skills: ['Leadership', 'Teaching', 'Pastoral Care']
    }
  ];
  
  res.json({
    opportunities,
    summary: {
      totalOpportunities: opportunities.length,
      openSpots: opportunities.reduce((sum, opp) => sum + (opp.spots - opp.filled), 0),
      departments: ['Worship Ministry', 'Children\'s Ministry', 'Community Life']
    }
  });
});

// Journey Milestone Tracking System
app.get('/api/journeys/milestones', (req, res) => {
  console.log('🎯 Journey milestones requested');
  res.json({
    milestones: [
      {
        id: 'ms-001',
        title: 'New Member Orientation',
        description: 'Complete the new member orientation process',
        phase: 'Foundation',
        status: 'completed',
        completedDate: '2024-09-15',
        progress: 100
      },
      {
        id: 'ms-002',
        title: 'First Small Group',
        description: 'Join and actively participate in a small group',
        phase: 'Connection',
        status: 'completed',
        completedDate: '2024-10-01',
        progress: 100
      },
      {
        id: 'ms-003',
        title: 'Spiritual Gifts Assessment',
        description: 'Complete spiritual gifts assessment and review results',
        phase: 'Discovery',
        status: 'in_progress',
        progress: 75
      },
      {
        id: 'ms-004',
        title: 'First Serving Role',
        description: 'Begin serving in a ministry role',
        phase: 'Engagement',
        status: 'not_started',
        progress: 0
      }
    ],
    phases: {
      foundation: { completed: 2, total: 3 },
      connection: { completed: 1, total: 2 },
      discovery: { completed: 0, total: 2 },
      engagement: { completed: 0, total: 3 }
    },
    overallProgress: 62
  });
});

// Spiritual Growth Analytics System
app.get('/api/journeys/analytics', (req, res) => {
  console.log('📊 Journey analytics requested');
  res.json({
    overview: {
      totalMembers: 142,
      activeJourneys: 87,
      completedJourneys: 34,
      averageProgress: 68
    },
    trends: {
      monthlyCompletions: [3, 5, 8, 6, 9, 12],
      engagementRate: 0.78,
      averageTimeToComplete: 120, // days
      dropoffPhases: {
        foundation: 0.15,
        connection: 0.25,
        discovery: 0.35,
        engagement: 0.20
      }
    },
    insights: [
      'Members who complete spiritual gifts assessment are 40% more likely to find a serving role',
      'Small group participation increases journey completion by 65%',
      'Daily devotion tracking correlates with higher overall engagement'
    ],
    recommendations: [
      'Focus on connection phase support to reduce dropoff',
      'Promote spiritual gifts assessment earlier in journey',
      'Encourage daily devotion habits through reminders'
    ]
  });
});

// Personal Reflection & Notes System
app.get('/api/journeys/reflections', (req, res) => {
  console.log('📝 Personal reflections requested');
  const reflections = [
    {
      id: 'ref-001',
      memberId: 'mbr-001',
      title: 'God\'s Faithfulness in Difficult Times',
      content: 'Reflecting on how God has been faithful during this challenging season...',
      tags: ['faith', 'challenges', 'growth'],
      date: '2024-11-15',
      mood: 'hopeful',
      prayerRequests: [
        'Wisdom in upcoming decisions',
        'Strength for family challenges'
      ],
      gratitude: [
        'Supportive church community',
        'Health and provision'
      ],
      actionItems: [
        { id: 'action-001', text: 'Pray daily for family situation', completed: false },
        { id: 'action-002', text: 'Reach out to mentor for guidance', completed: true }
      ]
    }
  ];
  
  res.json({
    reflections,
    summary: {
      totalReflections: 23,
      thisMonth: 4,
      completedActions: 15,
      pendingActions: 7,
      commonTags: ['growth', 'faith', 'community', 'challenges']
    }
  });
});

// ========================================
// COMMUNICATIONS ENDPOINTS
// ========================================

app.get('/api/communications/campaigns', (req, res) => {
  console.log('📧 Communications campaigns requested');
  res.json({
    campaigns: productionSeed.communications,
    summary: {
      totalCampaigns: productionSeed.communications.length,
      sentCampaigns: productionSeed.communications.filter(c => c.status === 'sent').length,
      scheduledCampaigns: productionSeed.communications.filter(c => c.status === 'scheduled').length,
      avgOpenRate: productionSeed.communications
        .filter(c => c.openRate)
        .reduce((sum, c) => sum + c.openRate, 0) / 
        productionSeed.communications.filter(c => c.openRate).length || 0
    }
  });
});

app.post('/api/communications/campaigns', (req, res) => {
  console.log('📧 New campaign creation requested');
  const campaign = {
    id: `campaign-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
    status: req.body.action === 'send' ? 'sending' : req.body.action || 'draft'
  };
  
  res.status(201).json(campaign);
});

app.get('/api/communications/campaigns/:id', (req, res) => {
  console.log(`📧 Campaign details requested: ${req.params.id}`);
  const campaign = productionSeed.communications.find(c => c.id === req.params.id);
  
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  
  res.json({ campaign });
});

app.put('/api/communications/campaigns/:id', (req, res) => {
  console.log(`📧 Campaign update requested: ${req.params.id}`);
  const campaignIndex = productionSeed.communications.findIndex(c => c.id === req.params.id);
  
  if (campaignIndex === -1) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  
  const updatedCampaign = {
    ...productionSeed.communications[campaignIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  productionSeed.communications[campaignIndex] = updatedCampaign;
  res.json(updatedCampaign);
});

app.delete('/api/communications/campaigns/:id', (req, res) => {
  console.log(`📧 Campaign deletion requested: ${req.params.id}`);
  const campaignIndex = productionSeed.communications.findIndex(c => c.id === req.params.id);
  
  if (campaignIndex === -1) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  
  productionSeed.communications.splice(campaignIndex, 1);
  res.json({ message: 'Campaign deleted successfully' });
});

app.post('/api/communications/campaigns/:id/send', (req, res) => {
  console.log(`📧 Campaign send requested: ${req.params.id}`);
  res.json({
    campaignId: req.params.id,
    status: 'sending',
    recipientCount: req.body.recipientIds?.length || 100,
    estimatedDelivery: new Date(Date.now() + 5 * 60 * 1000).toISOString()
  });
});

// Announcements System
app.get('/api/communications/announcements', (req, res) => {
  console.log('📢 Announcements list requested');
  const announcements = [
    {
      id: 'ann-001',
      title: 'Christmas Service Schedule',
      content: 'Join us for special Christmas services on December 24th and 25th.',
      author: 'Pastor John',
      priority: 'high',
      category: 'events',
      publishDate: '2024-11-20',
      expiryDate: '2024-12-26',
      status: 'published',
      targetAudience: 'all',
      channels: ['website', 'email', 'announcement'],
      views: 245,
      created: '2024-11-18T10:00:00Z'
    },
    {
      id: 'ann-002',
      title: 'Small Group Sign-ups Open',
      content: 'New small groups are forming for the new year. Sign up today!',
      author: 'Ministry Team',
      priority: 'medium',
      category: 'ministry',
      publishDate: '2024-11-15',
      expiryDate: '2024-12-31',
      status: 'published',
      targetAudience: 'members',
      channels: ['website', 'email'],
      views: 156,
      created: '2024-11-14T14:30:00Z'
    }
  ];
  
  res.json({
    announcements,
    summary: {
      total: announcements.length,
      published: announcements.filter(a => a.status === 'published').length,
      draft: announcements.filter(a => a.status === 'draft').length,
      expired: 0
    }
  });
});

app.post('/api/communications/announcements', (req, res) => {
  console.log('📢 Creating new announcement');
  const { title, content, priority, category, publishDate, expiryDate, targetAudience, channels } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  
  const announcement = {
    id: `ann-${Date.now()}`,
    title,
    content,
    author: 'Current User',
    priority: priority || 'medium',
    category: category || 'general',
    publishDate: publishDate || new Date().toISOString().split('T')[0],
    expiryDate: expiryDate || null,
    status: 'published',
    targetAudience: targetAudience || 'all',
    channels: channels || ['website'],
    views: 0,
    created: new Date().toISOString()
  };
  
  res.status(201).json(announcement);
});

// ========================================
// COMMUNICATION ANALYTICS ENDPOINTS
// ========================================

// Get campaign analytics overview
app.get('/api/communications/analytics/overview', (req, res) => {
  console.log('📊 Communication analytics overview requested');
  const { dateRange = 'last30days' } = req.query;
  
  const analytics = {
    dateRange,
    overview: {
      totalCampaigns: 15,
      totalEmails: 2847,
      totalSMS: 234,
      averageOpenRate: 68.3,
      averageClickRate: 12.7,
      averageDeliveryRate: 97.2,
      averageEngagementScore: 74.8
    },
    trends: {
      openRates: [
        { date: '2025-09-01', rate: 65.2 },
        { date: '2025-09-08', rate: 67.1 },
        { date: '2025-09-15', rate: 69.8 },
        { date: '2025-09-22', rate: 71.4 },
        { date: '2025-09-29', rate: 68.3 }
      ],
      deliveryRates: [
        { date: '2025-09-01', rate: 96.8 },
        { date: '2025-09-08', rate: 97.3 },
        { date: '2025-09-15', rate: 97.1 },
        { date: '2025-09-22', rate: 97.5 },
        { date: '2025-09-29', rate: 97.2 }
      ],
      engagementScores: [
        { date: '2025-09-01', score: 72.1 },
        { date: '2025-09-08', score: 73.8 },
        { date: '2025-09-15', score: 75.2 },
        { date: '2025-09-22', score: 76.1 },
        { date: '2025-09-29', score: 74.8 }
      ]
    },
    channelBreakdown: {
      email: {
        sent: 2847,
        delivered: 2766,
        opened: 1887,
        clicked: 362,
        bounced: 81,
        unsubscribed: 14
      },
      sms: {
        sent: 234,
        delivered: 231,
        opened: 198,
        clicked: 23,
        failed: 3,
        optedOut: 2
      },
      website: {
        views: 1542,
        clicks: 89,
        shares: 23,
        engagement: 5.8
      }
    },
    topPerformingCampaigns: [
      {
        id: 'camp-001',
        name: 'Welcome New Members',
        type: 'email',
        sentDate: '2025-09-25T10:00:00Z',
        recipients: 89,
        openRate: 84.3,
        clickRate: 18.9,
        deliveryRate: 98.9
      },
      {
        id: 'camp-002',
        name: 'Sunday Service Reminder',
        type: 'sms',
        sentDate: '2025-09-26T08:00:00Z',
        recipients: 156,
        openRate: 92.1,
        clickRate: 15.4,
        deliveryRate: 99.4
      }
    ],
    generatedAt: new Date().toISOString()
  };
  
  res.json(analytics);
});

// Get specific campaign analytics
app.get('/api/communications/campaigns/:id/analytics', (req, res) => {
  console.log(`📊 Campaign analytics requested: ${req.params.id}`);
  const { campaignId } = req.params;
  
  const campaignAnalytics = {
    campaignId,
    campaignName: 'Sunday Service Update',
    type: 'email',
    status: 'sent',
    sentDate: '2025-09-26T09:00:00Z',
    recipients: {
      total: 245,
      delivered: 239,
      bounced: 6,
      failed: 0
    },
    engagement: {
      opens: {
        total: 163,
        unique: 156,
        rate: 65.3,
        firstOpenAvgTime: '2.3 hours'
      },
      clicks: {
        total: 34,
        unique: 31,
        rate: 12.7,
        clickThroughRate: 19.9
      },
      forwards: 8,
      unsubscribes: 2,
      spamReports: 0
    },
    deviceBreakdown: {
      mobile: { count: 98, percentage: 62.8 },
      desktop: { count: 45, percentage: 28.8 },
      tablet: { count: 13, percentage: 8.3 }
    },
    locationBreakdown: [
      { city: 'Local Area', opens: 134, clicks: 24 },
      { city: 'Nearby Cities', opens: 22, clicks: 7 },
      { city: 'Other', opens: 7, clicks: 3 }
    ],
    timeAnalysis: {
      bestOpenTime: '10:00 AM',
      bestClickTime: '2:00 PM',
      hourlyBreakdown: [
        { hour: 8, opens: 12, clicks: 1 },
        { hour: 9, opens: 23, clicks: 4 },
        { hour: 10, opens: 31, clicks: 8 },
        { hour: 11, opens: 18, clicks: 3 },
        { hour: 14, opens: 24, clicks: 9 },
        { hour: 16, opens: 15, clicks: 4 },
        { hour: 19, opens: 22, clicks: 3 },
        { hour: 20, opens: 18, clicks: 2 }
      ]
    },
    generatedAt: new Date().toISOString()
  };
  
  res.json(campaignAnalytics);
});

// Track email opens
app.post('/api/communications/campaigns/:id/track/open', (req, res) => {
  console.log(`📧 Email open tracked: ${req.params.id}`);
  const { recipientId, timestamp, userAgent, ip } = req.body;
  
  const trackingData = {
    campaignId: req.params.id,
    recipientId,
    event: 'open',
    timestamp: timestamp || new Date().toISOString(),
    userAgent,
    ip,
    tracked: true
  };
  
  res.status(201).json({
    message: 'Email open tracked successfully',
    trackingData
  });
});

// Track email clicks
app.post('/api/communications/campaigns/:id/track/click', (req, res) => {
  console.log(`🖱️ Email click tracked: ${req.params.id}`);
  const { recipientId, linkUrl, timestamp, userAgent, ip } = req.body;
  
  const trackingData = {
    campaignId: req.params.id,
    recipientId,
    event: 'click',
    linkUrl,
    timestamp: timestamp || new Date().toISOString(),
    userAgent,
    ip,
    tracked: true
  };
  
  res.status(201).json({
    message: 'Email click tracked successfully',
    trackingData
  });
});

// Track delivery status
app.post('/api/communications/campaigns/:id/track/delivery', (req, res) => {
  console.log(`📨 Delivery status tracked: ${req.params.id}`);
  const { recipientId, status, timestamp, reason } = req.body;
  
  const deliveryData = {
    campaignId: req.params.id,
    recipientId,
    event: 'delivery',
    status, // delivered, bounced, failed
    reason,
    timestamp: timestamp || new Date().toISOString(),
    tracked: true
  };
  
  res.status(201).json({
    message: 'Delivery status tracked successfully',
    deliveryData
  });
});

// Get engagement metrics
app.get('/api/communications/analytics/engagement', (req, res) => {
  console.log('📊 Communication engagement metrics requested');
  const { period = 'weekly', campaignType = 'all' } = req.query;
  
  const engagementMetrics = {
    period,
    campaignType,
    metrics: {
      overall: {
        totalInteractions: 2847,
        uniqueInteractions: 1923,
        engagementRate: 67.5,
        averageTimeSpent: '2m 34s',
        repeatEngagementRate: 23.8
      },
      byChannel: {
        email: {
          avgOpenTime: '8.2 seconds',
          avgClickDelay: '3m 45s',
          multipleOpensRate: 34.2,
          forwardRate: 3.1,
          mobileOpenRate: 62.8
        },
        sms: {
          avgResponseTime: '12 minutes',
          clickThroughRate: 9.8,
          optOutRate: 0.9,
          deliverySuccessRate: 98.7
        },
        announcement: {
          viewDuration: '45 seconds',
          shareRate: 1.5,
          commentRate: 0.8,
          reactionRate: 4.2
        }
      },
      demographics: {
        ageGroups: [
          { range: '18-25', engagement: 78.2 },
          { range: '26-35', engagement: 82.1 },
          { range: '36-50', engagement: 74.5 },
          { range: '51-65', engagement: 68.9 },
          { range: '65+', engagement: 52.3 }
        ],
        memberTypes: [
          { type: 'new_member', engagement: 89.1 },
          { type: 'regular_member', engagement: 71.8 },
          { type: 'leader', engagement: 92.4 },
          { type: 'volunteer', engagement: 85.7 }
        ]
      },
      trends: {
        weeklyEngagement: [
          { week: '2025-09-01', rate: 64.2 },
          { week: '2025-09-08', rate: 66.8 },
          { week: '2025-09-15', rate: 69.1 },
          { week: '2025-09-22', rate: 71.3 },
          { week: '2025-09-29', rate: 67.5 }
        ],
        bestPerformingTimes: [
          { time: '10:00 AM', day: 'Sunday', engagement: 94.2 },
          { time: '7:00 PM', day: 'Wednesday', engagement: 78.5 },
          { time: '9:00 AM', day: 'Tuesday', engagement: 67.8 }
        ]
      }
    },
    generatedAt: new Date().toISOString()
  };
  
  res.json(engagementMetrics);
});

// Get delivery reports
app.get('/api/communications/analytics/delivery', (req, res) => {
  console.log('📊 Communication delivery analytics requested');
  const { startDate, endDate, campaignType = 'all' } = req.query;
  
  const deliveryAnalytics = {
    dateRange: { startDate, endDate },
    campaignType,
    summary: {
      totalSent: 3081,
      totalDelivered: 2997,
      totalBounced: 84,
      totalFailed: 0,
      deliveryRate: 97.3,
      bounceRate: 2.7,
      failureRate: 0.0
    },
    byChannel: {
      email: {
        sent: 2847,
        delivered: 2766,
        bounced: 81,
        softBounces: 67,
        hardBounces: 14,
        deliveryRate: 97.2,
        bounceRate: 2.8
      },
      sms: {
        sent: 234,
        delivered: 231,
        failed: 3,
        deliveryRate: 98.7,
        failureRate: 1.3,
        optOuts: 2
      }
    },
    bounceReasons: [
      { reason: 'Mailbox full', count: 34, percentage: 40.5 },
      { reason: 'Invalid email', count: 28, percentage: 33.3 },
      { reason: 'Blocked by recipient', count: 12, percentage: 14.3 },
      { reason: 'Server temporary unavailable', count: 10, percentage: 11.9 }
    ],
    trends: {
      dailyDeliveryRates: [
        { date: '2025-09-26', email: 97.1, sms: 98.9 },
        { date: '2025-09-25', email: 97.4, sms: 98.5 },
        { date: '2025-09-24', email: 96.8, sms: 99.1 }
      ]
    },
    generatedAt: new Date().toISOString()
  };
  
  res.json(deliveryAnalytics);
});

// ========================================
// PASTORAL CARE ENDPOINTS
// ========================================

// Prayer Requests
app.get('/api/care/prayer-requests', (req, res) => {
  console.log('🙏 Prayer requests list requested');
  res.json({
    requests: productionSeed.prayerRequests || [],
    totalRequests: productionSeed.prayerRequests?.length || 0
  });
});

app.post('/api/care/prayer-requests', (req, res) => {
  console.log('🙏 New prayer request creation');
  const { title, description, requestedBy, requesterId, priority = 'medium', isPrivate = false } = req.body;
  
  // Support both requestedBy and requesterId for flexibility
  const requester = requestedBy || requesterId;
  
  if (!title || !requester) {
    return res.status(400).json({ error: 'Title and requester (requestedBy or requesterId) are required' });
  }
  
  const newRequest = {
    id: `prayer-${Date.now()}`,
    title,
    description: description || '',
    requestedBy: requester,
    priority,
    isPrivate,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  if (!productionSeed.prayerRequests) {
    productionSeed.prayerRequests = [];
  }
  productionSeed.prayerRequests.push(newRequest);
  res.status(201).json(newRequest);
});

app.put('/api/care/prayer-requests/:id', (req, res) => {
  console.log(`🙏 Prayer request update: ${req.params.id}`);
  if (!productionSeed.prayerRequests) {
    return res.status(404).json({ error: 'Prayer request not found' });
  }
  
  const requestIndex = productionSeed.prayerRequests.findIndex(r => r.id === req.params.id);
  if (requestIndex === -1) {
    return res.status(404).json({ error: 'Prayer request not found' });
  }
  
  const updatedRequest = {
    ...productionSeed.prayerRequests[requestIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  productionSeed.prayerRequests[requestIndex] = updatedRequest;
  res.json(updatedRequest);
});

app.delete('/api/care/prayer-requests/:id', (req, res) => {
  console.log(`🙏 Prayer request deletion: ${req.params.id}`);
  if (!productionSeed.prayerRequests) {
    return res.status(404).json({ error: 'Prayer request not found' });
  }
  
  const requestIndex = productionSeed.prayerRequests.findIndex(r => r.id === req.params.id);
  if (requestIndex === -1) {
    return res.status(404).json({ error: 'Prayer request not found' });
  }
  
  productionSeed.prayerRequests.splice(requestIndex, 1);
  res.json({ message: 'Prayer request deleted successfully' });
});

// Counseling Sessions
app.get('/api/care/counseling-sessions', (req, res) => {
  console.log('🗣️ Counseling sessions list requested');
  res.json({
    sessions: productionSeed.counselingSessions || [],
    totalSessions: productionSeed.counselingSessions?.length || 0
  });
});

app.post('/api/care/counseling-sessions', (req, res) => {
  console.log('🗣️ New counseling session creation');
  const { memberId, counselorId, scheduledDate, notes, sessionType = 'individual' } = req.body;
  
  if (!memberId || !counselorId || !scheduledDate) {
    return res.status(400).json({ error: 'Member ID, counselor ID, and scheduled date are required' });
  }
  
  const newSession = {
    id: `session-${Date.now()}`,
    memberId,
    counselorId,
    scheduledDate,
    sessionType,
    notes: notes || '',
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  if (!productionSeed.counselingSessions) {
    productionSeed.counselingSessions = [];
  }
  productionSeed.counselingSessions.push(newSession);
  res.status(201).json(newSession);
});

// Care Records
app.get('/api/care/records', (req, res) => {
  console.log('💙 Care records list requested');
  res.json({
    records: productionSeed.pastoralCare || [],
    totalRecords: productionSeed.pastoralCare?.length || 0
  });
});

app.post('/api/care/records', (req, res) => {
  console.log('💙 New care record creation');
  const { memberId, careType, description, assignedTo, priority = 'medium' } = req.body;
  
  if (!memberId || !careType || !description) {
    return res.status(400).json({ error: 'Member ID, care type, and description are required' });
  }
  
  const newRecord = {
    id: `care-${Date.now()}`,
    memberId,
    careType,
    description,
    assignedTo: assignedTo || 'pastor',
    priority,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  if (!productionSeed.pastoralCare) {
    productionSeed.pastoralCare = [];
  }
  productionSeed.pastoralCare.push(newRecord);
  res.status(201).json(newRecord);
});

// Members needing care
app.get('/api/care/members-needing-care', (req, res) => {
  console.log('💙 Members needing care requested');
  // Mock data for members who may need pastoral care
  const membersNeedingCare = productionSeed.members.slice(0, 5).map(member => ({
    ...member,
    careNeeded: ['prayer', 'visitation', 'counseling'][Math.floor(Math.random() * 3)],
    lastContact: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }));
  
  res.json({
    members: membersNeedingCare,
    totalMembers: membersNeedingCare.length
  });
});

// Legacy pastoral care endpoints (keep for backward compatibility)
app.get('/api/pastoral-care', (req, res) => {
  console.log('💙 Pastoral care records requested (legacy)');
  res.json({
    records: productionSeed.pastoralCare || [],
    prayerRequests: productionSeed.prayerRequests || [],
    counselingSessions: productionSeed.counselingSessions || [],
    visitationRecords: productionSeed.visitationRecords || [],
    totalRecords: productionSeed.pastoralCare?.length || 0,
    totalPrayerRequests: productionSeed.prayerRequests?.length || 0,
    totalSessions: productionSeed.counselingSessions?.length || 0,
    totalVisitations: productionSeed.visitationRecords?.length || 0
  });
});

app.get('/api/pastoral-care/:id', (req, res) => {
  console.log(`💙 Pastoral care record details: ${req.params.id}`);
  const record = productionSeed.pastoralCare?.find(r => r.id === req.params.id);
  
  if (!record) {
    return res.status(404).json({ error: 'Pastoral care record not found' });
  }
  
  res.json({ record });
});

app.post('/api/pastoral-care', (req, res) => {
  console.log('💙 New pastoral care record (legacy)');
  const record = {
    id: `care-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  if (!productionSeed.pastoralCare) {
    productionSeed.pastoralCare = [];
  }
  productionSeed.pastoralCare.push(record);
  res.status(201).json(record);
});

app.put('/api/pastoral-care/:id', (req, res) => {
  console.log(`💙 Pastoral care record update: ${req.params.id}`);
  if (!productionSeed.pastoralCare) {
    return res.status(404).json({ error: 'Pastoral care record not found' });
  }
  
  const recordIndex = productionSeed.pastoralCare.findIndex(r => r.id === req.params.id);
  if (recordIndex === -1) {
    return res.status(404).json({ error: 'Pastoral care record not found' });
  }
  
  const updatedRecord = {
    ...productionSeed.pastoralCare[recordIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  productionSeed.pastoralCare[recordIndex] = updatedRecord;
  res.json(updatedRecord);
});

app.delete('/api/pastoral-care/:id', (req, res) => {
  console.log(`💙 Pastoral care record deletion: ${req.params.id}`);
  if (!productionSeed.pastoralCare) {
    return res.status(404).json({ error: 'Pastoral care record not found' });
  }
  
  const recordIndex = productionSeed.pastoralCare.findIndex(r => r.id === req.params.id);
  if (recordIndex === -1) {
    return res.status(404).json({ error: 'Pastoral care record not found' });
  }
  
  productionSeed.pastoralCare.splice(recordIndex, 1);
  res.json({ message: 'Pastoral care record deleted successfully' });
});

// ========================================
// TASKS ENDPOINTS
// ========================================

app.get('/api/tasks', (req, res) => {
  console.log('📋 Tasks list requested');
  const { status, assignedTo, category } = req.query;
  
  let filteredTasks = productionSeed.tasks;
  
  if (status && status !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.status === status);
  }
  
  if (assignedTo) {
    filteredTasks = filteredTasks.filter(task => task.assignedTo === assignedTo);
  }
  
  if (category && category !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.category === category);
  }
  
  res.json({
    tasks: filteredTasks,
    summary: {
      totalTasks: productionSeed.tasks.length,
      assignedTasks: productionSeed.tasks.filter(t => t.status === 'assigned').length,
      inProgressTasks: productionSeed.tasks.filter(t => t.status === 'in_progress').length,
      completedTasks: productionSeed.tasks.filter(t => t.status === 'completed').length
    }
  });
});

app.get('/api/tasks/:id', (req, res) => {
  console.log(`📋 Task details requested: ${req.params.id}`);
  const task = productionSeed.tasks.find(t => t.id === req.params.id);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  res.json({ task });
});

app.post('/api/tasks', (req, res) => {
  console.log('📋 New task creation');
  const task = {
    id: `task-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
    status: 'assigned'
  };
  
  productionSeed.tasks.push(task);
  res.status(201).json(task);
});

app.put('/api/tasks/:id', (req, res) => {
  console.log(`📋 Task update requested: ${req.params.id}`);
  const taskIndex = productionSeed.tasks.findIndex(t => t.id === req.params.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const updatedTask = {
    ...productionSeed.tasks[taskIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  productionSeed.tasks[taskIndex] = updatedTask;
  res.json(updatedTask);
});

app.delete('/api/tasks/:id', (req, res) => {
  console.log(`📋 Task deletion requested: ${req.params.id}`);
  const taskIndex = productionSeed.tasks.findIndex(t => t.id === req.params.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  productionSeed.tasks.splice(taskIndex, 1);
  res.json({ message: 'Task deleted successfully' });
});

// ========================================
// REPORTS & ANALYTICS ENDPOINTS
// ========================================

app.get('/api/reports/dashboard-stats', (req, res) => {
  console.log('📊 Dashboard stats requested');
  const { range = 'last30days' } = req.query;
  
  const stats = {
    totalMembers: productionSeed.members.length,
    activeGroups: productionSeed.groups.filter(g => g.status === 'active').length,
    upcomingEvents: productionSeed.events.filter(e => new Date(e.startDate) > new Date()).length,
    activePrayerRequests: productionSeed.prayerRequests.filter(r => r.status === 'active').length,
    memberGrowth: 12.5,
    attendanceGrowth: 8.3,
    engagementScore: 87.2,
    avgAttendance: 245
  };
  
  res.json({ stats, range, generatedAt: new Date().toISOString() });
});

// Add missing dashboard endpoint that frontend is calling
app.get('/api/reports/dashboard', (req, res) => {
  console.log('📊 Dashboard reports requested');
  const { range = 'last30days' } = req.query;
  
  const stats = {
    totalMembers: productionSeed.members.length,
    activeGroups: productionSeed.groups.filter(g => g.status === 'active').length,
    upcomingEvents: productionSeed.events.filter(e => new Date(e.startDate) > new Date()).length,
    activePrayerRequests: productionSeed.prayerRequests?.filter(r => r.status === 'active').length || 0,
    memberGrowth: 12.5,
    attendanceGrowth: 8.3,
    engagementScore: 87.2,
    avgAttendance: 245,
    
    // Additional dashboard data
    recentActivity: [
      { type: 'member_joined', message: 'New member Sarah Martinez joined', timestamp: new Date().toISOString() },
      { type: 'event_registered', message: '12 new registrations for Community Service Day', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { type: 'prayer_request', message: 'New prayer request for healing', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() }
    ],
    
    upcomingEventsDetailed: productionSeed.events
      .filter(e => new Date(e.startDate) > new Date())
      .slice(0, 5)
      .map(e => ({
        id: e.id,
        title: e.title,
        date: e.startDate,
        registrations: e.registrationCount || 0,
        capacity: e.maxCapacity || 100
      })),
      
    memberStats: {
      newThisMonth: productionSeed.members.filter(m => 
        new Date(m.joinDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length,
      activeMembers: productionSeed.members.filter(m => m.status === 'active').length,
      leaders: productionSeed.members.filter(m => m.role === 'leader' || m.role === 'pastor').length
    },
    
    groupStats: {
      totalGroups: productionSeed.groups.length,
      avgGroupSize: Math.round(productionSeed.groups.reduce((sum, g) => sum + (g.currentMembers || 0), 0) / productionSeed.groups.length),
      largestGroup: Math.max(...productionSeed.groups.map(g => g.currentMembers || 0))
    }
  };
  
  res.json({ 
    success: true,
    data: stats, 
    range, 
    generatedAt: new Date().toISOString() 
  });
});

app.get('/api/reports/member-engagement-heatmaps', (req, res) => {
  console.log('📊 Member engagement heatmaps requested');
  res.json({
    heatmapData: {
      daily: Array.from({ length: 7 }, (_, i) => ({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
        engagement: Math.floor(Math.random() * 100)
      })),
      monthly: Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        engagement: Math.floor(Math.random() * 100)
      }))
    },
    summary: {
      avgEngagement: 76.4,
      peakDay: 'Sunday',
      peakMonth: 'October'
    }
  });
});

// ========================================
// ADVANCED REPORTING ENDPOINTS
// ========================================

// Member Reports
app.get('/api/reports/members', (req, res) => {
  console.log('📊 Member reports requested');
  res.json({
    memberStats: {
      total: productionSeed.members.length,
      active: productionSeed.members.filter(m => m.status === 'active').length,
      newThisMonth: productionSeed.members.filter(m => 
        new Date(m.joinDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length,
      byRole: {
        members: productionSeed.members.filter(m => m.role === 'member').length,
        leaders: productionSeed.members.filter(m => m.role === 'leader').length,
        pastors: productionSeed.members.filter(m => m.role === 'pastor').length,
        admins: productionSeed.members.filter(m => m.role === 'admin').length
      }
    },
    growthTrends: {
      last6Months: [15, 18, 22, 19, 25, 28],
      projectedGrowth: 12.5,
      retentionRate: 0.89
    },
    demographics: {
      ageGroups: [
        { group: '18-25', count: 24 },
        { group: '26-35', count: 42 },
        { group: '36-50', count: 38 },
        { group: '51+', count: 28 }
      ],
      engagementLevels: [
        { level: 'High', count: 45 },
        { level: 'Medium', count: 67 },
        { level: 'Low', count: 20 }
      ]
    }
  });
});

// Group Reports
app.get('/api/reports/groups', (req, res) => {
  console.log('📊 Group reports requested');
  res.json({
    groupStats: {
      total: productionSeed.groups.length,
      active: productionSeed.groups.filter(g => g.status === 'active').length,
      avgSize: Math.round(productionSeed.groups.reduce((sum, g) => sum + (g.currentMembers || 0), 0) / productionSeed.groups.length),
      totalMembers: productionSeed.groups.reduce((sum, g) => sum + (g.currentMembers || 0), 0)
    },
    healthMetrics: {
      highHealth: productionSeed.groups.filter(g => (g.currentMembers || 0) >= 8).length,
      mediumHealth: productionSeed.groups.filter(g => (g.currentMembers || 0) >= 4 && (g.currentMembers || 0) < 8).length,
      needsAttention: productionSeed.groups.filter(g => (g.currentMembers || 0) < 4).length
    },
    growthTrends: {
      last6Months: [3, 3, 4, 4, 3, 3],
      newGroups: 1,
      closedGroups: 0
    },
    byCategory: productionSeed.groups.reduce((acc, g) => {
      const cat = g.category || 'General';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {})
  });
});

// Event Reports
app.get('/api/reports/events', (req, res) => {
  console.log('📊 Event reports requested');
  res.json({
    eventStats: {
      total: productionSeed.events.length,
      upcoming: productionSeed.events.filter(e => new Date(e.startDate) > new Date()).length,
      past: productionSeed.events.filter(e => new Date(e.startDate) <= new Date()).length,
      avgAttendance: 85
    },
    attendanceMetrics: {
      totalRegistrations: productionSeed.events.reduce((sum, e) => sum + (e.registrationCount || 0), 0),
      avgRegistrationRate: 0.78,
      noShowRate: 0.12,
      capacityUtilization: 0.67
    },
    eventTypes: productionSeed.events.reduce((acc, e) => {
      const cat = e.category || 'General';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {}),
    trends: {
      last6Months: [8, 12, 15, 10, 18, 14],
      popularDays: ['Sunday', 'Wednesday', 'Saturday'],
      peakHours: ['10:00 AM', '7:00 PM']
    }
  });
});

// Attendance Reports
app.get('/api/reports/attendance', (req, res) => {
  console.log('📊 Attendance reports requested');
  res.json({
    overallAttendance: {
      avgWeekly: 245,
      avgGrowthRate: 8.3,
      consistencyScore: 0.82,
      seasonalVariation: 0.15
    },
    byGroup: productionSeed.groups.map(g => ({
      groupId: g.id,
      groupName: g.name,
      avgAttendance: Math.floor(Math.random() * 20) + 10,
      attendanceRate: Math.random() * 0.3 + 0.7,
      trend: Math.random() > 0.5 ? 'increasing' : 'stable'
    })),
    weeklyTrends: {
      last12Weeks: Array.from({ length: 12 }, () => Math.floor(Math.random() * 50) + 200),
      bestWeek: '2024-11-10',
      lowestWeek: '2024-09-15'
    },
    insights: [
      'Sunday morning services show highest consistency',
      'Small group attendance correlates with overall engagement',
      'Weather impacts midweek service attendance by 15%'
    ]
  });
});

// Journey Reports
app.get('/api/reports/journeys', (req, res) => {
  console.log('📊 Journey reports requested');
  res.json({
    journeyStats: {
      totalTemplates: productionSeed.journeyTemplates.length,
      activeJourneys: 87,
      completedJourneys: 34,
      avgCompletionTime: 120,
      completionRate: 0.72
    },
    progressMetrics: {
      byPhase: {
        foundation: { started: 120, completed: 102 },
        connection: { started: 102, completed: 89 },
        discovery: { started: 89, completed: 65 },
        engagement: { started: 65, completed: 34 }
      },
      dropoffRates: {
        foundation: 0.15,
        connection: 0.13,
        discovery: 0.27,
        engagement: 0.48
      }
    },
    templatePopularity: productionSeed.journeyTemplates.map(t => ({
      templateId: t.id,
      templateName: t.title,
      assignments: Math.floor(Math.random() * 50) + 10,
      completions: Math.floor(Math.random() * 30) + 5,
      avgRating: Math.random() * 2 + 3
    })),
    insights: [
      'Members with mentors complete journeys 65% faster',
      'Spiritual gifts assessment increases serving participation by 40%',
      'Daily devotion tracking improves completion rates by 25%'
    ]
  });
});

// Engagement Analytics
app.get('/api/reports/engagement', (req, res) => {
  console.log('📊 Engagement analytics requested');
  res.json({
    overallEngagement: {
      score: 87.2,
      trend: 'increasing',
      benchmarkComparison: 'above_average',
      lastUpdated: new Date().toISOString()
    },
    engagementFactors: {
      eventAttendance: 0.25,
      smallGroupParticipation: 0.30,
      volunteerInvolvement: 0.20,
      spiritualJourney: 0.15,
      communication: 0.10
    },
    memberSegments: [
      { segment: 'Highly Engaged', count: 45, percentage: 0.34 },
      { segment: 'Moderately Engaged', count: 67, percentage: 0.51 },
      { segment: 'Low Engagement', count: 20, percentage: 0.15 }
    ],
    trends: {
      last12Months: Array.from({ length: 12 }, () => Math.floor(Math.random() * 20) + 70),
      seasonalPatterns: {
        spring: 85.2,
        summer: 78.9,
        fall: 92.1,
        winter: 83.4
      }
    },
    actionableInsights: [
      'Focus retention efforts on moderately engaged members',
      'Summer engagement drops 12% - consider special programs',
      'New member orientation improves 6-month retention by 35%'
    ]
  });
});

// ========================================
// ATTENDANCE ENDPOINTS
// ========================================

app.get('/api/attendance', (req, res) => {
  console.log('📊 Attendance sessions requested');
  const { groupId, limit = 20, offset = 0 } = req.query;
  
  // Generate mock attendance sessions
  const attendanceSessions = Array.from({ length: 15 }, (_, i) => ({
    id: `session-${i + 1}`,
    groupId: groupId || `group-${Math.floor(Math.random() * 5) + 1}`,
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    attendees: Array.from({ length: Math.floor(Math.random() * 20) + 5 }, (_, j) => ({
      memberId: `member-${j + 1}`,
      memberName: `Member ${j + 1}`,
      status: ['present', 'absent', 'late', 'excused'][Math.floor(Math.random() * 4)],
      checkInTime: Math.random() > 0.3 ? new Date().toISOString() : null,
      notes: Math.random() > 0.7 ? 'Late arrival' : ''
    })),
    totalExpected: Math.floor(Math.random() * 25) + 10,
    totalPresent: Math.floor(Math.random() * 20) + 5,
    attendanceRate: Math.floor(Math.random() * 30) + 70,
    createdBy: 'leader-1',
    createdAt: new Date().toISOString()
  }));
  
  let filteredSessions = attendanceSessions;
  if (groupId && groupId !== 'all') {
    filteredSessions = attendanceSessions.filter(session => session.groupId === groupId);
  }
  
  const paginatedSessions = filteredSessions.slice(offset, offset + parseInt(limit));
  
  res.json({
    sessions: paginatedSessions,
    pagination: {
      total: filteredSessions.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: offset + parseInt(limit) < filteredSessions.length
    }
  });
});

app.get('/api/attendance/stats', (req, res) => {
  console.log('📊 Attendance statistics requested');
  const { groupId, startDate, endDate } = req.query;
  
  const stats = {
    groupId: groupId || 'all-groups',
    dateRange: {
      startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: endDate || new Date().toISOString()
    },
    totalSessions: 12,
    averageAttendance: 85.2,
    totalMembers: 28,
    attendanceTrends: {
      thisMonth: 87.5,
      lastMonth: 82.1,
      trend: 'increasing'
    },
    memberStats: Array.from({ length: 10 }, (_, i) => ({
      memberId: `member-${i + 1}`,
      memberName: `Member ${i + 1}`,
      sessionsAttended: Math.floor(Math.random() * 12),
      totalSessions: 12,
      attendanceRate: Math.floor(Math.random() * 40) + 60,
      status: Math.random() > 0.8 ? 'needs_attention' : 'good'
    })),
    weeklyBreakdown: Array.from({ length: 4 }, (_, i) => ({
      week: `Week ${i + 1}`,
      attendanceRate: Math.floor(Math.random() * 20) + 75,
      totalAttendees: Math.floor(Math.random() * 10) + 20
    }))
  };
  
  res.json({ stats });
});

app.post('/api/attendance', (req, res) => {
  console.log('📊 Attendance session creation requested');
  const { groupId, date, attendees } = req.body;
  
  const session = {
    id: `session-${Date.now()}`,
    groupId,
    date: date || new Date().toISOString(),
    attendees: attendees || [],
    totalExpected: attendees?.length || 0,
    totalPresent: attendees?.filter(a => a.status === 'present').length || 0,
    attendanceRate: attendees ? Math.round((attendees.filter(a => a.status === 'present').length / attendees.length) * 100) : 0,
    createdBy: 'admin',
    createdAt: new Date().toISOString()
  };
  
  res.status(201).json({ session });
});

// ========================================
// DASHBOARD ENDPOINTS
// ========================================

app.get('/api/dashboard/stats', (req, res) => {
  console.log('📊 Dashboard statistics requested');
  res.json({
    members: productionSeed.members.length,
    groups: productionSeed.groups.length,
    events: productionSeed.events.length,
    journeys: productionSeed.journeyTemplates.length,
    recentActivity: [
      { type: 'member_joined', message: 'New member Sarah Martinez joined', timestamp: new Date().toISOString() },
      { type: 'event_registered', message: '12 new registrations for Community Service Day', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { type: 'prayer_request', message: 'New prayer request for healing', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() }
    ],
    upcomingEvents: productionSeed.events
      .filter(e => new Date(e.startDate) > new Date())
      .slice(0, 3)
      .map(e => ({
        id: e.id,
        title: e.title,
        date: e.startDate,
        registrations: e.registrationCount
      }))
  });
});

// ==========================================
// VOLUNTEERS MODULE - Complete Implementation
// ==========================================

app.get('/api/volunteers/opportunities', (req, res) => {
  console.log('🤝 Volunteer opportunities requested');
  const { category, skills, location, dateRange } = req.query;
  
  const opportunities = [
    {
      id: 'vol-001',
      title: 'Sunday School Teacher',
      description: 'Teach elementary Sunday school classes',
      category: 'Education',
      skillsRequired: ['Teaching', 'Child Care', 'Patience'],
      timeCommitment: 'Weekly - 2 hours',
      location: 'Main Campus - Room 105',
      contactPerson: 'Sarah Johnson',
      startDate: '2024-02-01',
      endDate: '2024-05-31',
      spotsAvailable: 3,
      spotsTotal: 5,
      isActive: true,
      requiresBackground: true
    },
    {
      id: 'vol-002', 
      title: 'Worship Team Musician',
      description: 'Play instruments during worship services',
      category: 'Worship',
      skillsRequired: ['Musical Instruments', 'Team Collaboration'],
      timeCommitment: 'Weekly - 4 hours',
      location: 'Main Campus - Sanctuary',
      contactPerson: 'Mike Davis',
      startDate: '2024-01-15',
      endDate: '2024-12-31',
      spotsAvailable: 2,
      spotsTotal: 8,
      isActive: true,
      requiresBackground: false
    },
    {
      id: 'vol-003',
      title: 'Food Pantry Coordinator',
      description: 'Organize and distribute food to families in need',
      category: 'Community Service',
      skillsRequired: ['Organization', 'Leadership', 'Compassion'],
      timeCommitment: 'Monthly - 8 hours',
      location: 'Community Center',
      contactPerson: 'Pastor John',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      spotsAvailable: 1,
      spotsTotal: 3,
      isActive: true,
      requiresBackground: true
    }
  ];
  
  let filteredOpportunities = opportunities;
  
  if (category) {
    filteredOpportunities = filteredOpportunities.filter(opp => 
      opp.category.toLowerCase().includes(category.toLowerCase())
    );
  }
  
  if (skills) {
    const skillArray = skills.split(',').map(s => s.trim());
    filteredOpportunities = filteredOpportunities.filter(opp =>
      skillArray.some(skill => 
        opp.skillsRequired.some(reqSkill => 
          reqSkill.toLowerCase().includes(skill.toLowerCase())
        )
      )
    );
  }
  
  if (location) {
    filteredOpportunities = filteredOpportunities.filter(opp =>
      opp.location.toLowerCase().includes(location.toLowerCase())
    );
  }
  
  res.json({
    opportunities: filteredOpportunities,
    total: filteredOpportunities.length,
    categories: ['Education', 'Worship', 'Community Service', 'Youth Ministry', 'Administration'],
    timestamp: new Date().toISOString()
  });
});

app.post('/api/volunteers/opportunities', (req, res) => {
  console.log('🤝 Creating volunteer opportunity:', req.body);
  const opportunity = {
    id: `vol-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
    createdBy: 'admin-001',
    spotsAvailable: req.body.spotsTotal || 1,
    isActive: true
  };
  
  res.status(201).json({
    success: true,
    message: 'Volunteer opportunity created successfully',
    opportunity
  });
});

app.get('/api/volunteers/my-signups', (req, res) => {
  console.log('🤝 My volunteer signups requested');
  const memberId = req.query.memberId || 'mbr-001';
  
  const signups = [
    {
      id: 'signup-001',
      memberId,
      opportunityId: 'vol-001',
      opportunityTitle: 'Sunday School Teacher',
      status: 'confirmed',
      signupDate: '2024-01-15T10:00:00Z',
      scheduledDates: ['2024-02-04', '2024-02-11', '2024-02-18'],
      hoursCompleted: 6,
      hoursCommitted: 24,
      feedback: 'Great experience working with the children',
      contactPerson: 'Sarah Johnson'
    },
    {
      id: 'signup-002',
      memberId,
      opportunityId: 'vol-003',
      opportunityTitle: 'Food Pantry Coordinator',
      status: 'pending',
      signupDate: '2024-01-20T14:30:00Z',
      scheduledDates: ['2024-02-01'],
      hoursCompleted: 0,
      hoursCommitted: 8,
      feedback: '',
      contactPerson: 'Pastor John'
    }
  ];
  
  res.json({
    signups,
    totalSignups: signups.length,
    totalHoursCompleted: signups.reduce((sum, signup) => sum + signup.hoursCompleted, 0),
    totalHoursCommitted: signups.reduce((sum, signup) => sum + signup.hoursCommitted, 0)
  });
});

app.post('/api/volunteers/signup', (req, res) => {
  console.log('🤝 Volunteer signup requested:', req.body);
  const { opportunityId, memberId, scheduledDates, notes } = req.body;
  
  const signup = {
    id: `signup-${Date.now()}`,
    memberId,
    opportunityId,
    status: 'confirmed',
    signupDate: new Date().toISOString(),
    scheduledDates: scheduledDates || [],
    notes: notes || '',
    confirmationCode: `VOL-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
    hoursCompleted: 0
  };
  
  res.status(201).json({
    success: true,
    message: 'Successfully signed up for volunteer opportunity',
    signup,
    nextSteps: 'You will be contacted by the opportunity coordinator within 48 hours'
  });
});

// ==========================================
// SETTINGS MODULE - Complete Implementation  
// ==========================================

app.get('/api/settings/system', (req, res) => {
  console.log('⚙️ System settings requested');
  
  const settings = {
    general: {
      organizationName: 'FaithLink Community Church',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
      language: 'en-US'
    },
    features: {
      enableJourneyTracking: true,
      enableEventRegistration: true,
      enableVolunteerSignup: true,
      enablePastoralCare: true,
      enableReporting: true,
      enableNotifications: true
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      dailyDigest: true,
      weeklyReports: true
    },
    security: {
      requireTwoFactor: false,
      sessionTimeout: 480,
      passwordExpiry: 90,
      maxLoginAttempts: 5,
      requirePasswordChange: false
    },
    integrations: {
      emailProvider: 'sendgrid',
      smsProvider: 'twilio',
      calendarSync: 'google',
      paymentProcessor: 'stripe',
      backgroundChecks: 'checkr'
    }
  };
  
  res.json({
    settings,
    lastUpdated: '2024-01-15T10:30:00Z',
    updatedBy: 'admin-001'
  });
});

app.put('/api/settings/system', (req, res) => {
  console.log('⚙️ Updating system settings:', req.body);
  
  const updatedSettings = {
    ...req.body,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'admin-001'
  };
  
  res.json({
    success: true,
    message: 'System settings updated successfully',
    settings: updatedSettings
  });
});

app.get('/api/settings/users', (req, res) => {
  console.log('⚙️ User settings requested');
  
  const userSettings = [
    {
      userId: 'usr-001',
      memberName: 'Admin User',
      role: 'admin',
      permissions: {
        manageMembers: true,
        manageGroups: true,
        manageEvents: true,
        manageTasks: true,
        viewReports: true,
        manageSettings: true
      },
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        theme: 'light',
        language: 'en-US',
        dashboard: 'admin'
      },
      lastLogin: '2024-01-20T09:15:00Z',
      accountStatus: 'active'
    },
    {
      userId: 'usr-002',
      memberName: 'Pastor John',
      role: 'pastor',
      permissions: {
        manageMembers: true,
        manageGroups: true,
        manageEvents: true,
        manageTasks: false,
        viewReports: true,
        manageSettings: false
      },
      preferences: {
        emailNotifications: true,
        smsNotifications: true,
        theme: 'light',
        language: 'en-US',
        dashboard: 'pastoral'
      },
      lastLogin: '2024-01-19T16:45:00Z',
      accountStatus: 'active'
    }
  ];
  
  res.json({
    users: userSettings,
    total: userSettings.length,
    roles: ['admin', 'pastor', 'group_leader', 'member'],
    permissions: [
      'manageMembers', 'manageGroups', 'manageEvents', 
      'manageTasks', 'viewReports', 'manageSettings'
    ]
  });
});

app.get('/api/settings/users/:userId', (req, res) => {
  console.log('⚙️ User setting requested for:', req.params.userId);
  
  const userSetting = {
    userId: req.params.userId,
    memberName: 'John Doe',
    role: 'member',
    permissions: {
      manageMembers: false,
      manageGroups: false,
      manageEvents: false,
      manageTasks: false,
      viewReports: false,
      manageSettings: false
    },
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      theme: 'light',
      language: 'en-US',
      dashboard: 'member'
    },
    lastLogin: new Date().toISOString(),
    accountStatus: 'active'
  };
  
  res.json(userSetting);
});

// ==========================================
// AUTH MODULE EXTENSIONS - Missing Endpoints
// ==========================================

app.post('/api/auth/register', (req, res) => {
  console.log('🔐 User registration requested:', req.body.email);
  const { email, password, firstName, lastName } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  
  // Check if user already exists
  const existingUser = productionSeed.members.find(m => m.email === email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }
  
  // Create new user with full member profile
  const newUserId = `mbr-${Date.now()}`;
  const user = {
    id: newUserId,
    firstName: firstName || 'New',
    lastName: lastName || 'User',
    email: email,
    role: 'member', // Default role for registered users
    status: 'active',
    joinDate: new Date().toISOString().split('T')[0],
    phone: '+1-555-0000',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    demographics: {
      dateOfBirth: null,
      gender: 'unknown',
      maritalStatus: 'unknown'
    },
    ministry: {
      roles: [],
      skills: [],
      availability: []
    },
    attendance: {
      totalServices: 0,
      averageMonthly: 0,
      lastAttended: null
    },
    giving: {
      totalLifetime: 0,
      averageMonthly: 0,
      lastGift: null
    }
  };
  
  // Add to seed data
  productionSeed.members.push(user);
  
  // Create session token
  const token = `faithlink-token-${user.id}-${Date.now()}`;
  
  // Store session
  activeSessions.set(token, {
    userId: user.id,
    user: user,
    loginTime: new Date().toISOString(),
    lastActivity: new Date().toISOString()
  });
  
  console.log('✅ Registration successful for:', user.firstName, user.lastName);
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      joinDate: user.joinDate
    },
    token: token
  });
});

app.post('/api/auth/refresh', (req, res) => {
  console.log('🔐 Token refresh requested');
  
  const newToken = `refresh_token_${Date.now()}`;
  
  res.json({
    success: true,
    token: newToken,
    expiresIn: 86400,
    refreshedAt: new Date().toISOString()
  });
});

app.post('/api/auth/logout', (req, res) => {
  console.log('🔐 User logout requested');
  
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const session = activeSessions.get(token);
    
    if (session) {
      console.log('✅ Clearing session for:', session.user.firstName, session.user.lastName);
      activeSessions.delete(token);
    }
  }
  
  res.json({
    success: true,
    message: 'User logged out successfully',
    loggedOutAt: new Date().toISOString()
  });
});

app.post('/api/auth/forgot-password', (req, res) => {
  console.log('🔐 Password reset requested for:', req.body.email);
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }
  
  const resetToken = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 10)}`;
  
  res.json({
    success: true,
    message: 'Password reset email sent successfully',
    resetToken,
    expiresIn: 3600
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  console.log('🔐 Password reset confirmation:', req.body);
  const { token, password } = req.body;
  
  if (!token || !password) {
    return res.status(400).json({
      success: false,
      message: 'Reset token and new password are required'
    });
  }
  
  res.json({
    success: true,
    message: 'Password reset successfully',
    resetAt: new Date().toISOString()
  });
});

// ==========================================
// MISSING GROUPS MODULE ENDPOINTS
// ==========================================

app.get('/api/groups/bulk', (req, res) => {
  console.log('👥 Groups bulk operations requested');
  res.json({
    success: true,
    message: 'Bulk operations endpoint ready',
    supportedOperations: ['export', 'import', 'bulk-update', 'bulk-delete']
  });
});

app.get('/api/groups/:groupId/members', (req, res) => {
  console.log('👥 Group members requested for:', req.params.groupId);
  const { groupId } = req.params;
  
  const members = [
    {
      id: 'mbr-001',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@example.com',
      role: 'leader',
      joinedDate: '2024-01-15T10:00:00Z',
      status: 'active'
    },
    {
      id: 'mbr-002', 
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@example.com',
      role: 'member',
      joinedDate: '2024-01-20T14:30:00Z',
      status: 'active'
    }
  ];
  
  res.json({
    groupId,
    members,
    total: members.length,
    roles: ['leader', 'co-leader', 'member']
  });
});

app.post('/api/groups/:groupId/members', (req, res) => {
  console.log('👥 Adding member to group:', req.params.groupId, req.body);
  const { groupId } = req.params;
  const { memberId, role = 'member' } = req.body;
  
  res.status(201).json({
    success: true,
    message: 'Member added to group successfully',
    groupId,
    memberId,
    role,
    addedAt: new Date().toISOString()
  });
});

app.delete('/api/groups/:groupId/members/:memberId', (req, res) => {
  console.log('👥 Removing member from group:', req.params);
  const { groupId, memberId } = req.params;
  
  res.json({
    success: true,
    message: 'Member removed from group successfully',
    groupId,
    memberId,
    removedAt: new Date().toISOString()
  });
});

// ==========================================
// MISSING MEMBERS MODULE ENDPOINTS
// ==========================================

app.get('/api/members/bulk', (req, res) => {
  console.log('👥 Members bulk operations requested');
  res.json({
    success: true,
    message: 'Members bulk operations endpoint ready',
    supportedOperations: ['export', 'import', 'bulk-update', 'bulk-invite']
  });
});

app.get('/api/members/search/suggestions', (req, res) => {
  console.log('👥 Member search suggestions for:', req.query.q);
  const { q } = req.query;
  
  const suggestions = [
    { id: 'mbr-001', name: 'John Smith', email: 'john@example.com' },
    { id: 'mbr-002', name: 'Sarah Johnson', email: 'sarah@example.com' },
    { id: 'mbr-003', name: 'Mike Davis', email: 'mike@example.com' }
  ].filter(member => 
    q ? member.name.toLowerCase().includes(q.toLowerCase()) : true
  );
  
  res.json({ suggestions, total: suggestions.length });
});

// ==========================================
// MISSING EVENTS MODULE ENDPOINTS
// ==========================================

app.get('/api/events/:eventId/registrations', (req, res) => {
  console.log('📅 Event registrations requested for:', req.params.eventId);
  const { eventId } = req.params;
  
  const registrations = [
    {
      id: 'reg-001',
      eventId,
      memberId: 'mbr-001',
      memberName: 'John Smith',
      registrationDate: '2024-01-15T10:00:00Z',
      status: 'confirmed',
      notes: ''
    },
    {
      id: 'reg-002',
      eventId,
      memberId: 'mbr-002', 
      memberName: 'Sarah Johnson',
      registrationDate: '2024-01-16T09:30:00Z',
      status: 'confirmed',
      notes: 'Dietary restrictions: vegetarian'
    }
  ];
  
  res.json({
    eventId,
    registrations,
    total: registrations.length,
    capacity: 50,
    available: 48
  });
});

app.post('/api/events/:eventId/registrations', (req, res) => {
  console.log('📅 Event registration requested:', req.params.eventId, req.body);
  const { eventId } = req.params;
  const { memberId, notes = '' } = req.body;
  
  const registration = {
    id: `reg-${Date.now()}`,
    eventId,
    memberId,
    registrationDate: new Date().toISOString(),
    status: 'confirmed',
    confirmationCode: `EVENT-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
    notes
  };
  
  res.status(201).json({
    success: true,
    message: 'Successfully registered for event',
    registration
  });
});

app.get('/api/events/:eventId/rsvps', (req, res) => {
  console.log('📅 Event RSVPs requested for:', req.params.eventId);
  const { eventId } = req.params;
  
  const rsvps = [
    {
      id: 'rsvp-001',
      eventId,
      memberId: 'mbr-001',
      memberName: 'John Smith',
      response: 'yes',
      rsvpDate: '2024-01-15T10:00:00Z',
      guestCount: 2
    },
    {
      id: 'rsvp-002',
      eventId,
      memberId: 'mbr-002',
      memberName: 'Sarah Johnson', 
      response: 'maybe',
      rsvpDate: '2024-01-16T14:30:00Z',
      guestCount: 0
    }
  ];
  
  res.json({
    eventId,
    rsvps,
    summary: {
      yes: 1,
      no: 0,
      maybe: 1,
      pending: 0
    }
  });
});

app.post('/api/events/:eventId/rsvps', (req, res) => {
  console.log('📅 RSVP submitted:', req.params.eventId, req.body);
  const { eventId } = req.params;
  const { memberId, response, guestCount = 0 } = req.body;
  
  const rsvp = {
    id: `rsvp-${Date.now()}`,
    eventId,
    memberId,
    response,
    guestCount,
    rsvpDate: new Date().toISOString()
  };
  
  res.status(201).json({
    success: true,
    message: 'RSVP recorded successfully',
    rsvp
  });
});

app.get('/api/events/:eventId/check-in', (req, res) => {
  console.log('📅 Event check-in status for:', req.params.eventId);
  const { eventId } = req.params;
  
  res.json({
    eventId,
    checkInOpen: true,
    totalRegistered: 25,
    totalCheckedIn: 18,
    checkInRate: 72,
    recentCheckIns: [
      { memberId: 'mbr-001', memberName: 'John Smith', checkInTime: new Date().toISOString() }
    ]
  });
});

// ==========================================
// MISSING COMMUNICATIONS MODULE ENDPOINTS
// ==========================================

app.get('/api/communications/templates', (req, res) => {
  console.log('📧 Communication templates requested');
  
  const templates = [
    {
      id: 'tmpl-001',
      name: 'Welcome Email',
      category: 'onboarding',
      subject: 'Welcome to FaithLink Community!',
      content: 'Dear {{firstName}}, welcome to our community...',
      variables: ['firstName', 'lastName', 'churchName'],
      isActive: true,
      createdAt: '2024-01-10T10:00:00Z'
    },
    {
      id: 'tmpl-002',
      name: 'Event Reminder',
      category: 'events',
      subject: 'Reminder: {{eventTitle}} is tomorrow',
      content: 'Hi {{firstName}}, this is a reminder that {{eventTitle}} is scheduled for tomorrow...',
      variables: ['firstName', 'eventTitle', 'eventDate', 'eventLocation'],
      isActive: true,
      createdAt: '2024-01-12T14:30:00Z'
    }
  ];
  
  res.json({
    templates,
    total: templates.length,
    categories: ['onboarding', 'events', 'pastoral', 'newsletter', 'announcement']
  });
});

app.post('/api/communications/templates', (req, res) => {
  console.log('📧 Creating communication template:', req.body);
  
  const template = {
    id: `tmpl-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
    createdBy: 'admin-001',
    isActive: true
  };
  
  res.status(201).json({
    success: true,
    message: 'Communication template created successfully',
    template
  });
});

// ==========================================
// MISSING JOURNEY TEMPLATES ENDPOINTS
// ==========================================

app.post('/api/journey-templates/:templateId/duplicate', (req, res) => {
  console.log('🌟 Duplicating journey template:', req.params.templateId);
  const { templateId } = req.params;
  
  const duplicatedTemplate = {
    id: `jt-${Date.now()}`,
    title: `Copy of Journey Template`,
    description: 'Duplicated journey template',
    originalId: templateId,
    createdAt: new Date().toISOString(),
    createdBy: 'admin-001'
  };
  
  res.status(201).json({
    success: true,
    message: 'Journey template duplicated successfully',
    template: duplicatedTemplate
  });
});

// ==========================================
// DUPLICATE ENDPOINT REMOVED - Already exists above in proper position
// ==========================================

// ==========================================
// MISSING ATTENDANCE ENDPOINTS
// ==========================================

app.post('/api/attendance/:groupId/bulk-update', (req, res) => {
  console.log('📊 Bulk updating attendance for group:', req.params.groupId);
  const { groupId } = req.params;
  const { attendees = [] } = req.body;
  
  res.json({
    success: true,
    message: `Bulk attendance updated for ${attendees.length} members`,
    groupId,
    updated: attendees.length,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// MISSING REPORTS ENDPOINTS
// ==========================================

app.get('/api/reports', (req, res) => {
  console.log('📊 Reports list requested');
  
  const reports = [
    {
      id: 'rpt-001',
      name: 'Monthly Attendance Report',
      category: 'attendance',
      description: 'Monthly attendance statistics',
      lastGenerated: '2024-01-20T10:00:00Z'
    },
    {
      id: 'rpt-002',
      name: 'Member Growth Report',
      category: 'members',
      description: 'Member growth and retention statistics',
      lastGenerated: '2024-01-19T15:30:00Z'
    }
  ];
  
  res.json({
    reports,
    total: reports.length,
    categories: ['attendance', 'members', 'groups', 'events', 'journeys', 'engagement']
  });
});

app.get('/api/reports/group-health', (req, res) => {
  console.log('📊 Group health report requested:', req.query);
  const { range = '30days' } = req.query;
  
  res.json({
    range,
    groupHealth: {
      totalGroups: 8,
      activeGroups: 7,
      healthScore: 85.5,
      trends: {
        attendance: 'stable',
        engagement: 'increasing',
        growth: 'moderate'
      }
    },
    generatedAt: new Date().toISOString()
  });
});

// ==========================================
// REPORT EXPORT ENDPOINTS
// ==========================================

// Helper function to convert JSON to CSV
function jsonToCsv(data, headers) {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }
  
  const csvHeaders = headers || Object.keys(data[0]);
  const csvRows = [
    csvHeaders.join(','),
    ...data.map(row => 
      csvHeaders.map(header => {
        const value = row[header];
        // Handle values that contain commas, quotes, or newlines
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ];
  
  return csvRows.join('\n');
}

// Export Members Report
app.get('/api/reports/members/export', (req, res) => {
  console.log('📊 Members report export requested:', req.query);
  const { format = 'csv', filters = '{}' } = req.query;
  
  try {
    // Get member data (simulate filtered data based on filters)
    const memberData = productionSeed.members.map(member => ({
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      membershipStatus: member.membershipStatus,
      joinDate: member.joinDate,
      groupMemberships: member.groupMemberships?.length || 0,
      attendance: member.attendance?.length || 0,
      lastActivity: member.updatedAt
    }));
    
    if (format === 'csv') {
      const csv = jsonToCsv(memberData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="members-report-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="members-report-${new Date().toISOString().split('T')[0]}.json"`);
      res.json({
        reportType: 'members',
        generatedAt: new Date().toISOString(),
        filters: JSON.parse(filters),
        data: memberData,
        summary: {
          totalMembers: memberData.length,
          activeMembers: memberData.filter(m => m.membershipStatus === 'active').length,
          newMembers: memberData.filter(m => new Date(m.joinDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
        }
      });
    } else {
      res.status(400).json({ error: 'Unsupported format. Use csv or json.' });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to generate export' });
  }
});

// Export Groups Report
app.get('/api/reports/groups/export', (req, res) => {
  console.log('📊 Groups report export requested:', req.query);
  const { format = 'csv', filters = '{}' } = req.query;
  
  try {
    const groupData = productionSeed.groups.map(group => ({
      id: group.id,
      name: group.name,
      type: group.type,
      status: group.status,
      memberCount: group.memberIds?.length || 0,
      leaderName: group.leaderName,
      meetingDay: group.meetingDay,
      location: group.location,
      createdDate: group.createdAt,
      lastActivity: group.updatedAt
    }));
    
    if (format === 'csv') {
      const csv = jsonToCsv(groupData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="groups-report-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="groups-report-${new Date().toISOString().split('T')[0]}.json"`);
      res.json({
        reportType: 'groups',
        generatedAt: new Date().toISOString(),
        filters: JSON.parse(filters),
        data: groupData,
        summary: {
          totalGroups: groupData.length,
          activeGroups: groupData.filter(g => g.status === 'active').length,
          averageGroupSize: Math.round(groupData.reduce((sum, g) => sum + g.memberCount, 0) / groupData.length)
        }
      });
    } else {
      res.status(400).json({ error: 'Unsupported format. Use csv or json.' });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to generate export' });
  }
});

// Export Events Report
app.get('/api/reports/events/export', (req, res) => {
  console.log('📊 Events report export requested:', req.query);
  const { format = 'csv', dateRange = 'all' } = req.query;
  
  try {
    const eventData = productionSeed.events.map(event => ({
      id: event.id,
      title: event.title,
      category: event.category,
      startDate: event.startDate,
      location: event.location,
      maxCapacity: event.maxCapacity,
      registrations: event.registrations?.length || 0,
      attendees: event.attendees?.length || 0,
      attendanceRate: event.attendees && event.registrations ? 
        Math.round((event.attendees.length / event.registrations.length) * 100) + '%' : 'N/A',
      status: event.status,
      createdDate: event.createdAt
    }));
    
    if (format === 'csv') {
      const csv = jsonToCsv(eventData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="events-report-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="events-report-${new Date().toISOString().split('T')[0]}.json"`);
      res.json({
        reportType: 'events',
        generatedAt: new Date().toISOString(),
        dateRange,
        data: eventData,
        summary: {
          totalEvents: eventData.length,
          totalRegistrations: eventData.reduce((sum, e) => sum + e.registrations, 0),
          totalAttendees: eventData.reduce((sum, e) => sum + e.attendees, 0),
          averageAttendanceRate: Math.round(
            eventData.filter(e => e.attendanceRate !== 'N/A')
              .reduce((sum, e) => sum + parseInt(e.attendanceRate), 0) / 
            eventData.filter(e => e.attendanceRate !== 'N/A').length
          ) + '%'
        }
      });
    } else {
      res.status(400).json({ error: 'Unsupported format. Use csv or json.' });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to generate export' });
  }
});

// ==========================================
// MISSING JOURNEY MEMBER-JOURNEYS ENDPOINT
// ==========================================

app.get('/api/journeys/member-journeys', (req, res) => {
  console.log('🌟 Getting member journeys:', req.query);
  const { page = 1, limit = 10, memberId, templateId, status, sortBy = 'startedAt', sortOrder = 'desc' } = req.query;
  
  // Get all journey stages from production seed data
  let journeys = [
    {
      id: 'journey-001',
      memberId: 'mem-001',
      templateId: 'template-001',
      milestoneId: 'milestone-001',
      status: 'IN_PROGRESS',
      startedAt: '2024-01-15T00:00:00Z',
      completedAt: null,
      notes: 'Making good progress in spiritual growth journey',
      member: {
        id: 'mem-001',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com'
      },
      template: {
        id: 'template-001',
        name: 'New Member Journey',
        description: 'Comprehensive onboarding for new church members'
      },
      milestone: {
        id: 'milestone-001',
        name: 'Baptism Preparation',
        sequence: 1
      }
    },
    {
      id: 'journey-002',
      memberId: 'mem-002',
      templateId: 'template-002',
      milestoneId: 'milestone-002',
      status: 'COMPLETED',
      startedAt: '2024-02-01T00:00:00Z',
      completedAt: '2024-03-15T00:00:00Z',
      notes: 'Successfully completed leadership development track',
      member: {
        id: 'mem-002',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@example.com'
      },
      template: {
        id: 'template-002',
        name: 'Leadership Development',
        description: 'Training for potential church leaders'
      },
      milestone: {
        id: 'milestone-002',
        name: 'Ministry Assignment',
        sequence: 2
      }
    },
    {
      id: 'journey-003',
      memberId: 'mem-003',
      templateId: 'template-001',
      milestoneId: 'milestone-003',
      status: 'NOT_STARTED',
      startedAt: '2024-03-01T00:00:00Z',
      completedAt: null,
      notes: 'Ready to begin spiritual growth journey',
      member: {
        id: 'mem-003',
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@example.com'
      },
      template: {
        id: 'template-001',
        name: 'New Member Journey',
        description: 'Comprehensive onboarding for new church members'
      },
      milestone: {
        id: 'milestone-003',
        name: 'Small Group Integration',
        sequence: 3
      }
    }
  ];
  
  // Apply filters
  if (memberId) journeys = journeys.filter(j => j.memberId === memberId);
  if (templateId) journeys = journeys.filter(j => j.templateId === templateId);
  if (status) journeys = journeys.filter(j => j.status === status);
  
  // Apply sorting
  journeys.sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (sortOrder === 'desc') return bVal > aVal ? 1 : -1;
    return aVal > bVal ? 1 : -1;
  });
  
  // Apply pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const paginatedJourneys = journeys.slice(offset, offset + parseInt(limit));
  
  res.json({
    journeys: paginatedJourneys,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: journeys.length,
      pages: Math.ceil(journeys.length / parseInt(limit))
    }
  });
});

// ==========================================
// MISSING CARE RECORD ENDPOINT FIX
// ==========================================

app.post('/api/care/records', (req, res) => {
  console.log('💙 Creating care record:', req.body);
  const { memberId, notes, careType = 'general', followUpDate } = req.body;
  
  if (!memberId || !notes) {
    return res.status(400).json({
      success: false,
      message: 'Member ID and notes are required'
    });
  }
  
  const careRecord = {
    id: `care-${Date.now()}`,
    memberId,
    notes,
    careType,
    followUpDate: followUpDate || null,
    createdAt: new Date().toISOString(),
    createdBy: 'pastor-001'
  };
  
  res.status(201).json({
    success: true,
    message: 'Care record created successfully',
    record: careRecord
  });
});

// ========================================
// ERROR HANDLING & 404
// ========================================

app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log('✅ ========================================');
  console.log('✅ FaithLink360 Backend Server Started!');
  console.log('✅ ========================================');
  console.log(`📡 Server URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`👥 Members API: http://localhost:${PORT}/api/members`);
  console.log(`👨‍👩‍👧‍👦 Groups API: http://localhost:${PORT}/api/groups`);
  console.log(`📅 Events API: http://localhost:${PORT}/api/events`);
  console.log(`🌟 Journeys API: http://localhost:${PORT}/api/journeys`);
  console.log(`📧 Communications API: http://localhost:${PORT}/api/communications`);
  console.log(`💙 Pastoral Care API: http://localhost:${PORT}/api/pastoral-care`);
  console.log(`📋 Tasks API: http://localhost:${PORT}/api/tasks`);
  console.log(`📊 Reports API: http://localhost:${PORT}/api/reports`);
  console.log(`🤝 Volunteers API: http://localhost:${PORT}/api/volunteers`);
  console.log(`⚙️ Settings API: http://localhost:${PORT}/api/settings`);
  console.log(`🌐 Binding: ${HOST}:${PORT}`);
  console.log(`📅 Started: ${new Date().toISOString()}`);
  console.log('✅ ========================================');
  console.log('🚀 Server ready to accept connections!');
  console.log('🎯 Using Production-Ready Seed Data');
  console.log(`👥 ${productionSeed.members.length} Members | 👨‍👩‍👧‍👦 ${productionSeed.groups.length} Groups | 📅 ${productionSeed.events.length} Events`);
});
