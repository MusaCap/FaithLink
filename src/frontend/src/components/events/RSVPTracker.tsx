'use client';

import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Search, Filter, Download, UserCheck, UserX, Clock } from 'lucide-react';

interface RSVP {
  id: string;
  memberName: string;
  email: string;
  phone?: string;
  attendeeCount: number;
  status: 'confirmed' | 'tentative' | 'declined' | 'no-response';
  registrationDate: string;
  specialRequests?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

interface RSVPTrackerProps {
  eventId: string;
  eventTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function RSVPTracker({ eventId, eventTitle, isOpen, onClose }: RSVPTrackerProps) {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (isOpen) {
      fetchRSVPs();
    }
  }, [isOpen, eventId]);

  const fetchRSVPs = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/rsvps`);
      if (response.ok) {
        const data = await response.json();
        setRsvps(data.rsvps);
      } else {
        // Mock data fallback
        setRsvps([
          {
            id: '1', memberName: 'Sarah Johnson', email: 'sarah@faithlink.org', phone: '(555) 234-5678',
            attendeeCount: 2, status: 'confirmed', registrationDate: '2025-01-15T10:30:00Z',
            specialRequests: 'Vegetarian meal', emergencyContact: 'Mike Johnson', emergencyPhone: '(555) 234-5679'
          },
          {
            id: '2', memberName: 'Michael Chen', email: 'michael@faithlink.org', phone: '(555) 345-6789',
            attendeeCount: 1, status: 'confirmed', registrationDate: '2025-01-16T14:20:00Z'
          },
          {
            id: '3', memberName: 'Emily Rodriguez', email: 'emily@faithlink.org',
            attendeeCount: 3, status: 'tentative', registrationDate: '2025-01-17T09:15:00Z',
            specialRequests: 'Wheelchair accessible seating'
          },
          {
            id: '4', memberName: 'Robert Wilson', email: 'robert@faithlink.org', phone: '(555) 456-7890',
            attendeeCount: 1, status: 'declined', registrationDate: '2025-01-18T16:45:00Z'
          },
          {
            id: '5', memberName: 'Maria Santos', email: 'maria@faithlink.org',
            attendeeCount: 2, status: 'no-response', registrationDate: '2025-01-19T11:00:00Z'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch RSVPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRSVPStatus = async (rsvpId: string, newStatus: RSVP['status']) => {
    try {
      const response = await fetch(`/api/events/${eventId}/rsvps/${rsvpId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setRsvps(prev => prev.map(rsvp => 
          rsvp.id === rsvpId ? { ...rsvp, status: newStatus } : rsvp
        ));
      }
    } catch (error) {
      console.error('Failed to update RSVP status:', error);
    }
  };

  const exportRSVPs = () => {
    const csvContent = [
      'Name,Email,Phone,Attendees,Status,Registration Date,Special Requests,Emergency Contact,Emergency Phone',
      ...filteredRsvps.map(rsvp => [
        rsvp.memberName,
        rsvp.email,
        rsvp.phone || '',
        rsvp.attendeeCount,
        rsvp.status,
        new Date(rsvp.registrationDate).toLocaleDateString(),
        rsvp.specialRequests || '',
        rsvp.emergencyContact || '',
        rsvp.emergencyPhone || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventTitle.replace(/\s+/g, '_')}_RSVPs.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredRsvps = rsvps.filter(rsvp => {
    const matchesSearch = rsvp.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rsvp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rsvp.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'tentative': return 'bg-yellow-100 text-yellow-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'no-response': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <UserCheck className="w-4 h-4" />;
      case 'tentative': return <Clock className="w-4 h-4" />;
      case 'declined': return <UserX className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const statusCounts = {
    confirmed: rsvps.filter(r => r.status === 'confirmed').length,
    tentative: rsvps.filter(r => r.status === 'tentative').length,
    declined: rsvps.filter(r => r.status === 'declined').length,
    noResponse: rsvps.filter(r => r.status === 'no-response').length
  };

  const totalAttendees = rsvps
    .filter(r => r.status === 'confirmed')
    .reduce((sum, r) => sum + r.attendeeCount, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">RSVP Tracker</h2>
              <p className="text-sm text-gray-600">{eventTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{statusCounts.confirmed}</div>
              <div className="text-sm text-green-700">Confirmed</div>
              <div className="text-xs text-green-600">{totalAttendees} attendees</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.tentative}</div>
              <div className="text-sm text-yellow-700">Tentative</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{statusCounts.declined}</div>
              <div className="text-sm text-red-700">Declined</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{statusCounts.noResponse}</div>
              <div className="text-sm text-gray-700">No Response</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{rsvps.length}</div>
              <div className="text-sm text-blue-700">Total RSVPs</div>
            </div>
          </div>

          {/* Filters and Export */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search RSVPs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="tentative">Tentative</option>
              <option value="declined">Declined</option>
              <option value="no-response">No Response</option>
            </select>

            <button
              onClick={exportRSVPs}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>

          {/* RSVP List */}
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendees</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRsvps.map((rsvp) => (
                    <tr key={rsvp.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{rsvp.memberName}</div>
                          {rsvp.specialRequests && (
                            <div className="text-xs text-gray-500">Special: {rsvp.specialRequests}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {rsvp.email}
                        </div>
                        {rsvp.phone && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {rsvp.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rsvp.attendeeCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rsvp.status)}`}>
                          {getStatusIcon(rsvp.status)}
                          <span className="ml-1">{rsvp.status.replace('-', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(rsvp.registrationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={rsvp.status}
                          onChange={(e) => updateRSVPStatus(rsvp.id, e.target.value as RSVP['status'])}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="tentative">Tentative</option>
                          <option value="declined">Declined</option>
                          <option value="no-response">No Response</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredRsvps.length === 0 && (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No RSVPs found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'No one has registered for this event yet.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
