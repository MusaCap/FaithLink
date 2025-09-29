import request from 'supertest';
import express from 'express';
import { careRouter } from '../care';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
const mockPrisma = {
  careLog: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn()
  },
  careLogFollowUp: {
    findMany: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn()
  },
  member: {
    findUnique: jest.fn(),
    findMany: jest.fn()
  }
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

const mockAuthMiddleware = (req: any, res: any, next: any) => {
  req.user = {
    id: 'user-1',
    role: 'admin',
    email: 'admin@test.com',
    memberId: 'member-1'
  };
  next();
};

describe('Care Logs API Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.locals.prisma = mockPrisma;
    app.use('/api/care', mockAuthMiddleware, careRouter);
    
    // Reset all mocks
    Object.values(mockPrisma).forEach(model => {
      Object.values(model).forEach(fn => jest.clearAllMocks());
    });
  });

  describe('GET /api/care', () => {
    it('should return paginated care logs', async () => {
      const mockCareLogs = [
        {
          id: 'care-1',
          memberId: 'member-2',
          type: 'VISIT',
          subject: 'Hospital Visit',
          description: 'Visited John during his recovery',
          outcome: 'Prayed together and provided encouragement',
          followUpRequired: true,
          followUpDate: new Date('2024-02-01'),
          isConfidential: false,
          contactDate: new Date('2024-01-15'),
          contactedBy: 'member-1',
          member: {
            id: 'member-2',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@email.com',
            phone: '555-0123'
          },
          contactedByMember: {
            id: 'member-1',
            firstName: 'Pastor',
            lastName: 'Smith',
            email: 'pastor@church.com'
          },
          followUps: []
        }
      ];

      mockPrisma.careLog.findMany.mockResolvedValue(mockCareLogs);
      mockPrisma.careLog.count.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/care')
        .expect(200);

      expect(response.body.careLogs).toHaveLength(1);
      expect(response.body.total).toBe(1);
      expect(response.body.careLogs[0]).toMatchObject({
        id: 'care-1',
        type: 'VISIT',
        subject: 'Hospital Visit',
        followUpRequired: true
      });
    });

    it('should filter care logs by type and member', async () => {
      mockPrisma.careLog.findMany.mockResolvedValue([]);
      mockPrisma.careLog.count.mockResolvedValue(0);

      await request(app)
        .get('/api/care?type=COUNSELING&memberId=member-2&followUpRequired=true')
        .expect(200);

      expect(mockPrisma.careLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'COUNSELING',
            memberId: 'member-2',
            followUpRequired: true
          })
        })
      );
    });

    it('should search care logs by subject and description', async () => {
      mockPrisma.careLog.findMany.mockResolvedValue([]);
      mockPrisma.careLog.count.mockResolvedValue(0);

      await request(app)
        .get('/api/care?search=prayer')
        .expect(200);

      expect(mockPrisma.careLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { subject: { contains: 'prayer', mode: 'insensitive' } },
              { description: { contains: 'prayer', mode: 'insensitive' } },
              { outcome: { contains: 'prayer', mode: 'insensitive' } }
            ])
          })
        })
      );
    });

    it('should filter confidential logs for regular members', async () => {
      const memberApp = express();
      memberApp.use(express.json());
      memberApp.locals.prisma = mockPrisma;
      
      const memberAuth = (req: any, res: any, next: any) => {
        req.user = { id: 'user-2', role: 'member', memberId: 'member-2' };
        next();
      };
      
      memberApp.use('/api/care', memberAuth, careRouter);

      mockPrisma.careLog.findMany.mockResolvedValue([]);
      mockPrisma.careLog.count.mockResolvedValue(0);

      await request(memberApp)
        .get('/api/care')
        .expect(200);

      expect(mockPrisma.careLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { isConfidential: false },
              { memberId: 'member-2' }
            ]
          })
        })
      );
    });
  });

  describe('GET /api/care/:id', () => {
    it('should return care log details with follow-ups', async () => {
      const mockCareLog = {
        id: 'care-1',
        memberId: 'member-2',
        type: 'COUNSELING',
        subject: 'Marriage Counseling Session',
        description: 'First counseling session with the couple',
        outcome: 'Identified key communication issues',
        followUpRequired: true,
        followUpDate: new Date('2024-02-01'),
        isConfidential: true,
        contactDate: new Date('2024-01-15'),
        contactedBy: 'member-1',
        member: {
          id: 'member-2',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@email.com',
          phone: '555-0123',
          address: '123 Main St'
        },
        contactedByMember: {
          id: 'member-1',
          firstName: 'Pastor',
          lastName: 'Smith',
          email: 'pastor@church.com'
        },
        followUps: [
          {
            id: 'followup-1',
            description: 'Follow-up call completed',
            notes: 'Couple is making progress',
            completedAt: new Date('2024-02-01'),
            completedByMember: {
              id: 'member-1',
              firstName: 'Pastor',
              lastName: 'Smith'
            }
          }
        ]
      };

      mockPrisma.careLog.findUnique.mockResolvedValue(mockCareLog);

      const response = await request(app)
        .get('/api/care/care-1')
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'care-1',
        type: 'COUNSELING',
        subject: 'Marriage Counseling Session',
        canEdit: true,
        canAddFollowUp: true
      });
      expect(response.body.followUps).toHaveLength(1);
    });

    it('should deny access to confidential logs for unauthorized users', async () => {
      const mockCareLog = {
        id: 'care-1',
        memberId: 'member-3', // Different member
        isConfidential: true,
        contactedBy: 'member-1'
      };

      const memberApp = express();
      memberApp.use(express.json());
      memberApp.locals.prisma = mockPrisma;
      
      const memberAuth = (req: any, res: any, next: any) => {
        req.user = { id: 'user-2', role: 'member', memberId: 'member-2' };
        next();
      };
      
      memberApp.use('/api/care', memberAuth, careRouter);

      mockPrisma.careLog.findUnique.mockResolvedValue(mockCareLog);

      await request(memberApp)
        .get('/api/care/care-1')
        .expect(403);
    });

    it('should return 404 for non-existent care log', async () => {
      mockPrisma.careLog.findUnique.mockResolvedValue(null);

      await request(app)
        .get('/api/care/non-existent')
        .expect(404);
    });
  });

  describe('POST /api/care', () => {
    it('should create new care log', async () => {
      const careLogData = {
        memberId: 'member-2',
        type: 'VISIT',
        subject: 'Home Visit',
        description: 'Visited family to provide support',
        outcome: 'Family is doing well, prayed together',
        followUpRequired: true,
        followUpDate: '2024-02-15',
        isConfidential: false,
        contactedBy: 'member-1',
        tags: ['family', 'support']
      };

      const mockMember = {
        id: 'member-2',
        firstName: 'John',
        lastName: 'Doe'
      };

      const mockContactedBy = {
        id: 'member-1',
        firstName: 'Pastor',
        lastName: 'Smith',
        userId: 'user-1'
      };

      const createdCareLog = {
        id: 'care-new',
        ...careLogData,
        followUpDate: new Date(careLogData.followUpDate),
        contactDate: new Date(),
        member: mockMember,
        contactedByMember: mockContactedBy
      };

      mockPrisma.member.findUnique
        .mockResolvedValueOnce(mockMember)
        .mockResolvedValueOnce(mockContactedBy);
      mockPrisma.careLog.create.mockResolvedValue(createdCareLog);

      const response = await request(app)
        .post('/api/care')
        .send(careLogData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: 'care-new',
        type: 'VISIT',
        subject: 'Home Visit',
        followUpRequired: true
      });
    });

    it('should validate required fields', async () => {
      const invalidCareLog = {
        type: 'VISIT',
        description: 'Missing required fields'
      };

      await request(app)
        .post('/api/care')
        .send(invalidCareLog)
        .expect(400);
    });

    it('should check permissions for creating care logs', async () => {
      const careLogData = {
        memberId: 'member-2',
        type: 'VISIT',
        subject: 'Test Visit',
        description: 'Test description',
        contactedBy: 'member-3' // Different member
      };

      const mockMember = {
        id: 'member-2',
        firstName: 'John',
        lastName: 'Doe'
      };

      const mockContactedBy = {
        id: 'member-3',
        firstName: 'Other',
        lastName: 'Person',
        userId: 'user-3' // Different user
      };

      const memberApp = express();
      memberApp.use(express.json());
      memberApp.locals.prisma = mockPrisma;
      
      const memberAuth = (req: any, res: any, next: any) => {
        req.user = { id: 'user-1', role: 'member', memberId: 'member-1' };
        next();
      };
      
      memberApp.use('/api/care', memberAuth, careRouter);

      mockPrisma.member.findUnique
        .mockResolvedValueOnce(mockMember)
        .mockResolvedValueOnce(mockContactedBy);

      await request(memberApp)
        .post('/api/care')
        .send(careLogData)
        .expect(403);
    });
  });

  describe('PUT /api/care/:id', () => {
    it('should update care log details', async () => {
      const updateData = {
        subject: 'Updated Subject',
        description: 'Updated description',
        outcome: 'Updated outcome',
        followUpRequired: false
      };

      const existingLog = {
        id: 'care-1',
        contactedByMember: {
          userId: 'user-1' // Same user
        }
      };

      const updatedLog = {
        ...existingLog,
        ...updateData,
        member: {
          id: 'member-2',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@email.com'
        },
        contactedByMember: {
          id: 'member-1',
          firstName: 'Pastor',
          lastName: 'Smith',
          email: 'pastor@church.com'
        },
        followUps: []
      };

      mockPrisma.careLog.findUnique.mockResolvedValue(existingLog);
      mockPrisma.careLog.update.mockResolvedValue(updatedLog);

      const response = await request(app)
        .put('/api/care/care-1')
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        subject: 'Updated Subject',
        description: 'Updated description',
        followUpRequired: false
      });
    });

    it('should check update permissions', async () => {
      const existingLog = {
        id: 'care-1',
        contactedByMember: {
          userId: 'user-2' // Different user
        }
      };

      const memberApp = express();
      memberApp.use(express.json());
      memberApp.locals.prisma = mockPrisma;
      
      const memberAuth = (req: any, res: any, next: any) => {
        req.user = { id: 'user-1', role: 'member', memberId: 'member-1' };
        next();
      };
      
      memberApp.use('/api/care', memberAuth, careRouter);

      mockPrisma.careLog.findUnique.mockResolvedValue(existingLog);

      await request(memberApp)
        .put('/api/care/care-1')
        .send({ subject: 'Unauthorized Update' })
        .expect(403);
    });
  });

  describe('DELETE /api/care/:id', () => {
    it('should allow admin to delete care log', async () => {
      const existingLog = {
        id: 'care-1',
        contactedByMember: {
          userId: 'user-2'
        }
      };

      mockPrisma.careLog.findUnique.mockResolvedValue(existingLog);
      mockPrisma.careLogFollowUp.deleteMany.mockResolvedValue({ count: 1 });
      mockPrisma.careLog.delete.mockResolvedValue(existingLog);

      await request(app)
        .delete('/api/care/care-1')
        .expect(204);

      expect(mockPrisma.careLogFollowUp.deleteMany).toHaveBeenCalledWith({
        where: { careLogId: 'care-1' }
      });
      expect(mockPrisma.careLog.delete).toHaveBeenCalledWith({
        where: { id: 'care-1' }
      });
    });

    it('should restrict deletion to admin and pastor roles', async () => {
      const existingLog = {
        id: 'care-1',
        contactedByMember: {
          userId: 'user-1' // Same user who created it
        }
      };

      const memberApp = express();
      memberApp.use(express.json());
      memberApp.locals.prisma = mockPrisma;
      
      const memberAuth = (req: any, res: any, next: any) => {
        req.user = { id: 'user-1', role: 'member', memberId: 'member-1' };
        next();
      };
      
      memberApp.use('/api/care', memberAuth, careRouter);

      mockPrisma.careLog.findUnique.mockResolvedValue(existingLog);

      await request(memberApp)
        .delete('/api/care/care-1')
        .expect(403);
    });
  });

  describe('POST /api/care/:id/follow-up', () => {
    it('should add follow-up to care log', async () => {
      const followUpData = {
        description: 'Follow-up call completed successfully',
        completedBy: 'member-1',
        notes: 'Member is doing much better'
      };

      const mockCareLog = {
        id: 'care-1',
        followUpRequired: true
      };

      const mockCompletedBy = {
        id: 'member-1',
        userId: 'user-1'
      };

      const createdFollowUp = {
        id: 'followup-new',
        careLogId: 'care-1',
        description: followUpData.description,
        notes: followUpData.notes,
        completedBy: 'member-1',
        completedAt: new Date(),
        completedByMember: {
          id: 'member-1',
          firstName: 'Pastor',
          lastName: 'Smith',
          email: 'pastor@church.com'
        }
      };

      mockPrisma.careLog.findUnique.mockResolvedValue(mockCareLog);
      mockPrisma.member.findUnique.mockResolvedValue(mockCompletedBy);
      mockPrisma.careLogFollowUp.create.mockResolvedValue(createdFollowUp);
      mockPrisma.careLog.update.mockResolvedValue({ ...mockCareLog, followUpRequired: false });

      const response = await request(app)
        .post('/api/care/care-1/follow-up')
        .send(followUpData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: 'followup-new',
        description: followUpData.description,
        notes: followUpData.notes
      });

      // Should mark follow-up as completed
      expect(mockPrisma.careLog.update).toHaveBeenCalledWith({
        where: { id: 'care-1' },
        data: { followUpRequired: false }
      });
    });

    it('should validate follow-up data', async () => {
      const invalidFollowUp = {
        completedBy: 'member-1'
        // Missing description
      };

      const mockCareLog = {
        id: 'care-1'
      };

      mockPrisma.careLog.findUnique.mockResolvedValue(mockCareLog);

      await request(app)
        .post('/api/care/care-1/follow-up')
        .send(invalidFollowUp)
        .expect(400);
    });
  });

  describe('GET /api/care/members/:memberId', () => {
    it('should return member care history', async () => {
      const mockCareLogs = [
        {
          id: 'care-1',
          type: 'VISIT',
          subject: 'Home Visit',
          contactDate: new Date('2024-01-15'),
          followUpRequired: false,
          contactedByMember: {
            id: 'member-1',
            firstName: 'Pastor',
            lastName: 'Smith',
            email: 'pastor@church.com'
          },
          followUps: []
        },
        {
          id: 'care-2',
          type: 'CALL',
          subject: 'Check-in Call',
          contactDate: new Date('2024-01-08'),
          followUpRequired: true,
          contactedByMember: {
            id: 'member-1',
            firstName: 'Pastor',
            lastName: 'Smith',
            email: 'pastor@church.com'
          },
          followUps: []
        }
      ];

      mockPrisma.careLog.findMany.mockResolvedValue(mockCareLogs);
      mockPrisma.careLog.count.mockResolvedValue(2);

      const response = await request(app)
        .get('/api/care/members/member-2')
        .expect(200);

      expect(response.body.careLogs).toHaveLength(2);
      expect(response.body.statistics).toMatchObject({
        total: 2,
        byType: {
          VISIT: 1,
          CALL: 1
        },
        followUpsPending: 1
      });
    });

    it('should check permissions for member care history', async () => {
      const memberApp = express();
      memberApp.use(express.json());
      memberApp.locals.prisma = mockPrisma;
      
      const memberAuth = (req: any, res: any, next: any) => {
        req.user = { id: 'user-2', role: 'member', memberId: 'member-2' };
        next();
      };
      
      memberApp.use('/api/care', memberAuth, careRouter);

      await request(memberApp)
        .get('/api/care/members/member-3') // Different member
        .expect(403);
    });
  });

  describe('GET /api/care/stats', () => {
    it('should return care statistics for admins', async () => {
      const mockTypeStats = [
        { type: 'VISIT', _count: { type: 25 } },
        { type: 'CALL', _count: { type: 15 } },
        { type: 'COUNSELING', _count: { type: 8 } }
      ];

      const mockRecentLogs = [
        {
          id: 'care-1',
          type: 'VISIT',
          subject: 'Hospital Visit',
          contactDate: new Date('2024-01-20'),
          member: {
            id: 'member-2',
            firstName: 'John',
            lastName: 'Doe'
          },
          contactedByMember: {
            id: 'member-1',
            firstName: 'Pastor',
            lastName: 'Smith'
          }
        }
      ];

      const mockTopCarers = [
        { contactedBy: 'member-1', _count: { contactedBy: 15 } },
        { contactedBy: 'member-3', _count: { contactedBy: 8 } }
      ];

      mockPrisma.careLog.count
        .mockResolvedValueOnce(50) // Total logs
        .mockResolvedValueOnce(5);  // Follow-ups pending
      mockPrisma.careLog.groupBy
        .mockResolvedValueOnce(mockTypeStats)
        .mockResolvedValueOnce(mockTopCarers);
      mockPrisma.careLog.findMany.mockResolvedValue(mockRecentLogs);

      const response = await request(app)
        .get('/api/care/stats')
        .expect(200);

      expect(response.body).toMatchObject({
        totalLogs: 50,
        followUpsPending: 5,
        typeBreakdown: {
          visit: 25,
          call: 15,
          counseling: 8
        }
      });
    });

    it('should restrict stats to admin and pastor roles', async () => {
      const memberApp = express();
      memberApp.use(express.json());
      memberApp.locals.prisma = mockPrisma;
      
      const memberAuth = (req: any, res: any, next: any) => {
        req.user = { id: 'user-2', role: 'member', memberId: 'member-2' };
        next();
      };
      
      memberApp.use('/api/care', memberAuth, careRouter);

      await request(memberApp)
        .get('/api/care/stats')
        .expect(403);
    });
  });

  describe('Authorization Tests', () => {
    it('should allow group leaders to create care logs', async () => {
      const leaderApp = express();
      leaderApp.use(express.json());
      leaderApp.locals.prisma = mockPrisma;
      
      const leaderAuth = (req: any, res: any, next: any) => {
        req.user = { id: 'user-1', role: 'group_leader', memberId: 'member-1' };
        next();
      };
      
      leaderApp.use('/api/care', leaderAuth, careRouter);

      const careLogData = {
        memberId: 'member-2',
        type: 'VISIT',
        subject: 'Group Leader Visit',
        description: 'Pastoral care visit',
        contactedBy: 'member-1'
      };

      const mockMember = {
        id: 'member-2',
        firstName: 'John',
        lastName: 'Doe'
      };

      const mockContactedBy = {
        id: 'member-1',
        firstName: 'Leader',
        lastName: 'Smith',
        userId: 'user-1'
      };

      mockPrisma.member.findUnique
        .mockResolvedValueOnce(mockMember)
        .mockResolvedValueOnce(mockContactedBy);
      mockPrisma.careLog.create.mockResolvedValue({
        id: 'care-new',
        ...careLogData,
        contactDate: new Date(),
        member: mockMember,
        contactedByMember: mockContactedBy
      });

      await request(leaderApp)
        .post('/api/care')
        .send(careLogData)
        .expect(201);
    });

    it('should restrict care log creation to authorized roles', async () => {
      const memberApp = express();
      memberApp.use(express.json());
      memberApp.locals.prisma = mockPrisma;
      
      const memberAuth = (req: any, res: any, next: any) => {
        req.user = { id: 'user-2', role: 'member', memberId: 'member-2' };
        next();
      };
      
      memberApp.use('/api/care', memberAuth, careRouter);

      const careLogData = {
        memberId: 'member-3',
        type: 'VISIT',
        subject: 'Test Visit',
        description: 'Test description',
        contactedBy: 'member-2'
      };

      await request(memberApp)
        .post('/api/care')
        .send(careLogData)
        .expect(403);
    });
  });
});
