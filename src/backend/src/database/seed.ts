import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@faithlink360.com' },
    update: {},
    create: {
      email: 'admin@faithlink360.com',
      password: hashedPassword,
      role: 'ADMIN',
      member: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@faithlink360.com',
          phone: '(555) 123-4567',
          address: '123 Church St',
          spiritualStatus: 'Leadership'
        }
      }
    }
  });

  // Create pastor user
  const pastorUser = await prisma.user.upsert({
    where: { email: 'pastor@faithlink360.com' },
    update: {},
    create: {
      email: 'pastor@faithlink360.com',
      password: hashedPassword,
      role: 'PASTOR',
      member: {
        create: {
          firstName: 'Pastor',
          lastName: 'Smith',
          email: 'pastor@faithlink360.com',
          phone: '(555) 234-5678',
          address: '456 Faith Ave',
          spiritualStatus: 'Leadership'
        }
      }
    }
  });

  // Create group leader user
  const leaderUser = await prisma.user.upsert({
    where: { email: 'leader@faithlink360.com' },
    update: {},
    create: {
      email: 'leader@faithlink360.com',
      password: hashedPassword,
      role: 'GROUP_LEADER',
      member: {
        create: {
          firstName: 'Group',
          lastName: 'Leader',
          email: 'leader@faithlink360.com',
          phone: '(555) 345-6789',
          address: '789 Community Dr',
          spiritualStatus: 'Growing'
        }
      }
    }
  });

  // Create member user
  const memberUser = await prisma.user.upsert({
    where: { email: 'member@faithlink360.com' },
    update: {},
    create: {
      email: 'member@faithlink360.com',
      password: hashedPassword,
      role: 'MEMBER',
      member: {
        create: {
          firstName: 'Church',
          lastName: 'Member',
          email: 'member@faithlink360.com',
          phone: '(555) 456-7890',
          address: '101 Worship Way',
          spiritualStatus: 'Growing'
        }
      }
    }
  });

  // Create sample groups
  const youthGroup = await prisma.group.create({
    data: {
      name: 'Youth Group',
      type: 'MINISTRY',
      description: 'Ministry focused on teenagers and young adults',
      leaderId: leaderUser.id
    }
  });

  const lifeGroup = await prisma.group.create({
    data: {
      name: 'Downtown Life Group',
      type: 'LIFEGROUP',
      description: 'Weekly small group for downtown members',
      leaderId: leaderUser.id
    }
  });

  // Create journey template
  const journeyTemplate = await prisma.journeyTemplate.create({
    data: {
      name: 'New Member Journey',
      description: 'Spiritual growth path for new church members',
      milestones: {
        create: [
          {
            name: 'Welcome & Introduction',
            description: 'Meet with pastor and learn about church vision',
            sequence: 1
          },
          {
            name: 'Baptism Preparation',
            description: 'Complete baptism class and prepare for ceremony',
            sequence: 2
          },
          {
            name: 'Small Group Connection',
            description: 'Join a life group and build community relationships',
            sequence: 3
          },
          {
            name: 'Spiritual Gifts Discovery',
            description: 'Discover your spiritual gifts and ministry calling',
            sequence: 4
          }
        ]
      }
    }
  });

  console.log('Database seeded successfully!');
  console.log('Demo accounts created:');
  console.log('- Admin: admin@faithlink360.com / admin123');
  console.log('- Pastor: pastor@faithlink360.com / admin123');
  console.log('- Group Leader: leader@faithlink360.com / admin123');
  console.log('- Member: member@faithlink360.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
