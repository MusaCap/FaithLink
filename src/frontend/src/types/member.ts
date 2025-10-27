export interface Member {
  id: string;
  memberNumber: string; // Unique member number for financial system integration
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: 'admin' | 'pastor' | 'group_leader' | 'member';
  dateOfBirth?: Date;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  profilePhoto?: string;
  membershipStatus: 'active' | 'inactive' | 'pending' | 'visitor';
  joinDate: Date;
  tags: string[];
  notes?: string;
  deaconId?: string; // Assigned deacon for pastoral care
  assignedDeacon?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  spiritualJourney?: {
    baptismDate?: Date;
    salvationDate?: Date;
    currentStage?: string;
    notes?: string;
  };
  groupMemberships?: {
    groupId: string;
    groupName: string;
    role: 'member' | 'leader' | 'assistant';
    joinDate: Date;
  }[];
  attendance?: {
    eventId: string;
    eventName: string;
    date: Date;
    attended: boolean;
  }[];
  careHistory?: {
    date: Date;
    type: 'visit' | 'call' | 'prayer' | 'counseling' | 'other';
    notes: string;
    careGiver: string;
  }[];
  preferences?: {
    communicationMethod: 'email' | 'phone' | 'text' | 'app';
    newsletter: boolean;
    eventNotifications: boolean;
    privacyLevel: 'public' | 'members' | 'leaders' | 'private';
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface MemberCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  memberNumber?: string; // Optional - auto-generated if not provided
  phone?: string;
  dateOfBirth?: Date;
  address?: Member['address'];
  membershipStatus: Member['membershipStatus'];
  tags?: string[];
  notes?: string;
  deaconId?: string; // Assigned deacon for pastoral care
  emergencyContact?: Member['emergencyContact'];
  preferences?: Member['preferences'];
}

export interface MemberUpdateRequest extends Partial<MemberCreateRequest> {
  id: string;
}

export interface MemberSearchFilters {
  query?: string;
  tags?: string[];
  membershipStatus?: Member['membershipStatus'][];
  ageRange?: {
    min?: number;
    max?: number;
  };
  joinDateRange?: {
    start?: Date;
    end?: Date;
  };
  groups?: string[];
  sortBy?: 'firstName' | 'lastName' | 'joinDate' | 'lastActivity';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface MemberSearchResponse {
  members: Member[];
  total: number;
  filters: MemberSearchFilters;
}

export interface MemberFormData extends Omit<Member, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'> {
  id?: string;
}

export type MemberFormStep = 
  | 'basic'
  | 'contact' 
  | 'spiritual'
  | 'groups'
  | 'preferences'
  | 'review';

export interface MemberTag {
  id: string;
  name: string;
  description?: string;
  color: string;
  category: 'demographic' | 'spiritual' | 'interest' | 'skill' | 'role' | 'other';
  isSystemTag: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface MemberStats {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  membersByStatus: Record<Member['membershipStatus'], number>;
  membersByAge: {
    children: number;
    youth: number;
    adults: number;
    seniors: number;
  };
  topTags: {
    tag: string;
    count: number;
  }[];
}
