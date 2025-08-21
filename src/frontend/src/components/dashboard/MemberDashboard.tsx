'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Calendar, 
  Users, 
  BookOpen,
  CheckCircle,
  Clock,
  User
} from 'lucide-react';

export default function MemberDashboard() {
  const upcomingEvents = [
    { name: 'Sunday Worship Service', date: 'Sunday, 9:00 AM', location: 'Main Sanctuary' },
    { name: 'Bible Study Group', date: 'Wednesday, 7:00 PM', location: 'Room 201' },
    { name: 'Community Outreach', date: 'Saturday, 10:00 AM', location: 'Downtown' },
  ];

  const myGroups = [
    { name: 'Young Adults Ministry', role: 'Member', lastActivity: '2 days ago' },
    { name: 'Bible Study Group', role: 'Member', lastActivity: '5 days ago' },
  ];

  const journeyMilestones = [
    { name: 'Baptism', completed: true, date: 'Jan 15, 2024' },
    { name: 'Membership Class', completed: true, date: 'Feb 20, 2024' },
    { name: 'First Time Volunteer', completed: false, date: null },
    { name: 'Small Group Leadership', completed: false, date: null },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to Your Faith Journey</h1>
        <p className="text-blue-100">
          Stay connected with your church community and track your spiritual growth
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">Upcoming Events</h3>
              <Calendar className="w-5 h-5 text-neutral-400" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">{event.name}</p>
                    <p className="text-xs text-neutral-500">{event.date}</p>
                    <p className="text-xs text-neutral-500">{event.location}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link href="/events" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all events →
              </Link>
            </div>
          </div>
        </div>

        {/* My Groups */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">My Groups</h3>
              <Users className="w-5 h-5 text-neutral-400" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {myGroups.map((group, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">{group.name}</p>
                    <p className="text-xs text-neutral-500">{group.role} • {group.lastActivity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link href="/groups" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all groups →
              </Link>
            </div>
          </div>
        </div>

        {/* Spiritual Journey */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">My Journey</h3>
              <Heart className="w-5 h-5 text-neutral-400" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {journeyMilestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    milestone.completed ? 'bg-green-100' : 'bg-neutral-100'
                  }`}>
                    {milestone.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-neutral-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      milestone.completed ? 'text-neutral-900' : 'text-neutral-500'
                    }`}>
                      {milestone.name}
                    </p>
                    {milestone.date && (
                      <p className="text-xs text-neutral-500">{milestone.date}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link href="/journey" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View full journey →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Profile Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Profile Summary</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-primary-600" />
              </div>
              <h4 className="text-sm font-medium text-neutral-900 mb-2">Profile Completion</h4>
              <p className="text-2xl font-bold text-primary-600">85%</p>
              <p className="text-xs text-neutral-500">Almost complete</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-sm font-medium text-neutral-900 mb-2">Event Attendance</h4>
              <p className="text-2xl font-bold text-green-600">12</p>
              <p className="text-xs text-neutral-500">This month</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-sm font-medium text-neutral-900 mb-2">Journey Progress</h4>
              <p className="text-2xl font-bold text-purple-600">2/4</p>
              <p className="text-xs text-neutral-500">Milestones completed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
