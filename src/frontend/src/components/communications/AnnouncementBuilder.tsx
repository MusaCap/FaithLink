'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Save, 
  X,
  Calendar,
  Clock,
  Users,
  Mail,
  Smartphone,
  Globe,
  Monitor,
  AlertCircle,
  CheckCircle,
  Plus,
  Minus
} from 'lucide-react';

interface AnnouncementData {
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  targetAudience: string[];
  channels: ('email' | 'sms' | 'dashboard' | 'website')[];
  scheduleType: 'now' | 'scheduled';
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  autoExpire: boolean;
}

interface AnnouncementBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  announcement?: any;
  onSave: (announcementData: AnnouncementData) => void;
}

const priorityOptions = [
  { 
    id: 'low', 
    name: 'Low Priority', 
    description: 'General information, non-urgent updates',
    color: 'border-gray-300 bg-gray-50 text-gray-700',
    icon: <MessageSquare className="w-4 h-4" />
  },
  { 
    id: 'normal', 
    name: 'Normal Priority', 
    description: 'Regular church announcements and updates',
    color: 'border-blue-300 bg-blue-50 text-blue-700',
    icon: <CheckCircle className="w-4 h-4" />
  },
  { 
    id: 'high', 
    name: 'High Priority', 
    description: 'Important information requiring attention',
    color: 'border-orange-300 bg-orange-50 text-orange-700',
    icon: <AlertCircle className="w-4 h-4" />
  },
  { 
    id: 'urgent', 
    name: 'Urgent', 
    description: 'Critical announcements requiring immediate action',
    color: 'border-red-300 bg-red-50 text-red-700',
    icon: <AlertCircle className="w-4 h-4" />
  }
];

const audienceOptions = [
  { id: 'all-members', name: 'All Members', description: 'Every church member' },
  { id: 'visitors', name: 'Visitors', description: 'First-time and return visitors' },
  { id: 'new-members', name: 'New Members', description: 'Members who joined in the last 6 months' },
  { id: 'volunteers', name: 'Volunteers', description: 'Active ministry volunteers' },
  { id: 'leaders', name: 'Leaders', description: 'Group leaders and staff' },
  { id: 'youth', name: 'Youth', description: 'Teenagers and youth ministry' },
  { id: 'young-adults', name: 'Young Adults', description: 'Ages 18-35' },
  { id: 'families', name: 'Families', description: 'Families with children' },
  { id: 'seniors', name: 'Seniors', description: 'Senior adults 65+' }
];

const channelOptions = [
  { 
    id: 'email', 
    name: 'Email', 
    description: 'Send via email newsletter',
    icon: <Mail className="w-5 h-5" />
  },
  { 
    id: 'sms', 
    name: 'SMS', 
    description: 'Text message to mobile phones',
    icon: <Smartphone className="w-5 h-5" />
  },
  { 
    id: 'dashboard', 
    name: 'Dashboard', 
    description: 'Display in member dashboard',
    icon: <Monitor className="w-5 h-5" />
  },
  { 
    id: 'website', 
    name: 'Website', 
    description: 'Show on church website',
    icon: <Globe className="w-5 h-5" />
  }
];

export default function AnnouncementBuilder({ isOpen, onClose, announcement, onSave }: AnnouncementBuilderProps) {
  const [announcementData, setAnnouncementData] = useState<AnnouncementData>({
    title: '',
    content: '',
    priority: 'normal',
    targetAudience: [],
    channels: ['dashboard'],
    scheduleType: 'now',
    autoExpire: true
  });

  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (announcement) {
      setAnnouncementData({
        title: announcement.title || '',
        content: announcement.content || '',
        priority: announcement.priority || 'normal',
        targetAudience: announcement.targetAudience || [],
        channels: announcement.channels || ['dashboard'],
        scheduleType: announcement.startDate ? 'scheduled' : 'now',
        startDate: announcement.startDate ? announcement.startDate.split('T')[0] : '',
        startTime: announcement.startDate ? announcement.startDate.split('T')[1]?.substring(0, 5) : '',
        endDate: announcement.endDate ? announcement.endDate.split('T')[0] : '',
        endTime: announcement.endDate ? announcement.endDate.split('T')[1]?.substring(0, 5) : '',
        autoExpire: !!announcement.endDate
      });
    }
  }, [announcement]);

  const handleInputChange = (field: keyof AnnouncementData, value: any) => {
    setAnnouncementData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAudienceToggle = (audienceId: string) => {
    setAnnouncementData(prev => ({
      ...prev,
      targetAudience: prev.targetAudience.includes(audienceId)
        ? prev.targetAudience.filter(id => id !== audienceId)
        : [...prev.targetAudience, audienceId]
    }));
  };

  const handleChannelToggle = (channelId: string) => {
    setAnnouncementData(prev => ({
      ...prev,
      channels: prev.channels.includes(channelId as any)
        ? prev.channels.filter(id => id !== channelId)
        : [...prev.channels, channelId as any]
    }));
  };

  const handleSave = () => {
    const finalData = { ...announcementData };
    
    if (announcementData.scheduleType === 'scheduled') {
      if (announcementData.startDate && announcementData.startTime) {
        finalData.startDate = `${announcementData.startDate}T${announcementData.startTime}:00Z`;
      }
      if (announcementData.autoExpire && announcementData.endDate && announcementData.endTime) {
        finalData.endDate = `${announcementData.endDate}T${announcementData.endTime}:00Z`;
      }
    }
    
    onSave(finalData);
  };

  const getPriorityOption = (priority: string) => {
    return priorityOptions.find(opt => opt.id === priority) || priorityOptions[1];
  };

  const isFormValid = () => {
    return announcementData.title.trim() && 
           announcementData.content.trim() && 
           announcementData.targetAudience.length > 0 && 
           announcementData.channels.length > 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {announcement ? 'Edit Announcement' : 'Create Announcement'}
            </h2>
            <p className="text-gray-600 mt-1">Share important information with your congregation</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-4 py-2 rounded-lg border ${
                previewMode 
                  ? 'bg-gray-100 text-gray-700 border-gray-300' 
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {previewMode ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!previewMode ? (
            <div className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Announcement Title
                    </label>
                    <input
                      type="text"
                      value={announcementData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter announcement title..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      value={announcementData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      placeholder="Write your announcement content here..."
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Priority */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Priority Level</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {priorityOptions.map(option => (
                    <label
                      key={option.id}
                      className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        announcementData.priority === option.id
                          ? option.color
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        value={option.id}
                        checked={announcementData.priority === option.id}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                        className="sr-only"
                      />
                      <div className="mr-3 mt-0.5">{option.icon}</div>
                      <div>
                        <div className="font-medium">{option.name}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Target Audience</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {audienceOptions.map(audience => (
                    <label
                      key={audience.id}
                      className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        announcementData.targetAudience.includes(audience.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={announcementData.targetAudience.includes(audience.id)}
                        onChange={() => handleAudienceToggle(audience.id)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded border-2 mr-3 mt-0.5 flex items-center justify-center ${
                        announcementData.targetAudience.includes(audience.id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {announcementData.targetAudience.includes(audience.id) && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{audience.name}</div>
                        <div className="text-xs text-gray-600">{audience.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Delivery Channels */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Delivery Channels</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {channelOptions.map(channel => (
                    <label
                      key={channel.id}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        announcementData.channels.includes(channel.id as any)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={announcementData.channels.includes(channel.id as any)}
                        onChange={() => handleChannelToggle(channel.id)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                        announcementData.channels.includes(channel.id as any)
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      }`}>
                        {announcementData.channels.includes(channel.id as any) && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="mr-3">{channel.icon}</div>
                      <div>
                        <div className="font-medium">{channel.name}</div>
                        <div className="text-sm text-gray-600">{channel.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Scheduling */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Scheduling</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="now"
                        checked={announcementData.scheduleType === 'now'}
                        onChange={(e) => handleInputChange('scheduleType', e.target.value)}
                        className="mr-2"
                      />
                      <span className="font-medium">Publish immediately</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="scheduled"
                        checked={announcementData.scheduleType === 'scheduled'}
                        onChange={(e) => handleInputChange('scheduleType', e.target.value)}
                        className="mr-2"
                      />
                      <span className="font-medium">Schedule for later</span>
                    </label>
                  </div>

                  {announcementData.scheduleType === 'scheduled' && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <input
                            type="date"
                            value={announcementData.startDate}
                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                          <input
                            type="time"
                            value={announcementData.startTime}
                            onChange={(e) => handleInputChange('startTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <label className="flex items-center mb-3">
                        <input
                          type="checkbox"
                          checked={announcementData.autoExpire}
                          onChange={(e) => handleInputChange('autoExpire', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Automatically expire this announcement</span>
                      </label>

                      {announcementData.autoExpire && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                              type="date"
                              value={announcementData.endDate}
                              onChange={(e) => handleInputChange('endDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                            <input
                              type="time"
                              value={announcementData.endTime}
                              onChange={(e) => handleInputChange('endTime', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Preview Mode */
            <div>
              <h3 className="text-lg font-semibold mb-4">Announcement Preview</h3>
              <div className="border rounded-lg p-6 bg-white shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-xl font-semibold text-gray-900">{announcementData.title || 'Untitled Announcement'}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityOption(announcementData.priority).color}`}>
                        {getPriorityOption(announcementData.priority).icon}
                        <span className="ml-1">{getPriorityOption(announcementData.priority).name}</span>
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{announcementData.content || 'No content provided'}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <strong>Target Audience:</strong> {
                        announcementData.targetAudience.length > 0 
                          ? announcementData.targetAudience.map(id => 
                              audienceOptions.find(opt => opt.id === id)?.name
                            ).join(', ')
                          : 'No audience selected'
                      }
                    </div>
                    <div>
                      <strong>Channels:</strong> {
                        announcementData.channels.length > 0
                          ? announcementData.channels.map(id => 
                              channelOptions.find(opt => opt.id === id)?.name
                            ).join(', ')
                          : 'No channels selected'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {isFormValid() ? (
              <span className="text-green-600 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                Ready to publish
              </span>
            ) : (
              <span className="text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                Please complete all required fields
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              disabled={!isFormValid()}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </button>
            
            <button
              onClick={handleSave}
              disabled={!isFormValid()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>
                {announcementData.scheduleType === 'now' ? 'Publish Now' : 'Schedule Announcement'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
