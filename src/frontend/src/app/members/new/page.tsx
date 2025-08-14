'use client';

import React from 'react';
import MemberForm from '../../../components/members/MemberForm';

export default function NewMemberPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MemberForm />
      </div>
    </div>
  );
}
