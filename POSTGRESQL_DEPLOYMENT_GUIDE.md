# 🗄️ PostgreSQL Database Deployment Guide

## 🎯 Overview
This guide will help you deploy FaithLink360 with PostgreSQL database on Render, replacing the current in-memory storage with persistent database storage.

## 📋 Prerequisites
- Render.com account
- GitHub repository pushed with latest changes
- SMTP credentials for bug report emails (optional)

## 🚀 Step 1: Create PostgreSQL Database on Render

### 1.1 Add PostgreSQL Service
1. Go to [render.com/dashboard](https://render.com/dashboard)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure database:
   - **Name**: `faithlink360-db`
   - **Region**: Choose closest to your users
   - **Plan**: **Free** (for testing) or **Starter** (for production)
   - **Database**: `faithlink360`
   - **Username**: `faithlink360_user` (auto-generated)

### 1.2 Note Database Credentials
After creation, save these details:
- **Internal Database URL**: `postgresql://username:password@host:port/database`
- **External Database URL**: For external connections (if needed)

## 🚀 Step 2: Update Web Service Configuration

### 2.1 Update Environment Variables
In your existing Render web service, add these environment variables:

```bash
# Database
DATABASE_URL=<your-internal-database-url-from-step-1>

# JWT Security
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# Email Configuration (for bug reports to gp@musa.capital)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Node Environment
NODE_ENV=production
```

### 2.2 Update Build & Start Commands
- **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
- **Start Command**: `npm start`

### 2.3 Update package.json start script
The current `server-production.js` will be replaced. Update to use Prisma:

```json
{
  "scripts": {
    "start": "node -r ts-node/register src/server-prisma.ts"
  }
}
```

## 🚀 Step 3: Database Migration & Seeding

### 3.1 Initialize Database Schema
These commands will run automatically on deployment:
```bash
npx prisma generate          # Generate Prisma client
npx prisma migrate deploy    # Run migrations
npx prisma db seed          # Seed with production data
```

### 3.2 Manual Migration (if needed)
If you need to run migrations manually:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

## 🗄️ Step 4: Database Schema Overview

### Core Models Created:
- **Users**: Authentication with JWT
- **Members**: Church members with member numbers
- **Churches**: Multi-tenant support
- **Groups**: Member groups and ministries
- **Events**: Church events and attendance
- **PrayerRequests**: Pastoral care prayer tracking
- **BugReports**: Bug reports with database persistence
- **CounselingSession**: Pastoral counseling tracking
- **Activities**: User activity audit trail

### Key Features:
✅ **Persistent Storage**: No more data loss on server restarts
✅ **Multi-tenant**: Support for multiple churches
✅ **Relationships**: Proper foreign key constraints
✅ **Transactions**: Data integrity with database transactions
✅ **Member Numbers**: Financial system integration support

## 🎯 Step 5: Testing & Verification

### 5.1 Test Accounts Created
The database will be seeded with:

| Account | Email | Password | Role | Member # |
|---------|-------|----------|------|----------|
| Admin | admin@faithlink360.com | admin123 | Admin | 10000 |
| David Johnson | david.johnson@faithlink360.org | admin123 | Pastor | 10002 |
| Sample Members | various@email.com | - | Member | 10001, 10003+ |

### 5.2 Verification Steps
1. **Health Check**: Visit `https://your-app.onrender.com/health`
   - Should show: `"database": "PostgreSQL + Prisma ORM"`

2. **Login Test**: Login with David Johnson
   - Email: `david.johnson@faithlink360.org`
   - Password: `admin123`
   - Should show Member Number: **10002** in profile

3. **Data Persistence Test**:
   - Create a new member
   - Trigger a server restart (redeploy)
   - Verify member still exists

4. **Prayer Requests Test**:
   - Create a prayer request
   - View details, add updates
   - Assign to care team member

## 🔧 Step 6: Environment-Specific Configuration

### 6.1 Development Environment
```bash
# .env.local
DATABASE_URL="postgresql://username:password@localhost:5432/faithlink360_dev"
JWT_SECRET="development-secret-key"
SMTP_USER="dev@example.com"
SMTP_PASS="dev-password"
```

### 6.2 Production Environment
```bash
# Render Environment Variables
DATABASE_URL=<render-postgresql-internal-url>
JWT_SECRET=<secure-production-key>
SMTP_USER=<production-email>
SMTP_PASS=<production-app-password>
```

## 📊 Step 7: Monitoring & Maintenance

### 7.1 Database Monitoring
- **Render Dashboard**: Monitor database performance
- **Connection Pool**: Prisma handles connection pooling
- **Query Optimization**: Built-in query optimization

### 7.2 Backup Strategy
- **Automatic Backups**: Render provides automated backups
- **Manual Backup**: Use `pg_dump` for additional backups
- **Data Export**: Prisma Studio for data exploration

### 7.3 Scaling Considerations
- **Connection Limits**: Monitor concurrent connections
- **Query Performance**: Use Prisma's query insights
- **Database Size**: Monitor storage usage

## 🚨 Troubleshooting

### Common Issues:

1. **Migration Fails**
   ```bash
   Error: P3009: Failed to migrate
   Solution: Check DATABASE_URL format and database connectivity
   ```

2. **Prisma Client Not Generated**
   ```bash
   Error: @prisma/client not found
   Solution: Run `npx prisma generate` in build command
   ```

3. **Connection Pool Exhausted**
   ```bash
   Error: Too many connections
   Solution: Increase connection pool or optimize queries
   ```

## ✅ Step 8: Final Verification

### Success Criteria:
- ✅ Backend starts without errors
- ✅ Database connection established
- ✅ User authentication works
- ✅ Member data persists between restarts
- ✅ Prayer requests functionality working
- ✅ Bug reports stored in database
- ✅ Email notifications to gp@musa.capital working

### Performance Benchmarks:
- **Response Time**: <200ms for member queries
- **Database Size**: ~50MB for 1000 members
- **Connection Pool**: 10-20 concurrent connections

## 🎉 Deployment Complete!

Your FaithLink360 platform now has:
- **Persistent PostgreSQL Database**
- **Production-Ready Scaling**
- **Data Integrity & Relationships**
- **Multi-Tenant Architecture**
- **Professional Member Management**

**No more data loss on server restarts! 🎊**

---

**Need Help?** Check logs in Render dashboard or contact support with this deployment guide.
