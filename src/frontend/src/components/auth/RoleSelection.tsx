'use client';

import React, { useState } from 'react';
import { Shield, Users, User, Check, ArrowLeft } from 'lucide-react';
import { UserRole } from '../../utils/permissions';

interface RoleSelectionProps {
  onSelection: (role: UserRole) => void;
  onBack: () => void;
  selectedRole?: UserRole;
}

const ROLE_OPTIONS = [
  {
    value: 'admin' as UserRole,
    icon: Shield,
    title: 'Church Administrator',
    description: 'Full access to manage church operations, create templates, and oversee all activities',
    recommended: 'For pastors, church administrators, and senior staff',
    features: [
      'Full member management',
      'Create journey templates', 
      'Advanced analytics',
      'User role management',
      'Financial reports',
      'Bulk operations'
    ],
    color: 'border-purple-200 hover:border-purple-300 bg-purple-50'
  },
  {
    value: 'leader' as UserRole,
    icon: Users,
    title: 'Ministry Leader',
    description: 'Lead groups, assign journeys, and manage ministry-level activities',
    recommended: 'For group leaders, ministry coordinators, and volunteer coordinators',
    features: [
      'Assign spiritual journeys',
      'Manage assigned groups',
      'Create events',
      'Ministry reports',
      'Member care tracking',
      'Volunteer coordination'
    ],
    color: 'border-blue-200 hover:border-blue-300 bg-blue-50'
  },
  {
    value: 'member' as UserRole,
    icon: User,
    title: 'Church Member',
    description: 'Participate in groups, track spiritual growth, and engage with church activities',
    recommended: 'For regular church members and participants',
    features: [
      'View assigned journeys',
      'Track spiritual progress',
      'Join groups',
      'Register for events',
      'Update personal profile',
      'Volunteer signup'
    ],
    color: 'border-green-200 hover:border-green-300 bg-green-50'
  }
];

export default function RoleSelection({ onSelection, onBack, selectedRole }: RoleSelectionProps) {
  const [selected, setSelected] = useState<UserRole | null>(selectedRole || null);

  const handleContinue = () => {
    if (selected) {
      onSelection(selected);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Shield className="w-12 h-12 text-primary-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Choose Your Role</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select the role that best describes your responsibilities in the church. 
          You can change this later if needed.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {ROLE_OPTIONS.map((option) => {
          const IconComponent = option.icon;
          const isSelected = selected === option.value;
          
          return (
            <div
              key={option.value}
              className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'border-primary-500 bg-primary-50 shadow-lg transform scale-105' 
                  : option.color
              }`}
              onClick={() => setSelected(option.value)}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className="text-center mb-4">
                <IconComponent className={`w-12 h-12 mx-auto mb-3 ${
                  isSelected ? 'text-primary-600' : 'text-gray-500'
                }`} />
                <h3 className={`text-xl font-bold mb-2 ${
                  isSelected ? 'text-primary-900' : 'text-gray-900'
                }`}>
                  {option.title}
                </h3>
                <p className={`text-sm mb-3 ${
                  isSelected ? 'text-primary-700' : 'text-gray-600'
                }`}>
                  {option.description}
                </p>
                <p className={`text-xs font-medium ${
                  isSelected ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {option.recommended}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className={`text-sm font-semibold ${
                  isSelected ? 'text-primary-800' : 'text-gray-700'
                }`}>
                  Key Features:
                </h4>
                <ul className="space-y-1">
                  {option.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className={`text-xs flex items-center ${
                      isSelected ? 'text-primary-700' : 'text-gray-600'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                        isSelected ? 'bg-primary-500' : 'bg-gray-400'
                      }`} />
                      {feature}
                    </li>
                  ))}
                  {option.features.length > 4 && (
                    <li className={`text-xs ${
                      isSelected ? 'text-primary-600' : 'text-gray-500'
                    }`}>
                      +{option.features.length - 4} more features
                    </li>
                  )}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Profile
        </button>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {selected ? `Selected: ${ROLE_OPTIONS.find(r => r.value === selected)?.title}` : 'No role selected'}
          </div>
          <button
            onClick={handleContinue}
            disabled={!selected}
            className={`px-8 py-3 rounded-md font-medium transition-all duration-200 ${
              selected
                ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continue to Church Selection
          </button>
        </div>
      </div>

      {selected && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-900">
                Role Selection Note
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                You can change your role later from your profile settings, or an administrator 
                can update your permissions as needed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
