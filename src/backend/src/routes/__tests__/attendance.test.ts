import request from 'supertest';
import express from 'express';
import { attendanceRouter } from '../attendance';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
const mockPrisma = {
  attendanceSession: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  attendance: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn()
  },
  group: {
    findUnique: jest.fn(),
    findMany: jest.fn()
  },
  member: {
    findUnique: jest.fn(),
    findMany: jest.fn()
  },
  groupMember: {
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

describe('Attendance API Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.locals.prisma = mockPrisma;
    app.use('/api/attendance', mockAuthMiddleware, attendanceRouter);
    
    // Reset all mocks
    Object.values(mockPrisma).forEach(model => {
      Object.values(model).forEach(fn => jest.clearAllMocks());
    });
  });

  describe('GET /api/attendance/sessions', () => {
    it('should return paginated attendance sessions', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          groupId: 'group-1',
          date: new Date('2024-01-15'),
          location: 'Main Hall',
          recordedById: 'member-1',
          notes: 'Regular Sunday service',
          group: {
            id: 'group-1',
            name: 'Sunday Service',
            type: 'SERVICE'
          },
          recordedBy: {
            id: 'member-1',
            firstName: 'John',
            lastName: 'Pastor',
            email: 'pastor@church.com'
          },
          _count: {
            attendances: 25
          }
        }
      ];

      mockPrisma.attendanceSession.findMany.mockResolvedValue(mockSessions);
      mockPrisma.attendanceSession.count.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/attendance/sessions')
        .expect(200);

      expect(response.body.sessions).toHaveLength(1);
      expect(response.body.total).toBe(1);
      expect(response.body.sessions[0]).toMatchObject({
        id: 'session-1',
        groupId: 'group-1',
        attendanceCount: 25
      });
    });

    it('should filter sessions by group and date range', async () => {
      mockPrisma.attendanceSession.findMany.mockResolvedValue([]);
      mockPrisma.attendanceSession.count.mockResolvedValue(0);

      await request(app)
        .get('/api/attendance/sessions?groupId=group-1&startDate=2024-01-01&endDate=2024-01-31')
        .expect(200);

      expect(mockPrisma.attendanceSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            groupId: 'group-1',
            date: {
              gte: new Date('2024-01-01'),
              lte: new Date('2024-01-31')
            }
          })
        })
      );
    });
  });

  describe('GET /api/attendance/sessions/:id', () => {
    it('should return session details with attendance records', async () => {
      const mockSession = {
        id: 'session-1',
        groupId: 'group-1',
        date: new Date('2024-01-15'),
        location: 'Main Hall',
        notes: 'Regular service',
        group: {
          id: 'group-1',
          name: 'Sunday Service',
          type: 'SERVICE'
        },
        recordedBy: {
          id: 'member-1',
          firstName: 'John',
          lastName: 'Pastor',
          email: 'pastor@church.com'
        },
        attendances: [
          {
            id: 'att-1',
            status: 'PRESENT',
            notes: null,
            member: {
              id: 'member-2',
              firstName: 'Jane',
              lastName: 'Doe',
              email: 'jane@email.com',
              phone: '555-0123'
            }
          },
          {
            id: 'att-2',
            status: 'ABSENT',
            notes: 'Sick',
            member: {
              id: 'member-3',
              firstName: 'Bob',
              lastName: 'Smith',
              email: 'bob@email.com',
              phone: '555-0124'
            }
          }
        ]
      };

      mockPrisma.attendanceSession.findUnique.mockResolvedValue(mockSession);

      const response = await request(app)
        .get('/api/attendance/sessions/session-1')
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'session-1',
        groupId: 'group-1',
        statistics: {
          totalMembers: 2,
          present: 1,
          absent: 1,
          late: 0,
          excused: 0,
          attendanceRate: 50
        }
      });
    });

    it('should return 404 for non-existent session', async () => {
      mockPrisma.attendanceSession.findUnique.mockResolvedValue(null);

      await request(app)
        .get('/api/attendance/sessions/non-existent')
        .expect(404);
    });
  });

  describe('POST /api/attendance/sessions', () => {
    it('should create new attendance session', async () => {
      const sessionData = {
        groupId: 'group-1',
        date: '2024-01-15T10:00:00Z',
        location: 'Main Hall',
        notes: 'Regular Sunday service',
        recordedById: 'member-1'
      };

      const mockGroup = {
        id: 'group-1',
        name: 'Sunday Service',
        members: [
          {
            role: 'leader',
            member: { userId: 'user-1' }
          }
        ]
      };

      const createdSession = {
        id: 'session-new',
        ...sessionData,
        date: new Date(sessionData.date),
        group: {
          id: 'group-1',
          name: 'Sunday Service',
          type: 'SERVICE'
        },
        recordedBy: {
          id: 'member-1',
          firstName: 'John',
          lastName: 'Pastor',
          email: 'pastor@church.com'
        }
      };

      mockPrisma.group.findUnique.mockResolvedValue(mockGroup);
      mockPrisma.attendanceSession.create.mockResolvedValue(createdSession);

      const response = await request(app)
        .post('/api/attendance/sessions')
        .send(sessionData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: 'session-new',
        groupId: 'group-1',
        location: 'Main Hall'
      });
    });

    it('should validate required fields', async () => {
      const invalidSession = {
        location: 'Main Hall',
        notes: 'Missing required fields'
      };

      await request(app)
        .post('/api/attendance/sessions')
        .send(invalidSession)
        .expect(400);
    });

    it('should check group permissions', async () => {
      const sessionData = {
        groupId: 'group-1',
        date: '2024-01-15T10:00:00Z',
        recordedById: 'member-1'
      };

      const mockGroup = {
        id: 'group-1',
        members: [] // User not a member of group
      };

      mockPrisma.group.findUnique.mockResolvedValue(mockGroup);

      const memberApp = express();
      memberApp.use(express.json());
      memberApp.locals.prisma = mockPrisma;
      
      const memberAuth = (req: any, res: any, next: any) => {
        req.user = { id: 'user-2', role: 'member', memberId: 'member-2' };
        next();
      };
      
      memberApp.use('/api/attendance', memberAuth, attendanceRouter);

      await request(memberApp)
        .post('/api/attendance/sessions')
        .send(sessionData)
        .expect(403);
    });
  });

  describe('POST /api/attendance/sessions/:id/record', () => {
    it('should record attendance for session members', async () => {
      const attendanceData = {
        attendances: [
          {
            memberId: 'member-2',
            status: 'PRESENT',
            notes: null
          },
          {
            memberId: 'member-3',
            status: 'LATE',
            notes: 'Traffic delay'
          }
        ]
      };

      const mockSession = {
        id: 'session-1',
        groupId: 'group-1',
        group: {
          members: [
            {
              role: 'leader',
              member: { userId: 'user-1' }
            }
          ]
        }
      };

      const mockGroupMembers = [
        { groupId: 'group-1', memberId: 'member-2' },
        { groupId: 'group-1', memberId: 'member-3' }
      ];

      const createdAttendances = [
        {
          id: 'att-1',
          sessionId: 'session-1',
          memberId: 'member-2',
          status: 'PRESENT',
          member: {
            id: 'member-2',
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@email.com'
          }
        },
        {
          id: 'att-2',
          sessionId: 'session-1',
          memberId: 'member-3',
          status: 'LATE',
          member: {
            id: 'member-3',
            firstName: 'Bob',
            lastName: 'Smith',
            email: 'bob@email.com'
          }
        }
      ];

      mockPrisma.attendanceSession.findUnique.mockResolvedValue(mockSession);
      mockPrisma.groupMember.findMany.mockResolvedValue(mockGroupMembers);
      mockPrisma.attendance.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.attendance.createMany.mockResolvedValue({ count: 2 });
      mockPrisma.attendance.findMany.mockResolvedValue(createdAttendances);

      const response = await request(app)
        .post('/api/attendance/sessions/session-1/record')
        .send(attendanceData)
        .expect(201);

      expect(response.body.message).toContain('Successfully recorded attendance for 2 member(s)');
      expect(response.body.attendances).toHaveLength(2);
    });

    it('should validate member belongs to group', async () => {
      const attendanceData = {
        attendances: [
          {
            memberId: 'non-member',
            status: 'PRESENT'
          }
        ]
      };

      const mockSession = {
        id: 'session-1',
        groupId: 'group-1',
        group: {
          members: [
            {
              role: 'leader',
              member: { userId: 'user-1' }
            }
          ]
        }
      };

      mockPrisma.attendanceSession.findUnique.mockResolvedValue(mockSession);
      mockPrisma.groupMember.findMany.mockResolvedValue([]); // No matching group members

      await request(app)
        .post('/api/attendance/sessions/session-1/record')
        .send(attendanceData)
        .expect(400);
    });
  });

  describe('GET /api/attendance/members/:memberId', () => {
    it('should return member attendance history', async () => {
      const mockAttendances = [
        {
          id: 'att-1',
          status: 'PRESENT',
          notes: null,
          session: {
            id: 'session-1',
            date: new Date('2024-01-15'),
            location: 'Main Hall',
            group: {
              id: 'group-1',
              name: 'Sunday Service',
              type: 'SERVICE'
            }
          }
        },
        {
          id: 'att-2',
          status: 'ABSENT',
          notes: 'Sick',
          session: {
            id: 'session-2',
            date: new Date('2024-01-08'),
            location: 'Main Hall',
            group: {
              id: 'group-1',
              name: 'Sunday Service',
              type: 'SERVICE'
            }
          }
        }
      ];

      mockPrisma.attendance.findMany.mockResolvedValue(mockAttendances);
      mockPrisma.attendance.count.mockResolvedValue(2);

      const response = await request(app)
        .get('/api/attendance/members/member-1')
        .expect(200);

      expect(response.body.attendances).toHaveLength(2);
      expect(response.body.statistics).toMatchObject({
        total: 2,
        present: 1,
        absent: 1,
        late: 0,
        excused: 0,
        attendanceRate: 50
      });
    });

    it('should filter by group and status', async () => {
      mockPrisma.attendance.findMany.mockResolvedValue([]);
      mockPrisma.attendance.count.mockResolvedValue(0);

      await request(app)
        .get('/api/attendance/members/member-1?groupId=group-1&status=PRESENT')
        .expect(200);

      expect(mockPrisma.attendance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            memberId: 'member-1',
            status: 'PRESENT',
            session: expect.objectContaining({
              groupId: 'group-1'
            })
          })
        })
      );
    });
  });

  describe('GET /api/attendance/groups/:groupId/stats', () => {
    it('should return group attendance statistics', async () => {
      const mockStats = [
        { status: 'PRESENT', _count: { status: 15 } },
        { status: 'ABSENT', _count: { status: 3 } },
        { status: 'LATE', _count: { status: 2 } }
      ];

      const mockRecentSessions = [
        {
          id: 'session-1',
          date: new Date('2024-01-15'),
          location: 'Main Hall',
          _count: { attendances: 20 }
        }
      ];

      mockPrisma.attendanceSession.count.mockResolvedValue(10);
      mockPrisma.attendance.count.mockResolvedValue(20);
      mockPrisma.attendance.groupBy.mockResolvedValue(mockStats);
      mockPrisma.attendanceSession.findMany.mockResolvedValue(mockRecentSessions);

      const response = await request(app)
        .get('/api/attendance/groups/group-1/stats')
        .expect(200);

      expect(response.body).toMatchObject({
        totalSessions: 10,
        totalAttendances: 20,
        attendanceRate: 85,
        statusBreakdown: {
          present: 15,
          absent: 3,
          late: 2,
          excused: 0
        }
      });
    });
  });

  describe('Authorization Tests', () => {
    it('should require group leader role for creating sessions', async () => {
      const memberApp = express();
      memberApp.use(express.json());
      memberApp.locals.prisma = mockPrisma;
      
      const memberAuth = (req: any, res: any, next: any) => {
        req.user = { id: 'user-2', role: 'member', memberId: 'member-2' };
        next();
      };
      
      memberApp.use('/api/attendance', memberAuth, attendanceRouter);

      const sessionData = {
        groupId: 'group-1',
        date: '2024-01-15T10:00:00Z',
        recordedById: 'member-2'
      };

      const mockGroup = {
        id: 'group-1',
        members: [] // Not a group leader
      };

      mockPrisma.group.findUnique.mockResolvedValue(mockGroup);

      await request(memberApp)
        .post('/api/attendance/sessions')
        .send(sessionData)
        .expect(403);
    });

    it('should allow group leaders to record attendance', async () => {
      const leaderApp = express();
      leaderApp.use(express.json());
      leaderApp.locals.prisma = mockPrisma;
      
      const leaderAuth = (req: any, res: any, next: any) => {
        req.user = { id: 'user-2', role: 'group_leader', memberId: 'member-2' };
        next();
      };
      
      leaderApp.use('/api/attendance', leaderAuth, attendanceRouter);

      const mockSession = {
        id: 'session-1',
        groupId: 'group-1',
        group: {
          members: [
            {
              role: 'leader',
              member: { userId: 'user-2' }
            }
          ]
        }
      };

      mockPrisma.attendanceSession.findUnique.mockResolvedValue(mockSession);
      mockPrisma.groupMember.findMany.mockResolvedValue([
        { groupId: 'group-1', memberId: 'member-3' }
      ]);
      mockPrisma.attendance.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.attendance.createMany.mockResolvedValue({ count: 1 });
      mockPrisma.attendance.findMany.mockResolvedValue([]);

      await request(leaderApp)
        .post('/api/attendance/sessions/session-1/record')
        .send({
          attendances: [
            { memberId: 'member-3', status: 'PRESENT' }
          ]
        })
        .expect(201);
    });
  });
});
