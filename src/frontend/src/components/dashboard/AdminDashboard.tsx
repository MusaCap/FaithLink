'use client';

import React from 'react';
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

export default function AdminDashboard() {
  const stats = [
    { name: 'Total Members', value: '248', change: '+12', changeType: 'increase' as const, icon: Users },
    { name: 'Active Groups', value: '18', change: '+2', changeType: 'increase' as const, icon: UserPlus },
    { name: 'This Week Events', value: '7', change: '+3', changeType: 'increase' as const, icon: Calendar },
    { name: 'Group Attendance', value: '85%', change: '+3%', changeType: 'increase' as const, icon: CheckCircle },
  ];

  const recentActivity = [
    { type: 'member', action: 'New member added', name: 'Sarah Johnson', time: '2 hours ago' },
    { type: 'event', action: 'Event check-in completed', name: 'Sunday Service', time: '3 hours ago' },
    { type: 'group', action: 'Group meeting scheduled', name: 'Youth Group', time: '5 hours ago' },
    { type: 'care', action: 'Care visit logged', name: 'Family Smith', time: '1 day ago' },
  ];

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
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">{stat.name}</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.changeType === 'increase' ? '+' : ''}{stat.change}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </div>
          );
        })}
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
                    activity.type === 'member' ? 'bg-blue-100' :
                    activity.type === 'event' ? 'bg-green-100' :
                    activity.type === 'group' ? 'bg-purple-100' : 'bg-orange-100'
                  }`}>
                    {activity.type === 'member' && <Users className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'event' && <Calendar className="w-4 h-4 text-green-600" />}
                    {activity.type === 'group' && <UserPlus className="w-4 h-4 text-purple-600" />}
                    {activity.type === 'care' && <Heart className="w-4 h-4 text-orange-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-900">{activity.action}</p>
                    <p className="text-sm text-neutral-500">{activity.name} • {activity.time}</p>
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
