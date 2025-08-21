'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import AdminDashboard from '../../components/dashboard/AdminDashboard';
import PastorDashboard from '../../components/dashboard/PastorDashboard';
import GroupLeaderDashboard from '../../components/dashboard/GroupLeaderDashboard';
import MemberDashboard from '../../components/dashboard/MemberDashboard';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function DashboardPage() {
  const { user } = useAuth();

  const renderDashboard = () => {
    if (!user) return null;

    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'pastor':
        return <PastorDashboard />;
      case 'group_leader':
        return <GroupLeaderDashboard />;
      case 'member':
        return <MemberDashboard />;
      default:
        return <MemberDashboard />;
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {renderDashboard()}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
