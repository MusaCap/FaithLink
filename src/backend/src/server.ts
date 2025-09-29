import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import 'express-async-errors';

// Debug: Catch unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  process.exit(1);
});

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Prisma Client
const prisma = new PrismaClient({
  log: ['error'], // Reduced logging to prevent startup hang
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for development
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001', // For testing
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Cookie',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
}));

// Rate limiting (very lenient for development)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: process.env.NODE_ENV === 'production' ? 100 : 10000, // Very lenient in development
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development', // Skip rate limiting in development
});

// Only apply rate limiting in production
if (process.env.NODE_ENV === 'production') {
  app.use('/api/', limiter);
}

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  strict: true
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));
app.use(cookieParser());

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Make Prisma client available to routes
app.locals.prisma = prisma;

// Health check endpoint (database check temporarily disabled)
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'FaithLink360 API',
      version: '1.0.0',
      database: 'Connected',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      service: 'FaithLink360 API',
      database: 'Disconnected',
      error: 'Database connection failed'
    });
  }
});

// Import API routes
import authRoutes from './routes/auth'; // Fixed: removed direct PrismaClient import
import memberRoutes from './routes/members'; // Re-enabled: startup hang resolved
import groupRoutes from './routes/groups'; // Groups API implementation
import journeyRoutes from './routes/journeys'; // Journey Templates API implementation
import attendanceRoutes from './routes/attendance'; // Attendance API implementation
import eventRoutes from './routes/events'; // Events API implementation
import careRoutes from './routes/care'; // Care Logs API implementation

// API Routes
app.use('/api/auth', authRoutes); // Re-enabled with fixed auth routes
app.use('/api/members', memberRoutes); // Re-enabled: startup hang resolved
app.use('/api/groups', groupRoutes); // Groups API with full CRUD operations
app.use('/api/journeys', journeyRoutes); // Journey Templates API with full CRUD operations
app.use('/api/attendance', attendanceRoutes); // Attendance API with session and member tracking
app.use('/api/events', eventRoutes); // Events API with full CRUD and registration system
app.use('/api/care', careRoutes); // Care Logs API with pastoral care tracking

// Placeholder API endpoints for initial testing
app.get('/api/test', (req, res) => {
  res.json({
    message: 'FaithLink360 API is running!',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /health - Service health check',
      'GET /api/test - API test endpoint',
      // Future endpoints:
      // 'POST /api/auth/login - User authentication',
      // 'GET /api/members - List members',
      // 'GET /api/groups - List groups',
    ]
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    message: 'The requested endpoint does not exist',
    availableEndpoints: ['/health', '/api/test']
  });
});

// Global error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'UnauthorizedError' || err.status === 401) {
    return res.status(401).json({
      error: 'Unauthorized access',
      message: 'Valid authentication required',
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'ForbiddenError' || err.status === 403) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Insufficient permissions',
      timestamp: new Date().toISOString()
    });
  }

  if (err.code === 'P2002') { // Prisma unique constraint error
    return res.status(409).json({
      error: 'Duplicate entry',
      message: 'A record with this information already exists',
      timestamp: new Date().toISOString()
    });
  }

  // Default server error
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown - DISABLED FOR DEBUG
// const gracefulShutdown = (signal: string) => {
//   console.log(`🔄 Graceful shutdown initiated...`);
//   server.close(() => {
//     console.log('📊 Database connection closed');
//     prisma.$disconnect();
//     process.exit(0);
//   });
// };

// process.on('SIGINT', gracefulShutdown);
// process.on('SIGTERM', gracefulShutdown);
// Graceful shutdown handlers disabled for debugging

// Start the server
const server = app.listen(PORT, () => {
  console.log(`🚀 FaithLink360 API server started successfully!`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`📅 Started at: ${new Date().toISOString()}`);
});

// Handle server errors
server.on('error', (error: any) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

  switch (error.code) {
    case 'EACCES':
      console.error(`❌ ${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`❌ ${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

export default app;
