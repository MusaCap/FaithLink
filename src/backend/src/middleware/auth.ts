import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        firstName: string;
        lastName: string;
      };
    }
  }
}

// Authentication middleware - verifies JWT token
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Access token is missing'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret-key'
    ) as { userId: string };

    // Get user details from database
    const prisma: PrismaClient = req.app.locals.prisma;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        member: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid or inactive user'
      });
    }

    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role.toLowerCase(),
      firstName: user.member?.firstName || '',
      lastName: user.member?.lastName || ''
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid token'
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Token has expired'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication verification failed'
    });
  }
};

// Authorization middleware factories
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `Required role: ${roles.join(' or ')}, current role: ${req.user.role}`
      });
    }

    next();
  };
};

// Specific role middleware
export const requireAdmin = requireRole(['admin']);
export const requireAdminOrPastor = requireRole(['admin', 'pastor']);
export const requireAdminOrPastorOrGroupLeader = requireRole(['admin', 'pastor', 'group_leader']);

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // No token, continue without user
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret-key'
    ) as { userId: string };

    const prisma: PrismaClient = req.app.locals.prisma;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (user && user.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role.toLowerCase(),
        firstName: user.member?.firstName || '',
        lastName: user.member?.lastName || ''
      };
    }

    next();
  } catch (error) {
    // On error, continue without user (token is optional)
    next();
  }
};
