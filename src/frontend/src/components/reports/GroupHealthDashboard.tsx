'use client';

import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Download } from 'lucide-react';

interface GroupHealthDashboardProps {
  dateRange: string;
}

interface GroupHealth {
  id: string;
  name: string;
  leader: string;
  memberCount: number;
  targetSize: number;
  attendanceRate: number;
  engagementScore: number;
  growthRate: number;
  lastMeeting: string;
  status: 'healthy' | 'needs-attention' | 'at-risk' | 'thriving';
  healthScore: number;
  issues: string[];
  strengths: string[];
}

interface HealthMetric {
  label: string;
  value: number;
  target: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
}

const GroupHealthDashboard: React.FC<GroupHealthDashboardProps> = ({ dateRange }) => {
  const [groupsHealth, setGroupsHealth] = useState<GroupHealth[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('healthScore');

  useEffect(() => {
    fetchGroupHealthData();
  }, [dateRange]);

  const fetchGroupHealthData = async () => {
    try {
      const response = await fetch(`/api/reports/group-health?range=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setGroupsHealth(data.groups || []);
        setHealthMetrics(data.metrics || []);
      }
    } catch (error) {
      console.error('Failed to fetch group health data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const mockGroupsHealth: GroupHealth[] = [
    {
      id: '1',
      name: 'Young Adults Ministry',
      leader: 'Pastor David',
      memberCount: 24,
      targetSize: 25,
      attendanceRate: 95,
      engagementScore: 92,
      growthRate: 15,
      lastMeeting: '2025-01-14T19:00:00Z',
      status: 'thriving',
      healthScore: 94,
      issues: [],
      strengths: ['High attendance', 'Active participation', 'Growing membership']
    },
    {
      id: '2',
      name: 'Men\'s Fellowship',
      leader: 'John Smith',
      memberCount: 18,
      targetSize: 20,
      attendanceRate: 89,
      engagementScore: 85,
      growthRate: 8,
      lastMeeting: '2025-01-13T08:00:00Z',
      status: 'healthy',
      healthScore: 87,
      issues: ['Need new members'],
      strengths: ['Strong fellowship', 'Consistent meetings']
    },
    {
      id: '3',
      name: 'Ladies Bible Study',
      leader: 'Sarah Johnson',
      memberCount: 16,
      targetSize: 18,
      attendanceRate: 87,
      engagementScore: 88,
      growthRate: 5,
      lastMeeting: '2025-01-15T10:00:00Z',
      status: 'healthy',
      healthScore: 85,
      issues: [],
      strengths: ['Deep Bible study', 'Prayer support']
    },
    {
      id: '4',
      name: 'Youth Group',
      leader: 'Michael Chen',
      memberCount: 14,
      targetSize: 20,
      attendanceRate: 71,
      engagementScore: 68,
      growthRate: -2,
      lastMeeting: '2025-01-12T18:00:00Z',
      status: 'needs-attention',
      healthScore: 65,
      issues: ['Low attendance', 'Need engaging activities', 'Member retention'],
      strengths: ['Enthusiastic core group']
    },
    {
      id: '5',
      name: 'Senior Saints',
      leader: 'Robert Wilson',
      memberCount: 8,
      targetSize: 15,
      attendanceRate: 62,
      engagementScore: 58,
      growthRate: -8,
      lastMeeting: '2025-01-10T14:00:00Z',
      status: 'at-risk',
      healthScore: 52,
      issues: ['Declining attendance', 'Transportation issues', 'Health concerns', 'Need more activities'],
      strengths: ['Strong relationships']
    },
    {
      id: '6',
      name: 'New Members Class',
      leader: 'Pastor Smith',
      memberCount: 12,
      targetSize: 15,
      attendanceRate: 74,
      engagementScore: 78,
      growthRate: 20,
      lastMeeting: '2025-01-14T11:00:00Z',
      status: 'healthy',
      healthScore: 76,
      issues: ['Inconsistent attendance'],
      strengths: ['New member integration', 'Growing group']
    }
  ];

  const mockHealthMetrics: HealthMetric[] = [
    {
      label: 'Average Group Size',
      value: 15.3,
      target: 18,
      status: 'warning',
      description: 'Current average size vs target'
    },
    {
      label: 'Overall Attendance Rate',
      value: 79,
      target: 85,
      status: 'warning',
      description: 'Average attendance across all groups'
    },
    {
      label: 'Groups Meeting Regularly',
      value: 95,
      target: 100,
      status: 'good',
      description: 'Percentage of groups with regular meetings'
    },
    {
      label: 'Leadership Health',
      value: 88,
      target: 90,
      status: 'good',
      description: 'Leader engagement and effectiveness'
    },
    {
      label: 'Member Retention Rate',
      value: 82,
      target: 90,
      status: 'warning',
      description: 'Members staying in groups long-term'
    },
    {
      label: 'New Member Integration',
      value: 76,
      target: 80,
      status: 'warning',
      description: 'Success rate of integrating new members'
    }
  ];

  const displayGroups = groupsHealth.length > 0 ? groupsHealth : mockGroupsHealth;
  const displayMetrics = healthMetrics.length > 0 ? healthMetrics : mockHealthMetrics;

  const filteredGroups = filterStatus === 'all' 
    ? displayGroups 
    : displayGroups.filter(group => group.status === filterStatus);

  const sortedGroups = [...filteredGroups].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'leader') return a.leader.localeCompare(b.leader);
    return (b as any)[sortBy] - (a as any)[sortBy];
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'thriving': return 'bg-green-100 text-green-800 border-green-200';
      case 'healthy': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'needs-attention': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'at-risk': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'thriving': return <TrendingUp className="w-4 h-4" />;
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'needs-attention': return <Clock className="w-4 h-4" />;
      case 'at-risk': return <AlertTriangle className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Group Name', 'Leader', 'Members', 'Target Size', 'Attendance Rate', 'Engagement Score', 'Growth Rate', 'Health Score', 'Status', 'Issues'].join(','),
      ...sortedGroups.map(group => [
        group.name,
        group.leader,
        group.memberCount.toString(),
        group.targetSize.toString(),
        group.attendanceRate.toString(),
        group.engagementScore.toString(),
        group.growthRate.toString(),
        group.healthScore.toString(),
        group.status,
        group.issues.join('; ')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `group-health-report-${new Date().toISOString().split('T')[0]}.csv`;
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Groups</option>
            <option value="thriving">Thriving</option>
            <option value="healthy">Healthy</option>
            <option value="needs-attention">Needs Attention</option>
            <option value="at-risk">At Risk</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="healthScore">Health Score</option>
            <option value="attendanceRate">Attendance Rate</option>
            <option value="engagementScore">Engagement Score</option>
            <option value="memberCount">Member Count</option>
            <option value="growthRate">Growth Rate</option>
            <option value="name">Group Name</option>
            <option value="leader">Leader Name</option>
          </select>
        </div>
        <button
          onClick={exportData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Health Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayMetrics.map((metric, index) => (
          <div key={index} className={`rounded-lg border p-4 ${getMetricStatusColor(metric.status)}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">{metric.label}</h3>
              <div className={`w-3 h-3 rounded-full ${
                metric.status === 'good' ? 'bg-green-500' :
                metric.status === 'warning' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></div>
            </div>
            <div className="flex items-baseline space-x-2 mb-1">
              <span className="text-2xl font-bold">
                {metric.label.includes('Rate') || metric.label.includes('Health') ? `${metric.value}%` : metric.value}
              </span>
              <span className="text-sm opacity-70">
                / {metric.label.includes('Rate') || metric.label.includes('Health') ? `${metric.target}%` : metric.target}
              </span>
            </div>
            <p className="text-xs opacity-80">{metric.description}</p>
            <div className="mt-2 w-full bg-white bg-opacity-50 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${
                  metric.status === 'good' ? 'bg-green-500' :
                  metric.status === 'warning' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Group Health Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedGroups.map((group) => (
          <div key={group.id} className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{group.name}</h3>
                  <p className="text-sm text-gray-600">Led by {group.leader}</p>
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor(group.status)}`}>
                  {getStatusIcon(group.status)}
                  <span className="capitalize">{group.status.replace('-', ' ')}</span>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{group.memberCount}</p>
                  <p className="text-xs text-gray-500">Members (Target: {group.targetSize})</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{group.healthScore}%</p>
                  <p className="text-xs text-gray-500">Health Score</p>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Attendance</span>
                    <span className="font-medium">{group.attendanceRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        group.attendanceRate >= 85 ? 'bg-green-500' :
                        group.attendanceRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${group.attendanceRate}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Engagement</span>
                    <span className="font-medium">{group.engagementScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        group.engagementScore >= 85 ? 'bg-green-500' :
                        group.engagementScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${group.engagementScore}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Growth Rate</span>
                    <span className={`font-medium flex items-center space-x-1 ${
                      group.growthRate > 0 ? 'text-green-600' : 
                      group.growthRate < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {group.growthRate > 0 ? <TrendingUp className="w-3 h-3" /> : 
                       group.growthRate < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                      <span>{group.growthRate > 0 ? '+' : ''}{group.growthRate}%</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Issues and Strengths */}
              <div className="space-y-3">
                {group.issues.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-red-700 mb-1">Issues to Address</h4>
                    <div className="flex flex-wrap gap-1">
                      {group.issues.map((issue, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                          {issue}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {group.strengths.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-green-700 mb-1">Strengths</h4>
                    <div className="flex flex-wrap gap-1">
                      {group.strengths.map((strength, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Last Meeting */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Last meeting: {new Date(group.lastMeeting).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Group Health Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {displayGroups.filter(g => g.status === 'thriving' || g.status === 'healthy').length}
            </p>
            <p className="text-sm text-gray-600">Healthy Groups</p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {displayGroups.filter(g => g.status === 'needs-attention').length}
            </p>
            <p className="text-sm text-gray-600">Need Attention</p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {displayGroups.filter(g => g.status === 'at-risk').length}
            </p>
            <p className="text-sm text-gray-600">At Risk</p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {displayGroups.reduce((sum, group) => sum + group.memberCount, 0)}
            </p>
            <p className="text-sm text-gray-600">Total Members</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupHealthDashboard;
