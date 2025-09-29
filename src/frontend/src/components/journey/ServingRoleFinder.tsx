'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  Clock, 
  Users, 
  Heart, 
  MapPin, 
  Calendar, 
  CheckCircle,
  Star,
  Filter,
  ArrowRight,
  UserPlus,
  Music,
  BookOpen,
  Users2,
  Coffee,
  Camera,
  Mic,
  Building,
  Baby,
  Shield
} from 'lucide-react';

interface Ministry {
  id: string;
  name: string;
  department: string;
  description: string;
  timeCommitment: string;
  schedule: string;
  location: string;
  teamSize: number;
  currentNeeds: number;
  leader: string;
  skills: string[];
  spiritualGifts: string[];
  icon: React.ComponentType<any>;
  isUrgent?: boolean;
}

interface UserInterest {
  ministryId: string;
  interestLevel: 'interested' | 'very_interested' | 'applied';
  notes?: string;
}

const ministries: Ministry[] = [
  {
    id: 'worship-team',
    name: 'Worship Team',
    department: 'Worship & Arts',
    description: 'Lead the congregation in worship through music, vocals, and technical support',
    timeCommitment: '4-6 hours/week',
    schedule: 'Sundays + 1 practice/week',
    location: 'Main Sanctuary',
    teamSize: 12,
    currentNeeds: 3,
    leader: 'Pastor Michael',
    skills: ['Musical instruments', 'Vocals', 'Sound/Tech'],
    spiritualGifts: ['music', 'creative', 'serving'],
    icon: Music,
    isUrgent: true
  },
  {
    id: 'childrens-ministry',
    name: "Children's Ministry",
    department: 'Family Ministries',
    description: 'Teach and care for children ages 0-12 during services and special events',
    timeCommitment: '2-3 hours/week',
    schedule: 'Sunday mornings',
    location: 'Children\'s Wing',
    teamSize: 18,
    currentNeeds: 5,
    leader: 'Sarah Johnson',
    skills: ['Working with children', 'Teaching', 'Patience'],
    spiritualGifts: ['teaching', 'serving', 'hospitality'],
    icon: Baby
  },
  {
    id: 'youth-ministry',
    name: 'Youth Ministry',
    department: 'Family Ministries',
    description: 'Mentor and guide teenagers in their faith journey through fun and meaningful activities',
    timeCommitment: '3-4 hours/week',
    schedule: 'Wednesday evenings + events',
    location: 'Youth Center',
    teamSize: 8,
    currentNeeds: 2,
    leader: 'Pastor David',
    skills: ['Youth engagement', 'Leadership', 'Event planning'],
    spiritualGifts: ['leadership', 'encouragement', 'teaching'],
    icon: Users
  },
  {
    id: 'hospitality-team',
    name: 'Hospitality Team',
    department: 'Connections',
    description: 'Welcome guests and help create a warm, inviting atmosphere for all who visit',
    timeCommitment: '2 hours/week',
    schedule: 'Sunday mornings',
    location: 'Main Lobby',
    teamSize: 15,
    currentNeeds: 4,
    leader: 'Linda Martinez',
    skills: ['People skills', 'Welcoming nature', 'Organization'],
    spiritualGifts: ['hospitality', 'serving', 'encouragement'],
    icon: Coffee
  },
  {
    id: 'small-group-leader',
    name: 'Small Group Leader',
    department: 'Discipleship',
    description: 'Lead a small group in Bible study, prayer, and fellowship',
    timeCommitment: '3-4 hours/week',
    schedule: 'Weekly group + prep time',
    location: 'Various homes',
    teamSize: 6,
    currentNeeds: 3,
    leader: 'Pastor John',
    skills: ['Bible knowledge', 'Leadership', 'Facilitating discussion'],
    spiritualGifts: ['teaching', 'leadership', 'encouragement'],
    icon: BookOpen,
    isUrgent: true
  },
  {
    id: 'prayer-ministry',
    name: 'Prayer Ministry',
    department: 'Spiritual Care',
    description: 'Provide prayer support for individuals and coordinate church-wide prayer initiatives',
    timeCommitment: '2-3 hours/week',
    schedule: 'Flexible schedule',
    location: 'Prayer Room',
    teamSize: 10,
    currentNeeds: 2,
    leader: 'Mary Thompson',
    skills: ['Prayer life', 'Confidentiality', 'Compassion'],
    spiritualGifts: ['intercession', 'encouragement', 'serving'],
    icon: Shield
  },
  {
    id: 'media-team',
    name: 'Media & Production',
    department: 'Worship & Arts',
    description: 'Handle video production, live streaming, and visual presentations for services',
    timeCommitment: '3-4 hours/week',
    schedule: 'Sundays + prep time',
    location: 'Media Booth',
    teamSize: 6,
    currentNeeds: 2,
    leader: 'Tech Team Lead',
    skills: ['Video production', 'Technical skills', 'Computer proficiency'],
    spiritualGifts: ['serving', 'creative', 'administration'],
    icon: Camera
  },
  {
    id: 'outreach-team',
    name: 'Community Outreach',
    department: 'Missions',
    description: 'Organize and participate in community service projects and evangelistic events',
    timeCommitment: '4-5 hours/month',
    schedule: 'Monthly events',
    location: 'Community venues',
    teamSize: 12,
    currentNeeds: 6,
    leader: 'Mission Director',
    skills: ['Event coordination', 'Public interaction', 'Heart for service'],
    spiritualGifts: ['evangelism', 'serving', 'leadership'],
    icon: Heart
  }
];

export default function ServingRoleFinder() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedCommitment, setSelectedCommitment] = useState<string>('all');
  const [userInterests, setUserInterests] = useState<UserInterest[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const departments = Array.from(new Set(ministries.map(m => m.department)));
  const commitmentLevels = Array.from(new Set(ministries.map(m => m.timeCommitment)));

  const filteredMinistries = ministries.filter(ministry => {
    const matchesSearch = ministry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ministry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ministry.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = selectedDepartment === 'all' || ministry.department === selectedDepartment;
    const matchesCommitment = selectedCommitment === 'all' || ministry.timeCommitment === selectedCommitment;
    
    return matchesSearch && matchesDepartment && matchesCommitment;
  });

  const handleInterestChange = (ministryId: string, level: UserInterest['interestLevel']) => {
    setUserInterests(prev => {
      const existing = prev.find(i => i.ministryId === ministryId);
      if (existing) {
        return prev.map(i => 
          i.ministryId === ministryId ? { ...i, interestLevel: level } : i
        );
      } else {
        return [...prev, { ministryId, interestLevel: level }];
      }
    });
  };

  const getUserInterest = (ministryId: string): UserInterest | undefined => {
    return userInterests.find(i => i.ministryId === ministryId);
  };

  const getInterestColor = (level: UserInterest['interestLevel']) => {
    switch (level) {
      case 'interested':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'very_interested':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'applied':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Serving Role</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover ministry opportunities that align with your spiritual gifts, interests, and availability. 
            Every role matters in building God's kingdom.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search ministries, skills, or interests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Commitment</label>
                <select
                  value={selectedCommitment}
                  onChange={(e) => setSelectedCommitment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">Any Time Commitment</option>
                  {commitmentLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Ministry Cards */}
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredMinistries.map(ministry => {
            const IconComponent = ministry.icon;
            const userInterest = getUserInterest(ministry.id);
            
            return (
              <div key={ministry.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                        <span>{ministry.name}</span>
                        {ministry.isUrgent && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            Urgent Need
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">{ministry.department}</p>
                    </div>
                  </div>
                  
                  {userInterest && (
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getInterestColor(userInterest.interestLevel)}`}>
                      {userInterest.interestLevel.replace('_', ' ')}
                    </span>
                  )}
                </div>

                <p className="text-gray-700 mb-4">{ministry.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    {ministry.timeCommitment}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {ministry.schedule}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {ministry.location}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    {ministry.teamSize} team members
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Skills Needed:</p>
                  <div className="flex flex-wrap gap-2">
                    {ministry.skills.map(skill => (
                      <span key={skill} className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Spiritual Gifts:</p>
                  <div className="flex flex-wrap gap-2">
                    {ministry.spiritualGifts.map(gift => (
                      <span key={gift} className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        {gift}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{ministry.currentNeeds}</span> positions needed
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <select
                      value={userInterest?.interestLevel || ''}
                      onChange={(e) => e.target.value && handleInterestChange(ministry.id, e.target.value as UserInterest['interestLevel'])}
                      className="text-sm px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Mark Interest</option>
                      <option value="interested">Interested</option>
                      <option value="very_interested">Very Interested</option>
                      <option value="applied">Applied</option>
                    </select>
                    
                    <button className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 flex items-center space-x-1">
                      <span>Contact Leader</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMinistries.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No ministries found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Next Steps */}
        {userInterests.length > 0 && (
          <div className="mt-8 bg-green-50 p-6 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-4">Your Ministry Interests ({userInterests.length})</h3>
            <div className="space-y-2 mb-4">
              {userInterests.map(interest => {
                const ministry = ministries.find(m => m.id === interest.ministryId);
                return ministry ? (
                  <div key={interest.ministryId} className="flex items-center justify-between bg-white p-3 rounded">
                    <span className="font-medium">{ministry.name}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getInterestColor(interest.interestLevel)}`}>
                      {interest.interestLevel.replace('_', ' ')}
                    </span>
                  </div>
                ) : null;
              })}
            </div>
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Submit Ministry Interests</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
