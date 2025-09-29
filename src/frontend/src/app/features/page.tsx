'use client';

import Link from 'next/link';
import { ArrowRight, Users, Calendar, TrendingUp, Shield, Heart, BookOpen } from 'lucide-react';

export default function FeaturesPage() {
  const features = [
    {
      icon: Users,
      title: 'Member Management',
      description: 'Comprehensive member directory with spiritual journey tracking and analytics.',
      benefits: ['Digital member directory', 'Spiritual journey tracking', 'Contact & communication tools']
    },
    {
      icon: Calendar,
      title: 'Group & Event Management', 
      description: 'Organize groups, track attendance, and manage church events.',
      benefits: ['Small group management', 'Attendance tracking', 'Event scheduling']
    },
    {
      icon: BookOpen,
      title: 'Journey Templates',
      description: 'Guided spiritual growth paths with milestone tracking.',
      benefits: ['Pre-built journey templates', 'Milestone tracking', 'Progress reporting']
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-6">
              Powerful Features for Modern Churches
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto mb-8">
              Everything you need to strengthen member connections and track spiritual growth.
            </p>
            <Link
              href="/demo"
              className="inline-flex items-center px-8 py-4 bg-white text-primary-600 text-lg font-semibold rounded-lg hover:bg-primary-50 transition-colors"
            >
              Try Live Demo
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg border hover:shadow-xl transition-shadow">
                <div className="bg-primary-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
