import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create churches
  const church = await prisma.church.upsert({
    where: { id: 'church-main' },
    update: {},
    create: {
      id: 'church-main',
      name: 'First Community Church',
      description: 'A welcoming community focused on faith, fellowship, and service.',
      address: '123 Main Street',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      phone: '(555) 123-4567',
      email: 'info@firstcommunity.org',
      website: 'https://firstcommunity.org',
      denomination: 'Non-denominational',
      isPublic: true,
      isActive: true,
    }
  });

  console.log('✅ Church created:', church.name);

  // Create admin user with member profile
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@faithlink360.com' },
    update: {},
    create: {
      email: 'admin@faithlink360.com',
      password: hashedPassword,
      role: 'ADMIN',
      churchId: church.id,
    }
  });

  const adminMember = await prisma.member.upsert({
    where: { email: 'admin@faithlink360.com' },
    update: {},
    create: {
      userId: adminUser.id,
      memberNumber: '10000',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@faithlink360.com',
      phone: '(555) 123-4567',
      address: '123 Church St',
      spiritualStatus: 'Leadership',
      churchId: church.id,
      membershipStatus: 'active',
      role: 'admin',
    }
  });

  // Create David Johnson (Pastor)
  const davidUser = await prisma.user.upsert({
    where: { email: 'david.johnson@faithlink360.org' },
    update: {},
    create: {
      email: 'david.johnson@faithlink360.org',
      password: hashedPassword,
      role: 'PASTOR',
      churchId: church.id,
    }
  });

  const davidMember = await prisma.member.upsert({
    where: { email: 'david.johnson@faithlink360.org' },
    update: {},
    create: {
      userId: davidUser.id,
      memberNumber: '10002',
      firstName: 'David',
      lastName: 'Johnson',
      email: 'david.johnson@faithlink360.org',
      phone: '(555) 987-6543',
      address: '789 Pastor Lane',
      spiritualStatus: 'Leadership',
      churchId: church.id,
      membershipStatus: 'active',
      role: 'pastor',
    }
  });

  // Create sample members
  const members = [
    {
      memberNumber: '10001',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '(555) 234-5678',
      role: 'member',
      membershipStatus: 'active',
    },
    {
      memberNumber: '10003',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(555) 345-6789',
      role: 'leader',
      membershipStatus: 'active',
    },
    {
      memberNumber: '10004',
      firstName: 'Michael',
      lastName: 'Davis',
      email: 'michael.davis@email.com',
      phone: '(555) 456-7890',
      role: 'member',
      membershipStatus: 'active',
    },
    {
      memberNumber: '10005',
      firstName: 'Emily',
      lastName: 'Wilson',
      email: 'emily.wilson@email.com',
      phone: '(555) 567-8901',
      role: 'member',
      membershipStatus: 'active',
    }
  ];

  for (const memberData of members) {
    await prisma.member.upsert({
      where: { email: memberData.email },
      update: {},
      create: {
        ...memberData,
        churchId: church.id,
        spiritualStatus: 'Growing',
      }
    });
  }

  console.log('✅ Sample members created');

  // Create sample groups
  const groups = [
    {
      id: 'group-001',
      name: 'Sunday School Adults',
      type: 'class',
      description: 'Adult Sunday school class focused on biblical study and fellowship',
      churchId: church.id,
    },
    {
      id: 'group-002',
      name: 'Youth Group',
      type: 'ministry',
      description: 'Ministry for teenagers and young adults',
      churchId: church.id,
    },
    {
      id: 'group-003',
      name: 'Small Group Alpha',
      type: 'small-group',
      description: 'Small group meeting for Bible study and prayer',
      churchId: church.id,
    }
  ];

  for (const groupData of groups) {
    await prisma.group.upsert({
      where: { id: groupData.id },
      update: {},
      create: groupData
    });
  }

  console.log('✅ Sample groups created');

  // Create sample prayer requests
  const prayerRequests = [
    {
      id: 'prayer-001',
      title: 'Healing for Cancer Treatment',
      description: 'Please pray for my aunt Susan who is undergoing chemotherapy for breast cancer. Pray for strength, peace, and complete healing.',
      requestedBy: davidMember.id,
      requestedByName: 'David Johnson',
      category: 'health',
      priority: 'high',
      status: 'active',
      isPrivate: false,
      prayerCount: 23,
    },
    {
      id: 'prayer-002',
      title: 'Job Search Guidance',
      description: 'Seeking prayers for wisdom and guidance as I search for new employment opportunities.',
      requestedBy: adminMember.id,
      requestedByName: 'Admin User',
      category: 'work',
      priority: 'medium',
      status: 'active',
      isPrivate: false,
      prayerCount: 15,
    }
  ];

  for (const prayerData of prayerRequests) {
    await prisma.prayerRequest.upsert({
      where: { id: prayerData.id },
      update: {},
      create: prayerData
    });
  }

  console.log('✅ Sample prayer requests created');

  // Create sample events
  const events = [
    {
      id: 'event-001',
      title: 'Sunday Morning Service',
      description: 'Weekly Sunday morning worship service',
      dateTime: new Date('2025-01-12T10:00:00Z'),
      location: 'Main Sanctuary',
      churchId: church.id,
      createdBy: davidUser.id,
      calendarType: 'RECURRING',
    },
    {
      id: 'event-002',
      title: 'Community Outreach',
      description: 'Monthly community service event',
      dateTime: new Date('2025-01-15T09:00:00Z'),
      location: 'Community Center',
      churchId: church.id,
      createdBy: adminUser.id,
      calendarType: 'ONEOFF',
    }
  ];

  for (const eventData of events) {
    await prisma.event.upsert({
      where: { id: eventData.id },
      update: {},
      create: eventData
    });
  }

  console.log('✅ Sample events created');

  console.log('🎉 Database seed completed successfully!');
  console.log('📊 Summary:');
  console.log(`- Churches: ${await prisma.church.count()}`);
  console.log(`- Users: ${await prisma.user.count()}`);
  console.log(`- Members: ${await prisma.member.count()}`);
  console.log(`- Groups: ${await prisma.group.count()}`);
  console.log(`- Prayer Requests: ${await prisma.prayerRequest.count()}`);
  console.log(`- Events: ${await prisma.event.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
