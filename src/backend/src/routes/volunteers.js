const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

/**
 * GET /api/volunteers
 * List all volunteers with filtering options
 */
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      skills, 
      ministry, 
      active, 
      backgroundCheck,
      search 
    } = req.query;

    const where = {};
    
    // Filter by skills
    if (skills) {
      where.skills = { hasSome: skills.split(',') };
    }
    
    // Filter by preferred ministries
    if (ministry) {
      where.preferredMinistries = { hasSome: [ministry] };
    }
    
    // Filter by active status
    if (active !== undefined) {
      where.isActive = active === 'true';
    }
    
    // Filter by background check status
    if (backgroundCheck) {
      where.backgroundCheck = backgroundCheck;
    }
    
    // Search by member name or email
    if (search) {
      where.member = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    const volunteers = await prisma.volunteer.findMany({
      where,
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profilePhotoUrl: true
          }
        },
        _count: {
          select: {
            opportunities: true,
            signups: true,
            hours: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.volunteer.count({ where });

    res.json({
      volunteers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
});

/**
 * POST /api/volunteers
 * Create a new volunteer profile
 */
router.post('/', async (req, res) => {
  try {
    const {
      memberId,
      skills = [],
      interests = [],
      availability,
      maxHoursPerWeek,
      preferredMinistries = [],
      transportationAvailable = false,
      willingToTravel = false,
      emergencyContact,
      notes
    } = req.body;

    // Check if member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Check if volunteer profile already exists
    const existingVolunteer = await prisma.volunteer.findUnique({
      where: { memberId }
    });

    if (existingVolunteer) {
      return res.status(400).json({ error: 'Volunteer profile already exists for this member' });
    }

    const volunteer = await prisma.volunteer.create({
      data: {
        memberId,
        skills,
        interests,
        availability,
        maxHoursPerWeek,
        preferredMinistries,
        transportationAvailable,
        willingToTravel,
        emergencyContact,
        notes
      },
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
    });

    res.status(201).json({ volunteer });
  } catch (error) {
    console.error('Error creating volunteer:', error);
    res.status(500).json({ error: 'Failed to create volunteer profile' });
  }
});

/**
 * GET /api/volunteers/:id
 * Get volunteer details by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const volunteer = await prisma.volunteer.findUnique({
      where: { id },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profilePhotoUrl: true,
            address: true,
            dateOfBirth: true
          }
        },
        opportunities: {
          include: {
            opportunity: {
              select: {
                id: true,
                title: true,
                ministry: true,
                startDate: true,
                endDate: true,
                status: true
              }
            }
          }
        },
        signups: {
          include: {
            opportunity: {
              select: {
                id: true,
                title: true,
                ministry: true,
                startDate: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        hours: {
          include: {
            opportunity: {
              select: {
                id: true,
                title: true,
                ministry: true
              }
            }
          },
          orderBy: { date: 'desc' },
          take: 10
        },
        trainingCompletions: {
          include: {
            training: {
              select: {
                id: true,
                name: true,
                category: true
              }
            }
          }
        }
      }
    });

    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    // Calculate total hours
    const totalHours = await prisma.volunteerHour.aggregate({
      where: { volunteerId: id },
      _sum: { hoursWorked: true }
    });

    res.json({
      volunteer: {
        ...volunteer,
        totalHours: totalHours._sum.hoursWorked || 0
      }
    });
  } catch (error) {
    console.error('Error fetching volunteer:', error);
    res.status(500).json({ error: 'Failed to fetch volunteer' });
  }
});

/**
 * PUT /api/volunteers/:id
 * Update volunteer profile
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      skills,
      interests,
      availability,
      maxHoursPerWeek,
      preferredMinistries,
      transportationAvailable,
      willingToTravel,
      backgroundCheck,
      emergencyContact,
      notes,
      isActive
    } = req.body;

    const volunteer = await prisma.volunteer.update({
      where: { id },
      data: {
        skills,
        interests,
        availability,
        maxHoursPerWeek,
        preferredMinistries,
        transportationAvailable,
        willingToTravel,
        backgroundCheck,
        emergencyContact,
        notes,
        isActive
      },
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
    });

    res.json({ volunteer });
  } catch (error) {
    console.error('Error updating volunteer:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    res.status(500).json({ error: 'Failed to update volunteer' });
  }
});

/**
 * DELETE /api/volunteers/:id
 * Delete volunteer profile
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.volunteer.delete({
      where: { id }
    });

    res.json({ message: 'Volunteer profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting volunteer:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    res.status(500).json({ error: 'Failed to delete volunteer' });
  }
});

/**
 * GET /api/volunteers/:id/opportunities
 * Get volunteer's assigned opportunities
 */
router.get('/:id/opportunities', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, upcoming } = req.query;

    const where = { volunteerId: id };
    
    if (status) {
      where.opportunity = { status };
    }
    
    if (upcoming === 'true') {
      where.opportunity = {
        ...where.opportunity,
        startDate: { gte: new Date() }
      };
    }

    const assignments = await prisma.volunteerOpportunityAssignment.findMany({
      where,
      include: {
        opportunity: {
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
          }
        }
      },
      orderBy: { assignedDate: 'desc' }
    });

    res.json({ opportunities: assignments });
  } catch (error) {
    console.error('Error fetching volunteer opportunities:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

/**
 * GET /api/volunteers/:id/hours
 * Get volunteer's logged hours
 */
router.get('/:id/hours', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      page = 1, 
      limit = 20, 
      startDate, 
      endDate, 
      verified 
    } = req.query;

    const where = { volunteerId: id };
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    
    if (verified !== undefined) {
      where.isVerified = verified === 'true';
    }

    const hours = await prisma.volunteerHour.findMany({
      where,
      include: {
        opportunity: {
          select: {
            id: true,
            title: true,
            ministry: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: { date: 'desc' }
    });

    const total = await prisma.volunteerHour.count({ where });
    
    // Calculate total hours
    const totalHours = await prisma.volunteerHour.aggregate({
      where,
      _sum: { hoursWorked: true }
    });

    res.json({
      hours,
      totalHours: totalHours._sum.hoursWorked || 0,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching volunteer hours:', error);
    res.status(500).json({ error: 'Failed to fetch volunteer hours' });
  }
});

/**
 * POST /api/volunteers/:id/hours
 * Log volunteer hours
 */
router.post('/:id/hours', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      opportunityId,
      date,
      startTime,
      endTime,
      hoursWorked,
      description,
      category,
      ministry,
      location,
      notes
    } = req.body;

    const hour = await prisma.volunteerHour.create({
      data: {
        volunteerId: id,
        opportunityId,
        date: new Date(date),
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        hoursWorked,
        description,
        category,
        ministry,
        location,
        notes
      },
      include: {
        opportunity: {
          select: {
            id: true,
            title: true,
            ministry: true
          }
        }
      }
    });

    res.status(201).json({ hour });
  } catch (error) {
    console.error('Error logging volunteer hours:', error);
    res.status(500).json({ error: 'Failed to log volunteer hours' });
  }
});

/**
 * GET /api/volunteers/member/:memberId
 * Get volunteer profile by member ID
 */
router.get('/member/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;

    const volunteer = await prisma.volunteer.findUnique({
      where: { memberId },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        _count: {
          select: {
            opportunities: true,
            signups: true,
            hours: true
          }
        }
      }
    });

    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer profile not found' });
    }

    res.json({ volunteer });
  } catch (error) {
    console.error('Error fetching volunteer by member ID:', error);
    res.status(500).json({ error: 'Failed to fetch volunteer profile' });
  }
});

/**
 * GET /api/volunteers/stats
 * Get volunteer statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const totalVolunteers = await prisma.volunteer.count();
    const activeVolunteers = await prisma.volunteer.count({
      where: { isActive: true }
    });

    const totalHours = await prisma.volunteerHour.aggregate({
      _sum: { hoursWorked: true }
    });

    const totalOpportunities = await prisma.volunteerOpportunity.count();
    const activeOpportunities = await prisma.volunteerOpportunity.count({
      where: { isActive: true, status: 'OPEN' }
    });

    // Top skills
    const volunteers = await prisma.volunteer.findMany({
      select: { skills: true }
    });
    
    const skillsCount = {};
    volunteers.forEach(v => {
      v.skills.forEach(skill => {
        skillsCount[skill] = (skillsCount[skill] || 0) + 1;
      });
    });
    
    const topSkills = Object.entries(skillsCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    res.json({
      totalVolunteers,
      activeVolunteers,
      totalHours: totalHours._sum.hoursWorked || 0,
      totalOpportunities,
      activeOpportunities,
      topSkills
    });
  } catch (error) {
    console.error('Error fetching volunteer stats:', error);
    res.status(500).json({ error: 'Failed to fetch volunteer statistics' });
  }
});

module.exports = router;
