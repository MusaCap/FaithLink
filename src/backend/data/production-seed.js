// Production-like seed data for FaithLink360 Platform
// This provides realistic data for comprehensive testing and demonstration

const productionSeedData = {
  // Available Churches for Discovery
  churches: [
    {
      id: 'church-main',
      name: 'First Community Church',
      description: 'A welcoming community focused on faith, fellowship, and service. Join our demo church to see how FaithLink360 works with real community data.',
      location: 'Springfield, IL',
      denomination: 'Non-denominational',
      size: '3 members (Demo Church)',
      founded: '1985',
      website: 'https://faithlink360.org/demo',
      logo: '/images/churches/first-community.png',
      memberCount: 3,
      isPublic: true,
      joinCode: 'DEMO2024',
      isDemo: true
    }
  ],

  // Church Members (150 members)
  members: [
    {
      id: 'mbr-001',
      firstName: 'David',
      lastName: 'Johnson',
      email: 'david.johnson@faithlink360.org',
      password: 'pastor123', // Demo password for testing
      phone: '+1-555-0101',
      role: 'pastor',
      status: 'active',
      joinDate: '2020-03-15',
      churchId: 'church-main',
      churchName: 'First Community Church',
      address: {
        street: '123 Faith Avenue',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701'
      },
      demographics: {
        dateOfBirth: '1975-08-22',
        gender: 'male',
        maritalStatus: 'married'
      },
      ministry: {
        roles: ['Lead Pastor', 'Board Member'],
        skills: ['Leadership', 'Teaching', 'Counseling'],
        availability: ['Sunday Morning', 'Wednesday Evening']
      },
      attendance: {
        totalServices: 248,
        averageMonthly: 3.8,
        lastAttended: '2025-01-19'
      },
      giving: {
        totalLifetime: 45000,
        averageMonthly: 850,
        lastGift: '2025-01-15'
      }
    },
    {
      id: 'mbr-002', 
      firstName: 'Sarah',
      lastName: 'Martinez',
      email: 'sarah.martinez@email.com',
      password: 'member123', // Demo password for testing
      phone: '+1-555-0102',
      role: 'member',
      status: 'active',
      joinDate: '2021-06-10',
      churchId: 'church-main',
      churchName: 'First Community Church',
      address: {
        street: '456 Grace Street',
        city: 'Springfield', 
        state: 'IL',
        zipCode: '62702'
      },
      demographics: {
        dateOfBirth: '1988-12-03',
        gender: 'female',
        maritalStatus: 'single'
      },
      ministry: {
        roles: ['Youth Leader', 'Worship Team'],
        skills: ['Music', 'Youth Ministry', 'Event Planning'],
        availability: ['Sunday Morning', 'Friday Evening']
      },
      attendance: {
        totalServices: 156,
        averageMonthly: 3.5,
        lastAttended: '2025-01-19'
      },
      giving: {
        totalLifetime: 12500,
        averageMonthly: 350,
        lastGift: '2025-01-12'
      }
    },
    {
      id: 'mbr-003',
      firstName: 'Michael',
      lastName: 'Thompson', 
      email: 'michael.thompson@email.com',
      password: 'leader123', // Demo password for testing
      phone: '+1-555-0103',
      role: 'leader',
      status: 'active',
      joinDate: '2019-09-25',
      churchId: 'church-main',
      churchName: 'First Community Church',
      address: {
        street: '789 Hope Lane',
        city: 'Springfield',
        state: 'IL', 
        zipCode: '62703'
      },
      demographics: {
        dateOfBirth: '1982-05-17',
        gender: 'male',
        maritalStatus: 'married'
      },
      ministry: {
        roles: ['Small Group Leader', 'Deacon'],
        skills: ['Teaching', 'Administration', 'Pastoral Care'],
        availability: ['Tuesday Evening', 'Sunday Morning']
      },
      attendance: {
        totalServices: 198,
        averageMonthly: 3.7,
        lastAttended: '2025-01-19'
      },
      giving: {
        totalLifetime: 28000,
        averageMonthly: 600,
        lastGift: '2025-01-18'
      }
    }
  ],

  // Small Groups (25 groups)
  groups: [
    {
      id: 'grp-001',
      name: 'Young Professionals Bible Study',
      description: 'Bible study focused on applying faith in professional life',
      category: 'bible_study',
      leaderId: 'mbr-002',
      leaderName: 'Sarah Martinez',
      meetingTime: 'Wednesday 7:00 PM',
      location: 'Conference Room A',
      capacity: 20,
      currentMembers: 16,
      memberIds: ['mbr-002', 'mbr-004', 'mbr-005', 'mbr-006', 'mbr-007'],
      status: 'active',
      createdAt: '2024-09-01',
      tags: ['professionals', 'bible-study', 'weekly']
    },
    {
      id: 'grp-002',
      name: 'Senior Saints Fellowship',
      description: 'Community and support group for senior church members',
      category: 'fellowship',
      leaderId: 'mbr-003',
      leaderName: 'Michael Thompson',
      meetingTime: 'Thursday 10:00 AM',
      location: 'Fellowship Hall',
      capacity: 25,
      currentMembers: 22,
      memberIds: ['mbr-003', 'mbr-008', 'mbr-009', 'mbr-010'],
      status: 'active',
      createdAt: '2024-06-15',
      tags: ['seniors', 'fellowship', 'weekly']
    },
    {
      id: 'grp-003',
      name: 'Marriage Builders',
      description: 'Support and growth group for married couples',
      category: 'support',
      leaderId: 'mbr-001',
      leaderName: 'David Johnson',
      meetingTime: 'Friday 7:30 PM',
      location: 'Classroom 3',
      capacity: 15,
      currentMembers: 12,
      memberIds: ['mbr-001', 'mbr-011', 'mbr-012', 'mbr-013'],
      status: 'active',
      createdAt: '2024-10-10',
      tags: ['marriage', 'couples', 'support']
    }
  ],

  // Events (50+ events across categories)
  events: [
    {
      id: 'evt-001',
      title: 'Sunday Worship Service',
      description: 'Weekly worship service with contemporary music and biblical teaching',
      type: 'SERVICE',
      category: 'worship',
      startDate: '2025-01-26T10:00:00Z',
      endDate: '2025-01-26T11:30:00Z',
      location: 'Main Sanctuary',
      capacity: 350,
      registrationCount: 287,
      requiresRegistration: false,
      organizerId: 'mbr-001',
      organizer: {
        name: 'Pastor David Johnson',
        email: 'david.johnson@faithlink360.org'
      },
      cost: 0,
      status: 'SCHEDULED',
      tags: ['worship', 'weekly', 'all-ages'],
      recurringPattern: 'weekly',
      createdAt: '2024-12-01T10:00:00Z'
    },
    {
      id: 'evt-002',
      title: 'Community Service Day',
      description: 'Serving our local community through various service projects including food bank, park cleanup, and elderly assistance',
      type: 'OUTREACH',
      category: 'service',
      startDate: '2025-02-01T08:00:00Z',
      endDate: '2025-02-01T16:00:00Z',
      location: 'Multiple Locations',
      capacity: 100,
      registrationCount: 73,
      requiresRegistration: true,
      organizerId: 'mbr-002',
      organizer: {
        name: 'Sarah Martinez',
        email: 'sarah.martinez@email.com'
      },
      cost: 0,
      status: 'SCHEDULED',
      tags: ['outreach', 'service', 'community'],
      supplies: ['Work gloves', 'T-shirts', 'Transportation'],
      createdAt: '2024-12-15T10:00:00Z'
    },
    {
      id: 'evt-003',
      title: 'Marriage Enrichment Retreat',
      description: 'Weekend retreat for couples focusing on communication, intimacy, and spiritual growth in marriage',
      type: 'RETREAT',
      category: 'marriage',
      startDate: '2025-03-14T18:00:00Z',
      endDate: '2025-03-16T14:00:00Z',
      location: 'Mountain View Retreat Center',
      capacity: 30,
      registrationCount: 24,
      requiresRegistration: true,
      organizerId: 'mbr-001',
      organizer: {
        name: 'Pastor David Johnson', 
        email: 'david.johnson@faithlink360.org'
      },
      cost: 150,
      status: 'SCHEDULED',
      tags: ['marriage', 'retreat', 'couples'],
      includes: ['Meals', 'Lodging', 'Materials'],
      createdAt: '2024-11-20T10:00:00Z'
    }
  ],

  // Spiritual Journeys (30+ journey templates)
  journeyTemplates: [
    {
      id: 'jt-001',
      title: 'New Member Integration',
      description: 'Comprehensive journey for new church members to get connected and involved',
      category: 'newcomer',
      duration: 90,
      milestones: [
        {
          id: 'ms-001',
          title: 'Welcome & Orientation',
          description: 'Attend new member orientation session',
          order: 1,
          estimatedDays: 7,
          resources: ['Welcome packet', 'Church history video', 'Staff introductions']
        },
        {
          id: 'ms-002',
          title: 'Find Your Small Group',
          description: 'Visit and join a small group that fits your interests',
          order: 2,
          estimatedDays: 21,
          resources: ['Small group directory', 'Group visit schedule']
        },
        {
          id: 'ms-003',
          title: 'Discover Your Gifts',
          description: 'Complete spiritual gifts assessment and explore ministry opportunities',
          order: 3,
          estimatedDays: 30,
          resources: ['Spiritual gifts assessment', 'Ministry fair invitation']
        },
        {
          id: 'ms-004',
          title: 'Get Involved in Ministry',
          description: 'Begin serving in at least one ministry area',
          order: 4,
          estimatedDays: 60,
          resources: ['Ministry placement form', 'Volunteer handbook']
        },
        {
          id: 'ms-005',
          title: 'Baptism & Membership',
          description: 'Complete baptism and official church membership',
          order: 5,
          estimatedDays: 90,
          resources: ['Baptism preparation class', 'Membership covenant']
        }
      ],
      createdBy: 'mbr-001',
      isActive: true,
      tags: ['newcomer', 'integration', 'membership']
    },
    {
      id: 'jt-002',
      title: 'Leadership Development Track',
      description: '12-month intensive leadership development program',
      category: 'leadership',
      duration: 365,
      milestones: [
        {
          id: 'ms-006',
          title: 'Leadership Foundations',
          description: 'Complete foundations of Christian leadership course',
          order: 1,
          estimatedDays: 60,
          resources: ['Leadership workbook', 'Mentor assignment']
        },
        {
          id: 'ms-007',
          title: 'Ministry Observation',
          description: 'Shadow experienced leaders in various ministry areas',
          order: 2,
          estimatedDays: 90,
          resources: ['Observation checklist', 'Reflection journal']
        },
        {
          id: 'ms-008',
          title: 'Lead a Project',
          description: 'Plan and execute a ministry project with supervision',
          order: 3,
          estimatedDays: 120,
          resources: ['Project planning template', 'Budget guidelines']
        },
        {
          id: 'ms-009',
          title: 'Teaching & Communication',
          description: 'Develop and deliver teaching content',
          order: 4,
          estimatedDays: 180,
          resources: ['Speaking training', 'Feedback forms']
        },
        {
          id: 'ms-010',
          title: 'Leadership Assessment',
          description: 'Complete comprehensive leadership evaluation',
          order: 5,
          estimatedDays: 365,
          resources: ['360 evaluation', 'Development plan']
        }
      ],
      createdBy: 'mbr-001',
      isActive: true,
      tags: ['leadership', 'development', 'training']
    }
  ],

  // Communication Campaigns (20+ campaigns)
  communications: [
    {
      id: 'comm-001',
      title: 'Welcome New Members - January 2025',
      subject: 'Welcome to Our FaithLink Community!',
      content: `Dear [Name],

We are thrilled to welcome you to the FaithLink360 community! Your decision to join our church family is a blessing to us all.

Over the next few weeks, you'll receive helpful information about:
- Our upcoming New Member Orientation
- Small Group opportunities
- Ministry involvement options  
- Ways to connect and grow

We encourage you to attend this Sunday's service if you haven't already, and don't hesitate to reach out if you have any questions.

Blessings,
Pastor David Johnson`,
      status: 'sent',
      sentDate: '2025-01-15T10:00:00Z',
      recipientGroups: ['new-members'],
      recipientCount: 12,
      openRate: 89.2,
      clickRate: 34.6,
      channels: ['email'],
      createdBy: 'mbr-001',
      createdAt: '2025-01-14T15:30:00Z'
    },
    {
      id: 'comm-002',
      title: 'Community Service Day Registration',
      subject: 'Join Us: Community Service Day - February 1st',
      content: `Dear Church Family,

We're excited to announce our monthly Community Service Day on February 1st! This is a wonderful opportunity to serve our local community and show God's love in action.

Service Projects Include:
• Food Bank Volunteering (9 AM - 12 PM)
• Park & Trail Cleanup (10 AM - 2 PM) 
• Senior Assistance Visits (11 AM - 3 PM)
• Community Garden Setup (9 AM - 1 PM)

Registration is required by January 28th. Sign up online or at the Welcome Center.

Let's make a difference together!

Sarah Martinez
Outreach Coordinator`,
      status: 'scheduled',
      scheduledDate: '2025-01-22T08:00:00Z',
      recipientGroups: ['all-members', 'volunteers'],
      recipientCount: 287,
      channels: ['email', 'sms'],
      createdBy: 'mbr-002',
      createdAt: '2025-01-18T14:20:00Z'
    }
  ],

  // Pastoral Care Records (100+ records)
  pastoralCare: [
    {
      id: 'care-001',
      memberId: 'mbr-015',
      memberName: 'Jennifer Wilson',
      careType: 'hospital_visit',
      priority: 'high',
      status: 'completed',
      assignedTo: 'mbr-001',
      assignedToName: 'Pastor David Johnson',
      description: 'Hospital visit following surgery - knee replacement',
      followUpNeeded: false,
      visitDate: '2025-01-10',
      duration: 45,
      notes: 'Surgery went well. Jennifer is in good spirits and grateful for church support. Prayed together for healing and recovery.',
      tags: ['hospital', 'surgery', 'prayer'],
      createdAt: '2025-01-10T14:30:00Z'
    },
    {
      id: 'care-002',
      memberId: 'mbr-023',
      memberName: 'Robert Chen',
      careType: 'counseling',
      priority: 'normal',
      status: 'ongoing',
      assignedTo: 'mbr-001',
      assignedToName: 'Pastor David Johnson',
      description: 'Marriage counseling sessions - communication issues',
      followUpNeeded: true,
      nextFollowUp: '2025-01-25',
      sessionCount: 3,
      notes: 'Making good progress. Couple is implementing communication tools. Scheduled weekly sessions continue.',
      tags: ['marriage', 'counseling', 'communication'],
      createdAt: '2024-12-15T10:00:00Z'
    }
  ],

  // Tasks & Projects (200+ active tasks)
  tasks: [
    {
      id: 'task-001',
      title: 'Prepare Community Service Day Materials',
      description: 'Organize supplies, volunteer assignments, and logistics for February 1st service day',
      category: 'event_planning',
      priority: 'high',
      status: 'in_progress',
      assignedTo: 'mbr-002',
      assignedToName: 'Sarah Martinez',
      dueDate: '2025-01-28',
      estimatedHours: 8,
      completedHours: 5,
      tags: ['outreach', 'logistics', 'volunteers'],
      checklist: [
        { item: 'Order volunteer t-shirts', completed: true },
        { item: 'Coordinate with food bank', completed: true },
        { item: 'Arrange transportation', completed: false },
        { item: 'Prepare volunteer packets', completed: false },
        { item: 'Send reminder communications', completed: false }
      ],
      createdBy: 'mbr-001',
      createdAt: '2025-01-05T09:00:00Z'
    },
    {
      id: 'task-002', 
      title: 'Update Church Website Content',
      description: 'Refresh ministry pages, event listings, and staff bios on church website',
      category: 'communications',
      priority: 'normal',
      status: 'assigned',
      assignedTo: 'mbr-025',
      assignedToName: 'Alex Rodriguez',
      dueDate: '2025-02-15',
      estimatedHours: 12,
      tags: ['website', 'content', 'maintenance'],
      createdBy: 'mbr-001',
      createdAt: '2025-01-12T11:30:00Z'
    }
  ],

  // Prayer Requests (150+ requests)
  prayerRequests: [
    {
      id: 'prayer-001',
      title: 'Healing for Cancer Treatment',
      description: 'Please pray for my aunt Susan who is undergoing chemotherapy for breast cancer. Pray for strength, peace, and complete healing.',
      requestedBy: 'mbr-008',
      requestedByName: 'Maria Gonzalez',
      category: 'health',
      priority: 'high',
      status: 'active',
      isPrivate: false,
      updates: [
        {
          id: 'update-001',
          content: 'Susan completed her 4th chemo session. Doctors are encouraged by her response to treatment.',
          author: 'Maria Gonzalez',
          createdAt: '2025-01-15T16:20:00Z'
        }
      ],
      prayerCount: 23,
      tags: ['cancer', 'healing', 'family'],
      createdAt: '2024-12-20T10:15:00Z'
    },
    {
      id: 'prayer-002',
      title: 'Job Search Guidance',
      description: 'Seeking prayers for wisdom and open doors as I search for new employment after recent layoff.',
      requestedBy: 'mbr-019',
      requestedByName: 'David Kim',
      category: 'work',
      priority: 'normal', 
      status: 'answered',
      isPrivate: false,
      answeredDate: '2025-01-18',
      prayerCount: 31,
      tags: ['employment', 'provision', 'guidance'],
      createdAt: '2024-11-28T14:45:00Z'
    }
  ]
};

module.exports = productionSeedData;
