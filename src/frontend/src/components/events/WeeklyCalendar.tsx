'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type?: string;
}

export default function WeeklyCalendar() {
  const [weekStart, setWeekStart] = useState<Date>(getWeekStart(new Date()));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function getWeekStart(d: Date): Date {
    const date = new Date(d);
    date.setDate(date.getDate() - date.getDay());
    date.setHours(0, 0, 0, 0);
    return date;
  }

  useEffect(() => {
    fetchWeekEvents();
  }, [weekStart]);

  const fetchWeekEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/events/calendar/weekly?startDate=${weekStart.toISOString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching weekly events:', error);
    } finally {
      setLoading(false);
    }
  };

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const today = () => setWeekStart(getWeekStart(new Date()));

  const getEventsForDay = (dayIndex: number): CalendarEvent[] => {
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + dayIndex);
    const dayStr = dayDate.toISOString().split('T')[0];
    return events.filter(e => {
      const eventDate = new Date(e.date).toISOString().split('T')[0];
      return eventDate === dayStr;
    });
  };

  const formatDateRange = () => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${weekStart.toLocaleDateString('en-US', opts)} - ${end.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
  };

  const isToday = (dayIndex: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + dayIndex);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  };

  const typeColors: Record<string, string> = {
    worship: 'bg-purple-100 text-purple-800 border-purple-200',
    study: 'bg-blue-100 text-blue-800 border-blue-200',
    fellowship: 'bg-green-100 text-green-800 border-green-200',
    service: 'bg-orange-100 text-orange-800 border-orange-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
          Weekly Calendar
        </h3>
        <div className="flex items-center space-x-2">
          <button onClick={prevWeek} className="p-1.5 rounded-md hover:bg-gray-100">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={today} className="px-3 py-1 text-sm font-medium bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100">
            Today
          </button>
          <button onClick={nextWeek} className="p-1.5 rounded-md hover:bg-gray-100">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 py-2 text-center text-sm font-medium text-gray-600">
        {formatDateRange()}
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {days.map((day, i) => {
            const dayDate = new Date(weekStart);
            dayDate.setDate(weekStart.getDate() + i);
            const dayEvents = getEventsForDay(i);
            return (
              <div key={day} className={`bg-white min-h-[120px] ${isToday(i) ? 'ring-2 ring-blue-500 ring-inset' : ''}`}>
                <div className={`text-center py-2 text-xs font-semibold ${isToday(i) ? 'text-blue-700 bg-blue-50' : 'text-gray-500'}`}>
                  {day}
                  <div className={`text-lg font-bold ${isToday(i) ? 'text-blue-700' : 'text-gray-900'}`}>
                    {dayDate.getDate()}
                  </div>
                </div>
                <div className="px-1 pb-2 space-y-1">
                  {dayEvents.map(evt => (
                    <div key={evt.id} className={`p-1.5 rounded text-xs border ${typeColors[evt.type || 'default'] || typeColors.default}`}>
                      <p className="font-medium truncate">{evt.title}</p>
                      {evt.startTime && (
                        <p className="flex items-center mt-0.5 opacity-75">
                          <Clock className="w-3 h-3 mr-0.5" />
                          {evt.startTime}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
