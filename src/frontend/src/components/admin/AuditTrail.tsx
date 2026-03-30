'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Clock, User, Filter } from 'lucide-react';

interface AuditEntry {
  id: string;
  type: string;
  description?: string;
  member?: { firstName: string; lastName: string };
  createdAt: string;
}

export default function AuditTrail() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => { fetchAuditTrail(); }, []);

  const fetchAuditTrail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/admin/audit-trail`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setEntries(data.auditTrail || []);
    } catch (error) {
      console.error('Error fetching audit trail:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-purple-600" />
          Activity Audit Trail
        </h3>
        <button onClick={fetchAuditTrail} className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
          <Filter className="w-4 h-4 inline mr-1" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading audit trail...</div>
      ) : entries.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No audit entries found</div>
      ) : (
        <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
          {entries.map(entry => (
            <div key={entry.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {entry.member ? `${entry.member.firstName} ${entry.member.lastName}` : 'System'}
                    </p>
                    <p className="text-sm text-gray-600">{entry.description || entry.type}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400 flex items-center whitespace-nowrap">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(entry.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
