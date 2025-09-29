import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, requireAdminOrPastor, requireAdminOrPastorOrGroupLeader } from '../middleware/auth';

const router = express.Router();

// Validation schemas
const createMemberSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  dateOfBirth: z.string().transform((val) => val ? new Date(val) : null).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  address: z.string().optional(),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']).optional(),
  spiritualStatus: z.string().optional(),
  profilePhotoUrl: z.string().optional(),
  notes: z.string().optional()
});

const updateMemberSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().transform((val) => val ? new Date(val) : null).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  address: z.string().optional(),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']).optional(),
  spiritualStatus: z.string().optional(),
  profilePhotoUrl: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional()
});

// GET /api/members - Get all members with filtering and pagination
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const prisma = req.app.locals.prisma as PrismaClient;
    
    const {
      page = 1,
      limit = 20,
      search,
      status = 'active',
      sortBy = 'firstName',
      sortOrder = 'asc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where: any = {};
    
    if (status !== 'all') {
      where.isActive = status === 'active';
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          groups: {
            include: {
              group: {
                select: { id: true, name: true, type: true }
              }
            }
          },
          tags: {
            include: {
              tag: {
                select: { id: true, label: true, color: true }
              }
            }
          }
        }
      }),
      prisma.member.count({ where })
    ]);

    const transformedMembers = members.map(member => ({
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone || '',
      dateOfBirth: member.dateOfBirth,
      address: member.address || '',
      profilePhoto: member.profilePhotoUrl || '',
      membershipStatus: member.spiritualStatus || 'active',
      joinDate: member.createdAt,
      tags: (member as any).tags?.map((mt: any) => mt.tag) || [],
      groups: (member as any).groups?.map((mg: any) => mg.group) || [],
      notes: member.notes || '',
      gender: member.gender,
      maritalStatus: member.maritalStatus,
      isActive: member.isActive,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt
    }));

    res.json({
      members: transformedMembers,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / take)
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ 
      error: 'Failed to fetch members', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/members/:id - Get single member details
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const prisma = req.app.locals.prisma as PrismaClient;
    const { id } = req.params;

    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        groups: {
          include: {
            group: {
              select: { id: true, name: true, type: true, description: true }
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
        careLogs: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            type: true,
            notes: true,
            createdAt: true
          }
        }
      }
    });

    if (!member) {
      return res.status(404).json({
        error: 'Member not found',
        message: `Member with ID ${id} does not exist`
      });
    }

    const transformedMember = {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone || '',
      dateOfBirth: member.dateOfBirth,
      address: member.address || '',
      profilePhoto: member.profilePhotoUrl || '',
      membershipStatus: member.spiritualStatus || 'active',
      joinDate: member.createdAt,
      tags: (member as any).tags?.map((mt: any) => mt.tag) || [],
      groups: (member as any).groups?.map((mg: any) => mg.group) || [],
      careLogs: (member as any).careLogs || [],
      notes: member.notes || '',
      gender: member.gender,
      maritalStatus: member.maritalStatus,
      isActive: member.isActive,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt
    };

    res.json(transformedMember);
  } catch (error) {
    console.error('Error fetching member details:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch member details'
    });
  }
});

// POST /api/members - Create new member
router.post('/', authenticateToken, requireAdminOrPastorOrGroupLeader, async (req: any, res) => {
  try {
    const prisma = req.app.locals.prisma as PrismaClient;
    
    const validatedData = createMemberSchema.parse(req.body);
    
    // Check for duplicate email
    const existingMember = await prisma.member.findUnique({
      where: { email: validatedData.email }
    });
    
    if (existingMember) {
      return res.status(400).json({
        error: 'Email already exists',
        message: 'A member with this email address already exists'
      });
    }

    const member = await prisma.member.create({
      data: validatedData,
      include: {
        groups: {
          include: {
            group: {
              select: { id: true, name: true, type: true }
            }
          }
        },
        tags: {
          include: {
            tag: {
              select: { id: true, label: true, color: true }
            }
          }
        }
      }
    });

    const transformedMember = {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone || '',
      dateOfBirth: member.dateOfBirth,
      address: member.address || '',
      profilePhoto: member.profilePhotoUrl || '',
      membershipStatus: member.spiritualStatus || 'active',
      joinDate: member.createdAt,
      tags: (member as any).tags?.map((mt: any) => mt.tag) || [],
      groups: (member as any).groups?.map((mg: any) => mg.group) || [],
      notes: member.notes || '',
      gender: member.gender,
      maritalStatus: member.maritalStatus,
      isActive: member.isActive,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt
    };

    res.status(201).json(transformedMember);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    console.error('Error creating member:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create member'
    });
  }
});

// PUT /api/members/:id - Update member
router.put('/:id', authenticateToken, requireAdminOrPastorOrGroupLeader, async (req: any, res) => {
  try {
    const prisma = req.app.locals.prisma as PrismaClient;
    const { id } = req.params;

    // Check if member exists
    const existingMember = await prisma.member.findUnique({
      where: { id }
    });

    if (!existingMember) {
      return res.status(404).json({
        error: 'Member not found',
        message: `Member with ID ${id} does not exist`
      });
    }

    const validatedData = updateMemberSchema.parse(req.body);
    
    // Check for duplicate email if email is being updated
    if (validatedData.email && validatedData.email !== existingMember.email) {
      const duplicateEmail = await prisma.member.findUnique({
        where: { email: validatedData.email }
      });
      
      if (duplicateEmail) {
        return res.status(400).json({
          error: 'Email already exists',
          message: 'A member with this email address already exists'
        });
      }
    }

    const updatedMember = await prisma.member.update({
      where: { id },
      data: validatedData,
      include: {
        groups: {
          include: {
            group: {
              select: { id: true, name: true, type: true }
            }
          }
        },
        tags: {
          include: {
            tag: {
              select: { id: true, label: true, color: true }
            }
          }
        }
      }
    });

    const transformedMember = {
      id: updatedMember.id,
      firstName: updatedMember.firstName,
      lastName: updatedMember.lastName,
      email: updatedMember.email,
      phone: updatedMember.phone || '',
      dateOfBirth: updatedMember.dateOfBirth,
      address: updatedMember.address || '',
      profilePhoto: updatedMember.profilePhotoUrl || '',
      membershipStatus: updatedMember.spiritualStatus || 'active',
      joinDate: updatedMember.createdAt,
      tags: (updatedMember as any).tags?.map((mt: any) => mt.tag) || [],
      groups: (updatedMember as any).groups?.map((mg: any) => mg.group) || [],
      notes: updatedMember.notes || '',
      gender: updatedMember.gender,
      maritalStatus: updatedMember.maritalStatus,
      isActive: updatedMember.isActive,
      createdAt: updatedMember.createdAt,
      updatedAt: updatedMember.updatedAt
    };

    res.json(transformedMember);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    console.error('Error updating member:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update member'
    });
  }
});

// DELETE /api/members/:id - Soft delete member
router.delete('/:id', authenticateToken, requireAdminOrPastor, async (req: any, res) => {
  try {
    const prisma = req.app.locals.prisma as PrismaClient;
    const { id } = req.params;

    const existingMember = await prisma.member.findUnique({
      where: { id }
    });

    if (!existingMember) {
      return res.status(404).json({
        error: 'Member not found',
        message: `Member with ID ${id} does not exist`
      });
    }

    await prisma.member.update({
      where: { id },
      data: { isActive: false }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete member'
    });
  }
});

export default router;
