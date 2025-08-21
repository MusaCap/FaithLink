'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import GroupDetail from '../../../components/groups/GroupDetail';

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.id as string;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <GroupDetail groupId={groupId} />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
