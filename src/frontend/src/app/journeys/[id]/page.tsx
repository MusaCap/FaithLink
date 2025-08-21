'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import JourneyProgress from '../../../components/journey/JourneyProgress';

export default function JourneyProgressPage() {
  const params = useParams();
  const journeyId = params.id as string;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <JourneyProgress journeyId={journeyId} />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
