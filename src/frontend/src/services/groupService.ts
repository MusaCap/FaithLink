import { 
  Group, 
  GroupCreateRequest, 
  GroupUpdateRequest, 
  GroupSearchFilters, 
  GroupSearchResponse,
  GroupStats,
  GroupAttendanceSession,
  AttendanceCreateRequest,
  GroupMember
} from '../types/group';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

class GroupService {
  private requestCache = new Map<string, { data: any; timestamp: number }>();
  private pendingRequests = new Map<string, Promise<any>>();
  private readonly CACHE_DURATION = 30000; // 30 seconds
  private readonly MAX_RETRIES = 2;

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('auth_token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    let attempts = 0;
    while (attempts <= this.MAX_RETRIES) {
      try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
          ...options,
          headers,
        });

        if (!response.ok) {
          if (response.status === 429 && attempts < this.MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempts + 1)));
            attempts++;
            continue;
          }
          
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      } catch (error) {
        if (attempts < this.MAX_RETRIES && (error as Error).message.includes('fetch')) {
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          continue;
        }
        throw error;
      }
    }
  }

  private getCacheKey(url: string, options: RequestInit = {}): string {
    return `${url}-${JSON.stringify(options.body || {})}`;
  }

  private isValidCache(cacheKey: string): boolean {
    const cached = this.requestCache.get(cacheKey);
    return cached ? (Date.now() - cached.timestamp) < this.CACHE_DURATION : false;
  }

  // Group CRUD Operations
  async getGroups(filters?: GroupSearchFilters): Promise<GroupSearchResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.query) queryParams.append('query', filters.query);
      if (filters.type?.length) queryParams.append('type', filters.type.join(','));
      if (filters.status?.length) queryParams.append('status', filters.status.join(','));
      if (filters.leaderId) queryParams.append('leaderId', filters.leaderId);
      if (filters.tags?.length) queryParams.append('tags', filters.tags.join(','));
      if (filters.hasAvailableSpace !== undefined) queryParams.append('hasAvailableSpace', filters.hasAvailableSpace.toString());
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.offset) queryParams.append('offset', filters.offset.toString());
    }

    const url = `/api/groups${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const cacheKey = this.getCacheKey(url);
    
    // Check cache first
    if (this.isValidCache(cacheKey)) {
      return this.requestCache.get(cacheKey)!.data;
    }
    
    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }
    
    // Make new request
    const request = this.fetchWithAuth(url).then(data => {
      this.requestCache.set(cacheKey, { data, timestamp: Date.now() });
      this.pendingRequests.delete(cacheKey);
      return data;
    }).catch(error => {
      this.pendingRequests.delete(cacheKey);
      throw error;
    });
    
    this.pendingRequests.set(cacheKey, request);
    return request;
  }

  async getGroup(id: string): Promise<Group> {
    return this.fetchWithAuth(`/api/groups/${id}`);
  }

  async createGroup(groupData: GroupCreateRequest): Promise<Group> {
    return this.fetchWithAuth('/api/groups', {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  }

  async updateGroup(groupData: GroupUpdateRequest): Promise<Group> {
    return this.fetchWithAuth(`/api/groups/${groupData.id}`, {
      method: 'PUT',
      body: JSON.stringify(groupData),
    });
  }

  async deleteGroup(id: string): Promise<void> {
    await this.fetchWithAuth(`/api/groups/${id}`, {
      method: 'DELETE',
    });
  }

  // Group Members
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    const response = await this.fetchWithAuth(`/api/groups/${groupId}/members`);
    // Backend returns {groupId, groupName, members, totalMembers}, extract members array
    return response.members || [];
  }

  async addGroupMember(groupId: string, memberId: string, role: 'member' | 'co_leader' = 'member'): Promise<GroupMember> {
    return this.fetchWithAuth(`/api/groups/${groupId}/members`, {
      method: 'POST',
      body: JSON.stringify({ memberId, role }),
    });
  }

  async updateGroupMember(groupId: string, memberId: string, updates: { role?: 'member' | 'co_leader'; status?: 'active' | 'inactive' }): Promise<GroupMember> {
    return this.fetchWithAuth(`/api/groups/${groupId}/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async removeGroupMember(groupId: string, memberId: string): Promise<void> {
    await this.fetchWithAuth(`/api/groups/${groupId}/members/${memberId}`, {
      method: 'DELETE',
    });
  }

  // Attendance Management
  async getGroupAttendance(groupId: string, startDate?: string, endDate?: string): Promise<GroupAttendanceSession[]> {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    
    const url = `/api/groups/${groupId}/attendance${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.fetchWithAuth(url);
  }

  async recordAttendance(attendanceData: AttendanceCreateRequest): Promise<GroupAttendanceSession> {
    return this.fetchWithAuth(`/api/groups/${attendanceData.groupId}/attendance`, {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  }

  async updateAttendance(groupId: string, sessionId: string, updates: Partial<AttendanceCreateRequest>): Promise<GroupAttendanceSession> {
    return this.fetchWithAuth(`/api/groups/${groupId}/attendance/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteAttendance(groupId: string, sessionId: string): Promise<void> {
    await this.fetchWithAuth(`/api/groups/${groupId}/attendance/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Group Statistics
  async getGroupStats(): Promise<GroupStats> {
    return this.fetchWithAuth('/api/groups/stats');
  }

  async getGroupAttendanceStats(groupId: string, period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<{
    averageAttendance: number;
    attendanceRate: number;
    totalMeetings: number;
    memberAttendance: { memberId: string; memberName: string; attendanceRate: number }[];
  }> {
    return this.fetchWithAuth(`/api/groups/${groupId}/stats/attendance?period=${period}`);
  }

  // Group Export
  async exportGroups(filters?: GroupSearchFilters): Promise<Blob> {
    const queryParams = new URLSearchParams();
    if (filters) {
      if (filters.query) queryParams.append('query', filters.query);
      if (filters.type?.length) queryParams.append('type', filters.type.join(','));
      if (filters.status?.length) queryParams.append('status', filters.status.join(','));
    }

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/api/groups/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }

  // Bulk Operations
  async bulkUpdateGroups(groupIds: string[], updates: Partial<Group>): Promise<{ updated: number }> {
    return this.fetchWithAuth('/api/groups/bulk', {
      method: 'PUT',
      body: JSON.stringify({ groupIds, updates }),
    });
  }

  async bulkDeleteGroups(groupIds: string[]): Promise<{ deleted: number }> {
    return this.fetchWithAuth('/api/groups/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ groupIds }),
    });
  }

  // Group Templates and Suggestions
  async getGroupTypes(): Promise<{ value: string; label: string; description: string }[]> {
    return [
      { value: 'small_group', label: 'Small Group', description: 'Intimate fellowship and Bible study groups' },
      { value: 'ministry', label: 'Ministry Team', description: 'Service-focused ministry groups' },
      { value: 'youth', label: 'Youth Group', description: 'Teen and young adult groups' },
      { value: 'seniors', label: 'Seniors Group', description: 'Groups for older adults' },
      { value: 'womens', label: "Women's Group", description: "Women's fellowship and study groups" },
      { value: 'mens', label: "Men's Group", description: "Men's fellowship and study groups" },
      { value: 'children', label: "Children's Group", description: 'Groups for children and families' },
      { value: 'worship', label: 'Worship Team', description: 'Music and worship ministry teams' },
      { value: 'service', label: 'Service Team', description: 'Community service and outreach teams' },
      { value: 'bible_study', label: 'Bible Study', description: 'Scripture study and discussion groups' },
      { value: 'prayer', label: 'Prayer Group', description: 'Prayer and intercession groups' },
      { value: 'outreach', label: 'Outreach Team', description: 'Evangelism and community outreach' },
      { value: 'other', label: 'Other', description: 'Custom group types' },
    ];
  }
}

export const groupService = new GroupService();
