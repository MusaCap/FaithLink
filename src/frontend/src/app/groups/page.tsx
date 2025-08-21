'use client';

import React from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GroupList from '../../components/groups/GroupList';

export default function GroupsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <GroupList />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
