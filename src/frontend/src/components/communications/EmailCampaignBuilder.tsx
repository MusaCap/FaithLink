'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Save, 
  Eye, 
  Users, 
  Calendar, 
  Clock,
  Plus,
  X,
  Image,
  Link,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  List,
  CheckCircle
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  thumbnail: string;
}

interface EmailCampaignData {
  title: string;
  subject: string;
  content: string;
  templateId?: string;
  targetGroups: string[];
  scheduleType: 'now' | 'scheduled';
  scheduledDate?: string;
  scheduledTime?: string;
}

interface EmailCampaignBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  campaign?: any;
  onSave: (campaignData: EmailCampaignData) => void;
}

const emailTemplates: EmailTemplate[] = [
  {
    id: 'newsletter',
    name: 'Weekly Newsletter',
    subject: 'This Week at {{church_name}}',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
          <h1>{{church_name}}</h1>
          <p>Weekly Newsletter</p>
        </div>
        <div style="padding: 20px;">
          <h2>This Week's Highlights</h2>
          <p>Dear {{member_name}},</p>
          <p>We hope this message finds you blessed and in good health...</p>
          
          <h3>Upcoming Events</h3>
          <ul>
            <li>Sunday Service - 10:00 AM</li>
            <li>Prayer Meeting - Wednesday 7:00 PM</li>
          </ul>
          
          <h3>Prayer Requests</h3>
          <p>Please keep our members in prayer...</p>
        </div>
      </div>
    `,
    thumbnail: '/templates/newsletter-thumb.jpg'
  },
  {
    id: 'event-announcement',
    name: 'Event Announcement',
    subject: 'Special Event: {{event_name}}',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #059669; color: white; padding: 20px; text-align: center;">
          <h1>You're Invited!</h1>
        </div>
        <div style="padding: 20px;">
          <h2>{{event_name}}</h2>
          <p><strong>Date:</strong> {{event_date}}</p>
          <p><strong>Time:</strong> {{event_time}}</p>
          <p><strong>Location:</strong> {{event_location}}</p>
          
          <p>Join us for this special event...</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{rsvp_link}}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
              RSVP Now
            </a>
          </div>
        </div>
      </div>
    `,
    thumbnail: '/templates/event-thumb.jpg'
  },
  {
    id: 'welcome',
    name: 'Welcome New Members',
    subject: 'Welcome to {{church_name}} Family!',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #7c3aed; color: white; padding: 20px; text-align: center;">
          <h1>Welcome to Our Church Family!</h1>
        </div>
        <div style="padding: 20px;">
          <p>Dear {{member_name}},</p>
          
          <p>We are thrilled to welcome you to {{church_name}}! Your decision to join our church family brings us great joy.</p>
          
          <h3>Next Steps:</h3>
          <ul>
            <li>Attend our New Member Orientation</li>
            <li>Join a Small Group</li>
            <li>Discover Your Spiritual Gifts</li>
            <li>Find Ways to Serve</li>
          </ul>
          
          <p>We're here to support you on your spiritual journey!</p>
        </div>
      </div>
    `,
    thumbnail: '/templates/welcome-thumb.jpg'
  }
];

const targetGroupOptions = [
  { id: 'all-members', name: 'All Members' },
  { id: 'visitors', name: 'Visitors' },
  { id: 'new-members', name: 'New Members' },
  { id: 'small-group-leaders', name: 'Small Group Leaders' },
  { id: 'volunteers', name: 'Volunteers' },
  { id: 'youth', name: 'Youth (13-18)' },
  { id: 'young-adults', name: 'Young Adults (19-35)' },
  { id: 'families', name: 'Families with Children' },
  { id: 'seniors', name: 'Seniors (65+)' }
];

export default function EmailCampaignBuilder({ isOpen, onClose, campaign, onSave }: EmailCampaignBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignData, setCampaignData] = useState<EmailCampaignData>({
    title: '',
    subject: '',
    content: '',
    targetGroups: [],
    scheduleType: 'now'
  });
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (campaign) {
      setCampaignData({
        title: campaign.title || '',
        subject: campaign.subject || '',
        content: campaign.content || '',
        targetGroups: campaign.targetGroups || [],
        scheduleType: campaign.scheduledFor ? 'scheduled' : 'now',
        scheduledDate: campaign.scheduledFor ? campaign.scheduledFor.split('T')[0] : '',
        scheduledTime: campaign.scheduledFor ? campaign.scheduledFor.split('T')[1]?.substring(0, 5) : ''
      });
    }
  }, [campaign]);

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setCampaignData(prev => ({
      ...prev,
      subject: template.subject,
      content: template.content,
      templateId: template.id
    }));
    setCurrentStep(2);
  };

  const handleInputChange = (field: keyof EmailCampaignData, value: any) => {
    setCampaignData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTargetGroupToggle = (groupId: string) => {
    setCampaignData(prev => ({
      ...prev,
      targetGroups: prev.targetGroups.includes(groupId)
        ? prev.targetGroups.filter(id => id !== groupId)
        : [...prev.targetGroups, groupId]
    }));
  };

  const handleSave = (isDraft = true) => {
    const finalData = { ...campaignData };
    if (campaignData.scheduleType === 'scheduled' && campaignData.scheduledDate && campaignData.scheduledTime) {
      finalData.scheduledDate = `${campaignData.scheduledDate}T${campaignData.scheduledTime}:00Z`;
    }
    onSave(finalData);
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'current';
    return 'upcoming';
  };

  const canProceedToStep = (step: number) => {
    switch (step) {
      case 2:
        return selectedTemplate !== null;
      case 3:
        return campaignData.title && campaignData.subject && campaignData.content;
      case 4:
        return campaignData.targetGroups.length > 0;
      default:
        return true;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {campaign ? 'Edit Email Campaign' : 'Create Email Campaign'}
            </h2>
            <p className="text-gray-600 mt-1">Design and send targeted email campaigns to your congregation</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="border-b px-6 py-4">
          <div className="flex items-center space-x-8">
            {[
              { step: 1, title: 'Template' },
              { step: 2, title: 'Content' },
              { step: 3, title: 'Audience' },
              { step: 4, title: 'Schedule' }
            ].map(({ step, title }) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  getStepStatus(step) === 'completed' 
                    ? 'bg-green-600 text-white' 
                    : getStepStatus(step) === 'current'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {getStepStatus(step) === 'completed' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step
                  )}
                </div>
                <span className={`ml-2 text-sm ${
                  getStepStatus(step) === 'current' ? 'text-blue-600 font-medium' : 'text-gray-600'
                }`}>
                  {title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Choose a Template</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div 
                  onClick={() => {
                    setSelectedTemplate(null);
                    setCampaignData(prev => ({ ...prev, subject: '', content: '' }));
                    setCurrentStep(2);
                  }}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 cursor-pointer transition-colors"
                >
                  <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="font-medium text-gray-900">Start from Scratch</h4>
                  <p className="text-sm text-gray-600 mt-2">Create a custom email from a blank template</p>
                </div>

                {emailTemplates.map(template => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="aspect-video bg-gray-200 rounded mb-3 flex items-center justify-center">
                      <Mail className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Campaign Content</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Title</label>
                    <input
                      type="text"
                      value={campaignData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Internal campaign name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Subject</label>
                    <input
                      type="text"
                      value={campaignData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="What will recipients see in their inbox?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Content</label>
                    <div className="border border-gray-300 rounded-lg">
                      <div className="border-b border-gray-200 p-3 flex items-center space-x-2">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Bold className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Italic className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <AlignLeft className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <AlignCenter className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <List className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Link className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Image className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        value={campaignData.content}
                        onChange={(e) => handleInputChange('content', e.target.value)}
                        placeholder="Write your email content here..."
                        rows={12}
                        className="w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-b-lg resize-none"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Use variables like {'{member_name}'}, {'{church_name}'}, {'{event_date}'} for personalization
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Audience</h3>
              <p className="text-gray-600 mb-6">Choose who will receive this email campaign</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {targetGroupOptions.map(group => (
                  <label
                    key={group.id}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      campaignData.targetGroups.includes(group.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={campaignData.targetGroups.includes(group.id)}
                      onChange={() => handleTargetGroupToggle(group.id)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                      campaignData.targetGroups.includes(group.id)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {campaignData.targetGroups.includes(group.id) && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{group.name}</div>
                    </div>
                  </label>
                ))}
              </div>

              {campaignData.targetGroups.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Estimated Recipients</h4>
                  <p className="text-blue-800">Approximately 250-300 members will receive this campaign</p>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Schedule Campaign</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">When should this campaign be sent?</label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="now"
                        checked={campaignData.scheduleType === 'now'}
                        onChange={(e) => handleInputChange('scheduleType', e.target.value)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">Send immediately</div>
                        <div className="text-sm text-gray-600">Campaign will be sent as soon as you click send</div>
                      </div>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="scheduled"
                        checked={campaignData.scheduleType === 'scheduled'}
                        onChange={(e) => handleInputChange('scheduleType', e.target.value)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">Schedule for later</div>
                        <div className="text-sm text-gray-600">Choose a specific date and time</div>
                      </div>
                    </label>
                  </div>
                </div>

                {campaignData.scheduleType === 'scheduled' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input
                        type="date"
                        value={campaignData.scheduledDate}
                        onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                      <input
                        type="time"
                        value={campaignData.scheduledTime}
                        onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">Campaign Summary</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li><strong>Title:</strong> {campaignData.title}</li>
                    <li><strong>Subject:</strong> {campaignData.subject}</li>
                    <li><strong>Recipients:</strong> {campaignData.targetGroups.length} group(s) selected</li>
                    <li><strong>Delivery:</strong> {campaignData.scheduleType === 'now' ? 'Immediate' : 'Scheduled'}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Previous
              </button>
            )}
            
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleSave(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceedToStep(currentStep + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => handleSave(false)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{campaignData.scheduleType === 'now' ? 'Send Now' : 'Schedule Campaign'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">Email Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <div className="border rounded p-4 bg-gray-50">
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Subject:</strong> {campaignData.subject}
                  </div>
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: campaignData.content }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
