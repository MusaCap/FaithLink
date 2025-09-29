import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Validation schemas based on actual Prisma Event model
const createEventSchema = z.object({
  title: z.string().min(1, 'Event title is required').max(200),
  description: z.string().optional(),
  location: z.string().optional(),
  dateTime: z.string().transform((val) => new Date(val)),
  calendarType: z.enum(['WEEKLY', 'MONTHLY', 'ONEOFF']).default('ONEOFF'),
  groupId: z.string().optional(),
  tags: z.array(z.string()).default([])
});

const updateEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  dateTime: z.string().transform((val) => new Date(val)).optional(),
  calendarType: z.enum(['WEEKLY', 'MONTHLY', 'ONEOFF']).optional(),
  tags: z.array(z.string()).optional()
});

// GET /api/events - List events with filtering and pagination
router.get('/', authenticateToken, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    
    const {
      page = 1,
      limit = 20,
      search,
      calendarType,
      groupId,
      startDate,
      endDate
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Build where clause
    const where: any = {
      isActive: true
    };

    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { description: { contains: search as string } },
        { location: { contains: search as string } }
      ];
    }

    if (calendarType) {
      where.calendarType = calendarType;
    }

    if (groupId) {
      where.groupId = groupId;
    }

    if (startDate || endDate) {
      where.dateTime = {};
      if (startDate) where.dateTime.gte = new Date(startDate as string);
      if (endDate) where.dateTime.lte = new Date(endDate as string);
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          group: {
            select: { id: true, name: true, type: true }
          },
          attendances: {
            include: {
              member: {
                select: { id: true, firstName: true, lastName: true }
              }
            }
          },
          tags: {
            include: {
              tag: {
                select: { id: true, label: true, color: true }
              }
            }
          },
          _count: {
            select: { attendances: true }
          }
        },
        orderBy: { dateTime: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.event.count({ where })
    ]);

    const eventsWithStats = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      dateTime: event.dateTime,
      location: event.location,
      calendarType: event.calendarType,
      createdBy: event.createdBy,
      isActive: event.isActive,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      group: event.group,
      attendanceCount: event._count.attendances,
      tags: event.tags.map(eventTag => eventTag.tag)
    }));

    res.json({
      events: eventsWithStats,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

// GET /api/events/:id - Get single event details
router.get('/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        group: {
          select: { id: true, name: true, type: true, leaderId: true }
        },
        attendances: {
          include: {
            member: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          }
        },
        tags: {
          include: {
            tag: {
              select: { id: true, label: true, color: true, category: true }
            }
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const eventDetails = {
      id: event.id,
      title: event.title,
      description: event.description,
      dateTime: event.dateTime,
      location: event.location,
      calendarType: event.calendarType,
      createdBy: event.createdBy,
      isActive: event.isActive,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      group: event.group,
      attendanceCount: event.attendances.length,
      attendances: event.attendances.map(attendance => ({
        id: attendance.id,
        attended: attendance.attended,
        checkedInAt: attendance.checkedInAt,
        member: attendance.member
      })),
      tags: event.tags.map(eventTag => eventTag.tag),
      canEdit: event.createdBy === req.user.id || 
               req.user.role === 'ADMIN' || 
               req.user.role === 'PASTOR'
    };

    res.json(eventDetails);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Failed to fetch event' });
  }
});

// POST /api/events - Create new event
router.post('/', authenticateToken, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const validatedData = createEventSchema.parse(req.body);

    // Check user permissions
    if (!['ADMIN', 'PASTOR', 'GROUP_LEADER'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions to create events' });
    }

    // If groupId provided, verify user has access to that group
    if (validatedData.groupId) {
      if (req.user.role === 'GROUP_LEADER') {
        const groupMember = await prisma.groupMember.findFirst({
          where: {
            groupId: validatedData.groupId,
            memberId: req.user.memberId,
            isActive: true
          }
        });

        if (!groupMember) {
          return res.status(403).json({ message: 'You do not have access to this group' });
        }
      }
    }

    // Create event data
    const eventData = {
      title: validatedData.title,
      description: validatedData.description,
      location: validatedData.location,
      dateTime: validatedData.dateTime,
      calendarType: validatedData.calendarType,
      createdBy: req.user.id,
      groupId: validatedData.groupId || null
    };

    const event = await prisma.event.create({
      data: eventData,
      include: {
        group: {
          select: { id: true, name: true, type: true }
        },
        _count: {
          select: { attendances: true }
        }
      }
    });

    // Create tags if provided
    if (validatedData.tags && validatedData.tags.length > 0) {
      for (const tagLabel of validatedData.tags) {
        // Find or create tag
        let tag = await prisma.tag.findFirst({
          where: { label: tagLabel, category: 'EVENT' }
        });

        if (!tag) {
          tag = await prisma.tag.create({
            data: { label: tagLabel, category: 'EVENT' }
          });
        }

        // Link tag to event
        await prisma.eventTag.create({
          data: {
            eventId: event.id,
            tagId: tag.id
          }
        });
      }
    }

    res.status(201).json({
      id: event.id,
      title: event.title,
      description: event.description,
      dateTime: event.dateTime,
      location: event.location,
      calendarType: event.calendarType,
      createdBy: event.createdBy,
      group: event.group,
      attendanceCount: event._count.attendances
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
});

// PUT /api/events/:id - Update event
router.put('/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { id } = req.params;
    const validatedData = updateEventSchema.parse(req.body);

    // Check if event exists and get current event
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: { group: true }
    });

    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check permissions
    const canEdit = existingEvent.createdBy === req.user.id ||
                   req.user.role === 'ADMIN' ||
                   req.user.role === 'PASTOR';

    if (!canEdit) {
      return res.status(403).json({ message: 'Insufficient permissions to edit this event' });
    }

    // Update event
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        location: validatedData.location,
        dateTime: validatedData.dateTime,
        calendarType: validatedData.calendarType
      },
      include: {
        group: {
          select: { id: true, name: true, type: true }
        },
        _count: {
          select: { attendances: true }
        }
      }
    });

    // Handle tags update if provided
    if (validatedData.tags) {
      // Remove existing tags
      await prisma.eventTag.deleteMany({
        where: { eventId: id }
      });

      // Add new tags
      for (const tagLabel of validatedData.tags) {
        let tag = await prisma.tag.findFirst({
          where: { label: tagLabel, category: 'EVENT' }
        });

        if (!tag) {
          tag = await prisma.tag.create({
            data: { label: tagLabel, category: 'EVENT' }
          });
        }

        await prisma.eventTag.create({
          data: {
            eventId: id,
            tagId: tag.id
          }
        });
      }
    }

    res.json({
      id: updatedEvent.id,
      title: updatedEvent.title,
      description: updatedEvent.description,
      dateTime: updatedEvent.dateTime,
      location: updatedEvent.location,
      calendarType: updatedEvent.calendarType,
      createdBy: updatedEvent.createdBy,
      group: updatedEvent.group,
      attendanceCount: updatedEvent._count.attendances
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Failed to update event' });
  }
});

// DELETE /api/events/:id - Delete event
router.delete('/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { id } = req.params;

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id }
    });

    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check permissions
    const canDelete = existingEvent.createdBy === req.user.id ||
                     req.user.role === 'ADMIN' ||
                     req.user.role === 'PASTOR';

    if (!canDelete) {
      return res.status(403).json({ message: 'Insufficient permissions to delete this event' });
    }

    // Soft delete by setting isActive to false
    await prisma.event.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Failed to delete event' });
  }
});

// GET /api/events/stats/dashboard - Get event statistics for dashboard
router.get('/stats/dashboard', authenticateToken, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate as string);
    if (endDate) dateFilter.lte = new Date(endDate as string);

    const [totalEvents, upcomingEvents, recentEvents, eventsByType] = await Promise.all([
      // Total events
      prisma.event.count({
        where: Object.keys(dateFilter).length > 0 ? { dateTime: dateFilter, isActive: true } : { isActive: true }
      }),
      
      // Upcoming events
      prisma.event.count({
        where: { dateTime: { gte: new Date() }, isActive: true }
      }),
      
      // Recent events
      prisma.event.findMany({
        where: { dateTime: { gte: new Date() }, isActive: true },
        orderBy: { dateTime: 'asc' },
        take: 5,
        include: {
          group: { select: { name: true } },
          _count: { select: { attendances: true } }
        }
      }),

      // Events by calendar type
      prisma.event.groupBy({
        by: ['calendarType'],
        where: Object.keys(dateFilter).length > 0 ? { dateTime: dateFilter, isActive: true } : { isActive: true },
        _count: { calendarType: true }
      })
    ]);

    const typeStats = eventsByType.reduce((acc: any, item: any) => {
      acc[item.calendarType.toLowerCase()] = item._count.calendarType;
      return acc;
    }, { weekly: 0, monthly: 0, oneoff: 0 });

    res.json({
      totalEvents,
      upcomingEvents,
      typeStats,
      recentEvents: recentEvents.map((event: any) => ({
        id: event.id,
        title: event.title,
        dateTime: event.dateTime,
        location: event.location,
        groupName: event.group?.name,
        attendanceCount: event._count.attendances
      }))
    });
  } catch (error) {
    console.error('Error fetching event stats:', error);
    res.status(500).json({ message: 'Failed to fetch event statistics' });
  }
});

export default router;
