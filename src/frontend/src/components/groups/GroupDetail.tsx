'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { groupService } from '../../services/groupService';
import { memberService } from '../../services/memberService';
import { Group, GroupMember } from '../../types/group';
import { Member } from '../../types/member';
import { 
  Users, 
  MapPin, 
  Clock, 
  Calendar, 
  Edit, 
  UserPlus, 
  UserMinus,
  MessageSquare,
  BarChart3,
  Settings,
  Trash2,
  Crown,
  Shield
} from 'lucide-react';

interface GroupDetailProps {
  groupId: string;
}

export default function GroupDetail({ groupId }: GroupDetailProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');

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
      
      setGroup(groupData);
      setGroupMembers(membersData);
      
      // Load available members for adding
      const allMembersResponse = await memberService.getMembers({ limit: 1000 });
      const currentMemberIds = membersData.map(m => m.memberId);
      const available = allMembersResponse.members.filter(
        member => !currentMemberIds.includes(member.id)
      );
      setAvailableMembers(available);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedMemberId) return;
    
    try {
      await groupService.addGroupMember(groupId, selectedMemberId);
      setSelectedMemberId('');
      setShowAddMember(false);
      await loadGroupData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from the group?')) return;
    
    try {
      await groupService.removeGroupMember(groupId, memberId);
      await loadGroupData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: 'member' | 'co_leader') => {
    try {
      await groupService.updateGroupMember(groupId, memberId, { role: newRole });
      await loadGroupData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member role');
    }
  };

  const canManageGroup = user?.role === 'admin' || user?.role === 'pastor' || 
    (group && (group.leaderId === user?.id || group.coLeaderIds?.includes(user?.id || '')));

  const formatMeetingSchedule = (schedule?: any): string => {
    if (!schedule || !schedule.frequency) return 'No schedule set';
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = schedule.dayOfWeek !== undefined ? days[schedule.dayOfWeek] : '';
    const time = schedule.time || '';
    const duration = schedule.duration ? `(${schedule.duration} min)` : '';
    
    return `${schedule.frequency} on ${dayName} at ${time} ${duration}`.trim();
  };

  const getGroupTypeLabel = (type: string): string => {
    const typeLabels: Record<string, string> = {
      small_group: 'Small Group',
      ministry: 'Ministry',
      youth: 'Youth',
      seniors: 'Seniors',
      womens: "Women's",
      mens: "Men's",
      children: "Children's",
      worship: 'Worship',
      service: 'Service',
      bible_study: 'Bible Study',
      prayer: 'Prayer',
      outreach: 'Outreach',
      other: 'Other'
    };
    return typeLabels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-sm text-red-700">{error || 'Group not found'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-neutral-900">{group.name}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                group.type === 'small_group' ? 'bg-blue-100 text-blue-800' :
                group.type === 'ministry' ? 'bg-green-100 text-green-800' :
                group.type === 'youth' ? 'bg-purple-100 text-purple-800' :
                'bg-neutral-100 text-neutral-800'
              }`}>
                {getGroupTypeLabel(group.type)}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                group.status === 'active' ? 'bg-green-100 text-green-800' :
                group.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                'bg-neutral-100 text-neutral-800'
              }`}>
                {group.status}
              </span>
            </div>
            {group.description && (
              <p className="text-neutral-600 mb-4">{group.description}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center text-neutral-600">
                <Users className="w-4 h-4 mr-2" />
                {group.memberIds.length} members
                {group.maxMembers && ` / ${group.maxMembers} max`}
              </div>
              <div className="flex items-center text-neutral-600">
                <Crown className="w-4 h-4 mr-2" />
                Leader: {group.leaderName}
              </div>
              {group.meetingSchedule && (
                <div className="flex items-center text-neutral-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {formatMeetingSchedule(group.meetingSchedule)}
                </div>
              )}
              {group.location && (
                <div className="flex items-center text-neutral-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {group.location}
                </div>
              )}
            </div>
          </div>
          
          {canManageGroup && (
            <div className="flex space-x-2">
              <Link
                href={`/groups/${group.id}/edit`}
                className="inline-flex items-center px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Link>
              <Link
                href={`/groups/${group.id}/attendance`}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Attendance
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {group.tags && group.tags.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-medium text-neutral-900 mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {group.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {canManageGroup && (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href={`/groups/${group.id}/attendance/new`}
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <Calendar className="w-8 h-8 text-primary-600 mb-2" />
              <span className="text-sm font-medium text-neutral-900">Record Attendance</span>
            </Link>
            <Link
              href={`/communications/group/${group.id}`}
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <MessageSquare className="w-8 h-8 text-primary-600 mb-2" />
              <span className="text-sm font-medium text-neutral-900">Message Group</span>
            </Link>
            <Link
              href={`/groups/${group.id}/reports`}
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <BarChart3 className="w-8 h-8 text-primary-600 mb-2" />
              <span className="text-sm font-medium text-neutral-900">View Reports</span>
            </Link>
            <Link
              href={`/groups/${group.id}/settings`}
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <Settings className="w-8 h-8 text-primary-600 mb-2" />
              <span className="text-sm font-medium text-neutral-900">Group Settings</span>
            </Link>
          </div>
        </div>
      )}

      {/* Members */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-neutral-900">Members ({groupMembers.length})</h3>
            {canManageGroup && (
              <button
                onClick={() => setShowAddMember(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </button>
            )}
          </div>
        </div>

        {/* Add Member Modal */}
        {showAddMember && (
          <div className="p-6 border-b border-neutral-200 bg-neutral-50">
            <div className="flex items-center space-x-3">
              <select
                className="flex-1 px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
              >
                <option value="">Select a member to add</option>
                {availableMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.firstName} {member.lastName}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddMember}
                disabled={!selectedMemberId}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddMember(false);
                  setSelectedMemberId('');
                }}
                className="px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="p-6">
          {groupMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-neutral-900 mb-2">No members yet</h4>
              <p className="text-neutral-600 mb-4">Add members to get started with your group</p>
              {canManageGroup && (
                <button
                  onClick={() => setShowAddMember(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add First Member
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-neutral-900">{member.memberName}</p>
                        {member.role === 'leader' && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                        {member.role === 'co_leader' && (
                          <Shield className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 capitalize">{member.role.replace('_', ' ')}</p>
                    </div>
                  </div>
                  
                  {canManageGroup && member.role !== 'leader' && (
                    <div className="flex space-x-1">
                      {member.role === 'member' && (
                        <button
                          onClick={() => handleUpdateMemberRole(member.memberId, 'co_leader')}
                          className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Promote to Co-Leader"
                        >
                          <Shield className="w-3 h-3" />
                        </button>
                      )}
                      {member.role === 'co_leader' && (
                        <button
                          onClick={() => handleUpdateMemberRole(member.memberId, 'member')}
                          className="text-xs px-2 py-1 text-neutral-600 hover:bg-neutral-50 rounded"
                          title="Demote to Member"
                        >
                          <Users className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveMember(member.memberId)}
                        className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                        title="Remove from Group"
                      >
                        <UserMinus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
