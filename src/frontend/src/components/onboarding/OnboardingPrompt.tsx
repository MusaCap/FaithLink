'use client';

import React from 'react';
import { Lightbulb, X, Play, ArrowRight } from 'lucide-react';

interface OnboardingPromptProps {
  isVisible: boolean;
  onStart: () => void;
  onDismiss: () => void;
}

export default function OnboardingPrompt({ isVisible, onStart, onDismiss }: OnboardingPromptProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                Welcome to FaithLink360!
              </h3>
              <p className="text-xs text-gray-500">
                First time here?
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Dismiss onboarding prompt"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Take a quick guided tour to discover all the powerful features designed to help you engage and care for your church members.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={onDismiss}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Maybe later
          </button>
          
          <button
            onClick={onStart}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            <Play size={12} />
            <span>Start Tour</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {/* Pulse indicator */}
        <div className="absolute -top-1 -right-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
          <div className="absolute top-0 left-0 w-3 h-3 bg-blue-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
