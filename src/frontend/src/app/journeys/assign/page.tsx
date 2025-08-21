'use client';

import React from 'react';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import JourneyAssignForm from '../../../components/journey/JourneyAssignForm';

export default function AssignJourneyPage() {
  return (
    <ProtectedRoute requiredRole="group_leader">
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-900">Assign Journey</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Assign spiritual growth journeys to members and track their progress
            </p>
          </div>
          <JourneyAssignForm />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
