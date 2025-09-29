'use client';

import React, { useState } from 'react';
import { X, Save, Calendar, Clock, User, Users, AlertTriangle } from 'lucide-react';

interface CounselingSchedulerProps {
  onClose: () => void;
  onSubmit: (sessionData: CounselingSessionData) => void;
  initialData?: Partial<CounselingSessionData>;
}

interface CounselingSessionData {
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  counselorName: string;
  sessionType: 'individual' | 'couple' | 'family' | 'group';
  sessionDate: string;
  sessionTime: string;
  duration: number;
  location: string;
  sessionTopic: string;
  notes?: string;
  isRecurring: boolean;
  recurringFrequency?: 'weekly' | 'biweekly' | 'monthly';
  recurringCount?: number;
  reminderEnabled: boolean;
  reminderTime: number; // hours before session
}

const CounselingScheduler: React.FC<CounselingSchedulerProps> = ({
  onClose,
  onSubmit,
  initialData = {}
}) => {
  const [formData, setFormData] = useState<CounselingSessionData>({
    memberName: initialData.memberName || '',
    memberEmail: initialData.memberEmail || '',
    memberPhone: initialData.memberPhone || '',
    counselorName: initialData.counselorName || 'Pastor Smith',
    sessionType: initialData.sessionType || 'individual',
    sessionDate: initialData.sessionDate || '',
    sessionTime: initialData.sessionTime || '',
    duration: initialData.duration || 60,
    location: initialData.location || 'Pastor\'s Office',
    sessionTopic: initialData.sessionTopic || '',
    notes: initialData.notes || '',
    isRecurring: initialData.isRecurring || false,
    recurringFrequency: initialData.recurringFrequency || 'weekly',
    recurringCount: initialData.recurringCount || 4,
    reminderEnabled: initialData.reminderEnabled || true,
    reminderTime: initialData.reminderTime || 24
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const counselors = [
    'Pastor Smith',
    'Pastor David',
    'Dr. Sarah Wilson (Licensed Therapist)',
    'Chaplain Michael Brown'
  ];

  const locations = [
    'Pastor\'s Office',
    'Counseling Room A',
    'Counseling Room B',
    'Conference Room',
    'Virtual (Zoom)',
    'Member\'s Home',
    'Other Location'
  ];

  const sessionTopics = [
    'Marriage Counseling',
    'Family Issues',
    'Grief Counseling',
    'Addiction Recovery',
    'Depression/Anxiety',
    'Spiritual Growth',
    'Career/Life Decisions',
    'Conflict Resolution',
    'Parenting Issues',
    'Financial Stress',
    'Other'
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.memberName.trim()) {
      newErrors.memberName = 'Member name is required';
    }

    if (!formData.memberEmail.trim()) {
      newErrors.memberEmail = 'Member email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.memberEmail)) {
      newErrors.memberEmail = 'Please enter a valid email address';
    }

    if (!formData.sessionDate) {
      newErrors.sessionDate = 'Session date is required';
    }

    if (!formData.sessionTime) {
      newErrors.sessionTime = 'Session time is required';
    }

    if (!formData.sessionTopic.trim()) {
      newErrors.sessionTopic = 'Session topic is required';
    }

    // Validate that date is not in the past
    if (formData.sessionDate && formData.sessionTime) {
      const sessionDateTime = new Date(`${formData.sessionDate}T${formData.sessionTime}`);
      if (sessionDateTime < new Date()) {
        newErrors.sessionDate = 'Session date and time cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CounselingSessionData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to schedule counseling session:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'individual': return <User className="w-4 h-4" />;
      case 'couple': return <Users className="w-4 h-4" />;
      case 'family': return <Users className="w-4 h-4" />;
      case 'group': return <Users className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Schedule Counseling Session
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Member Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Member Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member Name *
                </label>
                <input
                  type="text"
                  value={formData.memberName}
                  onChange={(e) => handleInputChange('memberName', e.target.value)}
                  placeholder="Enter member's full name..."
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.memberName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.memberName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {errors.memberName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.memberEmail}
                  onChange={(e) => handleInputChange('memberEmail', e.target.value)}
                  placeholder="member@email.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.memberEmail ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.memberEmail && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {errors.memberEmail}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.memberPhone}
                  onChange={(e) => handleInputChange('memberPhone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Type
                </label>
                <select
                  value={formData.sessionType}
                  onChange={(e) => handleInputChange('sessionType', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="individual">Individual Counseling</option>
                  <option value="couple">Couple/Marriage Counseling</option>
                  <option value="family">Family Counseling</option>
                  <option value="group">Group Counseling</option>
                </select>
                <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                  {getSessionTypeIcon(formData.sessionType)}
                  <span className="capitalize">{formData.sessionType} Session</span>
                </div>
              </div>
            </div>
          </div>

          {/* Session Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Session Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Counselor
                </label>
                <select
                  value={formData.counselorName}
                  onChange={(e) => handleInputChange('counselorName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {counselors.map((counselor) => (
                    <option key={counselor} value={counselor}>{counselor}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Topic *
                </label>
                <select
                  value={formData.sessionTopic}
                  onChange={(e) => handleInputChange('sessionTopic', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.sessionTopic ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select topic...</option>
                  {sessionTopics.map((topic) => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
                {errors.sessionTopic && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {errors.sessionTopic}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Date *
                </label>
                <input
                  type="date"
                  value={formData.sessionDate}
                  onChange={(e) => handleInputChange('sessionDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.sessionDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.sessionDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {errors.sessionDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Time *
                </label>
                <input
                  type="time"
                  value={formData.sessionTime}
                  onChange={(e) => handleInputChange('sessionTime', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.sessionTime ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.sessionTime && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {errors.sessionTime}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {locations.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional notes or special requirements for the session..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Recurring Sessions */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recurring Sessions</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Schedule recurring sessions
                </span>
              </label>

              {formData.isRecurring && (
                <div className="ml-7 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select
                      value={formData.recurringFrequency}
                      onChange={(e) => handleInputChange('recurringFrequency', e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Every 2 weeks</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Sessions
                    </label>
                    <select
                      value={formData.recurringCount}
                      onChange={(e) => handleInputChange('recurringCount', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[2, 3, 4, 5, 6, 7, 8, 10, 12].map((count) => (
                        <option key={count} value={count}>{count} sessions</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reminders */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reminders</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.reminderEnabled}
                  onChange={(e) => handleInputChange('reminderEnabled', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Send email reminder
                </span>
              </label>

              {formData.reminderEnabled && (
                <div className="ml-7">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Send reminder
                  </label>
                  <select
                    value={formData.reminderTime}
                    onChange={(e) => handleInputChange('reminderTime', parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={1}>1 hour before</option>
                    <option value={2}>2 hours before</option>
                    <option value={24}>1 day before</option>
                    <option value={48}>2 days before</option>
                    <option value={168}>1 week before</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>
                {isSubmitting ? 'Scheduling...' : formData.isRecurring ? 'Schedule Sessions' : 'Schedule Session'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CounselingScheduler;
