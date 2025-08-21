export interface Group {
  id: string;
  name: string;
  description?: string;
  type: GroupType;
  status: GroupStatus;
  leaderId: string;
  leaderName: string;
  coLeaderIds?: string[];
  memberIds: string[];
  maxMembers?: number;
  meetingSchedule?: MeetingSchedule;
  location?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  churchId: string;
}

export type GroupType = 
  | 'small_group'
  | 'ministry'
  | 'youth'
  | 'seniors'
  | 'womens'
  | 'mens'
  | 'children'
  | 'worship'
  | 'service'
  | 'bible_study'
  | 'prayer'
  | 'outreach'
  | 'other';

export type GroupStatus = 'active' | 'inactive' | 'archived';

export interface MeetingSchedule {
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'irregular';
  dayOfWeek?: number; // 0 = Sunday, 1 = Monday, etc.
  time?: string; // HH:MM format
  duration?: number; // minutes
  startDate?: Date;
  endDate?: Date;
}

export interface GroupMember {
  id: string;
  groupId: string;
  memberId: string;
  memberName: string;
  role: GroupMemberRole;
  joinedAt: Date;
  status: 'active' | 'inactive';
  attendanceRecord?: AttendanceRecord[];
}

export type GroupMemberRole = 'leader' | 'co_leader' | 'member';

export interface AttendanceRecord {
  id: string;
  groupId: string;
  memberId: string;
  meetingDate: Date;
  present: boolean;
  notes?: string;
  recordedBy: string;
  recordedAt: Date;
}

export interface GroupCreateRequest {
  name: string;
  description?: string;
  type: GroupType;
  leaderId: string;
  coLeaderIds?: string[];
  maxMembers?: number;
  meetingSchedule?: Omit<MeetingSchedule, 'startDate' | 'endDate'> & {
    startDate?: string;
    endDate?: string;
  };
  location?: string;
  tags?: string[];
}

export interface GroupUpdateRequest {
  id: string;
  name?: string;
  description?: string;
  type?: GroupType;
  status?: GroupStatus;
  leaderId?: string;
  coLeaderIds?: string[];
  maxMembers?: number;
  meetingSchedule?: Omit<MeetingSchedule, 'startDate' | 'endDate'> & {
    startDate?: string;
    endDate?: string;
  };
  location?: string;
  tags?: string[];
}

export interface GroupSearchFilters {
  query?: string;
  type?: GroupType[];
  status?: GroupStatus[];
  leaderId?: string;
  tags?: string[];
  hasAvailableSpace?: boolean;
  sortBy?: 'name' | 'createdAt' | 'memberCount' | 'type';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface GroupSearchResponse {
  groups: Group[];
  total: number;
  filters: GroupSearchFilters;
}

export interface GroupStats {
  totalGroups: number;
  activeGroups: number;
  totalMembers: number;
  averageGroupSize: number;
  groupsByType: Record<GroupType, number>;
  attendanceRate: number;
}

export interface GroupAttendanceSession {
  id: string;
  groupId: string;
  meetingDate: Date;
  recordedBy: string;
  recordedAt: Date;
  attendees: {
    memberId: string;
    memberName: string;
    present: boolean;
    notes?: string;
  }[];
}

export interface AttendanceCreateRequest {
  groupId: string;
  meetingDate: string; // ISO date string
  attendees: {
    memberId: string;
    present: boolean;
    notes?: string;
  }[];
}
