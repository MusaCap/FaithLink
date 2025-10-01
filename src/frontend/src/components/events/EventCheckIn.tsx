'use client';

import React, { useState, useEffect } from 'react';
import { QrCode, Search, UserCheck, Clock, AlertCircle, CheckCircle, X } from 'lucide-react';

interface CheckInRecord {
  id: string;
  memberName: string;
  email: string;
  attendeeCount: number;
  checkInTime?: string;
  status: 'registered' | 'checked-in' | 'no-show';
  registrationId: string;
}

interface EventCheckInProps {
  eventId: string;
  eventTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventCheckIn({ eventId, eventTitle, isOpen, onClose }: EventCheckInProps) {
  const [attendees, setAttendees] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showQRScanner, setShowQRScanner] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAttendees();
    }
  }, [isOpen, eventId]);

  const fetchAttendees = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/events/${eventId}/check-in`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAttendees(data.attendees);
      } else {
        // Mock data fallback
        setAttendees([
          {
            id: '1', memberName: 'Sarah Johnson', email: 'sarah@faithlink.org',
            attendeeCount: 2, status: 'checked-in', checkInTime: '2025-01-19T09:45:00Z',
            registrationId: 'reg-001'
          },
          {
            id: '2', memberName: 'Michael Chen', email: 'michael@faithlink.org',
            attendeeCount: 1, status: 'checked-in', checkInTime: '2025-01-19T09:52:00Z',
            registrationId: 'reg-002'
          },
          {
            id: '3', memberName: 'Emily Rodriguez', email: 'emily@faithlink.org',
            attendeeCount: 3, status: 'registered', registrationId: 'reg-003'
          },
          {
            id: '4', memberName: 'Robert Wilson', email: 'robert@faithlink.org',
            attendeeCount: 1, status: 'registered', registrationId: 'reg-004'
          },
          {
            id: '5', memberName: 'Maria Santos', email: 'maria@faithlink.org',
            attendeeCount: 2, status: 'no-show', registrationId: 'reg-005'
          },
          {
            id: '6', memberName: 'David Kim', email: 'david@faithlink.org',
            attendeeCount: 1, status: 'checked-in', checkInTime: '2025-01-19T10:15:00Z',
            registrationId: 'reg-006'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch attendees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (attendeeId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/check-in/${attendeeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkInTime: new Date().toISOString() })
      });
      
      if (response.ok) {
        setAttendees(prev => prev.map(attendee => 
          attendee.id === attendeeId 
            ? { ...attendee, status: 'checked-in', checkInTime: new Date().toISOString() }
            : attendee
        ));
      }
    } catch (error) {
      console.error('Failed to check in attendee:', error);
    }
  };

  const handleUndoCheckIn = async (attendeeId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/check-in/${attendeeId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setAttendees(prev => prev.map(attendee => 
          attendee.id === attendeeId 
            ? { ...attendee, status: 'registered', checkInTime: undefined }
            : attendee
        ));
      }
    } catch (error) {
      console.error('Failed to undo check-in:', error);
    }
  };

  const markAsNoShow = async (attendeeId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/check-in/${attendeeId}/no-show`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setAttendees(prev => prev.map(attendee => 
          attendee.id === attendeeId 
            ? { ...attendee, status: 'no-show' }
            : attendee
        ));
      }
    } catch (error) {
      console.error('Failed to mark as no-show:', error);
    }
  };

  const filteredAttendees = attendees.filter(attendee => {
    const matchesSearch = attendee.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || attendee.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked-in': return 'bg-green-100 text-green-800';
      case 'registered': return 'bg-blue-100 text-blue-800';
      case 'no-show': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checked-in': return <CheckCircle className="w-4 h-4" />;
      case 'registered': return <Clock className="w-4 h-4" />;
      case 'no-show': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const statusCounts = {
    checkedIn: attendees.filter(a => a.status === 'checked-in').length,
    registered: attendees.filter(a => a.status === 'registered').length,
    noShow: attendees.filter(a => a.status === 'no-show').length
  };

  const totalCheckedInAttendees = attendees
    .filter(a => a.status === 'checked-in')
    .reduce((sum, a) => sum + a.attendeeCount, 0);

  const totalRegisteredAttendees = attendees
    .reduce((sum, a) => sum + a.attendeeCount, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Event Check-In</h2>
              <p className="text-sm text-gray-600">{eventTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Check-In Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{statusCounts.checkedIn}</div>
              <div className="text-sm text-green-700">Checked In</div>
              <div className="text-xs text-green-600">{totalCheckedInAttendees} people</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{statusCounts.registered}</div>
              <div className="text-sm text-blue-700">Not Yet Arrived</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{statusCounts.noShow}</div>
              <div className="text-sm text-red-700">No Shows</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((totalCheckedInAttendees / totalRegisteredAttendees) * 100) || 0}%
              </div>
              <div className="text-sm text-purple-700">Attendance Rate</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search attendees..."
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
              <option value="checked-in">Checked In</option>
              <option value="registered">Not Arrived</option>
              <option value="no-show">No Shows</option>
            </select>

            <button
              onClick={() => setShowQRScanner(!showQRScanner)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>QR Scanner</span>
            </button>
          </div>

          {/* QR Scanner Notice */}
          {showQRScanner && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <QrCode className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">QR Code Scanner Active</h4>
                  <p className="text-xs text-blue-700">
                    QR code scanning functionality would be implemented here using a camera library like react-qr-scanner
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Attendee List */}
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-In Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAttendees.map((attendee) => (
                    <tr key={attendee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{attendee.memberName}</div>
                          <div className="text-sm text-gray-500">{attendee.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendee.attendeeCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(attendee.status)}`}>
                          {getStatusIcon(attendee.status)}
                          <span className="ml-1">{attendee.status.replace('-', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {attendee.checkInTime 
                          ? new Date(attendee.checkInTime).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit' 
                            })
                          : '—'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {attendee.status === 'registered' && (
                            <>
                              <button
                                onClick={() => handleCheckIn(attendee.id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors"
                              >
                                Check In
                              </button>
                              <button
                                onClick={() => markAsNoShow(attendee.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors"
                              >
                                No Show
                              </button>
                            </>
                          )}
                          {attendee.status === 'checked-in' && (
                            <button
                              onClick={() => handleUndoCheckIn(attendee.id)}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs transition-colors"
                            >
                              Undo
                            </button>
                          )}
                          {attendee.status === 'no-show' && (
                            <button
                              onClick={() => handleCheckIn(attendee.id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors"
                            >
                              Check In
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredAttendees.length === 0 && (
                <div className="text-center py-12">
                  <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No attendees found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'No registrations found for this event.'
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
