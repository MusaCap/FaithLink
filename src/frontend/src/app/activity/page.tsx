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
  type: 'member' | 'group' | 'event' | 'communication' | 'care' | 'journey';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  icon: React.ComponentType<any>;
  color: string;
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'member',
    title: 'New Member Joined',
    description: 'Sarah Johnson joined the church community',
    timestamp: '2024-01-15T10:30:00Z',
    user: 'System',
    icon: Users,
    color: 'bg-blue-500'
  },
  {
    id: '2',
    type: 'group',
    title: 'Group Meeting Completed',
    description: 'Young Adults Bible Study - 12 members attended',
    timestamp: '2024-01-15T09:15:00Z',
    user: 'John Smith',
    icon: Users,
    color: 'bg-green-500'
  },
  {
    id: '3',
    type: 'event',
    title: 'Event Created',
    description: 'Sunday Service - January 21st scheduled',
    timestamp: '2024-01-15T08:45:00Z',
    user: 'Pastor Mike',
    icon: Calendar,
    color: 'bg-purple-500'
  },
  {
    id: '4',
    type: 'communication',
    title: 'Announcement Sent',
    description: 'Weekly newsletter sent to 245 members',
    timestamp: '2024-01-15T08:00:00Z',
    user: 'Admin',
    icon: MessageSquare,
    color: 'bg-orange-500'
  },
  {
    id: '5',
    type: 'care',
    title: 'Prayer Request Submitted',
    description: 'New prayer request from Mary Wilson',
    timestamp: '2024-01-14T16:30:00Z',
    user: 'Mary Wilson',
    icon: Heart,
    color: 'bg-pink-500'
  },
  {
    id: '6',
    type: 'journey',
    title: 'Journey Milestone Completed',
    description: 'David completed "New Member Orientation" milestone',
    timestamp: '2024-01-14T14:20:00Z',
    user: 'David Brown',
    icon: Target,
    color: 'bg-indigo-500'
  }
];

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setActivities(mockActivities);
      setFilteredActivities(mockActivities);
      setLoading(false);
    }, 500);
  }, []);

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
                    const IconComponent = activity.icon;
                    return (
                      <li key={activity.id} className="p-6">
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`${activity.color} h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white`}>
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
                                <span>by {activity.user}</span>
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
