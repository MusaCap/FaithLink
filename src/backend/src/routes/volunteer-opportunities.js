const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

/**
 * GET /api/volunteer-opportunities
 * List all volunteer opportunities with filtering
 */
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      ministry, 
      urgency, 
      status = 'OPEN',
      upcoming,
      skills,
      search 
    } = req.query;

    const where = {};
    
    // Filter by ministry
    if (ministry) {
      where.ministry = { contains: ministry, mode: 'insensitive' };
    }
    
    // Filter by urgency
    if (urgency) {
      where.urgency = urgency;
    }
    
    // Filter by status
    if (status) {
      where.status = status;
    }
    
    // Filter upcoming opportunities
    if (upcoming === 'true') {
      where.startDate = { gte: new Date() };
    }
    
    // Filter by required skills
    if (skills) {
      where.skillsRequired = { hasSome: skills.split(',') };
    }
    
    // Search by title or description
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const opportunities = await prisma.volunteerOpportunity.findMany({
      where,
      include: {
        coordinator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        church: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            signups: true,
            volunteers: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: [
        { urgency: 'desc' },
        { startDate: 'asc' }
      ]
    });

    const total = await prisma.volunteerOpportunity.count({ where });

    res.json({
      opportunities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ error: 'Failed to fetch volunteer opportunities' });
  }
});

/**
 * POST /api/volunteer-opportunities
 * Create a new volunteer opportunity
 */
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      ministry,
      location,
      contactEmail,
      contactPhone,
      skillsRequired = [],
      minAge,
      maxAge,
      backgroundCheckRequired = false,
      trainingRequired = [],
      startDate,
      endDate,
      isRecurring = false,
      recurringSchedule,
      estimatedHours,
      maxVolunteers,
      urgency = 'NORMAL',
      coordinatorId,
      churchId
    } = req.body;

    // Validate coordinator exists
    const coordinator = await prisma.member.findUnique({
      where: { id: coordinatorId }
    });

    if (!coordinator) {
      return res.status(404).json({ error: 'Coordinator not found' });
    }

    const opportunity = await prisma.volunteerOpportunity.create({
      data: {
        title,
        description,
        ministry,
        location,
        contactEmail,
        contactPhone,
        skillsRequired,
        minAge,
        maxAge,
        backgroundCheckRequired,
        trainingRequired,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isRecurring,
        recurringSchedule,
        estimatedHours,
        maxVolunteers,
        urgency,
        coordinatorId,
        churchId
      },
      include: {
        coordinator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({ opportunity });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    res.status(500).json({ error: 'Failed to create volunteer opportunity' });
  }
});

/**
 * GET /api/volunteer-opportunities/:id
 * Get opportunity details by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const opportunity = await prisma.volunteerOpportunity.findUnique({
      where: { id },
      include: {
        coordinator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        church: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        volunteers: {
          include: {
            volunteer: {
              include: {
                member: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true
                  }
                }
              }
            }
          }
        },
        signups: {
          include: {
            volunteer: {
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
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!opportunity) {
      return res.status(404).json({ error: 'Volunteer opportunity not found' });
    }

    res.json({ opportunity });
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    res.status(500).json({ error: 'Failed to fetch volunteer opportunity' });
  }
});

/**
 * PUT /api/volunteer-opportunities/:id
 * Update volunteer opportunity
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert date strings to Date objects
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    const opportunity = await prisma.volunteerOpportunity.update({
      where: { id },
      data: updateData,
      include: {
        coordinator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json({ opportunity });
  } catch (error) {
    console.error('Error updating opportunity:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Volunteer opportunity not found' });
    }
    res.status(500).json({ error: 'Failed to update volunteer opportunity' });
  }
});

/**
 * DELETE /api/volunteer-opportunities/:id
 * Delete volunteer opportunity
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.volunteerOpportunity.delete({
      where: { id }
    });

    res.json({ message: 'Volunteer opportunity deleted successfully' });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Volunteer opportunity not found' });
    }
    res.status(500).json({ error: 'Failed to delete volunteer opportunity' });
  }
});

/**
 * GET /api/volunteer-opportunities/:id/signups
 * Get signups for an opportunity
 */
router.get('/:id/signups', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    const where = { opportunityId: id };
    if (status) {
      where.status = status;
    }

    const signups = await prisma.volunteerSignup.findMany({
      where,
      include: {
        volunteer: {
          include: {
            member: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ signups });
  } catch (error) {
    console.error('Error fetching signups:', error);
    res.status(500).json({ error: 'Failed to fetch signups' });
  }
});

/**
 * POST /api/volunteer-opportunities/:id/signup
 * Sign up volunteer for opportunity
 */
router.post('/:id/signup', async (req, res) => {
  try {
    const { id: opportunityId } = req.params;
    const {
      volunteerId,
      message,
      specialRequests,
      scheduledDate,
      scheduledStartTime,
      scheduledEndTime,
      estimatedHours
    } = req.body;

    // Check if opportunity exists and is still open
    const opportunity = await prisma.volunteerOpportunity.findUnique({
      where: { id: opportunityId }
    });

    if (!opportunity) {
      return res.status(404).json({ error: 'Volunteer opportunity not found' });
    }

    if (opportunity.status !== 'OPEN') {
      return res.status(400).json({ error: 'This opportunity is no longer accepting signups' });
    }

    // Check if volunteer already signed up
    const existingSignup = await prisma.volunteerSignup.findFirst({
      where: {
        volunteerId,
        opportunityId,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null
      }
    });

    if (existingSignup) {
      return res.status(400).json({ error: 'Volunteer already signed up for this opportunity' });
    }

    // Check capacity if maxVolunteers is set
    if (opportunity.maxVolunteers) {
      const confirmedSignups = await prisma.volunteerSignup.count({
        where: {
          opportunityId,
          status: { in: ['CONFIRMED', 'COMPLETED'] }
        }
      });

      if (confirmedSignups >= opportunity.maxVolunteers) {
        // Add to waitlist
        const signup = await prisma.volunteerSignup.create({
          data: {
            volunteerId,
            opportunityId,
            status: 'WAITLISTED',
            message,
            specialRequests,
            scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
            scheduledStartTime: scheduledStartTime ? new Date(scheduledStartTime) : null,
            scheduledEndTime: scheduledEndTime ? new Date(scheduledEndTime) : null,
            estimatedHours
          },
          include: {
            volunteer: {
              include: {
                member: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            },
            opportunity: {
              select: {
                title: true,
                startDate: true
              }
            }
          }
        });

        return res.status(201).json({ 
          signup, 
          message: 'Added to waitlist - opportunity is at capacity' 
        });
      }
    }

    const signup = await prisma.volunteerSignup.create({
      data: {
        volunteerId,
        opportunityId,
        message,
        specialRequests,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        scheduledStartTime: scheduledStartTime ? new Date(scheduledStartTime) : null,
        scheduledEndTime: scheduledEndTime ? new Date(scheduledEndTime) : null,
        estimatedHours
      },
      include: {
        volunteer: {
          include: {
            member: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        opportunity: {
          select: {
            title: true,
            startDate: true
          }
        }
      }
    });

    res.status(201).json({ signup });
  } catch (error) {
    console.error('Error creating signup:', error);
    res.status(500).json({ error: 'Failed to sign up for opportunity' });
  }
});

/**
 * PUT /api/volunteer-opportunities/:id/signups/:signupId
 * Update signup status (confirm, decline, etc.)
 */
router.put('/:id/signups/:signupId', async (req, res) => {
  try {
    const { signupId } = req.params;  
    const { status, confirmedBy, declinedReason, actualHours, feedback, rating } = req.body;

    const updateData = { status };

    if (status === 'CONFIRMED') {
      updateData.confirmedAt = new Date();
      updateData.confirmedBy = confirmedBy;
    } else if (status === 'DECLINED') {
      updateData.declinedAt = new Date();
      updateData.declinedReason = declinedReason;
    } else if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
      updateData.actualHours = actualHours;
      updateData.feedback = feedback;
      updateData.rating = rating;
    }

    const signup = await prisma.volunteerSignup.update({
      where: { id: signupId },
      data: updateData,
      include: {
        volunteer: {
          include: {
            member: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        opportunity: {
          select: {
            title: true,
            maxVolunteers: true
          }
        }
      }
    });

    // If signup was declined and there's a waitlist, promote next person
    if (status === 'DECLINED') {
      const waitlistedSignup = await prisma.volunteerSignup.findFirst({
        where: {
          opportunityId: signup.opportunityId,
          status: 'WAITLISTED'
        },
        orderBy: { createdAt: 'asc' }
      });

      if (waitlistedSignup) {
        await prisma.volunteerSignup.update({
          where: { id: waitlistedSignup.id },
          data: { status: 'PENDING' }
        });
      }
    }

    res.json({ signup });
  } catch (error) {
    console.error('Error updating signup:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Signup not found' });
    }
    res.status(500).json({ error: 'Failed to update signup' });
  }
});

/**
 * GET /api/volunteer-opportunities/search
 * Search opportunities with skill matching
 */
router.get('/search', async (req, res) => {
  try {
    const { volunteerId, ministry, urgent } = req.query;

    let where = {
      isActive: true,
      status: 'OPEN',
      startDate: { gte: new Date() }
    };

    if (ministry) {
      where.ministry = { contains: ministry, mode: 'insensitive' };
    }

    if (urgent === 'true') {
      where.urgency = { in: ['HIGH', 'URGENT'] };
    }

    // If volunteerId provided, match opportunities with volunteer skills
    let opportunities;
    if (volunteerId) {
      const volunteer = await prisma.volunteer.findUnique({
        where: { id: volunteerId },
        select: { skills: true, preferredMinistries: true }
      });

      if (volunteer) {
        // Find opportunities that match volunteer's skills or preferred ministries
        opportunities = await prisma.volunteerOpportunity.findMany({
          where: {
            ...where,
            OR: [
              { skillsRequired: { hasSome: volunteer.skills } },
              { ministry: { in: volunteer.preferredMinistries } }
            ]
          },
          include: {
            coordinator: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            },
            _count: {
              select: { signups: true }
            }
          },
          orderBy: [
            { urgency: 'desc' },
            { startDate: 'asc' }
          ]
        });
      } else {
        opportunities = [];
      }
    } else {
      opportunities = await prisma.volunteerOpportunity.findMany({
        where,
        include: {
          coordinator: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          _count: {
            select: { signups: true }
          }
        },
        orderBy: [
          { urgency: 'desc' },
          { startDate: 'asc' }
        ]
      });
    }

    res.json({ opportunities });
  } catch (error) {
    console.error('Error searching opportunities:', error);
    res.status(500).json({ error: 'Failed to search opportunities' });
  }
});

/**
 * GET /api/volunteer-opportunities/stats
 * Get opportunity statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const totalOpportunities = await prisma.volunteerOpportunity.count();
    const activeOpportunities = await prisma.volunteerOpportunity.count({
      where: { isActive: true }
    });
    const openOpportunities = await prisma.volunteerOpportunity.count({
      where: { status: 'OPEN' }
    });
    const urgentOpportunities = await prisma.volunteerOpportunity.count({
      where: { urgency: 'URGENT', status: 'OPEN' }
    });

    // Ministry breakdown
    const ministryStats = await prisma.volunteerOpportunity.groupBy({
      by: ['ministry'],
      _count: { ministry: true },
      where: { isActive: true }
    });

    // Status breakdown
    const statusStats = await prisma.volunteerOpportunity.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    res.json({
      totalOpportunities,
      activeOpportunities,
      openOpportunities,
      urgentOpportunities,
      ministryBreakdown: ministryStats,
      statusBreakdown: statusStats
    });
  } catch (error) {
    console.error('Error fetching opportunity stats:', error);
    res.status(500).json({ error: 'Failed to fetch opportunity statistics' });
  }
});

module.exports = router;
