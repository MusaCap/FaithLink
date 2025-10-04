# 🗄️ PostgreSQL Database Setup on Render

## Step 1: Create PostgreSQL Database

1. Go to [render.com/dashboard](https://render.com/dashboard)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `faithlink360-db`
   - **Database**: `faithlink360`
   - **Region**: Oregon (US West) or closest
   - **Plan**: **Free** (for development)

## Step 2: Copy Database Credentials

After creation, Render provides two URLs:

### Internal URL (for deployed web service):
```
postgresql://faithlink360_user:PASSWORD@dpg-xxxxx-a:5432/faithlink360
```

### External URL (for local development):
```
postgresql://faithlink360_user:PASSWORD@dpg-xxxxx-a.oregon-postgres.render.com:5432/faithlink360
```

## Step 3: Create Local .env File

1. In `src/backend/`, copy `.env.example` to `.env`
2. Replace `DATABASE_URL` with your **External URL** from Render
3. Generate a secure JWT_SECRET (32+ characters)

Example `.env` file:
```bash
DATABASE_URL="postgresql://faithlink360_user:YOUR_PASSWORD@dpg-xxxxx-a.oregon-postgres.render.com:5432/faithlink360"
JWT_SECRET="super-secure-jwt-secret-at-least-32-characters-long-for-production"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
NODE_ENV="development"
PORT=8000
```

## Step 4: Test Database Connection

Run these commands in `src/backend/`:
```bash
npm run db:generate     # Generate Prisma client
npx prisma migrate dev --name init   # Create database schema
npm run db:seed        # Populate with sample data
```

## Step 5: Start Prisma Server

```bash
npm run dev    # Start development server with Prisma
```

## Expected Results:
- ✅ Database connection established
- ✅ All tables created (Churches, Users, Members, PrayerRequests, etc.)
- ✅ Sample data loaded (David Johnson, Admin User, etc.)
- ✅ Server running on http://localhost:8000
- ✅ Health check: http://localhost:8000/health

## Troubleshooting:

### Connection Issues:
- Verify DATABASE_URL is the **External URL** from Render
- Check database is active in Render dashboard
- Ensure no typos in connection string

### Migration Issues:
- Database must be empty for initial migration
- Use `npx prisma migrate reset` to reset if needed
- Verify Prisma schema is valid

**Once your database is created on Render, paste the External URL here and I'll help you complete the setup!**
