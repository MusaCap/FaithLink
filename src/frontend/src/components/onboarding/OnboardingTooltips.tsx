'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface TooltipStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
}

interface OnboardingTooltipsProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const ONBOARDING_STEPS: TooltipStep[] = [
  {
    id: 'welcome',
    target: '.hero-section',
    title: 'Welcome to FaithLink360! 🎉',
    content: 'Your comprehensive church member engagement platform. Let\'s take a quick tour to get you started.',
    position: 'bottom',
    action: 'start-tour'
  },
  {
    id: 'navigation',
    target: '.main-nav',
    title: 'Navigation Menu',
    content: 'Access all major features from here: Members, Groups, Events, and more. This is your command center.',
    position: 'bottom'
  },
  {
    id: 'dashboard',
    target: '.dashboard-stats',
    title: 'Quick Stats Dashboard',
    content: 'Get an instant overview of your church metrics - active members, upcoming events, and group activities.',
    position: 'bottom'
  },
  {
    id: 'members',
    target: '[href="/members"]',
    title: 'Member Management',
    content: 'Add, edit, and track your church members. View their spiritual journey progress and contact information.',
    position: 'right'
  },
  {
    id: 'groups',
    target: '[href="/groups"]',
    title: 'Group Management',
    content: 'Organize and manage your small groups, track attendance, and facilitate group communication.',
    position: 'right'
  },
  {
    id: 'events',
    target: '[href="/events"]',
    title: 'Event Management',
    content: 'Create and manage church events, track RSVPs, and monitor attendance for all your activities.',
    position: 'right'
  },
  {
    id: 'features',
    target: '.features-grid',
    title: 'Key Features',
    content: 'Explore all the powerful tools designed to help you engage and care for your church members effectively.',
    position: 'top'
  }
];

export default function OnboardingTooltips({ isVisible, onComplete, onSkip }: OnboardingTooltipsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isPositioned, setIsPositioned] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const positionTooltip = () => {
      const step = ONBOARDING_STEPS[currentStep];
      const targetElement = document.querySelector(step.target);
      
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const tooltipWidth = 320;
        const tooltipHeight = 200;
        
        let top = 0;
        let left = 0;

        switch (step.position) {
          case 'bottom':
            top = rect.bottom + window.scrollY + 10;
            left = rect.left + window.scrollX + (rect.width / 2) - (tooltipWidth / 2);
            break;
          case 'top':
            top = rect.top + window.scrollY - tooltipHeight - 10;
            left = rect.left + window.scrollX + (rect.width / 2) - (tooltipWidth / 2);
            break;
          case 'right':
            top = rect.top + window.scrollY + (rect.height / 2) - (tooltipHeight / 2);
            left = rect.right + window.scrollX + 10;
            break;
          case 'left':
            top = rect.top + window.scrollY + (rect.height / 2) - (tooltipHeight / 2);
            left = rect.left + window.scrollX - tooltipWidth - 10;
            break;
        }

        // Ensure tooltip stays within viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        if (left < 10) left = 10;
        if (left + tooltipWidth > viewportWidth - 10) left = viewportWidth - tooltipWidth - 10;
        if (top < 10) top = 10;
        if (top + tooltipHeight > viewportHeight + window.scrollY - 10) {
          top = viewportHeight + window.scrollY - tooltipHeight - 10;
        }

        setTooltipPosition({ top, left });
        setIsPositioned(true);

        // Highlight target element
        targetElement.classList.add('onboarding-highlight');
        
        // Scroll to target if needed
        targetElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
      }
    };

    const timer = setTimeout(positionTooltip, 100);
    window.addEventListener('resize', positionTooltip);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', positionTooltip);
      // Remove highlights from all elements
      document.querySelectorAll('.onboarding-highlight').forEach(el => {
        el.classList.remove('onboarding-highlight');
      });
    };
  }, [currentStep, isVisible]);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setIsPositioned(false);
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsPositioned(false);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Remove all highlights
    document.querySelectorAll('.onboarding-highlight').forEach(el => {
      el.classList.remove('onboarding-highlight');
    });
    onComplete();
  };

  const handleSkip = () => {
    // Remove all highlights
    document.querySelectorAll('.onboarding-highlight').forEach(el => {
      el.classList.remove('onboarding-highlight');
    });
    onSkip();
  };

  if (!isVisible || !isPositioned) return null;

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300" />
      
      {/* Tooltip */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 transform"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          width: '320px',
          maxHeight: '400px'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {currentStep + 1}
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {currentStepData.title}
            </h3>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            {currentStepData.content}
          </p>

          {/* Progress indicators */}
          <div className="flex space-x-1 mb-4">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full flex-1 transition-colors duration-200 ${
                  index <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-b-lg">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>{currentStep + 1} of {ONBOARDING_STEPS.length}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="flex items-center space-x-1 px-3 py-1.5 text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                <ChevronLeft size={14} />
                <span>Back</span>
              </button>
            )}
            
            <button
              onClick={handleNext}
              className="flex items-center space-x-1 px-4 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              {isLastStep ? (
                <>
                  <Check size={14} />
                  <span>Finish</span>
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ChevronRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CSS for highlighting */}
      <style jsx global>{`
        .onboarding-highlight {
          position: relative;
          z-index: 45;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2) !important;
          border-radius: 8px;
          transition: box-shadow 0.3s ease;
        }
        
        .onboarding-highlight::before {
          content: '';
          position: absolute;
          inset: -4px;
          border: 2px solid #3b82f6;
          border-radius: 8px;
          pointer-events: none;
          animation: pulse-border 2s infinite;
        }
        
        @keyframes pulse-border {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}
