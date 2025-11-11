'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  Calendar, 
  Users, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  Plus,
  Eye,
  Settings,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';

// Types
interface VolunteerStats {
  totalHours: number;
  monthlyHours: number;
  totalOpportunities: number;
  monthlyOpportunities: number;
}

interface VolunteerSkill {
  name: string;
  isActive: boolean;
}

interface UpcomingCommitment {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  ministry: string;
  coordinator: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
}

interface AvailableOpportunity {
  id: string;
  title: string;
  ministry: string;
  date: string;
  skillsRequired: string[];
  volunteersNeeded: number;
  estimatedHours: number;
  urgency: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  isRecurring: boolean;
}

interface VolunteerProfile {
  id: string;
  skills: string[];
  interests: string[];
  maxHoursPerWeek?: number;
  preferredMinistries: string[];
  backgroundCheck: string;
  isActive: boolean;
}

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State
  const [volunteerProfile, setVolunteerProfile] = useState<VolunteerProfile | null>(null);
  const [stats, setStats] = useState<VolunteerStats>({
    totalHours: 0,
    monthlyHours: 0,
    totalOpportunities: 0,
    monthlyOpportunities: 0
  });
  const [upcomingCommitments, setUpcomingCommitments] = useState<UpcomingCommitment[]>([]);
  const [availableOpportunities, setAvailableOpportunities] = useState<AvailableOpportunity[]>([]);

  useEffect(() => {
    if (user?.member?.id) {
      loadVolunteerData();
    }
  }, [user]);

  const loadVolunteerData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      // Load volunteer profile
      try {
        const profileResponse = await fetch(`${baseUrl}/api/volunteers/member/${user.member.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setVolunteerProfile(profileData.volunteer);

          // Load volunteer hours and opportunities
          const [hoursResponse, opportunitiesResponse, availableResponse] = await Promise.all([
            fetch(`${baseUrl}/api/volunteers/${profileData.volunteer.id}/hours`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }),
            fetch(`${baseUrl}/api/volunteers/${profileData.volunteer.id}/opportunities?upcoming=true`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }),
            fetch(`${baseUrl}/api/volunteer-opportunities/search?volunteerId=${profileData.volunteer.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
          ]);

          // Process hours data
          if (hoursResponse.ok) {
            const hoursData = await hoursResponse.json();
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            
            const monthlyHours = hoursData.hours.filter((hour: any) => {
              const hourDate = new Date(hour.date);
              return hourDate.getMonth() === currentMonth && hourDate.getFullYear() === currentYear;
            }).reduce((sum: number, hour: any) => sum + hour.hoursWorked, 0);

            setStats(prev => ({
              ...prev,
              totalHours: hoursData.totalHours || 0,
              monthlyHours
            }));
          }

          // Process opportunities data
          if (opportunitiesResponse.ok) {
            const oppData = await opportunitiesResponse.json();
            const commitments = oppData.opportunities.map((assignment: any) => ({
              id: assignment.id,
              title: assignment.opportunity.title,
              date: assignment.opportunity.startDate,
              startTime: assignment.opportunity.startDate,
              endTime: assignment.opportunity.endDate || assignment.opportunity.startDate,
              location: assignment.opportunity.location || 'TBD',
              ministry: assignment.opportunity.ministry,
              coordinator: `${assignment.opportunity.coordinator.firstName} ${assignment.opportunity.coordinator.lastName}`,
              status: assignment.opportunity.status === 'OPEN' ? 'CONFIRMED' : 'PENDING'
            }));
            setUpcomingCommitments(commitments);
            setStats(prev => ({
              ...prev,
              totalOpportunities: oppData.opportunities?.length || 0,
              monthlyOpportunities: commitments?.length || 0
            }));
          }

          // Process available opportunities
          if (availableResponse.ok) {
            const availableData = await availableResponse.json();
            setAvailableOpportunities(availableData.opportunities.slice(0, 5)); // Show top 5
          }
        } else {
          // No volunteer profile exists yet - show setup message
          setVolunteerProfile(null);
        }
      } catch (profileError) {
        console.warn('Volunteer profile not found, showing setup message');
        setVolunteerProfile(null);
      }

    } catch (error) {
      console.error('Error loading volunteer data:', error);
      setError('Failed to load volunteer information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (opportunityId: string) => {
    if (!volunteerProfile) return;

    try {
      const token = localStorage.getItem('auth_token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      const response = await fetch(`${baseUrl}/api/volunteer-opportunities/${opportunityId}/signup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          volunteerId: volunteerProfile.id,
          message: 'Signed up from dashboard'
        })
      });

      if (response.ok) {
        // Refresh data
        loadVolunteerData();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to sign up for opportunity');
      }
    } catch (error) {
      console.error('Error signing up:', error);
      setError('Failed to sign up for opportunity');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'NORMAL': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading volunteer dashboard...</span>
      </div>
    );
  }

  if (!volunteerProfile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Users className="h-6 w-6" />
              Welcome to Volunteer Management
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              You haven't created a volunteer profile yet. Get started by setting up your volunteer information.
            </p>
            <Button 
              onClick={() => window.location.href = '/volunteers/profile/create'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Volunteer Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            Volunteer Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.member?.firstName}! Here's your volunteer activity overview.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/volunteers/hours/log'}>
            <Clock className="h-4 w-4 mr-2" />
            Log Hours
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/volunteers/opportunities'}>
            <Eye className="h-4 w-4 mr-2" />
            Browse All
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/volunteers/profile'}>
            <Settings className="h-4 w-4 mr-2" />
            Update Profile
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalHours}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-green-600">{stats.monthlyHours} hrs</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">My Skills</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {volunteerProfile.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {volunteerProfile.skills && volunteerProfile.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{(volunteerProfile.skills?.length || 0) - 3}
                    </Badge>
                  )}
                </div>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Commitments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              My Upcoming Commitments ({upcomingCommitments?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(!upcomingCommitments || upcomingCommitments.length === 0) ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No upcoming commitments</p>
                <p className="text-sm">Sign up for opportunities below!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingCommitments.slice(0, 3).map((commitment) => (
                  <div key={commitment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{commitment.title}</h4>
                      <Badge className={getStatusColor(commitment.status)} variant="secondary">
                        {commitment.status === 'CONFIRMED' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {commitment.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(commitment.date)}, {formatTime(commitment.startTime)} - {formatTime(commitment.endTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{commitment.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Coordinator: {commitment.coordinator} • {commitment.ministry}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {upcomingCommitments && upcomingCommitments.length > 3 && (
                  <Button variant="outline" className="w-full mt-4">
                    View All Commitments ({upcomingCommitments?.length || 0})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Available Opportunities
              <Button size="sm" variant="link" onClick={() => window.location.href = '/volunteers/opportunities'}>
                View All →
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(!availableOpportunities || availableOpportunities.length === 0) ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No matching opportunities found</p>
                <p className="text-sm">Check back later or browse all opportunities</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableOpportunities.map((opportunity) => (
                  <div key={opportunity.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{opportunity.title}</h4>
                          <Badge className={getUrgencyColor(opportunity.urgency)} variant="outline">
                            {opportunity.urgency === 'URGENT' && '🔥 '}
                            {opportunity.urgency}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{opportunity.ministry} • {formatDate(opportunity.date)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {opportunity.skillsRequired.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{opportunity.volunteersNeeded} volunteers needed • {opportunity.estimatedHours} hours estimated</span>
                        {opportunity.isRecurring && (
                          <Badge variant="secondary" className="text-xs">Recurring</Badge>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleSignUp(opportunity.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Sign Up
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.location.href = `/volunteers/opportunities/${opportunity.id}`}
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
