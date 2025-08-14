'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings,
  ChevronRight,
  Bell,
  Search
} from 'lucide-react';

interface MobileNavigationProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview and quick stats'
  },
  {
    name: 'Members',
    href: '/members',
    icon: Users,
    description: 'Manage church members'
  },
  {
    name: 'Groups',
    href: '/groups',
    icon: Users,
    description: 'Small groups and teams'
  },
  {
    name: 'Events',
    href: '/events',
    icon: Calendar,
    description: 'Church events and calendar'
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
    description: 'Analytics and insights'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Account and preferences'
  }
];

export default function MobileNavigation({ isOpen, onToggle, onClose }: MobileNavigationProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={onToggle}
        className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        aria-label="Toggle mobile menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 w-80 max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">FaithLink360</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Close mobile menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search members, groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex space-x-2">
                <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium">
                  <Users size={14} />
                  <span>Add Member</span>
                </button>
                <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium">
                  <Calendar size={14} />
                  <span>New Event</span>
                </button>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto">
              <div className="p-2">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center justify-between p-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <IconComponent size={16} className="text-gray-600 group-hover:text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.description}</div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">JD</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">John Doe</div>
                  <div className="text-xs text-gray-500">Church Administrator</div>
                </div>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Bell size={16} />
                </button>
              </div>
              
              <div className="flex space-x-2">
                <Link
                  href="/profile"
                  onClick={onClose}
                  className="flex-1 px-3 py-2 text-center text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Profile
                </Link>
                <button className="flex-1 px-3 py-2 text-center text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
