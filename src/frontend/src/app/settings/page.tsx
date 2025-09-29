'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Users, Globe, Shield, Bell, Database, Save, RefreshCw } from 'lucide-react';
import UserRoleManager from '../../components/settings/UserRoleManager';
import SystemPreferences from '../../components/settings/SystemPreferences';

interface ChurchSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  denomination: string;
  timezone: string;
  language: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('church');
  const [churchSettings, setChurchSettings] = useState<ChurchSettings>({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    denomination: '',
    timezone: 'America/Los_Angeles',
    language: 'en'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/church');
      if (response.ok) {
        const data = await response.json();
        setChurchSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveChurchSettings = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings/church', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(churchSettings)
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <Settings className="w-8 h-8 text-gray-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings & Administration</h1>
            <p className="text-gray-600">Manage church configuration, users, and system preferences</p>
          </div>
        </div>

        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('church')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'church'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Globe className="w-4 h-4 inline mr-2" />
              Church Info
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              User Management
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'system'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Database className="w-4 h-4 inline mr-2" />
              System
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'church' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Church Information</h2>
            <button
              onClick={saveChurchSettings}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Church Name</label>
              <input
                type="text"
                value={churchSettings.name}
                onChange={(e) => setChurchSettings({...churchSettings, name: e.target.value})}
                placeholder="FaithLink Community Church"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={churchSettings.email}
                onChange={(e) => setChurchSettings({...churchSettings, email: e.target.value})}
                placeholder="info@faithlinkcommunity.org"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={churchSettings.phone}
                onChange={(e) => setChurchSettings({...churchSettings, phone: e.target.value})}
                placeholder="(555) 123-4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                value={churchSettings.website}
                onChange={(e) => setChurchSettings({...churchSettings, website: e.target.value})}
                placeholder="https://faithlinkcommunity.org"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={churchSettings.address}
                onChange={(e) => setChurchSettings({...churchSettings, address: e.target.value})}
                placeholder="123 Faith Street, Community City, State 12345"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Denomination</label>
              <select
                value={churchSettings.denomination}
                onChange={(e) => setChurchSettings({...churchSettings, denomination: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select denomination...</option>
                <option value="Baptist">Baptist</option>
                <option value="Methodist">Methodist</option>
                <option value="Presbyterian">Presbyterian</option>
                <option value="Pentecostal">Pentecostal</option>
                <option value="Lutheran">Lutheran</option>
                <option value="Episcopal">Episcopal</option>
                <option value="Non-denominational">Non-denominational</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <select
                value={churchSettings.timezone}
                onChange={(e) => setChurchSettings({...churchSettings, timezone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/New_York">Eastern Time</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && <UserRoleManager />}
      {activeTab === 'system' && <SystemPreferences />}
    </div>
  );
}
