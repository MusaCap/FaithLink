'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MobileStat {
  name: string;
  value: string;
  change?: {
    type: 'increase' | 'decrease' | 'neutral';
    value: string;
  };
  icon?: React.ElementType;
}

interface MobileFeature {
  name: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

interface MobileCardsProps {
  stats?: MobileStat[];
  features?: MobileFeature[];
}

export function MobileStatsCard({ stats = [] }: { stats: MobileStat[] }) {
  return (
    <div className="md:hidden bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h3>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {stat.value}
            </div>
            <div className="text-xs text-gray-500 mb-2">
              {stat.name}
            </div>
            {stat.change && (
              <div className={`flex items-center justify-center space-x-1 text-xs ${
                stat.change.type === 'increase' ? 'text-green-600' : 
                stat.change.type === 'decrease' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {stat.change.type === 'increase' && <TrendingUp size={12} />}
                {stat.change.type === 'decrease' && <TrendingDown size={12} />}
                {stat.change.type === 'neutral' && <Minus size={12} />}
                <span>{stat.change.value}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MobileFeatureCard({ feature }: { feature: MobileFeature }) {
  const IconComponent = feature.icon;
  
  return (
    <Link
      href={feature.href}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow active:bg-gray-50"
    >
      <div className="flex items-start space-x-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${feature.color}`}>
          <IconComponent size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            {feature.name}
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed mb-2">
            {feature.description}
          </p>
          <div className="flex items-center text-blue-600 text-xs font-medium">
            <span>Learn more</span>
            <ArrowRight size={12} className="ml-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function MobileFeaturesGrid({ features = [] }: { features: MobileFeature[] }) {
  return (
    <div className="md:hidden">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 px-4">
        Key Features
      </h3>
      <div className="space-y-3 px-4">
        {features.map((feature, index) => (
          <MobileFeatureCard key={index} feature={feature} />
        ))}
      </div>
    </div>
  );
}

export function MobileQuickActions() {
  const quickActions = [
    {
      name: 'Add Member',
      href: '/members/new',
      color: 'bg-blue-500',
      icon: '👤'
    },
    {
      name: 'New Event',
      href: '/events/new',
      color: 'bg-green-500',
      icon: '📅'
    },
    {
      name: 'Send Message',
      href: '/communications/new',
      color: 'bg-purple-500',
      icon: '💬'
    },
    {
      name: 'View Reports',
      href: '/reports',
      color: 'bg-orange-500',
      icon: '📊'
    }
  ];

  return (
    <div className="md:hidden bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className="flex flex-col items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center mb-2`}>
              <span className="text-lg">{action.icon}</span>
            </div>
            <span className="text-xs font-medium text-gray-700 text-center">
              {action.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function MobileBottomNavigation() {
  const navItems = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Members', href: '/members', icon: '👥' },
    { name: 'Groups', href: '/groups', icon: '👨‍👩‍👧‍👦' },
    { name: 'Events', href: '/events', icon: '📅' },
    { name: 'More', href: '/menu', icon: '⋯' }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-5">
        {navItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="flex flex-col items-center py-2 px-1 text-gray-600 hover:text-blue-600 active:bg-gray-50 transition-colors"
          >
            <span className="text-lg mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
