import { 
  Member, 
  MemberCreateRequest, 
  MemberUpdateRequest, 
  MemberSearchFilters, 
  MemberSearchResponse,
  MemberStats,
  MemberTag
} from '../types/member';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

class MemberService {
  private requestCache = new Map<string, { data: any; timestamp: number }>();
  private pendingRequests = new Map<string, Promise<any>>();
  private readonly CACHE_DURATION = 30000; // 30 seconds
  private readonly MAX_RETRIES = 2;

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = localStorage.getItem('auth_token');
    const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    let attempts = 0;
    while (attempts <= this.MAX_RETRIES) {
      try {
        const response = await fetch(fullUrl, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
            return;
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

  // Member CRUD Operations
  async getMembers(filters?: MemberSearchFilters): Promise<MemberSearchResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.query) queryParams.append('query', filters.query);
      if (filters.tags?.length) queryParams.append('tags', filters.tags.join(','));
      if (filters.membershipStatus?.length) queryParams.append('status', filters.membershipStatus.join(','));
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.offset) queryParams.append('offset', filters.offset.toString());
      
      if (filters.ageRange) {
        if (filters.ageRange.min) queryParams.append('ageMin', filters.ageRange.min.toString());
        if (filters.ageRange.max) queryParams.append('ageMax', filters.ageRange.max.toString());
      }
      
      if (filters.joinDateRange) {
        if (filters.joinDateRange.start) queryParams.append('joinStart', filters.joinDateRange.start.toISOString());
        if (filters.joinDateRange.end) queryParams.append('joinEnd', filters.joinDateRange.end.toISOString());
      }
      
      if (filters.groups?.length) queryParams.append('groups', filters.groups.join(','));
    }

    const url = `/api/members${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
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

  async getMember(id: string): Promise<Member> {
    return this.fetchWithAuth(`/api/members/${id}`);
  }

  async createMember(memberData: MemberCreateRequest): Promise<Member> {
    return this.fetchWithAuth('/api/members', {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  }

  async updateMember(memberData: MemberUpdateRequest): Promise<Member> {
    return this.fetchWithAuth(`/api/members/${memberData.id}`, {
      method: 'PUT',
      body: JSON.stringify(memberData),
    });
  }

  async deleteMember(id: string): Promise<void> {
    await this.fetchWithAuth(`/api/members/${id}`, {
      method: 'DELETE',
    });
  }

  // Member Stats
  async getMemberStats(): Promise<MemberStats> {
    return this.fetchWithAuth('/api/members/stats');
  }

  // Member Tags
  async getTags(): Promise<MemberTag[]> {
    return this.fetchWithAuth('/api/members/tags');
  }

  async createTag(tag: Omit<MemberTag, 'id' | 'createdAt' | 'createdBy'>): Promise<MemberTag> {
    return this.fetchWithAuth('/api/members/tags', {
      method: 'POST',
      body: JSON.stringify(tag),
    });
  }

  async updateTag(id: string, tag: Partial<MemberTag>): Promise<MemberTag> {
    return this.fetchWithAuth(`/api/members/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tag),
    });
  }

  async deleteTag(id: string): Promise<void> {
    await this.fetchWithAuth(`/api/members/tags/${id}`, {
      method: 'DELETE',
    });
  }

  // Member Profile Photo
  async uploadProfilePhoto(memberId: string, file: File): Promise<{ photoUrl: string }> {
    const token = localStorage.getItem('auth_token');
    const formData = new FormData();
    formData.append('photo', file);

    const response = await fetch(`${API_BASE_URL}/api/members/${memberId}/photo`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Member Search Suggestions
  async getSearchSuggestions(query: string): Promise<{ suggestions: string[] }> {
    return this.fetchWithAuth(`/api/members/search/suggestions?q=${encodeURIComponent(query)}`);
  }

  // Member Export
  async exportMembers(filters?: MemberSearchFilters): Promise<Blob> {
    const queryParams = new URLSearchParams();
    if (filters) {
      // Add same filter logic as getMembers
      if (filters.query) queryParams.append('query', filters.query);
      if (filters.tags?.length) queryParams.append('tags', filters.tags.join(','));
      if (filters.membershipStatus?.length) queryParams.append('status', filters.membershipStatus.join(','));
    }

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/api/members/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }

  // Member Bulk Operations
  async bulkUpdateMembers(memberIds: string[], updates: Partial<Member>): Promise<{ updated: number }> {
    return this.fetchWithAuth('/api/members/bulk', {
      method: 'PUT',
      body: JSON.stringify({ memberIds, updates }),
    });
  }

  async bulkDeleteMembers(memberIds: string[]): Promise<{ deleted: number }> {
    return this.fetchWithAuth('/api/members/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ memberIds }),
    });
  }
}

export const memberService = new MemberService();
