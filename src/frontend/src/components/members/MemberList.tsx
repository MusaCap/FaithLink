'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Mail, 
  Phone, 
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Download,
  Tag
} from 'lucide-react';
import { Member, MemberSearchFilters } from '../../types/member';
import { memberService } from '../../services/memberService';

interface MemberListProps {
  searchFilters?: MemberSearchFilters;
  showActions?: boolean;
  compact?: boolean;
}

export default function MemberList({ 
  searchFilters = {}, 
  showActions = true, 
  compact = false 
}: MemberListProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchFilters.query || '');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'firstName' | 'lastName' | 'joinDate'>('firstName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const membersPerPage = 20;

  // Load members
  useEffect(() => {
    loadMembers();
  }, [searchQuery, sortBy, sortOrder, currentPage, searchFilters]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: MemberSearchFilters = {
        ...searchFilters,
        query: searchQuery,
        sortBy,
        sortOrder,
        limit: membersPerPage,
        offset: (currentPage - 1) * membersPerPage
      };

      const response = await memberService.getMembers(filters);
      setMembers(response.members);
      setTotalMembers(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSort = (field: 'firstName' | 'lastName' | 'joinDate') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleMemberSelect = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members.map(m => m.id));
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    
    try {
      await memberService.deleteMember(memberId);
      loadMembers(); // Reload the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete member');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedMembers.length} members?`)) return;
    
    try {
      await memberService.bulkDeleteMembers(selectedMembers);
      setSelectedMembers([]);
      loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete members');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await memberService.exportMembers(searchFilters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `members-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export members');
    }
  };

  const getStatusColor = (status: Member['membershipStatus']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'visitor': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading members...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600">
            <strong>Error:</strong> {error}
          </div>
          <button
            onClick={loadMembers}
            className="ml-4 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Members</h1>
            <p className="text-gray-600">{totalMembers} members total</p>
          </div>
          
          {showActions && (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExport}
                className="btn btn-secondary btn-sm"
              >
                <Download size={16} className="mr-2" />
                Export
              </button>
              <Link href="/members/new" className="btn btn-primary btn-sm">
                <Plus size={16} className="mr-2" />
                Add Member
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search members by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary btn-sm"
          >
            <Filter size={16} className="mr-2" />
            Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="visitor">Visitor</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select 
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="firstName">First Name</option>
                  <option value="lastName">Last Name</option>
                  <option value="joinDate">Join Date</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <select 
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="asc">A-Z / Oldest First</option>
                  <option value="desc">Z-A / Newest First</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedMembers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800">
              {selectedMembers.length} members selected
            </span>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBulkDelete}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedMembers([])}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Table Header */}
        {!compact && (
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedMembers.length === members.length && members.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-3 text-sm font-medium text-gray-700">
                Select All
              </span>
            </div>
          </div>
        )}

        {/* Member Cards */}
        <div className={compact ? "space-y-2" : "divide-y divide-gray-200"}>
          {members.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
              <p className="text-gray-500">
                {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by adding your first member.'}
              </p>
              {!searchQuery && (
                <Link href="/members/new" className="btn btn-primary mt-4 inline-flex items-center">
                  <Plus size={16} className="mr-2" />
                  Add First Member
                </Link>
              )}
            </div>
          ) : (
            members.map((member) => (
              <div key={member.id} className={`p-6 hover:bg-gray-50 transition-colors ${compact ? 'border border-gray-200 rounded-lg' : ''}`}>
                <div className="flex items-center space-x-4">
                  {!compact && (
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.id)}
                      onChange={() => handleMemberSelect(member.id)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  )}
                  
                  {/* Profile Photo */}
                  <div className="flex-shrink-0">
                    {member.profilePhoto ? (
                      <img
                        src={member.profilePhoto}
                        alt={`${member.firstName} ${member.lastName}`}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Member Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Link
                        href={`/members/${member.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {member.firstName} {member.lastName}
                      </Link>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.membershipStatus)}`}>
                        {member.membershipStatus}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 space-y-1 sm:space-y-0 sm:space-x-4">
                      {member.email && (
                        <div className="flex items-center">
                          <Mail size={14} className="mr-1" />
                          {member.email}
                        </div>
                      )}
                      {member.phone && (
                        <div className="flex items-center">
                          <Phone size={14} className="mr-1" />
                          {member.phone}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        Joined {formatDate(member.joinDate)}
                      </div>
                    </div>

                    {/* Tags */}
                    {member.tags && member.tags.length > 0 && (
                      <div className="flex items-center mt-2">
                        <Tag size={14} className="text-gray-400 mr-1" />
                        <div className="flex flex-wrap gap-1">
                          {member.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {member.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              +{member.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {showActions && (
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/members/${member.id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                        title="View member"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        href={`/members/${member.id}/edit`}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                        title="Edit member"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        title="Delete member"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalMembers > membersPerPage && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * membersPerPage + 1} to {Math.min(currentPage * membersPerPage, totalMembers)} of {totalMembers} members
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            <span className="px-3 py-2 text-sm">
              Page {currentPage} of {Math.ceil(totalMembers / membersPerPage)}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalMembers / membersPerPage)))}
              disabled={currentPage >= Math.ceil(totalMembers / membersPerPage)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
