import request from 'supertest';
import express from 'express';
import { groupsRouter } from '../groups';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

// Mock Prisma
const mockPrisma = {
  group: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  groupMember: {
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn()
  },
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn()
  }
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

// Mock auth middleware
const mockAuthMiddleware = (req: any, res: any, next: any) => {
  req.user = {
    id: 'user-1',
    role: 'admin',
    email: 'admin@test.com'
  };
  next();
};

describe('Groups API Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/groups', mockAuthMiddleware, groupsRouter);
    
    // Reset all mocks
    Object.values(mockPrisma.group).forEach(fn => jest.clearAllMocks());
    Object.values(mockPrisma.groupMember).forEach(fn => jest.clearAllMocks());
    Object.values(mockPrisma.user).forEach(fn => jest.clearAllMocks());
  });

  describe('GET /api/groups', () => {
    it('should return paginated groups list', async () => {
      const mockGroups = [
        {
          id: 'group-1',
          name: 'Youth Group',
          type: 'MINISTRY',
          description: 'Youth ministry group',
          isActive: true,
          _count: { members: 5 },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'group-2', 
          name: 'Life Group A',
          type: 'LIFEGROUP',
          description: 'Sunday life group',
          isActive: true,
          _count: { members: 8 },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockPrisma.group.findMany.mockResolvedValue(mockGroups);
      mockPrisma.group.count.mockResolvedValue(2);

      const response = await request(app)
        .get('/api/groups')
        .expect(200);

      expect(response.body.groups).toHaveLength(2);
      expect(response.body.total).toBe(2);
      expect(response.body.groups[0]).toMatchObject({
        id: 'group-1',
        name: 'Youth Group',
        type: 'MINISTRY'
      });
    });

    it('should filter groups by type', async () => {
      mockPrisma.group.findMany.mockResolvedValue([]);
      mockPrisma.group.count.mockResolvedValue(0);

      await request(app)
        .get('/api/groups?type=MINISTRY')
        .expect(200);

      expect(mockPrisma.group.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'MINISTRY'
          })
        })
      );
    });

    it('should search groups by name', async () => {
      mockPrisma.group.findMany.mockResolvedValue([]);
      mockPrisma.group.count.mockResolvedValue(0);

      await request(app)
        .get('/api/groups?search=youth')
        .expect(200);

      expect(mockPrisma.group.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: { contains: 'youth', mode: 'insensitive' }
          })
        })
      );
    });
  });

  describe('GET /api/groups/:id', () => {
    it('should return group details with members', async () => {
      const mockGroup = {
        id: 'group-1',
        name: 'Youth Group',
        type: 'MINISTRY',
        description: 'Youth ministry group',
        isActive: true,
        members: [
          {
            id: 'member-1',
            role: 'LEADER',
            user: {
              id: 'user-1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@test.com'
            }
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.group.findUnique.mockResolvedValue(mockGroup);

      const response = await request(app)
        .get('/api/groups/group-1')
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'group-1',
        name: 'Youth Group',
        type: 'MINISTRY'
      });
      expect(response.body.members).toHaveLength(1);
    });

    it('should return 404 for non-existent group', async () => {
      mockPrisma.group.findUnique.mockResolvedValue(null);

      await request(app)
        .get('/api/groups/non-existent')
        .expect(404);
    });
  });

  describe('POST /api/groups', () => {
    it('should create new group successfully', async () => {
      const newGroup = {
        name: 'New Life Group',
        type: 'LIFEGROUP',
        description: 'A new life group for young adults',
        location: 'Room 101'
      };

      const createdGroup = {
        id: 'group-new',
        ...newGroup,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.group.create.mockResolvedValue(createdGroup);

      const response = await request(app)
        .post('/api/groups')
        .send(newGroup)
        .expect(201);

      expect(response.body).toMatchObject({
        id: 'group-new',
        name: 'New Life Group',
        type: 'LIFEGROUP'
      });

      expect(mockPrisma.group.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: newGroup.name,
          type: newGroup.type,
          description: newGroup.description
        })
      });
    });

    it('should validate required fields', async () => {
      const invalidGroup = {
        description: 'Missing name and type'
      };

      await request(app)
        .post('/api/groups')
        .send(invalidGroup)
        .expect(400);
    });

    it('should handle duplicate group names', async () => {
      const duplicateGroup = {
        name: 'Existing Group',
        type: 'LIFEGROUP',
        description: 'Duplicate name test'
      };

      mockPrisma.group.create.mockRejectedValue(new Error('Unique constraint failed'));

      await request(app)
        .post('/api/groups')
        .send(duplicateGroup)
        .expect(400);
    });
  });

  describe('PUT /api/groups/:id', () => {
    it('should update group successfully', async () => {
      const updateData = {
        name: 'Updated Youth Group',
        description: 'Updated description',
        location: 'New Location'
      };

      const updatedGroup = {
        id: 'group-1',
        ...updateData,
        type: 'MINISTRY',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.group.findUnique.mockResolvedValue({ id: 'group-1' });
      mockPrisma.group.update.mockResolvedValue(updatedGroup);

      const response = await request(app)
        .put('/api/groups/group-1')
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'group-1',
        name: 'Updated Youth Group'
      });
    });

    it('should return 404 for non-existent group', async () => {
      mockPrisma.group.findUnique.mockResolvedValue(null);

      await request(app)
        .put('/api/groups/non-existent')
        .send({ name: 'Updated Name' })
        .expect(404);
    });
  });

  describe('DELETE /api/groups/:id', () => {
    it('should soft delete group', async () => {
      mockPrisma.group.findUnique.mockResolvedValue({ id: 'group-1', isActive: true });
      mockPrisma.group.update.mockResolvedValue({ id: 'group-1', isActive: false });

      await request(app)
        .delete('/api/groups/group-1')
        .expect(204);

      expect(mockPrisma.group.update).toHaveBeenCalledWith({
        where: { id: 'group-1' },
        data: { isActive: false }
      });
    });

    it('should return 404 for non-existent group', async () => {
      mockPrisma.group.findUnique.mockResolvedValue(null);

      await request(app)
        .delete('/api/groups/non-existent')
        .expect(404);
    });
  });

  describe('POST /api/groups/:id/members', () => {
    it('should add member to group', async () => {
      const memberData = {
        userId: 'user-2',
        role: 'MEMBER'
      };

      mockPrisma.group.findUnique.mockResolvedValue({ id: 'group-1' });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-2' });
      mockPrisma.groupMember.create.mockResolvedValue({
        id: 'member-1',
        groupId: 'group-1',
        userId: 'user-2',
        role: 'MEMBER'
      });

      await request(app)
        .post('/api/groups/group-1/members')
        .send(memberData)
        .expect(201);

      expect(mockPrisma.groupMember.create).toHaveBeenCalledWith({
        data: {
          groupId: 'group-1',
          userId: 'user-2',
          role: 'MEMBER'
        }
      });
    });

    it('should prevent duplicate memberships', async () => {
      mockPrisma.group.findUnique.mockResolvedValue({ id: 'group-1' });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-2' });
      mockPrisma.groupMember.create.mockRejectedValue(new Error('Unique constraint failed'));

      await request(app)
        .post('/api/groups/group-1/members')
        .send({ userId: 'user-2', role: 'MEMBER' })
        .expect(400);
    });
  });

  describe('DELETE /api/groups/:id/members/:userId', () => {
    it('should remove member from group', async () => {
      mockPrisma.groupMember.delete.mockResolvedValue({
        id: 'member-1',
        groupId: 'group-1',
        userId: 'user-2'
      });

      await request(app)
        .delete('/api/groups/group-1/members/user-2')
        .expect(204);

      expect(mockPrisma.groupMember.delete).toHaveBeenCalledWith({
        where: {
          groupId_userId: {
            groupId: 'group-1',
            userId: 'user-2'
          }
        }
      });
    });
  });

  describe('Authorization Tests', () => {
    it('should restrict group creation to authorized roles', async () => {
      const restrictedApp = express();
      restrictedApp.use(express.json());
      
      const memberAuthMiddleware = (req: any, res: any, next: any) => {
        req.user = { id: 'user-1', role: 'member', email: 'member@test.com' };
        next();
      };
      
      restrictedApp.use('/api/groups', memberAuthMiddleware, groupsRouter);

      await request(restrictedApp)
        .post('/api/groups')
        .send({
          name: 'Test Group',
          type: 'LIFEGROUP',
          description: 'Test'
        })
        .expect(403);
    });

    it('should allow group leaders to manage their groups', async () => {
      const leaderApp = express();
      leaderApp.use(express.json());
      
      const leaderAuthMiddleware = (req: any, res: any, next: any) => {
        req.user = { id: 'user-1', role: 'group_leader', email: 'leader@test.com' };
        next();
      };
      
      leaderApp.use('/api/groups', leaderAuthMiddleware, groupsRouter);

      mockPrisma.group.findUnique.mockResolvedValue({
        id: 'group-1',
        members: [{ userId: 'user-1', role: 'LEADER' }]
      });
      mockPrisma.group.update.mockResolvedValue({ id: 'group-1' });

      await request(leaderApp)
        .put('/api/groups/group-1')
        .send({ name: 'Updated Group Name' })
        .expect(200);
    });
  });
});
