'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import { groupService } from '../../services/groupService';
import { AttendanceSession, AttendanceFilters, AttendanceStats } from '../../types/attendance';
import { 
  Calendar, 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  TrendingUp,
  Clock,
  UserCheck,
  FileText,
  BarChart3
} from 'lucide-react';

interface AttendanceHistoryProps {
  groupId: string;
}

export default function AttendanceHistory({ groupId }: AttendanceHistoryProps) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSessions, setTotalSessions] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<AttendanceFilters>({
    groupId,
    limit: 10,
    offset: 0,
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const sessionsPerPage = 10;

  useEffect(() => {
    loadData();
  }, [groupId, currentPage]);

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      offset: (currentPage - 1) * sessionsPerPage
    }));
  }, [currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [groupData, sessionsResponse, statsData] = await Promise.all([
        groupService.getGroup(groupId),
        attendanceService.getAttendanceSessions({
          ...filters,
          offset: (currentPage - 1) * sessionsPerPage
        }),
        attendanceService.getAttendanceStats(groupId)
      ]);
      
      setGroupName(groupData.name);
      setSessions(sessionsResponse.sessions);
      setTotalSessions(sessionsResponse.total);
      setStats(statsData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1);
  };

  const applyFilters = () => {
    loadData();
  };

  const exportAttendance = async (format: 'csv' | 'excel' = 'csv') => {
    try {
      const blob = await attendanceService.exportAttendance(filters, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-${groupName}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export attendance data');
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString?: string): string => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getAttendanceRate = (session: AttendanceSession): number => {
    return session.totalMembers > 0 ? Math.round((session.presentCount / session.totalMembers) * 100) : 0;
  };

  const canManageAttendance = user?.role === 'admin' || user?.role === 'pastor' || 
    (stats && (stats.groupId === groupId));

  const totalPages = Math.ceil(totalSessions / sessionsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Attendance History</h1>
            <p className="mt-1 text-sm text-neutral-600">{groupName}</p>
          </div>
          
          {canManageAttendance && (
            <div className="flex space-x-3">
              <button
                onClick={() => exportAttendance('csv')}
                className="inline-flex items-center px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
              <Link
                href={`/groups/${groupId}/attendance/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Record Attendance
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-600">Total Sessions</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.totalSessions}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-600">Average Attendance</p>
                <p className="text-2xl font-bold text-neutral-900">{Math.round(stats.averageAttendance)}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-neutral-900">{Math.round(stats.attendanceRate)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-600">Active Members</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.memberStats.length}</p>
              </div>
              <UserCheck className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-neutral-900">Filter Sessions</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Sort By
              </label>
              <select
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={filters.sortBy || 'date'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="date">Date</option>
                <option value="recordedAt">Recorded At</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Sort Order
              </label>
              <select
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={filters.sortOrder || 'desc'}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
            
            <div className="md:col-span-4 flex justify-end">
              <button
                onClick={applyFilters}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <Search className="w-4 h-4 mr-2" />
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-lg font-medium text-neutral-900">
            Attendance Sessions ({totalSessions} total)
          </h3>
        </div>
        
        <div className="divide-y divide-neutral-200">
          {sessions.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-neutral-900 mb-2">No attendance records found</h4>
              <p className="text-neutral-600 mb-4">Start recording attendance to track group participation</p>
              {canManageAttendance && (
                <Link
                  href={`/groups/${groupId}/attendance/new`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Record First Session
                </Link>
              )}
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="p-6 hover:bg-neutral-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h4 className="text-lg font-medium text-neutral-900">
                        {formatDate(session.date)}
                      </h4>
                      {session.topic && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {session.topic}
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getAttendanceRate(session) >= 80 ? 'bg-green-100 text-green-800' :
                        getAttendanceRate(session) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {getAttendanceRate(session)}% attendance
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-neutral-600">
                      {session.startTime && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatTime(session.startTime)}
                          {session.endTime && ` - ${formatTime(session.endTime)}`}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {session.presentCount}/{session.totalMembers} present
                      </div>
                      <div className="flex items-center">
                        <UserCheck className="w-4 h-4 mr-1" />
                        Recorded by {session.recordedByName}
                      </div>
                    </div>
                    
                    {session.notes && (
                      <div className="mt-2 flex items-start">
                        <FileText className="w-4 h-4 mr-1 mt-0.5 text-neutral-400" />
                        <p className="text-sm text-neutral-600">{session.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/groups/${groupId}/attendance/${session.id}`}
                      className="inline-flex items-center px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
                
                {/* Attendance Breakdown */}
                <div className="mt-4 grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">{session.presentCount}</div>
                    <div className="text-xs text-neutral-500">Present</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-red-600">{session.absentCount}</div>
                    <div className="text-xs text-neutral-500">Absent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-yellow-600">{session.lateCount}</div>
                    <div className="text-xs text-neutral-500">Late</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">{session.excusedCount}</div>
                    <div className="text-xs text-neutral-500">Excused</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
            <div className="text-sm text-neutral-700">
              Showing {((currentPage - 1) * sessionsPerPage) + 1} to {Math.min(currentPage * sessionsPerPage, totalSessions)} of {totalSessions} sessions
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
