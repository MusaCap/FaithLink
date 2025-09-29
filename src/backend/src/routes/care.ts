import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Validation schemas based on actual Prisma CareLog model
const createCareLogSchema = z.object({
  memberId: z.string().min(1, 'Member ID is required'),
  type: z.enum(['PRAYER', 'VISIT', 'COUNSELING', 'CALL']),
  notes: z.string().min(1, 'Notes are required'),
  followUpRequired: z.boolean().default(false),
  confidential: z.boolean().default(false),
  followUpDate: z.string().transform((val) => val ? new Date(val) : null).optional()
});

const updateCareLogSchema = z.object({
  type: z.enum(['PRAYER', 'VISIT', 'COUNSELING', 'CALL']).optional(),
  notes: z.string().min(1).optional(),
  followUpRequired: z.boolean().optional(),
  confidential: z.boolean().optional(),
  followUpDate: z.string().transform((val) => val ? new Date(val) : null).optional()
});

// GET /api/care - List care logs with filtering and pagination
router.get('/', authenticateToken, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    
    const {
      page = 1,
      limit = 20,
      memberId,
      caregiverId,
      type,
      followUpRequired,
      confidential,
      startDate,
      endDate
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Build where clause
    const where: any = {};

    if (memberId) where.memberId = memberId;
    if (caregiverId) where.caregiverId = caregiverId;
    if (type) where.type = type;
    if (followUpRequired !== undefined) where.followUpRequired = followUpRequired === 'true';
    if (confidential !== undefined) where.confidential = confidential === 'true';

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    // Check permissions - only show non-confidential logs unless user has appropriate role
    if (!['ADMIN', 'PASTOR', 'CARE_TEAM'].includes(req.user.role)) {
      where.confidential = false;
    }

    const [careLogs, total] = await Promise.all([
      prisma.careLog.findMany({
        where,
        include: {
          member: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          caregiver: {
            select: { id: true, email: true },
            include: {
              member: {
                select: { firstName: true, lastName: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.careLog.count({ where })
    ]);

    const careLogsWithDetails = careLogs.map(log => ({
      id: log.id,
      type: log.type,
      notes: log.notes,
      followUpRequired: log.followUpRequired,
      confidential: log.confidential,
      followUpDate: log.followUpDate,
      createdAt: log.createdAt,
      member: log.member,
      caregiver: {
        id: log.caregiver.id,
        name: log.caregiver.member ? 
          `${log.caregiver.member.firstName} ${log.caregiver.member.lastName}` : 
          log.caregiver.email,
        email: log.caregiver.email
      }
    }));

    res.json({
      careLogs: careLogsWithDetails,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Error fetching care logs:', error);
    res.status(500).json({ message: 'Failed to fetch care logs' });
  }
});

// GET /api/care/:id - Get single care log details
router.get('/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { id } = req.params;

    const careLog = await prisma.careLog.findUnique({
      where: { id },
      include: {
        member: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true }
        },
        caregiver: {
          select: { id: true, email: true },
          include: {
            member: {
              select: { firstName: true, lastName: true }
            }
          }
        }
      }
    });

    if (!careLog) {
      return res.status(404).json({ message: 'Care log not found' });
    }

    // Check permissions for confidential logs
    if (careLog.confidential && 
        !['ADMIN', 'PASTOR', 'CARE_TEAM'].includes(req.user.role) &&
        careLog.caregiverId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied to confidential care log' });
    }

    const careLogDetails = {
      id: careLog.id,
      type: careLog.type,
      notes: careLog.notes,
      followUpRequired: careLog.followUpRequired,
      confidential: careLog.confidential,
      followUpDate: careLog.followUpDate,
      createdAt: careLog.createdAt,
      member: careLog.member,
      caregiver: {
        id: careLog.caregiver.id,
        name: careLog.caregiver.member ? 
          `${careLog.caregiver.member.firstName} ${careLog.caregiver.member.lastName}` : 
          careLog.caregiver.email,
        email: careLog.caregiver.email
      },
      canEdit: careLog.caregiverId === req.user.id || 
               ['ADMIN', 'PASTOR', 'CARE_TEAM'].includes(req.user.role)
    };

    res.json(careLogDetails);
  } catch (error) {
    console.error('Error fetching care log:', error);
    res.status(500).json({ message: 'Failed to fetch care log' });
  }
});

// POST /api/care - Create new care log
router.post('/', authenticateToken, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const validatedData = createCareLogSchema.parse(req.body);

    // Check user permissions
    if (!['ADMIN', 'PASTOR', 'CARE_TEAM'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions to create care logs' });
    }

    // Verify member exists
    const member = await prisma.member.findUnique({
      where: { id: validatedData.memberId },
      select: { id: true, firstName: true, lastName: true }
    });

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const careLog = await prisma.careLog.create({
      data: {
        memberId: validatedData.memberId,
        caregiverId: req.user.id,
        type: validatedData.type,
        notes: validatedData.notes,
        followUpRequired: validatedData.followUpRequired,
        confidential: validatedData.confidential,
        followUpDate: validatedData.followUpDate
      },
      include: {
        member: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        caregiver: {
          select: { id: true, email: true },
          include: {
            member: {
              select: { firstName: true, lastName: true }
            }
          }
        }
      }
    });

    res.status(201).json({
      id: careLog.id,
      type: careLog.type,
      notes: careLog.notes,
      followUpRequired: careLog.followUpRequired,
      confidential: careLog.confidential,
      followUpDate: careLog.followUpDate,
      createdAt: careLog.createdAt,
      member: careLog.member,
      caregiver: {
        id: careLog.caregiver.id,
        name: careLog.caregiver.member ? 
          `${careLog.caregiver.member.firstName} ${careLog.caregiver.member.lastName}` : 
          careLog.caregiver.email,
        email: careLog.caregiver.email
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    console.error('Error creating care log:', error);
    res.status(500).json({ message: 'Failed to create care log' });
  }
});

// PUT /api/care/:id - Update care log
router.put('/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { id } = req.params;
    const validatedData = updateCareLogSchema.parse(req.body);

    // Check if care log exists
    const existingCareLog = await prisma.careLog.findUnique({
      where: { id }
    });

    if (!existingCareLog) {
      return res.status(404).json({ message: 'Care log not found' });
    }

    // Check permissions
    const canEdit = existingCareLog.caregiverId === req.user.id ||
                   ['ADMIN', 'PASTOR', 'CARE_TEAM'].includes(req.user.role);

    if (!canEdit) {
      return res.status(403).json({ message: 'Insufficient permissions to edit this care log' });
    }

    const updatedCareLog = await prisma.careLog.update({
      where: { id },
      data: {
        type: validatedData.type,
        notes: validatedData.notes,
        followUpRequired: validatedData.followUpRequired,
        confidential: validatedData.confidential,
        followUpDate: validatedData.followUpDate
      },
      include: {
        member: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        caregiver: {
          select: { id: true, email: true },
          include: {
            member: {
              select: { firstName: true, lastName: true }
            }
          }
        }
      }
    });

    res.json({
      id: updatedCareLog.id,
      type: updatedCareLog.type,
      notes: updatedCareLog.notes,
      followUpRequired: updatedCareLog.followUpRequired,
      confidential: updatedCareLog.confidential,
      followUpDate: updatedCareLog.followUpDate,
      createdAt: updatedCareLog.createdAt,
      member: updatedCareLog.member,
      caregiver: {
        id: updatedCareLog.caregiver.id,
        name: updatedCareLog.caregiver.member ? 
          `${updatedCareLog.caregiver.member.firstName} ${updatedCareLog.caregiver.member.lastName}` : 
          updatedCareLog.caregiver.email,
        email: updatedCareLog.caregiver.email
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    console.error('Error updating care log:', error);
    res.status(500).json({ message: 'Failed to update care log' });
  }
});

// DELETE /api/care/:id - Delete care log
router.delete('/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { id } = req.params;

    // Check if care log exists
    const existingCareLog = await prisma.careLog.findUnique({
      where: { id }
    });

    if (!existingCareLog) {
      return res.status(404).json({ message: 'Care log not found' });
    }

    // Check permissions
    const canDelete = existingCareLog.caregiverId === req.user.id ||
                     ['ADMIN', 'PASTOR'].includes(req.user.role);

    if (!canDelete) {
      return res.status(403).json({ message: 'Insufficient permissions to delete this care log' });
    }

    await prisma.careLog.delete({
      where: { id }
    });

    res.json({ message: 'Care log deleted successfully' });
  } catch (error) {
    console.error('Error deleting care log:', error);
    res.status(500).json({ message: 'Failed to delete care log' });
  }
});

// GET /api/care/member/:memberId - Get care logs for specific member
router.get('/member/:memberId', authenticateToken, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { memberId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Build where clause with permission filtering
    const where: any = { memberId };
    
    if (!['ADMIN', 'PASTOR', 'CARE_TEAM'].includes(req.user.role)) {
      where.confidential = false;
    }

    const [careLogs, total] = await Promise.all([
      prisma.careLog.findMany({
        where,
        include: {
          caregiver: {
            select: { id: true, email: true },
            include: {
              member: {
                select: { firstName: true, lastName: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.careLog.count({ where })
    ]);

    res.json({
      careLogs: careLogs.map(log => ({
        id: log.id,
        type: log.type,
        notes: log.notes,
        followUpRequired: log.followUpRequired,
        confidential: log.confidential,
        followUpDate: log.followUpDate,
        createdAt: log.createdAt,
        caregiver: {
          id: log.caregiver.id,
          name: log.caregiver.member ? 
            `${log.caregiver.member.firstName} ${log.caregiver.member.lastName}` : 
            log.caregiver.email,
          email: log.caregiver.email
        }
      })),
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Error fetching member care logs:', error);
    res.status(500).json({ message: 'Failed to fetch member care logs' });
  }
});

// GET /api/care/stats/dashboard - Get care statistics for dashboard
router.get('/stats/dashboard', authenticateToken, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate as string);
    if (endDate) dateFilter.lte = new Date(endDate as string);

    const [totalLogs, followUpRequired, careByType, recentCareActivities] = await Promise.all([
      // Total care logs
      prisma.careLog.count({
        where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}
      }),
      
      // Follow-up required
      prisma.careLog.count({
        where: { 
          followUpRequired: true,
          ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {})
        }
      }),
      
      // Care by type
      prisma.careLog.groupBy({
        by: ['type'],
        where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {},
        _count: { type: true }
      }),

      // Recent care activities
      prisma.careLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          member: {
            select: { firstName: true, lastName: true }
          },
          caregiver: {
            select: { email: true },
            include: {
              member: {
                select: { firstName: true, lastName: true }
              }
            }
          }
        },
        where: !['ADMIN', 'PASTOR', 'CARE_TEAM'].includes(req.user.role) ? 
          { confidential: false } : {}
      })
    ]);

    const typeStats = careByType.reduce((acc: any, item: any) => {
      acc[item.type.toLowerCase()] = item._count.type;
      return acc;
    }, { prayer: 0, visit: 0, counseling: 0, call: 0 });

    res.json({
      totalLogs,
      followUpRequired,
      typeStats,
      recentActivities: recentCareActivities.map((log: any) => ({
        id: log.id,
        type: log.type,
        memberName: `${log.member.firstName} ${log.member.lastName}`,
        caregiverName: log.caregiver.member ? 
          `${log.caregiver.member.firstName} ${log.caregiver.member.lastName}` : 
          log.caregiver.email,
        createdAt: log.createdAt,
        followUpRequired: log.followUpRequired
      }))
    });
  } catch (error) {
    console.error('Error fetching care stats:', error);
    res.status(500).json({ message: 'Failed to fetch care statistics' });
  }
});

export default router;
