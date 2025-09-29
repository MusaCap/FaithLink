'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { journeyService } from '../../services/journeyService';
import { MemberJourney, MemberJourneyFilters, JourneyStatus } from '../../types/journey';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  User, 
  BookOpen,
  Calendar,
  TrendingUp,
  AlertCircle,
  Download
} from 'lucide-react';

export default function MemberJourneyList() {
  const { user } = useAuth();
  const [journeys, setJourneys] = useState<MemberJourney[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJourneys, setTotalJourneys] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<MemberJourneyFilters>({
    limit: 10,
    offset: 0,
    sortBy: 'startedAt',
    sortOrder: 'desc'
  });

  const [searchQuery, setSearchQuery] = useState('');
  const journeysPerPage = 10;

  useEffect(() => {
    // Set member-specific filter for regular members
    if (user?.role === 'member') {
      setFilters(prev => ({ ...prev, memberId: user.id }));
    }
    
    loadJourneys();
  }, [user, currentPage]);

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      offset: (currentPage - 1) * journeysPerPage
    }));
  }, [currentPage]);

  const loadJourneys = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await journeyService.getMemberJourneys({
        ...filters,
        offset: (currentPage - 1) * journeysPerPage
      });
      
      setJourneys(response.journeys);
      setTotalJourneys(response.total);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load journeys');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value
    }));
    setCurrentPage(1);
  };

  const applyFilters = () => {
    loadJourneys();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadJourneys();
  };

  const updateJourneyStatus = async (journeyId: string, status: JourneyStatus) => {
    try {
      await journeyService.updateMemberJourney({ id: journeyId, status });
      loadJourneys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update journey status');
    }
  };

  const exportJourneyProgress = async (journeyId: string) => {
    try {
      const blob = await journeyService.exportMemberJourneyProgress(journeyId, 'pdf');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `journey-progress-${journeyId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export journey progress');
    }
  };

  const getStatusColor = (status: JourneyStatus): string => {
    switch (status) {
      case 'not_started': return 'bg-neutral-100 text-neutral-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'abandoned': return 'bg-red-100 text-red-800';
      case 'overdue': return 'bg-orange-100 text-orange-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getStatusIcon = (status: JourneyStatus) => {
    switch (status) {
      case 'not_started': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <Play className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'abandoned': return <AlertCircle className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const canManageJourneys = user?.role === 'admin' || user?.role === 'pastor';
  const isOwnJourneys = user?.role === 'member';
  const totalPages = Math.ceil(totalJourneys / journeysPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            {isOwnJourneys ? 'My Spiritual Journeys' : 'Member Journeys'}
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            {isOwnJourneys 
              ? 'Track your spiritual growth and development progress'
              : 'Monitor member spiritual journey progress and milestones'
            }
          </p>
        </div>
        
        {canManageJourneys && (
          <Link
            href="/journeys/assign"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Assign Journey
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <form onSubmit={handleSearch} className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search journeys..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 ml-3"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-neutral-200">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
              <select
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="abandoned">Abandoned</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Start Date From</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={filters.startDateFrom || ''}
                onChange={(e) => handleFilterChange('startDateFrom', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Start Date To</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={filters.startDateTo || ''}
                onChange={(e) => handleFilterChange('startDateTo', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Sort By</label>
              <select
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={`${filters.sortBy}_${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('_');
                  handleFilterChange('sortBy', sortBy);
                  handleFilterChange('sortOrder', sortOrder);
                }}
              >
                <option value="startedAt_desc">Recently Started</option>
                <option value="startedAt_asc">Oldest First</option>
                <option value="lastActivityAt_desc">Recent Activity</option>
                <option value="progress_desc">Most Progress</option>
                <option value="progress_asc">Least Progress</option>
              </select>
            </div>
            
            <div className="md:col-span-4 flex justify-end">
              <button
                onClick={applyFilters}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Journeys List */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        {!journeys || journeys.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-neutral-900 mb-2">
              {isOwnJourneys ? 'No spiritual journeys assigned' : 'No member journeys found'}
            </h4>
            <p className="text-neutral-600 mb-4">
              {isOwnJourneys 
                ? 'Ask your pastor or group leader to assign you a spiritual growth journey'
                : 'Assign journey templates to help members grow spiritually'
              }
            </p>
            {canManageJourneys && (
              <Link
                href="/journeys/assign"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Assign First Journey
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {journeys && journeys.map((journey) => (
              <div key={journey.id} className="p-6 hover:bg-neutral-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-neutral-900">
                        {journey.journeyTemplateName}
                      </h3>
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(journey.status)}`}>
                        {getStatusIcon(journey.status)}
                        <span className="capitalize">{journey.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                    
                    {!isOwnJourneys && (
                      <div className="flex items-center text-sm text-neutral-600 mb-2">
                        <User className="w-4 h-4 mr-1" />
                        {journey.memberName}
                        {journey.mentorName && (
                          <>
                            <span className="mx-2">•</span>
                            Mentor: {journey.mentorName}
                          </>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-6 text-sm text-neutral-600 mb-3">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Started {formatDate(journey.startedAt)}
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {journey.progress.percentageComplete}% complete
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {journey.progress.completedMilestones}/{journey.progress.totalMilestones} milestones
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {journey.progress.daysSinceStart} days active
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-neutral-200 rounded-full h-2 mb-3">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${journey.progress.percentageComplete}%` }}
                      ></div>
                    </div>
                    
                    {journey.notes && (
                      <p className="text-sm text-neutral-600 bg-neutral-50 rounded p-2 mb-3">
                        {journey.notes}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      href={`/journeys/${journey.id}`}
                      className="inline-flex items-center px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Progress
                    </Link>
                    
                    <button
                      onClick={() => exportJourneyProgress(journey.id)}
                      className="inline-flex items-center px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </button>
                    
                    {canManageJourneys && (
                      <div className="flex space-x-1">
                        {journey.status === 'in_progress' && (
                          <button
                            onClick={() => updateJourneyStatus(journey.id, 'paused')}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                            title="Pause Journey"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        )}
                        {journey.status === 'paused' && (
                          <button
                            onClick={() => updateJourneyStatus(journey.id, 'in_progress')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Resume Journey"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        {journey.status === 'not_started' && (
                          <button
                            onClick={() => updateJourneyStatus(journey.id, 'in_progress')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="Start Journey"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
            <div className="text-sm text-neutral-700">
              Showing {((currentPage - 1) * journeysPerPage) + 1} to {Math.min(currentPage * journeysPerPage, totalJourneys)} of {totalJourneys} journeys
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
