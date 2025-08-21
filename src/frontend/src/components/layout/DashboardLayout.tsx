'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Users, 
  Heart, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Settings,
  Menu,
  X,
  LogOut,
  User,
  Home,
  UserPlus
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Members', href: '/members', icon: Users },
    ];

    if (user?.role === 'admin' || user?.role === 'pastor') {
      return [
        ...baseItems,
        { name: 'Groups', href: '/groups', icon: UserPlus },
        { name: 'Journey Templates', href: '/journey-templates', icon: BookOpen },
        { name: 'Member Journeys', href: '/journeys', icon: Target },
        { name: 'Events', href: '/events', icon: Calendar },
        { name: 'Communications', href: '/communications', icon: MessageSquare },
        { name: 'Care', href: '/care', icon: Heart },
        { name: 'Reports', href: '/reports', icon: BarChart3 },
        { name: 'Settings', href: '/settings', icon: Settings },
      ];
    }

    if (user?.role === 'group_leader') {
      return [
        ...baseItems,
        { name: 'My Groups', href: '/groups', icon: UserPlus },
        { name: 'Member Journeys', href: '/journeys', icon: Target },
        { name: 'Events', href: '/events', icon: Calendar },
        { name: 'Care', href: '/care', icon: Heart },
      ];
    }

    // Member role
    return [
      ...baseItems,
      { name: 'My Groups', href: '/groups', icon: UserPlus },
      { name: 'My Journeys', href: '/journeys', icon: Target },
      { name: 'Events', href: '/events', icon: Calendar },
    ];
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-600 bg-opacity-75 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-200">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-primary-600 mr-2" />
              <span className="text-xl font-bold text-gradient">FaithLink360</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-neutral-400 hover:text-neutral-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <IconComponent className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User profile and logout */}
          <div className="px-4 py-4 border-t border-neutral-200">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-neutral-900">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-neutral-500 capitalize">
                  {user?.role?.replace('_', ' ')}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-neutral-700 rounded-md hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-neutral-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-neutral-400 hover:text-neutral-500"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-neutral-500">
                Welcome back, {user?.firstName}!
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
