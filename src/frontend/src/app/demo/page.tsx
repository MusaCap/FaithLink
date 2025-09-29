'use client';

import Link from 'next/link';
import { ArrowRight, Play, CheckCircle, Users, Calendar, TrendingUp } from 'lucide-react';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <div className="bg-primary-600 text-white p-2 rounded-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">FaithLink360</span>
            </Link>
            <Link
              href="/login"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Live Demo
            </Link>
          </div>
        </div>
      </div>

      {/* Demo Credentials */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            FaithLink360 <span className="text-primary-600">Live Demo</span>
          </h1>
          <p className="text-xl text-gray-600">
            Experience our church management platform with real sample data
          </p>
        </div>

        <div className="bg-white border-2 border-primary-200 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Demo Login Credentials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-primary-50 p-4 rounded-lg">
              <h3 className="font-semibold text-primary-900 mb-2">Admin Access</h3>
              <p className="text-sm text-primary-700 mb-1">Email: admin@faithlink360.com</p>
              <p className="text-sm text-primary-700">Password: admin123</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Pastor Access</h3>
              <p className="text-sm text-blue-700 mb-1">Email: pastor@faithlink360.com</p>
              <p className="text-sm text-blue-700">Password: admin123</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center px-8 py-4 bg-primary-600 text-white text-lg font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Access Demo Platform
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
