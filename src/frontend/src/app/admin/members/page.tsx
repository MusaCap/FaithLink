'use client';

import React from 'react';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import MemberList from '../../../components/members/MemberList';
import { Users, Plus } from 'lucide-react';

export default function AdminMembersPage() {
  return (
    <ProtectedRoute requiredRole="pastor">
      <DashboardLayout>
        <div className="p-6">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Users className="w-8 h-8 mr-3 text-blue-600" />
                Member Management
              </h1>
              <p className="text-gray-600">Manage church members, assignments, and member profiles with deacon assignment functionality</p>
            </div>
            <a
              href="/members/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Member
            </a>
          </div>

          {/* Member List Component */}
          <MemberList />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
