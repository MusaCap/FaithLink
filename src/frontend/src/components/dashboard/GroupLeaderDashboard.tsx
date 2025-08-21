'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  UserPlus,
  Calendar, 
  UserCheck,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function GroupLeaderDashboard() {
  const myGroups = [
    { 
      name: 'Young Adults Ministry', 
      members: 24, 
      lastMeeting: '3 days ago',
      nextMeeting: 'Wednesday 7:00 PM',
      attendance: '18/24'
    },
    { 
      name: 'Bible Study Group', 
      members: 12, 
      lastMeeting: '1 week ago',
      nextMeeting: 'Sunday 6:00 PM',
      attendance: '10/12'
    },
  ];

  const stats = [
    { name: 'My Groups', value: '3', change: '+1', changeType: 'increase' as const, icon: Users },
    { name: 'Total Members', value: '42', change: '+5', changeType: 'increase' as const, icon: UserPlus },
    { name: 'This Week Meetings', value: '4', change: '0', changeType: 'neutral' as const, icon: Calendar },
    { name: 'Avg Attendance', value: '88%', change: '+5%', changeType: 'increase' as const, icon: TrendingUp },
  ];

  const recentActivity = [
    { type: 'attendance', action: 'Meeting attendance recorded', group: 'Young Adults Ministry', time: '3 days ago' },
    { type: 'member', action: 'New member joined', group: 'Bible Study Group', time: '1 week ago' },
    { type: 'message', action: 'Group message sent', group: 'Young Adults Ministry', time: '2 weeks ago' },
  ];

  const upcomingTasks = [
    { task: 'Prepare Young Adults meeting agenda', due: 'Today', priority: 'high' },
    { task: 'Follow up with absent members', due: 'Tomorrow', priority: 'medium' },
    { task: 'Plan group retreat', due: 'This week', priority: 'low' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Group Leader Dashboard</h1>
        <p className="text-purple-100">
          Manage your groups, track attendance, and engage with members
        </p>
      </div>

      {/* My Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {myGroups.map((group, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-neutral-200">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">{group.name}</h3>
                <div className="text-sm text-neutral-500">{group.members} members</div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Last meeting:</span>
                  <span className="text-sm font-medium text-neutral-900">{group.lastMeeting}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Next meeting:</span>
                  <span className="text-sm font-medium text-neutral-900">{group.nextMeeting}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Attendance:</span>
                  <span className="text-sm font-medium text-green-600">{group.attendance}</span>
                </div>
              </div>
              <div className="mt-6 flex space-x-3">
                <Link href={`/groups/${index + 1}`} className="flex-1 text-center px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors">
                  Manage
                </Link>
                <Link href={`/groups/${index + 1}/attendance`} className="flex-1 text-center px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors">
                  Attendance
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'attendance' ? 'bg-green-100' :
                    activity.type === 'member' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    {activity.type === 'attendance' && <UserCheck className="w-4 h-4 text-green-600" />}
                    {activity.type === 'member' && <Users className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'message' && <MessageSquare className="w-4 h-4 text-purple-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-900">{activity.action}</p>
                    <p className="text-sm text-neutral-500">{activity.group} • {activity.time}</p>
                  </div>
                </div>
              ))}
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
            <Link href="/groups/attendance/new" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-neutral-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <UserCheck className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-neutral-900">Take Attendance</span>
            </Link>
            <Link href="/communications/group" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-neutral-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <MessageSquare className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-neutral-900">Message Group</span>
            </Link>
            <Link href="/events/group/new" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-neutral-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <Calendar className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-neutral-900">Plan Event</span>
            </Link>
            <Link href="/reports/group" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-neutral-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-neutral-900">View Reports</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Group Performance Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Group Performance</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-sm font-medium text-neutral-900 mb-2">Average Attendance</h4>
              <p className="text-2xl font-bold text-green-600">82%</p>
              <p className="text-xs text-neutral-500">Last 4 weeks</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-sm font-medium text-neutral-900 mb-2">Total Members</h4>
              <p className="text-2xl font-bold text-blue-600">36</p>
              <p className="text-xs text-neutral-500">Across all groups</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-sm font-medium text-neutral-900 mb-2">Meetings This Month</h4>
              <p className="text-2xl font-bold text-purple-600">8</p>
              <p className="text-xs text-neutral-500">Scheduled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
