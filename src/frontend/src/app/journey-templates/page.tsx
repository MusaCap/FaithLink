'use client';

import React from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import DashboardLayout from '../../components/layout/DashboardLayout';
import JourneyTemplateList from '../../components/journey/JourneyTemplateList';

export default function JourneyTemplatesPage() {
  return (
    <ProtectedRoute requiredRole="group_leader">
      <DashboardLayout>
        <JourneyTemplateList />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
