'use client';

import React from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import DashboardLayout from '../../components/layout/DashboardLayout';
import MemberJourneyList from '../../components/journey/MemberJourneyList';

export default function JourneysPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <MemberJourneyList />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
