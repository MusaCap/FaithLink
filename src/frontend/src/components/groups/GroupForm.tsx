'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { groupService } from '../../services/groupService';
import { memberService } from '../../services/memberService';
import { GroupCreateRequest, GroupUpdateRequest, GroupType, Group } from '../../types/group';
import { Member } from '../../types/member';
import { 
  Users, 
  Clock, 
  MapPin, 
  Tag, 
  Calendar,
  Save,
  X
} from 'lucide-react';

interface GroupFormProps {
  group?: Group;
  onSave?: (group: Group) => void;
  onCancel?: () => void;
}

export default function GroupForm({ group, onSave, onCancel }: GroupFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [groupTypes, setGroupTypes] = useState<{ value: string; label: string; description: string }[]>([]);

  const [formData, setFormData] = useState({
    name: group?.name || '',
    description: group?.description || '',
    type: group?.type || 'small_group' as GroupType,
    leaderId: group?.leaderId || user?.id || '',
    coLeaderIds: group?.coLeaderIds || [],
    maxMembers: group?.maxMembers || undefined,
    location: group?.location || '',
    tags: group?.tags || [],
    meetingSchedule: {
      frequency: group?.meetingSchedule?.frequency || 'weekly' as const,
      dayOfWeek: group?.meetingSchedule?.dayOfWeek || 0,
      time: group?.meetingSchedule?.time || '',
      duration: group?.meetingSchedule?.duration || 60,
    }
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [membersResponse, typesResponse] = await Promise.all([
        memberService.getMembers({ limit: 1000 }),
        groupService.getGroupTypes()
      ]);
      
      setMembers(membersResponse.members);
      setGroupTypes(typesResponse);
    } catch (err) {
      setError('Failed to load form data');
    }
  };

  const handleChange = (field: string, value: any) => {
    if (field.startsWith('meetingSchedule.')) {
      const scheduleField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        meetingSchedule: {
          ...prev.meetingSchedule,
          [scheduleField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Group name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const groupData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        leaderId: formData.leaderId,
        coLeaderIds: formData.coLeaderIds.length > 0 ? formData.coLeaderIds : undefined,
        maxMembers: formData.maxMembers || undefined,
        location: formData.location.trim() || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        meetingSchedule: {
          frequency: formData.meetingSchedule.frequency,
          dayOfWeek: formData.meetingSchedule.dayOfWeek,
          time: formData.meetingSchedule.time || undefined,
          duration: formData.meetingSchedule.duration
        }
      };

      let savedGroup: Group;
      if (group) {
        // Update existing group
        savedGroup = await groupService.updateGroup({
          id: group.id,
          ...groupData
        } as GroupUpdateRequest);
      } else {
        // Create new group
        savedGroup = await groupService.createGroup(groupData as GroupCreateRequest);
      }

      if (onSave) {
        onSave(savedGroup);
      } else {
        router.push(`/groups/${savedGroup.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save group');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  const dayOptions = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-neutral-200">
      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-neutral-900 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Group Name *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter group name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Group Type *
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value as GroupType)}
              >
                {groupTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the group's purpose and activities"
            />
          </div>
        </div>

        {/* Leadership */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-neutral-900 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Leadership
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Group Leader *
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.leaderId}
                onChange={(e) => handleChange('leaderId', e.target.value)}
              >
                <option value="">Select a leader</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.firstName} {member.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Co-Leaders (Optional)
              </label>
              <select
                multiple
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.coLeaderIds}
                onChange={(e) => handleChange('coLeaderIds', Array.from(e.target.selectedOptions, option => option.value))}
              >
                {members.filter(member => member.id !== formData.leaderId).map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.firstName} {member.lastName}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-neutral-500">Hold Ctrl/Cmd to select multiple</p>
            </div>
          </div>
        </div>

        {/* Meeting Schedule */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-neutral-900 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Meeting Schedule
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Frequency
              </label>
              <select
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.meetingSchedule.frequency}
                onChange={(e) => handleChange('meetingSchedule.frequency', e.target.value)}
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="irregular">Irregular</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Day of Week
              </label>
              <select
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.meetingSchedule.dayOfWeek}
                onChange={(e) => handleChange('meetingSchedule.dayOfWeek', parseInt(e.target.value))}
              >
                {dayOptions.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Time
              </label>
              <input
                type="time"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.meetingSchedule.time}
                onChange={(e) => handleChange('meetingSchedule.time', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="15"
                max="480"
                step="15"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.meetingSchedule.duration}
                onChange={(e) => handleChange('meetingSchedule.duration', parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-neutral-900 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Additional Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Meeting Location
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g., Room 201, Online, Community Center"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Maximum Members
              </label>
              <input
                type="number"
                min="1"
                max="500"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.maxMembers || ''}
                onChange={(e) => handleChange('maxMembers', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Leave empty for no limit"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {tag}
                  <button
                    type="button"
                    className="ml-1 text-primary-600 hover:text-primary-800"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50"
              >
                <Tag className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex justify-end space-x-3">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {group ? 'Update Group' : 'Create Group'}
        </button>
      </div>
    </form>
  );
}
