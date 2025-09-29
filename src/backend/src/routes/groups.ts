import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, requireAdminOrPastor } from '../middleware/auth';

// Alias for consistency with existing code
const requireAuth = authenticateToken;

const router = Router();

// Validation schemas
const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100),
  type: z.enum(['LIFEGROUP', 'MINISTRY', 'TEAM']),
  description: z.string().optional(),
  location: z.string().optional(),
  meetingDay: z.string().optional(),
  meetingTime: z.string().optional(),
  isActive: z.boolean().default(true)
});

const updateGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['LIFEGROUP', 'MINISTRY', 'TEAM']).optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  meetingDay: z.string().optional(),
  meetingTime: z.string().optional(),
  isActive: z.boolean().optional()
});

const addMemberSchema = z.object({
  memberId: z.string().min(1, 'Member ID is required')
});

// Use imported middleware

// Check if user can manage specific group
const canManageGroup = async (prisma: PrismaClient, userId: string, groupId: string, userRole: string) => {
  if (['admin', 'pastor'].includes(userRole)) {
    return true;
  }

  if (userRole === 'group_leader') {
    // Find member record for this user
    const userMember = await prisma.member.findFirst({
      where: { userId }
    });
    
    if (!userMember) return false;
    
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        memberId: userMember.id
      }
    });
    return !!membership;
  }

  return false;
};

// GET /api/groups - List groups with filtering and pagination
router.get('/', requireAuth, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    
    const {
      page = 1,
      limit = 20,
      type,
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
    
    if (type) {
      where.type = type;
    }
    
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    // Get groups with member count
    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { members: true }
          },
          members: {
            take: 1,
            include: {
              member: {
                select: { firstName: true, lastName: true, email: true }
              }
            }
          }
        }
      }),
      prisma.group.count({ where })
    ]);

    res.json({
      groups: groups.map(group => ({
        ...group,
        memberCount: group._count.members,
        leader: group.members[0]?.member || null,
        _count: undefined,
        members: undefined
      })),
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / take)
    });

  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch groups'
    });
  }
});

// GET /api/groups/:id - Get group details with members
router.get('/:id', requireAuth, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { id } = req.params;

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        members: {
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
          },
          orderBy: [
            { member: { firstName: 'asc' } }
          ]
        },
        _count: {
          select: { members: true }
        }
      }
    });

    if (!group) {
      return res.status(404).json({
        error: 'Group not found',
        message: `Group with ID ${id} does not exist`
      });
    }

    res.json({
      ...group,
      memberCount: group._count.members,
      _count: undefined
    });

  } catch (error) {
    console.error('Error fetching group details:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch group details'
    });
  }
});

// POST /api/groups - Create new group
router.post('/', requireAuth, requireAdminOrPastor, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    
    const validatedData = createGroupSchema.parse(req.body);
    
    const group = await prisma.group.create({
      data: validatedData,
      include: {
        _count: {
          select: { members: true }
        }
      }
    });

    res.status(201).json({
      ...group,
      memberCount: group._count.members,
      _count: undefined
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return res.status(400).json({
        error: 'Group name already exists',
        message: 'A group with this name already exists'
      });
    }

    console.error('Error creating group:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create group'
    });
  }
});

// PUT /api/groups/:id - Update group
router.put('/:id', requireAuth, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { id } = req.params;

    // Check if group exists
    const existingGroup = await prisma.group.findUnique({
      where: { id },
      include: {
        members: {
          select: { memberId: true, isActive: true }
        }
      }
    });

    if (!existingGroup) {
      return res.status(404).json({
        error: 'Group not found',
        message: `Group with ID ${id} does not exist`
      });
    }

    // Check permissions
    const canManage = await canManageGroup(prisma, req.user.id, id, req.user.role);
    if (!canManage) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You do not have permission to manage this group'
      });
    }

    const validatedData = updateGroupSchema.parse(req.body);
    
    const group = await prisma.group.update({
      where: { id },
      data: validatedData,
      include: {
        _count: {
          select: { members: true }
        }
      }
    });

    res.json({
      ...group,
      memberCount: group._count.members,
      _count: undefined
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    console.error('Error updating group:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update group'
    });
  }
});

// DELETE /api/groups/:id - Soft delete group
router.delete('/:id', requireAuth, requireAdminOrPastor, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { id } = req.params;

    const existingGroup = await prisma.group.findUnique({
      where: { id }
    });

    if (!existingGroup) {
      return res.status(404).json({
        error: 'Group not found',
        message: `Group with ID ${id} does not exist`
      });
    }

    await prisma.group.update({
      where: { id },
      data: { isActive: false }
    });

    res.status(204).send();

  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete group'
    });
  }
});

// POST /api/groups/:id/members - Add member to group
router.post('/:id/members', requireAuth, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { id: groupId } = req.params;

    const validatedData = addMemberSchema.parse(req.body);
    const { memberId } = validatedData;

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      return res.status(404).json({
        error: 'Group not found',
        message: `Group with ID ${groupId} does not exist`
      });
    }

    // Check if member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      return res.status(404).json({
        error: 'Member not found',
        message: `Member with ID ${memberId} does not exist`
      });
    }

    // Check permissions for adding members
    const canManage = await canManageGroup(prisma, req.user.id, groupId, req.user.role);
    if (!canManage) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You do not have permission to manage this group'
      });
    }

    // Add member to group
    const groupMember = await prisma.groupMember.create({
      data: {
        groupId,
        memberId
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

    res.status(201).json(groupMember);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return res.status(400).json({
        error: 'User already in group',
        message: 'User is already a member of this group'
      });
    }

    console.error('Error adding group member:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to add member to group'
    });
  }
});

// DELETE /api/groups/:id/members/:memberId - Remove member from group
router.delete('/:id/members/:memberId', requireAuth, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { id: groupId, memberId } = req.params;

    // Check permissions
    const canManage = await canManageGroup(prisma, req.user.id, groupId, req.user.role);
    if (!canManage) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You do not have permission to remove this member'
      });
    }

    await prisma.groupMember.delete({
      where: {
        memberId_groupId: {
          groupId,
          memberId
        }
      }
    });

    res.status(204).send();

  } catch (error) {
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return res.status(404).json({
        error: 'Membership not found',
        message: 'User is not a member of this group'
      });
    }

    console.error('Error removing group member:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to remove member from group'
    });
  }
});

// PUT /api/groups/:id/members/:memberId - Update member status
router.put('/:id/members/:memberId', requireAuth, async (req: any, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { id: groupId, memberId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'isActive must be a boolean value'
      });
    }

    // Check permissions
    const canManage = await canManageGroup(prisma, req.user.id, groupId, req.user.role);
    if (!canManage) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You do not have permission to manage this group'
      });
    }

    const updatedMember = await prisma.groupMember.update({
      where: {
        memberId_groupId: {
          groupId,
          memberId
        }
      },
      data: { isActive },
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

    res.json(updatedMember);

  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update member role'
    });
  }
});

export { router as groupsRouter };
export default router;
