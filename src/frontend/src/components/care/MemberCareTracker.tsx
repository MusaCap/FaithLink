'use client';

import React, { useState, useEffect } from 'react';
import { User, Calendar, MessageSquare, Plus, Search, Filter, Heart, Phone, Mail, MapPin, Clock } from 'lucide-react';

interface CareRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  careType: 'visit' | 'call' | 'email' | 'hospital' | 'counseling' | 'follow-up';
  subject: string;
  notes: string;
  careProvider: string;
  careDate: string;
  nextFollowUp?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'completed' | 'scheduled' | 'in-progress' | 'cancelled';
  tags: string[];
}

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  lastContact: string;
  careNeeds: string[];
  emergencyContact: string;
}

const MemberCareTracker: React.FC = () => {
  const [careRecords, setCareRecords] = useState<CareRecord[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCareForm, setShowNewCareForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCareType, setFilterCareType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeView, setActiveView] = useState('records');

  useEffect(() => {
    fetchCareData();
  }, []);

  const fetchCareData = async () => {
    try {
      // Fetch care records
      const careResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/care/records`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (careResponse.ok) {
        const careData = await careResponse.json();
        setCareRecords(careData.records || []);
      }

      // Fetch members needing care
      const membersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/care/members-needing-care`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setMembers(membersData.members || []);
      }
    } catch (error) {
      console.error('Failed to fetch care data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const mockCareRecords: CareRecord[] = [
    {
      id: '1',
      memberId: '1',
      memberName: 'Sarah Johnson',
      memberEmail: 'sarah@email.com',
      memberPhone: '(555) 123-4567',
      careType: 'hospital',
      subject: 'Surgery Recovery Visit',
      notes: 'Visited Sarah after her knee surgery. She is recovering well and appreciates the church support. Needs help with groceries for next 2 weeks.',
      careProvider: 'Pastor Smith',
      careDate: '2025-01-14T14:00:00Z',
      nextFollowUp: '2025-01-21T10:00:00Z',
      priority: 'high',
      status: 'completed',
      tags: ['surgery', 'recovery', 'elderly']
    },
    {
      id: '2',
      memberId: '2',
      memberName: 'Michael Chen',
      memberEmail: 'michael@email.com',
      memberPhone: '(555) 987-6543',
      careType: 'counseling',
      subject: 'Marriage Counseling Session',
      notes: 'Third session with Michael and Lisa. Making good progress on communication. Scheduled next appointment.',
      careProvider: 'Pastor David',
      careDate: '2025-01-13T16:00:00Z',
      nextFollowUp: '2025-01-20T16:00:00Z',
      priority: 'normal',
      status: 'completed',
      tags: ['marriage', 'counseling']
    },
    {
      id: '3',
      memberId: '3',
      memberName: 'Emily Rodriguez',
      memberEmail: 'emily@email.com',
      memberPhone: '(555) 456-7890',
      careType: 'call',
      subject: 'Job Loss Support Call',
      notes: 'Called Emily to check on her after recent job loss. Connected her with job search resources and financial assistance program.',
      careProvider: 'Care Team Leader',
      careDate: '2025-01-12T10:30:00Z',
      priority: 'high',
      status: 'completed',
      tags: ['job-loss', 'financial-help']
    }
  ];

  const mockMembersNeedingCare: Member[] = [
    {
      id: '4',
      name: 'Robert Wilson',
      email: 'robert@email.com',
      phone: '(555) 111-2222',
      address: '123 Oak St, City, State',
      lastContact: '2024-12-15T00:00:00Z',
      careNeeds: ['elderly', 'homebound'],
      emergencyContact: 'Jane Wilson (555) 111-2223'
    },
    {
      id: '5',
      name: 'Maria Santos',
      email: 'maria@email.com',
      phone: '(555) 333-4444',
      address: '456 Pine Ave, City, State',
      lastContact: '2025-01-05T00:00:00Z',
      careNeeds: ['new-member', 'follow-up'],
      emergencyContact: 'Carlos Santos (555) 333-4445'
    }
  ];

  // Use real data from API
  const displayCareRecords = careRecords;
  const displayMembers = members;

  const filteredCareRecords = displayCareRecords.filter(record => {
    const matchesSearch = record.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCareType = filterCareType === 'all' || record.careType === filterCareType;
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    
    return matchesSearch && matchesCareType && matchesStatus;
  });

  const getCareTypeIcon = (careType: string) => {
    switch (careType) {
      case 'visit': return <User className="w-4 h-4" />;
      case 'call': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'hospital': return <Heart className="w-4 h-4" />;
      case 'counseling': return <MessageSquare className="w-4 h-4" />;
      case 'follow-up': return <Clock className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getCareTypeColor = (careType: string) => {
    switch (careType) {
      case 'hospital': return 'text-red-600 bg-red-50 border-red-200';
      case 'counseling': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'visit': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'call': return 'text-green-600 bg-green-50 border-green-200';
      case 'email': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'normal': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div>
      {/* Sub-navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveView('records')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeView === 'records'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Care Records
            </button>
            <button
              onClick={() => setActiveView('members')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeView === 'members'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Members Needing Care
            </button>
          </nav>
        </div>
      </div>

      {/* Care Records View */}
      {activeView === 'records' && (
        <div>
          {/* Search and Filters */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 flex-1 max-w-lg">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search care records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <select
                value={filterCareType}
                onChange={(e) => setFilterCareType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Care Types</option>
                <option value="visit">Visits</option>
                <option value="call">Phone Calls</option>
                <option value="email">Emails</option>
                <option value="hospital">Hospital</option>
                <option value="counseling">Counseling</option>
                <option value="follow-up">Follow-up</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={() => setShowNewCareForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Care Record</span>
              </button>
            </div>
          </div>

          {/* Care Records List */}
          <div className="bg-white rounded-lg shadow">
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading care records...</p>
              </div>
            ) : filteredCareRecords.length === 0 ? (
              <div className="p-6 text-center">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No care records found</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredCareRecords.map((record) => (
                  <div key={record.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{record.memberName}</h3>
                          <span className={`px-2 py-1 text-xs font-medium border rounded-full flex items-center space-x-1 ${getCareTypeColor(record.careType)}`}>
                            {getCareTypeIcon(record.careType)}
                            <span className="capitalize">{record.careType}</span>
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium border rounded-full ${getPriorityColor(record.priority)}`}>
                            {record.priority}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-800 mb-2">{record.subject}</h4>
                        <p className="text-gray-700 mb-3">{record.notes}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-2">
                          <span>Care by {record.careProvider}</span>
                          <span>{new Date(record.careDate).toLocaleDateString()}</span>
                          {record.nextFollowUp && (
                            <span className="text-blue-600">
                              Next follow-up: {new Date(record.nextFollowUp).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {record.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {record.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          record.status === 'completed' ? 'bg-green-100 text-green-800' :
                          record.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          record.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Members Needing Care View */}
      {activeView === 'members' && (
        <div>
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Members Requiring Care Attention</h3>
              {displayMembers.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No members needing immediate care</p>
                  <p className="text-sm text-gray-500 mt-1">All members are up to date with care visits</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayMembers.map((member) => (
                    <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">{member.name}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4" />
                              <span>{member.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4" />
                              <span>{member.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4" />
                              <span>{member.address}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>Last contact: {new Date(member.lastContact).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {member.careNeeds.map((need, index) => (
                              <span key={index} className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                                {need}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500">
                            Emergency Contact: {member.emergencyContact}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Schedule Care
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberCareTracker;
