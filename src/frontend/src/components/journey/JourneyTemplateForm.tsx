'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { journeyService } from '../../services/journeyService';
import { 
  JourneyTemplate, 
  JourneyTemplateCreateRequest, 
  JourneyTemplateUpdateRequest, 
  JourneyCategory, 
  JourneyDifficulty,
  JourneyMilestone,
  MilestoneType
} from '../../types/journey';
import { 
  Save, 
  Plus, 
  Trash2, 
  GripVertical, 
  BookOpen, 
  Target, 
  Clock,
  Users,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface JourneyTemplateFormProps {
  template?: JourneyTemplate;
  onSave?: (template: JourneyTemplate) => void;
  onCancel?: () => void;
}

export default function JourneyTemplateForm({ template, onSave, onCancel }: JourneyTemplateFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || 'discipleship' as JourneyCategory,
    difficulty: template?.difficulty || 'beginner' as JourneyDifficulty,
    estimatedDuration: template?.estimatedDuration || 30,
    isPublic: template?.isPublic || false,
    tags: template?.tags || [],
    prerequisites: template?.prerequisites || [],
    targetAudience: template?.targetAudience || []
  });

  const [milestones, setMilestones] = useState<Omit<JourneyMilestone, 'id' | 'journeyTemplateId'>[]>(
    template?.milestones.map(m => ({
      title: m.title,
      description: m.description,
      order: m.order,
      type: m.type,
      content: m.content,
      requirements: m.requirements,
      estimatedDays: m.estimatedDays,
      isRequired: m.isRequired,
      resources: m.resources
    })) || [
      {
        title: '',
        description: '',
        order: 1,
        type: 'reading' as MilestoneType,
        estimatedDays: 7,
        isRequired: true,
        resources: []
      }
    ]
  );

  const [newTag, setNewTag] = useState('');
  const [expandedMilestone, setExpandedMilestone] = useState<number>(0);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayFieldChange = (field: 'tags' | 'prerequisites' | 'targetAudience', value: string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleArrayFieldChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleArrayFieldChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const addMilestone = () => {
    const newOrder = Math.max(...milestones.map(m => m.order), 0) + 1;
    setMilestones(prev => [...prev, {
      title: '',
      description: '',
      order: newOrder,
      type: 'reading',
      estimatedDays: 7,
      isRequired: true,
      resources: []
    }]);
    setExpandedMilestone(milestones.length);
  };

  const updateMilestone = (index: number, field: string, value: any) => {
    setMilestones(prev => prev.map((milestone, i) => 
      i === index ? { ...milestone, [field]: value } : milestone
    ));
  };

  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      setMilestones(prev => prev.filter((_, i) => i !== index));
      if (expandedMilestone >= milestones.length - 1) {
        setExpandedMilestone(Math.max(0, expandedMilestone - 1));
      }
    }
  };

  const moveMilestone = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newMilestones = [...milestones];
      [newMilestones[index - 1], newMilestones[index]] = [newMilestones[index], newMilestones[index - 1]];
      // Update order numbers
      newMilestones.forEach((milestone, i) => {
        milestone.order = i + 1;
      });
      setMilestones(newMilestones);
      setExpandedMilestone(index - 1);
    } else if (direction === 'down' && index < milestones.length - 1) {
      const newMilestones = [...milestones];
      [newMilestones[index], newMilestones[index + 1]] = [newMilestones[index + 1], newMilestones[index]];
      // Update order numbers
      newMilestones.forEach((milestone, i) => {
        milestone.order = i + 1;
      });
      setMilestones(newMilestones);
      setExpandedMilestone(index + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Template name is required');
      return;
    }

    if (milestones.length === 0) {
      setError('At least one milestone is required');
      return;
    }

    const incompleteMilestones = milestones.filter(m => !m.title.trim());
    if (incompleteMilestones.length > 0) {
      setError('All milestones must have a title');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const templateData = {
        ...formData,
        title: formData.name.trim(), // Backend expects 'title' not 'name'
        description: formData.description.trim() || '',
        milestones: milestones.map((milestone, index) => ({
          ...milestone,
          order: index + 1,
          title: milestone.title.trim(),
          description: milestone.description.trim()
        }))
      };

      let savedTemplate: JourneyTemplate;
      if (template) {
        savedTemplate = await journeyService.updateJourneyTemplate({
          id: template.id,
          ...templateData
        } as JourneyTemplateUpdateRequest);
      } else {
        savedTemplate = await journeyService.createJourneyTemplate(templateData as JourneyTemplateCreateRequest);
      }

      if (onSave) {
        onSave(savedTemplate);
      } else {
        router.push(`/journey-templates/${savedTemplate.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save journey template');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  const milestoneTypes = [
    { value: 'reading', label: 'Reading' },
    { value: 'reflection', label: 'Reflection' },
    { value: 'action', label: 'Action' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'service', label: 'Service' },
    { value: 'study', label: 'Study' },
    { value: 'prayer', label: 'Prayer' },
    { value: 'assessment', label: 'Assessment' },
    { value: 'event_attendance', label: 'Event Attendance' },
    { value: 'mentor_meeting', label: 'Mentor Meeting' },
    { value: 'custom', label: 'Custom' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-6 flex items-center">
          <BookOpen className="w-5 h-5 mr-2" />
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Template Name *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter template name"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the purpose and goals of this spiritual journey"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Category *
            </label>
            <select
              required
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value as JourneyCategory)}
            >
              <option value="new_believer">New Believer</option>
              <option value="baptism_preparation">Baptism Preparation</option>
              <option value="discipleship">Discipleship</option>
              <option value="leadership_development">Leadership Development</option>
              <option value="bible_study">Bible Study</option>
              <option value="prayer_life">Prayer Life</option>
              <option value="service_ministry">Service & Ministry</option>
              <option value="evangelism">Evangelism</option>
              <option value="spiritual_disciplines">Spiritual Disciplines</option>
              <option value="life_skills">Life Skills</option>
              <option value="marriage_family">Marriage & Family</option>
              <option value="youth_development">Youth Development</option>
              <option value="senior_ministry">Senior Ministry</option>
              <option value="healing_recovery">Healing & Recovery</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Difficulty Level *
            </label>
            <select
              required
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={formData.difficulty}
              onChange={(e) => handleChange('difficulty', e.target.value as JourneyDifficulty)}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Estimated Duration (days)
            </label>
            <input
              type="number"
              min="1"
              max="365"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={formData.estimatedDuration}
              onChange={(e) => handleChange('estimatedDuration', parseInt(e.target.value))}
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isPublic"
              className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              checked={formData.isPublic}
              onChange={(e) => handleChange('isPublic', e.target.checked)}
            />
            <label htmlFor="isPublic" className="text-sm font-medium text-neutral-700">
              Make this template public
            </label>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
              >
                {tag}
                <button
                  type="button"
                  className="ml-1 text-primary-600 hover:text-primary-800"
                  onClick={() => removeTag(tag)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <button
              type="button"
              onClick={addTag}
              className="px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-neutral-900 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Journey Milestones ({milestones.length})
          </h3>
          <button
            type="button"
            onClick={addMilestone}
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Milestone
          </button>
        </div>

        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={index} className="border border-neutral-200 rounded-lg">
              <div 
                className="p-4 cursor-pointer hover:bg-neutral-50"
                onClick={() => setExpandedMilestone(expandedMilestone === index ? -1 : index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <GripVertical className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm font-medium text-neutral-900">
                        {index + 1}. {milestone.title || 'Untitled Milestone'}
                      </span>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                      {milestoneTypes.find(t => t.value === milestone.type)?.label}
                    </span>
                    <div className="flex items-center text-xs text-neutral-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {milestone.estimatedDays} days
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveMilestone(index, 'up');
                      }}
                      disabled={index === 0}
                      className="p-1 text-neutral-400 hover:text-neutral-600 disabled:opacity-50"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveMilestone(index, 'down');
                      }}
                      disabled={index === milestones.length - 1}
                      className="p-1 text-neutral-400 hover:text-neutral-600 disabled:opacity-50"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMilestone(index);
                      }}
                      disabled={milestones.length === 1}
                      className="p-1 text-red-400 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {expandedMilestone === index && (
                <div className="px-4 pb-4 border-t border-neutral-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Milestone Title *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        value={milestone.title}
                        onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                        placeholder="Enter milestone title"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                        placeholder="Describe what the member should accomplish"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Milestone Type
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        value={milestone.type}
                        onChange={(e) => updateMilestone(index, 'type', e.target.value as MilestoneType)}
                      >
                        {milestoneTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Estimated Days
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        value={milestone.estimatedDays}
                        onChange={(e) => updateMilestone(index, 'estimatedDays', parseInt(e.target.value))}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                          checked={milestone.isRequired}
                          onChange={(e) => updateMilestone(index, 'isRequired', e.target.checked)}
                        />
                        <span className="text-sm font-medium text-neutral-700">
                          This milestone is required
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {template ? 'Update Template' : 'Create Template'}
        </button>
      </div>
    </form>
  );
}
