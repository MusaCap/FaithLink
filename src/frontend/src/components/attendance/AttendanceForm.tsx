'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import { groupService } from '../../services/groupService';
import { AttendanceCreateRequest, AttendanceStatus } from '../../types/attendance';
import { GroupMember } from '../../types/group';
import { 
  Calendar, 
  Clock, 
  Users, 
  Save, 
  CheckCircle, 
  XCircle, 
  Clock3, 
  UserCheck 
} from 'lucide-react';

interface AttendanceFormProps {
  groupId: string;
}

export default function AttendanceForm({ groupId }: AttendanceFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [groupName, setGroupName] = useState('');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    topic: '',
    notes: ''
  });

  const [attendanceRecords, setAttendanceRecords] = useState<{
    [memberId: string]: {
      status: AttendanceStatus;
      notes: string;
    }
  }>({});

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [groupData, membersData] = await Promise.all([
        groupService.getGroup(groupId),
        groupService.getGroupMembers(groupId)
      ]);
      
      setGroupName(groupData.name);
      setGroupMembers(membersData);
      
      // Initialize attendance records with default 'present' status
      const initialRecords: { [key: string]: { status: AttendanceStatus; notes: string } } = {};
      membersData.forEach(member => {
        initialRecords[member.memberId] = {
          status: 'present',
          notes: ''
        };
      });
      setAttendanceRecords(initialRecords);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAttendanceChange = (memberId: string, field: 'status' | 'notes', value: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [field]: value
      }
    }));
  };

  const setAllAttendance = (status: AttendanceStatus) => {
    const updatedRecords = { ...attendanceRecords };
    Object.keys(updatedRecords).forEach(memberId => {
      updatedRecords[memberId].status = status;
    });
    setAttendanceRecords(updatedRecords);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date) {
      setError('Date is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const attendanceData: AttendanceCreateRequest = {
        groupId,
        date: formData.date,
        startTime: formData.startTime || undefined,
        endTime: formData.endTime || undefined,
        topic: formData.topic || undefined,
        notes: formData.notes || undefined,
        records: Object.entries(attendanceRecords).map(([memberId, record]) => ({
          memberId,
          status: record.status,
          notes: record.notes || undefined
        }))
      };

      await attendanceService.createAttendanceSession(attendanceData);
      router.push(`/groups/${groupId}/attendance`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: AttendanceStatus): string => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'excused': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
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

  const attendanceStats = {
    present: Object.values(attendanceRecords).filter(r => r.status === 'present').length,
    absent: Object.values(attendanceRecords).filter(r => r.status === 'absent').length,
    late: Object.values(attendanceRecords).filter(r => r.status === 'late').length,
    excused: Object.values(attendanceRecords).filter(r => r.status === 'excused').length,
    total: groupMembers.length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Session Details */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Session Details - {groupName}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={formData.date}
              onChange={(e) => handleFormChange('date', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={formData.startTime}
              onChange={(e) => handleFormChange('startTime', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              End Time
            </label>
            <input
              type="time"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={formData.endTime}
              onChange={(e) => handleFormChange('endTime', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Topic
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={formData.topic}
              onChange={(e) => handleFormChange('topic', e.target.value)}
              placeholder="Session topic"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Notes
          </label>
          <textarea
            rows={2}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            value={formData.notes}
            onChange={(e) => handleFormChange('notes', e.target.value)}
            placeholder="Session notes or announcements"
          />
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-neutral-900 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Attendance Summary
          </h3>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setAllAttendance('present')}
              className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-md hover:bg-green-200"
            >
              Mark All Present
            </button>
            <button
              type="button"
              onClick={() => setAllAttendance('absent')}
              className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-md hover:bg-red-200"
            >
              Mark All Absent
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{attendanceStats.present}</div>
            <div className="text-sm text-green-700">Present</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{attendanceStats.absent}</div>
            <div className="text-sm text-red-700">Absent</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">{attendanceStats.late}</div>
            <div className="text-sm text-yellow-700">Late</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{attendanceStats.excused}</div>
            <div className="text-sm text-blue-700">Excused</div>
          </div>
        </div>
      </div>

      {/* Member Attendance */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-4">
          Member Attendance ({groupMembers.length} members)
        </h3>
        
        <div className="space-y-4">
          {groupMembers.map((member) => {
            const record = attendanceRecords[member.memberId] || { status: 'present', notes: '' };
            
            return (
              <div key={member.id} className="flex items-center space-x-4 p-4 border border-neutral-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-neutral-900">{member.memberName}</span>
                    {member.role === 'leader' && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Leader</span>
                    )}
                    {member.role === 'co_leader' && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Co-Leader</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {(['present', 'absent', 'late', 'excused'] as AttendanceStatus[]).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleAttendanceChange(member.memberId, 'status', status)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-medium border ${
                        record.status === status
                          ? getStatusColor(status)
                          : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      {getStatusIcon(status)}
                      <span className="capitalize">{status}</span>
                    </button>
                  ))}
                </div>
                
                <div className="w-48">
                  <input
                    type="text"
                    className="w-full px-2 py-1 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Notes (optional)"
                    value={record.notes}
                    onChange={(e) => handleAttendanceChange(member.memberId, 'notes', e.target.value)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {submitting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Record Attendance
        </button>
      </div>
    </form>
  );
}
