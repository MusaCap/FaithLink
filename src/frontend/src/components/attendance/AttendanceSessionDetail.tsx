'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import { groupService } from '../../services/groupService';
import { AttendanceSession, AttendanceRecord, AttendanceStatus } from '../../types/attendance';
import { 
  Calendar, 
  Clock, 
  Users, 
  Edit, 
  Trash2, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock3, 
  UserCheck,
  FileText,
  ArrowLeft,
  BarChart3
} from 'lucide-react';

interface AttendanceSessionDetailProps {
  groupId: string;
  sessionId: string;
}

export default function AttendanceSessionDetail({ groupId, sessionId }: AttendanceSessionDetailProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadSessionData();
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [sessionData, groupData] = await Promise.all([
        attendanceService.getAttendanceSession(sessionId),
        groupService.getGroup(groupId)
      ]);
      
      setSession(sessionData);
      setGroupName(groupData.name);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (recordId: string, newStatus: AttendanceStatus) => {
    if (!session) return;
    
    try {
      setUpdatingStatus(true);
      setError(null);
      
      const record = session.records.find(r => r.id === recordId);
      if (!record) return;
      
      const updates = [{
        memberId: record.memberId,
        status: newStatus,
        notes: record.notes
      }];
      
      await attendanceService.bulkUpdateAttendance(sessionId, updates);
      await loadSessionData(); // Refresh data
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update attendance');
    } finally {
      setUpdatingStatus(false);
      setEditingRecord(null);
    }
  };

  const handleNotesUpdate = async (recordId: string, notes: string) => {
    if (!session) return;
    
    try {
      setUpdatingStatus(true);
      setError(null);
      
      const record = session.records.find(r => r.id === recordId);
      if (!record) return;
      
      const updates = [{
        memberId: record.memberId,
        status: record.status,
        notes: notes
      }];
      
      await attendanceService.bulkUpdateAttendance(sessionId, updates);
      await loadSessionData(); // Refresh data
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notes');
    } finally {
      setUpdatingStatus(false);
      setEditingRecord(null);
    }
  };

  const handleDeleteSession = async () => {
    if (!session || !confirm('Are you sure you want to delete this attendance session? This action cannot be undone.')) {
      return;
    }
    
    try {
      await attendanceService.deleteAttendanceSession(sessionId);
      router.push(`/groups/${groupId}/attendance`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
    }
  };

  const exportSession = async (format: 'csv' | 'excel' = 'csv') => {
    if (!session) return;
    
    try {
      const blob = await attendanceService.exportAttendance({
        groupId,
        startDate: session.date,
        endDate: session.date
      }, format);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-${session.date}-${sessionId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export session data');
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const getStatusColor = (status: AttendanceStatus): string => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'excused': return 'bg-blue-100 text-blue-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return <CheckCircle className="w-4 h-4" />;
      case 'absent': return <XCircle className="w-4 h-4" />;
      case 'late': return <Clock3 className="w-4 h-4" />;
      case 'excused': return <UserCheck className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getAttendanceRate = (): number => {
    if (!session || session.totalMembers === 0) return 0;
    return Math.round((session.presentCount / session.totalMembers) * 100);
  };

  const canManageAttendance = user?.role === 'admin' || user?.role === 'pastor' || 
    (session && session.recordedBy === user?.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-sm text-red-700">{error || 'Session not found'}</div>
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
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <Link
                href={`/groups/${groupId}/attendance`}
                className="inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Attendance History
              </Link>
            </div>
            
            <div className="flex items-center space-x-4 mb-4">
              <h1 className="text-2xl font-bold text-neutral-900">
                {formatDate(session.date)}
              </h1>
              {session.topic && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {session.topic}
                </span>
              )}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                getAttendanceRate() >= 80 ? 'bg-green-100 text-green-800' :
                getAttendanceRate() >= 60 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {getAttendanceRate()}% attendance
              </span>
            </div>
            
            <p className="text-neutral-600 mb-4">{groupName}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {session.startTime && (
                <div className="flex items-center text-neutral-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {formatTime(session.startTime)}
                  {session.endTime && ` - ${formatTime(session.endTime)}`}
                </div>
              )}
              <div className="flex items-center text-neutral-600">
                <Users className="w-4 h-4 mr-2" />
                {session.presentCount}/{session.totalMembers} members present
              </div>
              <div className="flex items-center text-neutral-600">
                <UserCheck className="w-4 h-4 mr-2" />
                Recorded by {session.recordedByName}
              </div>
            </div>
            
            {session.notes && (
              <div className="mt-4 p-3 bg-neutral-50 rounded-md">
                <div className="flex items-start">
                  <FileText className="w-4 h-4 mr-2 mt-0.5 text-neutral-500" />
                  <p className="text-sm text-neutral-700">{session.notes}</p>
                </div>
              </div>
            )}
          </div>
          
          {canManageAttendance && (
            <div className="flex space-x-2">
              <button
                onClick={() => exportSession('csv')}
                className="inline-flex items-center px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button
                onClick={handleDeleteSession}
                className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Present</p>
              <p className="text-2xl font-bold text-green-600">{session.presentCount}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Absent</p>
              <p className="text-2xl font-bold text-red-600">{session.absentCount}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Late</p>
              <p className="text-2xl font-bold text-yellow-600">{session.lateCount}</p>
            </div>
            <Clock3 className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Excused</p>
              <p className="text-2xl font-bold text-blue-600">{session.excusedCount}</p>
            </div>
            <UserCheck className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-lg font-medium text-neutral-900">
            Member Attendance ({session.records.length} members)
          </h3>
        </div>
        
        <div className="divide-y divide-neutral-200">
          {session.records.map((record) => (
            <div key={record.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-neutral-900">{record.memberName}</h4>
                    <p className="text-xs text-neutral-500">Member ID: {record.memberId}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {canManageAttendance && editingRecord === record.id ? (
                    <div className="flex items-center space-x-2">
                      {(['present', 'absent', 'late', 'excused'] as AttendanceStatus[]).map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(record.id, status)}
                          disabled={updatingStatus}
                          className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-medium border ${
                            record.status === status ? getStatusColor(status) : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50'
                          } disabled:opacity-50`}
                        >
                          {getStatusIcon(status)}
                          <span className="capitalize">{status}</span>
                        </button>
                      ))}
                      <button
                        onClick={() => setEditingRecord(null)}
                        className="px-2 py-1 text-xs text-neutral-600 hover:text-neutral-900"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        <span className="capitalize">{record.status}</span>
                      </span>
                      {canManageAttendance && (
                        <button
                          onClick={() => setEditingRecord(record.id)}
                          className="text-neutral-400 hover:text-neutral-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {record.notes && (
                <div className="mt-3 ml-14">
                  <div className="flex items-start">
                    <FileText className="w-4 h-4 mr-2 mt-0.5 text-neutral-400" />
                    <p className="text-sm text-neutral-600">{record.notes}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
