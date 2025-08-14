import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/members - Get all members with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      query,
      tags,
      status,
      sortBy = 'firstName',
      sortOrder = 'asc',
      limit = 20,
      offset = 0,
      ageMin,
      ageMax,
      joinStart,
      joinEnd,
      groups
    } = req.query;

    // Build where clause for filtering
    let whereClause: any = {};

    // Text search across name and email
    if (query) {
      whereClause.OR = [
        { firstName: { contains: query as string, mode: 'insensitive' } },
        { lastName: { contains: query as string, mode: 'insensitive' } },
        { email: { contains: query as string, mode: 'insensitive' } }
      ];
    }

    // Filter by membership status
    if (status) {
      const statuses = (status as string).split(',');
      whereClause.membershipStatus = { in: statuses };
    }

    // Filter by tags
    if (tags) {
      const tagList = (tags as string).split(',');
      whereClause.tags = {
        some: {
          name: { in: tagList }
        }
      };
    }

    // Filter by age range (calculated from dateOfBirth)
    if (ageMin || ageMax) {
      const now = new Date();
      if (ageMin) {
        const maxBirthDate = new Date(now.getFullYear() - parseInt(ageMin as string), now.getMonth(), now.getDate());
        whereClause.dateOfBirth = { ...whereClause.dateOfBirth, lte: maxBirthDate };
      }
      if (ageMax) {
        const minBirthDate = new Date(now.getFullYear() - parseInt(ageMax as string), now.getMonth(), now.getDate());
        whereClause.dateOfBirth = { ...whereClause.dateOfBirth, gte: minBirthDate };
      }
    }

    // Filter by join date range
    if (joinStart || joinEnd) {
      if (joinStart) {
        whereClause.joinDate = { ...whereClause.joinDate, gte: new Date(joinStart as string) };
      }
      if (joinEnd) {
        whereClause.joinDate = { ...whereClause.joinDate, lte: new Date(joinEnd as string) };
      }
    }

    // Build order by clause
    let orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    // Get total count for pagination
    const total = await prisma.member.count({ where: whereClause });

    // Get paginated results
    const members = await prisma.member.findMany({
      where: whereClause,
      orderBy,
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      include: {
        tags: true,
        groupMemberships: {
          include: {
            group: {
              select: { id: true, name: true }
            }
          }
        },
        emergencyContact: true,
        spiritualJourney: true,
        preferences: true
      }
    });

    // Transform the data to match our frontend interface
    const transformedMembers = members.map(member => ({
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      dateOfBirth: member.dateOfBirth,
      address: member.address ? JSON.parse(member.address) : null,
      profilePhoto: member.profilePhoto,
      membershipStatus: member.membershipStatus,
      joinDate: member.joinDate,
      tags: member.tags.map(tag => tag.name),
      notes: member.notes,
      emergencyContact: member.emergencyContact ? {
        name: member.emergencyContact.name,
        relationship: member.emergencyContact.relationship,
        phone: member.emergencyContact.phone,
        email: member.emergencyContact.email
      } : null,
      spiritualJourney: member.spiritualJourney ? {
        baptismDate: member.spiritualJourney.baptismDate,
        salvationDate: member.spiritualJourney.salvationDate,
        currentStage: member.spiritualJourney.currentStage,
        notes: member.spiritualJourney.notes
      } : null,
      groupMemberships: member.groupMemberships.map(gm => ({
        groupId: gm.group.id,
        groupName: gm.group.name,
        role: gm.role,
        joinDate: gm.joinDate
      })),
      preferences: member.preferences ? {
        communicationMethod: member.preferences.communicationMethod,
        newsletter: member.preferences.newsletter,
        eventNotifications: member.preferences.eventNotifications,
        privacyLevel: member.preferences.privacyLevel
      } : null,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      createdBy: member.createdBy,
      updatedBy: member.updatedBy
    }));

    res.json({
      members: transformedMembers,
      total,
      filters: {
        query,
        tags: tags ? (tags as string).split(',') : [],
        membershipStatus: status ? (status as string).split(',') : [],
        sortBy,
        sortOrder,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// GET /api/members/:id - Get single member by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        tags: true,
        groupMemberships: {
          include: {
            group: {
              select: { id: true, name: true }
            }
          }
        },
        emergencyContact: true,
        spiritualJourney: true,
        preferences: true,
        attendance: {
          include: {
            event: {
              select: { id: true, name: true }
            }
          }
        },
        careHistory: true
      }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Transform the data to match our frontend interface
    const transformedMember = {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      dateOfBirth: member.dateOfBirth,
      address: member.address ? JSON.parse(member.address) : null,
      profilePhoto: member.profilePhoto,
      membershipStatus: member.membershipStatus,
      joinDate: member.joinDate,
      tags: member.tags.map(tag => tag.name),
      notes: member.notes,
      emergencyContact: member.emergencyContact ? {
        name: member.emergencyContact.name,
        relationship: member.emergencyContact.relationship,
        phone: member.emergencyContact.phone,
        email: member.emergencyContact.email
      } : null,
      spiritualJourney: member.spiritualJourney ? {
        baptismDate: member.spiritualJourney.baptismDate,
        salvationDate: member.spiritualJourney.salvationDate,
        currentStage: member.spiritualJourney.currentStage,
        notes: member.spiritualJourney.notes
      } : null,
      groupMemberships: member.groupMemberships.map(gm => ({
        groupId: gm.group.id,
        groupName: gm.group.name,
        role: gm.role,
        joinDate: gm.joinDate
      })),
      attendance: member.attendance.map(a => ({
        eventId: a.event.id,
        eventName: a.event.name,
        date: a.date,
        attended: a.attended
      })),
      careHistory: member.careHistory.map(ch => ({
        date: ch.date,
        type: ch.type,
        notes: ch.notes,
        careGiver: ch.careGiver
      })),
      preferences: member.preferences ? {
        communicationMethod: member.preferences.communicationMethod,
        newsletter: member.preferences.newsletter,
        eventNotifications: member.preferences.eventNotifications,
        privacyLevel: member.preferences.privacyLevel
      } : null,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      createdBy: member.createdBy,
      updatedBy: member.updatedBy
    };

    res.json(transformedMember);
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

// POST /api/members - Create new member
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      address,
      membershipStatus = 'pending',
      tags = [],
      notes,
      emergencyContact,
      preferences
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'First name, last name, and email are required' });
    }

    // Check if email already exists
    const existingMember = await prisma.member.findUnique({
      where: { email }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'Member with this email already exists' });
    }

    // Create member in transaction to handle related records
    const member = await prisma.$transaction(async (tx) => {
      // Create the member
      const newMember = await tx.member.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          address: address ? JSON.stringify(address) : null,
          membershipStatus,
          joinDate: new Date(),
          notes,
          createdBy: 'system', // TODO: Replace with actual user ID from auth
          updatedBy: 'system'
        }
      });

      // Create emergency contact if provided
      if (emergencyContact && emergencyContact.name) {
        await tx.emergencyContact.create({
          data: {
            memberId: newMember.id,
            name: emergencyContact.name,
            relationship: emergencyContact.relationship,
            phone: emergencyContact.phone,
            email: emergencyContact.email
          }
        });
      }

      // Create preferences if provided
      if (preferences) {
        await tx.memberPreferences.create({
          data: {
            memberId: newMember.id,
            communicationMethod: preferences.communicationMethod || 'email',
            newsletter: preferences.newsletter ?? true,
            eventNotifications: preferences.eventNotifications ?? true,
            privacyLevel: preferences.privacyLevel || 'members'
          }
        });
      }

      // Create tags if provided
      if (tags && tags.length > 0) {
        for (const tagName of tags) {
          // Find or create tag
          let tag = await tx.tag.findUnique({
            where: { name: tagName }
          });

          if (!tag) {
            tag = await tx.tag.create({
              data: {
                name: tagName,
                description: '',
                color: '#3B82F6',
                category: 'other',
                isSystemTag: false,
                createdBy: 'system'
              }
            });
          }

          // Link tag to member
          await tx.memberTag.create({
            data: {
              memberId: newMember.id,
              tagId: tag.id
            }
          });
        }
      }

      return newMember;
    });

    // Fetch the complete member data to return
    const completeMember = await prisma.member.findUnique({
      where: { id: member.id },
      include: {
        tags: true,
        emergencyContact: true,
        preferences: true
      }
    });

    res.status(201).json({
      id: completeMember!.id,
      firstName: completeMember!.firstName,
      lastName: completeMember!.lastName,
      email: completeMember!.email,
      phone: completeMember!.phone,
      dateOfBirth: completeMember!.dateOfBirth,
      address: completeMember!.address ? JSON.parse(completeMember!.address) : null,
      profilePhoto: completeMember!.profilePhoto,
      membershipStatus: completeMember!.membershipStatus,
      joinDate: completeMember!.joinDate,
      tags: completeMember!.tags.map(tag => tag.name),
      notes: completeMember!.notes,
      emergencyContact: completeMember!.emergencyContact,
      preferences: completeMember!.preferences,
      createdAt: completeMember!.createdAt,
      updatedAt: completeMember!.updatedAt,
      createdBy: completeMember!.createdBy,
      updatedBy: completeMember!.updatedBy
    });
  } catch (error) {
    console.error('Error creating member:', error);
    res.status(500).json({ error: 'Failed to create member' });
  }
});

// PUT /api/members/:id - Update member
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if member exists
    const existingMember = await prisma.member.findUnique({
      where: { id }
    });

    if (!existingMember) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Update member in transaction
    const updatedMember = await prisma.$transaction(async (tx) => {
      // Update the member
      const member = await tx.member.update({
        where: { id },
        data: {
          firstName: updateData.firstName,
          lastName: updateData.lastName,
          email: updateData.email,
          phone: updateData.phone,
          dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : null,
          address: updateData.address ? JSON.stringify(updateData.address) : null,
          membershipStatus: updateData.membershipStatus,
          notes: updateData.notes,
          updatedBy: 'system', // TODO: Replace with actual user ID from auth
          updatedAt: new Date()
        }
      });

      // Update emergency contact
      if (updateData.emergencyContact) {
        await tx.emergencyContact.upsert({
          where: { memberId: id },
          create: {
            memberId: id,
            name: updateData.emergencyContact.name,
            relationship: updateData.emergencyContact.relationship,
            phone: updateData.emergencyContact.phone,
            email: updateData.emergencyContact.email
          },
          update: {
            name: updateData.emergencyContact.name,
            relationship: updateData.emergencyContact.relationship,
            phone: updateData.emergencyContact.phone,
            email: updateData.emergencyContact.email
          }
        });
      }

      // Update preferences
      if (updateData.preferences) {
        await tx.memberPreferences.upsert({
          where: { memberId: id },
          create: {
            memberId: id,
            communicationMethod: updateData.preferences.communicationMethod || 'email',
            newsletter: updateData.preferences.newsletter ?? true,
            eventNotifications: updateData.preferences.eventNotifications ?? true,
            privacyLevel: updateData.preferences.privacyLevel || 'members'
          },
          update: {
            communicationMethod: updateData.preferences.communicationMethod,
            newsletter: updateData.preferences.newsletter,
            eventNotifications: updateData.preferences.eventNotifications,
            privacyLevel: updateData.preferences.privacyLevel
          }
        });
      }

      return member;
    });

    res.json({ success: true, member: updatedMember });
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// DELETE /api/members/:id - Delete member
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if member exists
    const existingMember = await prisma.member.findUnique({
      where: { id }
    });

    if (!existingMember) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Delete member and all related records in transaction
    await prisma.$transaction(async (tx) => {
      // Delete related records first (due to foreign key constraints)
      await tx.memberTag.deleteMany({ where: { memberId: id } });
      await tx.emergencyContact.deleteMany({ where: { memberId: id } });
      await tx.memberPreferences.deleteMany({ where: { memberId: id } });
      await tx.spiritualJourney.deleteMany({ where: { memberId: id } });
      await tx.groupMembership.deleteMany({ where: { memberId: id } });
      await tx.attendance.deleteMany({ where: { memberId: id } });
      await tx.careHistory.deleteMany({ where: { memberId: id } });
      
      // Finally delete the member
      await tx.member.delete({ where: { id } });
    });

    res.json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

// GET /api/members/stats - Get member statistics
router.get('/stats', async (req, res) => {
  try {
    const totalMembers = await prisma.member.count();
    const activeMembers = await prisma.member.count({
      where: { membershipStatus: 'active' }
    });

    // Get new members this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newMembersThisMonth = await prisma.member.count({
      where: {
        joinDate: { gte: startOfMonth }
      }
    });

    // Get members by status
    const membersByStatus = await prisma.member.groupBy({
      by: ['membershipStatus'],
      _count: true
    });

    const statusCounts = membersByStatus.reduce((acc, item) => {
      acc[item.membershipStatus] = item._count;
      return acc;
    }, {} as any);

    // Get top tags
    const topTags = await prisma.memberTag.groupBy({
      by: ['tagId'],
      _count: true,
      orderBy: { _count: { tagId: 'desc' } },
      take: 5
    });

    res.json({
      totalMembers,
      activeMembers,
      newMembersThisMonth,
      membersByStatus: statusCounts,
      topTags: topTags.map(t => ({
        tagId: t.tagId,
        count: t._count.tagId
      }))
    });
  } catch (error) {
    console.error('Error fetching member stats:', error);
    res.status(500).json({ error: 'Failed to fetch member stats' });
  }
});

export default router;
