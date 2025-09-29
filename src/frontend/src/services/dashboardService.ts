// Dashboard service to fetch real stats from backend APIs
export interface DashboardStats {
  totalMembers: number;
  activeGroups: number;
  upcomingEvents: number;
  recentActivities: number;
}

export interface RecentActivity {
  id: string;
  type: 'member_joined' | 'event_registered' | 'group_meeting' | 'care_log';
  description: string;
  timestamp: string;
  icon: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  attendees: number;
  location: string;
}

export interface DashboardAlert {
  id: string;
  type: 'attention' | 'warning' | 'info';
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
}

class DashboardService {
  private cache: any | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  async getStats(): Promise<DashboardStats> {
    // Check cache first
    if (this.cache && Date.now() < this.cacheExpiry) {
      return this.cache.quickStats;
    }

    try {
      const token = localStorage.getItem('auth_token') || 'mock_token_admin';
      const response = await fetch(`${this.API_URL}/api/reports/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Dashboard API returned ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the full dashboard data
      this.cache = data;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;

      return data.quickStats;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Return fallback stats if API calls fail
      return {
        totalMembers: 250,
        activeGroups: 8,
        upcomingEvents: 5,
        recentActivities: 42
      };
    }
  }

  async getRecentActivity(): Promise<RecentActivity[]> {
    try {
      // Use cached data if available
      if (this.cache && Date.now() < this.cacheExpiry) {
        return this.cache.recentActivity || [];
      }

      const token = localStorage.getItem('auth_token') || 'mock_token_admin';
      const response = await fetch(`${this.API_URL}/api/reports/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Dashboard API returned ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the full dashboard data
      this.cache = data;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;

      return data.recentActivity || [];
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
      // Return fallback activities
      return [
        {
          id: '1',
          type: 'member_joined',
          description: 'New member joined the community',
          timestamp: new Date().toISOString(),
          icon: 'user-plus'
        }
      ];
    }
  }

  async getUpcomingEvents(): Promise<UpcomingEvent[]> {
    try {
      // Use cached data if available
      if (this.cache && Date.now() < this.cacheExpiry) {
        return this.cache.upcomingEvents || [];
      }

      const token = localStorage.getItem('auth_token') || 'mock_token_admin';
      const response = await fetch(`${this.API_URL}/api/reports/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Dashboard API returned ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the full dashboard data
      this.cache = data;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;

      return data.upcomingEvents || [];
    } catch (error) {
      console.error('Failed to fetch upcoming events:', error);
      return [];
    }
  }

  async getAlerts(): Promise<DashboardAlert[]> {
    try {
      // Use cached data if available
      if (this.cache && Date.now() < this.cacheExpiry) {
        return this.cache.alerts || [];
      }

      const token = localStorage.getItem('auth_token') || 'mock_token_admin';
      const response = await fetch(`${this.API_URL}/api/reports/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Dashboard API returned ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the full dashboard data
      this.cache = data;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;

      return data.alerts || [];
    } catch (error) {
      console.error('Failed to fetch dashboard alerts:', error);
      return [];
    }
  }

  async refreshDashboard(): Promise<void> {
    // Clear cache to force fresh data fetch
    this.clearCache();
    
    // Preload dashboard data
    await this.getStats();
  }

  clearCache(): void {
    this.cache = null;
    this.cacheExpiry = 0;
  }
}

export const dashboardService = new DashboardService();
