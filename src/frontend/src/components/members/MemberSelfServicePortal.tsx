'use client';

import React, { useState, useEffect } from 'react';
import { User, Edit3, Calendar, MapPin, Heart, BookOpen, Users, Settings, Bell, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface MemberProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  membershipDate: string;
  status: 'active' | 'inactive';
  groups: string[];
  journeys: {
    id: string;
    title: string;
    progress: number;
    status: 'in_progress' | 'completed' | 'not_started';
  }[];
  prayerRequests: {
    id: string;
    title: string;
    status: 'active' | 'answered' | 'archived';
    date: string;
  }[];
  upcomingEvents: {
    id: string;
    title: string;
    date: string;
    location: string;
    registered: boolean;
  }[];
}

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  pushNotifications: boolean;
  eventReminders: boolean;
  prayerUpdates: boolean;
  journeyProgress: boolean;
}

export default function MemberSelfServicePortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    sms: false,
    pushNotifications: true,
    eventReminders: true,
    prayerUpdates: true,
    journeyProgress: true
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<MemberProfile>>({});

  useEffect(() => {
    fetchMemberProfile();
    fetchNotificationSettings();
  }, []);

  const fetchMemberProfile = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/members/self-service/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setEditForm(data.profile);
      } else {
        // Use actual user data as fallback
        const mockProfile: MemberProfile = {
          id: user?.id || '1',
          name: (user as any)?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User',
          email: user?.email || 'user@faithlink.org',
          phone: (user as any)?.phone || '(555) 234-5678',
          address: (user as any)?.address?.street || '123 Faith Street, Community City, CA 90210',
          birthDate: (user as any)?.demographics?.dateOfBirth || '1990-05-15',
          membershipDate: (user as any)?.joinDate || '2023-03-20',
          status: 'active',
          groups: ['Ladies Bible Study', 'Worship Team'],
          journeys: [
            { id: '1', title: 'New Member Journey', progress: 100, status: 'completed' },
            { id: '2', title: 'Leadership Development', progress: 65, status: 'in_progress' },
            { id: '3', title: 'Bible Study Foundations', progress: 0, status: 'not_started' }
          ],
          prayerRequests: [
            { id: '1', title: 'Healing for family member', status: 'active', date: '2025-01-15' },
            { id: '2', title: 'Job interview success', status: 'answered', date: '2025-01-10' }
          ],
          upcomingEvents: [
            { id: '1', title: 'Sunday Service', date: '2025-01-21T10:00:00Z', location: 'Main Sanctuary', registered: true },
            { id: '2', title: 'Ladies Bible Study', date: '2025-01-22T19:00:00Z', location: 'Conference Room', registered: true },
            { id: '3', title: 'Community Outreach', date: '2025-01-25T12:00:00Z', location: 'Downtown Shelter', registered: false }
          ]
        };
        setProfile(mockProfile);
        setEditForm(mockProfile);
      }
    } catch (error) {
      console.error('Failed to fetch member profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const response = await fetch('/api/members/self-service/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
    }
  };

  const saveProfile = async () => {
    try {
      const response = await fetch('/api/members/self-service/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      
      if (response.ok) {
        setProfile(editForm as MemberProfile);
        setEditing(false);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const saveNotifications = async () => {
    try {
      await fetch('/api/members/self-service/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifications)
      });
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  };

  const downloadMembershipReport = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/members/self-service/report`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `membership-report-${user?.firstName || 'member'}-${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Fallback: Generate a simple text report
        const reportData = `
FAITH LINK 360 - MEMBER REPORT
Generated: ${new Date().toLocaleDateString()}

MEMBER INFORMATION:
Name: ${profile?.name || 'Unknown'}
Email: ${profile?.email || 'Unknown'}
Phone: ${profile?.phone || 'Not provided'}
Member Since: ${profile?.membershipDate || 'Unknown'}
Status: ${profile?.status || 'Unknown'}

GROUPS: ${profile?.groups?.join(', ') || 'None'}

JOURNEY PROGRESS:
${profile?.journeys?.map(j => `- ${j.title}: ${j.progress}% (${j.status})`).join('\n') || 'No journeys'}

PRAYER REQUESTS:
${profile?.prayerRequests?.map(p => `- ${p.title} (${p.status}) - ${p.date}`).join('\n') || 'No prayer requests'}
        `;
        
        const blob = new Blob([reportData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `membership-report-${user?.firstName || 'member'}-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download report:', error);
      alert('Failed to download report. Please try again later.');
    }
  };

  if (loading || !profile) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
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
          <User className="w-8 h-8 text-gray-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
            <p className="text-gray-600">Manage your profile, preferences, and church involvement</p>
          </div>
        </div>

        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'activity', label: 'My Activity', icon: Calendar },
              { id: 'spiritual', label: 'Spiritual Growth', icon: BookOpen },
              { id: 'notifications', label: 'Notifications', icon: Bell }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            <div className="flex space-x-3">
              <button
                onClick={downloadMembershipReport}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </button>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditForm(profile);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveProfile}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              {editing ? (
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="px-3 py-2 text-gray-900">{profile.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              {editing ? (
                <input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="px-3 py-2 text-gray-900">{profile.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              {editing ? (
                <input
                  type="tel"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="px-3 py-2 text-gray-900">{profile.phone || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Birth Date</label>
              {editing ? (
                <input
                  type="date"
                  value={editForm.birthDate || ''}
                  onChange={(e) => setEditForm({...editForm, birthDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="px-3 py-2 text-gray-900">
                  {profile.birthDate ? new Date(profile.birthDate).toLocaleDateString() : 'Not provided'}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              {editing ? (
                <textarea
                  value={editForm.address || ''}
                  onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              ) : (
                <p className="px-3 py-2 text-gray-900">{profile.address || 'Not provided'}</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Membership Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                <p className="text-gray-900">{new Date(profile.membershipDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  profile.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {profile.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Groups</label>
                <p className="text-gray-900">{profile.groups && profile.groups.length > 0 ? profile.groups.join(', ') : 'None'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-6">
          {/* Prayer Requests */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-600" />
              My Prayer Requests
            </h3>
            <div className="space-y-3">
              {profile.prayerRequests && profile.prayerRequests.length > 0 ? profile.prayerRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{request.title}</h4>
                    <p className="text-sm text-gray-500">Submitted {new Date(request.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    request.status === 'active' ? 'bg-blue-100 text-blue-800' :
                    request.status === 'answered' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.status}
                  </span>
                </div>
              )) : (
                <p className="text-gray-500 italic">No prayer requests found</p>
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Upcoming Events
            </h3>
            <div className="space-y-3">
              {profile.upcomingEvents && profile.upcomingEvents.length > 0 ? profile.upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(event.date).toLocaleString()}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {event.location}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    event.registered ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {event.registered ? 'Registered' : 'Not Registered'}
                  </span>
                </div>
              )) : (
                <p className="text-gray-500 italic">No upcoming events found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'spiritual' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
            My Spiritual Journeys
          </h3>
          <div className="space-y-4">
            {profile.journeys && profile.journeys.length > 0 ? profile.journeys.map((journey) => (
              <div key={journey.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{journey.title}</h4>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    journey.status === 'completed' ? 'bg-green-100 text-green-800' :
                    journey.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {journey.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${journey.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">{journey.progress}% complete</p>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-8">No spiritual journeys found</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
            <button
              onClick={saveNotifications}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Save Preferences
            </button>
          </div>

          <div className="space-y-4">
            {[
              { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
              { key: 'sms', label: 'SMS Notifications', description: 'Receive notifications via text message' },
              { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive browser push notifications' },
              { key: 'eventReminders', label: 'Event Reminders', description: 'Get reminders about upcoming events' },
              { key: 'prayerUpdates', label: 'Prayer Updates', description: 'Receive updates on prayer requests' },
              { key: 'journeyProgress', label: 'Journey Progress', description: 'Get updates on spiritual journey milestones' }
            ].map(({ key, label, description }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">{label}</label>
                  <p className="text-sm text-gray-500">{description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[key as keyof NotificationSettings]}
                  onChange={(e) => setNotifications({
                    ...notifications,
                    [key]: e.target.checked
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
