'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, Save } from 'lucide-react';

interface PrivacySettingsProps {
  memberId: string;
}

export default function PrivacySettings({ memberId }: PrivacySettingsProps) {
  const [privacy, setPrivacy] = useState({
    showEmail: true,
    showPhone: false,
    showAddress: false,
    showBirthday: true,
    profileVisibility: 'members'
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchPrivacy();
  }, [memberId]);

  const fetchPrivacy = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/members/${memberId}/privacy`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.privacy) {
        setPrivacy(data.privacy);
      }
    } catch (error) {
      console.error('Error fetching privacy:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${API_URL}/api/members/${memberId}/privacy`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(privacy)
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving privacy:', error);
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-medium text-gray-900 text-sm">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
        <Shield className="w-5 h-5 mr-2 text-green-600" />
        Privacy Settings
      </h3>

      <div className="divide-y divide-gray-100">
        <Toggle label="Show Email" description="Allow other members to see your email" checked={privacy.showEmail} onChange={(v) => setPrivacy(p => ({ ...p, showEmail: v }))} />
        <Toggle label="Show Phone" description="Allow other members to see your phone number" checked={privacy.showPhone} onChange={(v) => setPrivacy(p => ({ ...p, showPhone: v }))} />
        <Toggle label="Show Address" description="Allow other members to see your address" checked={privacy.showAddress} onChange={(v) => setPrivacy(p => ({ ...p, showAddress: v }))} />
        <Toggle label="Show Birthday" description="Allow other members to see your birthday" checked={privacy.showBirthday} onChange={(v) => setPrivacy(p => ({ ...p, showBirthday: v }))} />
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
        <select
          value={privacy.profileVisibility}
          onChange={(e) => setPrivacy(p => ({ ...p, profileVisibility: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="public">Public - Anyone can view</option>
          <option value="members">Members Only - Church members can view</option>
          <option value="leaders">Leaders Only - Only leaders and pastors</option>
          <option value="private">Private - Only you and admins</option>
        </select>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        <Save className="w-4 h-4 mr-2" />
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Privacy Settings'}
      </button>
    </div>
  );
}
