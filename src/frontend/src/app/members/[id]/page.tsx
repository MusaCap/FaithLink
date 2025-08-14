'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  User, 
  Tag, 
  Heart,
  ArrowLeft,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { Member } from '../../../types/member';
import { memberService } from '../../../services/memberService';

interface MemberDetailPageProps {
  params: { id: string };
}

export default function MemberDetailPage({ params }: MemberDetailPageProps) {
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

  const handleDelete = async () => {
    if (!member) return;
    
    if (!confirm(`Are you sure you want to delete ${member.firstName} ${member.lastName}?`)) {
      return;
    }

    try {
      await memberService.deleteMember(member.id);
      router.push('/members');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete member');
    }
  };

  const getStatusColor = (status: Member['membershipStatus']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'visitor': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date | undefined) => {
    return date ? new Date(date).toLocaleDateString() : 'Not specified';
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
          <p className="text-gray-600 mb-4">The member you're looking for doesn't exist.</p>
          <Link href="/members" className="btn btn-primary">
            Back to Members
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/members"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Members
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {member.profilePhoto ? (
                <img
                  src={member.profilePhoto}
                  alt={`${member.firstName} ${member.lastName}`}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-600" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {member.firstName} {member.lastName}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(member.membershipStatus)}`}>
                    {member.membershipStatus}
                  </span>
                  <span className="text-gray-500 text-sm">
                    Member since {formatDate(member.joinDate)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link
                href={`/members/${member.id}/edit`}
                className="btn btn-secondary btn-sm"
              >
                <Edit size={16} className="mr-2" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="btn btn-secondary btn-sm text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              
              <div className="space-y-4">
                {member.email && (
                  <div className="flex items-center">
                    <Mail size={16} className="text-gray-400 mr-3" />
                    <div>
                      <span className="text-gray-600">Email</span>
                      <p className="text-gray-900">{member.email}</p>
                    </div>
                  </div>
                )}

                {member.phone && (
                  <div className="flex items-center">
                    <Phone size={16} className="text-gray-400 mr-3" />
                    <div>
                      <span className="text-gray-600">Phone</span>
                      <p className="text-gray-900">{member.phone}</p>
                    </div>
                  </div>
                )}

                {member.dateOfBirth && (
                  <div className="flex items-center">
                    <Calendar size={16} className="text-gray-400 mr-3" />
                    <div>
                      <span className="text-gray-600">Date of Birth</span>
                      <p className="text-gray-900">{formatDate(member.dateOfBirth)}</p>
                    </div>
                  </div>
                )}

                {(member.address?.street || member.address?.city) && (
                  <div className="flex items-start">
                    <MapPin size={16} className="text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <span className="text-gray-600">Address</span>
                      <div className="text-gray-900">
                        {member.address?.street && <p>{member.address.street}</p>}
                        {(member.address?.city || member.address?.state || member.address?.zipCode) && (
                          <p>
                            {member.address?.city}
                            {member.address?.city && member.address?.state && ', '}
                            {member.address?.state} {member.address?.zipCode}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            {member.emergencyContact?.name && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h2>
                
                <div className="space-y-2">
                  <p className="text-gray-900 font-medium">{member.emergencyContact.name}</p>
                  {member.emergencyContact.relationship && (
                    <p className="text-gray-600">{member.emergencyContact.relationship}</p>
                  )}
                  {member.emergencyContact.phone && (
                    <p className="text-gray-900">{member.emergencyContact.phone}</p>
                  )}
                  {member.emergencyContact.email && (
                    <p className="text-gray-900">{member.emergencyContact.email}</p>
                  )}
                </div>
              </div>
            )}

            {/* Spiritual Journey */}
            {(member.spiritualJourney?.currentStage || member.spiritualJourney?.salvationDate || member.spiritualJourney?.baptismDate) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Heart size={20} className="mr-2 text-red-500" />
                  Spiritual Journey
                </h2>
                
                <div className="space-y-3">
                  {member.spiritualJourney?.currentStage && (
                    <div>
                      <span className="text-gray-600">Current Stage</span>
                      <p className="text-gray-900 capitalize">{member.spiritualJourney.currentStage.replace('-', ' ')}</p>
                    </div>
                  )}
                  
                  {member.spiritualJourney?.salvationDate && (
                    <div>
                      <span className="text-gray-600">Salvation Date</span>
                      <p className="text-gray-900">{formatDate(member.spiritualJourney.salvationDate)}</p>
                    </div>
                  )}
                  
                  {member.spiritualJourney?.baptismDate && (
                    <div>
                      <span className="text-gray-600">Baptism Date</span>
                      <p className="text-gray-900">{formatDate(member.spiritualJourney.baptismDate)}</p>
                    </div>
                  )}

                  {member.spiritualJourney?.notes && (
                    <div>
                      <span className="text-gray-600">Notes</span>
                      <p className="text-gray-900">{member.spiritualJourney.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {member.notes && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{member.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            {member.tags && member.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Tag size={18} className="mr-2" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {member.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Preferences */}
            {member.preferences && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Communication</span>
                    <p className="text-gray-900 capitalize">
                      {member.preferences.communicationMethod?.replace('-', ' ')}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Privacy Level</span>
                    <p className="text-gray-900 capitalize">
                      {member.preferences.privacyLevel}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Newsletter</span>
                    <p className="text-gray-900">
                      {member.preferences.newsletter ? 'Subscribed' : 'Not subscribed'}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Event Notifications</span>
                    <p className="text-gray-900">
                      {member.preferences.eventNotifications ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Member Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Info</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Member ID</span>
                  <p className="text-gray-900 font-mono">{member.id}</p>
                </div>
                
                <div>
                  <span className="text-gray-600">Created</span>
                  <p className="text-gray-900">{formatDate(member.createdAt)}</p>
                </div>
                
                <div>
                  <span className="text-gray-600">Last Updated</span>
                  <p className="text-gray-900">{formatDate(member.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
