// Security Middleware for FaithLink360
// SOC2 Compliance and Production Security Controls

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const jwt = require('jsonwebtoken');

// Security Configuration
const SECURITY_CONFIG = {
  jwt: {
    secret: process.env.JWT_SECRET || 'faithlink-secure-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: 'faithlink360',
    audience: 'church-members'
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
  },
  cors: {
    origin: function(origin, callback) {
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        'https://subtle-semifreddo-ed7b4b.netlify.app',
        'http://localhost:3000',
        'http://localhost:3001'
      ].filter(Boolean);
      
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn('🚨 CORS: Blocked origin:', origin);
        callback(new Error('Not allowed by CORS policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization', 
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-CSRF-Token',
      'X-Church-ID'
    ],
    exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
    maxAge: 86400
  }
};

// Rate Limiting Middleware
const createRateLimit = (options = {}) => {
  return rateLimit({
    ...SECURITY_CONFIG.rateLimit,
    ...options,
    handler: (req, res) => {
      console.warn('🚨 Rate limit exceeded:', req.ip, req.path);
      res.status(429).json({
        success: false,
        ...SECURITY_CONFIG.rateLimit.message,
        retryAfter: Math.ceil(SECURITY_CONFIG.rateLimit.windowMs / 1000)
      });
    }
  });
};

// Slow Down Middleware (Progressive Delay)
const createSlowDown = (options = {}) => {
  return slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // Allow 50 requests per windowMs without delay
    delayMs: 500, // Add 500ms delay per request after delayAfter
    maxDelayMs: 20000, // Maximum delay of 20 seconds
    ...options
  });
};

// Stricter rate limits for authentication endpoints
const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit to 10 auth attempts per window
  message: {
    error: 'Too many authentication attempts, please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  }
});

// Enhanced Security Headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.faithlink360.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'"]
    }
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
});

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.warn('🚨 Authentication failed: No token provided', req.ip, req.path);
    return res.status(401).json({
      success: false,
      error: 'Access token is required',
      code: 'TOKEN_MISSING'
    });
  }

  jwt.verify(token, SECURITY_CONFIG.jwt.secret, {
    issuer: SECURITY_CONFIG.jwt.issuer,
    audience: SECURITY_CONFIG.jwt.audience
  }, (err, decoded) => {
    if (err) {
      console.warn('🚨 Authentication failed: Invalid token', req.ip, req.path, err.name);
      
      let errorCode = 'TOKEN_INVALID';
      let errorMessage = 'Invalid access token';
      
      if (err.name === 'TokenExpiredError') {
        errorCode = 'TOKEN_EXPIRED';
        errorMessage = 'Access token has expired';
      } else if (err.name === 'JsonWebTokenError') {
        errorCode = 'TOKEN_MALFORMED';
        errorMessage = 'Malformed access token';
      }

      return res.status(403).json({
        success: false,
        error: errorMessage,
        code: errorCode
      });
    }

    req.user = decoded;
    req.user.churchId = decoded.churchId || 'default';
    next();
  });
};

// Role-based Authorization Middleware
const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(userRole)) {
      console.warn('🚨 Authorization failed:', req.user.email, 'Role:', userRole, 'Required:', allowedRoles);
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions for this operation',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: userRole
      });
    }

    next();
  };
};

// Church Context Isolation Middleware
const requireChurchContext = (req, res, next) => {
  const userChurchId = req.user?.churchId;
  const requestChurchId = req.params.churchId || req.body.churchId || req.query.churchId;

  // If no church context in request, use user's church
  if (!requestChurchId) {
    req.churchId = userChurchId;
    return next();
  }

  // Validate church access (admin can access any church, others only their own)
  if (req.user.role !== 'admin' && requestChurchId !== userChurchId) {
    console.warn('🚨 Church isolation violation:', req.user.email, 'Attempted:', requestChurchId, 'Allowed:', userChurchId);
    return res.status(403).json({
      success: false,
      error: 'Access denied to this church context',
      code: 'CHURCH_ACCESS_DENIED'
    });
  }

  req.churchId = requestChurchId;
  next();
};

// Input Sanitization Middleware
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove potential XSS vectors
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '')
          .trim();
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

// Audit Logging Middleware
const auditLog = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  const logData = {
    timestamp: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    method: req.method,
    path: req.path,
    userId: req.user?.id || 'anonymous',
    churchId: req.user?.churchId || 'unknown',
    sessionId: req.headers['x-session-id'] || 'none'
  };

  // Log sensitive operations
  const sensitiveOps = [
    '/api/members', '/api/auth', '/api/bulk-upload',
    '/api/care', '/api/communications', '/api/settings'
  ];

  const isSensitive = sensitiveOps.some(op => req.path.startsWith(op));
  
  if (isSensitive || req.method !== 'GET') {
    console.log('🔍 AUDIT:', JSON.stringify(logData));
  }

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - startTime;
    
    if (isSensitive || res.statusCode >= 400) {
      console.log('📊 RESPONSE:', {
        ...logData,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        success: data?.success !== false
      });
    }

    return originalJson.call(this, data);
  };

  next();
};

// Security Event Detection
const detectSecurityEvents = (req, res, next) => {
  const events = [];
  
  // Detect potential security events
  if (req.path.includes('..') || req.path.includes('//')) {
    events.push('PATH_TRAVERSAL_ATTEMPT');
  }
  
  if (req.get('User-Agent')?.includes('bot') || req.get('User-Agent')?.includes('crawler')) {
    events.push('BOT_ACCESS');
  }
  
  const suspiciousPatterns = ['<script', 'javascript:', 'eval(', 'document.cookie'];
  const queryString = JSON.stringify(req.query) + JSON.stringify(req.body);
  
  if (suspiciousPatterns.some(pattern => queryString.toLowerCase().includes(pattern))) {
    events.push('XSS_ATTEMPT');
  }

  if (events.length > 0) {
    console.warn('🚨 SECURITY EVENT:', events.join(', '), req.ip, req.path);
    
    // Log to security monitoring system
    // In production, this would integrate with SIEM tools
  }

  next();
};

module.exports = {
  // Core security middleware
  securityHeaders,
  authenticateToken,
  requireRole,
  requireChurchContext,
  sanitizeInput,
  auditLog,
  detectSecurityEvents,
  
  // Rate limiting
  rateLimit: createRateLimit(),
  authRateLimit,
  slowDown: createSlowDown(),
  
  // Configuration
  SECURITY_CONFIG,
  
  // Utility functions
  generateToken: (payload) => {
    return jwt.sign(
      { ...payload, iat: Math.floor(Date.now() / 1000) },
      SECURITY_CONFIG.jwt.secret,
      {
        expiresIn: SECURITY_CONFIG.jwt.expiresIn,
        issuer: SECURITY_CONFIG.jwt.issuer,
        audience: SECURITY_CONFIG.jwt.audience
      }
    );
  },
  
  verifyToken: (token) => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, SECURITY_CONFIG.jwt.secret, {
        issuer: SECURITY_CONFIG.jwt.issuer,
        audience: SECURITY_CONFIG.jwt.audience
      }, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });
  }
};
