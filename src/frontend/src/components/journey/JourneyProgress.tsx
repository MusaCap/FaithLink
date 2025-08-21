'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { journeyService } from '../../services/journeyService';
import { MemberJourney, MilestoneProgress, MilestoneStatus } from '../../types/journey';
import { 
  ArrowLeft,
  CheckCircle,
  Clock,
  Play,
  Pause,
  User,
  Calendar,
  BookOpen,
  Target,
  MessageSquare,
  FileText,
  Download,
  Edit,
  Send,
  AlertCircle,
  Award
} from 'lucide-react';

interface JourneyProgressProps {
  journeyId: string;
}

export default function JourneyProgress({ journeyId }: JourneyProgressProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [journey, setJourney] = useState<MemberJourney | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingMilestone, setSubmittingMilestone] = useState<string | null>(null);
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState('');

  useEffect(() => {
    loadJourney();
  }, [journeyId]);

  const loadJourney = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const journeyData = await journeyService.getMemberJourney(journeyId);
      setJourney(journeyData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load journey');
    } finally {
      setLoading(false);
    }
  };

  const handleStartMilestone = async (milestoneId: string) => {
    try {
      setSubmittingMilestone(milestoneId);
      await journeyService.startMilestone(journeyId, milestoneId);
      await loadJourney();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start milestone');
    } finally {
      setSubmittingMilestone(null);
    }
  };

  const handleCompleteMilestone = async (milestoneId: string, notes?: string) => {
    try {
      setSubmittingMilestone(milestoneId);
      await journeyService.completeMilestone(journeyId, milestoneId, notes);
      await loadJourney();
      setExpandedMilestone(null);
      setSubmissionText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete milestone');
    } finally {
      setSubmittingMilestone(null);
    }
  };

  const handleSubmitMilestone = async (milestoneProgressId: string) => {
    if (!submissionText.trim()) {
      setError('Please provide your submission content');
      return;
    }

    try {
      setSubmittingMilestone(milestoneProgressId);
      await journeyService.submitMilestone({
        milestoneProgressId,
        type: 'text',
        content: submissionText.trim()
      });
      await loadJourney();
      setExpandedMilestone(null);
      setSubmissionText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit milestone');
    } finally {
      setSubmittingMilestone(null);
    }
  };

  const exportProgress = async () => {
    try {
      const blob = await journeyService.exportMemberJourneyProgress(journeyId, 'pdf');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `journey-progress-${journeyId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export progress');
    }
  };

  const getStatusColor = (status: MilestoneStatus): string => {
    switch (status) {
      case 'not_started': return 'bg-neutral-100 text-neutral-800 border-neutral-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'submitted': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'needs_revision': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'skipped': return 'bg-neutral-100 text-neutral-600 border-neutral-200';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const getStatusIcon = (status: MilestoneStatus) => {
    switch (status) {
      case 'not_started': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <Play className="w-4 h-4" />;
      case 'submitted': return <Send className="w-4 h-4" />;
      case 'needs_revision': return <Edit className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <Award className="w-4 h-4" />;
      case 'skipped': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const canManageJourney = user?.role === 'admin' || user?.role === 'pastor' || 
    (journey && journey.mentorId === user?.id);
  
  const isOwnJourney = journey && journey.memberId === user?.id;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !journey) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-sm text-red-700">{error || 'Journey not found'}</div>
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
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <Link
                href="/journeys"
                className="inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Journeys
              </Link>
            </div>
            
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              {journey.journeyTemplateName}
            </h1>
            
            <div className="flex items-center space-x-6 text-sm text-neutral-600 mb-4">
              {!isOwnJourney && (
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {journey.memberName}
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Started {formatDate(journey.startedAt)}
              </div>
              <div className="flex items-center">
                <Target className="w-4 h-4 mr-1" />
                {journey.progress.completedMilestones}/{journey.progress.totalMilestones} milestones
              </div>
              {journey.mentorName && (
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  Mentor: {journey.mentorName}
                </div>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-neutral-200 rounded-full h-3 mb-4">
              <div 
                className="bg-primary-600 h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                style={{ width: `${journey.progress.percentageComplete}%` }}
              >
                {journey.progress.percentageComplete > 10 && (
                  <span className="text-xs font-medium text-white">
                    {journey.progress.percentageComplete}%
                  </span>
                )}
              </div>
            </div>
            
            {journey.notes && (
              <div className="bg-neutral-50 rounded-md p-3">
                <p className="text-sm text-neutral-700">{journey.notes}</p>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={exportProgress}
              className="inline-flex items-center px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Journey Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Progress</p>
              <p className="text-2xl font-bold text-primary-600">{journey.progress.percentageComplete}%</p>
            </div>
            <Target className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{journey.progress.completedMilestones}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Days Active</p>
              <p className="text-2xl font-bold text-blue-600">{journey.progress.daysSinceStart}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Remaining</p>
              <p className="text-2xl font-bold text-orange-600">
                {journey.progress.totalMilestones - journey.progress.completedMilestones}
              </p>
            </div>
            <BookOpen className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-lg font-medium text-neutral-900">Journey Milestones</h3>
        </div>
        
        <div className="divide-y divide-neutral-200">
          {journey.progress.milestonesProgress.map((milestoneProgress, index) => {
            const isExpanded = expandedMilestone === milestoneProgress.milestoneId;
            const canStart = milestoneProgress.status === 'not_started';
            const canSubmit = milestoneProgress.status === 'in_progress';
            const canComplete = milestoneProgress.status === 'in_progress' || milestoneProgress.status === 'approved';
            
            return (
              <div key={milestoneProgress.milestoneId} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <h4 className="text-lg font-medium text-neutral-900">
                        Milestone {index + 1}
                      </h4>
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(milestoneProgress.status)}`}>
                        {getStatusIcon(milestoneProgress.status)}
                        <span className="capitalize">{milestoneProgress.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-neutral-600 mb-3">
                      {milestoneProgress.startedAt && (
                        <div>Started: {formatDate(milestoneProgress.startedAt)}</div>
                      )}
                      {milestoneProgress.completedAt && (
                        <div>Completed: {formatDate(milestoneProgress.completedAt)}</div>
                      )}
                      {milestoneProgress.timeSpent && (
                        <div>{milestoneProgress.timeSpent} minutes spent</div>
                      )}
                    </div>
                    
                    {milestoneProgress.notes && (
                      <div className="bg-neutral-50 rounded-md p-3 mb-3">
                        <p className="text-sm text-neutral-700">{milestoneProgress.notes}</p>
                      </div>
                    )}
                    
                    {/* Submissions */}
                    {milestoneProgress.submissions.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {milestoneProgress.submissions.map((submission) => (
                          <div key={submission.id} className="bg-blue-50 rounded-md p-3">
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-xs text-blue-600 font-medium">
                                Submitted {formatDate(submission.submittedAt)}
                              </span>
                            </div>
                            <p className="text-sm text-neutral-700">{submission.content}</p>
                            {submission.feedback && (
                              <div className="mt-2 pt-2 border-t border-blue-200">
                                <p className="text-xs text-blue-600 font-medium mb-1">
                                  Feedback from {submission.feedbackByName}:
                                </p>
                                <p className="text-sm text-blue-700">{submission.feedback}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {isOwnJourney && canStart && (
                      <button
                        onClick={() => handleStartMilestone(milestoneProgress.milestoneId)}
                        disabled={submittingMilestone === milestoneProgress.milestoneId}
                        className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </button>
                    )}
                    
                    {isOwnJourney && canSubmit && (
                      <button
                        onClick={() => setExpandedMilestone(isExpanded ? null : milestoneProgress.milestoneId)}
                        className="inline-flex items-center px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Submit
                      </button>
                    )}
                    
                    {isOwnJourney && canComplete && (
                      <button
                        onClick={() => handleCompleteMilestone(milestoneProgress.milestoneId)}
                        disabled={submittingMilestone === milestoneProgress.milestoneId}
                        className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Submission Form */}
                {isExpanded && isOwnJourney && canSubmit && (
                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Your Submission
                        </label>
                        <textarea
                          rows={4}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          value={submissionText}
                          onChange={(e) => setSubmissionText(e.target.value)}
                          placeholder="Share your thoughts, reflections, or completed work for this milestone..."
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => {
                            setExpandedMilestone(null);
                            setSubmissionText('');
                          }}
                          className="px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSubmitMilestone(milestoneProgress.milestoneId)}
                          disabled={submittingMilestone === milestoneProgress.milestoneId || !submissionText.trim()}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                        >
                          {submittingMilestone === milestoneProgress.milestoneId ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <Send className="w-4 h-4 mr-2" />
                          )}
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
