export interface JourneyTemplate {
  id: string;
  name: string;
  description: string;
  category: JourneyCategory;
  difficulty: JourneyDifficulty;
  estimatedDuration: number; // in days
  isPublic: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  milestones: JourneyMilestone[];
  tags: string[];
  prerequisites?: string[];
  targetAudience: string[];
}

export type JourneyCategory = 
  | 'new_believer'
  | 'baptism_preparation'
  | 'discipleship'
  | 'leadership_development'
  | 'bible_study'
  | 'prayer_life'
  | 'service_ministry'
  | 'evangelism'
  | 'spiritual_disciplines'
  | 'life_skills'
  | 'marriage_family'
  | 'youth_development'
  | 'senior_ministry'
  | 'healing_recovery'
  | 'custom';

export type JourneyDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface JourneyMilestone {
  id: string;
  journeyTemplateId: string;
  title: string;
  description: string;
  order: number;
  type: MilestoneType;
  content?: MilestoneContent;
  requirements?: MilestoneRequirement[];
  estimatedDays: number;
  isRequired: boolean;
  resources: MilestoneResource[];
}

export type MilestoneType = 
  | 'reading'
  | 'reflection'
  | 'action'
  | 'meeting'
  | 'service'
  | 'study'
  | 'prayer'
  | 'assessment'
  | 'event_attendance'
  | 'mentor_meeting'
  | 'custom';

export interface MilestoneContent {
  text?: string;
  questions?: string[];
  scripture?: ScriptureReference[];
  video?: string;
  audio?: string;
  document?: string;
  externalLink?: string;
}

export interface ScriptureReference {
  book: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
  translation?: string;
}

export interface MilestoneRequirement {
  type: 'completion' | 'approval' | 'assessment_score' | 'time_spent' | 'meeting_attendance';
  value?: string | number;
  description: string;
}

export interface MilestoneResource {
  id: string;
  type: ResourceType;
  title: string;
  description?: string;
  url?: string;
  content?: string;
  downloadable: boolean;
}

export type ResourceType = 'article' | 'video' | 'audio' | 'pdf' | 'link' | 'book' | 'study_guide' | 'worksheet';

export interface MemberJourney {
  id: string;
  memberId: string;
  memberName: string;
  journeyTemplateId: string;
  journeyTemplateName: string;
  status: JourneyStatus;
  startedAt: string;
  completedAt?: string;
  pausedAt?: string;
  lastActivityAt: string;
  currentMilestoneId?: string;
  progress: JourneyProgress;
  notes?: string;
  assignedBy?: string;
  assignedByName?: string;
  mentorId?: string;
  mentorName?: string;
}

export type JourneyStatus = 
  | 'not_started'
  | 'in_progress' 
  | 'paused'
  | 'completed'
  | 'abandoned'
  | 'overdue';

export interface JourneyProgress {
  totalMilestones: number;
  completedMilestones: number;
  currentMilestone?: number;
  percentageComplete: number;
  daysSinceStart: number;
  estimatedDaysRemaining?: number;
  milestonesProgress: MilestoneProgress[];
}

export interface MilestoneProgress {
  milestoneId: string;
  status: MilestoneStatus;
  startedAt?: string;
  completedAt?: string;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  approvedByName?: string;
  notes?: string;
  timeSpent?: number; // in minutes
  assessmentScore?: number;
  submissions: MilestoneSubmission[];
}

export type MilestoneStatus = 
  | 'not_started'
  | 'in_progress'
  | 'submitted'
  | 'needs_revision'
  | 'approved'
  | 'completed'
  | 'skipped';

export interface MilestoneSubmission {
  id: string;
  milestoneProgressId: string;
  type: SubmissionType;
  content: string;
  submittedAt: string;
  feedback?: string;
  feedbackBy?: string;
  feedbackByName?: string;
  feedbackAt?: string;
  attachments?: SubmissionAttachment[];
}

export type SubmissionType = 'text' | 'reflection' | 'photo' | 'video' | 'audio' | 'document' | 'link';

export interface SubmissionAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

// API Request/Response Types
export interface JourneyTemplateCreateRequest {
  name: string;
  description: string;
  category: JourneyCategory;
  difficulty: JourneyDifficulty;
  estimatedDuration: number;
  isPublic: boolean;
  milestones: Omit<JourneyMilestone, 'id' | 'journeyTemplateId'>[];
  tags?: string[];
  prerequisites?: string[];
  targetAudience: string[];
}

export interface JourneyTemplateUpdateRequest extends Partial<JourneyTemplateCreateRequest> {
  id: string;
}

export interface JourneyTemplateFilters {
  search?: string;
  category?: JourneyCategory;
  difficulty?: JourneyDifficulty;
  createdBy?: string;
  isPublic?: boolean;
  tags?: string[];
  targetAudience?: string[];
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'difficulty' | 'estimatedDuration';
  sortOrder?: 'asc' | 'desc';
}

export interface JourneyTemplateResponse {
  templates: JourneyTemplate[];
  total: number;
  page: number;
  limit: number;
}

export interface MemberJourneyCreateRequest {
  memberId: string;
  journeyTemplateId: string;
  mentorId?: string;
  notes?: string;
  startImmediately?: boolean;
}

export interface MemberJourneyUpdateRequest {
  id: string;
  status?: JourneyStatus;
  mentorId?: string;
  notes?: string;
  currentMilestoneId?: string;
}

export interface MemberJourneyFilters {
  memberId?: string;
  journeyTemplateId?: string;
  mentorId?: string;
  status?: JourneyStatus;
  assignedBy?: string;
  startDateFrom?: string;
  startDateTo?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'startedAt' | 'lastActivityAt' | 'completedAt' | 'progress';
  sortOrder?: 'asc' | 'desc';
}

export interface MemberJourneyResponse {
  journeys: MemberJourney[];
  total: number;
  page: number;
  limit: number;
}

export interface MilestoneSubmissionRequest {
  milestoneProgressId: string;
  type: SubmissionType;
  content: string;
  attachments?: File[];
}

export interface JourneyStats {
  totalTemplates: number;
  activeJourneys: number;
  completedJourneys: number;
  averageCompletionRate: number;
  popularTemplates: {
    templateId: string;
    templateName: string;
    activeCount: number;
    completionRate: number;
  }[];
  recentActivity: {
    type: 'journey_started' | 'milestone_completed' | 'journey_completed';
    memberName: string;
    journeyName?: string;
    milestoneName?: string;
    timestamp: string;
  }[];
}
