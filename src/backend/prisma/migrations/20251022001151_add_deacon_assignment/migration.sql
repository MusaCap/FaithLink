-- CreateEnum
CREATE TYPE "BackgroundCheckStatus" AS ENUM ('NOT_REQUIRED', 'REQUIRED', 'PENDING', 'IN_PROGRESS', 'APPROVED', 'EXPIRED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VolunteerPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('DRAFT', 'OPEN', 'FILLED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "SignupStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DECLINED', 'WAITLISTED', 'COMPLETED', 'NO_SHOW', 'CANCELLED');

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "deaconId" TEXT;

-- CreateTable
CREATE TABLE "deacons" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "churchId" TEXT,
    "memberId" TEXT,
    "ordainedDate" TIMESTAMP(3),
    "specialties" TEXT[],
    "maxMembers" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deacons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteers" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "skills" TEXT[],
    "interests" TEXT[],
    "availability" JSONB NOT NULL,
    "maxHoursPerWeek" INTEGER,
    "preferredMinistries" TEXT[],
    "transportationAvailable" BOOLEAN NOT NULL DEFAULT false,
    "willingToTravel" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "backgroundCheck" "BackgroundCheckStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
    "emergencyContact" JSONB NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volunteers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteer_opportunities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ministry" TEXT NOT NULL,
    "location" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "skillsRequired" TEXT[],
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "backgroundCheckRequired" BOOLEAN NOT NULL DEFAULT false,
    "trainingRequired" TEXT[],
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringSchedule" JSONB,
    "estimatedHours" DOUBLE PRECISION,
    "maxVolunteers" INTEGER,
    "currentVolunteers" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "urgency" "VolunteerPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "OpportunityStatus" NOT NULL DEFAULT 'OPEN',
    "coordinatorId" TEXT NOT NULL,
    "churchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volunteer_opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteer_opportunity_assignments" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "assignedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "volunteer_opportunity_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteer_signups" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "status" "SignupStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "specialRequests" TEXT,
    "scheduledDate" TIMESTAMP(3),
    "scheduledStartTime" TIMESTAMP(3),
    "scheduledEndTime" TIMESTAMP(3),
    "estimatedHours" DOUBLE PRECISION,
    "confirmedAt" TIMESTAMP(3),
    "confirmedBy" TEXT,
    "declinedAt" TIMESTAMP(3),
    "declinedReason" TEXT,
    "completedAt" TIMESTAMP(3),
    "actualHours" DOUBLE PRECISION,
    "feedback" TEXT,
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volunteer_signups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteer_hours" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "opportunityId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "hoursWorked" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "ministry" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verificationNotes" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volunteer_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteer_trainings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "validityPeriod" INTEGER,
    "materials" JSONB,
    "requirements" TEXT,
    "estimatedDuration" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volunteer_trainings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteer_training_completions" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "trainingId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "score" DOUBLE PRECISION,
    "notes" TEXT,
    "verifiedBy" TEXT,
    "certificateUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "volunteer_training_completions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "deacons_email_key" ON "deacons"("email");

-- CreateIndex
CREATE UNIQUE INDEX "deacons_memberId_key" ON "deacons"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "volunteers_memberId_key" ON "volunteers"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "volunteer_opportunity_assignments_volunteerId_opportunityId_key" ON "volunteer_opportunity_assignments"("volunteerId", "opportunityId");

-- CreateIndex
CREATE UNIQUE INDEX "volunteer_signups_volunteerId_opportunityId_scheduledDate_key" ON "volunteer_signups"("volunteerId", "opportunityId", "scheduledDate");

-- CreateIndex
CREATE UNIQUE INDEX "volunteer_training_completions_volunteerId_trainingId_key" ON "volunteer_training_completions"("volunteerId", "trainingId");

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_deaconId_fkey" FOREIGN KEY ("deaconId") REFERENCES "deacons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deacons" ADD CONSTRAINT "deacons_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "churches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deacons" ADD CONSTRAINT "deacons_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_opportunities" ADD CONSTRAINT "volunteer_opportunities_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_opportunities" ADD CONSTRAINT "volunteer_opportunities_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "churches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_opportunity_assignments" ADD CONSTRAINT "volunteer_opportunity_assignments_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "volunteers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_opportunity_assignments" ADD CONSTRAINT "volunteer_opportunity_assignments_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "volunteer_opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_signups" ADD CONSTRAINT "volunteer_signups_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "volunteers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_signups" ADD CONSTRAINT "volunteer_signups_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "volunteer_opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_hours" ADD CONSTRAINT "volunteer_hours_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "volunteers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_hours" ADD CONSTRAINT "volunteer_hours_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "volunteer_opportunities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_training_completions" ADD CONSTRAINT "volunteer_training_completions_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "volunteers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_training_completions" ADD CONSTRAINT "volunteer_training_completions_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "volunteer_trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
