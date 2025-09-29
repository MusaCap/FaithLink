'use client';

import React, { useState } from 'react';
import { X, User, Mail, Phone, Users, Calendar, MapPin, Clock } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  maxAttendees?: number;
  currentAttendees: number;
}

interface RegistrationForm {
  name: string;
  email: string;
  phone: string;
  attendeeCount: number;
  specialRequests: string;
  emergencyContact: string;
  emergencyPhone: string;
}

interface EventRegistrationModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onRegister: (registration: RegistrationForm) => Promise<void>;
}

export default function EventRegistrationModal({ event, isOpen, onClose, onRegister }: EventRegistrationModalProps) {
  const [form, setForm] = useState<RegistrationForm>({
    name: '',
    email: '',
    phone: '',
    attendeeCount: 1,
    specialRequests: '',
    emergencyContact: '',
    emergencyPhone: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<RegistrationForm>>({});

  const validateForm = () => {
    const newErrors: Partial<RegistrationForm> = {};
    
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!form.email.includes('@')) newErrors.email = 'Valid email is required';
    
    if (Number(form.attendeeCount) < 1) newErrors.attendeeCount = 'At least 1 attendee required';
    
    // Check if registration would exceed capacity
    if (event.maxAttendees && (event.currentAttendees + Number(form.attendeeCount)) > event.maxAttendees) {
      newErrors.attendeeCount = `Only ${event.maxAttendees - event.currentAttendees} spots remaining`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onRegister(form);
      setForm({
        name: '',
        email: '',
        phone: '',
        attendeeCount: 1,
        specialRequests: '',
        emergencyContact: '',
        emergencyPhone: ''
      });
      onClose();
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const availableSpots = event.maxAttendees ? event.maxAttendees - event.currentAttendees : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Register for Event</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Event Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">{event.title}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDateTime(event.startDateTime)}
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {event.location}
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                {event.currentAttendees} registered
                {availableSpots !== null && (
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    availableSpots > 10 ? 'bg-green-100 text-green-800' :
                    availableSpots > 0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {availableSpots} spots left
                  </span>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Your full name"
                />
                {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="your.email@example.com"
                />
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({...form, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Attendees *
                </label>
                <input
                  type="number"
                  min="1"
                  max={availableSpots || 10}
                  value={form.attendeeCount.toString()}
                  onChange={(e) => setForm({...form, attendeeCount: parseInt(e.target.value) || 1})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.attendeeCount ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.attendeeCount && <p className="text-red-600 text-xs mt-1">{errors.attendeeCount}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  value={form.emergencyContact}
                  onChange={(e) => setForm({...form, emergencyContact: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Emergency contact name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Phone
                </label>
                <input
                  type="tel"
                  value={form.emergencyPhone}
                  onChange={(e) => setForm({...form, emergencyPhone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Emergency contact phone"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requests or Dietary Restrictions
              </label>
              <textarea
                value={form.specialRequests}
                onChange={(e) => setForm({...form, specialRequests: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Any special accommodations needed..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || (availableSpots !== null && availableSpots === 0)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    <span>Register</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
