// Role-Based Access Control (RBAC) System for FaithLink360
// Supports Admin, Leader, and Member personas with specific permissions

import React from 'react';

export type UserRole = 'admin' | 'leader' | 'member';

export interface Permission {
  resource: string;
  actions: string[];
}

export interface RoleDefinition {
  name: UserRole;
  displayName: string;
  description: string;
  permissions: Permission[];
  features: string[];
}

// Define role capabilities
export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  admin: {
    name: 'admin',
    displayName: 'Church Administrator', 
    description: 'Full control over church operations, can create journeys/templates, manage all members',
    permissions: [
      { resource: 'members', actions: ['read', 'write', 'delete', 'export', 'import'] },
      { resource: 'groups', actions: ['read', 'write', 'delete', 'manage'] },
      { resource: 'events', actions: ['read', 'write', 'delete', 'manage'] },
      { resource: 'journeys', actions: ['read', 'write', 'delete', 'create-templates'] },
      { resource: 'journey-templates', actions: ['read', 'write', 'delete', 'create'] },
      { resource: 'reports', actions: ['read', 'export', 'analytics'] },
      { resource: 'settings', actions: ['read', 'write', 'manage'] },
      { resource: 'users', actions: ['read', 'write', 'delete', 'change-roles'] },
      { resource: 'pastoral-care', actions: ['read', 'write', 'delete'] },
      { resource: 'communications', actions: ['read', 'write', 'delete', 'broadcast'] },
      { resource: 'volunteers', actions: ['read', 'write', 'delete', 'manage'] },
      { resource: 'attendance', actions: ['read', 'write', 'manage'] },
      { resource: 'tasks', actions: ['read', 'write', 'delete', 'assign'] }
    ],
    features: [
      'full-member-management',
      'create-journey-templates', 
      'manage-all-groups',
      'church-settings',
      'user-role-management',
      'financial-reports',
      'bulk-operations',
      'advanced-analytics',
      'system-configuration'
    ]
  },
  
  leader: {
    name: 'leader',
    displayName: 'Ministry Leader',
    description: 'Can assign journeys, manage ministry-level tasks, lead groups and events',
    permissions: [
      { resource: 'members', actions: ['read', 'write'] },
      { resource: 'groups', actions: ['read', 'write', 'manage-assigned'] },
      { resource: 'events', actions: ['read', 'write', 'manage-assigned'] },
      { resource: 'journeys', actions: ['read', 'write', 'assign'] },
      { resource: 'journey-templates', actions: ['read'] },
      { resource: 'reports', actions: ['read', 'ministry-level'] },
      { resource: 'pastoral-care', actions: ['read', 'write'] },
      { resource: 'communications', actions: ['read', 'write', 'group-level'] },
      { resource: 'volunteers', actions: ['read', 'write', 'manage-ministry'] },
      { resource: 'attendance', actions: ['read', 'write', 'track'] },
      { resource: 'tasks', actions: ['read', 'write', 'assign-ministry'] }
    ],
    features: [
      'assign-journeys',
      'manage-ministry-groups',
      'create-events',
      'member-care-tracking',
      'ministry-reports',
      'group-communications',
      'volunteer-coordination',
      'attendance-tracking'
    ]
  },
  
  member: {
    name: 'member',
    displayName: 'Church Member',
    description: 'Can view assigned journeys, events, groups, and manage personal profile',
    permissions: [
      { resource: 'members', actions: ['read-self', 'write-self'] },
      { resource: 'groups', actions: ['read-assigned', 'participate'] },
      { resource: 'events', actions: ['read', 'register', 'rsvp'] },
      { resource: 'journeys', actions: ['read-assigned', 'update-progress'] },
      { resource: 'journey-templates', actions: ['read-assigned'] },
      { resource: 'communications', actions: ['read'] },
      { resource: 'volunteers', actions: ['read', 'signup'] },
      { resource: 'attendance', actions: ['read-self'] },
      { resource: 'tasks', actions: ['read-assigned', 'update-assigned'] }
    ],
    features: [
      'view-assigned-journeys',
      'track-spiritual-progress',
      'join-groups',
      'register-events',
      'update-profile',
      'volunteer-signup',
      'view-communications',
      'prayer-requests'
    ]
  }
};

// Permission checker functions
export class PermissionManager {
  private userRole: UserRole;
  private permissions: Permission[];

  constructor(role: UserRole) {
    this.userRole = role;
    this.permissions = ROLE_DEFINITIONS[role]?.permissions || [];
  }

  // Check if user can perform action on resource
  canPerform(resource: string, action: string): boolean {
    const permission = this.permissions.find(p => p.resource === resource);
    return permission?.actions.includes(action) || false;
  }

  // Check if user has feature access
  hasFeature(feature: string): boolean {
    return ROLE_DEFINITIONS[this.userRole]?.features.includes(feature) || false;
  }

  // Get all permissions for current role
  getPermissions(): Permission[] {
    return this.permissions;
  }

  // Get all features for current role  
  getFeatures(): string[] {
    return ROLE_DEFINITIONS[this.userRole]?.features || [];
  }

  // Check if user can manage other users
  canManageUsers(): boolean {
    return this.canPerform('users', 'change-roles');
  }

  // Check if user can create journey templates
  canCreateJourneyTemplates(): boolean {
    return this.canPerform('journey-templates', 'create');
  }

  // Check if user can manage all members
  canManageAllMembers(): boolean {
    return this.canPerform('members', 'write') && this.canPerform('members', 'delete');
  }

  // Check if user can assign journeys
  canAssignJourneys(): boolean {
    return this.canPerform('journeys', 'assign');
  }

  // Check if user can view analytics
  canViewAnalytics(): boolean {
    return this.canPerform('reports', 'analytics');
  }
}

// Role upgrade/downgrade rules
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  member: 1,
  leader: 2, 
  admin: 3
};

export function canChangeRole(currentUserRole: UserRole, targetRole: UserRole): boolean {
  // Only admins can change roles, and they can't demote themselves
  if (currentUserRole !== 'admin') return false;
  
  // Admins can change any role except demoting themselves to non-admin
  return true;
}

// Get permissions for role comparison
export function getRolePermissionSummary(role: UserRole) {
  const definition = ROLE_DEFINITIONS[role];
  return {
    role,
    displayName: definition.displayName,
    description: definition.description,
    permissionCount: definition.permissions.length,
    featureCount: definition.features.length,
    level: ROLE_HIERARCHY[role]
  };
}

// Utility functions for React components
export function usePermissions(userRole?: UserRole) {
  if (!userRole) return new PermissionManager('member');
  return new PermissionManager(userRole);
}

// Permission-based component wrapper
export function withPermission(
  component: React.ComponentType<any>,
  requiredResource: string,
  requiredAction: string,
  userRole?: UserRole
) {
  return function PermissionWrapper(props: any) {
    const permissions = usePermissions(userRole);
    
    if (!permissions.canPerform(requiredResource, requiredAction)) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 text-sm">
            You don't have permission to access this feature. 
            Contact your administrator if you need access.
          </p>
        </div>
      );
    }
    
    return React.createElement(component, props);
  };
}

// Role selection for registration
export const ROLE_SELECTION_OPTIONS = [
  {
    value: 'admin',
    label: 'Church Administrator',
    description: 'Full access to manage church operations, create templates, and oversee all activities',
    recommended: 'For pastors, church administrators, and senior staff',
    features: ['Full member management', 'Create journey templates', 'Advanced analytics', 'User role management']
  },
  {
    value: 'leader', 
    label: 'Ministry Leader',
    description: 'Lead groups, assign journeys, and manage ministry-level activities',
    recommended: 'For group leaders, ministry coordinators, and volunteer coordinators',
    features: ['Assign spiritual journeys', 'Manage groups', 'Ministry reports', 'Member care tracking']
  },
  {
    value: 'member',
    label: 'Church Member', 
    description: 'Participate in groups, track spiritual growth, and engage with church activities',
    recommended: 'For regular church members and participants',
    features: ['View assigned journeys', 'Join groups', 'Register for events', 'Track spiritual progress']
  }
];
