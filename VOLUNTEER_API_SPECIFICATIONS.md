# 📋 Volunteer Management API Specifications

## 🔗 **Base Configuration**
```
Base URL: ${NEXT_PUBLIC_API_URL}/api
Authentication: Bearer Token (JWT)
Content-Type: application/json
```

---

## 👥 **Volunteers API Endpoints**

### **GET /api/volunteers**
**Purpose:** Retrieve list of volunteers with filtering and pagination

**Query Parameters:**
```typescript
interface VolunteerQueryParams {
  page?: number;              // Page number (default: 1)
  limit?: number;             // Items per page (default: 20)
  skills?: string;            // Comma-separated skills filter
  ministry?: string;          // Ministry area filter
  active?: boolean;           // Active status filter
  backgroundCheck?: string;   // Background check status
  search?: string;            // Search by name/email
}
```

**Response:**
```typescript
interface VolunteerListResponse {
  volunteers: {
    id: string;
    memberId: string;
    skills: string[];
    interests: string[];
    maxHoursPerWeek?: number;
    isActive: boolean;
    backgroundCheck: BackgroundCheckStatus;
    createdAt: string;
    member: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      profilePhotoUrl?: string;
    };
    _count: {
      opportunities: number;
      signups: number;
      hours: number;
    };
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

**Example:**
```bash
GET /api/volunteers?skills=music,teaching&active=true&page=1&limit=10
```

---

### **POST /api/volunteers**
**Purpose:** Create new volunteer profile

**Request Body:**
```typescript
interface CreateVolunteerRequest {
  memberId: string;
  skills?: string[];
  interests?: string[];
  availability?: object;      // Weekly schedule JSON
  maxHoursPerWeek?: number;
  preferredMinistries?: string[];
  transportationAvailable?: boolean;
  willingToTravel?: boolean;
  emergencyContact?: object;  // Contact info JSON
  notes?: string;
}
```

**Response:**
```typescript
interface CreateVolunteerResponse {
  volunteer: {
    id: string;
    memberId: string;
    skills: string[];
    interests: string[];
    availability?: object;
    maxHoursPerWeek?: number;
    preferredMinistries: string[];
    transportationAvailable: boolean;
    willingToTravel: boolean;
    isActive: boolean;
    backgroundCheck: BackgroundCheckStatus;
    emergencyContact?: object;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    member: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
  };
}
```

---

### **GET /api/volunteers/:id**
**Purpose:** Get detailed volunteer information

**Response:**
```typescript
interface VolunteerDetailResponse {
  volunteer: {
    id: string;
    memberId: string;
    skills: string[];
    interests: string[];
    availability?: object;
    maxHoursPerWeek?: number;
    preferredMinistries: string[];
    transportationAvailable: boolean;
    willingToTravel: boolean;
    isActive: boolean;
    backgroundCheck: BackgroundCheckStatus;
    emergencyContact?: object;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    totalHours: number;        // Calculated total
    member: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      profilePhotoUrl?: string;
      address?: string;
      dateOfBirth?: string;
    };
    opportunities: {
      id: string;
      opportunity: {
        id: string;
        title: string;
        ministry: string;
        startDate: string;
        endDate?: string;
        status: OpportunityStatus;
      };
    }[];
    signups: {
      id: string;
      status: SignupStatus;
      scheduledDate?: string;
      opportunity: {
        id: string;
        title: string;
        ministry: string;
        startDate: string;
      };
    }[];
    hours: {
      id: string;
      date: string;
      hoursWorked: number;
      description: string;
      isVerified: boolean;
      opportunity?: {
        id: string;
        title: string;
        ministry: string;
      };
    }[];
    trainingCompletions: {
      id: string;
      completedAt: string;
      expiresAt?: string;
      training: {
        id: string;
        name: string;
        category: string;
      };
    }[];
  };
}
```

---

### **PUT /api/volunteers/:id**
**Purpose:** Update volunteer profile

**Request Body:**
```typescript
interface UpdateVolunteerRequest {
  skills?: string[];
  interests?: string[];
  availability?: object;
  maxHoursPerWeek?: number;
  preferredMinistries?: string[];
  transportationAvailable?: boolean;
  willingToTravel?: boolean;
  backgroundCheck?: BackgroundCheckStatus;
  emergencyContact?: object;
  notes?: string;
  isActive?: boolean;
}
```

---

### **DELETE /api/volunteers/:id**
**Purpose:** Delete volunteer profile

**Response:**
```typescript
interface DeleteResponse {
  message: string;
}
```

---

### **GET /api/volunteers/:id/opportunities**
**Purpose:** Get volunteer's assigned opportunities

**Query Parameters:**
```typescript
interface OpportunityQueryParams {
  status?: OpportunityStatus;
  upcoming?: boolean;
}
```

**Response:**
```typescript
interface VolunteerOpportunitiesResponse {
  opportunities: {
    id: string;
    volunteerId: string;
    opportunityId: string;
    assignedBy: string;
    assignedDate: string;
    role?: string;
    isActive: boolean;
    opportunity: {
      id: string;
      title: string;
      description: string;
      ministry: string;
      startDate: string;
      endDate?: string;
      status: OpportunityStatus;
      coordinator: {
        firstName: string;
        lastName: string;
        email: string;
      };
      _count: {
        signups: number;
      };
    };
  }[];
}
```

---

### **GET /api/volunteers/:id/hours**
**Purpose:** Get volunteer's logged hours

**Query Parameters:**
```typescript
interface HoursQueryParams {
  page?: number;
  limit?: number;
  startDate?: string;        // ISO date string
  endDate?: string;          // ISO date string
  verified?: boolean;
}
```

**Response:**
```typescript
interface VolunteerHoursResponse {
  hours: {
    id: string;
    volunteerId: string;
    opportunityId?: string;
    date: string;
    startTime?: string;
    endTime?: string;
    hoursWorked: number;
    description: string;
    category: string;
    ministry?: string;
    isVerified: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
    location?: string;
    notes?: string;
    createdAt: string;
    opportunity?: {
      id: string;
      title: string;
      ministry: string;
    };
  }[];
  totalHours: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

---

### **POST /api/volunteers/:id/hours**
**Purpose:** Log volunteer hours

**Request Body:**
```typescript
interface LogHoursRequest {
  opportunityId?: string;
  date: string;              // ISO date string
  startTime?: string;        // ISO datetime string
  endTime?: string;          // ISO datetime string
  hoursWorked: number;
  description: string;
  category: string;
  ministry?: string;
  location?: string;
  notes?: string;
}
```

---

### **GET /api/volunteers/member/:memberId**
**Purpose:** Get volunteer profile by member ID

---

### **GET /api/volunteers/stats**
**Purpose:** Get volunteer statistics

**Response:**
```typescript
interface VolunteerStatsResponse {
  totalVolunteers: number;
  activeVolunteers: number;
  totalHours: number;
  totalOpportunities: number;
  activeOpportunities: number;
  topSkills: {
    skill: string;
    count: number;
  }[];
}
```

---

## 🎯 **Volunteer Opportunities API Endpoints**

### **GET /api/volunteer-opportunities**
**Purpose:** List volunteer opportunities

**Query Parameters:**
```typescript
interface OpportunityQueryParams {
  page?: number;
  limit?: number;
  ministry?: string;
  urgency?: VolunteerPriority;
  status?: OpportunityStatus;
  upcoming?: boolean;
  skills?: string;           // Comma-separated
  search?: string;
}
```

**Response:**
```typescript
interface OpportunityListResponse {
  opportunities: {
    id: string;
    title: string;
    description: string;
    ministry: string;
    location?: string;
    skillsRequired: string[];
    startDate: string;
    endDate?: string;
    isRecurring: boolean;
    estimatedHours?: number;
    maxVolunteers?: number;
    currentVolunteers: number;
    urgency: VolunteerPriority;
    status: OpportunityStatus;
    coordinator: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
    church?: {
      id: string;
      name: string;
    };
    _count: {
      signups: number;
      volunteers: number;
    };
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

---

### **POST /api/volunteer-opportunities**
**Purpose:** Create new volunteer opportunity

**Request Body:**
```typescript
interface CreateOpportunityRequest {
  title: string;
  description: string;
  ministry: string;
  location?: string;
  contactEmail?: string;
  contactPhone?: string;
  skillsRequired?: string[];
  minAge?: number;
  maxAge?: number;
  backgroundCheckRequired?: boolean;
  trainingRequired?: string[];
  startDate: string;         // ISO date string
  endDate?: string;          // ISO date string
  isRecurring?: boolean;
  recurringSchedule?: object;
  estimatedHours?: number;
  maxVolunteers?: number;
  urgency?: VolunteerPriority;
  coordinatorId: string;
  churchId?: string;
}
```

---

### **GET /api/volunteer-opportunities/:id**
**Purpose:** Get detailed opportunity information

**Response:**
```typescript
interface OpportunityDetailResponse {
  opportunity: {
    id: string;
    title: string;
    description: string;
    ministry: string;
    location?: string;
    contactEmail?: string;
    contactPhone?: string;
    skillsRequired: string[];
    minAge?: number;
    maxAge?: number;
    backgroundCheckRequired: boolean;
    trainingRequired: string[];
    startDate: string;
    endDate?: string;
    isRecurring: boolean;
    recurringSchedule?: object;
    estimatedHours?: number;
    maxVolunteers?: number;
    currentVolunteers: number;
    isActive: boolean;
    urgency: VolunteerPriority;
    status: OpportunityStatus;
    coordinator: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
    church?: {
      id: string;
      name: string;
      address?: string;
    };
    volunteers: {
      id: string;
      assignedDate: string;
      role?: string;
      volunteer: {
        id: string;
        member: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          phone?: string;
        };
      };
    }[];
    signups: {
      id: string;
      status: SignupStatus;
      scheduledDate?: string;
      createdAt: string;
      volunteer: {
        id: string;
        member: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
        };
      };
    }[];
  };
}
```

---

### **PUT /api/volunteer-opportunities/:id**
**Purpose:** Update volunteer opportunity

---

### **DELETE /api/volunteer-opportunities/:id**
**Purpose:** Delete volunteer opportunity

---

### **GET /api/volunteer-opportunities/:id/signups**
**Purpose:** Get signups for opportunity

**Query Parameters:**
```typescript
interface SignupQueryParams {
  status?: SignupStatus;
}
```

---

### **POST /api/volunteer-opportunities/:id/signup**
**Purpose:** Sign up volunteer for opportunity

**Request Body:**
```typescript
interface SignupRequest {
  volunteerId: string;
  message?: string;
  specialRequests?: string;
  scheduledDate?: string;    // ISO date string
  scheduledStartTime?: string; // ISO datetime string
  scheduledEndTime?: string;   // ISO datetime string
  estimatedHours?: number;
}
```

**Response:**
```typescript
interface SignupResponse {
  signup: {
    id: string;
    volunteerId: string;
    opportunityId: string;
    status: SignupStatus;
    message?: string;
    specialRequests?: string;
    scheduledDate?: string;
    scheduledStartTime?: string;
    scheduledEndTime?: string;
    estimatedHours?: number;
    createdAt: string;
    volunteer: {
      id: string;
      member: {
        firstName: string;
        lastName: string;
        email: string;
      };
    };
    opportunity: {
      title: string;
      startDate: string;
    };
  };
  message?: string;          // Additional info (e.g., "Added to waitlist")
}
```

---

### **PUT /api/volunteer-opportunities/:id/signups/:signupId**
**Purpose:** Update signup status

**Request Body:**
```typescript
interface UpdateSignupRequest {
  status: SignupStatus;
  confirmedBy?: string;      // Member ID
  declinedReason?: string;
  actualHours?: number;
  feedback?: string;
  rating?: number;           // 1-5 stars
}
```

---

### **GET /api/volunteer-opportunities/search**
**Purpose:** Search opportunities with skill matching

**Query Parameters:**
```typescript
interface SearchParams {
  volunteerId?: string;      // For skill matching
  ministry?: string;
  urgent?: boolean;
}
```

---

### **GET /api/volunteer-opportunities/stats**
**Purpose:** Get opportunity statistics

**Response:**
```typescript
interface OpportunityStatsResponse {
  totalOpportunities: number;
  activeOpportunities: number;
  openOpportunities: number;
  urgentOpportunities: number;
  ministryBreakdown: {
    ministry: string;
    _count: {
      ministry: number;
    };
  }[];
  statusBreakdown: {
    status: OpportunityStatus;
    _count: {
      status: number;
    };
  }[];
}
```

---

## 🏷️ **TypeScript Type Definitions**

```typescript
// Enums
enum BackgroundCheckStatus {
  NOT_REQUIRED = 'NOT_REQUIRED',
  REQUIRED = 'REQUIRED',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  EXPIRED = 'EXPIRED',
  REJECTED = 'REJECTED'
}

enum VolunteerPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

enum OpportunityStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  FILLED = 'FILLED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD'
}

enum SignupStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED',
  WAITLISTED = 'WAITLISTED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
  CANCELLED = 'CANCELLED'
}

// Base Interfaces
interface Volunteer {
  id: string;
  memberId: string;
  skills: string[];
  interests: string[];
  availability?: object;
  maxHoursPerWeek?: number;
  preferredMinistries: string[];
  transportationAvailable: boolean;
  willingToTravel: boolean;
  isActive: boolean;
  backgroundCheck: BackgroundCheckStatus;
  emergencyContact?: object;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface VolunteerOpportunity {
  id: string;
  title: string;
  description: string;
  ministry: string;
  location?: string;
  contactEmail?: string;
  contactPhone?: string;
  skillsRequired: string[];
  minAge?: number;
  maxAge?: number;
  backgroundCheckRequired: boolean;
  trainingRequired: string[];
  startDate: string;
  endDate?: string;
  isRecurring: boolean;
  recurringSchedule?: object;
  estimatedHours?: number;
  maxVolunteers?: number;
  currentVolunteers: number;
  isActive: boolean;
  urgency: VolunteerPriority;
  status: OpportunityStatus;
  coordinatorId: string;
  churchId?: string;
  createdAt: string;
  updatedAt: string;
}

interface VolunteerSignup {
  id: string;
  volunteerId: string;
  opportunityId: string;
  status: SignupStatus;
  message?: string;
  specialRequests?: string;
  scheduledDate?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  estimatedHours?: number;
  confirmedAt?: string;
  confirmedBy?: string;
  declinedAt?: string;
  declinedReason?: string;
  completedAt?: string;
  actualHours?: number;
  feedback?: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

interface VolunteerHour {
  id: string;
  volunteerId: string;
  opportunityId?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  hoursWorked: number;
  description: string;
  category: string;
  ministry?: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🔒 **Authentication & Authorization**

### **Required Headers**
```typescript
const headers = {
  'Authorization': `Bearer ${authToken}`,
  'Content-Type': 'application/json'
};
```

### **Role-Based Access**
- **Admin/Pastor:** Full access to all endpoints
- **Volunteer Coordinator:** Manage opportunities and signups
- **Volunteer:** View opportunities, manage own profile and signups
- **Member:** Basic volunteer profile creation

### **Error Responses**
```typescript
interface ErrorResponse {
  error: string;
  message?: string;
  code?: string;
}

// Common HTTP Status Codes:
// 200: OK
// 201: Created
// 400: Bad Request
// 401: Unauthorized
// 403: Forbidden
// 404: Not Found
// 409: Conflict
// 500: Internal Server Error
```

---

## 📝 **API Usage Examples**

### **Create Volunteer Profile**
```typescript
const createVolunteer = async (memberData) => {
  const response = await fetch('/api/volunteers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      memberId: memberData.id,
      skills: ['music', 'teaching'],
      interests: ['worship', 'children'],
      maxHoursPerWeek: 15,
      preferredMinistries: ['worship', 'children'],
      transportationAvailable: true,
      emergencyContact: {
        name: 'Jane Doe',
        phone: '555-123-4567',
        relationship: 'spouse'
      }
    })
  });
  
  return response.json();
};
```

### **Sign Up for Opportunity**
```typescript
const signUpForOpportunity = async (opportunityId, volunteerId) => {
  const response = await fetch(`/api/volunteer-opportunities/${opportunityId}/signup`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      volunteerId,
      message: 'Excited to help with this opportunity!',
      scheduledDate: '2024-03-15',
      estimatedHours: 4
    })
  });
  
  return response.json();
};
```

### **Log Volunteer Hours**
```typescript
const logHours = async (volunteerId, hourData) => {
  const response = await fetch(`/api/volunteers/${volunteerId}/hours`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      opportunityId: hourData.opportunityId,
      date: '2024-03-15',
      startTime: '2024-03-15T09:00:00Z',
      endTime: '2024-03-15T13:00:00Z',
      hoursWorked: 4,
      description: 'Helped with event setup and cleanup',
      category: 'Direct Service',
      ministry: 'Events',
      location: 'Main Campus'
    })
  });
  
  return response.json();
};
```

This comprehensive API specification provides complete documentation for integrating with the volunteer management system, ensuring consistent implementation across the frontend and enabling third-party integrations.
