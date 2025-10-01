'use client';

import React, { useState, useEffect } from 'react';
import { Users, MapPin, Calendar, Clock, User, Heart, Search, Filter, CheckCircle } from 'lucide-react';

interface VolunteerOpportunity {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  startDate: string;
  endDate?: string;
  timeCommitment: string;
  skillsRequired: string[];
  contactPerson: string;
  contactEmail: string;
  spotsAvailable: number;
  spotsTotal: number;
  isRecurring: boolean;
  status: 'open' | 'filled' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface VolunteerSignup {
  id: string;
  opportunityId: string;
  memberName: string;
  email: string;
  phone?: string;
  availability: string;
  experience: string;
  motivation: string;
  signupDate: string;
  status: 'pending' | 'approved' | 'declined';
}

export default function VolunteerSignupSystem() {
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [signups, setSignups] = useState<VolunteerSignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState<VolunteerOpportunity | null>(null);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [signupForm, setSignupForm] = useState({
    availability: '',
    experience: '',
    motivation: '',
    phone: ''
  });

  useEffect(() => {
    fetchOpportunities();
    fetchMySignups();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/volunteers/opportunities`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOpportunities(data.opportunities);
      } else {
        // Mock data fallback
        setOpportunities([
          {
            id: '1',
            title: 'Sunday School Teacher',
            description: 'Teach children ages 6-10 during Sunday service. Curriculum and materials provided.',
            department: 'Children\'s Ministry',
            location: 'Classroom A',
            startDate: '2025-02-01',
            endDate: '2025-06-30',
            timeCommitment: '2 hours/week on Sundays',
            skillsRequired: ['Experience with children', 'Public speaking', 'Patience'],
            contactPerson: 'Maria Santos',
            contactEmail: 'maria@faithlink.org',
            spotsAvailable: 2,
            spotsTotal: 3,
            isRecurring: true,
            status: 'open',
            priority: 'high'
          },
          {
            id: '2',
            title: 'Worship Team Musician',
            description: 'Play guitar or keyboard for Sunday morning worship services.',
            department: 'Worship Ministry',
            location: 'Main Sanctuary',
            startDate: '2025-01-28',
            timeCommitment: '3 hours/week (practice + service)',
            skillsRequired: ['Musical proficiency', 'Team collaboration'],
            contactPerson: 'David Kim',
            contactEmail: 'david@faithlink.org',
            spotsAvailable: 1,
            spotsTotal: 2,
            isRecurring: true,
            status: 'open',
            priority: 'medium'
          },
          {
            id: '3',
            title: 'Community Outreach Coordinator',
            description: 'Help organize and lead monthly community service projects.',
            department: 'Outreach Ministry',
            location: 'Various locations',
            startDate: '2025-02-15',
            endDate: '2025-12-31',
            timeCommitment: '4-6 hours/month',
            skillsRequired: ['Organization', 'Leadership', 'Communication'],
            contactPerson: 'Pastor David',
            contactEmail: 'pastor@faithlink.org',
            spotsAvailable: 3,
            spotsTotal: 5,
            isRecurring: false,
            status: 'open',
            priority: 'high'
          },
          {
            id: '4',
            title: 'Tech Support Volunteer',
            description: 'Provide technical support for live streaming and sound during services.',
            department: 'Technical Ministry',
            location: 'Tech Booth',
            startDate: '2025-01-30',
            timeCommitment: '2 hours/week on Sundays',
            skillsRequired: ['Basic tech knowledge', 'Attention to detail'],
            contactPerson: 'Michael Chen',
            contactEmail: 'tech@faithlink.org',
            spotsAvailable: 0,
            spotsTotal: 2,
            isRecurring: true,
            status: 'filled',
            priority: 'medium'
          },
          {
            id: '5',
            title: 'Food Pantry Assistant',
            description: 'Help sort and distribute food donations to families in need.',
            department: 'Community Care',
            location: 'Fellowship Hall',
            startDate: '2025-02-01',
            timeCommitment: '3 hours/month on Saturdays',
            skillsRequired: ['Physical ability to lift', 'Compassionate heart'],
            contactPerson: 'Sarah Johnson',
            contactEmail: 'outreach@faithlink.org',
            spotsAvailable: 4,
            spotsTotal: 6,
            isRecurring: true,
            status: 'open',
            priority: 'urgent'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch volunteer opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMySignups = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/volunteers/my-signups`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSignups(data.signups);
      } else {
        // Mock data fallback
        setSignups([
          {
            id: '1',
            opportunityId: '2',
            memberName: 'Current User',
            email: 'user@faithlink.org',
            phone: '(555) 123-4567',
            availability: 'Sunday mornings',
            experience: '5 years playing guitar',
            motivation: 'Want to serve God through music ministry',
            signupDate: '2025-01-18',
            status: 'approved'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch volunteer signups:', error);
    }
  };

  const handleSignup = async () => {
    if (!selectedOpportunity) return;

    try {
      const response = await fetch('/api/volunteers/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: selectedOpportunity.id,
          ...signupForm
        })
      });

      if (response.ok) {
        setShowSignupForm(false);
        setSelectedOpportunity(null);
        setSignupForm({ availability: '', experience: '', motivation: '', phone: '' });
        await fetchOpportunities();
        await fetchMySignups();
      }
    } catch (error) {
      console.error('Failed to sign up for volunteer opportunity:', error);
    }
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || opp.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  const departments = Array.from(new Set(opportunities.map(opp => opp.department)));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'filled': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isAlreadySignedUp = (opportunityId: string) => {
    return signups.some(signup => signup.opportunityId === opportunityId);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <Heart className="w-8 h-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Volunteer Opportunities</h1>
            <p className="text-gray-600">Find ways to serve and make a difference in your community</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* My Current Volunteer Roles */}
      {signups.length > 0 && (
        <div className="mb-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            My Volunteer Commitments
          </h2>
          <div className="space-y-3">
            {signups.map((signup) => {
              const opportunity = opportunities.find(opp => opp.id === signup.opportunityId);
              return (
                <div key={signup.id} className="bg-white rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{opportunity?.title}</h3>
                    <p className="text-sm text-gray-600">{opportunity?.department}</p>
                    <p className="text-xs text-gray-500">Signed up {new Date(signup.signupDate).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    signup.status === 'approved' ? 'bg-green-100 text-green-800' :
                    signup.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {signup.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Volunteer Opportunities Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredOpportunities.map((opportunity) => (
          <div
            key={opportunity.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{opportunity.title}</h3>
                <div className="flex flex-col space-y-1">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(opportunity.priority)}`}>
                    {opportunity.priority}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(opportunity.status)}`}>
                    {opportunity.status}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {opportunity.description}
              </p>

              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  {opportunity.department}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  {opportunity.location}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  Starts {new Date(opportunity.startDate).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  {opportunity.timeCommitment}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Spots Available</span>
                  <span className="font-medium">
                    {opportunity.spotsAvailable} of {opportunity.spotsTotal}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      opportunity.spotsAvailable === 0 ? 'bg-red-500' :
                      opportunity.spotsAvailable <= 2 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{
                      width: `${((opportunity.spotsTotal - opportunity.spotsAvailable) / opportunity.spotsTotal) * 100}%`
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium">Skills Required:</p>
                <div className="flex flex-wrap gap-1">
                  {opportunity.skillsRequired.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                {isAlreadySignedUp(opportunity.id) ? (
                  <div className="flex-1 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md text-center">
                    Already Signed Up
                  </div>
                ) : opportunity.status === 'filled' ? (
                  <div className="flex-1 px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-md text-center cursor-not-allowed">
                    Position Filled
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedOpportunity(opportunity);
                      setShowSignupForm(true);
                    }}
                    className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Sign Up to Volunteer
                  </button>
                )}
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Contact: {opportunity.contactPerson} ({opportunity.contactEmail})
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOpportunities.length === 0 && (
        <div className="text-center py-12">
          <Heart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No opportunities found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || departmentFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Check back later for new volunteer opportunities.'
            }
          </p>
        </div>
      )}

      {/* Volunteer Signup Modal */}
      {showSignupForm && selectedOpportunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Sign Up: {selectedOpportunity.title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">{selectedOpportunity.department}</p>
            </div>

            <div className="p-6">
              <form onSubmit={(e) => { e.preventDefault(); handleSignup(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={signupForm.phone}
                    onChange={(e) => setSignupForm({...signupForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Availability *
                  </label>
                  <textarea
                    value={signupForm.availability}
                    onChange={(e) => setSignupForm({...signupForm, availability: e.target.value})}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="When are you available? (e.g., Sunday mornings, weekday evenings)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relevant Experience *
                  </label>
                  <textarea
                    value={signupForm.experience}
                    onChange={(e) => setSignupForm({...signupForm, experience: e.target.value})}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Describe any relevant experience or skills you have"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Why do you want to volunteer for this role? *
                  </label>
                  <textarea
                    value={signupForm.motivation}
                    onChange={(e) => setSignupForm({...signupForm, motivation: e.target.value})}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Share your motivation for serving in this capacity"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSignupForm(false);
                      setSelectedOpportunity(null);
                      setSignupForm({ availability: '', experience: '', motivation: '', phone: '' });
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Submit Application</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
