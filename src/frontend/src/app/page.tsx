'use client';

import React, { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Heart, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Shield,
  ArrowRight,
  CheckCircle 
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const features = [
  {
    name: 'Member Management',
    description: 'Centralized profiles with comprehensive member information, tags, and search capabilities.',
    icon: Users,
    href: '/members',
  },
  {
    name: 'Spiritual Journey Tracking',
    description: 'Map and track member progress through customizable spiritual milestones.',
    icon: Heart,
    href: '/journeys',
  },
  {
    name: 'Group Management',
    description: 'Organize and manage small groups, track attendance, and facilitate connections.',
    icon: Users,
    href: '/groups',
  },
  {
    name: 'Events & Calendar',
    description: 'Schedule events, track attendance, and manage church calendar activities.',
    icon: Calendar,
    href: '/events',
  },
  {
    name: 'Communication Center',
    description: 'Send targeted messages, emails, and SMS to members and groups.',
    icon: MessageSquare,
    href: '/communications',
  },
  {
    name: 'Care Management',
    description: 'Log pastoral visits, prayer requests, and track follow-up actions.',
    icon: Heart,
    href: '/care',
  },
  {
    name: 'Analytics & Reports',
    description: 'Generate insights on member engagement and church growth metrics.',
    icon: BarChart3,
    href: '/reports',
  },
  {
    name: 'Security & Privacy',
    description: 'Role-based access control with secure data handling and privacy controls.',
    icon: Shield,
    href: '/settings',
  },
]

const quickStats = [
  { name: 'Total Members', value: '248', change: '+12%' },
  { name: 'Active Groups', value: '18', change: '+2' },
  { name: 'This Week\'s Events', value: '7', change: '+3' },
  { name: 'Follow-ups Pending', value: '15', change: '-5' },
]

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <Heart className="w-8 h-8 text-primary-600 mr-2" />
                  <h1 className="text-2xl font-bold text-gradient">FaithLink360</h1>
                </div>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="#features" className="text-neutral-600 hover:text-primary-600 transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-neutral-600 hover:text-primary-600 transition-colors">
                Pricing
              </Link>
              <Link href="#demo" className="text-neutral-600 hover:text-primary-600 transition-colors">
                Demo
              </Link>
              <Link href="#contact" className="text-neutral-600 hover:text-primary-600 transition-colors">
                Contact
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/demo" className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors">
                Try Demo
              </Link>
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="hero-section relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-8">
              Strengthen Your Church
              <span className="text-gradient block">Community</span>
            </h1>
            <p className="max-w-3xl mx-auto text-xl text-neutral-600 mb-12">
              FaithLink360 helps churches track, engage, and care for members across their spiritual 
              journeys with powerful tools for member management, group coordination, and community building.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn btn-primary btn-lg">
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/demo" className="btn btn-secondary btn-lg">
                Watch Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Success Stories / Social Proof */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Trusted by Churches Worldwide
            </h2>
            <p className="text-lg text-neutral-600">
              Join hundreds of churches strengthening their communities with FaithLink360
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-sm font-medium text-neutral-900">Churches</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">50k+</div>
              <div className="text-sm font-medium text-neutral-900">Members</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">98%</div>
              <div className="text-sm font-medium text-neutral-900">Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">24/7</div>
              <div className="text-sm font-medium text-neutral-900">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Everything You Need to Engage Your Community
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-neutral-600">
              Comprehensive tools designed specifically for church member engagement and spiritual growth tracking.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const IconComponent = feature.icon
              return (
                <Link
                  key={feature.name}
                  href={feature.href}
                  className="group card hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="card-body">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                      <IconComponent className="w-6 h-6 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      {feature.name}
                    </h3>
                    <p className="text-neutral-600 text-sm">
                      {feature.description}
                    </p>
                    <div className="mt-4 flex items-center text-primary-600 text-sm font-medium">
                      Learn more
                      <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-primary py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Church Community?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join hundreds of churches using FaithLink360 to strengthen member connections and track spiritual growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn bg-white text-primary-600 hover:bg-neutral-50 btn-lg">
              Start Free Trial
            </Link>
            <Link href="/contact" className="btn border-white text-white hover:bg-primary-700 btn-lg">
              Contact Sales
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold text-white mb-4">FaithLink360</h3>
              <p className="text-neutral-400 mb-4 max-w-md">
                Empowering churches to build stronger communities through better member engagement and spiritual journey tracking.
              </p>
              <div className="text-sm text-neutral-500">
                © 2024 FaithLink360. All rights reserved.
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">
                Product
              </h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">
                Support
              </h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
