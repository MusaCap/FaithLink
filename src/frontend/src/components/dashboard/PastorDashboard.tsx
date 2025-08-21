'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  Heart, 
  Calendar, 
  UserCheck,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  BookOpen
} from 'lucide-react';

export default function PastorDashboard() {
  const careStats = [
    { name: 'Active Care Cases', value: '23', change: '+3', changeType: 'increase' as const, icon: Heart },
    { name: 'Scheduled Visits', value: '8', change: '+2', changeType: 'increase' as const, icon: UserCheck },
    { name: 'Prayer Requests', value: '12', change: '-1', changeType: 'decrease' as const, icon: BookOpen },
    { name: 'Follow-ups Due', value: '6', change: '+1', changeType: 'increase' as const, icon: AlertTriangle },
  ];

  const membersCare = [
    { name: 'Sarah Johnson', issue: 'Family health concerns', priority: 'high', lastContact: '2 days ago' },
    { name: 'Mike Thompson', issue: 'Job transition support', priority: 'medium', lastContact: '1 week ago' },
    { name: 'Emily Davis', issue: 'Grief counseling', priority: 'high', lastContact: '3 days ago' },
    { name: 'Robert Wilson', issue: 'Marriage counseling', priority: 'medium', lastContact: '5 days ago' },
  ];

  const upcomingVisits = [
    { member: 'Anderson Family', type: 'Home visit', time: 'Today 2:00 PM', purpose: 'New baby blessing' },
    { member: 'Margaret Smith', type: 'Hospital visit', time: 'Tomorrow 10:00 AM', purpose: 'Surgery recovery' },
    { member: 'Young Adults Group', type: 'Group meeting', time: 'Wednesday 7:00 PM', purpose: 'Leadership development' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Pastoral Care Dashboard</h1>
        <p className="text-green-100">
          Monitor member spiritual health and coordinate care ministry activities
        </p>
      </div>

      {/* Care Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {careStats.map((stat) => {
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
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Care Cases */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900">Active Care Cases</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {membersCare.map((member, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-3 h-3 rounded-full mt-1.5 ${
                    member.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">{member.name}</p>
                    <p className="text-sm text-neutral-600">{member.issue}</p>
                    <p className="text-xs text-neutral-500">Last contact: {member.lastContact}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link href="/care" className="text-sm text-green-600 hover:text-green-700 font-medium">
                View all care cases →
              </Link>
            </div>
          </div>
        </div>

        {/* Upcoming Visits */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900">Upcoming Visits</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingVisits.map((visit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">{visit.member}</p>
                    <p className="text-sm text-neutral-600">{visit.type} • {visit.time}</p>
                    <p className="text-xs text-neutral-500">{visit.purpose}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link href="/calendar" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View full calendar →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Care Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Quick Care Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/care/new" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-neutral-200 hover:border-green-300 hover:bg-green-50 transition-colors">
              <Heart className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-neutral-900">Log Care Visit</span>
            </Link>
            <Link href="/prayer-requests" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-neutral-200 hover:border-green-300 hover:bg-green-50 transition-colors">
              <BookOpen className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-neutral-900">Prayer Requests</span>
            </Link>
            <Link href="/communications/pastoral" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-neutral-200 hover:border-green-300 hover:bg-green-50 transition-colors">
              <MessageSquare className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-neutral-900">Send Message</span>
            </Link>
            <Link href="/members?filter=needs-followup" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-neutral-200 hover:border-green-300 hover:bg-green-50 transition-colors">
              <Users className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-neutral-900">Review Members</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Member Spiritual Health Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Congregation Health Overview</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-sm font-medium text-neutral-900 mb-2">Active in Groups</h4>
              <p className="text-2xl font-bold text-green-600">78%</p>
              <p className="text-xs text-neutral-500">+5% from last month</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-sm font-medium text-neutral-900 mb-2">Regular Attendance</h4>
              <p className="text-2xl font-bold text-blue-600">185</p>
              <p className="text-xs text-neutral-500">Weekly average</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-sm font-medium text-neutral-900 mb-2">Receiving Care</h4>
              <p className="text-2xl font-bold text-purple-600">23</p>
              <p className="text-xs text-neutral-500">Active care cases</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
