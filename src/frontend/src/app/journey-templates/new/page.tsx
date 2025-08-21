'use client';

import React from 'react';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import JourneyTemplateForm from '../../../components/journey/JourneyTemplateForm';

export default function NewJourneyTemplatePage() {
  return (
    <ProtectedRoute requiredRole="pastor">
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-900">Create Journey Template</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Design a spiritual growth pathway with milestones and resources
            </p>
          </div>
          <JourneyTemplateForm />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
