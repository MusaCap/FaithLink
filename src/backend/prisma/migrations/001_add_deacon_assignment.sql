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

-- AlterTable
ALTER TABLE "members" ADD COLUMN "deaconId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "deacons_email_key" ON "deacons"("email");

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_deaconId_fkey" FOREIGN KEY ("deaconId") REFERENCES "deacons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deacons" ADD CONSTRAINT "deacons_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "churches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deacons" ADD CONSTRAINT "deacons_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Insert sample deacons for testing
INSERT INTO "deacons" ("id", "firstName", "lastName", "email", "phone", "churchId", "specialties", "maxMembers", "notes", "createdAt", "updatedAt") VALUES
('deacon1', 'John', 'Wesley', 'john.wesley@church.com', '(555) 123-4567', NULL, ARRAY['General Counseling', 'Family Support'], 25, 'Senior deacon with 15 years of experience', NOW(), NOW()),
('deacon2', 'Mary', 'Thompson', 'mary.thompson@church.com', '(555) 234-5678', NULL, ARRAY['Youth Ministry', 'Crisis Intervention'], 20, 'Specializes in youth and family crisis support', NOW(), NOW()),
('deacon3', 'Robert', 'Davis', 'robert.davis@church.com', '(555) 345-6789', NULL, ARRAY['Seniors Ministry', 'Hospital Visitation'], 30, 'Dedicated to senior member care and hospital ministry', NOW(), NOW());
