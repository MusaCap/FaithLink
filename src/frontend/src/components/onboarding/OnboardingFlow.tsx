'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, ChevronLeft, Check, Users, Calendar, 
  Heart, BookOpen, Settings, Star, ArrowRight, Play 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
  required: boolean;
  estimatedTime: string;
}

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
}

export default function OnboardingFlow({ onComplete, onSkip, showSkip = true }: OnboardingFlowProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to FaithLink360',
      description: 'Let\'s get you started with your church community platform',
      icon: Star,
      component: WelcomeStep,
      required: true,
      estimatedTime: '1 min'
    },
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Help your church community get to know you better',
      icon: Users,
      component: ProfileStep,
      required: true,
      estimatedTime: '3 min'
    },
    {
      id: 'groups',
      title: 'Join Groups',
      description: 'Connect with small groups and ministry teams',
      icon: Users,
      component: GroupsStep,
      required: false,
      estimatedTime: '2 min'
    },
    {
      id: 'events',
      title: 'Upcoming Events',
      description: 'Stay connected with church events and activities',
      icon: Calendar,
      component: EventsStep,
      required: false,
      estimatedTime: '2 min'
    },
    {
      id: 'spiritual-journey',
      title: 'Spiritual Growth',
      description: 'Begin your spiritual journey with guided resources',
      icon: BookOpen,
      component: SpiritualJourneyStep,
      required: false,
      estimatedTime: '3 min'
    },
    {
      id: 'pastoral-care',
      title: 'Pastoral Care',
      description: 'Connect with pastoral care and prayer support',
      icon: Heart,
      component: PastoralCareStep,
      required: false,
      estimatedTime: '2 min'
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'Customize your notifications and privacy settings',
      icon: Settings,
      component: PreferencesStep,
      required: true,
      estimatedTime: '2 min'
    }
  ];

  const totalSteps = steps.length;
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  const handleStepComplete = (stepId: string, data?: any) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    if (data) {
      setStepData(prev => ({ ...prev, [stepId]: data }));
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Save onboarding completion to backend
      await fetch('/api/members/onboarding-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          completedSteps: Array.from(completedSteps),
          stepData,
          completedAt: new Date().toISOString()
        })
      });

      onComplete();
    } catch (error) {
      console.error('Failed to save onboarding completion:', error);
      onComplete(); // Continue anyway
    } finally {
      setIsLoading(false);
    }
  };

  const currentStepData = steps[currentStep];
  const CurrentStepComponent = currentStepData.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Mobile-optimized header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep + 1} of {totalSteps}</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Step info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <currentStepData.icon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
                  {currentStepData.title}
                </h1>
                <p className="text-sm text-gray-600 sm:text-base">
                  {currentStepData.description}
                </p>
              </div>
            </div>
            
            {showSkip && !currentStepData.required && (
              <button
                onClick={onSkip}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1"
              >
                Skip Setup
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <CurrentStepComponent
            onComplete={(data) => handleStepComplete(currentStepData.id, data)}
            isCompleted={completedSteps.has(currentStepData.id)}
            data={stepData[currentStepData.id]}
            user={user}
          />
        </div>
      </div>

      {/* Mobile-optimized navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex items-center px-4 py-2 rounded-md font-medium ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </button>

          <div className="flex items-center space-x-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-primary-600'
                    : index < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={isLoading}
            className={`flex items-center px-6 py-2 rounded-md font-medium ${
              currentStep === totalSteps - 1
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              'Saving...'
            ) : currentStep === totalSteps - 1 ? (
              <>
                Complete Setup
                <Check className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-20" />
    </div>
  );
}

// Step Components
function WelcomeStep({ onComplete, user }: any) {
  useEffect(() => {
    // Auto-complete welcome step after 2 seconds or user interaction
    const timer = setTimeout(() => onComplete(), 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
        <Star className="w-10 h-10 text-primary-600" />
      </div>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome to FaithLink360, {user?.firstName || 'Friend'}!
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          We're excited to help you connect with your church community in meaningful ways. 
          Let's take a few minutes to personalize your experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <Users className="w-8 h-8 text-blue-600 mb-2 mx-auto" />
          <h3 className="font-medium text-blue-900">Connect</h3>
          <p className="text-sm text-blue-700">Join groups and build relationships</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <BookOpen className="w-8 h-8 text-green-600 mb-2 mx-auto" />
          <h3 className="font-medium text-green-900">Grow</h3>
          <p className="text-sm text-green-700">Develop your spiritual journey</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <Heart className="w-8 h-8 text-purple-600 mb-2 mx-auto" />
          <h3 className="font-medium text-purple-900">Serve</h3>
          <p className="text-sm text-purple-700">Find ways to serve your community</p>
        </div>
      </div>

      <div className="flex items-center justify-center mt-6">
        <button
          onClick={() => onComplete()}
          className="flex items-center bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 font-medium"
        >
          <Play className="w-4 h-4 mr-2" />
          Let's Get Started
        </button>
      </div>
    </div>
  );
}

function ProfileStep({ onComplete, isCompleted, data, user }: any) {
  const [profile, setProfile] = useState({
    bio: data?.bio || '',
    phone: data?.phone || user?.phone || '',
    interests: data?.interests || [],
    skills: data?.skills || [],
    availability: data?.availability || []
  });

  const interestOptions = [
    'Bible Study', 'Youth Ministry', 'Music & Worship', 'Community Outreach',
    'Children\'s Ministry', 'Prayer Group', 'Missions', 'Fellowship',
    'Teaching', 'Counseling', 'Administration', 'Technology'
  ];

  const skillOptions = [
    'Leadership', 'Teaching', 'Music', 'Technology', 'Counseling',
    'Event Planning', 'Finance', 'Communication', 'Creative Arts',
    'Hospitality', 'Administration', 'Healthcare'
  ];

  const availabilityOptions = [
    'Weekday Mornings', 'Weekday Afternoons', 'Weekday Evenings',
    'Saturday Mornings', 'Saturday Afternoons', 'Saturday Evenings',
    'Sunday Mornings', 'Sunday Afternoons', 'Sunday Evenings'
  ];

  const handleComplete = () => {
    onComplete(profile);
  };

  const toggleSelection = (array: string[], item: string, setter: (value: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Tell Us About Yourself
        </h2>
        <p className="text-gray-600">
          Help your church community get to know you better
        </p>
      </div>

      <div className="space-y-6">
        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brief Introduction
          </label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({...profile, bio: e.target.value})}
            placeholder="Tell us a bit about yourself, your faith journey, or what you're hoping to get involved in..."
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile({...profile, phone: e.target.value})}
            placeholder="(555) 123-4567"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Areas of Interest
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {interestOptions.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleSelection(profile.interests, interest, (interests) => 
                  setProfile({...profile, interests})
                )}
                className={`text-sm px-3 py-2 rounded-md border transition-colors ${
                  profile.interests.includes(interest)
                    ? 'bg-primary-100 border-primary-500 text-primary-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skills & Talents
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {skillOptions.map((skill) => (
              <button
                key={skill}
                onClick={() => toggleSelection(profile.skills, skill, (skills) => 
                  setProfile({...profile, skills})
                )}
                className={`text-sm px-3 py-2 rounded-md border transition-colors ${
                  profile.skills.includes(skill)
                    ? 'bg-green-100 border-green-500 text-green-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            When Are You Available?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {availabilityOptions.map((time) => (
              <button
                key={time}
                onClick={() => toggleSelection(profile.availability, time, (availability) => 
                  setProfile({...profile, availability})
                )}
                className={`text-sm px-3 py-2 rounded-md border transition-colors ${
                  profile.availability.includes(time)
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={handleComplete}
          className="bg-primary-600 text-white px-8 py-3 rounded-md hover:bg-primary-700 font-medium"
        >
          Save Profile Information
        </button>
      </div>
    </div>
  );
}

function GroupsStep({ onComplete }: any) {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  // Mock groups - in production, fetch from API
  const availableGroups = [
    { id: 'young-adults', name: 'Young Adults', description: 'Ages 18-30, Sunday evenings', members: 24 },
    { id: 'bible-study', name: 'Tuesday Bible Study', description: 'Weekly Bible study, all ages welcome', members: 18 },
    { id: 'worship-team', name: 'Worship Team', description: 'Musicians and vocalists', members: 12 },
    { id: 'outreach', name: 'Community Outreach', description: 'Local service projects', members: 35 },
    { id: 'prayer-group', name: 'Prayer Warriors', description: 'Wednesday morning prayer', members: 15 },
    { id: 'youth', name: 'Youth Group', description: 'High school students', members: 28 }
  ];

  const handleComplete = () => {
    onComplete({ selectedGroups });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Join Groups & Ministries
        </h2>
        <p className="text-gray-600">
          Connect with like-minded people in your church community
        </p>
      </div>

      <div className="grid gap-4">
        {availableGroups.map((group) => (
          <div
            key={group.id}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedGroups.includes(group.id)
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => {
              if (selectedGroups.includes(group.id)) {
                setSelectedGroups(selectedGroups.filter(id => id !== group.id));
              } else {
                setSelectedGroups([...selectedGroups, group.id]);
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{group.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                <p className="text-xs text-gray-500 mt-2">{group.members} members</p>
              </div>
              <div className="ml-4">
                {selectedGroups.includes(group.id) ? (
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedGroups.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">
            You've selected {selectedGroups.length} group{selectedGroups.length !== 1 ? 's' : ''}
          </h4>
          <p className="text-sm text-green-700">
            Group leaders will be notified and may reach out to welcome you!
          </p>
        </div>
      )}

      <div className="flex justify-center pt-4">
        <button
          onClick={handleComplete}
          className="bg-primary-600 text-white px-8 py-3 rounded-md hover:bg-primary-700 font-medium"
        >
          {selectedGroups.length > 0 ? 'Join Selected Groups' : 'Skip For Now'}
        </button>
      </div>
    </div>
  );
}

// Placeholder components for other steps
function EventsStep({ onComplete }: any) {
  return (
    <div className="text-center space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
      <p className="text-gray-600">Stay connected with church activities</p>
      <button
        onClick={() => onComplete()}
        className="bg-primary-600 text-white px-8 py-3 rounded-md hover:bg-primary-700 font-medium"
      >
        Continue
      </button>
    </div>
  );
}

function SpiritualJourneyStep({ onComplete }: any) {
  return (
    <div className="text-center space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Spiritual Growth</h2>
      <p className="text-gray-600">Begin your spiritual journey</p>
      <button
        onClick={() => onComplete()}
        className="bg-primary-600 text-white px-8 py-3 rounded-md hover:bg-primary-700 font-medium"
      >
        Continue
      </button>
    </div>
  );
}

function PastoralCareStep({ onComplete }: any) {
  return (
    <div className="text-center space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Pastoral Care</h2>
      <p className="text-gray-600">Connect with pastoral support</p>
      <button
        onClick={() => onComplete()}
        className="bg-primary-600 text-white px-8 py-3 rounded-md hover:bg-primary-700 font-medium"
      >
        Continue
      </button>
    </div>
  );
}

function PreferencesStep({ onComplete }: any) {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    eventReminders: true,
    prayerRequestNotifications: true,
    groupUpdates: true,
    newsletter: true
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Notification Preferences
        </h2>
        <p className="text-gray-600">
          Choose how you'd like to stay connected
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(preferences).map(([key, value]) => (
          <label key={key} className="flex items-center justify-between">
            <span className="text-gray-900 capitalize">
              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
            </span>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => setPreferences({
                ...preferences,
                [key]: e.target.checked
              })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </label>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={() => onComplete(preferences)}
          className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 font-medium"
        >
          Complete Setup
        </button>
      </div>
    </div>
  );
}
