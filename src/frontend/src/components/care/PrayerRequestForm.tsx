'use client';

import React, { useState } from 'react';
import { X, Save, AlertTriangle, Heart, Lock } from 'lucide-react';

interface PrayerRequestFormProps {
  onClose: () => void;
  onSubmit: (requestData: PrayerRequestData) => void;
  initialData?: Partial<PrayerRequestData>;
}

interface PrayerRequestData {
  title: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'health' | 'family' | 'work' | 'spiritual' | 'financial' | 'other';
  isPrivate: boolean;
  requestedBy: string;
  assignTo?: string;
}

const PrayerRequestForm: React.FC<PrayerRequestFormProps> = ({
  onClose,
  onSubmit,
  initialData = {}
}) => {
  const [formData, setFormData] = useState<PrayerRequestData>({
    title: initialData.title || '',
    description: initialData.description || '',
    priority: initialData.priority || 'normal',
    category: initialData.category || 'spiritual',
    isPrivate: initialData.isPrivate || false,
    requestedBy: initialData.requestedBy || '',
    assignTo: initialData.assignTo || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.requestedBy.trim()) {
      newErrors.requestedBy = 'Requester name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof PrayerRequestData, value: string | boolean) => {
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
      console.error('Failed to submit prayer request:', error);
      // Handle error (could show toast notification)
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 border-red-300 bg-red-50';
      case 'high': return 'text-orange-600 border-orange-300 bg-orange-50';
      case 'normal': return 'text-blue-600 border-blue-300 bg-blue-50';
      case 'low': return 'text-gray-600 border-gray-300 bg-gray-50';
      default: return 'text-gray-600 border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Heart className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              {initialData.title ? 'Edit Prayer Request' : 'New Prayer Request'}
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
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Brief title for the prayer request..."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Provide details about the prayer request..."
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Row 1: Priority and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low Priority</option>
                <option value="normal">Normal Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
              <div className={`mt-2 px-2 py-1 text-xs font-medium border rounded ${getPriorityColor(formData.priority)}`}>
                {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)} Priority
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="spiritual">Spiritual</option>
                <option value="health">Health</option>
                <option value="family">Family</option>
                <option value="work">Work/Career</option>
                <option value="financial">Financial</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Row 2: Requested By and Assign To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requested By *
              </label>
              <input
                type="text"
                value={formData.requestedBy}
                onChange={(e) => handleInputChange('requestedBy', e.target.value)}
                placeholder="Name of person making request..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.requestedBy ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.requestedBy && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {errors.requestedBy}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign To (Optional)
              </label>
              <input
                type="text"
                value={formData.assignTo}
                onChange={(e) => handleInputChange('assignTo', e.target.value)}
                placeholder="Pastor or care team member..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Privacy Toggle */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.isPrivate}
                onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Keep this request private
                </span>
              </div>
            </label>
            <p className="ml-7 mt-1 text-xs text-gray-500">
              Private requests are only visible to pastoral staff and assigned care team members
            </p>
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
              <span>{isSubmitting ? 'Saving...' : 'Save Prayer Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrayerRequestForm;
