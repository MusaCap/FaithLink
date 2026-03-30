'use client';

import React, { useState } from 'react';
import { BarChart3, Filter, Download, Play } from 'lucide-react';

interface ReportResult {
  id: string;
  filters: Record<string, string>;
  resultCount: number;
  data: any[];
  generatedAt: string;
}

export default function CustomReportBuilder() {
  const [filters, setFilters] = useState({ membershipStatus: '', gender: '', spiritualStatus: '' });
  const [result, setResult] = useState<ReportResult | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const runReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const cleanFilters: Record<string, string> = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) cleanFilters[k] = v; });
      const res = await fetch(`${API_URL}/api/reports/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ filters: cleanFilters, metrics: ['count'] })
      });
      const data = await res.json();
      if (data.success) setResult(data.report);
    } catch (error) {
      console.error('Error running report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportPdf = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/reports/export/pdf?type=members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
          Custom Report Builder
        </h3>
        <button onClick={exportPdf} className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center">
          <Download className="w-4 h-4 mr-1" /> Export
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Membership Status</label>
            <select value={filters.membershipStatus} onChange={e => setFilters(p => ({ ...p, membershipStatus: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="visitor">Visitor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select value={filters.gender} onChange={e => setFilters(p => ({ ...p, gender: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Spiritual Status</label>
            <select value={filters.spiritualStatus} onChange={e => setFilters(p => ({ ...p, spiritualStatus: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">All</option>
              <option value="new_believer">New Believer</option>
              <option value="growing">Growing</option>
              <option value="mature">Mature</option>
              <option value="seeking">Seeking</option>
              <option value="leader">Leader</option>
            </select>
          </div>
        </div>

        <button onClick={runReport} disabled={loading} className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          <Play className="w-4 h-4 mr-2" /> {loading ? 'Running...' : 'Run Report'}
        </button>

        {result && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-900">{result.resultCount} results found</p>
              <p className="text-xs text-gray-500">Generated: {new Date(result.generatedAt).toLocaleString()}</p>
            </div>
            {result.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">Name</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">Email</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">Status</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">Gender</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">Spiritual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {result.data.map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{row.firstName} {row.lastName}</td>
                        <td className="px-4 py-2 text-gray-600">{row.email}</td>
                        <td className="px-4 py-2"><span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">{row.membershipStatus}</span></td>
                        <td className="px-4 py-2 capitalize">{row.gender || '-'}</td>
                        <td className="px-4 py-2 capitalize">{row.spiritualStatus || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No matching records</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
