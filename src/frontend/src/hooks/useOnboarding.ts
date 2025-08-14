'use client';

import { useState, useEffect } from 'react';

interface OnboardingState {
  isFirstVisit: boolean;
  hasCompletedOnboarding: boolean;
  shouldShowOnboarding: boolean;
  currentStep: number;
}

interface UseOnboardingReturn {
  isOnboardingVisible: boolean;
  shouldShowOnboardingPrompt: boolean;
  startOnboarding: () => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
}

const ONBOARDING_STORAGE_KEY = 'faithlink360_onboarding_status';
const ONBOARDING_PROMPT_KEY = 'faithlink360_show_onboarding_prompt';

export function useOnboarding(): UseOnboardingReturn {
  const [isOnboardingVisible, setIsOnboardingVisible] = useState(false);
  const [shouldShowOnboardingPrompt, setShouldShowOnboardingPrompt] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding before
    const checkOnboardingStatus = () => {
      try {
        const savedStatus = localStorage.getItem(ONBOARDING_STORAGE_KEY);
        const showPrompt = localStorage.getItem(ONBOARDING_PROMPT_KEY);
        
        if (!savedStatus) {
          // First time user - show onboarding prompt
          setShouldShowOnboardingPrompt(true);
          localStorage.setItem(ONBOARDING_PROMPT_KEY, 'true');
        } else {
          const status: OnboardingState = JSON.parse(savedStatus);
          
          // If user hasn't completed onboarding and wants to see the prompt
          if (!status.hasCompletedOnboarding && showPrompt === 'true') {
            setShouldShowOnboardingPrompt(true);
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Default to showing prompt on error
        setShouldShowOnboardingPrompt(true);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(checkOnboardingStatus, 1000);
    return () => clearTimeout(timer);
  }, []);

  const startOnboarding = () => {
    setIsOnboardingVisible(true);
    setShouldShowOnboardingPrompt(false);
    localStorage.setItem(ONBOARDING_PROMPT_KEY, 'false');
  };

  const completeOnboarding = () => {
    const status: OnboardingState = {
      isFirstVisit: false,
      hasCompletedOnboarding: true,
      shouldShowOnboarding: false,
      currentStep: 0
    };

    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(status));
      localStorage.setItem(ONBOARDING_PROMPT_KEY, 'false');
    } catch (error) {
      console.error('Error saving onboarding completion:', error);
    }

    setIsOnboardingVisible(false);
    setShouldShowOnboardingPrompt(false);
  };

  const skipOnboarding = () => {
    const status: OnboardingState = {
      isFirstVisit: false,
      hasCompletedOnboarding: false,
      shouldShowOnboarding: false,
      currentStep: 0
    };

    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(status));
      localStorage.setItem(ONBOARDING_PROMPT_KEY, 'false');
    } catch (error) {
      console.error('Error saving onboarding skip:', error);
    }

    setIsOnboardingVisible(false);
    setShouldShowOnboardingPrompt(false);
  };

  const resetOnboarding = () => {
    try {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      localStorage.removeItem(ONBOARDING_PROMPT_KEY);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
    
    setIsOnboardingVisible(false);
    setShouldShowOnboardingPrompt(true);
  };

  return {
    isOnboardingVisible,
    shouldShowOnboardingPrompt,
    startOnboarding,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding
  };
}
