// Test data fixtures for consistent testing
export const testUsers = {
  admin: {
    id: 'test-admin-1',
    email: 'admin@test.faithlink.com',
    firstName: 'Test',
    lastName: 'Admin',
    role: 'ADMIN' as const,
    isActive: true
  },
  pastor: {
    id: 'test-pastor-1', 
    email: 'pastor@test.faithlink.com',
    firstName: 'Test',
    lastName: 'Pastor',
    role: 'PASTOR' as const,
    isActive: true
  },
  groupLeader: {
    id: 'test-leader-1',
    email: 'leader@test.faithlink.com',
    firstName: 'Test',
    lastName: 'Leader',
    role: 'GROUP_LEADER' as const,
    isActive: true
  },
  member1: {
    id: 'test-member-1',
    email: 'member1@test.faithlink.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'MEMBER' as const,
    isActive: true
  },
  member2: {
    id: 'test-member-2',
    email: 'member2@test.faithlink.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'MEMBER' as const,
    isActive: true
  }
};

export const testGroups = {
  youthGroup: {
    id: 'test-group-1',
    name: 'Test Youth Ministry',
    description: 'Youth ministry group for testing',
    type: 'MINISTRY' as const,
    location: 'Youth Room',
    meetingTime: 'Sundays 6:00 PM',
    isActive: true
  },
  lifeGroup: {
    id: 'test-group-2',
    name: 'Test Life Group A',
    description: 'Small life group for testing',
    type: 'LIFEGROUP' as const,
    location: 'Room 101',
    meetingTime: 'Wednesdays 7:00 PM',
    isActive: true
  },
  team: {
    id: 'test-group-3',
    name: 'Test Worship Team',
    description: 'Worship team for testing',
    type: 'TEAM' as const,
    location: 'Sanctuary',
    meetingTime: 'Saturdays 10:00 AM',
    isActive: true
  }
};

export const testGroupMembers = [
  {
    id: 'test-gm-1',
    groupId: testGroups.youthGroup.id,
    userId: testUsers.groupLeader.id,
    role: 'LEADER' as const
  },
  {
    id: 'test-gm-2',
    groupId: testGroups.youthGroup.id,
    userId: testUsers.member1.id,
    role: 'MEMBER' as const
  },
  {
    id: 'test-gm-3',
    groupId: testGroups.lifeGroup.id,
    userId: testUsers.groupLeader.id,
    role: 'LEADER' as const
  },
  {
    id: 'test-gm-4',
    groupId: testGroups.lifeGroup.id,
    userId: testUsers.member2.id,
    role: 'MEMBER' as const
  }
];

export const testJourneyTemplates = {
  newMember: {
    id: 'test-template-1',
    name: 'New Member Journey',
    description: 'Complete spiritual growth path for new church members',
    difficulty: 'BEGINNER' as const,
    isActive: true
  },
  leadership: {
    id: 'test-template-2',
    name: 'Leadership Development',
    description: 'Path to develop church leadership skills',
    difficulty: 'ADVANCED' as const,
    isActive: true
  },
  discipleship: {
    id: 'test-template-3',
    name: 'Discipleship Foundation',
    description: 'Basic discipleship and spiritual formation',
    difficulty: 'INTERMEDIATE' as const,
    isActive: true
  }
};

export const testMilestones = [
  // New Member Journey milestones
  {
    id: 'test-milestone-1',
    templateId: testJourneyTemplates.newMember.id,
    name: 'Welcome & Orientation',
    description: 'Meet with pastor and learn about church vision',
    order: 1,
    isRequired: true
  },
  {
    id: 'test-milestone-2',
    templateId: testJourneyTemplates.newMember.id,
    name: 'Baptism Preparation',
    description: 'Complete baptism class and prepare for ceremony',
    order: 2,
    isRequired: true
  },
  {
    id: 'test-milestone-3',
    templateId: testJourneyTemplates.newMember.id,
    name: 'Small Group Connection',
    description: 'Join a life group and build community',
    order: 3,
    isRequired: false
  },
  // Leadership Development milestones
  {
    id: 'test-milestone-4',
    templateId: testJourneyTemplates.leadership.id,
    name: 'Character Assessment',
    description: 'Complete comprehensive character evaluation',
    order: 1,
    isRequired: true
  },
  {
    id: 'test-milestone-5',
    templateId: testJourneyTemplates.leadership.id,
    name: 'Leadership Training',
    description: 'Attend 8-week leadership development course',
    order: 2,
    isRequired: true
  }
];

export const testMemberJourneys = [
  {
    id: 'test-journey-1',
    memberId: testUsers.member1.id,
    templateId: testJourneyTemplates.newMember.id,
    mentorId: testUsers.groupLeader.id,
    status: 'ACTIVE' as const,
    notes: 'Started new member journey'
  },
  {
    id: 'test-journey-2',
    memberId: testUsers.member2.id,
    templateId: testJourneyTemplates.discipleship.id,
    mentorId: testUsers.pastor.id,
    status: 'ACTIVE' as const,
    notes: 'Progressing in discipleship'
  }
];

export const testMilestoneProgress = [
  {
    id: 'test-progress-1',
    journeyId: testMemberJourneys[0].id,
    milestoneId: testMilestones[0].id,
    status: 'COMPLETED' as const,
    submission: 'Completed orientation meeting with Pastor John',
    feedback: 'Great start! Looking forward to your journey'
  },
  {
    id: 'test-progress-2',
    journeyId: testMemberJourneys[0].id,
    milestoneId: testMilestones[1].id,
    status: 'IN_PROGRESS' as const
  },
  {
    id: 'test-progress-3',
    journeyId: testMemberJourneys[1].id,
    milestoneId: testMilestones[0].id,
    status: 'SUBMITTED' as const,
    submission: 'Attended all required sessions and ready for baptism',
    feedback: null
  }
];

export const testAttendanceSessions = [
  {
    id: 'test-session-1',
    groupId: testGroups.youthGroup.id,
    date: new Date('2024-01-07T18:00:00Z'),
    notes: 'Great discussion on faith and purpose'
  },
  {
    id: 'test-session-2', 
    groupId: testGroups.lifeGroup.id,
    date: new Date('2024-01-10T19:00:00Z'),
    notes: 'Prayer and fellowship time'
  }
];

export const testAttendanceRecords = [
  {
    id: 'test-record-1',
    sessionId: testAttendanceSessions[0].id,
    userId: testUsers.groupLeader.id,
    status: 'PRESENT' as const
  },
  {
    id: 'test-record-2',
    sessionId: testAttendanceSessions[0].id,
    userId: testUsers.member1.id,
    status: 'PRESENT' as const
  },
  {
    id: 'test-record-3',
    sessionId: testAttendanceSessions[1].id,
    userId: testUsers.groupLeader.id,
    status: 'PRESENT' as const
  },
  {
    id: 'test-record-4',
    sessionId: testAttendanceSessions[1].id,
    userId: testUsers.member2.id,
    status: 'LATE' as const,
    notes: 'Arrived 15 minutes late due to traffic'
  }
];

// Helper function to get all test data
export const getAllTestData = () => ({
  users: Object.values(testUsers),
  groups: Object.values(testGroups),
  groupMembers: testGroupMembers,
  journeyTemplates: Object.values(testJourneyTemplates),
  milestones: testMilestones,
  memberJourneys: testMemberJourneys,
  milestoneProgress: testMilestoneProgress,
  attendanceSessions: testAttendanceSessions,
  attendanceRecords: testAttendanceRecords
});

// Helper function to clear all test data (for cleanup)
export const getTestDataIds = () => ({
  userIds: Object.values(testUsers).map(u => u.id),
  groupIds: Object.values(testGroups).map(g => g.id),
  groupMemberIds: testGroupMembers.map(gm => gm.id),
  journeyTemplateIds: Object.values(testJourneyTemplates).map(jt => jt.id),
  milestoneIds: testMilestones.map(m => m.id),
  memberJourneyIds: testMemberJourneys.map(mj => mj.id),
  milestoneProgressIds: testMilestoneProgress.map(mp => mp.id),
  attendanceSessionIds: testAttendanceSessions.map(as => as.id),
  attendanceRecordIds: testAttendanceRecords.map(ar => ar.id)
});
