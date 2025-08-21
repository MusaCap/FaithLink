'use client';

import React from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import DashboardLayout from '../../components/layout/DashboardLayout';
import MemberList from '../../components/members/MemberList';

export default function MembersPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <MemberList />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
