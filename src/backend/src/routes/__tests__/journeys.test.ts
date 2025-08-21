import request from 'supertest';
import express from 'express';
import { journeysRouter } from '../journeys';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
const mockPrisma = {
  journeyTemplate: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  memberJourney: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  milestone: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  milestoneProgress: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn()
  },
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn()
  }
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

const mockAuthMiddleware = (req: any, res: any, next: any) => {
  req.user = {
    id: 'user-1',
    role: 'admin',
    email: 'admin@test.com'
  };
  next();
};

describe('Journeys API Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/journeys', mockAuthMiddleware, journeysRouter);
    
    // Reset all mocks
    Object.values(mockPrisma).forEach(model => {
      Object.values(model).forEach(fn => jest.clearAllMocks());
    });
  });

  describe('GET /api/journeys/templates', () => {
    it('should return paginated journey templates', async () => {
      const mockTemplates = [
        {
          id: 'template-1',
          name: 'New Member Journey',
          description: 'Path for new church members',
          difficulty: 'beginner',
          isActive: true,
          milestones: [
            {
              id: 'milestone-1',
              name: 'Welcome',
              description: 'Church orientation',
              order: 1
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockPrisma.journeyTemplate.findMany.mockResolvedValue(mockTemplates);
      mockPrisma.journeyTemplate.count.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/journeys/templates')
        .expect(200);

      expect(response.body.templates).toHaveLength(1);
      expect(response.body.total).toBe(1);
      expect(response.body.templates[0]).toMatchObject({
        id: 'template-1',
        name: 'New Member Journey',
        difficulty: 'beginner'
      });
    });

    it('should filter templates by difficulty', async () => {
      mockPrisma.journeyTemplate.findMany.mockResolvedValue([]);
      mockPrisma.journeyTemplate.count.mockResolvedValue(0);

      await request(app)
        .get('/api/journeys/templates?difficulty=advanced')
        .expect(200);

      expect(mockPrisma.journeyTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            difficulty: 'advanced'
          })
        })
      );
    });
  });

  describe('POST /api/journeys/templates', () => {
    it('should create journey template with milestones', async () => {
      const templateData = {
        name: 'Leadership Journey',
        description: 'Path to church leadership',
        difficulty: 'advanced',
        milestones: [
          {
            name: 'Character Assessment',
            description: 'Complete character evaluation',
            order: 1
          },
          {
            name: 'Leadership Training',
            description: 'Attend leadership classes',
            order: 2
          }
        ]
      };

      const createdTemplate = {
        id: 'template-new',
        ...templateData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.journeyTemplate.create.mockResolvedValue(createdTemplate);

      const response = await request(app)
        .post('/api/journeys/templates')
        .send(templateData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: 'template-new',
        name: 'Leadership Journey',
        difficulty: 'advanced'
      });

      expect(mockPrisma.journeyTemplate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: templateData.name,
          description: templateData.description,
          difficulty: templateData.difficulty,
          milestones: {
            create: expect.arrayContaining([
              expect.objectContaining({ name: 'Character Assessment', order: 1 }),
              expect.objectContaining({ name: 'Leadership Training', order: 2 })
            ])
          }
        })
      });
    });

    it('should validate required template fields', async () => {
      const invalidTemplate = {
        description: 'Missing name and difficulty'
      };

      await request(app)
        .post('/api/journeys/templates')
        .send(invalidTemplate)
        .expect(400);
    });

    it('should require at least one milestone', async () => {
      const templateWithoutMilestones = {
        name: 'Empty Journey',
        description: 'Journey without milestones',
        difficulty: 'beginner',
        milestones: []
      };

      await request(app)
        .post('/api/journeys/templates')
        .send(templateWithoutMilestones)
        .expect(400);
    });
  });

  describe('GET /api/journeys/member-journeys', () => {
    it('should return member journeys with progress', async () => {
      const mockJourneys = [
        {
          id: 'journey-1',
          memberId: 'user-2',
          templateId: 'template-1',
          mentorId: 'user-1',
          status: 'active',
          startDate: new Date(),
          member: {
            id: 'user-2',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@test.com'
          },
          template: {
            id: 'template-1',
            name: 'New Member Journey',
            milestones: []
          },
          progress: []
        }
      ];

      mockPrisma.memberJourney.findMany.mockResolvedValue(mockJourneys);
      mockPrisma.memberJourney.count.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/journeys/member-journeys')
        .expect(200);

      expect(response.body.journeys).toHaveLength(1);
      expect(response.body.journeys[0]).toMatchObject({
        id: 'journey-1',
        status: 'active'
      });
    });

    it('should filter journeys by status', async () => {
      mockPrisma.memberJourney.findMany.mockResolvedValue([]);
      mockPrisma.memberJourney.count.mockResolvedValue(0);

      await request(app)
        .get('/api/journeys/member-journeys?status=completed')
        .expect(200);

      expect(mockPrisma.memberJourney.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'completed'
          })
        })
      );
    });
  });

  describe('POST /api/journeys/assign', () => {
    it('should assign journey templates to members', async () => {
      const assignmentData = {
        templateId: 'template-1',
        memberIds: ['user-2', 'user-3'],
        mentorId: 'user-1',
        notes: 'Starting new member journey'
      };

      const createdJourneys = [
        {
          id: 'journey-1',
          memberId: 'user-2',
          templateId: 'template-1',
          mentorId: 'user-1'
        },
        {
          id: 'journey-2',
          memberId: 'user-3',
          templateId: 'template-1',
          mentorId: 'user-1'
        }
      ];

      mockPrisma.journeyTemplate.findUnique.mockResolvedValue({
        id: 'template-1',
        milestones: [
          { id: 'milestone-1', order: 1 },
          { id: 'milestone-2', order: 2 }
        ]
      });

      mockPrisma.memberJourney.create
        .mockResolvedValueOnce(createdJourneys[0])
        .mockResolvedValueOnce(createdJourneys[1]);

      const response = await request(app)
        .post('/api/journeys/assign')
        .send(assignmentData)
        .expect(201);

      expect(response.body.assigned).toBe(2);
      expect(mockPrisma.memberJourney.create).toHaveBeenCalledTimes(2);
    });

    it('should validate assignment data', async () => {
      const invalidAssignment = {
        templateId: 'template-1',
        memberIds: [] // Empty member list
      };

      await request(app)
        .post('/api/journeys/assign')
        .send(invalidAssignment)
        .expect(400);
    });
  });

  describe('PUT /api/journeys/milestone/:id/progress', () => {
    it('should update milestone progress', async () => {
      const progressData = {
        status: 'completed',
        submission: 'I have completed this milestone successfully',
        feedback: 'Great work!'
      };

      const updatedProgress = {
        id: 'progress-1',
        milestoneId: 'milestone-1',
        journeyId: 'journey-1',
        ...progressData,
        completedAt: new Date()
      };

      mockPrisma.milestoneProgress.upsert.mockResolvedValue(updatedProgress);

      const response = await request(app)
        .put('/api/journeys/milestone/milestone-1/progress')
        .send({ journeyId: 'journey-1', ...progressData })
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'completed',
        submission: progressData.submission
      });
    });

    it('should handle milestone approval workflow', async () => {
      const approvalData = {
        journeyId: 'journey-1',
        status: 'approved',
        feedback: 'Excellent submission, well done!'
      };

      mockPrisma.milestoneProgress.upsert.mockResolvedValue({
        id: 'progress-1',
        status: 'approved',
        feedback: approvalData.feedback,
        approvedAt: new Date()
      });

      await request(app)
        .put('/api/journeys/milestone/milestone-1/progress')
        .send(approvalData)
        .expect(200);

      expect(mockPrisma.milestoneProgress.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            status: 'approved',
            feedback: approvalData.feedback,
            approvedAt: expect.any(Date)
          })
        })
      );
    });
  });

  describe('GET /api/journeys/:id/statistics', () => {
    it('should return journey completion statistics', async () => {
      const mockStats = {
        totalMilestones: 5,
        completedMilestones: 3,
        averageCompletionTime: 7.5,
        memberCount: 10,
        completionRate: 0.6
      };

      mockPrisma.memberJourney.findUnique.mockResolvedValue({
        id: 'journey-1',
        template: {
          milestones: new Array(5).fill({}),
        },
        progress: [
          { status: 'completed' },
          { status: 'completed' },
          { status: 'completed' },
          { status: 'in_progress' },
          { status: 'not_started' }
        ]
      });

      const response = await request(app)
        .get('/api/journeys/journey-1/statistics')
        .expect(200);

      expect(response.body).toMatchObject({
        totalMilestones: expect.any(Number),
        completedMilestones: expect.any(Number),
        completionPercentage: expect.any(Number)
      });
    });
  });

  describe('POST /api/journeys/bulk-assign', () => {
    it('should handle bulk journey assignment', async () => {
      const bulkData = {
        assignments: [
          {
            templateId: 'template-1',
            memberIds: ['user-2', 'user-3'],
            mentorId: 'user-1'
          },
          {
            templateId: 'template-2',
            memberIds: ['user-4'],
            mentorId: 'user-1'
          }
        ]
      };

      mockPrisma.journeyTemplate.findUnique
        .mockResolvedValueOnce({ id: 'template-1', milestones: [] })
        .mockResolvedValueOnce({ id: 'template-2', milestones: [] });

      mockPrisma.memberJourney.create
        .mockResolvedValueOnce({ id: 'journey-1' })
        .mockResolvedValueOnce({ id: 'journey-2' })
        .mockResolvedValueOnce({ id: 'journey-3' });

      const response = await request(app)
        .post('/api/journeys/bulk-assign')
        .send(bulkData)
        .expect(200);

      expect(response.body.totalAssigned).toBe(3);
      expect(response.body.results).toHaveLength(2);
    });
  });

  describe('Authorization Tests', () => {
    it('should restrict template creation to authorized roles', async () => {
      const memberApp = express();
      memberApp.use(express.json());
      
      const memberAuth = (req: any, res: any, next: any) => {
        req.user = { id: 'user-1', role: 'member', email: 'member@test.com' };
        next();
      };
      
      memberApp.use('/api/journeys', memberAuth, journeysRouter);

      await request(memberApp)
        .post('/api/journeys/templates')
        .send({
          name: 'Test Template',
          description: 'Test',
          difficulty: 'beginner',
          milestones: [{ name: 'Test', description: 'Test', order: 1 }]
        })
        .expect(403);
    });

    it('should allow mentors to approve milestones', async () => {
      const mentorApp = express();
      mentorApp.use(express.json());
      
      const mentorAuth = (req: any, res: any, next: any) => {
        req.user = { id: 'user-1', role: 'group_leader', email: 'mentor@test.com' };
        next();
      };
      
      mentorApp.use('/api/journeys', mentorAuth, journeysRouter);

      mockPrisma.memberJourney.findFirst.mockResolvedValue({
        id: 'journey-1',
        mentorId: 'user-1'
      });
      mockPrisma.milestoneProgress.upsert.mockResolvedValue({
        id: 'progress-1',
        status: 'approved'
      });

      await request(mentorApp)
        .put('/api/journeys/milestone/milestone-1/progress')
        .send({
          journeyId: 'journey-1',
          status: 'approved',
          feedback: 'Good work!'
        })
        .expect(200);
    });
  });
});
