const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all deacons
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      isActive = true,
      churchId 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      churchId: churchId || undefined,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    // Remove undefined values
    Object.keys(where).forEach(key => {
      if (where[key] === undefined) {
        delete where[key];
      }
    });

    const [deacons, total] = await Promise.all([
      prisma.deacon.findMany({
        where,
        skip,
        take,
        include: {
          assignedMembers: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
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
              assignedMembers: true
            }
          }
        },
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ]
      }),
      prisma.deacon.count({ where })
    ]);

    const pages = Math.ceil(total / take);

    res.json({
      success: true,
      deacons,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        pages
      }
    });
  } catch (error) {
    console.error('Error fetching deacons:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deacons',
      error: error.message
    });
  }
});

// Get single deacon
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deacon = await prisma.deacon.findUnique({
      where: { id },
      include: {
        assignedMembers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            membershipStatus: true,
            spiritualStatus: true
          },
          orderBy: [
            { lastName: 'asc' },
            { firstName: 'asc' }
          ]
        },
        member: {
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
            assignedMembers: true
          }
        }
      }
    });

    if (!deacon) {
      return res.status(404).json({
        success: false,
        message: 'Deacon not found'
      });
    }

    res.json({
      success: true,
      deacon
    });
  } catch (error) {
    console.error('Error fetching deacon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deacon',
      error: error.message
    });
  }
});

// Create new deacon
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      churchId,
      memberId,
      ordainedDate,
      specialties = [],
      maxMembers,
      notes
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and email are required'
      });
    }

    // Check if email already exists
    const existingDeacon = await prisma.deacon.findUnique({
      where: { email }
    });

    if (existingDeacon) {
      return res.status(400).json({
        success: false,
        message: 'A deacon with this email already exists'
      });
    }

    const deacon = await prisma.deacon.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        churchId,
        memberId,
        ordainedDate: ordainedDate ? new Date(ordainedDate) : null,
        specialties,
        maxMembers: maxMembers ? parseInt(maxMembers) : null,
        notes
      },
      include: {
        assignedMembers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
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
            assignedMembers: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Deacon created successfully',
      deacon
    });
  } catch (error) {
    console.error('Error creating deacon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create deacon',
      error: error.message
    });
  }
});

// Update deacon
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      churchId,
      memberId,
      ordainedDate,
      specialties,
      maxMembers,
      notes,
      isActive
    } = req.body;

    // Check if deacon exists
    const existingDeacon = await prisma.deacon.findUnique({
      where: { id }
    });

    if (!existingDeacon) {
      return res.status(404).json({
        success: false,
        message: 'Deacon not found'
      });
    }

    // Check if email is taken by another deacon
    if (email && email !== existingDeacon.email) {
      const emailTaken = await prisma.deacon.findUnique({
        where: { email }
      });

      if (emailTaken) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken by another deacon'
        });
      }
    }

    const deacon = await prisma.deacon.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        churchId,
        memberId,
        ordainedDate: ordainedDate ? new Date(ordainedDate) : null,
        specialties,
        maxMembers: maxMembers ? parseInt(maxMembers) : null,
        notes,
        isActive
      },
      include: {
        assignedMembers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
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
            assignedMembers: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Deacon updated successfully',
      deacon
    });
  } catch (error) {
    console.error('Error updating deacon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update deacon',
      error: error.message
    });
  }
});

// Delete deacon
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if deacon exists
    const deacon = await prisma.deacon.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            assignedMembers: true
          }
        }
      }
    });

    if (!deacon) {
      return res.status(404).json({
        success: false,
        message: 'Deacon not found'
      });
    }

    // Check if deacon has assigned members
    if (deacon._count.assignedMembers > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete deacon with ${deacon._count.assignedMembers} assigned members. Please reassign members first.`
      });
    }

    await prisma.deacon.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Deacon deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting deacon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete deacon',
      error: error.message
    });
  }
});

// Assign member to deacon
router.post('/:id/assign-member', async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: 'Member ID is required'
      });
    }

    // Check if deacon exists
    const deacon = await prisma.deacon.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            assignedMembers: true
          }
        }
      }
    });

    if (!deacon) {
      return res.status(404).json({
        success: false,
        message: 'Deacon not found'
      });
    }

    // Check if member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Check if deacon has reached max capacity
    if (deacon.maxMembers && deacon._count.assignedMembers >= deacon.maxMembers) {
      return res.status(400).json({
        success: false,
        message: `Deacon has reached maximum capacity of ${deacon.maxMembers} members`
      });
    }

    // Update member's assigned deacon
    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: { deaconId: id },
      include: {
        assignedDeacon: {
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

    res.json({
      success: true,
      message: 'Member assigned to deacon successfully',
      member: updatedMember
    });
  } catch (error) {
    console.error('Error assigning member to deacon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign member to deacon',
      error: error.message
    });
  }
});

// Remove member from deacon
router.post('/:id/remove-member', async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: 'Member ID is required'
      });
    }

    // Check if member exists and is assigned to this deacon
    const member = await prisma.member.findFirst({
      where: {
        id: memberId,
        deaconId: id
      }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found or not assigned to this deacon'
      });
    }

    // Remove deacon assignment
    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: { deaconId: null },
      include: {
        assignedDeacon: true
      }
    });

    res.json({
      success: true,
      message: 'Member removed from deacon successfully',
      member: updatedMember
    });
  } catch (error) {
    console.error('Error removing member from deacon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove member from deacon',
      error: error.message
    });
  }
});

// Get deacon statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;

    const deacon = await prisma.deacon.findUnique({
      where: { id },
      include: {
        assignedMembers: {
          select: {
            id: true,
            membershipStatus: true,
            spiritualStatus: true,
            isActive: true
          }
        }
      }
    });

    if (!deacon) {
      return res.status(404).json({
        success: false,
        message: 'Deacon not found'
      });
    }

    const stats = {
      totalAssignedMembers: deacon.assignedMembers.length,
      activeMembers: deacon.assignedMembers.filter(m => m.isActive).length,
      membershipStatusBreakdown: {},
      spiritualStatusBreakdown: {},
      capacityUtilization: deacon.maxMembers ? 
        Math.round((deacon.assignedMembers.length / deacon.maxMembers) * 100) : null
    };

    // Calculate status breakdowns
    deacon.assignedMembers.forEach(member => {
      if (member.membershipStatus) {
        stats.membershipStatusBreakdown[member.membershipStatus] = 
          (stats.membershipStatusBreakdown[member.membershipStatus] || 0) + 1;
      }
      if (member.spiritualStatus) {
        stats.spiritualStatusBreakdown[member.spiritualStatus] = 
          (stats.spiritualStatusBreakdown[member.spiritualStatus] || 0) + 1;
      }
    });

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching deacon stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deacon statistics',
      error: error.message
    });
  }
});

module.exports = router;
