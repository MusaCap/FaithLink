'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { journeyService } from '../../services/journeyService';
import { JourneyTemplate, JourneyTemplateFilters, JourneyCategory, JourneyDifficulty } from '../../types/journey';
import { 
  Plus, 
  Search, 
  Filter, 
  Copy, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  Clock,
  BookOpen,
  Star,
  MoreVertical,
  Download
} from 'lucide-react';

export default function JourneyTemplateList() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<JourneyTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTemplates, setTotalTemplates] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());

  const [filters, setFilters] = useState<JourneyTemplateFilters>({
    limit: 12,
    offset: 0,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    isPublic: undefined
  });

  const [searchQuery, setSearchQuery] = useState('');
  const templatesPerPage = 12;

  useEffect(() => {
    loadTemplates();
  }, [currentPage]);

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      offset: (currentPage - 1) * templatesPerPage,
      search: searchQuery || undefined
    }));
  }, [currentPage, searchQuery]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await journeyService.getJourneyTemplates({
        ...filters,
        offset: (currentPage - 1) * templatesPerPage
      });
      
      setTemplates(response.templates);
      setTotalTemplates(response.total);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load journey templates');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value
    }));
    setCurrentPage(1);
  };

  const applyFilters = () => {
    loadTemplates();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadTemplates();
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(templateId)) {
        newSet.delete(templateId);
      } else {
        newSet.add(templateId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedTemplates.size === templates.length) {
      setSelectedTemplates(new Set());
    } else {
      setSelectedTemplates(new Set(templates.map(t => t.id)));
    }
  };

  const handleDuplicateTemplate = async (template: JourneyTemplate) => {
    try {
      const newName = `${template.name} (Copy)`;
      await journeyService.duplicateJourneyTemplate(template.id, newName);
      loadTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate template');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this journey template? This action cannot be undone.')) {
      return;
    }
    
    try {
      await journeyService.deleteJourneyTemplate(templateId);
      loadTemplates();
      setSelectedTemplates(prev => {
        const newSet = new Set(prev);
        newSet.delete(templateId);
        return newSet;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    }
  };

  const exportTemplate = async (templateId: string, format: 'json' | 'pdf' = 'json') => {
    try {
      const blob = await journeyService.exportJourneyTemplate(templateId, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `journey-template-${templateId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export template');
    }
  };

  const getCategoryLabel = (category: JourneyCategory): string => {
    const categoryLabels: Record<JourneyCategory, string> = {
      new_believer: 'New Believer',
      baptism_preparation: 'Baptism Prep',
      discipleship: 'Discipleship',
      leadership_development: 'Leadership',
      bible_study: 'Bible Study',
      prayer_life: 'Prayer Life',
      service_ministry: 'Service & Ministry',
      evangelism: 'Evangelism',
      spiritual_disciplines: 'Spiritual Disciplines',
      life_skills: 'Life Skills',
      marriage_family: 'Marriage & Family',
      youth_development: 'Youth',
      senior_ministry: 'Seniors',
      healing_recovery: 'Healing & Recovery',
      custom: 'Custom'
    };
    return categoryLabels[category] || category;
  };

  const getDifficultyColor = (difficulty: JourneyDifficulty): string => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const canManageTemplates = user?.role === 'admin' || user?.role === 'pastor';
  const totalPages = Math.ceil(totalTemplates / templatesPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Journey Templates</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Manage spiritual growth pathways and development templates
          </p>
        </div>
        
        {canManageTemplates && (
          <div className="flex space-x-3">
            {selectedTemplates.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-neutral-600">{selectedTemplates.size} selected</span>
                <button
                  onClick={() => setSelectedTemplates(new Set())}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear
                </button>
              </div>
            )}
            <Link
              href="/journey-templates/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Link>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <form onSubmit={handleSearch} className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 ml-3"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-neutral-200">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
              <select
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="new_believer">New Believer</option>
                <option value="baptism_preparation">Baptism Preparation</option>
                <option value="discipleship">Discipleship</option>
                <option value="leadership_development">Leadership Development</option>
                <option value="bible_study">Bible Study</option>
                <option value="prayer_life">Prayer Life</option>
                <option value="service_ministry">Service & Ministry</option>
                <option value="evangelism">Evangelism</option>
                <option value="spiritual_disciplines">Spiritual Disciplines</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Difficulty</label>
              <select
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={filters.difficulty || ''}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Visibility</label>
              <select
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={filters.isPublic === undefined ? '' : filters.isPublic.toString()}
                onChange={(e) => handleFilterChange('isPublic', e.target.value === '' ? undefined : e.target.value === 'true')}
              >
                <option value="">All Templates</option>
                <option value="true">Public</option>
                <option value="false">Private</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Sort By</label>
              <select
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={`${filters.sortBy}_${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('_');
                  handleFilterChange('sortBy', sortBy);
                  handleFilterChange('sortOrder', sortOrder);
                }}
              >
                <option value="createdAt_desc">Newest First</option>
                <option value="createdAt_asc">Oldest First</option>
                <option value="name_asc">Name A-Z</option>
                <option value="name_desc">Name Z-A</option>
                <option value="difficulty_asc">Easiest First</option>
                <option value="difficulty_desc">Hardest First</option>
              </select>
            </div>
            
            <div className="md:col-span-4 flex justify-end">
              <button
                onClick={applyFilters}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Templates Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        {templates.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-neutral-900 mb-2">No journey templates found</h4>
            <p className="text-neutral-600 mb-4">Create your first template to help members grow spiritually</p>
            {canManageTemplates && (
              <Link
                href="/journey-templates/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Template
              </Link>
            )}
          </div>
        ) : (
          <>
            {canManageTemplates && (
              <div className="p-4 border-b border-neutral-200">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedTemplates.size === templates.length && templates.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-neutral-700">Select all templates</span>
                </label>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {templates.map((template) => (
                <div key={template.id} className="bg-neutral-50 rounded-lg border border-neutral-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {canManageTemplates && (
                      <div className="flex items-center justify-between mb-3">
                        <input
                          type="checkbox"
                          checked={selectedTemplates.has(template.id)}
                          onChange={() => handleSelectTemplate(template.id)}
                          className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="relative">
                          <button className="p-1 text-neutral-400 hover:text-neutral-600">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-neutral-900 line-clamp-2">{template.name}</h3>
                      {template.isPublic && <Star className="w-5 h-5 text-yellow-500" />}
                    </div>
                    
                    <p className="text-sm text-neutral-600 mb-4 line-clamp-3">{template.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                        {template.difficulty}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getCategoryLabel(template.category)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-neutral-500 mb-4">
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {template.milestones.length} milestones
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {Math.ceil(template.estimatedDuration / 7)} weeks
                      </div>
                    </div>
                    
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {template.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-neutral-200 text-neutral-700"
                          >
                            {tag}
                          </span>
                        ))}
                        {template.tags.length > 3 && (
                          <span className="text-xs text-neutral-500">+{template.tags.length - 3} more</span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Link
                          href={`/journey-templates/${template.id}`}
                          className="inline-flex items-center px-3 py-1 rounded text-sm font-medium text-primary-700 bg-primary-100 hover:bg-primary-200"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                        {canManageTemplates && (
                          <>
                            <Link
                              href={`/journey-templates/${template.id}/edit`}
                              className="inline-flex items-center px-3 py-1 rounded text-sm font-medium text-neutral-700 bg-neutral-200 hover:bg-neutral-300"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDuplicateTemplate(template)}
                              className="inline-flex items-center px-3 py-1 rounded text-sm font-medium text-neutral-700 bg-neutral-200 hover:bg-neutral-300"
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Copy
                            </button>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => exportTemplate(template.id, 'json')}
                          className="p-1 text-neutral-400 hover:text-neutral-600"
                          title="Export Template"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {canManageTemplates && template.createdBy === user?.id && (
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="p-1 text-red-400 hover:text-red-600"
                            title="Delete Template"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
            <div className="text-sm text-neutral-700">
              Showing {((currentPage - 1) * templatesPerPage) + 1} to {Math.min(currentPage * templatesPerPage, totalTemplates)} of {totalTemplates} templates
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
