'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  X, 
  Upload, 
  User, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { Member, MemberFormData, MemberCreateRequest, MemberUpdateRequest } from '../../types/member';
import { memberService } from '../../services/memberService';
import { deaconService } from '../../services/deaconService';

interface MemberFormProps {
  member?: Member;
  onSave?: (member: Member) => void;
  onCancel?: () => void;
}

export default function MemberForm({ member, onSave, onCancel }: MemberFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<MemberFormData>({
    firstName: '',
    lastName: '',
    email: '',
    memberNumber: '', // Auto-generated if empty
    phone: '',
    dateOfBirth: undefined,
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    },
    profilePhoto: '',
    membershipStatus: 'pending',
    joinDate: new Date(),
    tags: [],
    notes: '',
    deaconId: '', // Assigned deacon for pastoral care
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    },
    spiritualJourney: {
      baptismDate: undefined,
      salvationDate: undefined,
      currentStage: '',
      notes: ''
    },
    groupMemberships: [],
    attendance: [],
    careHistory: [],
    preferences: {
      communicationMethod: 'email',
      newsletter: true,
      eventNotifications: true,
      privacyLevel: 'members'
    }
  });

  const [newTag, setNewTag] = useState('');
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>('');
  const [deacons, setDeacons] = useState<{ id: string; name: string; email: string; memberCount: number }[]>([]);
  const [loadingDeacons, setLoadingDeacons] = useState(false);

  // Initialize form with existing member data
  useEffect(() => {
    if (member) {
      setFormData({
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        email: member.email || '',
        memberNumber: member.memberNumber || '',
        phone: member.phone || '',
        dateOfBirth: member.dateOfBirth || undefined,
        address: {
          street: member.address?.street || '',
          city: member.address?.city || '',
          state: member.address?.state || '',
          zipCode: member.address?.zipCode || '',
          country: member.address?.country || 'United States'
        },
        profilePhoto: member.profilePhoto || '',
        membershipStatus: member.membershipStatus || 'pending',
        joinDate: member.joinDate || new Date(),
        tags: member.tags || [],
        notes: member.notes || '',
        deaconId: member.deaconId || '',
        emergencyContact: {
          name: member.emergencyContact?.name || '',
          relationship: member.emergencyContact?.relationship || '',
          phone: member.emergencyContact?.phone || '',
          email: member.emergencyContact?.email || ''
        },
        spiritualJourney: {
          baptismDate: member.spiritualJourney?.baptismDate || undefined,
          salvationDate: member.spiritualJourney?.salvationDate || undefined,
          currentStage: member.spiritualJourney?.currentStage || '',
          notes: member.spiritualJourney?.notes || ''
        },
        groupMemberships: member.groupMemberships || [],
        attendance: member.attendance || [],
        careHistory: member.careHistory || [],
        preferences: {
          communicationMethod: member.preferences?.communicationMethod || 'email',
          newsletter: member.preferences?.newsletter ?? true,
          eventNotifications: member.preferences?.eventNotifications ?? true,
          privacyLevel: member.preferences?.privacyLevel || 'members'
        }
      });
      setProfilePhotoPreview(member.profilePhoto || '');
    }
  }, [member]);

  // Load deacons for dropdown
  useEffect(() => {
    const loadDeacons = async () => {
      try {
        setLoadingDeacons(true);
        const deaconList = await deaconService.getDeaconsForDropdown();
        setDeacons(deaconList);
      } catch (error) {
        console.error('Error loading deacons:', error);
        // Don't show error for deacons, just continue without them
      } finally {
        setLoadingDeacons(false);
      }
    };

    loadDeacons();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      } else if (keys.length === 2) {
        const nestedObj = prev[keys[0] as keyof MemberFormData];
        return {
          ...prev,
          [keys[0]]: {
            ...(nestedObj as object),
            [keys[1]]: value
          }
        };
      }
      return prev;
    });
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = (): boolean => {
    return !!(formData.firstName && formData.lastName && formData.email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let savedMember: Member;

      if (member) {
        // Update existing member
        const updateData: MemberUpdateRequest = {
          id: member.id,
          ...formData
        };
        savedMember = await memberService.updateMember(updateData);
        setSuccessMessage('Member updated successfully!');
      } else {
        // Create new member
        const createData: MemberCreateRequest = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          address: formData.address,
          membershipStatus: formData.membershipStatus,
          tags: formData.tags,
          notes: formData.notes,
          deaconId: formData.deaconId,
          emergencyContact: formData.emergencyContact,
          preferences: formData.preferences
        };
        savedMember = await memberService.createMember(createData);
        setSuccessMessage('Member created successfully!');
      }

      // Upload profile photo if provided
      if (profilePhotoFile && savedMember.id) {
        try {
          await memberService.uploadProfilePhoto(savedMember.id, profilePhotoFile);
        } catch (photoError) {
          console.warn('Failed to upload profile photo:', photoError);
        }
      }

      if (onSave) {
        onSave(savedMember);
      } else {
        setTimeout(() => {
          router.push(`/members/${savedMember.id}`);
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save member');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/members');
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {member ? 'Edit Member' : 'Add New Member'}
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="text-red-600 mr-2" size={20} />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <span className="text-green-800">{successMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Basic Information Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Basic Information
          </h3>
          
          {/* Profile Photo */}
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              {profilePhotoPreview ? (
                <img
                  src={profilePhotoPreview}
                  alt="Profile preview"
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="h-10 w-10 text-gray-600" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Photo
              </label>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter first name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter last name"
              />
            </div>
          </div>

          {/* Member Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member Number
              </label>
              <input
                type="text"
                value={formData.memberNumber}
                onChange={(e) => handleInputChange('memberNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Auto-generated if left empty"
              />
              <p className="text-xs text-gray-500 mt-1">
                Unique identifier for financial system integration
              </p>
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {/* Date of Birth & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth ? formData.dateOfBirth.toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Membership Status
              </label>
              <select
                value={formData.membershipStatus}
                onChange={(e) => handleInputChange('membershipStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="visitor">Visitor</option>
              </select>
            </div>

            {/* Assigned Deacon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Deacon
                <span className="text-sm text-gray-500 font-normal ml-1">(Optional)</span>
              </label>
              <select
                value={formData.deaconId || ''}
                onChange={(e) => handleInputChange('deaconId', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loadingDeacons}
              >
                <option value="">No deacon assigned</option>
                {deacons.map((deacon) => (
                  <option key={deacon.id} value={deacon.id}>
                    {deacon.name} ({deacon.memberCount} members)
                  </option>
                ))}
              </select>
              {loadingDeacons && (
                <p className="text-sm text-gray-500 mt-1">Loading deacons...</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Assign a deacon for pastoral care and member support
              </p>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags && formData.tags.length > 0 ? formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X size={14} />
                  </button>
                </span>
              )) : (
                <p className="text-gray-500 text-sm">No tags added</p>
              )}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Address Information
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address
            </label>
            <input
              type="text"
              value={formData.address?.street || ''}
              onChange={(e) => handleInputChange('address.street', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter street address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.address?.city || ''}
                onChange={(e) => handleInputChange('address.city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter city"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                value={formData.address?.state || ''}
                onChange={(e) => handleInputChange('address.state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter state"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code
              </label>
              <input
                type="text"
                value={formData.address?.zipCode || ''}
                onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter ZIP code"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Emergency Contact
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name
              </label>
              <input
                type="text"
                value={formData.emergencyContact?.name || ''}
                onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter contact name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship
              </label>
              <input
                type="text"
                value={formData.emergencyContact?.relationship || ''}
                onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Spouse, Parent, Friend"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.emergencyContact?.phone || ''}
                onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter contact phone"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.emergencyContact?.email || ''}
                onChange={(e) => handleInputChange('emergencyContact.email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter contact email"
              />
            </div>
          </div>
        </div>

        {/* Spiritual Journey Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Spiritual Journey
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salvation Date
              </label>
              <input
                type="date"
                value={formData.spiritualJourney?.salvationDate ? formData.spiritualJourney.salvationDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange('spiritualJourney.salvationDate', e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Baptism Date
              </label>
              <input
                type="date"
                value={formData.spiritualJourney?.baptismDate ? formData.spiritualJourney.baptismDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange('spiritualJourney.baptismDate', e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Spiritual Stage
            </label>
            <select
              value={formData.spiritualJourney?.currentStage || ''}
              onChange={(e) => handleInputChange('spiritualJourney.currentStage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select stage</option>
              <option value="seeker">Seeker</option>
              <option value="new-believer">New Believer</option>
              <option value="growing">Growing in Faith</option>
              <option value="mature">Mature Believer</option>
              <option value="leader">Spiritual Leader</option>
            </select>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Preferences
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Communication Method
              </label>
              <select
                value={formData.preferences?.communicationMethod || 'email'}
                onChange={(e) => handleInputChange('preferences.communicationMethod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="text">Text Message</option>
                <option value="app">App Notifications</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Privacy Level
              </label>
              <select
                value={formData.preferences?.privacyLevel || 'members'}
                onChange={(e) => handleInputChange('preferences.privacyLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="public">Public</option>
                <option value="members">Members Only</option>
                <option value="leaders">Leaders Only</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.preferences?.newsletter || false}
                onChange={(e) => handleInputChange('preferences.newsletter', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Receive newsletter</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.preferences?.eventNotifications || false}
                onChange={(e) => handleInputChange('preferences.eventNotifications', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Receive event notifications</span>
            </label>
          </div>
        </div>

        {/* Notes Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any additional notes about this member..."
          />
        </div>

        {/* Form Actions */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !validateForm()}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {member ? 'Update Member' : 'Create Member'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
