'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface NewUserWelcomeProps {
  isVisible: boolean;
  onComplete: () => void;
}

export default function NewUserWelcome({ isVisible, onComplete }: NewUserWelcomeProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isVisible || !user) return null;

  const steps = [
    {
      title: `Welcome to ${user.firstName}'s Church Community! 🏛️`,
      content: (
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome, {user.firstName}!
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            You've successfully created your account and joined your own church community. 
            As a new user, you'll start with a clean slate to build your church's membership.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Your Church:</strong> {user.firstName}'s Church Community<br/>
              <strong>Your Role:</strong> Member (you can upgrade to Pastor/Leader later)
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Getting Started Guide 📋',
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">Here's what you can do next:</h3>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <span className="text-2xl">👤</span>
              <div>
                <h4 className="font-medium text-green-800">Complete Your Profile</h4>
                <p className="text-sm text-green-600">Add your personal information, contact details, and ministry interests.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-2xl">👥</span>
              <div>
                <h4 className="font-medium text-blue-800">Invite Other Members</h4>
                <p className="text-sm text-blue-600">Share your church community with family and friends so they can join.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
              <span className="text-2xl">📅</span>
              <div>
                <h4 className="font-medium text-purple-800">Create Events & Groups</h4>
                <p className="text-sm text-purple-600">Start organizing church activities, small groups, and events.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
              <span className="text-2xl">📊</span>
              <div>
                <h4 className="font-medium text-orange-800">Track Spiritual Journeys</h4>
                <p className="text-sm text-orange-600">Monitor member growth and engagement across their faith journey.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Key Features Overview 🚀',
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg">
            <h4 className="font-bold mb-2">👥 Member Management</h4>
            <p className="text-sm opacity-90">Track member profiles, contact info, and engagement levels</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg">
            <h4 className="font-bold mb-2">🏛️ Group Organization</h4>
            <p className="text-sm opacity-90">Create small groups, committees, and ministry teams</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg">
            <h4 className="font-bold mb-2">📅 Event Planning</h4>
            <p className="text-sm opacity-90">Schedule services, events, and track attendance</p>
          </div>
          
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-lg">
            <h4 className="font-bold mb-2">🙏 Pastoral Care</h4>
            <p className="text-sm opacity-90">Manage prayer requests and member care activities</p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-4 rounded-lg">
            <h4 className="font-bold mb-2">📊 Analytics</h4>
            <p className="text-sm opacity-90">View growth trends and engagement metrics</p>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-4 rounded-lg">
            <h4 className="font-bold mb-2">🌱 Journey Tracking</h4>
            <p className="text-sm opacity-90">Follow members through their spiritual growth</p>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const skipOnboarding = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Progress indicator */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={skipOnboarding}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip Tour
            </button>
          </div>

          {/* Content */}
          <div className={`transition-all duration-300 ${currentStep === 0 ? 'text-center' : ''}`}>
            <h1 className="text-2xl font-bold mb-6">{steps[currentStep].title}</h1>
            {steps[currentStep].content}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-500">
              {currentStep + 1} of {steps.length}
            </span>
            
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {currentStep === steps.length - 1 ? 'Get Started!' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
