'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '../../../../../components/auth/ProtectedRoute';
import DashboardLayout from '../../../../../components/layout/DashboardLayout';
import AttendanceForm from '../../../../../components/attendance/AttendanceForm';

export default function NewAttendancePage() {
  const params = useParams();
  const groupId = params.id as string;

  // Validate groupId before rendering
  if (!groupId || groupId === 'undefined') {
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
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Invalid Group
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>No valid group ID was provided. Please navigate to a group first.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

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
