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
      await prisma.user.create({ data: user });
    }
    
    // Create groups
    for (const group of testData.groups) {
      await prisma.group.create({ data: group });
    }
    
    // Create group members
    for (const member of testData.groupMembers) {
      await prisma.groupMember.create({ data: member });
    }
    
    // Create journey templates
    for (const template of testData.journeyTemplates) {
      await prisma.journeyTemplate.create({ data: template });
    }
    
    // Create milestones
    for (const milestone of testData.milestones) {
      await prisma.milestone.create({ data: milestone });
    }
    
    // Create member journeys
    for (const journey of testData.memberJourneys) {
      await prisma.memberJourney.create({ data: journey });
    }
    
    // Create milestone progress
    for (const progress of testData.milestoneProgress) {
      await prisma.milestoneProgress.create({ data: progress });
    }
    
    // Create attendance sessions
    for (const session of testData.attendanceSessions) {
      await prisma.attendanceSession.create({ data: session });
    }
    
    // Create attendance records
    for (const record of testData.attendanceRecords) {
      await prisma.attendanceRecord.create({ data: record });
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
    await prisma.attendanceRecord.deleteMany();
    await prisma.attendanceSession.deleteMany();
    await prisma.milestoneProgress.deleteMany();
    await prisma.memberJourney.deleteMany();
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
