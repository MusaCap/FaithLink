'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Users, Calendar, Globe, ChevronDown, ChevronUp } from 'lucide-react';

interface Church {
  id: string;
  name: string;
  description: string;
  location: string;
  denomination: string;
  size: string;
  founded: string;
  website: string;
  memberCount: number;
  joinCode: string;
}

interface ChurchSelectionProps {
  onSelection: (selection: {
    churchChoice: 'join' | 'create';
    selectedChurchId?: string;
    selectedChurchName?: string;
    newChurchName?: string;
    joinCode?: string;
  }) => void;
  onBack?: () => void;
}

export default function ChurchSelection({ onSelection, onBack }: ChurchSelectionProps) {
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDenomination, setSelectedDenomination] = useState('all');
  const [churchChoice, setChurchChoice] = useState<'join' | 'create'>('join');
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [newChurchName, setNewChurchName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [showJoinCodeInput, setShowJoinCodeInput] = useState(false);
  const [expandedChurch, setExpandedChurch] = useState<string | null>(null);

  const denominations = ['all', 'non-denominational', 'baptist', 'methodist', 'pentecostal', 'catholic', 'presbyterian', 'lutheran'];

  useEffect(() => {
    fetchChurches();
  }, []);

  const fetchChurches = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/churches`);
      const data = await response.json();
      
      if (data.success && data.churches.length > 0) {
        setChurches(data.churches);
        // Auto-select the first (and only) church for joining
        const demoChurch = data.churches[0];
        setSelectedChurch(demoChurch);
      }
    } catch (error) {
      console.error('Failed to fetch churches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChurchSelect = (church: Church) => {
    setSelectedChurch(church);
    setExpandedChurch(null);
  };

  const handleContinue = () => {
    if (churchChoice === 'join' && selectedChurch) {
      onSelection({
        churchChoice: 'join',
        selectedChurchId: selectedChurch.id,
        selectedChurchName: selectedChurch.name,
        joinCode: joinCode || undefined
      });
    } else if (churchChoice === 'create' && newChurchName.trim()) {
      onSelection({
        churchChoice: 'create',
        newChurchName: newChurchName.trim()
      });
    }
  };

  const canContinue = 
    (churchChoice === 'join' && selectedChurch) ||
    (churchChoice === 'create' && newChurchName.trim().length >= 3);
  
  // Auto-select demo church when joining
  const demoChurch = churches.length > 0 ? churches[0] : null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Church Community</h1>
        <p className="text-gray-600">Join our demo church to see how FaithLink360 works, or start your own</p>
      </div>

      {/* Simplified Church Choice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Join Demo Church Option */}
        <div 
          className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
            churchChoice === 'join' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setChurchChoice('join')}
        >
          <div className="text-center">
            <div className="text-4xl mb-4">🏛️</div>
            <h3 className="text-xl font-semibold mb-2">Join Demo Church</h3>
            <p className="text-gray-600 mb-4">
              Join First Community Church to see how FaithLink360 works with real community data, events, and member activities.
            </p>
            <div className="bg-blue-100 p-3 rounded-lg text-sm">
              <p><strong>First Community Church</strong></p>
              <p>3 demo members • Sample data included</p>
              <p>Perfect for exploring features</p>
            </div>
          </div>
        </div>

        {/* Create New Church Option */}
        <div 
          className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
            churchChoice === 'create' 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setChurchChoice('create')}
        >
          <div className="text-center">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-semibold mb-2">Create New Church</h3>
            <p className="text-gray-600 mb-4">
              Start your own church community from scratch. You'll be the administrator and can invite others to join.
            </p>
            <div className="bg-green-100 p-3 rounded-lg text-sm">
              <p><strong>Your Own Community</strong></p>
              <p>Clean slate • Full customization</p>
              <p>Perfect for real church deployment</p>
            </div>
          </div>
        </div>
      </div>

      {churchChoice === 'join' ? (
        <div className="space-y-6">
          {/* Auto-select Demo Church */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading demo church...</p>
            </div>
          ) : churches.length > 0 ? (
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-blue-800 mb-3">
                  🏛️ Ready to Join First Community Church
                </h3>
                <p className="text-blue-700 mb-4">
                  You'll join our demo church with 3 sample members and see how FaithLink360 works with real community data.
                </p>
                
                <div className="bg-white p-4 rounded-lg shadow-sm max-w-md mx-auto">
                  <h4 className="font-medium text-gray-800 mb-2">First Community Church</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📍 Springfield, IL</p>
                    <p>⛪ Non-denominational</p>
                    <p>👥 3 demo members (Pastor, Leader, Member)</p>
                    <p>📅 Sample events and activities</p>
                    <p>🌱 Journey templates and member tracking</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-blue-600">
                    Optional: Enter demo join code <strong>DEMO2024</strong> or continue without it
                  </p>
                  <input
                    type="text"
                    placeholder="Enter DEMO2024 (optional)"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="mt-2 px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Demo church not available. Please create your own church instead.</p>
              <button
                onClick={() => setChurchChoice('create')}
                className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Create New Church →
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-4">🌟 Start Your Church Community</h3>
            <p className="text-green-700 mb-4">
              Create a new church community and invite others to join. You'll be the administrator and can customize everything.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-green-800 mb-2">
                Church Name *
              </label>
              <input
                type="text"
                placeholder="e.g., Grace Community Church, New Life Fellowship..."
                value={newChurchName}
                onChange={(e) => setNewChurchName(e.target.value)}
                className="w-full px-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="mt-1 text-xs text-green-600">
                Choose a name that reflects your community's values and mission
              </p>
            </div>

            {newChurchName.trim() && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                <p className="text-sm text-green-700">
                  <strong>Preview:</strong> You'll create "{newChurchName.trim()}" and receive a unique join code to share with others.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-8">
        {onBack && (
          <button
            onClick={onBack}
            className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ← Back
          </button>
        )}
        
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-auto"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
