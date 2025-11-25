# 🚨 IMMEDIATE FIXES REQUIRED

## **Critical Issues Identified**

### **1. Groups API 500 Error - ROOT CAUSE FOUND**

**Problem**: The `/api/groups` endpoint accepts query parameters but doesn't use them properly in the Prisma query, causing potential database errors.

**Current Code Issue**:
```javascript
// Line 497: Parameters extracted but not used
const { status = 'active', sortBy = 'name', sortOrder = 'asc', limit = 20 } = req.query;

// Line 500-507: Hardcoded query ignoring parameters
const groups = await prisma.group.findMany({
  take: 10,  // Ignores 'limit' parameter
  include: {
    _count: {
      select: { members: true }
    }
  }
  // Missing: where clause for 'status'
  // Missing: orderBy for 'sortBy' and 'sortOrder'
});
```

### **2. Missing Church Discovery System**

**Problem**: No way for users to browse and join existing churches created by other users.

---

## **IMMEDIATE FIX 1: Groups API**

### **Fixed Groups Endpoint Code**
```javascript
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
          },
          // Add leader info if needed
          // leader: {
          //   select: { firstName: true, lastName: true }
          // }
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
```

---

## **IMMEDIATE FIX 2: Church Discovery System**

### **New API Endpoints Needed**
```javascript
// Public church directory
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
      const fallbackChurches = [
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
        }
      ];
      
      // Apply search filter
      let filteredChurches = fallbackChurches;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredChurches = fallbackChurches.filter(church => 
          church.name.toLowerCase().includes(searchLower) ||
          church.description.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply denomination filter
      if (denomination && denomination !== 'all') {
        filteredChurches = filteredChurches.filter(church => 
          church.denomination.toLowerCase() === denomination.toLowerCase()
        );
      }
      
      // Apply location filter
      if (location) {
        const locationLower = location.toLowerCase();
        filteredChurches = filteredChurches.filter(church =>
          church.location.toLowerCase().includes(locationLower)
        );
      }
      
      // Apply limit
      const limitedChurches = filteredChurches.slice(0, parseInt(limit));
      
      res.json({
        success: true,
        churches: limitedChurches,
        count: limitedChurches.length,
        total: filteredChurches.length,
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
```

---

## **PRIORITY IMPLEMENTATION ORDER**

### **🔥 CRITICAL - Deploy Immediately**
1. **Fix Groups API** - Replace current groups endpoint with fixed version
2. **Test Groups Page** - Verify filtering and sorting works

### **🚨 HIGH - Next 24-48 Hours**
3. **Add Church Directory API** - Implement `/api/churches/directory`
4. **Add Join Request API** - Implement church join workflow
5. **Update Frontend Registration** - Add church discovery option

### **📋 MEDIUM - Next Sprint** 
6. **Enhanced Church Profiles** - Rich church information pages
7. **Admin Join Management** - Church admin approval system
8. **Multi-Church Support** - Users can belong to multiple churches

---

## **Testing Commands**

### **Test Fixed Groups API**
```bash
# Test basic groups
curl https://faithlink-ntgg.onrender.com/api/groups

# Test with parameters  
curl "https://faithlink-ntgg.onrender.com/api/groups?status=active&sortBy=name&sortOrder=asc&limit=10"

# Test filtering
curl "https://faithlink-ntgg.onrender.com/api/groups?status=all&sortBy=createdAt&sortOrder=desc"
```

### **Test Church Discovery API**
```bash
# Test church directory
curl https://faithlink-ntgg.onrender.com/api/churches/directory

# Test with search
curl "https://faithlink-ntgg.onrender.com/api/churches/directory?search=community&denomination=Baptist"
```

These fixes will resolve the immediate 500 errors and provide the missing church discovery functionality that users need.
