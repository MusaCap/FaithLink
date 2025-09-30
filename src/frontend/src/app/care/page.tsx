'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Plus, Search, Filter, Calendar, User, MessageCircle, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import PrayerRequestForm from '../../components/care/PrayerRequestForm';
import MemberCareTracker from '../../components/care/MemberCareTracker';
import CounselingScheduler from '../../components/care/CounselingScheduler';

interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  requestedBy: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'health' | 'family' | 'work' | 'spiritual' | 'financial' | 'other';
  status: 'active' | 'answered' | 'ongoing';
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  updates?: PrayerUpdate[];
}

interface PrayerUpdate {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

interface CounselingSession {
  id: string;
  memberName: string;
  counselorName: string;
  sessionType: 'individual' | 'couple' | 'family' | 'group';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  scheduledDate: string;
  duration: number;
  notes?: string;
}

export default function CarePage() {
  const [activeTab, setActiveTab] = useState('prayer-requests');
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [counselingSessions, setCounselingSessions] = useState<CounselingSession[]>([]);
  const [showPrayerForm, setShowPrayerForm] = useState(false);
  const [showCounselingScheduler, setShowCounselingScheduler] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PrayerRequest | null>(null);

  useEffect(() => {
    fetchPrayerRequests();
    fetchCounselingSessions();
  }, []);

  const fetchPrayerRequests = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/care/prayer-requests`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPrayerRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching prayer requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounselingSessions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/care/counseling-sessions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCounselingSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching counseling sessions:', error);
    }
  };

  const filteredPrayerRequests = prayerRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || request.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'normal': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'answered': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'ongoing': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Heart className="w-8 h-8 text-red-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pastoral Care</h1>
              <p className="text-gray-600">Managing prayer requests, member care, and counseling</p>
            </div>
          </div>
          <div className="flex space-x-3">
            {activeTab === 'prayer-requests' && (
              <button
                onClick={() => setShowPrayerForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Prayer Request</span>
              </button>
            )}
            {activeTab === 'counseling' && (
              <button
                onClick={() => setShowCounselingScheduler(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Session</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('prayer-requests')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'prayer-requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageCircle className="w-4 h-4 inline mr-2" />
              Prayer Requests
            </button>
            <button
              onClick={() => setActiveTab('member-care')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'member-care'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Member Care
            </button>
            <button
              onClick={() => setActiveTab('counseling')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'counseling'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Counseling
            </button>
          </nav>
        </div>
      </div>

      {/* Prayer Requests Tab */}
      {activeTab === 'prayer-requests' && (
        <div>
          {/* Search and Filters */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 flex-1 max-w-lg">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search prayer requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="health">Health</option>
                <option value="family">Family</option>
                <option value="work">Work</option>
                <option value="spiritual">Spiritual</option>
                <option value="financial">Financial</option>
                <option value="other">Other</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="ongoing">Ongoing</option>
                <option value="answered">Answered</option>
              </select>
            </div>
          </div>

          {/* Prayer Requests List */}
          <div className="bg-white rounded-lg shadow">
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading prayer requests...</p>
              </div>
            ) : filteredPrayerRequests.length === 0 ? (
              <div className="p-6 text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No prayer requests found</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredPrayerRequests.map((request) => (
                  <div key={request.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium border rounded-full ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                          <span className="text-sm text-gray-500 capitalize">{request.category}</span>
                          {request.isPrivate && (
                            <span className="px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-full">
                              Private
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-3">{request.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Requested by {request.requestedBy}</span>
                          <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                          {request.assignedTo && <span>Assigned to {request.assignedTo}</span>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {getStatusIcon(request.status)}
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {request.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </button>
                      <span className="text-gray-300">|</span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Add Update
                      </button>
                      <span className="text-gray-300">|</span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Member Care Tab */}
      {activeTab === 'member-care' && (
        <MemberCareTracker />
      )}

      {/* Counseling Tab */}
      {activeTab === 'counseling' && (
        <div>
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Counseling Sessions</h3>
              {counselingSessions.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No counseling sessions scheduled</p>
                  <button
                    onClick={() => setShowCounselingScheduler(true)}
                    className="mt-3 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Schedule your first session
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {counselingSessions.map((session) => (
                    <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{session.memberName}</h4>
                          <p className="text-sm text-gray-600">
                            {session.sessionType} session with {session.counselorName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(session.scheduledDate).toLocaleString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          session.status === 'completed' ? 'bg-green-100 text-green-800' :
                          session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          session.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showPrayerForm && (
        <PrayerRequestForm
          onClose={() => setShowPrayerForm(false)}
          onSubmit={(requestData) => {
            // Handle form submission
            console.log('New prayer request:', requestData);
            fetchPrayerRequests();
            setShowPrayerForm(false);
          }}
        />
      )}

      {showCounselingScheduler && (
        <CounselingScheduler
          onClose={() => setShowCounselingScheduler(false)}
          onSubmit={(sessionData) => {
            // Handle session scheduling
            console.log('New counseling session:', sessionData);
            fetchCounselingSessions();
            setShowCounselingScheduler(false);
          }}
        />
      )}
    </div>
  );
}
