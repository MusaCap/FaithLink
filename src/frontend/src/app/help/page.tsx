'use client';

import Link from 'next/link';
import { Search, Book, MessageCircle, Mail, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      title: 'Getting Started',
      icon: Book,
      articles: [
        'Setting up your church profile',
        'Adding your first members',
        'Creating groups and events',
        'Understanding user roles'
      ]
    },
    {
      title: 'Member Management',
      icon: MessageCircle,
      articles: [
        'Adding and editing members',
        'Tracking spiritual journeys',
        'Managing member communications',
        'Importing member data'
      ]
    },
    {
      title: 'Groups & Events',
      icon: Mail,
      articles: [
        'Creating and managing groups',
        'Tracking attendance',
        'Scheduling events',
        'Group communication tools'
      ]
    }
  ];

  const faqs = [
    {
      question: 'How do I add new members to my church?',
      answer: 'Go to the Members section and click "Add Member". Fill in their information and assign appropriate roles and groups.'
    },
    {
      question: 'Can I import existing member data?',
      answer: 'Yes, you can import member data using CSV files. Go to Members > Import and follow the template provided.'
    },
    {
      question: 'How do I track attendance for groups?',
      answer: 'In the Groups section, select a group and click "Take Attendance". You can mark members as present, absent, or late.'
    },
    {
      question: 'What are Journey Templates?',
      answer: 'Journey Templates are structured spiritual growth paths with milestones that help guide members in their faith journey.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center">
            <div className="bg-primary-600 text-white p-2 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">FaithLink360</span>
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-6">How can we help you?</h1>
          <p className="text-xl text-primary-100 mb-8">
            Find answers to common questions and learn how to get the most out of FaithLink360
          </p>
          
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="w-6 h-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-gray-900 rounded-lg focus:ring-2 focus:ring-primary-300 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Link href="/contact" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <Mail className="w-8 h-8 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Support</h3>
            <p className="text-gray-600 mb-4">Get direct help from our support team</p>
            <span className="text-primary-600 font-medium flex items-center">
              Contact us <ArrowRight className="w-4 h-4 ml-1" />
            </span>
          </Link>

          <Link href="/demo" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <Book className="w-8 h-8 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Try Demo</h3>
            <p className="text-gray-600 mb-4">Explore the platform with sample data</p>
            <span className="text-primary-600 font-medium flex items-center">
              Start demo <ArrowRight className="w-4 h-4 ml-1" />
            </span>
          </Link>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <MessageCircle className="w-8 h-8 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-gray-600 mb-4">Chat with our support team in real-time</p>
            <span className="text-gray-400 font-medium">Coming soon</span>
          </div>
        </div>

        {/* Help Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {category.articles.map((article, idx) => (
                      <li key={idx}>
                        <a href="#" className="text-primary-600 hover:text-primary-700 hover:underline">
                          {article}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQs */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Still need help */}
        <div className="mt-16 text-center bg-primary-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still need help?</h2>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            Contact Support
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
