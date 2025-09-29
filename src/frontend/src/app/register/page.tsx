'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Heart, Users } from 'lucide-react';
import ChurchSelection from '../../components/auth/ChurchSelection';

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState<'basic' | 'church'>('basic');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    churchName: '',
    role: 'admin' as 'admin' | 'member',
  });
  const [churchSelection, setChurchSelection] = useState<{
    churchChoice: 'join' | 'create';
    selectedChurchId?: string;
    selectedChurchName?: string;
    newChurchName?: string;
    joinCode?: string;
  } | null>(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleBasicFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    // Move to church selection step
    setCurrentStep('church');
  };

  const handleChurchSelection = (selection: {
    churchChoice: 'join' | 'create';
    selectedChurchId?: string;
    selectedChurchName?: string;
    newChurchName?: string;
    joinCode?: string;
  }) => {
    setChurchSelection(selection);
    completeRegistration(selection);
  };

  const completeRegistration = async (selection: {
    churchChoice: 'join' | 'create';
    selectedChurchId?: string;
    selectedChurchName?: string;
    newChurchName?: string;
    joinCode?: string;
  }) => {
    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        churchChoice: selection.churchChoice,
        selectedChurchId: selection.selectedChurchId,
        newChurchName: selection.newChurchName,
        joinCode: selection.joinCode,
      });
      router.push('/dashboard');
    } catch (err) {
      // Error handled by AuthContext
    }
  };

  if (currentStep === 'church') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
        <ChurchSelection 
          onSelection={handleChurchSelection}
          onBack={() => setCurrentStep('basic')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center mb-6">
            <Heart className="w-8 h-8 text-primary-600 mr-2" />
            <h1 className="text-2xl font-bold text-gradient">FaithLink360</h1>
          </div>
          <h2 className="text-3xl font-bold text-neutral-900">
            Join FaithLink360
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Create your church management account
          </p>
        </div>

        {/* Registration Form */}
        <form className="mt-8 space-y-6" onSubmit={handleBasicFormSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                I am signing up as:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                  formData.role === 'admin' ? 'border-primary-600 bg-primary-50' : 'border-neutral-300'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === 'admin'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center text-center">
                    <Users className="w-6 h-6 text-primary-600 mb-2" />
                    <span className="text-sm font-medium text-neutral-900">Church Leader</span>
                    <span className="text-xs text-neutral-500">Admin access</span>
                  </div>
                </label>
                <label className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                  formData.role === 'member' ? 'border-primary-600 bg-primary-50' : 'border-neutral-300'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="member"
                    checked={formData.role === 'member'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center text-center">
                    <Heart className="w-6 h-6 text-primary-600 mb-2" />
                    <span className="text-sm font-medium text-neutral-900">Church Member</span>
                    <span className="text-xs text-neutral-500">Member access</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700">
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700">
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Church Name (for admins) */}
            {formData.role === 'admin' && (
              <div>
                <label htmlFor="churchName" className="block text-sm font-medium text-neutral-700">
                  Church name
                </label>
                <input
                  id="churchName"
                  name="churchName"
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your church name"
                  value={formData.churchName}
                  onChange={handleChange}
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="block w-full px-3 py-2 pr-10 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-neutral-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-neutral-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700">
                Confirm password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="block w-full px-3 py-2 pr-10 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-neutral-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-neutral-400" />
                  )}
                </button>
              </div>
              {formData.password !== formData.confirmPassword && formData.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || formData.password !== formData.confirmPassword}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Create account'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-neutral-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
