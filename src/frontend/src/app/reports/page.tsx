'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, PieChart, Download, Filter, RefreshCw } from 'lucide-react';
import AttendanceAnalytics from '../../components/reports/AttendanceAnalytics';
import MemberEngagementMetrics from '../../components/reports/MemberEngagementMetrics';
import GroupHealthDashboard from '../../components/reports/GroupHealthDashboard';
import ExportButton from '../../components/reports/ExportButton';

interface DashboardStats {
  totalMembers: number;
  activeGroups: number;
  avgAttendance: number;
  memberGrowth: number;
  attendanceGrowth: number;
  engagementScore: number;
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('last30days');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReportsData();
  }, [dateRange]);

  const fetchReportsData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`http://localhost:8000/api/reports/dashboard-stats?range=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch reports data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchReportsData();
  };

  const exportReport = async (reportType: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/reports/export/${reportType}?range=${dateRange}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  // Mock data if no real data loaded
  const mockStats: DashboardStats = {
    totalMembers: 248,
    activeGroups: 18,
    avgAttendance: 85,
    memberGrowth: 12,
    attendanceGrowth: 8,
    engagementScore: 78
  };

  const displayStats = stats || mockStats;

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600">Church performance insights and member engagement metrics</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="last90days">Last 90 Days</option>
              <option value="lastyear">Last Year</option>
              <option value="ytd">Year to Date</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <PieChart className="w-4 h-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'attendance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Attendance
            </button>
            <button
              onClick={() => setActiveTab('engagement')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'engagement'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Engagement
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'groups'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Group Health
            </button>
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Members</p>
                  <p className="text-3xl font-bold text-gray-900">{displayStats.totalMembers}</p>
                </div>
                <div className="flex items-center text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">+{displayStats.memberGrowth}%</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Growth this period</span>
                  <ExportButton reportType="members" dateRange={dateRange} className="text-xs py-1 px-2" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Groups</p>
                  <p className="text-3xl font-bold text-gray-900">{displayStats.activeGroups}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Small groups running</span>
                  <ExportButton reportType="groups" dateRange={dateRange} className="text-xs py-1 px-2" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
                  <p className="text-3xl font-bold text-gray-900">{displayStats.avgAttendance}%</p>
                </div>
                <div className="flex items-center text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">+{displayStats.attendanceGrowth}%</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Service attendance rate</span>
                  <ExportButton reportType="attendance" dateRange={dateRange} className="text-xs py-1 px-2" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Engagement Score</p>
                  <p className="text-3xl font-bold text-gray-900">{displayStats.engagementScore}%</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${displayStats.engagementScore}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-500">Overall member engagement</span>
                  <button
                    onClick={() => exportReport('engagement')}
                    className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Prayer Requests</p>
                  <p className="text-3xl font-bold text-gray-900">24</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Active prayer requests</span>
                  <span className="text-red-600 font-medium">4 urgent</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Journey Completion</p>
                  <p className="text-3xl font-bold text-gray-900">67%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-500">Average completion rate</span>
                  <button
                    onClick={() => exportReport('journeys')}
                    className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Insights */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Top Performing Groups</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Young Adults Ministry</span>
                    <span className="text-sm font-medium text-green-600">95% attendance</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Men's Fellowship</span>
                    <span className="text-sm font-medium text-green-600">89% attendance</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Ladies Bible Study</span>
                    <span className="text-sm font-medium text-green-600">87% attendance</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Areas Needing Attention</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Senior Saints</span>
                    <span className="text-sm font-medium text-red-600">62% attendance</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Youth Group</span>
                    <span className="text-sm font-medium text-orange-600">71% attendance</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">New Members Class</span>
                    <span className="text-sm font-medium text-orange-600">74% attendance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <AttendanceAnalytics dateRange={dateRange} />
      )}

      {/* Engagement Tab */}
      {activeTab === 'engagement' && (
        <MemberEngagementMetrics dateRange={dateRange} />
      )}

      {/* Groups Tab */}
      {activeTab === 'groups' && (
        <GroupHealthDashboard dateRange={dateRange} />
      )}
    </div>
  );
}
