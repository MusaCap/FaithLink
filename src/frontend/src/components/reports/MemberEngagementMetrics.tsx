'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Heart, MessageSquare, Calendar, BookOpen, Download, Filter } from 'lucide-react';

interface MemberEngagementMetricsProps {
  dateRange: string;
}

interface EngagementMetric {
  metric: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface MemberActivity {
  memberId: string;
  memberName: string;
  attendanceScore: number;
  participationScore: number;
  journeyProgress: number;
  prayerRequests: number;
  groupInvolvement: number;
  overallScore: number;
  status: 'highly-engaged' | 'moderately-engaged' | 'low-engagement' | 'at-risk';
}

interface EngagementCategory {
  category: string;
  members: number;
  percentage: number;
  color: string;
}

const MemberEngagementMetrics: React.FC<MemberEngagementMetricsProps> = ({ dateRange }) => {
  const [metrics, setMetrics] = useState<EngagementMetric[]>([]);
  const [memberActivities, setMemberActivities] = useState<MemberActivity[]>([]);
  const [categories, setCategories] = useState<EngagementCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('overallScore');

  useEffect(() => {
    fetchEngagementData();
  }, [dateRange]);

  const fetchEngagementData = async () => {
    try {
      const response = await fetch(`/api/reports/engagement?range=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics || []);
        setMemberActivities(data.activities || []);
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch engagement data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const mockMetrics: EngagementMetric[] = [
    {
      metric: 'Overall Engagement Score',
      value: 78,
      change: 5.2,
      trend: 'up',
      description: 'Average engagement across all metrics'
    },
    {
      metric: 'Active Participants',
      value: 156,
      change: 8.1,
      trend: 'up',
      description: 'Members with 70%+ engagement score'
    },
    {
      metric: 'Journey Completion Rate',
      value: 67,
      change: -2.3,
      trend: 'down',
      description: 'Members completing assigned journeys'
    },
    {
      metric: 'Group Participation',
      value: 84,
      change: 3.7,
      trend: 'up',
      description: 'Members actively involved in groups'
    },
    {
      metric: 'Prayer Request Activity',
      value: 42,
      change: 12.5,
      trend: 'up',
      description: 'Members submitting/updating prayer requests'
    },
    {
      metric: 'Event Attendance Rate',
      value: 73,
      change: -1.8,
      trend: 'down',
      description: 'Average attendance at church events'
    }
  ];

  const mockMemberActivities: MemberActivity[] = [
    {
      memberId: '1',
      memberName: 'Sarah Johnson',
      attendanceScore: 95,
      participationScore: 88,
      journeyProgress: 92,
      prayerRequests: 3,
      groupInvolvement: 90,
      overallScore: 91,
      status: 'highly-engaged'
    },
    {
      memberId: '2',
      memberName: 'Michael Chen',
      attendanceScore: 82,
      participationScore: 75,
      journeyProgress: 78,
      prayerRequests: 1,
      groupInvolvement: 85,
      overallScore: 80,
      status: 'highly-engaged'
    },
    {
      memberId: '3',
      memberName: 'Emily Rodriguez',
      attendanceScore: 70,
      participationScore: 65,
      journeyProgress: 58,
      prayerRequests: 2,
      groupInvolvement: 72,
      overallScore: 67,
      status: 'moderately-engaged'
    },
    {
      memberId: '4',
      memberName: 'Robert Wilson',
      attendanceScore: 45,
      participationScore: 38,
      journeyProgress: 25,
      prayerRequests: 0,
      groupInvolvement: 40,
      overallScore: 38,
      status: 'low-engagement'
    },
    {
      memberId: '5',
      memberName: 'Maria Santos',
      attendanceScore: 25,
      participationScore: 20,
      journeyProgress: 15,
      prayerRequests: 0,
      groupInvolvement: 22,
      overallScore: 21,
      status: 'at-risk'
    }
  ];

  const mockCategories: EngagementCategory[] = [
    { category: 'Highly Engaged', members: 89, percentage: 36, color: 'bg-green-500' },
    { category: 'Moderately Engaged', members: 94, percentage: 38, color: 'bg-blue-500' },
    { category: 'Low Engagement', members: 48, percentage: 19, color: 'bg-yellow-500' },
    { category: 'At Risk', members: 17, percentage: 7, color: 'bg-red-500' }
  ];

  const displayMetrics = metrics.length > 0 ? metrics : mockMetrics;
  const displayActivities = memberActivities.length > 0 ? memberActivities : mockMemberActivities;
  const displayCategories = categories.length > 0 ? categories : mockCategories;

  const filteredActivities = selectedCategory === 'all' 
    ? displayActivities 
    : displayActivities.filter(member => {
        const categoryMap: Record<string, string> = {
          'highly-engaged': 'Highly Engaged',
          'moderately-engaged': 'Moderately Engaged',
          'low-engagement': 'Low Engagement',
          'at-risk': 'At Risk'
        };
        return categoryMap[member.status] === selectedCategory;
      });

  const sortedActivities = [...filteredActivities].sort((a, b) => {
    if (sortBy === 'memberName') return a.memberName.localeCompare(b.memberName);
    return (b as any)[sortBy] - (a as any)[sortBy];
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'highly-engaged': return 'bg-green-100 text-green-800';
      case 'moderately-engaged': return 'bg-blue-100 text-blue-800';
      case 'low-engagement': return 'bg-yellow-100 text-yellow-800';
      case 'at-risk': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'highly-engaged': return 'Highly Engaged';
      case 'moderately-engaged': return 'Moderately Engaged';
      case 'low-engagement': return 'Low Engagement';
      case 'at-risk': return 'At Risk';
      default: return 'Unknown';
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Member Name', 'Attendance Score', 'Participation Score', 'Journey Progress', 'Prayer Requests', 'Group Involvement', 'Overall Score', 'Status'].join(','),
      ...sortedActivities.map(member => [
        member.memberName,
        member.attendanceScore.toString(),
        member.participationScore.toString(),
        member.journeyProgress.toString(),
        member.prayerRequests.toString(),
        member.groupInvolvement.toString(),
        member.overallScore.toString(),
        getStatusLabel(member.status)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `member-engagement-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Engagement Levels</option>
            {displayCategories.map((category) => (
              <option key={category.category} value={category.category}>
                {category.category}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="overallScore">Overall Score</option>
            <option value="attendanceScore">Attendance Score</option>
            <option value="participationScore">Participation Score</option>
            <option value="journeyProgress">Journey Progress</option>
            <option value="memberName">Member Name</option>
          </select>
        </div>
        <button
          onClick={exportData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Data</span>
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayMetrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">{metric.metric}</h3>
              <div className={`flex items-center space-x-1 ${
                metric.trend === 'up' ? 'text-green-600' : 
                metric.trend === 'down' ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                <TrendingUp className={`w-4 h-4 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                <span className="text-xs font-medium">
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {metric.metric.includes('Rate') || metric.metric.includes('Score') ? `${metric.value}%` : metric.value}
            </p>
            <p className="text-xs text-gray-500">{metric.description}</p>
          </div>
        ))}
      </div>

      {/* Engagement Categories */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Engagement Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayCategories.map((category, index) => (
            <div key={index} className="text-center">
              <div className="mb-3">
                <div className={`mx-auto w-16 h-16 ${category.color} rounded-full flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">{category.members}</span>
                </div>
              </div>
              <h4 className="font-medium text-gray-900">{category.category}</h4>
              <p className="text-sm text-gray-600">{category.percentage}% of members</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`${category.color} h-2 rounded-full`}
                  style={{ width: `${category.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Member Activities */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Member Engagement Details</h3>
          <p className="text-sm text-gray-600 mt-1">
            Showing {sortedActivities.length} members
            {selectedCategory !== 'all' && ` in ${selectedCategory} category`}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Journey Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prayer Requests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group Involvement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedActivities.map((member, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <Users className="w-4 h-4 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{member.memberName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900">{member.attendanceScore}%</span>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${member.attendanceScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900">{member.participationScore}%</span>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${member.participationScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900">{member.journeyProgress}%</span>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${member.journeyProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>{member.prayerRequests}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900">{member.groupInvolvement}%</span>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${member.groupInvolvement}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{member.overallScore}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.status)}`}>
                      {getStatusLabel(member.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Engagement Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">High Engagement</h4>
            <p className="text-sm text-gray-600">
              {displayCategories[0]?.members || 89} members are highly engaged with consistent participation
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6 text-yellow-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Needs Attention</h4>
            <p className="text-sm text-gray-600">
              {(displayCategories[2]?.members || 48) + (displayCategories[3]?.members || 17)} members need increased engagement
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Journey Focus</h4>
            <p className="text-sm text-gray-600">
              Journey completion rate is at 67%, indicating room for improvement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberEngagementMetrics;
