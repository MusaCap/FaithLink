import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['ADMIN', 'PASTOR', 'CARE_TEAM', 'GROUP_LEADER', 'MEMBER']).optional()
});

// Helper function to generate JWT token
function generateToken(userId: string): string {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback-secret-key',
    { expiresIn: '7d' }
  );
}

// Helper function to generate refresh token
function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    { expiresIn: '30d' }
  );
}

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    
    // Validate request body
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: validation.error.errors,
        timestamp: new Date().toISOString()
      });
    }

    const { email, password } = validation.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhotoUrl: true
          }
        }
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Invalid credentials',
        timestamp: new Date().toISOString()
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        timestamp: new Date().toISOString()
      });
    }

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // Return user data and access token
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          member: user.member
        },
        accessToken: token
      },
      message: 'Login successful',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/auth/register
 * Register new user account
 */
router.post('/register', async (req, res) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    
    // Validate request body
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: validation.error.errors,
        timestamp: new Date().toISOString()
      });
    }

    const { email, password, firstName, lastName, role = 'MEMBER' } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email address already exists',
        timestamp: new Date().toISOString()
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user and member profile in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user account
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          role: role as any
        }
      });

      // Create member profile
      const member = await tx.member.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          email: email.toLowerCase()
        }
      });

      return { user, member };
    });

    // Generate tokens
    const token = generateToken(result.user.id);
    const refreshToken = generateRefreshToken(result.user.id);

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // Return success response
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          member: {
            id: result.member.id,
            firstName: result.member.firstName,
            lastName: result.member.lastName
          }
        },
        accessToken: token
      },
      message: 'Account created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token not provided',
        timestamp: new Date().toISOString()
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'
    ) as any;

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Invalid token type',
        timestamp: new Date().toISOString()
      });
    }

    // Generate new access token
    const newAccessToken = generateToken(decoded.userId);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken
      },
      message: 'Token refreshed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: 'Invalid refresh token',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user and clear refresh token
 */
router.post('/logout', (req, res) => {
  // Clear refresh token cookie
  res.clearCookie('refreshToken');
  
  res.json({
    success: true,
    message: 'Logout successful',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/auth/me
 * Get current user profile (requires authentication)
 */
router.get('/me', async (req, res) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access token required',
        timestamp: new Date().toISOString()
      });
    }

    const token = authHeader.substring(7);

    // Verify and decode token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret-key'
    ) as any;

    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            profilePhotoUrl: true
          }
        }
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'User not found or inactive',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: { user },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(401).json({
      error: 'Invalid access token',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
