'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, Shield, Users, Hash, 
  Edit2, Save, X, Plus, Trash2, Crown, Heart, Star 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface MemberProfile {
  id: string;
  memberNumber: string; // Unique Member Number
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  // Membership Information
  membershipInfo: {
    memberSince: string;
    membershipStatus: 'active' | 'inactive' | 'pending';
    membershipType: 'regular' | 'associate' | 'honorary' | 'youth';
    baptismDate?: string;
    confirmationDate?: string;
    transferDate?: string;
    previousChurch?: string;
  };
  // Assigned Deacon for Pastoral Care
  assignedDeacon?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    specialties?: string[];
  };
  // Demographics
  demographics: {
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed' | 'other';
    occupation?: string;
    employer?: string;
    education?: string;
  };
  // Emergency Contact
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  // Groups and Ministry Involvement
  groups: Array<{
    id: string;
    name: string;
    role: 'member' | 'leader' | 'coordinator';
    joinedDate: string;
    status: 'active' | 'inactive';
  }>;
  // Giving and Financial
  giving: {
    totalLifetime: number;
    averageMonthly: number;
    lastGiftDate?: string;
    pledgeAmount?: number;
    pledgeYear?: number;
    paymentMethod?: 'check' | 'cash' | 'online' | 'auto_debit';
  };
  // Attendance and Engagement
  attendance: {
    totalServices: number;
    averageMonthly: number;
    lastAttended?: string;
    preferredService?: string;
  };
  // Skills and Interests
  skillsAndInterests: {
    skills: string[];
    interests: string[];
    availability: string[];
    languages: string[];
  };
  // Pastoral Care
  pastoralCare: {
    lastVisit?: string;
    careConcerns: string[];
    prayerRequests: Array<{
      id: string;
      request: string;
      date: string;
      status: 'active' | 'answered' | 'ongoing';
      private: boolean;
    }>;
  };
}

interface EnhancedMemberProfileProps {
  memberId?: string;
  isEditable?: boolean;
  showFullDetails?: boolean;
}

export default function EnhancedMemberProfile({ 
  memberId, 
  isEditable = true, 
  showFullDetails = true 
}: EnhancedMemberProfileProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [error, setError] = useState<string | null>(null);

  // Load member profile
  useEffect(() => {
    loadMemberProfile();
  }, [memberId]);

  const loadMemberProfile = async () => {
    setLoading(true);
    try {
      const targetId = memberId || user?.id;
      if (!targetId) throw new Error('No member ID available');

      const response = await fetch(`/api/members/${targetId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to load profile');
      
      const data = await response.json();
      setProfile(data.member || data);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to load member profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/members/${profile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(profile)
      });

      if (!response.ok) throw new Error('Failed to save profile');
      
      setEditing(false);
      // Optionally refresh the profile
      await loadMemberProfile();
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to save profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (field: string, value: any) => {
    if (!profile) return;
    
    setProfile(prev => {
      if (!prev) return prev;
      
      // Handle nested field updates
      if (field.includes('.')) {
        const keys = field.split('.');
        const updated = { ...prev };
        let current: any = updated;
        
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...current[keys[i]] };
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        return updated;
      } else {
        return { ...prev, [field]: value };
      }
    });
  };

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: User },
    { id: 'membership', name: 'Membership', icon: Crown },
    { id: 'groups', name: 'Groups & Ministry', icon: Users },
    { id: 'contact', name: 'Contact & Address', icon: MapPin },
    { id: 'pastoral', name: 'Pastoral Care', icon: Heart },
    { id: 'giving', name: 'Giving', icon: Star }
  ];

  if (loading && !profile) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Profile</h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>
          <button 
            onClick={loadMemberProfile}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-medium">Profile Not Found</h3>
          <p className="text-yellow-700 text-sm mt-1">The requested member profile could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center">
                    <Hash className="w-4 h-4 mr-1" />
                    #{profile.memberNumber}
                  </span>
                  <span className="flex items-center">
                    <Shield className="w-4 h-4 mr-1" />
                    {user?.role === 'admin' ? 'Administrator' : 
                     user?.role === 'leader' ? 'Ministry Leader' : 'Member'}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Member since {new Date(profile.membershipInfo.memberSince).getFullYear()}
                  </span>
                </div>
              </div>
            </div>
            
            {isEditable && (
              <div className="flex items-center space-x-2">
                {editing ? (
                  <>
                    <button
                      onClick={() => setEditing(false)}
                      className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex space-x-8 -mb-px">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          {activeTab === 'basic' && (
            <BasicInfoTab 
              profile={profile} 
              editing={editing} 
              onUpdate={updateProfile}
            />
          )}
          
          {activeTab === 'membership' && (
            <MembershipTab 
              profile={profile} 
              editing={editing} 
              onUpdate={updateProfile}
            />
          )}
          
          {activeTab === 'groups' && (
            <GroupsMinistryTab 
              profile={profile} 
              editing={editing} 
              onUpdate={updateProfile}
            />
          )}
          
          {activeTab === 'contact' && (
            <ContactAddressTab 
              profile={profile} 
              editing={editing} 
              onUpdate={updateProfile}
            />
          )}
          
          {activeTab === 'pastoral' && (
            <PastoralCareTab 
              profile={profile} 
              editing={editing} 
              onUpdate={updateProfile}
            />
          )}
          
          {activeTab === 'giving' && (
            <GivingTab 
              profile={profile} 
              editing={editing} 
              onUpdate={updateProfile}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Tab Components (simplified for brevity - these would be separate components)
function BasicInfoTab({ profile, editing, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name
          </label>
          {editing ? (
            <input
              type="text"
              value={profile.firstName}
              onChange={(e) => onUpdate('firstName', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
            />
          ) : (
            <p className="text-gray-900">{profile.firstName}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name
          </label>
          {editing ? (
            <input
              type="text"
              value={profile.lastName}
              onChange={(e) => onUpdate('lastName', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
            />
          ) : (
            <p className="text-gray-900">{profile.lastName}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth
          </label>
          {editing ? (
            <input
              type="date"
              value={profile.demographics?.dateOfBirth || ''}
              onChange={(e) => onUpdate('demographics.dateOfBirth', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
            />
          ) : (
            <p className="text-gray-900">
              {profile.demographics?.dateOfBirth 
                ? new Date(profile.demographics.dateOfBirth).toLocaleDateString()
                : 'Not provided'
              }
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          {editing ? (
            <select
              value={profile.demographics?.gender || ''}
              onChange={(e) => onUpdate('demographics.gender', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          ) : (
            <p className="text-gray-900 capitalize">
              {profile.demographics?.gender?.replace('_', ' ') || 'Not provided'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function MembershipTab({ profile, editing, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Membership Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Member Number
          </label>
          <p className="text-gray-900 font-mono">#{profile.memberNumber}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Membership Status
          </label>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            profile.membershipInfo?.membershipStatus === 'active' 
              ? 'bg-green-100 text-green-800'
              : profile.membershipInfo?.membershipStatus === 'inactive'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {profile.membershipInfo?.membershipStatus || 'Unknown'}
          </span>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Member Since
          </label>
          <p className="text-gray-900">
            {profile.membershipInfo?.memberSince 
              ? new Date(profile.membershipInfo.memberSince).toLocaleDateString()
              : 'Not available'
            }
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Membership Type
          </label>
          <p className="text-gray-900 capitalize">
            {profile.membershipInfo?.membershipType || 'Regular'}
          </p>
        </div>

        {/* Assigned Deacon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Heart className="w-4 h-4 inline mr-1" />
            Assigned Deacon
          </label>
          {profile.assignedDeacon ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-blue-900">
                    {profile.assignedDeacon.firstName} {profile.assignedDeacon.lastName}
                  </p>
                  <div className="text-sm text-blue-700 space-y-1 mt-1">
                    <div className="flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      <a href={`mailto:${profile.assignedDeacon.email}`} className="hover:underline">
                        {profile.assignedDeacon.email}
                      </a>
                    </div>
                    {profile.assignedDeacon.phone && (
                      <div className="flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        <a href={`tel:${profile.assignedDeacon.phone}`} className="hover:underline">
                          {profile.assignedDeacon.phone}
                        </a>
                      </div>
                    )}
                    {profile.assignedDeacon.specialties && profile.assignedDeacon.specialties.length > 0 && (
                      <div className="flex items-start mt-2">
                        <Star className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                        <span className="text-xs">
                          Specialties: {profile.assignedDeacon.specialties.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">No deacon assigned</p>
          )}
        </div>
      </div>
    </div>
  );
}

function GroupsMinistryTab({ profile, editing, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Groups & Ministry Involvement</h3>
      
      {profile.groups && profile.groups.length > 0 ? (
        <div className="space-y-4">
          {profile.groups.map((group: any, index: number) => (
            <div key={group.id || index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{group.name}</h4>
                  <p className="text-sm text-gray-600 capitalize">
                    {group.role} • Joined {new Date(group.joinedDate).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  group.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {group.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Not currently involved in any groups</p>
        </div>
      )}
    </div>
  );
}

function ContactAddressTab({ profile, editing, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Contact & Address</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-gray-400 mr-2" />
            <p className="text-gray-900">{profile.email}</p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="flex items-center">
            <Phone className="w-5 h-5 text-gray-400 mr-2" />
            {editing ? (
              <input
                type="tel"
                value={profile.phone || ''}
                onChange={(e) => onUpdate('phone', e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
              />
            ) : (
              <p className="text-gray-900">{profile.phone || 'Not provided'}</p>
            )}
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address
        </label>
        <div className="space-y-3">
          {editing ? (
            <>
              <input
                type="text"
                placeholder="Street Address"
                value={profile.address?.street || ''}
                onChange={(e) => onUpdate('address.street', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="City"
                  value={profile.address?.city || ''}
                  onChange={(e) => onUpdate('address.city', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={profile.address?.state || ''}
                  onChange={(e) => onUpdate('address.state', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <input
                  type="text"
                  placeholder="ZIP Code"
                  value={profile.address?.zipCode || ''}
                  onChange={(e) => onUpdate('address.zipCode', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={profile.address?.country || 'USA'}
                  onChange={(e) => onUpdate('address.country', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </>
          ) : (
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                {profile.address?.street && (
                  <p className="text-gray-900">{profile.address.street}</p>
                )}
                {(profile.address?.city || profile.address?.state || profile.address?.zipCode) && (
                  <p className="text-gray-900">
                    {[profile.address?.city, profile.address?.state, profile.address?.zipCode]
                      .filter(Boolean)
                      .join(', ')
                    }
                  </p>
                )}
                {profile.address?.country && profile.address.country !== 'USA' && (
                  <p className="text-gray-900">{profile.address.country}</p>
                )}
                {!profile.address?.street && (
                  <p className="text-gray-500 italic">No address provided</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PastoralCareTab({ profile, editing, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Pastoral Care</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Pastoral Visit
          </label>
          <p className="text-gray-900">
            {profile.pastoralCare?.lastVisit 
              ? new Date(profile.pastoralCare.lastVisit).toLocaleDateString()
              : 'No visits recorded'
            }
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Care Concerns
          </label>
          {profile.pastoralCare?.careConcerns?.length > 0 ? (
            <ul className="space-y-1">
              {profile.pastoralCare.careConcerns.map((concern: string, index: number) => (
                <li key={index} className="text-gray-900">• {concern}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No care concerns noted</p>
          )}
        </div>
      </div>
    </div>
  );
}

function GivingTab({ profile, editing, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Giving & Stewardship</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Lifetime Giving
          </label>
          <p className="text-2xl font-bold text-primary-600">
            ${profile.giving?.totalLifetime?.toLocaleString() || '0'}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Average Monthly
          </label>
          <p className="text-xl font-semibold text-gray-900">
            ${profile.giving?.averageMonthly?.toLocaleString() || '0'}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Gift Date
          </label>
          <p className="text-gray-900">
            {profile.giving?.lastGiftDate 
              ? new Date(profile.giving.lastGiftDate).toLocaleDateString()
              : 'No gifts recorded'
            }
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Pledge ({new Date().getFullYear()})
          </label>
          <p className="text-gray-900">
            {profile.giving?.pledgeAmount 
              ? `$${profile.giving.pledgeAmount.toLocaleString()}`
              : 'No pledge on file'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
