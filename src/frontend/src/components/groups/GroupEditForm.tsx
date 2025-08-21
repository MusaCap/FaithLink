'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { groupService } from '../../services/groupService';
import { Group } from '../../types/group';
import GroupForm from './GroupForm';

interface GroupEditFormProps {
  groupId: string;
}

export default function GroupEditForm({ groupId }: GroupEditFormProps) {
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  const loadGroup = async () => {
    try {
      setLoading(true);
      setError(null);
      const groupData = await groupService.getGroup(groupId);
      setGroup(groupData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (updatedGroup: Group) => {
    router.push(`/groups/${updatedGroup.id}`);
  };

  const handleCancel = () => {
    router.push(`/groups/${groupId}`);
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
    <GroupForm 
      group={group} 
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
