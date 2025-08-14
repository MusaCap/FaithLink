'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Member } from '../../../../types/member';
import { memberService } from '../../../../services/memberService';
import MemberForm from '../../../../components/members/MemberForm';

interface EditMemberPageProps {
  params: { id: string };
}

export default function EditMemberPage({ params }: EditMemberPageProps) {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMember();
  }, [params.id]);

  const loadMember = async () => {
    try {
      setLoading(true);
      setError(null);
      const memberData = await memberService.getMember(params.id);
      setMember(memberData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load member');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (updatedMember: Member) => {
    // Redirect to member detail page after successful save
    router.push(`/members/${updatedMember.id}`);
  };

  const handleCancel = () => {
    // Go back to member detail page
    router.push(`/members/${params.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading member...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="text-red-600 mb-4">
            <strong>Error:</strong> {error}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={loadMember}
              className="btn btn-secondary btn-sm"
            >
              Try Again
            </button>
            <Link href="/members" className="btn btn-primary btn-sm">
              Back to Members
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Member not found</h2>
          <p className="text-gray-600 mb-4">The member you're trying to edit doesn't exist.</p>
          <Link href="/members" className="btn btn-primary">
            Back to Members
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={`/members/${params.id}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to {member.firstName} {member.lastName}
        </Link>
        
        <MemberForm 
          member={member}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
