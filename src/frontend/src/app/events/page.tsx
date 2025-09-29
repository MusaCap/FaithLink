'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Users, Plus, Search, Filter, UserCheck, CheckCircle, QrCode } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import EventRegistrationModal from '../../components/events/EventRegistrationModal';
import RSVPTracker from '../../components/events/RSVPTracker';
import EventCheckIn from '../../components/events/EventCheckIn';

interface Event {
  id: string;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  eventType: string;
  maxAttendees?: number;
  currentAttendees: number;
  isRecurring: boolean;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showRSVPTracker, setShowRSVPTracker] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockEvents: Event[] = [
        {
          id: '1',
          title: 'Sunday Service',
          description: 'Weekly worship service with communion',
          startDateTime: '2024-01-07T10:00:00',
          endDateTime: '2024-01-07T11:30:00',
          location: 'Main Sanctuary',
          eventType: 'service',
          maxAttendees: 200,
          currentAttendees: 150,
          isRecurring: true,
          status: 'upcoming'
        },
        {
          id: '2',
          title: 'Youth Bible Study',
          description: 'Interactive Bible study for teens and young adults',
          startDateTime: '2024-01-10T19:00:00',
          endDateTime: '2024-01-10T20:30:00',
          location: 'Youth Center',
          eventType: 'bible_study',
          maxAttendees: 30,
          currentAttendees: 18,
          isRecurring: true,
          status: 'upcoming'
        },
        {
          id: '3',
          title: 'Community Outreach',
          description: 'Serving meals at local shelter',
          startDateTime: '2024-01-15T12:00:00',
          endDateTime: '2024-01-15T16:00:00',
          location: 'Downtown Shelter',
          eventType: 'outreach',
          maxAttendees: 25,
          currentAttendees: 12,
          isRecurring: false,
          status: 'upcoming'
        }
      ];
      setEvents(mockEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Events</h1>
              <p className="text-sm text-neutral-600 mt-1">
                Manage church events and activities
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                href="/events/new"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Events</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-neutral-900 truncate">
                      {event.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-neutral-600">
                      <Calendar className="w-4 h-4 mr-2 text-neutral-400" />
                      {formatDateTime(event.startDateTime)}
                    </div>
                    <div className="flex items-center text-sm text-neutral-600">
                      <MapPin className="w-4 h-4 mr-2 text-neutral-400" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-neutral-600">
                      <Users className="w-4 h-4 mr-2 text-neutral-400" />
                      {event.currentAttendees}
                      {event.maxAttendees && ` / ${event.maxAttendees}`} attendees
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowRegistration(true);
                      }}
                      className="flex-1 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 flex items-center justify-center space-x-1"
                    >
                      <UserCheck className="w-3 h-3" />
                      <span>Register</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowRSVPTracker(true);
                      }}
                      className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                    >
                      <Users className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowCheckIn(true);
                      }}
                      className="px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100"
                    >
                      <QrCode className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-neutral-400" />
              <h3 className="mt-2 text-sm font-medium text-neutral-900">No events found</h3>
              <p className="mt-1 text-sm text-neutral-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first event.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <div className="mt-6">
                  <Link
                    href="/events/new"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Event Registration Modal */}
          {selectedEvent && (
            <EventRegistrationModal
              event={selectedEvent}
              isOpen={showRegistration}
              onClose={() => {
                setShowRegistration(false);
                setSelectedEvent(null);
              }}
              onRegister={async (registration) => {
                try {
                  const response = await fetch(`/api/events/${selectedEvent.id}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(registration)
                  });
                  if (response.ok) {
                    await fetchEvents(); // Refresh events to update attendee count
                  }
                } catch (error) {
                  console.error('Registration failed:', error);
                }
              }}
            />
          )}

          {/* RSVP Tracker Modal */}
          {selectedEvent && (
            <RSVPTracker
              eventId={selectedEvent.id}
              eventTitle={selectedEvent.title}
              isOpen={showRSVPTracker}
              onClose={() => {
                setShowRSVPTracker(false);
                setSelectedEvent(null);
              }}
            />
          )}

          {/* Event Check-In Modal */}
          {selectedEvent && (
            <EventCheckIn
              eventId={selectedEvent.id}
              eventTitle={selectedEvent.title}
              isOpen={showCheckIn}
              onClose={() => {
                setShowCheckIn(false);
                setSelectedEvent(null);
              }}
            />
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
