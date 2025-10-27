import axios from 'axios';

// Types
export interface Volunteer {
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
  backgroundCheck: 'NOT_REQUIRED' | 'REQUIRED' | 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'EXPIRED' | 'REJECTED';
  emergencyContact?: object;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  member?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profilePhotoUrl?: string;
  };
  totalHours?: number;
  _count?: {
    opportunities: number;
    signups: number;
    hours: number;
  };
}

export interface VolunteerOpportunity {
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
  urgency: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'DRAFT' | 'OPEN' | 'FILLED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
  coordinatorId: string;
  churchId?: string;
  createdAt: string;
  updatedAt: string;
  coordinator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  _count?: {
    signups: number;
    volunteers: number;
  };
}

export interface VolunteerSignup {
  id: string;
  volunteerId: string;
  opportunityId: string;
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'WAITLISTED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
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

export interface VolunteerHour {
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
  updatedAt: string;
}

// Request interfaces  
export interface CreateVolunteerRequest {
  memberId: string;
  skills?: string[];
  interests?: string[];
  availability?: object;
  maxHoursPerWeek?: number;
  preferredMinistries?: string[];
  transportationAvailable?: boolean;
  willingToTravel?: boolean;
  emergencyContact?: object;
  notes?: string;
}

export interface UpdateVolunteerRequest {
  skills?: string[];
  interests?: string[];
  availability?: object;
  maxHoursPerWeek?: number;
  preferredMinistries?: string[];
  transportationAvailable?: boolean;
  willingToTravel?: boolean;
  backgroundCheck?: string;
  emergencyContact?: object;
  notes?: string;
  isActive?: boolean;
}

export interface CreateOpportunityRequest {
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
  startDate: string;
  endDate?: string;
  isRecurring?: boolean;
  recurringSchedule?: object;
  estimatedHours?: number;
  maxVolunteers?: number;
  urgency?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  coordinatorId: string;
  churchId?: string;
}

export interface SignupRequest {
  volunteerId: string;
  message?: string;
  specialRequests?: string;
  scheduledDate?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  estimatedHours?: number;
}

export interface LogHoursRequest {
  opportunityId?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  hoursWorked: number;
  description: string;
  category: string;
  ministry?: string;
  location?: string;
  notes?: string;
}

class VolunteerService {
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

  // Volunteer Management
  async getAllVolunteers(params?: {
    page?: number;
    limit?: number;
    skills?: string;
    ministry?: string;
    active?: boolean;
    backgroundCheck?: string;
    search?: string;
  }) {
    try {
      const response = await axios.get(`${this.baseURL}/api/volunteers`, {
        params,
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      throw error;
    }
  }

  async getVolunteerById(id: string) {
    try {
      const response = await axios.get(`${this.baseURL}/api/volunteers/${id}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching volunteer:', error);
      throw error;
    }
  }

  async getVolunteerByMemberId(memberId: string) {
    try {
      const response = await axios.get(`${this.baseURL}/api/volunteers/member/${memberId}`, {
        headers: this.getAuthHeaders()
      });
      return response.data.volunteer;
    } catch (error) {
      console.error('Error fetching volunteer by member ID:', error);
      throw error;
    }
  }

  async createVolunteer(data: CreateVolunteerRequest) {
    try {
      const response = await axios.post(`${this.baseURL}/api/volunteers`, data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating volunteer:', error);
      throw error;
    }
  }

  async updateVolunteer(id: string, data: UpdateVolunteerRequest) {
    try {
      const response = await axios.put(`${this.baseURL}/api/volunteers/${id}`, data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating volunteer:', error);
      throw error;
    }
  }

  async deleteVolunteer(id: string) {
    try {
      const response = await axios.delete(`${this.baseURL}/api/volunteers/${id}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting volunteer:', error);
      throw error;
    }
  }

  // Volunteer Hours
  async getVolunteerHours(volunteerId: string, params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    verified?: boolean;
  }) {
    try {
      const response = await axios.get(`${this.baseURL}/api/volunteers/${volunteerId}/hours`, {
        params,
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching volunteer hours:', error);
      throw error;
    }
  }

  async logVolunteerHours(volunteerId: string, data: LogHoursRequest) {
    try {
      const response = await axios.post(`${this.baseURL}/api/volunteers/${volunteerId}/hours`, data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error logging volunteer hours:', error);
      throw error;
    }
  }

  // Volunteer Opportunities
  async getVolunteerOpportunities(volunteerId: string, params?: {
    status?: string;
    upcoming?: boolean;
  }) {
    try {
      const response = await axios.get(`${this.baseURL}/api/volunteers/${volunteerId}/opportunities`, {
        params,
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching volunteer opportunities:', error);
      throw error;
    }
  }

  // Opportunities Management
  async getAllOpportunities(params?: {
    page?: number;
    limit?: number;
    ministry?: string;
    urgency?: string;
    status?: string;
    upcoming?: boolean;
    skills?: string;
    search?: string;
  }) {
    try {
      const response = await axios.get(`${this.baseURL}/api/volunteer-opportunities`, {
        params,
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      throw error;
    }
  }

  async getOpportunityById(id: string) {
    try {
      const response = await axios.get(`${this.baseURL}/api/volunteer-opportunities/${id}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching opportunity:', error);
      throw error;
    }
  }

  async createOpportunity(data: CreateOpportunityRequest) {
    try {
      const response = await axios.post(`${this.baseURL}/api/volunteer-opportunities`, data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating opportunity:', error);
      throw error;
    }
  }

  async updateOpportunity(id: string, data: Partial<CreateOpportunityRequest>) {
    try {
      const response = await axios.put(`${this.baseURL}/api/volunteer-opportunities/${id}`, data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating opportunity:', error);
      throw error;
    }
  }

  async deleteOpportunity(id: string) {
    try {
      const response = await axios.delete(`${this.baseURL}/api/volunteer-opportunities/${id}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      throw error;
    }
  }

  // Opportunity Signups
  async getOpportunitySignups(opportunityId: string, params?: {
    status?: string;
  }) {
    try {
      const response = await axios.get(`${this.baseURL}/api/volunteer-opportunities/${opportunityId}/signups`, {
        params,
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching opportunity signups:', error);
      throw error;
    }
  }

  async signupForOpportunity(opportunityId: string, data: SignupRequest) {
    try {
      const response = await axios.post(`${this.baseURL}/api/volunteer-opportunities/${opportunityId}/signup`, data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error signing up for opportunity:', error);
      throw error;
    }
  }

  async updateSignup(opportunityId: string, signupId: string, data: {
    status: string;
    confirmedBy?: string;
    declinedReason?: string;
    actualHours?: number;
    feedback?: string;
    rating?: number;
  }) {
    try {
      const response = await axios.put(`${this.baseURL}/api/volunteer-opportunities/${opportunityId}/signups/${signupId}`, data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating signup:', error);
      throw error;
    }
  }

  // Search and Matching
  async searchOpportunities(params?: {
    volunteerId?: string;
    ministry?: string;
    urgent?: boolean;
  }) {
    try {
      const response = await axios.get(`${this.baseURL}/api/volunteer-opportunities/search`, {
        params,
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error searching opportunities:', error);
      throw error;
    }
  }

  // Statistics
  async getVolunteerStats() {
    try {
      const response = await axios.get(`${this.baseURL}/api/volunteers/stats`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching volunteer stats:', error);
      throw error;
    }
  }

  async getOpportunityStats() {
    try {
      const response = await axios.get(`${this.baseURL}/api/volunteer-opportunities/stats`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching opportunity stats:', error);
      throw error;
    }
  }

  // Skill and Ministry Data
  async getAvailableSkills(): Promise<string[]> {
    // This could be enhanced to fetch from backend
    return [
      'Music',
      'Teaching',
      'Childcare',
      'Youth Work',
      'Photography',
      'Technical Support',
      'Event Setup',
      'Food Service',
      'Administrative',
      'Counseling',
      'Prayer',
      'Hospitality',
      'Maintenance',
      'Transportation',
      'Security',
      'First Aid',
      'Graphic Design',
      'Social Media',
      'Translation',
      'Mentoring'
    ];
  }

  async getAvailableMinistries(): Promise<string[]> {
    // This could be enhanced to fetch from backend
    return [
      'Worship',
      'Children',
      'Youth',
      'Adult Education',
      'Outreach',
      'Missions',
      'Care & Support',
      'Administration',
      'Facilities',
      'Events',
      'Media & Communications',
      'Prayer Ministry',
      'Hospitality',
      'Seniors',
      'Small Groups',
      'Music Ministry',
      'Drama & Arts',
      'Sports & Recreation',
      'Community Service',
      'Discipleship'
    ];
  }

  // Utility methods
  formatVolunteerName(volunteer: Volunteer): string {
    if (volunteer.member) {
      return `${volunteer.member.firstName} ${volunteer.member.lastName}`;
    }
    return 'Unknown Volunteer';
  }

  calculateVolunteerAge(dateOfBirth?: string): number | null {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  isOpportunityUrgent(opportunity: VolunteerOpportunity): boolean {
    return opportunity.urgency === 'URGENT' || opportunity.urgency === 'HIGH';
  }

  getOpportunityCapacityStatus(opportunity: VolunteerOpportunity): {
    isFull: boolean;
    percentage: number;
    remaining: number;
  } {
    if (!opportunity.maxVolunteers) {
      return { isFull: false, percentage: 0, remaining: Infinity };
    }

    const percentage = (opportunity.currentVolunteers / opportunity.maxVolunteers) * 100;
    const remaining = opportunity.maxVolunteers - opportunity.currentVolunteers;

    return {
      isFull: remaining <= 0,
      percentage: Math.min(percentage, 100),
      remaining: Math.max(remaining, 0)
    };
  }

  matchVolunteerToOpportunity(volunteer: Volunteer, opportunity: VolunteerOpportunity): {
    matchScore: number;
    matchingSkills: string[];
    matchingMinistries: string[];
  } {
    const matchingSkills = volunteer.skills.filter(skill => 
      opportunity.skillsRequired.some(required => 
        required.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(required.toLowerCase())
      )
    );

    const matchingMinistries = volunteer.preferredMinistries.filter(ministry =>
      ministry.toLowerCase() === opportunity.ministry.toLowerCase()
    );

    // Simple scoring algorithm
    let score = 0;
    score += matchingSkills.length * 30; // 30 points per matching skill
    score += matchingMinistries.length * 40; // 40 points per matching ministry

    // Bonus for background check match
    if (opportunity.backgroundCheckRequired && volunteer.backgroundCheck === 'APPROVED') {
      score += 20;
    }

    return {
      matchScore: Math.min(score, 100),
      matchingSkills,
      matchingMinistries
    };
  }
}

export const volunteerService = new VolunteerService();
