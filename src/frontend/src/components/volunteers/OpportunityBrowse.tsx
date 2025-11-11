'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { volunteerService, VolunteerOpportunity, Volunteer } from '@/services/volunteerService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  AlertCircle,
  CheckCircle,
  Filter,
  X,
  Eye,
  UserPlus,
  Target,
  Star
} from 'lucide-react';

interface OpportunityBrowseProps {
  showFilters?: boolean;
  limit?: number;
  volunteerId?: string;
}

export default function OpportunityBrowse({ 
  showFilters = true, 
  limit, 
  volunteerId 
}: OpportunityBrowseProps) {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signing, setSigning] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    ministry: '',
    urgency: '',
    status: 'OPEN',
    upcoming: true,
    skills: ''
  });

  const [availableMinistries, setAvailableMinistries] = useState<string[]>([]);
  const [showMatchScore, setShowMatchScore] = useState(false);

  useEffect(() => {
    loadOpportunities();
    loadMinistries();
    if (volunteerId || user?.member?.id) {
      loadVolunteerProfile();
    }
  }, [currentPage, filters, volunteerId, user]);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit: limit || 20,
        ...filters,
        upcoming: filters.upcoming || undefined,
        skills: filters.skills || undefined
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await volunteerService.getAllOpportunities(params);
      setOpportunities(response.opportunities);
      setTotalPages(response.pagination.pages);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error('Error loading opportunities:', error);
      setError('Failed to load volunteer opportunities');
    } finally {
      setLoading(false);
    }
  };

  const loadVolunteerProfile = async () => {
    try {
      const memberId = volunteerId || user?.member?.id;
      if (!memberId) return;

      const volunteerData = await volunteerService.getVolunteerByMemberId(memberId);
      setVolunteer(volunteerData);
      setShowMatchScore(true);
    } catch (error) {
      console.warn('No volunteer profile found');
    }
  };

  const loadMinistries = async () => {
    try {
      const ministries = await volunteerService.getAvailableMinistries();
      setAvailableMinistries(ministries);
    } catch (error) {
      console.error('Error loading ministries:', error);
    }
  };

  const handleSignUp = async (opportunityId: string) => {
    if (!volunteer) {
      alert('Please create a volunteer profile first');
      return;
    }

    try {
      setSigning(opportunityId);
      
      await volunteerService.signupForOpportunity(opportunityId, {
        volunteerId: volunteer.id,
        message: 'Signed up via opportunity browser'
      });

      // Refresh opportunities to show updated signup count
      loadOpportunities();
      
      // Show success message
      alert('Successfully signed up for opportunity!');
    } catch (error: any) {
      console.error('Error signing up:', error);
      alert(error.response?.data?.message || 'Failed to sign up for opportunity');
    } finally {
      setSigning(null);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      ministry: '',
      urgency: '',
      status: 'OPEN',
      upcoming: true,
      skills: ''
    });
    setCurrentPage(1);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'NORMAL':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCapacityColor = (opportunity: VolunteerOpportunity) => {
    if (!opportunity.maxVolunteers) return 'text-gray-600';
    
    const percentage = (opportunity.currentVolunteers / opportunity.maxVolunteers) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-green-600';
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

  const getMatchInfo = (opportunity: VolunteerOpportunity) => {
    if (!volunteer) return null;
    return volunteerService.matchVolunteerToOpportunity(volunteer, opportunity);
  };

  if (loading && (!opportunities || opportunities.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading opportunities...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600" />
            Volunteer Opportunities
          </h2>
          <p className="text-gray-600 mt-1">
            Showing {opportunities?.length || 0} of {total} opportunities
            {showMatchScore && ' • Showing match scores based on your profile'}
          </p>
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

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
                className="ml-auto"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search opportunities..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="ministry">Ministry</Label>
                <Select
                  value={filters.ministry}
                  onValueChange={(value) => handleFilterChange('ministry', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Ministries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Ministries</SelectItem>
                    {availableMinistries.map((ministry) => (
                      <SelectItem key={ministry} value={ministry}>
                        {ministry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="urgency">Priority</Label>
                <Select
                  value={filters.urgency}
                  onValueChange={(value) => handleFilterChange('urgency', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Priorities</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="FILLED">Filled</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Opportunities List */}
      <div className="space-y-4">
        {opportunities.map((opportunity) => {
          const matchInfo = getMatchInfo(opportunity);
          const capacityStatus = volunteerService.getOpportunityCapacityStatus(opportunity);
          
          return (
            <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{opportunity.title}</h3>
                      <Badge className={getUrgencyColor(opportunity.urgency)} variant="outline">
                        {opportunity.urgency === 'URGENT' && '🔥 '}
                        {opportunity.urgency}
                      </Badge>
                      {matchInfo && matchInfo.matchScore > 0 && (
                        <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
                          <Star className="h-3 w-3 mr-1" />
                          {matchInfo.matchScore}% match
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2">{opportunity.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(opportunity.startDate)}
                      {opportunity.endDate && opportunity.endDate !== opportunity.startDate && 
                        ` - ${formatDate(opportunity.endDate)}`
                      }
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{opportunity.location || 'TBD'} • {opportunity.ministry}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className={`h-4 w-4 ${getCapacityColor(opportunity)}`} />
                    <span className={getCapacityColor(opportunity)}>
                      {opportunity.currentVolunteers}
                      {opportunity.maxVolunteers ? `/${opportunity.maxVolunteers}` : ''} volunteers
                      {opportunity.maxVolunteers && capacityStatus.isFull && ' (FULL)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {opportunity.estimatedHours ? `${opportunity.estimatedHours} hrs` : 'Time varies'}
                      {opportunity.isRecurring && ' • Recurring'}
                    </span>
                  </div>
                </div>

                {/* Skills Required */}
                {opportunity.skillsRequired.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Skills needed:</p>
                    <div className="flex flex-wrap gap-1">
                      {opportunity.skillsRequired.map((skill) => {
                        const isMatching = matchInfo?.matchingSkills.includes(skill);
                        return (
                          <Badge 
                            key={skill} 
                            variant="outline" 
                            className={`text-xs ${isMatching ? 'bg-green-100 border-green-300 text-green-800' : ''}`}
                          >
                            {isMatching && '✓ '}{skill}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Match Information */}
                {matchInfo && (matchInfo.matchingMinistries.length > 0 || matchInfo.matchingSkills.length > 0) && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-green-800 font-medium mb-1">
                      Great match! This opportunity aligns with your profile:
                    </p>
                    <div className="text-sm text-green-700">
                      {matchInfo.matchingMinistries.length > 0 && (
                        <span>• Matches your interest in {matchInfo.matchingMinistries.join(', ')} ministry</span>
                      )}
                      {matchInfo.matchingSkills.length > 0 && (
                        <span className={matchInfo.matchingMinistries.length > 0 ? 'block' : ''}>
                          • Uses your skills: {matchInfo.matchingSkills.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Coordinator Info */}
                {opportunity.coordinator && (
                  <div className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">Coordinator:</span> {opportunity.coordinator.firstName} {opportunity.coordinator.lastName}
                    {opportunity.coordinator.email && (
                      <span className="ml-2">• {opportunity.coordinator.email}</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {opportunity.backgroundCheckRequired && (
                      <Badge variant="outline" className="text-xs">
                        Background Check Required
                      </Badge>
                    )}
                    {opportunity.trainingRequired.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        Training Required
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = `/volunteers/opportunities/${opportunity.id}`}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    
                    {opportunity.status === 'OPEN' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleSignUp(opportunity.id)}
                        disabled={signing === opportunity.id || !volunteer}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        {signing === opportunity.id ? 'Signing Up...' : 'Sign Up'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {(!opportunities || opportunities.length === 0) && !loading && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No opportunities found</h3>
                <p>Try adjusting your search criteria or check back later for new opportunities.</p>
                {Object.values(filters).some(v => v !== '' && v !== true) && (
                  <Button variant="outline" onClick={clearFilters} className="mt-4">
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
