'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Plus, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

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

export default function ChurchCalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'calendar' | 'list'>('calendar');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '', description: '', startDateTime: '', endDateTime: '',
    location: '', eventType: 'general', maxAttendees: '', isRecurring: false
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/events`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data.events || data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title) return;
    setCreating(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/events`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEvent,
          maxAttendees: newEvent.maxAttendees ? parseInt(newEvent.maxAttendees) : null
        })
      });
      if (!response.ok) throw new Error('Failed to create event');
      setNewEvent({ title: '', description: '', startDateTime: '', endDateTime: '', location: '', eventType: 'general', maxAttendees: '', isRecurring: false });
      setShowCreateForm(false);
      await fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  const today = new Date();

  const getEventsForDate = (day: number) => {
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return events.filter(event => {
      const eventDate = new Date(event.startDateTime);
      return eventDate.getFullYear() === dateStr.getFullYear() &&
             eventDate.getMonth() === dateStr.getMonth() &&
             eventDate.getDate() === dateStr.getDate();
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'worship': return 'bg-purple-500';
      case 'fellowship': return 'bg-blue-500';
      case 'education': return 'bg-green-500';
      case 'prayer': return 'bg-yellow-500';
      case 'outreach': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-100 bg-gray-50"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day);
      const isToday = today.getDate() === day && today.getMonth() === currentMonth.getMonth() && today.getFullYear() === currentMonth.getFullYear();
      const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentMonth.getMonth();

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
          className={`h-24 border border-gray-200 p-1 cursor-pointer hover:bg-blue-50 transition-colors overflow-hidden ${isToday ? 'bg-blue-50 border-blue-300' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        >
          <div className={`text-xs font-medium mb-1 ${isToday ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
            {day}
          </div>
          <div className="space-y-0.5">
            {dayEvents.slice(0, 3).map((event) => (
              <div key={event.id} className={`text-xs text-white px-1 py-0.5 rounded truncate ${getEventTypeColor(event.eventType)}`}>
                {formatTime(event.startDateTime)} {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500 px-1">+{dayEvents.length - 3} more</div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="grid grid-cols-7 gap-0">
          {dayNames.map(name => (
            <div key={name} className="h-8 flex items-center justify-center text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200">
              {name}
            </div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  const selectedDateEvents = selectedDate ? events.filter(event => {
    const eventDate = new Date(event.startDateTime);
    return eventDate.getFullYear() === selectedDate.getFullYear() &&
           eventDate.getMonth() === selectedDate.getMonth() &&
           eventDate.getDate() === selectedDate.getDate();
  }) : [];

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
              <h1 className="text-2xl font-bold text-neutral-900">Church Calendar</h1>
              <p className="text-sm text-neutral-600 mt-1">View and manage church events and activities</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveView('calendar')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeView === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                >
                  Calendar
                </button>
                <button
                  onClick={() => setActiveView('list')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeView === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                >
                  List
                </button>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </button>
            </div>
          </div>

          {/* Calendar View */}
          {activeView === 'calendar' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Month Navigation */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                  {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              {/* Calendar Grid */}
              <div className="p-4">
                {renderCalendar()}
              </div>
              {/* Event Type Legend */}
              <div className="px-4 pb-4 flex flex-wrap gap-3 text-xs">
                <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-purple-500 mr-1"></span>Worship</span>
                <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>Fellowship</span>
                <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-1"></span>Education</span>
                <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>Prayer</span>
                <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-orange-500 mr-1"></span>Outreach</span>
                <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-gray-500 mr-1"></span>General</span>
              </div>
              {/* Selected Date Events */}
              {selectedDate && (
                <div className="border-t border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Events for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  {selectedDateEvents.length === 0 ? (
                    <p className="text-sm text-gray-500">No events on this date</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDateEvents.map(event => (
                        <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`w-3 h-3 rounded-full mt-1 ${getEventTypeColor(event.eventType)}`}></div>
                          <div>
                            <div className="font-medium text-gray-900">{event.title}</div>
                            <div className="text-sm text-gray-600">{formatTime(event.startDateTime)} - {event.location}</div>
                            <div className="text-xs text-gray-500 mt-1">{event.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* List View */}
          {activeView === 'list' && (
            <div>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="space-y-4">
                {events
                  .filter(e => !searchTerm || e.title.toLowerCase().includes(searchTerm.toLowerCase()) || e.description.toLowerCase().includes(searchTerm.toLowerCase()))
                  .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())
                  .map((event) => (
                    <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`w-3 h-3 rounded-full mt-1.5 ${getEventTypeColor(event.eventType)}`}></div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{event.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{formatDateTime(event.startDateTime)}</span>
                              <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{event.location}</span>
                              <span className="flex items-center"><Users className="w-4 h-4 mr-1" />{event.currentAttendees}{event.maxAttendees ? ` / ${event.maxAttendees}` : ''}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : event.status === 'ongoing' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                  ))}
                {events.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-neutral-400" />
                    <h3 className="mt-2 text-sm font-medium text-neutral-900">No events yet</h3>
                    <p className="mt-1 text-sm text-neutral-500">Create your first event to get started.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Create Event Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Create New Event</h2>
                  <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                    <input type="text" required value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      placeholder="e.g., Sunday Worship Service" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      placeholder="Event details..." rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
                      <input type="datetime-local" value={newEvent.startDateTime} onChange={(e) => setNewEvent({...newEvent, startDateTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
                      <input type="datetime-local" value={newEvent.endDateTime} onChange={(e) => setNewEvent({...newEvent, endDateTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input type="text" value={newEvent.location} onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                        placeholder="e.g., Main Sanctuary" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                      <select value={newEvent.eventType} onChange={(e) => setNewEvent({...newEvent, eventType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="general">General</option>
                        <option value="worship">Worship</option>
                        <option value="fellowship">Fellowship</option>
                        <option value="education">Education</option>
                        <option value="prayer">Prayer</option>
                        <option value="outreach">Outreach</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Attendees</label>
                      <input type="number" value={newEvent.maxAttendees} onChange={(e) => setNewEvent({...newEvent, maxAttendees: e.target.value})}
                        placeholder="Leave blank for unlimited" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" checked={newEvent.isRecurring} onChange={(e) => setNewEvent({...newEvent, isRecurring: e.target.checked})}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                        <span className="text-sm text-gray-700">Recurring event</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button type="button" onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={creating}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                      {creating ? 'Creating...' : 'Create Event'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
