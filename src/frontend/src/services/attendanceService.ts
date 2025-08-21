import { 
  AttendanceSession, 
  AttendanceCreateRequest, 
  AttendanceUpdateRequest, 
  AttendanceFilters, 
  AttendanceResponse,
  AttendanceStats 
} from '../types/attendance';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const CACHE_TTL = 30000; // 30 seconds

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>();

class AttendanceService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {},
    cacheKey?: string,
    cacheTTL: number = CACHE_TTL
  ): Promise<T> {
    // Check cache first
    if (cacheKey && options.method === 'GET') {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.data;
      }
    }

    // Deduplicate requests
    const requestKey = `${options.method || 'GET'}_${endpoint}_${JSON.stringify(options.body)}`;
    if (pendingRequests.has(requestKey)) {
      return pendingRequests.get(requestKey);
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('auth_token');
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const requestPromise = this.makeRequest<T>(url, requestOptions, cacheKey, cacheTTL);
    
    // Store pending request
    pendingRequests.set(requestKey, requestPromise);
    
    // Clean up pending request after completion
    requestPromise.finally(() => {
      pendingRequests.delete(requestKey);
    });

    return requestPromise;
  }

  private async makeRequest<T>(
    url: string, 
    options: RequestInit,
    cacheKey?: string,
    cacheTTL: number = CACHE_TTL
  ): Promise<T> {
    let lastError: Error;
    
    // Retry logic
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(url, options);
        
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

  // Get attendance sessions for a group
  async getAttendanceSessions(filters: AttendanceFilters): Promise<AttendanceResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    
    const cacheKey = `attendance_sessions_${params.toString()}`;
    return this.request<AttendanceResponse>(
      `/attendance?${params.toString()}`, 
      { method: 'GET' },
      cacheKey
    );
  }

  // Get a specific attendance session
  async getAttendanceSession(sessionId: string): Promise<AttendanceSession> {
    const cacheKey = `attendance_session_${sessionId}`;
    return this.request<AttendanceSession>(
      `/attendance/${sessionId}`, 
      { method: 'GET' },
      cacheKey
    );
  }

  // Create a new attendance session
  async createAttendanceSession(data: AttendanceCreateRequest): Promise<AttendanceSession> {
    const result = await this.request<AttendanceSession>(
      '/attendance', 
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    
    // Invalidate related caches
    this.invalidateGroupCache(data.groupId);
    
    return result;
  }

  // Update an attendance session
  async updateAttendanceSession(data: AttendanceUpdateRequest): Promise<AttendanceSession> {
    const result = await this.request<AttendanceSession>(
      `/attendance/${data.id}`, 
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    
    // Invalidate caches
    cache.delete(`attendance_session_${data.id}`);
    
    return result;
  }

  // Delete an attendance session
  async deleteAttendanceSession(sessionId: string): Promise<void> {
    await this.request<void>(
      `/attendance/${sessionId}`, 
      { method: 'DELETE' }
    );
    
    // Invalidate caches
    cache.delete(`attendance_session_${sessionId}`);
    this.invalidateAllGroupCaches();
  }

  // Get attendance statistics for a group
  async getAttendanceStats(groupId: string, startDate?: string, endDate?: string): Promise<AttendanceStats> {
    const params = new URLSearchParams({ groupId });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const cacheKey = `attendance_stats_${params.toString()}`;
    return this.request<AttendanceStats>(
      `/attendance/stats?${params.toString()}`, 
      { method: 'GET' },
      cacheKey,
      60000 // Cache stats for 1 minute
    );
  }

  // Export attendance data
  async exportAttendance(filters: AttendanceFilters, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    
    params.append('format', format);
    
    const response = await fetch(`${API_BASE_URL}/attendance/export?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }
    
    return response.blob();
  }

  // Bulk update attendance records
  async bulkUpdateAttendance(sessionId: string, updates: { memberId: string; status: string; notes?: string }[]): Promise<AttendanceSession> {
    const result = await this.request<AttendanceSession>(
      `/attendance/${sessionId}/bulk-update`, 
      {
        method: 'POST',
        body: JSON.stringify({ updates }),
      }
    );
    
    // Invalidate caches
    cache.delete(`attendance_session_${sessionId}`);
    
    return result;
  }

  // Helper methods for cache management
  private invalidateGroupCache(groupId: string) {
    // Remove all cached entries related to this group
    for (const [key] of cache) {
      if (key.includes(`groupId=${groupId}`) || key.includes(`group_${groupId}`)) {
        cache.delete(key);
      }
    }
  }

  private invalidateAllGroupCaches() {
    // Remove all attendance-related caches
    for (const [key] of cache) {
      if (key.includes('attendance_')) {
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

export const attendanceService = new AttendanceService();
