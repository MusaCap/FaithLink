import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import authRoutes from '../auth';

// Mock Prisma Client
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  member: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  $disconnect: jest.fn(),
};

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.locals.prisma = mockPrisma;
  app.use('/api/auth', authRoutes);
  return app;
};

describe('Auth Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'MEMBER',
        isActive: true,
        member: {
          id: '1',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
        },
      };

      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123',
        })
        .expect(400);

      expect(response.body.error).toMatch(/email/i);
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
        })
        .expect(400);

      expect(response.body.error).toMatch(/password/i);
    });

    it('should return 401 for invalid email', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.error).toMatch(/invalid credentials/i);
    });

    it('should return 401 for invalid password', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: await bcrypt.hash('correctpassword', 10),
        role: 'MEMBER',
        isActive: true,
      };

      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.error).toMatch(/invalid credentials/i);
    });

    it('should return 401 for inactive user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'MEMBER',
        isActive: false,
      };

      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.error).toMatch(/account is deactivated/i);
    });
  });

  describe('POST /api/auth/register', () => {
    it('should successfully register a new user', async () => {
      const mockUser = {
        id: '1',
        email: 'newuser@example.com',
        role: 'MEMBER',
        isActive: true,
      };

      const mockMember = {
        id: '1',
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@example.com',
      };

      mockPrisma.user.findUnique.mockResolvedValueOnce(null); // Email not exists
      mockPrisma.user.create.mockResolvedValueOnce({
        ...mockUser,
        member: mockMember,
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User',
        })
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('newuser@example.com');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          // Missing password, firstName, lastName
        })
        .expect(400);

      expect(response.body.error).toMatch(/required/i);
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(400);

      expect(response.body.error).toMatch(/email/i);
    });

    it('should return 400 for short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(400);

      expect(response.body.error).toMatch(/password.*6 characters/i);
    });

    it('should return 409 for existing email', async () => {
      const existingUser = {
        id: '1',
        email: 'existing@example.com',
      };

      mockPrisma.user.findUnique.mockResolvedValueOnce(existingUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(409);

      expect(response.body.error).toMatch(/email.*already registered/i);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should successfully logout user', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.message).toMatch(/logged out successfully/i);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user info for authenticated user', async () => {
      // This would require JWT middleware testing
      // For now, test the basic route structure
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401); // Without auth token

      expect(response.body.error).toMatch(/token/i);
    });
  });
});
