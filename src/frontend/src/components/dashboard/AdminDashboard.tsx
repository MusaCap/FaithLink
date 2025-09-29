'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  MessageSquare, 
  Heart, 
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { dashboardService, DashboardStats, RecentActivity } from '../../services/dashboardService';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, activityData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentActivity()
      ]);
      
      setStats(statsData);
      setRecentActivity(activityData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatsCards = () => {
    if (!stats) return [];
    
    return [
      { name: 'Total Members', value: stats.totalMembers.toString(), change: '+0', changeType: 'increase', icon: Users },
      { name: 'Active Groups', value: stats.activeGroups.toString(), change: '+0', changeType: 'increase', icon: UserPlus },
      { name: 'This Week Events', value: stats.upcomingEvents.toString(), change: '+0', changeType: 'increase', icon: Calendar },
      { name: 'Group Attendance', value: `85%`, change: '+0%', changeType: 'increase', icon: CheckCircle },
    ];
  };

  const upcomingTasks = [
    { task: 'Review new member applications', priority: 'high', due: 'Today' },
    { task: 'Prepare weekly ministry report', priority: 'medium', due: 'Tomorrow' },
    { task: 'Follow up with inactive members', priority: 'high', due: 'This week' },
    { task: 'Plan Easter service coordination', priority: 'low', due: 'Next week' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-primary rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Church Leadership Dashboard</h1>
        <p className="text-primary-100">
          Manage your congregation and track engagement across all ministries
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-20"></div>
                  <div className="h-8 bg-neutral-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-neutral-200 rounded-lg"></div>
              </div>
            </div>
          ))
        ) : error ? (
          <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Failed to load dashboard stats: {error}</p>
            <button 
              onClick={loadDashboardData}
              className="mt-2 text-red-700 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        ) : (
          getStatsCards().map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600">{stat.name}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                      {stat.value !== '0' && (
                        <span className={`text-sm font-medium ${
                          stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          Live Data
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'member_joined' ? 'bg-blue-100' :
                    activity.type === 'event_registered' ? 'bg-green-100' :
                    activity.type === 'group_meeting' ? 'bg-purple-100' : 'bg-orange-100'
                  }`}>
                    {activity.type === 'member_joined' && <Users className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'event_registered' && <Calendar className="w-4 h-4 text-green-600" />}
                    {activity.type === 'group_meeting' && <UserPlus className="w-4 h-4 text-purple-600" />}
                    {activity.type === 'care_log' && <Heart className="w-4 h-4 text-orange-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-900">{activity.description}</p>
                    <p className="text-sm text-neutral-500">{activity.memberName} • {activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link href="/activity" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all activity →
              </Link>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900">Action Items</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingTasks.map((task, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-neutral-900">{task.task}</p>
                    <p className="text-xs text-neutral-500">{task.due}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link href="/tasks" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all tasks →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/members/new" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <UserPlus className="w-8 h-8 text-primary-600 mb-2" />
              <span className="text-sm font-medium text-neutral-900">Add Member</span>
            </Link>
            <Link href="/events/new" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <Calendar className="w-8 h-8 text-primary-600 mb-2" />
              <span className="text-sm font-medium text-neutral-900">Create Event</span>
            </Link>
            <Link href="/communications/new" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <MessageSquare className="w-8 h-8 text-primary-600 mb-2" />
              <span className="text-sm font-medium text-neutral-900">Send Message</span>
            </Link>
            <Link href="/reports" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <TrendingUp className="w-8 h-8 text-primary-600 mb-2" />
              <span className="text-sm font-medium text-neutral-900">View Reports</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
