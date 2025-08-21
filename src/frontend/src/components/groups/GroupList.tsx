'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  MapPin,
  Clock,
  UserCheck,
  Edit,
  Trash2,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { groupService } from '../../services/groupService';
import { Group, GroupSearchFilters, GroupType, GroupStatus } from '../../types/group';

export default function GroupList() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'memberCount' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalGroups, setTotalGroups] = useState(0);
  const [filters, setFilters] = useState({
    type: [] as GroupType[],
    status: ['active'] as GroupStatus[],
    hasAvailableSpace: false,
  });
  const groupsPerPage = 20;

  const loadGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const searchFilters: GroupSearchFilters = {
        query: searchQuery,
        type: filters.type.length > 0 ? filters.type : undefined,
        status: filters.status.length > 0 ? filters.status : undefined,
        hasAvailableSpace: filters.hasAvailableSpace || undefined,
        sortBy,
        sortOrder,
        limit: groupsPerPage,
        offset: (currentPage - 1) * groupsPerPage
      };

      const response = await groupService.getGroups(searchFilters);
      setGroups(response.groups);
      setTotalGroups(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, sortBy, sortOrder, currentPage]);

  useEffect(() => {
    loadGroups();
  }, [searchQuery, filters, sortBy, sortOrder, currentPage]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSort = (field: 'name' | 'createdAt' | 'memberCount' | 'type') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType: keyof typeof filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSelectAll = () => {
    if (selectedGroups.length === groups.length) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(groups.map(group => group.id));
    }
  };

  const canManageGroups = user?.role === 'admin' || user?.role === 'pastor';
  const canLeadGroups = canManageGroups || user?.role === 'group_leader';

  const getGroupTypeLabel = (type: GroupType): string => {
    const typeLabels = {
      small_group: 'Small Group',
      ministry: 'Ministry',
      youth: 'Youth',
      seniors: 'Seniors',
      womens: "Women's",
      mens: "Men's",
      children: "Children's",
      worship: 'Worship',
      service: 'Service',
      bible_study: 'Bible Study',
      prayer: 'Prayer',
      outreach: 'Outreach',
      other: 'Other'
    };
    return typeLabels[type];
  };

  const formatMeetingSchedule = (schedule?: any): string => {
    if (!schedule || !schedule.frequency) return 'No schedule set';
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = schedule.dayOfWeek !== undefined ? days[schedule.dayOfWeek] : '';
    const time = schedule.time || '';
    
    return `${schedule.frequency} ${dayName} ${time}`.trim();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Groups</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Manage church groups, track attendance, and coordinate activities
          </p>
        </div>
        {canManageGroups && (
          <div className="mt-4 sm:mt-0">
            <Link
              href="/groups/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Group
            </Link>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search groups..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Group Type
                </label>
                <select
                  multiple
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', Array.from(e.target.selectedOptions, option => option.value as GroupType))}
                >
                  <option value="small_group">Small Group</option>
                  <option value="ministry">Ministry</option>
                  <option value="youth">Youth</option>
                  <option value="seniors">Seniors</option>
                  <option value="womens">Women's</option>
                  <option value="mens">Men's</option>
                  <option value="children">Children's</option>
                  <option value="worship">Worship</option>
                  <option value="service">Service</option>
                  <option value="bible_study">Bible Study</option>
                  <option value="prayer">Prayer</option>
                  <option value="outreach">Outreach</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Status
                </label>
                <select
                  multiple
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', Array.from(e.target.selectedOptions, option => option.value as GroupStatus))}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    checked={filters.hasAvailableSpace}
                    onChange={(e) => handleFilterChange('hasAvailableSpace', e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-neutral-700">Has available space</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div key={group.id} className="bg-white rounded-lg shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                    <Link href={`/groups/${group.id}`} className="hover:text-primary-600">
                      {group.name}
                    </Link>
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    group.type === 'small_group' ? 'bg-blue-100 text-blue-800' :
                    group.type === 'ministry' ? 'bg-green-100 text-green-800' :
                    group.type === 'youth' ? 'bg-purple-100 text-purple-800' :
                    'bg-neutral-100 text-neutral-800'
                  }`}>
                    {getGroupTypeLabel(group.type)}
                  </span>
                </div>
                <div className="relative">
                  <button className="text-neutral-400 hover:text-neutral-600">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {group.description && (
                <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                  {group.description}
                </p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-neutral-600">
                  <Users className="w-4 h-4 mr-2" />
                  {group.memberIds.length} members
                  {group.maxMembers && (
                    <span className="text-neutral-400"> / {group.maxMembers} max</span>
                  )}
                </div>
                <div className="flex items-center text-sm text-neutral-600">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Leader: {group.leaderName}
                </div>
                {group.meetingSchedule && (
                  <div className="flex items-center text-sm text-neutral-600">
                    <Clock className="w-4 h-4 mr-2" />
                    {formatMeetingSchedule(group.meetingSchedule)}
                  </div>
                )}
                {group.location && (
                  <div className="flex items-center text-sm text-neutral-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {group.location}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-neutral-100">
                <div className="flex space-x-2">
                  {canLeadGroups && (
                    <>
                      <Link
                        href={`/groups/${group.id}/attendance`}
                        className="inline-flex items-center px-3 py-1 border border-neutral-300 rounded-md text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50"
                      >
                        <Calendar className="w-3 h-3 mr-1" />
                        Attendance
                      </Link>
                      <Link
                        href={`/communications/group/${group.id}`}
                        className="inline-flex items-center px-3 py-1 border border-neutral-300 rounded-md text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50"
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Message
                      </Link>
                    </>
                  )}
                </div>
                <Link
                  href={`/groups/${group.id}`}
                  className="text-xs font-medium text-primary-600 hover:text-primary-700"
                >
                  View Details →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {groups.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No groups found</h3>
          <p className="text-neutral-600 mb-6">
            {searchQuery ? 'Try adjusting your search criteria' : 'Get started by creating your first group'}
          </p>
          {canManageGroups && !searchQuery && (
            <Link
              href="/groups/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Link>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalGroups > groupsPerPage && (
        <div className="flex items-center justify-between border-t border-neutral-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage * groupsPerPage >= totalGroups}
              className="relative ml-3 inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-neutral-700">
                Showing <span className="font-medium">{(currentPage - 1) * groupsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * groupsPerPage, totalGroups)}
                </span>{' '}
                of <span className="font-medium">{totalGroups}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage * groupsPerPage >= totalGroups}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
