import { PrismaClient } from '@prisma/client';
import { getAllTestData, getTestDataIds } from '../fixtures/testData';

// Test database client with separate schema
let testPrisma: PrismaClient | null = null;

export const getTestDb = () => {
  if (!testPrisma) {
    testPrisma = new PrismaClient({
      datasources: {
        db: {
          url: 'file::memory:?cache=shared'
        }
      }
    });
  }
  return testPrisma;
};

export const setupTestDatabase = async () => {
  const prisma = getTestDb();
  
  try {
    // Create tables (migrations are handled by schema)
    await prisma.$executeRaw`PRAGMA foreign_keys = ON`;
    
    // Seed with test data
    const testData = getAllTestData();
    
    // Create users
    for (const user of testData.users) {
      await prisma.user.create({ 
        data: {
          ...user,
          password: 'hashedPassword123' // Required field
        }
      });
    }
    
    // Create groups
    for (const group of testData.groups) {
      await prisma.group.create({ data: group });
    }
    
    // Create group members
    for (const member of testData.groupMembers) {
      await prisma.groupMember.create({ 
        data: {
          ...member,
          memberId: member.userId // Fix field name mapping
        }
      });
    }
    
    // Create journey templates
    for (const template of testData.journeyTemplates) {
      await prisma.journeyTemplate.create({ data: template });
    }
    
    // Create milestones
    for (const milestone of testData.milestones) {
      await prisma.milestone.create({ 
        data: {
          ...milestone,
          sequence: milestone.order // Fix field name mapping
        }
      });
    }
    
    // Create journey stages (replaces memberJourneys)
    for (const journey of testData.memberJourneys || []) {
      await prisma.journeyStage.create({ 
        data: {
          id: journey.id,
          templateId: journey.templateId,
          memberId: journey.memberId,
          milestoneId: testData.milestones[0]?.id || 'default-milestone-id', // Required field
          status: 'IN_PROGRESS' // Valid StageStatus enum value
        }
      });
    }
    
    // Create events (replaces attendance sessions)
    for (const session of testData.attendanceSessions || []) {
      await prisma.event.create({ 
        data: {
          id: session.id,
          title: 'Test Event',
          description: session.notes || 'Test event description',
          location: 'Test Location',
          dateTime: session.date || new Date(),
          calendarType: 'ONEOFF',
          groupId: session.groupId,
          createdBy: testData.users[0]?.id || 'default-user-id' // Required field
        }
      });
    }
    
    // Create event attendance (replaces attendance records)
    for (const record of testData.attendanceRecords || []) {
      await prisma.eventAttendance.create({ 
        data: {
          id: record.id,
          eventId: record.sessionId,
          memberId: record.userId, // Fix property name
          attended: record.status === 'PRESENT', // Convert status to boolean
          checkedInAt: new Date()
        }
      });
    }
    
    console.log('✅ Test database seeded successfully');
    
  } catch (error) {
    console.error('❌ Failed to seed test database:', error);
    throw error;
  }
};

export const cleanupTestDatabase = async () => {
  const prisma = getTestDb();
  
  try {
    // Delete in reverse order of dependencies
    await prisma.eventAttendance.deleteMany();
    await prisma.event.deleteMany();
    await prisma.journeyStage.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.journeyTemplate.deleteMany();
    await prisma.groupMember.deleteMany();
    await prisma.group.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('🧹 Test database cleaned up');
    
  } catch (error) {
    console.error('❌ Failed to cleanup test database:', error);
    throw error;
  }
};

export const disconnectTestDatabase = async () => {
  if (testPrisma) {
    await testPrisma.$disconnect();
    testPrisma = null;
    console.log('📴 Disconnected from test database');
  }
};

// Helper function to reset database between tests
export const resetTestDatabase = async () => {
  await cleanupTestDatabase();
  await setupTestDatabase();
};

// Helper to get fresh test data for specific entity
export const createTestUser = async (overrides: any = {}) => {
  const prisma = getTestDb();
  return await prisma.user.create({
    data: {
      email: `test-${Date.now()}@faithlink.com`,
      firstName: 'Test',
      lastName: 'User',
      role: 'MEMBER',
      password: 'hashedPassword123',
      ...overrides
    }
  });
};

export const createTestGroup = async (overrides: any = {}) => {
  const prisma = getTestDb();
  return await prisma.group.create({
    data: {
      name: `Test Group ${Date.now()}`,
      description: 'Test group for testing',
      type: 'LIFEGROUP',
      ...overrides
    }
  });
};

export const createTestJourneyTemplate = async (overrides: any = {}) => {
  const prisma = getTestDb();
  return await prisma.journeyTemplate.create({
    data: {
      name: `Test Journey ${Date.now()}`,
      description: 'Test journey template',
      difficulty: 'BEGINNER',
      ...overrides
    }
  });
};
