'use client';

import React, { useState } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import DashboardLayout from '../../components/layout/DashboardLayout';
import MemberSelfServicePortal from '../../components/members/MemberSelfServicePortal';
import VolunteerSignupSystem from '../../components/members/VolunteerSignupSystem';
import { User, Heart } from 'lucide-react';

export default function MembersPage() {
  const [activeTab, setActiveTab] = useState('self-service');

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Members</h1>
            <p className="text-gray-600">Manage your profile, volunteer opportunities, and spiritual growth</p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('self-service')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'self-service'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>My Profile & Activity</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('volunteer')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'volunteer'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4" />
                  <span>Volunteer Opportunities</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'self-service' && <MemberSelfServicePortal />}
            {activeTab === 'volunteer' && <VolunteerSignupSystem />}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
