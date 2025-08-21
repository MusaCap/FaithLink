'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '../../../../../components/auth/ProtectedRoute';
import DashboardLayout from '../../../../../components/layout/DashboardLayout';
import AttendanceForm from '../../../../../components/attendance/AttendanceForm';

export default function NewAttendancePage() {
  const params = useParams();
  const groupId = params.id as string;

  return (
    <ProtectedRoute requiredRole="group_leader">
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-900">Record Attendance</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Mark attendance for group members and track participation
            </p>
          </div>
          <AttendanceForm groupId={groupId} />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
