'use client';

import React from 'react';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import GroupForm from '../../../components/groups/GroupForm';

export default function NewGroupPage() {
  return (
    <ProtectedRoute requiredRole="group_leader">
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-900">Create New Group</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Set up a new group with members, schedule, and activities
            </p>
          </div>
          <GroupForm />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
