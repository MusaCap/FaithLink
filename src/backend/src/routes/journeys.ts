import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, requireAdminOrPastor, requireAdminOrPastorOrGroupLeader } from '../middleware/auth';

const router = Router();

// Validation schemas
const createJourneyTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100),
  description: z.string().optional(),
  isActive: z.boolean().default(true)
});

const updateJourneyTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional()
});

const createMilestoneSchema = z.object({
  name: z.string().min(1, 'Milestone name is required').max(100),
  description: z.string().optional(),
  sequence: z.number().int().min(0),
  isRequired: z.boolean().default(true)
});

const assignJourneySchema = z.object({
  memberIds: z.array(z.string().min(1)),
  milestoneId: z.string().min(1)
});

const updateJourneyStageSchema = z.object({
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']),
  notes: z.string().optional(),
  completedAt: z.string().transform((val) => val ? new Date(val) : null).optional()
});

// GET /api/journeys/templates - List journey templates with pagination and filtering
router.get('/templates', authenticateToken, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    
    const {
      page = 1,
      limit = 20,
      search,
      isActive = 'true',
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where: any = {};
    
    if (isActive !== 'all') {
      where.isActive = isActive === 'true';
    }
    
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const [templates, total] = await Promise.all([
      prisma.journeyTemplate.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { 
              milestones: true,
              journeyStages: true
            }
          }
        }
      }),
      prisma.journeyTemplate.count({ where })
    ]);

    const transformedTemplates = templates.map(template => ({
      ...template,
      milestoneCount: template._count.milestones,
      activeJourneys: template._count.journeyStages,
      _count: undefined
    }));

    res.json({
      templates: transformedTemplates,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / take)
    });

  } catch (error) {
    console.error('Error fetching journey templates:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch journey templates'
    });
  }
});

// GET /api/journeys/templates/:id - Get journey template details with milestones
router.get('/templates/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { id } = req.params;

    const template = await prisma.journeyTemplate.findUnique({
      where: { id },
      include: {
        milestones: {
          orderBy: { sequence: 'asc' }
        },
        journeyStages: {
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
          select: { journeyStages: true }
        }
      }
    });

    if (!template) {
      return res.status(404).json({
        error: 'Template not found',
        message: `Journey template with ID ${id} does not exist`
      });
    }

    const transformedTemplate = {
      ...template,
      activeJourneys: template._count.journeyStages,
      assignedMembers: template.journeyStages.map((js: any) => js.member),
      _count: undefined
    };

    res.json(transformedTemplate);

  } catch (error) {
    console.error('Error fetching journey template details:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch journey template details'
    });
  }
});

// POST /api/journeys/templates - Create new journey template
router.post('/templates', authenticateToken, requireAdminOrPastor, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    
    const validatedData = createJourneyTemplateSchema.parse(req.body);
    
    const template = await prisma.journeyTemplate.create({
      data: validatedData,
      include: {
        _count: {
          select: { 
            milestones: true,
            journeyStages: true
          }
        }
      }
    });

    res.status(201).json({
      ...template,
      milestoneCount: template._count.milestones,
      activeJourneys: template._count.journeyStages,
      _count: undefined
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    console.error('Error creating journey template:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create journey template'
    });
  }
});

// PUT /api/journeys/templates/:id - Update journey template
router.put('/templates/:id', authenticateToken, requireAdminOrPastor, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { id } = req.params;

    // Check if template exists
    const existingTemplate = await prisma.journeyTemplate.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return res.status(404).json({
        error: 'Template not found',
        message: `Journey template with ID ${id} does not exist`
      });
    }

    const validatedData = updateJourneyTemplateSchema.parse(req.body);
    
    const template = await prisma.journeyTemplate.update({
      where: { id },
      data: validatedData,
      include: {
        _count: {
          select: { 
            milestones: true,
            journeyStages: true
          }
        }
      }
    });

    res.json({
      ...template,
      milestoneCount: template._count.milestones,
      activeJourneys: template._count.journeyStages,
      _count: undefined
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    console.error('Error updating journey template:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update journey template'
    });
  }
});

// DELETE /api/journeys/templates/:id - Soft delete journey template
router.delete('/templates/:id', authenticateToken, requireAdminOrPastor, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { id } = req.params;

    const existingTemplate = await prisma.journeyTemplate.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return res.status(404).json({
        error: 'Template not found',
        message: `Journey template with ID ${id} does not exist`
      });
    }

    await prisma.journeyTemplate.update({
      where: { id },
      data: { isActive: false }
    });

    res.status(204).send();

  } catch (error) {
    console.error('Error deleting journey template:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete journey template'
    });
  }
});

// POST /api/journeys/templates/:id/milestones - Add milestone to template
router.post('/templates/:id/milestones', authenticateToken, requireAdminOrPastor, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { id: templateId } = req.params;

    // Check if template exists
    const template = await prisma.journeyTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      return res.status(404).json({
        error: 'Template not found',
        message: `Journey template with ID ${templateId} does not exist`
      });
    }

    const validatedData = createMilestoneSchema.parse(req.body);
    
    const milestone = await prisma.milestone.create({
      data: {
        ...validatedData,
        templateId
      }
    });

    res.status(201).json(milestone);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    console.error('Error creating milestone:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create milestone'
    });
  }
});

// PUT /api/journeys/milestones/:id - Update milestone
router.put('/milestones/:id', authenticateToken, requireAdminOrPastor, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { id } = req.params;

    const existingMilestone = await prisma.milestone.findUnique({
      where: { id }
    });

    if (!existingMilestone) {
      return res.status(404).json({
        error: 'Milestone not found',
        message: `Milestone with ID ${id} does not exist`
      });
    }

    const validatedData = createMilestoneSchema.partial().parse(req.body);
    
    const milestone = await prisma.milestone.update({
      where: { id },
      data: validatedData
    });

    res.json(milestone);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    console.error('Error updating milestone:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update milestone'
    });
  }
});

// DELETE /api/journeys/milestones/:id - Delete milestone
router.delete('/milestones/:id', authenticateToken, requireAdminOrPastor, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { id } = req.params;

    const existingMilestone = await prisma.milestone.findUnique({
      where: { id }
    });

    if (!existingMilestone) {
      return res.status(404).json({
        error: 'Milestone not found',
        message: `Milestone with ID ${id} does not exist`
      });
    }

    await prisma.milestone.delete({
      where: { id }
    });

    res.status(204).send();

  } catch (error) {
    console.error('Error deleting milestone:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete milestone'
    });
  }
});

// POST /api/journeys/templates/:id/assign - Assign template to members
router.post('/templates/:id/assign', authenticateToken, requireAdminOrPastorOrGroupLeader, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { id: templateId } = req.params;

    // Check if template exists
    const template = await prisma.journeyTemplate.findUnique({
      where: { id: templateId },
      include: {
        milestones: {
          orderBy: { sequence: 'asc' }
        }
      }
    });

    if (!template) {
      return res.status(404).json({
        error: 'Template not found',
        message: `Journey template with ID ${templateId} does not exist`
      });
    }

    const validatedData = assignJourneySchema.parse(req.body);
    const { memberIds, milestoneId } = validatedData;

    // Verify all members exist
    const members = await prisma.member.findMany({
      where: { 
        id: { in: memberIds },
        isActive: true
      }
    });

    if (members.length !== memberIds.length) {
      return res.status(400).json({
        error: 'Invalid members',
        message: 'One or more member IDs are invalid or inactive'
      });
    }

    // Create journey stages for each member
    const journeyStages = await Promise.all(
      memberIds.map(memberId => 
        prisma.journeyStage.create({
          data: {
            memberId,
            templateId,
            milestoneId: validatedData.milestoneId,
            status: 'NOT_STARTED'
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
        })
      )
    );

    res.status(201).json({
      message: `Successfully assigned journey template to ${memberIds.length} member(s)`,
      assignments: journeyStages
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    console.error('Error assigning journey template:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to assign journey template'
    });
  }
});

// GET /api/journeys/members/:memberId - Get member's journey progress
router.get('/members/:memberId', authenticateToken, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { memberId } = req.params;

    const journeyStages = await prisma.journeyStage.findMany({
      where: { memberId },
      include: {
        template: {
          include: {
            milestones: {
              orderBy: { sequence: 'asc' }
            }
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
      },
      orderBy: { createdAt: 'desc' }
    });

    const transformedJourneys = journeyStages.map(journey => ({
      id: journey.id,
      templateId: journey.templateId,
      templateName: journey.template.name,
      status: journey.status,
      startedAt: journey.createdAt,
      completedAt: journey.completedAt,
      notes: journey.notes,
      member: journey.member,
      milestones: journey.template.milestones,
      progress: {
        totalMilestones: journey.template.milestones.length,
        completedMilestones: 0, // Would need to track milestone completion separately
        percentComplete: journey.status === 'COMPLETED' ? 100 : 
                        journey.status === 'IN_PROGRESS' ? 50 : 0
      }
    }));

    res.json({
      memberId,
      journeys: transformedJourneys,
      total: journeyStages.length
    });

  } catch (error) {
    console.error('Error fetching member journeys:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch member journeys'
    });
  }
});

// PUT /api/journeys/:id - Update journey stage progress
router.put('/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { id } = req.params;

    const existingJourney = await prisma.journeyStage.findUnique({
      where: { id },
      include: {
        member: {
          select: { userId: true }
        }
      }
    });

    if (!existingJourney) {
      return res.status(404).json({
        error: 'Journey not found',
        message: `Journey stage with ID ${id} does not exist`
      });
    }

    // Check permissions - user can update their own journey or admin/pastor/group_leader can update any
    const canUpdate = req.user.id === existingJourney.member.userId ||
                     ['admin', 'pastor', 'group_leader'].includes(req.user.role);

    if (!canUpdate) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You can only update your own journey progress'
      });
    }

    const validatedData = updateJourneyStageSchema.parse(req.body);
    
    const updatedJourney = await prisma.journeyStage.update({
      where: { id },
      data: {
        ...validatedData
      },
      include: {
        template: {
          select: {
            id: true,
            name: true
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

    res.json(updatedJourney);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    console.error('Error updating journey stage:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update journey stage'
    });
  }
});

// GET /api/journeys/member-journeys - List member journeys with pagination and filtering
router.get('/member-journeys', authenticateToken, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    
    const {
      page = 1,
      limit = 10,
      memberId,
      templateId,
      status,
      sortBy = 'startedAt',
      sortOrder = 'desc'
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    // Build where clause
    const where: any = {};
    if (memberId) where.memberId = memberId;
    if (templateId) where.templateId = templateId;
    if (status) where.status = status;

    const [journeys, total] = await Promise.all([
      prisma.journeyStage.findMany({
        where,
        skip: offset,
        take: parseInt(limit as string),
        orderBy: {
          [sortBy as string]: sortOrder
        },
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          template: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          milestone: {
            select: {
              id: true,
              name: true,
              sequence: true
            }
          }
        }
      }),
      prisma.journeyStage.count({ where })
    ]);

    res.json({
      journeys,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });

  } catch (error) {
    console.error('Error fetching member journeys:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch member journeys'
    });
  }
});

// GET /api/journeys/stats - Get journey statistics (dashboard)
router.get('/stats', authenticateToken, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;

    const [
      totalTemplates,
      activeTemplates,
      totalJourneys,
      completedJourneys,
      inProgressJourneys
    ] = await Promise.all([
      prisma.journeyTemplate.count(),
      prisma.journeyTemplate.count({ where: { isActive: true } }),
      prisma.journeyStage.count(),
      prisma.journeyStage.count({ where: { status: 'COMPLETED' } }),
      prisma.journeyStage.count({ where: { status: 'IN_PROGRESS' } })
    ]);

    const stats = {
      templates: {
        total: totalTemplates,
        active: activeTemplates
      },
      journeys: {
        total: totalJourneys,
        completed: completedJourneys,
        inProgress: inProgressJourneys,
        notStarted: totalJourneys - completedJourneys - inProgressJourneys,
        completionRate: totalJourneys > 0 ? Math.round((completedJourneys / totalJourneys) * 100) : 0
      }
    };

    res.json(stats);

  } catch (error) {
    console.error('Error fetching journey statistics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch journey statistics'
    });
  }
});

export { router as journeysRouter };
export default router;
