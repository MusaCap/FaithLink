'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '../../../../components/auth/ProtectedRoute';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import GroupEditForm from '../../../../components/groups/GroupEditForm';

export default function EditGroupPage() {
  const params = useParams();
  const groupId = params.id as string;

  return (
    <ProtectedRoute requiredRole="group_leader">
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-900">Edit Group</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Update group information, schedule, and settings
            </p>
          </div>
          <GroupEditForm groupId={groupId} />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
