'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { journeyService } from '../../services/journeyService';
import { memberService } from '../../services/memberService';
import { JourneyTemplate, MemberJourneyCreateRequest } from '../../types/journey';
import { Member } from '../../types/member';
import { 
  Users, 
  BookOpen, 
  UserPlus, 
  Search, 
  CheckSquare, 
  Square,
  Save,
  X
} from 'lucide-react';

export default function JourneyAssignForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [templates, setTemplates] = useState<JourneyTemplate[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [mentors, setMentors] = useState<Member[]>([]);
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [selectedMentor, setSelectedMentor] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [startImmediately, setStartImmediately] = useState(true);
  
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [showMemberSearch, setShowMemberSearch] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [templatesResponse, membersResponse] = await Promise.all([
        journeyService.getJourneyTemplates({ 
          isPublic: true, 
          limit: 100,
          sortBy: 'name',
          sortOrder: 'asc'
        }),
        memberService.getMembers({ 
          limit: 1000,
          sortBy: 'firstName',
          sortOrder: 'asc'
        })
      ]);
      
      setTemplates(templatesResponse.templates);
      setMembers(membersResponse.members);
      
      // Filter potential mentors (group leaders, pastors, admins)
      const potentialMentors = membersResponse.members.filter(
        member => ['admin', 'pastor', 'group_leader'].includes(member.role || '')
      );
      setMentors(potentialMentors);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) {
        newSet.delete(memberId);
      } else {
        newSet.add(memberId);
      }
      return newSet;
    });
  };

  const handleSelectAllMembers = () => {
    const filteredMembers = getFilteredMembers();
    const allSelected = filteredMembers.every(member => selectedMembers.has(member.id));
    
    if (allSelected) {
      // Deselect all filtered members
      setSelectedMembers(prev => {
        const newSet = new Set(prev);
        filteredMembers.forEach(member => newSet.delete(member.id));
        return newSet;
      });
    } else {
      // Select all filtered members
      setSelectedMembers(prev => {
        const newSet = new Set(prev);
        filteredMembers.forEach(member => newSet.add(member.id));
        return newSet;
      });
    }
  };

  const getFilteredMembers = (): Member[] => {
    if (!memberSearchQuery.trim()) return members;
    
    return members.filter(member => {
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
      const email = member.email.toLowerCase();
      const query = memberSearchQuery.toLowerCase();
      
      return fullName.includes(query) || email.includes(query);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTemplate) {
      setError('Please select a journey template');
      return;
    }
    
    if (selectedMembers.size === 0) {
      setError('Please select at least one member');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const memberIds = Array.from(selectedMembers);
      
      if (memberIds.length === 1) {
        // Single assignment
        const journeyData: MemberJourneyCreateRequest = {
          memberId: memberIds[0],
          journeyTemplateId: selectedTemplate,
          mentorId: selectedMentor || undefined,
          notes: notes.trim() || undefined,
          startImmediately
        };
        
        await journeyService.assignJourneyToMember(journeyData);
      } else {
        // Bulk assignment
        await journeyService.bulkAssignJourney(
          memberIds,
          selectedTemplate,
          selectedMentor || undefined
        );
      }
      
      router.push('/journeys');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign journey');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const selectedTemplate_data = templates.find(t => t.id === selectedTemplate);
  const filteredMembers = getFilteredMembers();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Journey Template Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-4 flex items-center">
          <BookOpen className="w-5 h-5 mr-2" />
          Select Journey Template
        </h3>
        
        <div className="space-y-3">
          {templates.map((template) => (
            <label
              key={template.id}
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedTemplate === template.id 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <input
                type="radio"
                name="template"
                value={template.id}
                checked={selectedTemplate === template.id}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="mt-1 text-primary-600 focus:ring-primary-500"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-neutral-900">{template.name}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      template.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      template.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {template.difficulty}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {template.milestones.length} milestones
                    </span>
                    <span className="text-xs text-neutral-500">
                      {Math.ceil(template.estimatedDuration / 7)} weeks
                    </span>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 mb-2">{template.description}</p>
                {template.tags && template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-neutral-100 text-neutral-700"
                      >
                        {tag}
                      </span>
                    ))}
                    {template.tags.length > 3 && (
                      <span className="text-xs text-neutral-500">+{template.tags.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
        
        {templates.length === 0 && (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600">No journey templates available</p>
          </div>
        )}
      </div>

      {/* Member Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-neutral-900 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Select Members ({selectedMembers.size} selected)
          </h3>
          <button
            type="button"
            onClick={() => setShowMemberSearch(!showMemberSearch)}
            className="inline-flex items-center px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50"
          >
            <Search className="w-4 h-4 mr-2" />
            {showMemberSearch ? 'Hide Search' : 'Search Members'}
          </button>
        </div>
        
        {showMemberSearch && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search members by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <button
            type="button"
            onClick={handleSelectAllMembers}
            className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
          >
            {filteredMembers.every(member => selectedMembers.has(member.id)) ? (
              <>
                <CheckSquare className="w-4 h-4 mr-1" />
                Deselect All
              </>
            ) : (
              <>
                <Square className="w-4 h-4 mr-1" />
                Select All
              </>
            )}
            {memberSearchQuery && ` (${filteredMembers.length} filtered)`}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
          {filteredMembers.map((member) => (
            <label
              key={member.id}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedMembers.has(member.id)
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedMembers.has(member.id)}
                onChange={() => handleMemberToggle(member.id)}
                className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-neutral-900">
                  {member.firstName} {member.lastName}
                </div>
                <div className="text-xs text-neutral-500">{member.email}</div>
                {member.role && (
                  <div className="text-xs text-neutral-400 capitalize">
                    {member.role.replace('_', ' ')}
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
        
        {filteredMembers.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600">
              {memberSearchQuery ? 'No members found matching your search' : 'No members available'}
            </p>
          </div>
        )}
      </div>

      {/* Assignment Options */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-4 flex items-center">
          <UserPlus className="w-5 h-5 mr-2" />
          Assignment Options
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Assign Mentor (Optional)
            </label>
            <select
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={selectedMentor}
              onChange={(e) => setSelectedMentor(e.target.value)}
            >
              <option value="">No mentor assigned</option>
              {mentors.map((mentor) => (
                <option key={mentor.id} value={mentor.id}>
                  {mentor.firstName} {mentor.lastName} ({mentor.role?.replace('_', ' ')})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-neutral-500">
              Mentors can guide members through their journey and approve milestone completions
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or instructions for this assignment..."
            />
          </div>
          
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                checked={startImmediately}
                onChange={(e) => setStartImmediately(e.target.checked)}
              />
              <span className="text-sm font-medium text-neutral-700">
                Start journey immediately
              </span>
            </label>
            <p className="mt-1 ml-6 text-xs text-neutral-500">
              If unchecked, members will need to manually start their journey
            </p>
          </div>
        </div>
      </div>

      {/* Assignment Summary */}
      {selectedTemplate && selectedMembers.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Assignment Summary</h4>
          <div className="text-sm text-blue-800">
            <p>
              <strong>{selectedTemplate_data?.name}</strong> will be assigned to{' '}
              <strong>{selectedMembers.size}</strong> member{selectedMembers.size !== 1 ? 's' : ''}
            </p>
            <p>
              Estimated duration: <strong>{selectedTemplate_data ? Math.ceil(selectedTemplate_data.estimatedDuration / 7) : 0} weeks</strong>
            </p>
            {selectedMentor && (
              <p>
                Mentor: <strong>{mentors.find(m => m.id === selectedMentor)?.firstName} {mentors.find(m => m.id === selectedMentor)?.lastName}</strong>
              </p>
            )}
          </div>
        </div>
      )}

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
          disabled={submitting || !selectedTemplate || selectedMembers.size === 0}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {submitting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Assign Journey{selectedMembers.size > 1 ? 's' : ''}
        </button>
      </div>
    </form>
  );
}
