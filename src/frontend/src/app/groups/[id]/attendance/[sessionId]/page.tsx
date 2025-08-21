'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '../../../../../components/auth/ProtectedRoute';
import DashboardLayout from '../../../../../components/layout/DashboardLayout';
import AttendanceSessionDetail from '../../../../../components/attendance/AttendanceSessionDetail';

export default function AttendanceSessionPage() {
  const params = useParams();
  const groupId = params.id as string;
  const sessionId = params.sessionId as string;

  return (
    <ProtectedRoute requiredRole="group_leader">
      <DashboardLayout>
        <AttendanceSessionDetail groupId={groupId} sessionId={sessionId} />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
