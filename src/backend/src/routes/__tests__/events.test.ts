import request from 'supertest';
import express from 'express';
import { eventsRouter } from '../events';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
const mockPrisma = {
  event: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn()
  },
  eventRegistration: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn()
  },
  member: {
    findUnique: jest.fn(),
    findMany: jest.fn()
  },
  group: {
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
    email: 'admin@test.com',
    memberId: 'member-1'
  };
  next();
};

describe('Events API Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.locals.prisma = mockPrisma;
    app.use('/api/events', mockAuthMiddleware, eventsRouter);
    
    // Reset all mocks
    Object.values(mockPrisma).forEach(model => {
      Object.values(model).forEach(fn => jest.clearAllMocks());
    });
  });

  describe('GET /api/events', () => {
    it('should return paginated events', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          title: 'Sunday Service',
          description: 'Weekly worship service',
          location: 'Main Sanctuary',
          startDateTime: new Date('2024-01-21T10:00:00Z'),
          endDateTime: new Date('2024-01-21T11:30:00Z'),
          type: 'SERVICE',
          isPublic: true,
          registrationRequired: false,
          maxAttendees: null,
          organizerId: 'member-1',
          organizer: {
            id: 'member-1',
            firstName: 'John',
            lastName: 'Pastor',
            email: 'pastor@church.com'
          },
          group: null,
          _count: {
            registrations: 0
          }
        }
      ];

      mockPrisma.event.findMany.mockResolvedValue(mockEvents);
      mockPrisma.event.count.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/events')
        .expect(200);

      expect(response.body.events).toHaveLength(1);
      expect(response.body.total).toBe(1);
      expect(response.body.events[0]).toMatchObject({
        id: 'event-1',
        title: 'Sunday Service',
        type: 'SERVICE',
        registrationCount: 0,
        spotsRemaining: null
      });
    });

    it('should filter events by type and date range', async () => {
      mockPrisma.event.findMany.mockResolvedValue([]);
      mockPrisma.event.count.mockResolvedValue(0);

      await request(app)
        .get('/api/events?type=MEETING&startDate=2024-01-01&endDate=2024-01-31&upcoming=true')
        .expect(200);

      expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'MEETING',
            startDateTime: expect.objectContaining({
              gte: expect.any(Date)
            })
          })
        })
      );
    });

    it('should search events by title and description', async () => {
      mockPrisma.event.findMany.mockResolvedValue([]);
      mockPrisma.event.count.mockResolvedValue(0);

      await request(app)
        .get('/api/events?search=prayer')
        .expect(200);

      expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { title: { contains: 'prayer', mode: 'insensitive' } },
              { description: { contains: 'prayer', mode: 'insensitive' } },
              { location: { contains: 'prayer', mode: 'insensitive' } }
            ])
          })
        })
      );
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return event details with registration info', async () => {
      const mockEvent = {
        id: 'event-1',
        title: 'Prayer Meeting',
        description: 'Weekly prayer gathering',
        location: 'Prayer Room',
        startDateTime: new Date('2024-01-24T19:00:00Z'),
        endDateTime: new Date('2024-01-24T20:30:00Z'),
        type: 'MEETING',
        isPublic: true,
        registrationRequired: true,
        maxAttendees: 20,
        registrationDeadline: new Date('2024-01-23T23:59:59Z'),
        organizerId: 'member-1',
        organizer: {
          id: 'member-1',
          firstName: 'Jane',
          lastName: 'Leader',
          email: 'leader@church.com',
          phone: '555-0123'
        },
        group: {
          id: 'group-1',
          name: 'Prayer Warriors',
          type: 'MINISTRY',
          description: 'Dedicated prayer group'
        },
        registrations: [
          {
            id: 'reg-1',
            memberId: 'member-2',
            registeredAt: new Date(),
            member: {
              id: 'member-2',
              firstName: 'Bob',
              lastName: 'Member',
              email: 'bob@email.com',
              phone: '555-0124'
            }
          }
        ]
      };

      mockPrisma.event.findUnique.mockResolvedValue(mockEvent);

      const response = await request(app)
        .get('/api/events/event-1')
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'event-1',
        title: 'Prayer Meeting',
        registrationCount: 1,
        spotsRemaining: 19,
        isRegistered: false,
        canEdit: true,
        canRegister: true
      });
    });

    it('should return 404 for non-existent event', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null);

      await request(app)
        .get('/api/events/non-existent')
        .expect(404);
    });
  });

  describe('POST /api/events', () => {
    it('should create new event with valid data', async () => {
      const eventData = {
        title: 'Youth Retreat',
        description: 'Annual youth spiritual retreat',
        location: 'Camp Sunshine',
        startDateTime: '2024-02-15T09:00:00Z',
        endDateTime: '2024-02-17T15:00:00Z',
        type: 'SOCIAL',
        isPublic: true,
        maxAttendees: 50,
        registrationRequired: true,
        registrationDeadline: '2024-02-10T23:59:59Z',
        organizerId: 'member-1',
        groupId: 'group-1',
        tags: ['youth', 'retreat']
      };

      const mockOrganizer = {
        id: 'member-1',
        userId: 'user-1'
      };

      const mockGroup = {
        id: 'group-1',
        members: [
          {
            role: 'leader',
            member: { userId: 'user-1' }
          }
        ]
      };

      const createdEvent = {
        id: 'event-new',
        ...eventData,
        startDateTime: new Date(eventData.startDateTime),
        endDateTime: new Date(eventData.endDateTime),
        registrationDeadline: new Date(eventData.registrationDeadline),
        organizer: {
          id: 'member-1',
          firstName: 'John',
          lastName: 'Leader',
          email: 'leader@church.com'
        },
        group: {
          id: 'group-1',
          name: 'Youth Group',
          type: 'MINISTRY'
        }
      };

      mockPrisma.member.findUnique.mockResolvedValue(mockOrganizer);
      mockPrisma.group.findUnique.mockResolvedValue(mockGroup);
      mockPrisma.event.create.mockResolvedValue(createdEvent);

      const response = await request(app)
        .post('/api/events')
        .send(eventData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: 'event-new',
        title: 'Youth Retreat',
        type: 'SOCIAL',
        maxAttendees: 50
      });
    });

    it('should validate event date logic', async () => {
      const invalidEventData = {
        title: 'Invalid Event',
        startDateTime: '2024-02-15T15:00:00Z',
        endDateTime: '2024-02-15T09:00:00Z', // End before start
        organizerId: 'member-1'
      };

      const mockOrganizer = {
        id: 'member-1',
        userId: 'user-1'
      };

      mockPrisma.member.findUnique.mockResolvedValue(mockOrganizer);

      await request(app)
        .post('/api/events')
        .send(invalidEventData)
        .expect(400);
    });

    it('should validate registration deadline logic', async () => {
      const eventData = {
        title: 'Test Event',
        startDateTime: '2024-02-15T15:00:00Z',
        endDateTime: '2024-02-15T17:00:00Z',
        registrationDeadline: '2024-02-15T16:00:00Z', // After start time
        organizerId: 'member-1'
      };

      const mockOrganizer = {
        id: 'member-1',
        userId: 'user-1'
      };

      mockPrisma.member.findUnique.mockResolvedValue(mockOrganizer);

      await request(app)
        .post('/api/events')
        .send(eventData)
        .expect(400);
    });

    it('should check group permissions', async () => {
      const eventData = {
        title: 'Group Event',
        startDateTime: '2024-02-15T15:00:00Z',
        endDateTime: '2024-02-15T17:00:00Z',
        organizerId: 'member-1',
        groupId: 'group-1'
      };

      const mockOrganizer = {
        id: 'member-1',
        userId: 'user-1'
      };

      const mockGroup = {
        id: 'group-1',
        members: [] // User not a group leader
      };

      mockPrisma.member.findUnique.mockResolvedValue(mockOrganizer);
      mockPrisma.group.findUnique.mockResolvedValue(mockGroup);

      const memberApp = express();
      memberApp.use(express.json());
      memberApp.locals.prisma = mockPrisma;
      
      const memberAuth = (req: any, res: any, next: any) => {
        req.user = { id: 'user-1', role: 'member', memberId: 'member-1' };
        next();
      };
      
      memberApp.use('/api/events', memberAuth, eventsRouter);

      await request(memberApp)
        .post('/api/events')
        .send(eventData)
        .expect(403);
    });
  });

  describe('PUT /api/events/:id', () => {
    it('should update event details', async () => {
      const updateData = {
        title: 'Updated Event Title',
        description: 'Updated description',
        location: 'New Location'
      };

      const existingEvent = {
        id: 'event-1',
        organizerId: 'member-1',
        startDateTime: new Date('2024-02-15T15:00:00Z'),
        endDateTime: new Date('2024-02-15T17:00:00Z')
      };

      const updatedEvent = {
        ...existingEvent,
        ...updateData,
        organizer: {
          id: 'member-1',
          firstName: 'John',
          lastName: 'Leader',
          email: 'leader@church.com'
        },
        group: null,
        _count: {
          registrations: 5
        }
      };

      mockPrisma.event.findUnique.mockResolvedValue(existingEvent);
      mockPrisma.event.update.mockResolvedValue(updatedEvent);

      const response = await request(app)
        .put('/api/events/event-1')
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        title: 'Updated Event Title',
        description: 'Updated description',
        location: 'New Location',
        registrationCount: 5,
        spotsRemaining: null
      });
    });

    it('should check update permissions', async () => {
      const existingEvent = {
        id: 'event-1',
        organizerId: 'member-2' // Different organizer
      };

      mockPrisma.event.findUnique.mockResolvedValue(existingEvent);

      const memberApp = express();
      memberApp.use(express.json());
      memberApp.locals.prisma = mockPrisma;
      
      const memberAuth = (req: any, res: any, next: any) => {
        req.user = { id: 'user-1', role: 'member', memberId: 'member-1' };
        next();
      };
      
      memberApp.use('/api/events', memberAuth, eventsRouter);

      await request(memberApp)
        .put('/api/events/event-1')
        .send({ title: 'Unauthorized Update' })
        .expect(403);
    });
  });

  describe('POST /api/events/:id/register', () => {
    it('should register member for event', async () => {
      const registrationData = {
        memberId: 'member-1',
        notes: 'Looking forward to this event!'
      };

      const mockEvent = {
        id: 'event-1',
        registrationRequired: true,
        maxAttendees: 50,
        registrationDeadline: new Date('2024-12-31T23:59:59Z'),
        _count: {
          registrations: 10
        }
      };

      const createdRegistration = {
        id: 'reg-new',
        eventId: 'event-1',
        memberId: 'member-1',
        notes: registrationData.notes,
        registeredAt: new Date(),
        member: {
          id: 'member-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@email.com'
        },
        event: {
          id: 'event-1',
          title: 'Test Event',
          startDateTime: new Date('2024-02-15T15:00:00Z'),
          location: 'Test Location'
        }
      };

      mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
      mockPrisma.eventRegistration.findUnique.mockResolvedValue(null); // Not already registered
      mockPrisma.eventRegistration.create.mockResolvedValue(createdRegistration);

      const response = await request(app)
        .post('/api/events/event-1/register')
        .send(registrationData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: 'reg-new',
        memberId: 'member-1',
        notes: registrationData.notes
      });
    });

    it('should prevent duplicate registration', async () => {
      const mockEvent = {
        id: 'event-1',
        registrationRequired: true,
        _count: { registrations: 10 }
      };

      const existingRegistration = {
        id: 'reg-1',
        eventId: 'event-1',
        memberId: 'member-1'
      };

      mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
      mockPrisma.eventRegistration.findUnique.mockResolvedValue(existingRegistration);

      await request(app)
        .post('/api/events/event-1/register')
        .send({ memberId: 'member-1' })
        .expect(400);
    });

    it('should prevent registration when event is full', async () => {
      const mockEvent = {
        id: 'event-1',
        registrationRequired: true,
        maxAttendees: 20,
        _count: { registrations: 20 } // Event is full
      };

      mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
      mockPrisma.eventRegistration.findUnique.mockResolvedValue(null);

      await request(app)
        .post('/api/events/event-1/register')
        .send({ memberId: 'member-1' })
        .expect(400);
    });

    it('should prevent registration after deadline', async () => {
      const mockEvent = {
        id: 'event-1',
        registrationRequired: true,
        registrationDeadline: new Date('2020-01-01T00:00:00Z'), // Past deadline
        _count: { registrations: 5 }
      };

      mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
      mockPrisma.eventRegistration.findUnique.mockResolvedValue(null);

      await request(app)
        .post('/api/events/event-1/register')
        .send({ memberId: 'member-1' })
        .expect(400);
    });
  });

  describe('DELETE /api/events/:id/register', () => {
    it('should cancel event registration', async () => {
      const existingRegistration = {
        id: 'reg-1',
        eventId: 'event-1',
        memberId: 'member-1'
      };

      mockPrisma.eventRegistration.findUnique.mockResolvedValue(existingRegistration);
      mockPrisma.eventRegistration.delete.mockResolvedValue(existingRegistration);

      await request(app)
        .delete('/api/events/event-1/register')
        .expect(204);

      expect(mockPrisma.eventRegistration.delete).toHaveBeenCalledWith({
        where: {
          eventId_memberId: {
            eventId: 'event-1',
            memberId: 'member-1'
          }
        }
      });
    });

    it('should return 404 for non-existent registration', async () => {
      mockPrisma.eventRegistration.findUnique.mockResolvedValue(null);

      await request(app)
        .delete('/api/events/event-1/register')
        .expect(404);
    });
  });

  describe('GET /api/events/members/:memberId', () => {
    it('should return member event registrations', async () => {
      const mockRegistrations = [
        {
          id: 'reg-1',
          eventId: 'event-1',
          memberId: 'member-1',
          registeredAt: new Date(),
          notes: 'Excited to attend!',
          event: {
            id: 'event-1',
            title: 'Prayer Meeting',
            startDateTime: new Date('2024-02-15T19:00:00Z'),
            location: 'Prayer Room',
            type: 'MEETING',
            organizer: {
              id: 'member-2',
              firstName: 'Jane',
              lastName: 'Leader',
              email: 'leader@church.com'
            },
            group: null
          }
        }
      ];

      mockPrisma.eventRegistration.findMany.mockResolvedValue(mockRegistrations);
      mockPrisma.eventRegistration.count.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/events/members/member-1')
        .expect(200);

      expect(response.body.registrations).toHaveLength(1);
      expect(response.body.registrations[0]).toMatchObject({
        id: 'reg-1',
        event: {
          title: 'Prayer Meeting',
          type: 'MEETING'
        }
      });
    });

    it('should filter upcoming events only', async () => {
      mockPrisma.eventRegistration.findMany.mockResolvedValue([]);
      mockPrisma.eventRegistration.count.mockResolvedValue(0);

      await request(app)
        .get('/api/events/members/member-1?upcoming=true')
        .expect(200);

      expect(mockPrisma.eventRegistration.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            memberId: 'member-1',
            event: expect.objectContaining({
              startDateTime: expect.objectContaining({
                gte: expect.any(Date)
              })
            })
          })
        })
      );
    });
  });

  describe('GET /api/events/stats', () => {
    it('should return event statistics', async () => {
      const mockTypeStats = [
        { type: 'SERVICE', _count: { type: 52 } },
        { type: 'MEETING', _count: { type: 24 } },
        { type: 'SOCIAL', _count: { type: 12 } }
      ];

      const mockRecentEvents = [
        {
          id: 'event-1',
          title: 'Sunday Service',
          startDateTime: new Date('2024-01-28T10:00:00Z'),
          type: 'SERVICE',
          _count: { registrations: 150 }
        }
      ];

      mockPrisma.event.count
        .mockResolvedValueOnce(100) // Total events
        .mockResolvedValueOnce(25); // Upcoming events
      mockPrisma.eventRegistration.count.mockResolvedValue(500);
      mockPrisma.event.groupBy.mockResolvedValue(mockTypeStats);
      mockPrisma.event.findMany.mockResolvedValue(mockRecentEvents);

      const response = await request(app)
        .get('/api/events/stats')
        .expect(200);

      expect(response.body).toMatchObject({
        total: 100,
        upcoming: 25,
        registrations: 500,
        typeBreakdown: {
          service: 52,
          meeting: 24,
          social: 12,
          outreach: 0,
          education: 0,
          other: 0
        }
      });
    });
  });

  describe('Authorization Tests', () => {
    it('should restrict event creation to authorized roles', async () => {
      const memberApp = express();
      memberApp.use(express.json());
      memberApp.locals.prisma = mockPrisma;
      
      const memberAuth = (req: any, res: any, next: any) => {
        req.user = { id: 'user-2', role: 'member', memberId: 'member-2' };
        next();
      };
      
      memberApp.use('/api/events', memberAuth, eventsRouter);

      const eventData = {
        title: 'Test Event',
        startDateTime: '2024-02-15T15:00:00Z',
        endDateTime: '2024-02-15T17:00:00Z',
        organizerId: 'member-3' // Different organizer
      };

      const mockOrganizer = {
        id: 'member-3',
        userId: 'user-3' // Different user
      };

      mockPrisma.member.findUnique.mockResolvedValue(mockOrganizer);

      await request(memberApp)
        .post('/api/events')
        .send(eventData)
        .expect(403);
    });

    it('should allow pastors to create events for others', async () => {
      const pastorApp = express();
      pastorApp.use(express.json());
      pastorApp.locals.prisma = mockPrisma;
      
      const pastorAuth = (req: any, res: any, next: any) => {
        req.user = { id: 'user-1', role: 'pastor', memberId: 'member-1' };
        next();
      };
      
      pastorApp.use('/api/events', pastorAuth, eventsRouter);

      const eventData = {
        title: 'Church Event',
        startDateTime: '2024-02-15T15:00:00Z',
        endDateTime: '2024-02-15T17:00:00Z',
        organizerId: 'member-2' // Different organizer
      };

      const mockOrganizer = {
        id: 'member-2',
        userId: 'user-2'
      };

      const createdEvent = {
        id: 'event-new',
        ...eventData,
        startDateTime: new Date(eventData.startDateTime),
        endDateTime: new Date(eventData.endDateTime),
        organizer: {
          id: 'member-2',
          firstName: 'John',
          lastName: 'Leader',
          email: 'leader@church.com'
        },
        group: null
      };

      mockPrisma.member.findUnique.mockResolvedValue(mockOrganizer);
      mockPrisma.event.create.mockResolvedValue(createdEvent);

      await request(pastorApp)
        .post('/api/events')
        .send(eventData)
        .expect(201);
    });
  });
});
