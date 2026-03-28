'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  Clock, 
  Users, 
  Calendar, 
  MessageSquare, 
  Heart, 
  Target,
  Filter,
  ChevronDown
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  actor?: { name: string; role: string };
}

const typeConfig: Record<string, { icon: React.ComponentType<any>; color: string }> = {
  member: { icon: Users, color: 'bg-blue-500' },
  group: { icon: Users, color: 'bg-green-500' },
  event: { icon: Calendar, color: 'bg-purple-500' },
  communication: { icon: MessageSquare, color: 'bg-orange-500' },
  care: { icon: Heart, color: 'bg-pink-500' },
  journey: { icon: Target, color: 'bg-indigo-500' },
  deacon_assigned: { icon: Users, color: 'bg-teal-500' },
};

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/activity`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.status}`);
      }
      
      const data = await response.json();
      const activityData = data.activities || data || [];
      setActivities(activityData);
      setFilteredActivities(activityData);
    } catch (error) {
      console.error('Failed to load activities:', error);
      setActivities([]);
      setFilteredActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFilter === 'all') {
      setFilteredActivities(activities);
    } else {
      setFilteredActivities(activities.filter(activity => activity.type === selectedFilter));
    }
  }, [selectedFilter, activities]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Activity' },
    { value: 'member', label: 'Members' },
    { value: 'group', label: 'Groups' },
    { value: 'event', label: 'Events' },
    { value: 'communication', label: 'Communications' },
    { value: 'care', label: 'Pastoral Care' },
    { value: 'journey', label: 'Journeys' }
  ];

  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Activity Feed</h1>
              <p className="mt-1 text-sm text-neutral-600">
                Recent activity across your church community
              </p>
            </div>
            
            <div className="relative">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="appearance-none bg-white border border-neutral-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-neutral-600">Loading activities...</p>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="p-6 text-center">
                <Filter className="mx-auto h-12 w-12 text-neutral-400" />
                <h3 className="mt-2 text-sm font-medium text-neutral-900">No activities</h3>
                <p className="mt-1 text-sm text-neutral-500">
                  No activities match the current filter.
                </p>
              </div>
            ) : (
              <div className="flow-root">
                <ul className="divide-y divide-neutral-200">
                  {filteredActivities.map((activity) => {
                    const config = typeConfig[activity.type] || { icon: Clock, color: 'bg-gray-500' };
                    const IconComponent = config.icon;
                    const displayUser = activity.user || activity.actor?.name || 'System';
                    return (
                      <li key={activity.id} className="p-6">
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`${config.color} h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white`}>
                              <IconComponent className="h-4 w-4 text-white" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm font-medium text-neutral-900">
                                {activity.title}
                              </p>
                              <p className="text-sm text-neutral-500">
                                {activity.description}
                              </p>
                              <div className="mt-1 flex items-center space-x-2 text-xs text-neutral-400">
                                <Clock className="h-3 w-3" />
                                <span>{formatTimestamp(activity.timestamp)}</span>
                                <span>•</span>
                                <span>by {displayUser}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
