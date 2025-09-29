import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, requireAdminOrPastorOrGroupLeader } from '../middleware/auth';

const router = Router();

// Validation schemas for EventAttendance
const recordAttendanceSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  memberId: z.string().min(1, 'Member ID is required'),
  attended: z.boolean().default(false),
  checkedInAt: z.string().transform((val) => val ? new Date(val) : null).optional()
});

const bulkAttendanceSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  attendances: z.array(z.object({
    memberId: z.string().min(1, 'Member ID is required'),
    attended: z.boolean().default(false),
    checkedInAt: z.string().transform((val) => val ? new Date(val) : null).optional()
  }))
});

// GET /api/attendance/events - List events with attendance data
router.get('/events', authenticateToken, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { page = '1', limit = '10', groupId } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    
    const where: any = {};
    if (groupId) {
      where.groupId = groupId;
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take,
        orderBy: { dateTime: 'desc' },
        include: {
          group: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          attendances: {
            include: {
              member: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          },
          _count: {
            select: { attendances: true }
          }
        }
      }),
      prisma.event.count({ where })
    ]);

    const transformedEvents = events.map((event: any) => ({
      ...event,
      attendanceCount: event._count.attendances,
      _count: undefined
    }));

    res.json({
      events: transformedEvents,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch events'
    });
  }
});

// POST /api/attendance/record - Record attendance for an event
router.post('/record', authenticateToken, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const validatedData = recordAttendanceSchema.parse(req.body);

    const attendance = await prisma.eventAttendance.upsert({
      where: {
        eventId_memberId: {
          eventId: validatedData.eventId,
          memberId: validatedData.memberId
        }
      },
      update: {
        attended: validatedData.attended,
        checkedInAt: validatedData.checkedInAt
      },
      create: {
        eventId: validatedData.eventId,
        memberId: validatedData.memberId,
        attended: validatedData.attended,
        checkedInAt: validatedData.checkedInAt
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            dateTime: true
          }
        },
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json(attendance);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    console.error('Error recording attendance:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to record attendance'
    });
  }
});

// POST /api/attendance/bulk - Record bulk attendance for an event
router.post('/bulk', requireAdminOrPastorOrGroupLeader, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const validatedData = bulkAttendanceSchema.parse(req.body);

    const attendanceRecords = await Promise.all(
      validatedData.attendances.map(async (attendance: any) => {
        return prisma.eventAttendance.upsert({
          where: {
            eventId_memberId: {
              eventId: validatedData.eventId,
              memberId: attendance.memberId
            }
          },
          update: {
            attended: attendance.attended,
            checkedInAt: attendance.checkedInAt
          },
          create: {
            eventId: validatedData.eventId,
            memberId: attendance.memberId,
            attended: attendance.attended,
            checkedInAt: attendance.checkedInAt
          },
          include: {
            member: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        });
      })
    );

    res.json({ attendances: attendanceRecords });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    console.error('Error recording bulk attendance:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to record bulk attendance'
    });
  }
});

// GET /api/attendance/stats/:groupId - Get attendance statistics for a group
router.get('/stats/:groupId', authenticateToken, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { groupId } = req.params;
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);
    }

    const [totalEvents, totalAttendances, attendanceData] = await Promise.all([
      prisma.event.count({
        where: {
          groupId,
          ...(Object.keys(dateFilter).length > 0 ? { dateTime: dateFilter } : {})
        }
      }),
      prisma.eventAttendance.count({
        where: {
          event: {
            groupId,
            ...(Object.keys(dateFilter).length > 0 ? { dateTime: dateFilter } : {})
          }
        }
      }),
      prisma.eventAttendance.findMany({
        where: {
          event: {
            groupId,
            ...(Object.keys(dateFilter).length > 0 ? { dateTime: dateFilter } : {})
          }
        },
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      })
    ]);

    const stats = {
      totalEvents,
      totalAttendances,
      present: attendanceData.filter((a: any) => a.attended).length,
      absent: attendanceData.filter((a: any) => !a.attended).length,
      attendanceRate: totalAttendances > 0 ? 
        Math.round((attendanceData.filter((a: any) => a.attended).length / totalAttendances) * 100) : 0
    };

    res.json(stats);

  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch attendance statistics'
    });
  }
});

// GET /api/attendance/member/:memberId - Get attendance for a specific member
router.get('/member/:memberId', authenticateToken, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { memberId } = req.params;
    const { page = '1', limit = '10', groupId } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where: any = {
      memberId,
      ...(groupId ? { event: { groupId } } : {})
    };

    const [attendances, total] = await Promise.all([
      prisma.eventAttendance.findMany({
        where,
        skip,
        take,
        orderBy: { event: { dateTime: 'desc' } },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              dateTime: true,
              group: {
                select: {
                  id: true,
                  name: true,
                  type: true
                }
              }
            }
          }
        }
      }),
      prisma.eventAttendance.count({ where })
    ]);

    res.json({
      attendances,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });

  } catch (error) {
    console.error('Error fetching member attendance:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch member attendance'
    });
  }
});


export default router;
