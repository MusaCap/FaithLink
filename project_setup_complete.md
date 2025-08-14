# 🚀 FaithLink360 - Complete Windsurf + Docker Setup

## Project Initialization Steps

### Step 1: Project Structure Creation

Let's set up the complete project structure:

```powershell
# Navigate to project directory
cd c:\Users\allen\Downloads\FaithLink-main\FaithLink-main

# Create main project structure
mkdir src
mkdir src\frontend
mkdir src\backend
mkdir src\database

# Create configuration directories
mkdir config
mkdir scripts
mkdir docs\api

# Create Docker files directory
mkdir docker
```

---

## Step 2: Docker Configuration Files

### Create docker-compose.yml (Root Directory)
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  database:
    image: postgres:15-alpine
    container_name: faithlink360-db
    environment:
      POSTGRES_DB: faithlink360
      POSTGRES_USER: faithlink_user
      POSTGRES_PASSWORD: faithlink_password_dev
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=C --lc-ctype=C"
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./src/database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - faithlink-network
    restart: unless-stopped

  # Backend API (Node.js + Express)
  backend:
    build: 
      context: ./src/backend
      dockerfile: Dockerfile.dev
    container_name: faithlink360-api
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://faithlink_user:faithlink_password_dev@database:5432/faithlink360
      JWT_SECRET: your-super-secret-jwt-key-change-in-production-please
      JWT_REFRESH_SECRET: your-super-secret-refresh-key-change-in-production
      PORT: 8000
      FRONTEND_URL: http://localhost:3000
    ports:
      - "8000:8000"
    volumes:
      - ./src/backend:/app
      - /app/node_modules
      - /app/dist
    depends_on:
      - database
    networks:
      - faithlink-network
    restart: unless-stopped
    command: npm run dev

  # Frontend (Next.js)
  frontend:
    build:
      context: ./src/frontend
      dockerfile: Dockerfile.dev
    container_name: faithlink360-web
    environment:
      NODE_ENV: development
      NEXT_PUBLIC_API_URL: http://localhost:8000
      NEXT_PUBLIC_APP_URL: http://localhost:3000
      NEXTAUTH_URL: http://localhost:3000
      NEXTAUTH_SECRET: your-nextauth-secret-key-change-in-production
    ports:
      - "3000:3000"
    volumes:
      - ./src/frontend:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - backend
    networks:
      - faithlink-network
    restart: unless-stopped
    command: npm run dev

volumes:
  postgres_data:

networks:
  faithlink-network:
    driver: bridge
```

### Create .env file (Root Directory)
```env
# Database Configuration
DATABASE_URL=postgresql://faithlink_user:faithlink_password_dev@localhost:5432/faithlink360

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-please
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Frontend URLs
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-change-in-production

# Email Configuration (for later)
EMAIL_FROM=noreply@faithlink360.com
SENDGRID_API_KEY=your-sendgrid-key-here

# Development Settings
NODE_ENV=development
PORT=8000
```

---

## Step 3: Backend Setup (Node.js + Express + Prisma)

### Create package.json for Backend
```json
{
  "name": "faithlink360-backend",
  "version": "1.0.0",
  "description": "FaithLink360 Backend API",
  "main": "dist/server.js",
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "ts-node src/database/seed.ts",
    "db:studio": "prisma studio",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "prisma": "^5.6.0",
    "@prisma/client": "^5.6.0",
    "zod": "^3.22.4",
    "express-rate-limit": "^7.1.5",
    "dotenv": "^16.3.1",
    "express-validator": "^7.0.1",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.7",
    "cookie-parser": "^1.4.6"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/node": "^20.9.0",
    "@types/multer": "^1.4.11",
    "@types/nodemailer": "^6.4.14",
    "@types/cookie-parser": "^1.4.6",
    "typescript": "^5.2.2",
    "ts-node": "^10.9.1",
    "nodemon": "^3.0.1",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.8"
  }
}
```

### Create Dockerfile.dev for Backend
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 8000

# Development command
CMD ["npm", "run", "dev"]
```

### Create tsconfig.json for Backend
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Create Prisma Schema
```prisma
// src/backend/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      Role     @default(MEMBER)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  member    Member?
  careLogs  CareLog[] @relation("CareGiver")

  @@map("users")
}

model Member {
  id             String    @id @default(cuid())
  userId         String?   @unique
  firstName      String
  lastName       String
  email          String    @unique
  phone          String?
  dateOfBirth    DateTime?
  gender         Gender?
  address        String?
  maritalStatus  MaritalStatus?
  spiritualStatus String?
  profilePhotoUrl String?
  notes          String?
  isActive       Boolean   @default(true)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  // Relations
  user           User?           @relation(fields: [userId], references: [id])
  groups         GroupMember[]
  journeyStages  JourneyStage[]
  careLogs       CareLog[]
  eventAttendances EventAttendance[]
  tags           MemberTag[]
  familyConnections MemberFamily[]

  @@map("members")
}

model Group {
  id          String    @id @default(cuid())
  name        String
  type        GroupType
  description String?
  leaderId    String?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  members     GroupMember[]
  events      Event[]
  files       GroupFile[]

  @@map("groups")
}

model GroupMember {
  id       String @id @default(cuid())
  memberId String
  groupId  String
  joinedAt DateTime @default(now())

  // Relations
  member   Member @relation(fields: [memberId], references: [id])
  group    Group  @relation(fields: [groupId], references: [id])

  @@unique([memberId, groupId])
  @@map("group_members")
}

model JourneyTemplate {
  id          String      @id @default(cuid())
  name        String
  description String?
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // Relations
  milestones  Milestone[]
  journeyStages JourneyStage[]

  @@map("journey_templates")
}

model Milestone {
  id          String @id @default(cuid())
  templateId  String
  name        String
  description String?
  sequence    Int
  
  // Relations
  template    JourneyTemplate @relation(fields: [templateId], references: [id])
  journeyStages JourneyStage[]

  @@map("milestones")
}

model JourneyStage {
  id              String       @id @default(cuid())
  memberId        String
  templateId      String
  milestoneId     String
  status          StageStatus  @default(NOT_STARTED)
  autoProgress    Boolean      @default(false)
  flagForFollowUp Boolean      @default(false)
  completedAt     DateTime?
  notes           String?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  // Relations
  member          Member          @relation(fields: [memberId], references: [id])
  template        JourneyTemplate @relation(fields: [templateId], references: [id])
  milestone       Milestone       @relation(fields: [milestoneId], references: [id])

  @@map("journey_stages")
}

model Event {
  id          String    @id @default(cuid())
  title       String
  description String?
  dateTime    DateTime
  location    String?
  groupId     String?
  calendarType CalendarType @default(ONEOFF)
  createdBy   String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  group       Group?    @relation(fields: [groupId], references: [id])
  attendances EventAttendance[]
  tags        EventTag[]

  @@map("events")
}

model EventAttendance {
  id       String @id @default(cuid())
  eventId  String
  memberId String
  attended Boolean @default(false)
  checkedInAt DateTime?

  // Relations
  event    Event  @relation(fields: [eventId], references: [id])
  member   Member @relation(fields: [memberId], references: [id])

  @@unique([eventId, memberId])
  @@map("event_attendances")
}

model CareLog {
  id               String   @id @default(cuid())
  memberId         String
  caregiverId      String
  type             CareType
  notes            String
  followUpRequired Boolean  @default(false)
  confidential     Boolean  @default(false)
  followUpDate     DateTime?
  createdAt        DateTime @default(now())

  // Relations
  member           Member   @relation(fields: [memberId], references: [id])
  caregiver        User     @relation("CareGiver", fields: [caregiverId], references: [id])

  @@map("care_logs")
}

model Tag {
  id       String @id @default(cuid())
  label    String @unique
  category TagCategory @default(MEMBER)
  color    String @default("#7ED321")
  createdAt DateTime @default(now())

  // Relations
  members  MemberTag[]
  events   EventTag[]

  @@map("tags")
}

model MemberTag {
  id       String @id @default(cuid())
  memberId String
  tagId    String

  // Relations
  member   Member @relation(fields: [memberId], references: [id])
  tag      Tag    @relation(fields: [tagId], references: [id])

  @@unique([memberId, tagId])
  @@map("member_tags")
}

model EventTag {
  id      String @id @default(cuid())
  eventId String
  tagId   String

  // Relations
  event   Event @relation(fields: [eventId], references: [id])
  tag     Tag   @relation(fields: [tagId], references: [id])

  @@unique([eventId, tagId])
  @@map("event_tags")
}

model GroupFile {
  id         String   @id @default(cuid())
  groupId    String
  fileName   String
  fileUrl    String
  fileSize   Int
  mimeType   String
  uploadedBy String
  uploadedAt DateTime @default(now())

  // Relations
  group      Group    @relation(fields: [groupId], references: [id])

  @@map("group_files")
}

model MemberFamily {
  id         String @id @default(cuid())
  memberId   String
  relatedId  String
  relationship String

  // Relations
  member     Member @relation(fields: [memberId], references: [id])

  @@unique([memberId, relatedId])
  @@map("member_families")
}

// Enums
enum Role {
  ADMIN
  PASTOR
  CARE_TEAM
  GROUP_LEADER
  MEMBER
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

enum MaritalStatus {
  SINGLE
  MARRIED
  DIVORCED
  WIDOWED
}

enum GroupType {
  MINISTRY
  LIFEGROUP
  TEAM
}

enum StageStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
}

enum CalendarType {
  WEEKLY
  MONTHLY
  ONEOFF
}

enum CareType {
  PRAYER
  VISIT
  COUNSELING
  CALL
}

enum TagCategory {
  MEMBER
  EVENT
  GROUP
}
```

---

## Step 4: Frontend Setup (Next.js + TypeScript + Tailwind)

### Create package.json for Frontend
```json
{
  "name": "faithlink360-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "14.0.3",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "typescript": "5.2.2",
    "@types/node": "20.9.0",
    "@types/react": "18.2.38",
    "@types/react-dom": "18.2.17",
    "tailwindcss": "3.3.5",
    "autoprefixer": "10.4.16",
    "postcss": "8.4.31",
    "@tanstack/react-query": "^5.8.4",
    "axios": "^1.6.2",
    "react-hook-form": "^7.48.2",
    "@hookform/resolvers": "^3.3.2",
    "zod": "^3.22.4",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "next-auth": "^4.24.5",
    "@next-auth/prisma-adapter": "^1.0.7",
    "react-hot-toast": "^2.4.1",
    "date-fns": "^2.30.0",
    "@headlessui/react": "^1.7.17"
  },
  "devDependencies": {
    "eslint": "8.54.0",
    "eslint-config-next": "14.0.3",
    "@types/bcryptjs": "^2.4.6"
  }
}
```

### Create Dockerfile.dev for Frontend
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

### Create tailwind.config.js for Frontend
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8F4FD',
          100: '#D1E9FB',
          200: '#A3D3F7',
          300: '#75BDF3',
          400: '#47A7EF',
          500: '#4A90E2', // Main primary blue
          600: '#2E5C8A', // Primary dark
          700: '#1E3A5C',
          800: '#0F1D2E',
          900: '#080E17',
        },
        success: '#7ED321',
        warning: '#F5A623',
        error: '#D0021B',
        neutral: {
          50: '#F8F9FA',
          100: '#F1F3F4',
          200: '#E8EAED',
          300: '#DADCE0',
          400: '#BDC1C6',
          500: '#9AA0A6',
          600: '#80868B',
          700: '#5F6368',
          800: '#3C4043',
          900: '#202124',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [],
}
```

---

## Step 5: Initial Backend Server Code

### Create src/backend/src/server.ts
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes (we'll create these next)
import authRoutes from './routes/auth';
import memberRoutes from './routes/members';
import groupRoutes from './routes/groups';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const prisma = new PrismaClient();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Make Prisma available to routes
app.locals.prisma = prisma;

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'FaithLink360 API'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/groups', groupRoutes);

// Global error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation failed', details: err.message });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 FaithLink360 API running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
});
```

---

## Step 6: Quick Setup Commands

### Run these commands in PowerShell:

```powershell
# 1. Navigate to project directory
cd c:\Users\allen\Downloads\FaithLink-main\FaithLink-main

# 2. Create all the files and directories (we'll do this step by step)

# 3. Initialize backend
cd src\backend
npm init -y
# (We'll replace package.json with our version)

# 4. Initialize frontend  
cd ..\frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 5. Return to root and start containers
cd ..\..
docker-compose up -d database
# Wait for database to start, then:
docker-compose up backend frontend
```

---

## Next Steps After Setup

1. **Create Database Schema**: Run Prisma migrations
2. **Seed Initial Data**: Add sample users, tags, journey templates
3. **Test API Endpoints**: Verify backend is working
4. **Create Basic UI**: Login page and dashboard shell
5. **Implement Authentication**: NextAuth.js setup

This setup gives us a production-ready foundation with:
- ✅ **Professional Architecture**: Docker containerization
- ✅ **Type Safety**: TypeScript throughout
- ✅ **Modern Stack**: Next.js 14, Node.js 18, PostgreSQL 15
- ✅ **Database ORM**: Prisma with full schema
- ✅ **Security**: Helmet, CORS, rate limiting
- ✅ **Development Experience**: Hot reload, proper error handling

Ready to start building FaithLink360! 🚀
