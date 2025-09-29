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
  }, [searchTerm, selectedDenomination]);

  const fetchChurches = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedDenomination !== 'all') params.append('denomination', selectedDenomination);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/churches?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setChurches(data.churches);
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Church Community</h1>
        <p className="text-gray-600">Join an existing church or start your own community</p>
      </div>

      {/* Church Choice Toggle */}
      <div className="bg-gray-100 p-1 rounded-lg mb-6 flex">
        <button
          onClick={() => setChurchChoice('join')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
            churchChoice === 'join'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🏛️ Join Existing Church
        </button>
        <button
          onClick={() => setChurchChoice('create')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
            churchChoice === 'create'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          ✨ Start New Church
        </button>
      </div>

      {churchChoice === 'join' ? (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search churches by name, location, or denomination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={selectedDenomination}
              onChange={(e) => setSelectedDenomination(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {denominations.map(denom => (
                <option key={denom} value={denom}>
                  {denom === 'all' ? 'All Denominations' : denom.charAt(0).toUpperCase() + denom.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Churches List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Finding churches...</p>
              </div>
            ) : churches.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No churches found matching your criteria.</p>
                <button
                  onClick={() => setChurchChoice('create')}
                  className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Start your own church instead →
                </button>
              </div>
            ) : (
              churches.map((church) => (
                <div
                  key={church.id}
                  className={`border rounded-lg p-4 transition-all cursor-pointer ${
                    selectedChurch?.id === church.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleChurchSelect(church)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-800">{church.name}</h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {church.denomination}
                        </span>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{church.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{church.size}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Since {church.founded}</span>
                        </div>
                        {church.website && (
                          <div className="flex items-center space-x-1">
                            <Globe className="w-4 h-4" />
                            <span>Website</span>
                          </div>
                        )}
                      </div>

                      {expandedChurch === church.id && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-gray-700 mb-3">{church.description}</p>
                          <div className="text-sm text-gray-600">
                            <p><strong>Current Members:</strong> {church.memberCount}</p>
                            {church.website && (
                              <p><strong>Website:</strong> 
                                <a href={church.website} target="_blank" rel="noopener noreferrer" 
                                   className="text-blue-600 hover:text-blue-700 ml-1">
                                  {church.website}
                                </a>
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedChurch(expandedChurch === church.id ? null : church.id);
                      }}
                      className="ml-4 p-1 hover:bg-gray-100 rounded"
                    >
                      {expandedChurch === church.id ? 
                        <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      }
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Join Code Input */}
          {selectedChurch && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-blue-800">Selected: {selectedChurch.name}</h4>
                <button
                  onClick={() => setShowJoinCodeInput(!showJoinCodeInput)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {showJoinCodeInput ? 'Hide' : 'Have a'} join code?
                </button>
              </div>
              
              {showJoinCodeInput && (
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Enter join code (optional)"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-blue-600">
                    Join codes are provided by church administrators for easier joining
                  </p>
                </div>
              )}
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
