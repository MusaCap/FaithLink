import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 8000;
const HOST = '0.0.0.0';

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'https://subtle-semifreddo-ed7b4b.netlify.app'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL + Prisma ORM',
    version: '1.0.0'
  });
});

// ========================================
// AUTHENTICATION ENDPOINTS
// ========================================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with member profile
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            memberNumber: true,
            profilePhotoUrl: true,
            role: true,
            churchId: true,
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

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
          role: user.role,
          member: user.member
        }
      }
    });
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            memberNumber: true,
            profilePhotoUrl: true,
            role: true,
            churchId: true,
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          member: user.member
        }
      }
    });
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// ========================================
// MEMBERS ENDPOINTS
// ========================================

app.get('/api/members', async (req, res) => {
  try {
    const { page = 1, limit = 50, search, role, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { isActive: true };
    
    if (search) {
      where.OR = [
        { firstName: { contains: String(search), mode: 'insensitive' } },
        { lastName: { contains: String(search), mode: 'insensitive' } },
        { email: { contains: String(search), mode: 'insensitive' } }
      ];
    }
    
    if (role) where.role = role;
    if (status) where.membershipStatus = status;

    const [members, totalCount] = await prisma.$transaction([
      prisma.member.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          memberNumber: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          membershipStatus: true,
          createdAt: true,
          profilePhotoUrl: true,
        }
      }),
      prisma.member.count({ where })
    ]);

    res.json({
      members,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit))
      },
      summary: {
        totalMembers: totalCount,
        activeMembers: await prisma.member.count({ where: { isActive: true } }),
        pastors: await prisma.member.count({ where: { role: 'pastor' } }),
        leaders: await prisma.member.count({ where: { role: 'leader' } })
      }
    });
  } catch (error) {
    console.error('Members fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

app.get('/api/members/:id', async (req, res) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: req.params.id },
      include: {
        groups: {
          include: {
            group: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        },
        prayerRequests: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ member });
  } catch (error) {
    console.error('Member fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

app.post('/api/members', async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      memberNumber,
      phone, 
      dateOfBirth,
      address, 
      membershipStatus,
      role = 'member',
      notes,
      churchId
    } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'First name, last name, and email are required' });
    }

    // Check if email already exists
    const existingMember = await prisma.member.findUnique({
      where: { email }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'Member with this email already exists' });
    }

    // Generate member number if not provided
    const generatedMemberNumber = memberNumber || (10000 + Date.now() % 90000).toString();

    // Check if member number already exists
    if (memberNumber) {
      const existingMemberNumber = await prisma.member.findUnique({
        where: { memberNumber }
      });
      if (existingMemberNumber) {
        return res.status(400).json({ error: 'Member number already exists' });
      }
    }

    const newMember = await prisma.member.create({
      data: {
        memberNumber: generatedMemberNumber,
        firstName,
        lastName,
        email,
        phone: phone || '',
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address: address || '',
        membershipStatus: membershipStatus || 'pending',
        role,
        notes: notes || '',
        churchId,
      }
    });

    console.log('✅ Member created successfully:', newMember.id);
    res.status(201).json(newMember);
  } catch (error) {
    console.error('Member creation error:', error);
    res.status(500).json({ error: 'Failed to create member' });
  }
});

app.put('/api/members/:id', async (req, res) => {
  try {
    const existingMember = await prisma.member.findUnique({
      where: { id: req.params.id }
    });

    if (!existingMember) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const updatedMember = await prisma.member.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        updatedAt: new Date()
      }
    });

    res.json({ member: updatedMember });
  } catch (error) {
    console.error('Member update error:', error);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

app.delete('/api/members/:id', async (req, res) => {
  try {
    await prisma.member.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    res.json({ message: 'Member deactivated successfully' });
  } catch (error) {
    console.error('Member deletion error:', error);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

// ========================================
// PRAYER REQUESTS ENDPOINTS
// ========================================

app.get('/api/care/prayer-requests', async (req, res) => {
  try {
    const prayerRequests = await prisma.prayerRequest.findMany({
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        updates: {
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      requests: prayerRequests,
      count: prayerRequests.length
    });
  } catch (error) {
    console.error('Prayer requests fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch prayer requests' });
  }
});

app.get('/api/care/prayer-requests/:id', async (req, res) => {
  try {
    const prayerRequest = await prisma.prayerRequest.findUnique({
      where: { id: req.params.id },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        updates: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!prayerRequest) {
      return res.status(404).json({ error: 'Prayer request not found' });
    }

    res.json({
      success: true,
      request: prayerRequest
    });
  } catch (error) {
    console.error('Prayer request fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch prayer request' });
  }
});

app.post('/api/care/prayer-requests', async (req, res) => {
  try {
    const { title, description, requestedBy, category, priority = 'medium', isPrivate = false } = req.body;

    if (!title || !description || !requestedBy) {
      return res.status(400).json({ error: 'Title, description, and requestedBy are required' });
    }

    // Get member info
    const member = await prisma.member.findUnique({
      where: { id: requestedBy },
      select: { firstName: true, lastName: true }
    });

    if (!member) {
      return res.status(400).json({ error: 'Member not found' });
    }

    const newRequest = await prisma.prayerRequest.create({
      data: {
        title,
        description,
        requestedBy,
        requestedByName: `${member.firstName} ${member.lastName}`,
        category: category || 'general',
        priority,
        isPrivate,
        status: 'active'
      }
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Prayer request creation error:', error);
    res.status(500).json({ error: 'Failed to create prayer request' });
  }
});

// Bug Reports (keeping email functionality)
app.post('/api/bug-report', async (req, res) => {
  try {
    const bugReportData = {
      ...req.body,
      submittedAt: new Date()
    };

    // Store in database
    const bugReport = await prisma.bugReport.create({
      data: {
        title: bugReportData.title,
        description: bugReportData.description,
        steps: bugReportData.steps || '',
        expectedBehavior: bugReportData.expectedBehavior || '',
        actualBehavior: bugReportData.actualBehavior || '',
        browserInfo: bugReportData.browserInfo || bugReportData.userAgent || 'Unknown',
        userEmail: bugReportData.userEmail || 'anonymous',
        userId: bugReportData.userId,
        churchId: bugReportData.churchId,
        churchName: bugReportData.churchName || 'Unknown Church',
        severity: bugReportData.severity || 'medium',
        category: bugReportData.category || 'general',
        reportedUrl: bugReportData.url,
        stackTrace: bugReportData.stackTrace || '',
        viewport: bugReportData.viewport || {},
        platform: bugReportData.platform || '',
        priority: bugReportData.severity === 'critical' ? 'urgent' : 
                 bugReportData.severity === 'high' ? 'high' : 'normal',
        isAutomatic: bugReportData.category === 'automatic'
      }
    });

    // Send email notification (keeping existing email logic)
    try {
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER || 'noreply@musa.capital',
          pass: process.env.SMTP_PASS || 'your-app-password'
        }
      });
      
      const priorityEmoji = bugReportData.severity === 'critical' ? '🚨' : 
                           bugReportData.severity === 'high' ? '⚠️' : 
                           bugReportData.severity === 'medium' ? '🔶' : '🔵';
      
      const mailOptions = {
        from: process.env.SMTP_USER || 'noreply@musa.capital',
        to: 'gp@musa.capital',
        subject: `${priorityEmoji} FaithLink360 Bug Report [${(bugReportData.severity || 'medium').toUpperCase()}] - ${bugReportData.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>${priorityEmoji} New Bug Report - ${(bugReportData.severity || 'medium').toUpperCase()} Priority</h2>
            <p><strong>Report ID:</strong> ${bugReport.id}</p>
            <p><strong>Title:</strong> ${bugReportData.title}</p>
            <p><strong>Description:</strong> ${bugReportData.description}</p>
            <p><strong>User:</strong> ${bugReportData.userEmail}</p>
            <p><strong>URL:</strong> ${bugReportData.url}</p>
            <p><strong>Browser:</strong> ${bugReportData.browserInfo}</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          </div>
        `
      };
      
      await transporter.sendMail(mailOptions);
      console.log('📧 Bug report email sent to gp@musa.capital');
    } catch (emailError) {
      console.error('❌ Failed to send bug report email:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Bug report submitted successfully',
      reportId: bugReport.id
    });
  } catch (error) {
    console.error('Bug report error:', error);
    res.status(500).json({ error: 'Failed to submit bug report' });
  }
});

// ========================================
// ERROR HANDLING
// ========================================

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((error: any, req: any, res: any, next: any) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// ========================================
// SERVER STARTUP
// ========================================

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database');

    app.listen(PORT, HOST, () => {
      console.log('🚀 Starting FaithLink360 Backend with PostgreSQL + Prisma...');
      console.log(`📡 Server URL: http://${HOST}:${PORT}`);
      console.log(`🏥 Health Check: http://${HOST}:${PORT}/health`);
      console.log(`👥 Members API: http://${HOST}:${PORT}/api/members`);
      console.log(`🙏 Prayer Requests API: http://${HOST}:${PORT}/api/care/prayer-requests`);
      console.log('✅ Database: PostgreSQL with Prisma ORM');
      console.log('✅ Authentication: JWT with bcrypt');
      console.log('✅ Email: Bug reports to gp@musa.capital');
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

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
