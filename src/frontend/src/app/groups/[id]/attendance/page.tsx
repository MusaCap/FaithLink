'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '../../../../components/auth/ProtectedRoute';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import AttendanceHistory from '../../../../components/attendance/AttendanceHistory';

export default function GroupAttendancePage() {
  const params = useParams();
  const groupId = params.id as string;

  return (
    <ProtectedRoute requiredRole="group_leader">
      <DashboardLayout>
        <AttendanceHistory groupId={groupId} />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
