# FaithLink360 Project Setup Guide

## Overview
FaithLink360 is a full-stack church member engagement platform built with:
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Database**: PostgreSQL
- **Development**: Docker + Docker Compose

## Prerequisites
- Docker Desktop installed and running
- Node.js 18+ (for local development)
- Git

## Quick Start

### 1. Environment Setup
Copy the environment template:
```bash
copy .env.example .env
```

Edit `.env` file with your actual values:
```env
# Database
DATABASE_URL="postgresql://faithlink_user:faithlink_password@localhost:5432/faithlink_db?schema=public"

# JWT Secrets (generate secure random strings)
JWT_SECRET="your-super-secure-jwt-secret-key-here"
JWT_REFRESH_SECRET="your-super-secure-refresh-secret-key-here"

# Frontend URLs
NEXT_PUBLIC_API_URL="http://localhost:8000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# Email Configuration (optional for MVP)
SENDGRID_API_KEY=""

# Environment
NODE_ENV="development"
PORT=8000
```

### 2. Install Dependencies

**Backend:**
```bash
cd src/backend
npm install
```

**Frontend:**
```bash
cd src/frontend
npm install
```

### 3. Database Setup

Start PostgreSQL with Docker:
```bash
docker compose up database -d
```

Generate and run Prisma migrations:
```bash
cd src/backend
npx prisma generate
npx prisma db push
```

Optional - Seed the database:
```bash
npx prisma db seed
```

### 4. Start Development Servers

**Option A: Using Docker Compose (Recommended)**
```bash
docker compose up --build
```

**Option B: Manual Setup**

Terminal 1 - Backend:
```bash
cd src/backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd src/frontend
npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Health Check: http://localhost:8000/health
- Database: localhost:5432 (postgres user credentials in .env)

## Development Commands

### Backend Commands
```bash
cd src/backend

# Development server
npm run dev

# Build production
npm run build

# Start production server
npm start

# Database operations
npx prisma migrate dev    # Create and apply new migration
npx prisma generate       # Generate Prisma client
npx prisma studio         # Open Prisma Studio (database GUI)
npx prisma db push        # Push schema to database (development)
npx prisma db seed        # Seed database with initial data

# Testing
npm test
npm run test:watch
```

### Frontend Commands
```bash
cd src/frontend

# Development server
npm run dev

# Build production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Testing
npm test
npm run test:watch

# Linting
npm run lint
```

### Docker Commands
```bash
# Start all services
docker compose up

# Start with rebuild
docker compose up --build

# Start specific service
docker compose up database
docker compose up backend
docker compose up frontend

# Stop all services
docker compose down

# View logs
docker compose logs backend
docker compose logs frontend
docker compose logs database

# Execute commands in containers
docker compose exec backend npm run prisma:studio
docker compose exec frontend npm run lint
```

## Project Structure
```
FaithLink360/
├── src/
│   ├── backend/           # Node.js + Express API
│   │   ├── src/
│   │   │   ├── routes/    # API route handlers
│   │   │   ├── middleware/# Express middleware
│   │   │   ├── services/  # Business logic
│   │   │   ├── utils/     # Utility functions
│   │   │   └── server.ts  # Main server file
│   │   ├── prisma/        # Database schema and migrations
│   │   ├── tests/         # Backend tests
│   │   └── package.json
│   └── frontend/          # Next.js React app
│       ├── src/
│       │   ├── app/       # Next.js 14 app router
│       │   ├── components/# React components
│       │   ├── hooks/     # Custom React hooks
│       │   ├── lib/       # Client-side utilities
│       │   ├── types/     # TypeScript type definitions
│       │   └── utils/     # Utility functions
│       ├── public/        # Static assets
│       └── package.json
├── docs/                  # Project documentation
├── docker-compose.yml     # Docker services configuration
├── .env.example          # Environment template
└── PROJECT_SETUP_GUIDE.md
```

## Available API Endpoints

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile

### Coming Soon
- `GET /api/members` - List members
- `POST /api/members` - Create member
- `GET /api/groups` - List groups
- `POST /api/groups` - Create group
- `GET /api/events` - List events
- `POST /api/events` - Create event

## Database Schema
The database includes the following main entities:
- **Users** - Authentication and roles
- **Members** - Church member profiles
- **Groups** - Small groups and ministries
- **Events** - Church events and activities
- **JourneyTemplates & Milestones** - Spiritual journey tracking
- **CareLog** - Pastoral care and visits
- **Tags** - Categorization system

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :8000
netstat -ano | findstr :5432

# Kill the process
taskkill /PID <PID_NUMBER> /F
```

**Database connection issues:**
```bash
# Restart PostgreSQL
docker compose restart database

# Check database logs
docker compose logs database

# Recreate database
docker compose down
docker volume rm faithlink-main_postgres_data
docker compose up database -d
```

**Prisma issues:**
```bash
# Reset Prisma client
cd src/backend
rm -rf node_modules/.prisma
npx prisma generate

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset
```

**Build issues:**
```bash
# Clear Next.js cache
cd src/frontend
rm -rf .next

# Rebuild Docker images
docker compose build --no-cache
```

## Next Steps
1. ✅ Basic project structure created
2. ✅ Authentication system implemented
3. ⏳ Create member management endpoints
4. ⏳ Implement group management
5. ⏳ Add spiritual journey tracking
6. ⏳ Build frontend components
7. ⏳ Add event management
8. ⏳ Implement care management
9. ⏳ Create dashboards and reports

## Support
For setup issues or questions, refer to:
- Project documentation in `/docs/`
- Sprint 1 kickoff guide: `Sprint1_Kickoff_Guide.md`
- Architecture comparison: `architecture_comparison.md`
