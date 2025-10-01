'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BookOpen, Star, CheckCircle, Clock, User, 
  Calendar, ArrowRight, Plus, Filter 
} from 'lucide-react';

interface MemberJourney {
  id: string;
  memberId: string;
  templateId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED';
  startedAt: string | null;
  completedAt: string | null;
  progress: number;
  currentMilestone: string;
  template: {
    id: string;
    name: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
  mentor?: {
    id: string;
    name: string;
  };
}

export default function JourneyPage() {
  const { user } = useAuth();
  const [journeys, setJourneys] = useState<MemberJourney[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    loadMemberJourneys();
  }, [user]);

  const loadMemberJourneys = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/journeys/member-journeys?memberId=${user.id}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load journeys: ${response.status}`);
      }

      const data = await response.json();
      setJourneys(data.journeys || []);
    } catch (error: any) {
      console.error('Failed to load member journeys:', error);
      setError(error.message);
      setJourneys([]); // Clear journeys on error instead of showing mock data
    } finally {
      setLoading(false);
    }
  };

  const filteredJourneys = journeys.filter(journey => {
    if (filter === 'active') return journey.status === 'IN_PROGRESS';
    if (filter === 'completed') return journey.status === 'COMPLETED';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100';
      case 'PAUSED': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BookOpen className="w-8 h-8 mr-3 text-primary-600" />
            My Spiritual Journey
          </h1>
          <p className="text-gray-600 mt-2">
            Track your spiritual growth and development path
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'completed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            <strong>Note:</strong> Unable to load journeys from server. Showing sample data for demonstration.
          </p>
        </div>
      )}

      {/* Journey Cards */}
      <div className="space-y-6">
        {filteredJourneys.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Journeys Found
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't started any spiritual journeys yet."
                : `No ${filter} journeys found.`
              }
            </p>
            <button className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 font-medium">
              Explore Available Journeys
            </button>
          </div>
        ) : (
          filteredJourneys.map((journey) => (
            <div key={journey.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {journey.template.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(journey.template.difficulty)}`}>
                        {journey.template.difficulty}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(journey.status)}`}>
                        {journey.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {journey.template.description}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                {journey.status === 'IN_PROGRESS' && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{journey.progress}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${journey.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Journey Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      Started: {journey.startedAt ? new Date(journey.startedAt).toLocaleDateString() : 'Not started'}
                    </span>
                  </div>
                  
                  {journey.completedAt && (
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span>
                        Completed: {new Date(journey.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {journey.mentor && (
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      <span>Mentor: {journey.mentor.name}</span>
                    </div>
                  )}
                </div>

                {/* Current Milestone */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        Current Milestone
                      </h4>
                      <p className="text-gray-600">
                        {journey.currentMilestone}
                      </p>
                    </div>
                    {journey.status === 'IN_PROGRESS' && (
                      <Clock className="w-5 h-5 text-gray-400" />
                    )}
                    {journey.status === 'COMPLETED' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {journey.status === 'IN_PROGRESS' && (
                      <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 font-medium flex items-center">
                        Continue Journey
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    )}
                    
                    {journey.status === 'COMPLETED' && (
                      <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium flex items-center">
                        View Certificate
                        <Star className="w-4 h-4 ml-2" />
                      </button>
                    )}
                    
                    <button className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-md border border-gray-300 hover:border-gray-400">
                      View Details
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Call to Action */}
      {filteredJourneys.length > 0 && (
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Ready for Your Next Journey?
            </h3>
            <p className="text-gray-600 mb-6">
              Explore more spiritual growth opportunities and deepen your faith.
            </p>
            <button className="bg-primary-600 text-white px-8 py-3 rounded-md hover:bg-primary-700 font-medium flex items-center mx-auto">
              <Plus className="w-5 h-5 mr-2" />
              Browse Available Journeys
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
