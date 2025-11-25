'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter,
  Clock,
  MapPin,
  Users,
  Edit,
  Trash2
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  type: 'service' | 'meeting' | 'event' | 'visit';
  attendees?: number;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [viewType, setViewType] = useState<'month' | 'week' | 'day'>('month');

  // Sample events data
  useEffect(() => {
    const sampleEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Sunday Worship Service',
        date: '2024-11-24',
        time: '10:00 AM',
        location: 'Main Sanctuary',
        type: 'service',
        attendees: 150
      },
      {
        id: '2',
        title: 'Elder Meeting',
        date: '2024-11-26',
        time: '7:00 PM',
        location: 'Conference Room',
        type: 'meeting',
        attendees: 8
      },
      {
        id: '3',
        title: 'Youth Group',
        date: '2024-11-27',
        time: '6:30 PM',
        location: 'Youth Hall',
        type: 'event',
        attendees: 25
      },
      {
        id: '4',
        title: 'Hospital Visit - John Smith',
        date: '2024-11-25',
        time: '2:00 PM',
        location: 'Springfield General Hospital',
        type: 'visit'
      }
    ];
    setEvents(sampleEvents);
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getEventsForDate = (date: string) => {
    return events.filter(event => event.date === date);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'service':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'meeting':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'event':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'visit':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const days = getDaysInMonth(currentDate);
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <ProtectedRoute allowedRoles={['pastor', 'admin', 'leader']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Church Calendar</h1>
              <p className="text-neutral-600">Manage events, meetings, and pastoral visits</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex rounded-lg border border-neutral-300 overflow-hidden">
                {(['month', 'week', 'day'] as const).map((view) => (
                  <button
                    key={view}
                    onClick={() => setViewType(view)}
                    className={`px-4 py-2 text-sm font-medium capitalize ${
                      viewType === view
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </button>
            </div>
          </div>

          {/* Calendar Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-900">{monthYear}</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-neutral-100 rounded-lg"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Today
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-neutral-100 rounded-lg"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-neutral-600">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => (
                  <div
                    key={index}
                    className={`min-h-[100px] p-2 border border-neutral-200 rounded-lg ${
                      day ? 'bg-white hover:bg-neutral-50 cursor-pointer' : 'bg-neutral-50'
                    }`}
                    onClick={() => day && setSelectedDate(day)}
                  >
                    {day && (
                      <>
                        <div className="text-sm font-medium text-neutral-900 mb-1">
                          {day.getDate()}
                        </div>
                        <div className="space-y-1">
                          {getEventsForDate(day.toISOString().split('T')[0]).map((event) => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded border ${getEventTypeColor(event.type)}`}
                            >
                              <div className="font-medium truncate">{event.title}</div>
                              <div className="truncate">{event.time}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
            <div className="p-6 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">Upcoming Events</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {events.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-start space-x-4 p-4 rounded-lg border border-neutral-200">
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      event.type === 'service' ? 'bg-blue-500' :
                      event.type === 'meeting' ? 'bg-purple-500' :
                      event.type === 'event' ? 'bg-green-500' : 'bg-orange-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-neutral-900">{event.title}</h4>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-neutral-600">
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(event.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {event.time}
                            </div>
                            {event.location && (
                              <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {event.location}
                              </div>
                            )}
                            {event.attendees && (
                              <div className="flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                {event.attendees}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-1 text-neutral-400 hover:text-neutral-600">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-neutral-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
