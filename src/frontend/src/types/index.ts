// User and Authentication Types
export interface User {
  id: string
  email: string
  role: Role
  isActive: boolean
  createdAt: string
  updatedAt: string
  member?: Member
}

export interface Member {
  id: string
  userId?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  gender?: Gender
  address?: string
  maritalStatus?: MaritalStatus
  spiritualStatus?: string
  profilePhotoUrl?: string
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  groups?: GroupMember[]
  journeyStages?: JourneyStage[]
  tags?: MemberTag[]
}

export interface Group {
  id: string
  name: string
  type: GroupType
  description?: string
  leaderId?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  members?: GroupMember[]
  events?: Event[]
  files?: GroupFile[]
}

export interface GroupMember {
  id: string
  memberId: string
  groupId: string
  joinedAt: string
  isActive: boolean
  member?: Member
  group?: Group
}

export interface JourneyTemplate {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  milestones?: Milestone[]
}

export interface Milestone {
  id: string
  templateId: string
  name: string
  description?: string
  sequence: number
  template?: JourneyTemplate
}

export interface JourneyStage {
  id: string
  memberId: string
  templateId: string
  milestoneId: string
  status: StageStatus
  autoProgress: boolean
  flagForFollowUp: boolean
  completedAt?: string
  notes?: string
  createdAt: string
  updatedAt: string
  member?: Member
  template?: JourneyTemplate
  milestone?: Milestone
}

export interface Event {
  id: string
  title: string
  description?: string
  dateTime: string
  location?: string
  groupId?: string
  calendarType: CalendarType
  createdBy: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  group?: Group
  attendances?: EventAttendance[]
  tags?: EventTag[]
}

export interface EventAttendance {
  id: string
  eventId: string
  memberId: string
  attended: boolean
  checkedInAt?: string
  event?: Event
  member?: Member
}

export interface CareLog {
  id: string
  memberId: string
  caregiverId: string
  type: CareType
  notes: string
  followUpRequired: boolean
  confidential: boolean
  followUpDate?: string
  createdAt: string
  member?: Member
  caregiver?: User
}

export interface Tag {
  id: string
  label: string
  category: TagCategory
  color: string
  createdAt: string
  members?: MemberTag[]
  events?: EventTag[]
}

export interface MemberTag {
  id: string
  memberId: string
  tagId: string
  member?: Member
  tag?: Tag
}

export interface EventTag {
  id: string
  eventId: string
  tagId: string
  event?: Event
  tag?: Tag
}

export interface GroupFile {
  id: string
  groupId: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  uploadedBy: string
  uploadedAt: string
  group?: Group
}

// Enum Types
export enum Role {
  ADMIN = 'ADMIN',
  PASTOR = 'PASTOR',
  CARE_TEAM = 'CARE_TEAM',
  GROUP_LEADER = 'GROUP_LEADER',
  MEMBER = 'MEMBER'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED'
}

export enum GroupType {
  MINISTRY = 'MINISTRY',
  LIFEGROUP = 'LIFEGROUP',
  TEAM = 'TEAM'
}

export enum StageStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export enum CalendarType {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  ONEOFF = 'ONEOFF'
}

export enum CareType {
  PRAYER = 'PRAYER',
  VISIT = 'VISIT',
  COUNSELING = 'COUNSELING',
  CALL = 'CALL'
}

export enum TagCategory {
  MEMBER = 'MEMBER',
  EVENT = 'EVENT',
  GROUP = 'GROUP'
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp: string
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form Types
export interface LoginForm {
  email: string
  password: string
}

export interface MemberForm {
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  gender?: Gender
  address?: string
  maritalStatus?: MaritalStatus
  spiritualStatus?: string
  notes?: string
}

export interface GroupForm {
  name: string
  type: GroupType
  description?: string
  leaderId?: string
}

export interface EventForm {
  title: string
  description?: string
  dateTime: string
  location?: string
  groupId?: string
  calendarType: CalendarType
}

export interface CareLogForm {
  memberId: string
  type: CareType
  notes: string
  followUpRequired: boolean
  confidential: boolean
  followUpDate?: string
}

// UI Component Types
export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface TableColumn<T = any> {
  key: keyof T | string
  label: string
  sortable?: boolean
  render?: (value: any, record: T) => React.ReactNode
  width?: string
  className?: string
}

export interface FilterOption {
  key: string
  label: string
  type: 'select' | 'text' | 'date' | 'boolean'
  options?: SelectOption[]
  placeholder?: string
}

// Dashboard Types
export interface DashboardStats {
  totalMembers: number
  activeGroups: number
  upcomingEvents: number
  pendingFollowUps: number
  memberGrowth: number
  groupAttendance: number
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
    fill?: boolean
  }[]
}

// Navigation Types
export interface NavigationItem {
  name: string
  href: string
  icon?: React.ComponentType<any>
  current?: boolean
  children?: NavigationItem[]
  badge?: string | number
}
