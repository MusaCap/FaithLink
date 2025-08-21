export interface AttendanceRecord {
  id: string;
  groupId: string;
  memberId: string;
  memberName: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
  recordedBy: string;
  recordedByName: string;
  recordedAt: string;
  updatedAt?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceSession {
  id: string;
  groupId: string;
  groupName: string;
  date: string;
  startTime?: string;
  endTime?: string;
  topic?: string;
  notes?: string;
  totalMembers: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  recordedBy: string;
  recordedByName: string;
  recordedAt: string;
  records: AttendanceRecord[];
}

export interface AttendanceCreateRequest {
  groupId: string;
  date: string;
  startTime?: string;
  endTime?: string;
  topic?: string;
  notes?: string;
  records: {
    memberId: string;
    status: AttendanceStatus;
    notes?: string;
  }[];
}

export interface AttendanceUpdateRequest {
  id: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  topic?: string;
  notes?: string;
  records?: {
    memberId: string;
    status: AttendanceStatus;
    notes?: string;
  }[];
}

export interface AttendanceFilters {
  groupId?: string;
  memberId?: string;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
  recordedBy?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'date' | 'memberName' | 'status' | 'recordedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface AttendanceStats {
  groupId: string;
  totalSessions: number;
  averageAttendance: number;
  attendanceRate: number;
  memberStats: {
    memberId: string;
    memberName: string;
    totalSessions: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    attendanceRate: number;
  }[];
  recentTrends: {
    date: string;
    attendanceRate: number;
    presentCount: number;
    totalMembers: number;
  }[];
}

export interface AttendanceResponse {
  sessions: AttendanceSession[];
  total: number;
  page: number;
  limit: number;
}
