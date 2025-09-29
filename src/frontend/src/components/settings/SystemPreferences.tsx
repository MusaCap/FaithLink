'use client';

import React, { useState, useEffect } from 'react';
import { Database, Bell, Shield, Globe, Save, RefreshCw, Mail, Server, Key } from 'lucide-react';

interface SystemSettings {
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    notificationFrequency: 'immediate' | 'daily' | 'weekly';
  };
  security: {
    requireTwoFactor: boolean;
    sessionTimeout: number;
    passwordPolicy: 'basic' | 'medium' | 'strict';
    allowGuestAccess: boolean;
  };
  integrations: {
    emailProvider: 'smtp' | 'sendgrid' | 'mailgun' | 'none';
    smtpConfig: {
      host: string;
      port: number;
      username: string;
      password: string;
      secure: boolean;
    };
    backupEnabled: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    logoUrl: string;
    customCss: string;
  };
}

export default function SystemPreferences() {
  const [settings, setSettings] = useState<SystemSettings>({
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      smsNotifications: false,
      notificationFrequency: 'daily'
    },
    security: {
      requireTwoFactor: false,
      sessionTimeout: 480,
      passwordPolicy: 'medium',
      allowGuestAccess: false
    },
    integrations: {
      emailProvider: 'smtp',
      smtpConfig: {
        host: '',
        port: 587,
        username: '',
        password: '',
        secure: true
      },
      backupEnabled: true,
      backupFrequency: 'weekly'
    },
    appearance: {
      theme: 'light',
      primaryColor: '#3B82F6',
      logoUrl: '',
      customCss: ''
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('notifications');

  useEffect(() => {
    fetchSystemSettings();
  }, []);

  const fetchSystemSettings = async () => {
    try {
      const response = await fetch('/api/settings/system');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch system settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings/system', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateNotifications = (updates: Partial<SystemSettings['notifications']>) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, ...updates }
    }));
  };

  const updateSecurity = (updates: Partial<SystemSettings['security']>) => {
    setSettings(prev => ({
      ...prev,
      security: { ...prev.security, ...updates }
    }));
  };

  const updateIntegrations = (updates: Partial<SystemSettings['integrations']>) => {
    setSettings(prev => ({
      ...prev,
      integrations: { ...prev.integrations, ...updates }
    }));
  };

  const updateSmtpConfig = (updates: Partial<SystemSettings['integrations']['smtpConfig']>) => {
    setSettings(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        smtpConfig: { ...prev.integrations.smtpConfig, ...updates }
      }
    }));
  };

  const updateAppearance = (updates: Partial<SystemSettings['appearance']>) => {
    setSettings(prev => ({
      ...prev,
      appearance: { ...prev.appearance, ...updates }
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">System Preferences</h2>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'integrations', label: 'Integrations', icon: Server },
            { id: 'appearance', label: 'Appearance', icon: Globe }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeSection === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) => updateNotifications({ emailNotifications: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                  <p className="text-sm text-gray-500">Receive browser push notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.pushNotifications}
                  onChange={(e) => updateNotifications({ pushNotifications: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
                  <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.smsNotifications}
                  onChange={(e) => updateNotifications({ smsNotifications: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notification Frequency</label>
                <select
                  value={settings.notifications.notificationFrequency}
                  onChange={(e) => updateNotifications({ notificationFrequency: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="immediate">Immediate</option>
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Summary</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'security' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Require Two-Factor Authentication</label>
                  <p className="text-sm text-gray-500">Require 2FA for all admin and pastor accounts</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.security.requireTwoFactor}
                  onChange={(e) => updateSecurity({ requireTwoFactor: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Allow Guest Access</label>
                  <p className="text-sm text-gray-500">Allow visitors to view public content</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.security.allowGuestAccess}
                  onChange={(e) => updateSecurity({ allowGuestAccess: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => updateSecurity({ sessionTimeout: parseInt(e.target.value) })}
                  min="30"
                  max="1440"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password Policy</label>
                <select
                  value={settings.security.passwordPolicy}
                  onChange={(e) => updateSecurity({ passwordPolicy: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="basic">Basic (8+ characters)</option>
                  <option value="medium">Medium (8+ chars, numbers, symbols)</option>
                  <option value="strict">Strict (12+ chars, mixed case, numbers, symbols)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'integrations' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Integration Settings</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Provider</label>
                <select
                  value={settings.integrations.emailProvider}
                  onChange={(e) => updateIntegrations({ emailProvider: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="none">None</option>
                  <option value="smtp">SMTP</option>
                  <option value="sendgrid">SendGrid</option>
                  <option value="mailgun">Mailgun</option>
                </select>
              </div>

              {settings.integrations.emailProvider === 'smtp' && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    SMTP Configuration
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                      <input
                        type="text"
                        value={settings.integrations.smtpConfig.host}
                        onChange={(e) => updateSmtpConfig({ host: e.target.value })}
                        placeholder="smtp.gmail.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                      <input
                        type="number"
                        value={settings.integrations.smtpConfig.port}
                        onChange={(e) => updateSmtpConfig({ port: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        value={settings.integrations.smtpConfig.username}
                        onChange={(e) => updateSmtpConfig({ username: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input
                        type="password"
                        value={settings.integrations.smtpConfig.password}
                        onChange={(e) => updateSmtpConfig({ password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="secure"
                      checked={settings.integrations.smtpConfig.secure}
                      onChange={(e) => updateSmtpConfig({ secure: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                    />
                    <label htmlFor="secure" className="text-sm text-gray-700">Use secure connection (TLS/SSL)</label>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Automatic Backups</label>
                  <p className="text-sm text-gray-500">Enable automatic data backups</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.integrations.backupEnabled}
                  onChange={(e) => updateIntegrations({ backupEnabled: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              {settings.integrations.backupEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                  <select
                    value={settings.integrations.backupFrequency}
                    onChange={(e) => updateIntegrations({ backupFrequency: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'appearance' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Appearance Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <select
                  value={settings.appearance.theme}
                  onChange={(e) => updateAppearance({ theme: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={settings.appearance.primaryColor}
                    onChange={(e) => updateAppearance({ primaryColor: e.target.value })}
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.appearance.primaryColor}
                    onChange={(e) => updateAppearance({ primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Church Logo URL</label>
                <input
                  type="url"
                  value={settings.appearance.logoUrl}
                  onChange={(e) => updateAppearance({ logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom CSS</label>
                <textarea
                  value={settings.appearance.customCss}
                  onChange={(e) => updateAppearance({ customCss: e.target.value })}
                  placeholder="/* Add custom CSS styles here */"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
