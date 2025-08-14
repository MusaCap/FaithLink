import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();

// GET /api/members - Get all members (minimal working version)
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/members called');

    // Use shared Prisma client from app.locals
    const prisma = req.app.locals.prisma as PrismaClient;

    // Get basic member data from database
    const members = await prisma.member.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        firstName: 'asc'
      },
      take: 50 // Limit for testing
    });

    console.log(`Found ${members.length} members`);

    // Transform to match frontend interface
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
      tags: [], // Simplified for now
      notes: member.notes || '',
      gender: member.gender,
      maritalStatus: member.maritalStatus,
      isActive: member.isActive,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt
    }));

    res.json({
      members: transformedMembers,
      total: members.length,
      filters: {
        limit: 50,
        offset: 0
      }
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ 
      error: 'Failed to fetch members', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
