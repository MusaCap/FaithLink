# 🔥 Firebase Data Model Implementation

## Database Structure Design

### Firebase Collections Structure

```javascript
// Firebase Firestore Collections

// Members Collection
members: {
  [memberId]: {
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    dateOfBirth: timestamp,
    gender: string, // "male" | "female" | "other"
    address: {
      street: string,
      city: string,
      state: string,
      zipCode: string
    },
    maritalStatus: string, // "single" | "married" | "divorced" | "widowed"
    spiritualStatus: string,
    profilePhotoUrl: string,
    notes: string,
    tags: string[], // ["new_believer", "needs_followup"]
    groups: string[], // Array of group IDs
    familyConnections: string[], // Array of member IDs
    createdAt: timestamp,
    updatedAt: timestamp,
    isActive: boolean
  }
}

// Groups Collection
groups: {
  [groupId]: {
    id: string,
    name: string,
    type: string, // "ministry" | "lifegroup" | "team"
    description: string,
    leaderId: string, // Reference to member ID
    members: string[], // Array of member IDs
    createdAt: timestamp,
    isActive: boolean
  }
}

// Journey Templates Collection
journeyTemplates: {
  [templateId]: {
    id: string,
    name: string,
    description: string,
    milestones: [{
      id: string,
      name: string,
      description: string,
      sequence: number
    }],
    createdAt: timestamp,
    isActive: boolean
  }
}

// Journey Stages Collection
journeyStages: {
  [stageId]: {
    id: string,
    memberId: string,
    templateId: string,
    milestoneId: string,
    status: string, // "not_started" | "in_progress" | "completed"
    autoProgress: boolean,
    flagForFollowUp: boolean,
    completedAt: timestamp,
    notes: string
  }
}

// Events Collection
events: {
  [eventId]: {
    id: string,
    title: string,
    description: string,
    dateTime: timestamp,
    location: string,
    groupId: string, // Optional - null for church-wide events
    tags: string[],
    calendarType: string, // "weekly" | "monthly" | "oneoff"
    attendees: string[], // Array of member IDs
    createdBy: string,
    createdAt: timestamp
  }
}

// Care Logs Collection
careLogs: {
  [careLogId]: {
    id: string,
    memberId: string,
    caregiverId: string, // Member or Admin ID
    type: string, // "prayer" | "visit" | "counseling" | "call"
    notes: string,
    followUpRequired: boolean,
    confidential: boolean,
    followUpDate: timestamp,
    createdAt: timestamp
  }
}

// Messages Collection
messages: {
  [messageId]: {
    id: string,
    senderId: string,
    recipientType: string, // "member" | "group"
    recipientId: string,
    channel: string, // "email" | "sms" | "inapp"
    templateId: string, // Optional
    subject: string,
    body: string,
    status: string, // "sent" | "delivered" | "opened" | "failed"
    sentAt: timestamp,
    openedAt: timestamp,
    scheduledFor: timestamp // Optional for scheduled messages
  }
}

// Message Templates Collection
messageTemplates: {
  [templateId]: {
    id: string,
    name: string,
    channel: string,
    subject: string,
    body: string,
    variables: string[], // ["firstName", "groupName"]
    createdBy: string,
    createdAt: timestamp
  }
}

// Tags Collection
tags: {
  [tagId]: {
    id: string,
    label: string,
    category: string, // "member" | "event" | "group"
    color: string, // Hex color code
    createdAt: timestamp
  }
}

// Files Collection
files: {
  [fileId]: {
    id: string,
    groupId: string,
    fileName: string,
    fileUrl: string,
    fileSize: number,
    mimeType: string,
    uploadedBy: string,
    uploadedAt: timestamp
  }
}

// User Roles Collection (for authentication and permissions)
userRoles: {
  [userId]: {
    id: string,
    email: string,
    role: string, // "admin" | "pastor" | "care_team" | "group_leader" | "member"
    permissions: string[],
    assignedGroups: string[], // For group leaders
    isActive: boolean,
    lastLogin: timestamp
  }
}
```

## Firebase Security Rules

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to get user role
    function getUserRole() {
      return get(/databases/$(database)/documents/userRoles/$(request.auth.uid)).data.role;
    }
    
    // Helper function to check admin access
    function isAdmin() {
      return getUserRole() == 'admin';
    }
    
    // Helper function to check pastor/care team access
    function isPastorOrCareTeam() {
      return getUserRole() in ['admin', 'pastor', 'care_team'];
    }
    
    // Members collection rules
    match /members/{memberId} {
      allow read: if isAuthenticated();
      allow write: if isPastorOrCareTeam();
    }
    
    // Groups collection rules
    match /groups/{groupId} {
      allow read: if isAuthenticated();
      allow write: if isPastorOrCareTeam();
    }
    
    // Journey templates and stages
    match /journeyTemplates/{templateId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    match /journeyStages/{stageId} {
      allow read: if isAuthenticated();
      allow write: if isPastorOrCareTeam();
    }
    
    // Events
    match /events/{eventId} {
      allow read: if isAuthenticated();
      allow write: if isPastorOrCareTeam();
    }
    
    // Care logs (sensitive data)
    match /careLogs/{careLogId} {
      allow read: if isPastorOrCareTeam() && 
        (resource.data.confidential == false || 
         resource.data.caregiverId == request.auth.uid);
      allow write: if isPastorOrCareTeam();
    }
    
    // Messages
    match /messages/{messageId} {
      allow read: if isAuthenticated();
      allow write: if isPastorOrCareTeam();
    }
    
    // User roles (admin only)
    match /userRoles/{userId} {
      allow read: if request.auth.uid == userId || isAdmin();
      allow write: if isAdmin();
    }
  }
}
```

## Firebase Cloud Functions

```javascript
// Cloud Functions for complex business logic

// Function to auto-progress journey stages
exports.autoProgressJourney = functions.firestore
  .document('journeyStages/{stageId}')
  .onUpdate(async (change, context) => {
    const newValue = change.after.data();
    const previousValue = change.before.data();
    
    // If stage was just completed and auto-progress is enabled
    if (newValue.status === 'completed' && 
        previousValue.status !== 'completed' && 
        newValue.autoProgress) {
      
      // Find next milestone and create stage
      const template = await admin.firestore()
        .doc(`journeyTemplates/${newValue.templateId}`)
        .get();
      
      const milestones = template.data().milestones;
      const currentMilestone = milestones.find(m => m.id === newValue.milestoneId);
      const nextMilestone = milestones.find(m => m.sequence === currentMilestone.sequence + 1);
      
      if (nextMilestone) {
        await admin.firestore().collection('journeyStages').add({
          memberId: newValue.memberId,
          templateId: newValue.templateId,
          milestoneId: nextMilestone.id,
          status: 'not_started',
          autoProgress: true,
          flagForFollowUp: false
        });
      }
    }
  });

// Function to send scheduled messages
exports.sendScheduledMessages = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    
    const scheduledMessages = await admin.firestore()
      .collection('messages')
      .where('status', '==', 'scheduled')
      .where('scheduledFor', '<=', now)
      .get();
    
    const batch = admin.firestore().batch();
    
    scheduledMessages.forEach(doc => {
      batch.update(doc.ref, {
        status: 'sent',
        sentAt: now
      });
      
      // Add to email/SMS queue here
      // Integration with SendGrid/Twilio would happen here
    });
    
    await batch.commit();
  });

// Function to calculate engagement metrics
exports.updateEngagementMetrics = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    // Calculate member engagement scores
    // Update group health metrics  
    // Flag members needing follow-up
    
    const membersSnapshot = await admin.firestore()
      .collection('members')
      .get();
    
    const batch = admin.firestore().batch();
    
    for (const memberDoc of membersSnapshot.docs) {
      const memberId = memberDoc.id;
      
      // Calculate engagement score based on:
      // - Event attendance frequency
      // - Journey progress
      // - Group participation
      
      const engagementScore = await calculateEngagementScore(memberId);
      
      batch.update(memberDoc.ref, {
        engagementScore: engagementScore,
        lastEngagementUpdate: admin.firestore.Timestamp.now()
      });
    }
    
    await batch.commit();
  });
```

## Data Migration & Seeding

```javascript
// Sample data for testing/seeding

const sampleData = {
  journeyTemplates: [
    {
      name: "New Believer Journey",
      description: "Path for new members to integrate into church life",
      milestones: [
        { name: "Welcome Meeting", sequence: 1, description: "Initial pastoral meeting" },
        { name: "Bible Study Basics", sequence: 2, description: "Complete introductory Bible study" },
        { name: "Baptism", sequence: 3, description: "Public declaration of faith" },
        { name: "Membership Class", sequence: 4, description: "Understanding church values and commitment" },
        { name: "Ministry Involvement", sequence: 5, description: "Join a ministry team" }
      ]
    }
  ],
  
  tags: [
    { label: "New Believer", category: "member", color: "#7ED321" },
    { label: "Needs Follow-up", category: "member", color: "#F5A623" },
    { label: "Leadership Track", category: "member", color: "#4A90E2" },
    { label: "Prayer Request", category: "member", color: "#D0021B" }
  ],
  
  messageTemplates: [
    {
      name: "Welcome New Member",
      channel: "email",
      subject: "Welcome to {{churchName}}!",
      body: "Dear {{firstName}}, Welcome to our church family! We're excited to have you join us...",
      variables: ["firstName", "churchName"]
    }
  ]
};

// Migration script to set up initial data
async function initializeDatabase() {
  const db = admin.firestore();
  
  // Create journey templates
  for (const template of sampleData.journeyTemplates) {
    await db.collection('journeyTemplates').add({
      ...template,
      createdAt: admin.firestore.Timestamp.now(),
      isActive: true
    });
  }
  
  // Create tags
  for (const tag of sampleData.tags) {
    await db.collection('tags').add({
      ...tag,
      createdAt: admin.firestore.Timestamp.now()
    });
  }
  
  console.log('Database initialized successfully');
}
```

## Integration with Bubble.io

```javascript
// Custom Bubble.io actions for Firebase integration

// Action: Create Member
async function createMember(memberData) {
  const db = firebase.firestore();
  
  try {
    const docRef = await db.collection('members').add({
      ...memberData,
      createdAt: firebase.firestore.Timestamp.now(),
      updatedAt: firebase.firestore.Timestamp.now(),
      isActive: true
    });
    
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Action: Search Members
async function searchMembers(searchTerm, tags = [], limit = 20) {
  const db = firebase.firestore();
  let query = db.collection('members')
    .where('isActive', '==', true);
  
  if (tags.length > 0) {
    query = query.where('tags', 'array-contains-any', tags);
  }
  
  const snapshot = await query.limit(limit).get();
  
  const members = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    if (!searchTerm || 
        data.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      members.push({ id: doc.id, ...data });
    }
  });
  
  return members;
}
```

## Performance Optimization

### Indexing Strategy
```javascript
// Recommended Firestore indexes
{
  "indexes": [
    {
      "collectionGroup": "members",
      "fields": [
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "lastName", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "members", 
      "fields": [
        { "fieldPath": "tags", "arrayConfig": "CONTAINS" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "journeyStages",
      "fields": [
        { "fieldPath": "memberId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    }
  ]
}
```

## Next Implementation Steps

1. **Set up Firebase Project**
   - Create new Firebase project
   - Enable Firestore, Authentication, Storage
   - Configure security rules

2. **Initialize Data Structure**
   - Run migration scripts
   - Seed with sample data
   - Set up Cloud Functions

3. **Bubble.io Integration**
   - Configure Firebase plugin in Bubble.io
   - Set up authentication flow
   - Create custom actions for CRUD operations

4. **Testing & Validation**
   - Test data relationships
   - Validate security rules
   - Performance testing with sample data

**Estimated Setup Time**: 3-4 days
**Technical Requirements**: Firebase console access, basic JavaScript knowledge
