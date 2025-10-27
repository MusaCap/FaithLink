import axios from 'axios';

export interface Deacon {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  churchId?: string;
  memberId?: string;
  ordainedDate?: string;
  specialties: string[];
  maxMembers?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  assignedMembers?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    membershipStatus?: string;
    spiritualStatus?: string;
  }[];
  member?: {
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
  _count?: {
    assignedMembers: number;
  };
}

export interface CreateDeaconRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  churchId?: string;
  memberId?: string;
  ordainedDate?: string;
  specialties?: string[];
  maxMembers?: number;
  notes?: string;
}

export interface UpdateDeaconRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  churchId?: string;
  memberId?: string;
  ordainedDate?: string;
  specialties?: string[];
  maxMembers?: number;
  notes?: string;
  isActive?: boolean;
}

export interface DeaconStats {
  totalAssignedMembers: number;
  activeMembers: number;
  membershipStatusBreakdown: Record<string, number>;
  spiritualStatusBreakdown: Record<string, number>;
  capacityUtilization?: number;
}

class DeaconService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Get all deacons
  async getAllDeacons(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    churchId?: string;
  }) {
    try {
      const response = await axios.get(`${this.baseURL}/api/deacons`, {
        params,
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching deacons:', error);
      throw error;
    }
  }

  // Get single deacon
  async getDeaconById(id: string) {
    try {
      const response = await axios.get(`${this.baseURL}/api/deacons/${id}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching deacon:', error);
      throw error;
    }
  }

  // Create new deacon
  async createDeacon(data: CreateDeaconRequest) {
    try {
      const response = await axios.post(`${this.baseURL}/api/deacons`, data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating deacon:', error);
      throw error;
    }
  }

  // Update deacon
  async updateDeacon(id: string, data: UpdateDeaconRequest) {
    try {
      const response = await axios.put(`${this.baseURL}/api/deacons/${id}`, data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating deacon:', error);
      throw error;
    }
  }

  // Delete deacon
  async deleteDeacon(id: string) {
    try {
      const response = await axios.delete(`${this.baseURL}/api/deacons/${id}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting deacon:', error);
      throw error;
    }
  }

  // Assign member to deacon
  async assignMemberToDeacon(deaconId: string, memberId: string) {
    try {
      const response = await axios.post(`${this.baseURL}/api/deacons/${deaconId}/assign-member`, 
        { memberId }, 
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error assigning member to deacon:', error);
      throw error;
    }
  }

  // Remove member from deacon
  async removeMemberFromDeacon(deaconId: string, memberId: string) {
    try {
      const response = await axios.post(`${this.baseURL}/api/deacons/${deaconId}/remove-member`, 
        { memberId }, 
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error removing member from deacon:', error);
      throw error;
    }
  }

  // Get deacon statistics
  async getDeaconStats(id: string): Promise<DeaconStats> {
    try {
      const response = await axios.get(`${this.baseURL}/api/deacons/${id}/stats`, {
        headers: this.getAuthHeaders()
      });
      return response.data.stats;
    } catch (error) {
      console.error('Error fetching deacon stats:', error);
      throw error;
    }
  }

  // Get deacons for dropdown (simplified)
  async getDeaconsForDropdown(churchId?: string): Promise<{ id: string; name: string; email: string; memberCount: number }[]> {
    try {
      const response = await this.getAllDeacons({
        limit: 100,
        isActive: true,
        churchId
      });

      return response.deacons.map((deacon: Deacon) => ({
        id: deacon.id,
        name: `${deacon.firstName} ${deacon.lastName}`,
        email: deacon.email,
        memberCount: deacon._count?.assignedMembers || 0
      }));
    } catch (error) {
      console.error('Error fetching deacons for dropdown:', error);
      return [];
    }
  }

  // Utility methods
  getDeaconFullName(deacon: Deacon): string {
    return `${deacon.firstName} ${deacon.lastName}`;
  }

  getCapacityStatus(deacon: Deacon): {
    isAtCapacity: boolean;
    percentage: number;
    remaining: number;
  } {
    const currentCount = deacon._count?.assignedMembers || 0;
    
    if (!deacon.maxMembers) {
      return {
        isAtCapacity: false,
        percentage: 0,
        remaining: Infinity
      };
    }

    const percentage = (currentCount / deacon.maxMembers) * 100;
    const remaining = deacon.maxMembers - currentCount;

    return {
      isAtCapacity: remaining <= 0,
      percentage: Math.min(percentage, 100),
      remaining: Math.max(remaining, 0)
    };
  }

  formatOrdainedDate(dateString?: string): string {
    if (!dateString) return 'Not specified';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getSpecialtiesDisplay(specialties: string[]): string {
    if (!specialties || specialties.length === 0) {
      return 'General pastoral care';
    }
    
    if (specialties.length <= 2) {
      return specialties.join(', ');
    }
    
    return `${specialties.slice(0, 2).join(', ')} +${specialties.length - 2} more`;
  }

  // Get available specialties for deacons
  getAvailableSpecialties(): string[] {
    return [
      'General Counseling',
      'Marriage Counseling',
      'Youth Ministry',
      'Seniors Ministry',
      'Grief Counseling',
      'Addiction Recovery',
      'Financial Counseling',
      'Family Support',
      'Crisis Intervention',
      'Spiritual Guidance',
      'Prayer Ministry',
      'Discipleship',
      'New Member Integration',
      'Hospital Visitation',
      'Homebound Ministry',
      'Mental Health Support'
    ];
  }

  // Validate deacon data before submission
  validateDeaconData(data: CreateDeaconRequest | UpdateDeaconRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if ('firstName' in data && !data.firstName?.trim()) {
      errors.push('First name is required');
    }

    if ('lastName' in data && !data.lastName?.trim()) {
      errors.push('Last name is required');
    }

    if ('email' in data && data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('Please enter a valid email address');
      }
    } else if ('email' in data) {
      errors.push('Email is required');
    }

    if (data.maxMembers && data.maxMembers < 1) {
      errors.push('Maximum members must be at least 1');
    }

    if (data.phone && data.phone.length > 0) {
      const phoneRegex = /^[\d\s\-\(\)\+\.]+$/;
      if (!phoneRegex.test(data.phone)) {
        errors.push('Please enter a valid phone number');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const deaconService = new DeaconService();
