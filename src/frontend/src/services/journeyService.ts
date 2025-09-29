import { 
  JourneyTemplate,
  JourneyTemplateCreateRequest,
  JourneyTemplateUpdateRequest,
  JourneyTemplateFilters,
  JourneyTemplateResponse,
  MemberJourney,
  MemberJourneyCreateRequest,
  MemberJourneyUpdateRequest,
  MemberJourneyFilters,
  MemberJourneyResponse,
  MilestoneProgress,
  MilestoneSubmissionRequest,
  JourneyStats
} from '../types/journey';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const CACHE_TTL = 30000; // 30 seconds

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>();

class JourneyService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {},
    cacheKey?: string,
    cacheTTL: number = CACHE_TTL
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('auth_token');
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    // Check cache first
    if (cacheKey && options.method === 'GET') {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        console.log(`Cache hit for ${cacheKey}`);
        return cached.data;
      }
    }

    let lastError: Error = new Error('Request failed');
    
    // Retry logic
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(url, requestOptions);
        
        if (!response.ok) {
          if (response.status === 429) {
            // Rate limited - wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Cache successful GET requests
        if (cacheKey && options.method === 'GET') {
          cache.set(cacheKey, { 
            data, 
            timestamp: Date.now(), 
            ttl: cacheTTL 
          });
        }
        
        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt === 3) break;
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    throw lastError;
  }

  // Journey Template Management
  async getJourneyTemplates(filters: JourneyTemplateFilters = {}): Promise<JourneyTemplateResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, String(v)));
        } else {
          params.append(key, String(value));
        }
      }
    });
    
    const cacheKey = `journey_templates_${params.toString()}`;
    return this.request<JourneyTemplateResponse>(
      `/api/journey-templates?${params.toString()}`, 
      { method: 'GET' },
      cacheKey
    );
  }

  async getJourneyTemplate(templateId: string): Promise<JourneyTemplate> {
    const cacheKey = `journey_template_${templateId}`;
    return this.request<JourneyTemplate>(
      `/api/journey-templates/${templateId}`, 
      { method: 'GET' },
      cacheKey
    );
  }

  async createJourneyTemplate(data: JourneyTemplateCreateRequest): Promise<JourneyTemplate> {
    const result = await this.request<JourneyTemplate>(
      '/api/journey-templates', 
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    
    // Invalidate templates cache
    this.invalidateTemplateCache();
    
    return result;
  }

  async updateJourneyTemplate(data: JourneyTemplateUpdateRequest): Promise<JourneyTemplate> {
    const result = await this.request<JourneyTemplate>(
      `/api/journey-templates/${data.id}`, 
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    
    // Invalidate caches
    cache.delete(`journey_template_${data.id}`);
    this.invalidateTemplateCache();
    
    return result;
  }

  async deleteJourneyTemplate(templateId: string): Promise<void> {
    await this.request<void>(
      `/api/journey-templates/${templateId}`, 
      { method: 'DELETE' }
    );
    
    // Invalidate caches
    cache.delete(`journey_template_${templateId}`);
    this.invalidateTemplateCache();
  }

  async duplicateJourneyTemplate(templateId: string, newName: string): Promise<JourneyTemplate> {
    const result = await this.request<JourneyTemplate>(
      `/api/journey-templates/${templateId}/duplicate`, 
      {
        method: 'POST',
        body: JSON.stringify({ name: newName }),
      }
    );
    
    this.invalidateTemplateCache();
    return result;
  }

  // Member Journey Management
  async getMemberJourneys(filters: MemberJourneyFilters = {}): Promise<MemberJourneyResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    
    const cacheKey = `member_journeys_${params.toString()}`;
    return this.request<MemberJourneyResponse>(
      `/journeys/member-journeys?${params.toString()}`, 
      { method: 'GET' },
      cacheKey
    );
  }

  async getMemberJourney(journeyId: string): Promise<MemberJourney> {
    const cacheKey = `member_journey_${journeyId}`;
    return this.request<MemberJourney>(
      `/journeys/member-journeys/${journeyId}`, 
      { method: 'GET' },
      cacheKey
    );
  }

  async assignJourneyToMember(data: MemberJourneyCreateRequest): Promise<MemberJourney> {
    const result = await this.request<MemberJourney>(
      '/journeys/member-journeys', 
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    
    // Invalidate member journeys cache
    this.invalidateMemberJourneyCache();
    
    return result;
  }

  async updateMemberJourney(data: MemberJourneyUpdateRequest): Promise<MemberJourney> {
    const result = await this.request<MemberJourney>(
      `/journeys/member-journeys/${data.id}`, 
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    
    // Invalidate caches
    cache.delete(`member_journey_${data.id}`);
    this.invalidateMemberJourneyCache();
    
    return result;
  }

  async deleteMemberJourney(journeyId: string): Promise<void> {
    await this.request<void>(
      `/journeys/member-journeys/${journeyId}`, 
      { method: 'DELETE' }
    );
    
    // Invalidate caches
    cache.delete(`member_journey_${journeyId}`);
    this.invalidateMemberJourneyCache();
  }

  // Milestone Progress Management
  async getMilestoneProgress(journeyId: string, milestoneId: string): Promise<MilestoneProgress> {
    const cacheKey = `milestone_progress_${journeyId}_${milestoneId}`;
    return this.request<MilestoneProgress>(
      `/journeys/member-journeys/${journeyId}/milestones/${milestoneId}/progress`, 
      { method: 'GET' },
      cacheKey
    );
  }

  async startMilestone(journeyId: string, milestoneId: string): Promise<MilestoneProgress> {
    const result = await this.request<MilestoneProgress>(
      `/journeys/member-journeys/${journeyId}/milestones/${milestoneId}/start`, 
      { method: 'POST' }
    );
    
    // Invalidate related caches
    cache.delete(`member_journey_${journeyId}`);
    cache.delete(`milestone_progress_${journeyId}_${milestoneId}`);
    
    return result;
  }

  async completeMilestone(journeyId: string, milestoneId: string, notes?: string): Promise<MilestoneProgress> {
    const result = await this.request<MilestoneProgress>(
      `/journeys/member-journeys/${journeyId}/milestones/${milestoneId}/complete`, 
      {
        method: 'POST',
        body: JSON.stringify({ notes }),
      }
    );
    
    // Invalidate related caches
    cache.delete(`member_journey_${journeyId}`);
    cache.delete(`milestone_progress_${journeyId}_${milestoneId}`);
    
    return result;
  }

  async submitMilestone(data: MilestoneSubmissionRequest): Promise<MilestoneProgress> {
    const formData = new FormData();
    formData.append('type', data.type);
    formData.append('content', data.content);
    
    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });
    }

    const token = localStorage.getItem('auth_token');
    const response = await fetch(
      `${API_BASE_URL}/api/journeys/milestone-progress/${data.milestoneProgressId}/submit`,
      {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Invalidate related caches
    this.invalidateMemberJourneyCache();
    
    return result;
  }

  async approveMilestone(
    journeyId: string, 
    milestoneId: string, 
    feedback?: string
  ): Promise<MilestoneProgress> {
    const result = await this.request<MilestoneProgress>(
      `/journeys/member-journeys/${journeyId}/milestones/${milestoneId}/approve`, 
      {
        method: 'POST',
        body: JSON.stringify({ feedback }),
      }
    );
    
    // Invalidate related caches
    cache.delete(`member_journey_${journeyId}`);
    cache.delete(`milestone_progress_${journeyId}_${milestoneId}`);
    
    return result;
  }

  async requestMilestoneRevision(
    journeyId: string, 
    milestoneId: string, 
    feedback: string
  ): Promise<MilestoneProgress> {
    const result = await this.request<MilestoneProgress>(
      `/journeys/member-journeys/${journeyId}/milestones/${milestoneId}/request-revision`, 
      {
        method: 'POST',
        body: JSON.stringify({ feedback }),
      }
    );
    
    // Invalidate related caches
    cache.delete(`member_journey_${journeyId}`);
    cache.delete(`milestone_progress_${journeyId}_${milestoneId}`);
    
    return result;
  }

  // Statistics and Reporting
  async getJourneyStats(): Promise<JourneyStats> {
    const cacheKey = 'journey_stats';
    return this.request<JourneyStats>(
      '/journeys/stats', 
      { method: 'GET' },
      cacheKey,
      60000 // Cache stats for 1 minute
    );
  }

  async getMemberJourneyStats(memberId: string): Promise<any> {
    const cacheKey = `member_journey_stats_${memberId}`;
    return this.request<any>(
      `/journeys/members/${memberId}/stats`, 
      { method: 'GET' },
      cacheKey,
      60000
    );
  }

  // Bulk Operations
  async bulkAssignJourney(memberIds: string[], templateId: string, mentorId?: string): Promise<MemberJourney[]> {
    const result = await this.request<MemberJourney[]>(
      '/journeys/bulk-assign', 
      {
        method: 'POST',
        body: JSON.stringify({ memberIds, templateId, mentorId }),
      }
    );
    
    this.invalidateMemberJourneyCache();
    return result;
  }

  async bulkUpdateJourneyStatus(journeyIds: string[], status: string): Promise<void> {
    await this.request<void>(
      '/journeys/bulk-status', 
      {
        method: 'POST',
        body: JSON.stringify({ journeyIds, status }),
      }
    );
    
    this.invalidateMemberJourneyCache();
  }

  // Export Functions
  async exportJourneyTemplate(templateId: string, format: 'json' | 'pdf' = 'json'): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/journey-templates/${templateId}/export?format=${format}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }
    
    return response.blob();
  }

  async exportMemberJourneyProgress(journeyId: string, format: 'json' | 'pdf' = 'pdf'): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/journeys/member-journeys/${journeyId}/export?format=${format}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }
    
    return response.blob();
  }

  // Helper methods for cache management
  private invalidateTemplateCache() {
    for (const [key] of cache) {
      if (key.includes('journey_template')) {
        cache.delete(key);
      }
    }
  }

  private invalidateMemberJourneyCache() {
    for (const [key] of cache) {
      if (key.includes('member_journey') || key.includes('milestone_progress')) {
        cache.delete(key);
      }
    }
  }

  // Clear all caches (useful for logout)
  clearCache() {
    cache.clear();
    pendingRequests.clear();
  }
}

export const journeyService = new JourneyService();
