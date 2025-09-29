'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { JourneyTemplate } from '@/types/journey';
import { journeyService } from '@/services/journeyService';
import { ArrowLeft, Edit, Users, Calendar, CheckCircle, Clock, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function JourneyTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [template, setTemplate] = useState<JourneyTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const templateId = params.id as string;

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        const data = await journeyService.getJourneyTemplate(templateId);
        setTemplate(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load journey template');
      } finally {
        setLoading(false);
      }
    };

    if (templateId) {
      fetchTemplate();
    }
  }, [templateId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Journey template not found'}</p>
          <button 
            onClick={() => router.push('/journey-templates')} 
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => router.push('/journey-templates')} 
          className="inline-flex items-center px-4 py-2 mb-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Templates
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{template.name}</h1>
            <p className="text-gray-600 text-lg mb-4">{template.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                template.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {template.isPublic ? 'Public' : 'Private'}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Users className="mr-1 h-3 w-3" />
                {template.difficulty || 'Any Level'}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                <Calendar className="mr-1 h-3 w-3" />
                {template.estimatedDuration ? `${template.estimatedDuration} weeks` : 'Self-paced'}
              </span>
            </div>
          </div>
          
          {(user?.role === 'admin' || user?.role === 'pastor') && (
            <button 
              onClick={() => router.push(`/journey-templates/${templateId}/edit`)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Template
            </button>
          )}
        </div>
      </div>

      {/* Template Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{template.milestones?.length || 0}</p>
              <p className="text-gray-600">Milestones</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-gray-600">Enrolled Members</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">0%</p>
              <p className="text-gray-600">Completion Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Journey Milestones</h2>
        </div>
        <div className="p-6">
          {template.milestones && template.milestones.length > 0 ? (
            <div className="space-y-4">
              {template.milestones.map((milestone, index) => (
                <div 
                  key={milestone.id || index} 
                  className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-sm font-medium text-blue-600">{milestone.order || index + 1}</span>
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium text-gray-900 mb-1">{milestone.title}</h4>
                    <p className="text-gray-600 text-sm mb-2">{milestone.description}</p>
                    {milestone.isRequired && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Required
                      </span>
                    )}
                  </div>
                  {milestone.estimatedDays && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="mr-1 h-3 w-3" />
                      {milestone.estimatedDays} days
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Milestones</h3>
              <p className="text-gray-600">This template doesn't have any milestones yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <button 
          onClick={() => router.push(`/journeys/assign?template=${templateId}`)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Assign to Members
        </button>
        <button 
          onClick={() => router.push('/journeys')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          View Member Journeys
        </button>
      </div>
    </div>
  );
}
