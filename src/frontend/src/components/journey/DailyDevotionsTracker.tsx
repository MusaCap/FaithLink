'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar, 
  BookOpen, 
  Heart, 
  CheckCircle,
  Circle,
  Plus,
  Clock,
  Target,
  TrendingUp,
  Award,
  Flame,
  Star,
  Edit,
  Save,
  X,
  Quote,
  Lightbulb
} from 'lucide-react';

interface DevotionEntry {
  id: string;
  date: string;
  scripture: string;
  prayerTime: number; // minutes
  reflection: string;
  keyVerse?: string;
  prayerRequests: string[];
  gratitude: string[];
  completed: boolean;
}

interface DevotionGoal {
  id: string;
  type: 'daily_reading' | 'prayer_time' | 'consistency';
  target: number;
  current: number;
  period: 'daily' | 'weekly' | 'monthly';
  description: string;
}

const bibleReadingPlans = [
  { id: 'chronological', name: 'Chronological Bible', duration: '365 days' },
  { id: 'through_bible', name: 'Through the Bible in a Year', duration: '365 days' },
  { id: 'psalms_proverbs', name: 'Psalms & Proverbs', duration: '31 days' },
  { id: 'gospels', name: 'Four Gospels', duration: '90 days' },
  { id: 'new_testament', name: 'New Testament', duration: '180 days' }
];

const defaultGoals: DevotionGoal[] = [
  {
    id: 'daily_reading',
    type: 'daily_reading',
    target: 1,
    current: 0,
    period: 'daily',
    description: 'Complete daily Bible reading'
  },
  {
    id: 'prayer_time',
    type: 'prayer_time',
    target: 15,
    current: 0,
    period: 'daily',
    description: 'Spend 15 minutes in prayer daily'
  },
  {
    id: 'consistency',
    type: 'consistency',
    target: 7,
    current: 0,
    period: 'weekly',
    description: 'Maintain 7-day devotion streak'
  }
];

export default function DailyDevotionsTracker() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'overview' | 'today' | 'history' | 'goals'>('overview');
  const [devotionEntries, setDevotionEntries] = useState<DevotionEntry[]>([]);
  const [goals, setGoals] = useState<DevotionGoal[]>(defaultGoals);
  const [selectedPlan, setSelectedPlan] = useState<string>('through_bible');
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  // Today's devotion state
  const [todayEntry, setTodayEntry] = useState<Partial<DevotionEntry>>({
    date: new Date().toISOString().split('T')[0],
    scripture: '',
    prayerTime: 0,
    reflection: '',
    keyVerse: '',
    prayerRequests: [''],
    gratitude: [''],
    completed: false
  });

  const today = new Date().toISOString().split('T')[0];
  const todaysEntry = devotionEntries.find(entry => entry.date === today);

  useEffect(() => {
    // Calculate current streak
    let streak = 0;
    const sortedEntries = [...devotionEntries]
      .filter(entry => entry.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const currentDate = new Date();
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      const daysDiff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        streak++;
      } else {
        break;
      }
    }
    setCurrentStreak(streak);
  }, [devotionEntries]);

  const handleTodayEntryUpdate = (field: keyof DevotionEntry, value: any) => {
    setTodayEntry(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayFieldUpdate = (field: 'prayerRequests' | 'gratitude', index: number, value: string) => {
    setTodayEntry(prev => ({
      ...prev,
      [field]: prev[field]?.map((item, i) => i === index ? value : item) || [value]
    }));
  };

  const addArrayField = (field: 'prayerRequests' | 'gratitude') => {
    setTodayEntry(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), '']
    }));
  };

  const removeArrayField = (field: 'prayerRequests' | 'gratitude', index: number) => {
    setTodayEntry(prev => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index) || []
    }));
  };

  const saveTodayEntry = () => {
    const entry: DevotionEntry = {
      id: today,
      date: today,
      scripture: todayEntry.scripture || '',
      prayerTime: todayEntry.prayerTime || 0,
      reflection: todayEntry.reflection || '',
      keyVerse: todayEntry.keyVerse || '',
      prayerRequests: todayEntry.prayerRequests?.filter(req => req.trim()) || [],
      gratitude: todayEntry.gratitude?.filter(grat => grat.trim()) || [],
      completed: !!(todayEntry.scripture && todayEntry.reflection)
    };

    setDevotionEntries(prev => {
      const filtered = prev.filter(e => e.date !== today);
      return [...filtered, entry];
    });
    setIsEditing(false);
  };

  const getStreakIcon = (streak: number) => {
    if (streak >= 30) return <Award className="w-6 h-6 text-yellow-500" />;
    if (streak >= 14) return <Star className="w-6 h-6 text-blue-500" />;
    if (streak >= 7) return <Flame className="w-6 h-6 text-orange-500" />;
    return <Target className="w-6 h-6 text-gray-400" />;
  };

  const getCompletionRate = (days: number = 30) => {
    const recentEntries = devotionEntries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return entryDate >= cutoffDate;
      });
    
    const completedCount = recentEntries.filter(entry => entry.completed).length;
    return recentEntries.length > 0 ? Math.round((completedCount / recentEntries.length) * 100) : 0;
  };

  if (currentView === 'overview') {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Devotions</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Build a consistent habit of spending time with God through prayer, Bible reading, and reflection.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {getStreakIcon(currentStreak)}
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{currentStreak}</h3>
              <p className="text-gray-600">Day Streak</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{getCompletionRate()}%</h3>
              <p className="text-gray-600">Completion Rate</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">
                {Math.round(devotionEntries.reduce((sum, entry) => sum + entry.prayerTime, 0) / Math.max(devotionEntries.length, 1))}
              </h3>
              <p className="text-gray-600">Avg Prayer (min)</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{devotionEntries.length}</h3>
              <p className="text-gray-600">Total Entries</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => setCurrentView('today')}
              className="p-6 border-2 border-dashed border-primary-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
            >
              <Calendar className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Today's Devotion</h3>
              <p className="text-gray-600 text-sm">Record your daily time with God</p>
            </button>

            <button
              onClick={() => setCurrentView('history')}
              className="p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
            >
              <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Devotion History</h3>
              <p className="text-gray-600 text-sm">Review past reflections and growth</p>
            </button>

            <button
              onClick={() => setCurrentView('goals')}
              className="p-6 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
            >
              <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Goals & Plans</h3>
              <p className="text-gray-600 text-sm">Set reading plans and prayer goals</p>
            </button>
          </div>

          {/* Today's Status */}
          {todaysEntry ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-900">Today's devotion completed!</h3>
                    <p className="text-green-700 text-sm">
                      {todaysEntry.prayerTime} minutes of prayer • {todaysEntry.scripture}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentView('today')}
                  className="text-green-600 hover:text-green-700"
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Circle className="w-6 h-6 text-yellow-600" />
                  <div>
                    <h3 className="font-semibold text-yellow-900">Complete today's devotion</h3>
                    <p className="text-yellow-700 text-sm">
                      Take time to read, pray, and reflect with God today
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentView('today')}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
                >
                  Start Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentView === 'today') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Today's Devotion</h1>
              <p className="text-gray-600">{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
            <button
              onClick={() => setCurrentView('overview')}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Scripture Reading */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="w-4 h-4 inline mr-2" />
                Scripture Reading
              </label>
              <input
                type="text"
                value={todayEntry.scripture || ''}
                onChange={(e) => handleTodayEntryUpdate('scripture', e.target.value)}
                placeholder="e.g., Psalm 23, John 3:16-21, Matthew 5:1-12"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Prayer Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Prayer Time (minutes)
              </label>
              <input
                type="number"
                value={todayEntry.prayerTime || ''}
                onChange={(e) => handleTodayEntryUpdate('prayerTime', parseInt(e.target.value) || 0)}
                placeholder="15"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Key Verse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Quote className="w-4 h-4 inline mr-2" />
                Key Verse (optional)
              </label>
              <textarea
                value={todayEntry.keyVerse || ''}
                onChange={(e) => handleTodayEntryUpdate('keyVerse', e.target.value)}
                placeholder="Write out a verse that stood out to you..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Reflection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lightbulb className="w-4 h-4 inline mr-2" />
                Reflection & Insights
              </label>
              <textarea
                value={todayEntry.reflection || ''}
                onChange={(e) => handleTodayEntryUpdate('reflection', e.target.value)}
                placeholder="What did God speak to you today? What insights did you gain from your reading?"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Prayer Requests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Heart className="w-4 h-4 inline mr-2" />
                Prayer Requests
              </label>
              {(todayEntry.prayerRequests || ['']).map((request, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={request}
                    onChange={(e) => handleArrayFieldUpdate('prayerRequests', index, e.target.value)}
                    placeholder="What are you praying for today?"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  {(todayEntry.prayerRequests?.length || 0) > 1 && (
                    <button
                      onClick={() => removeArrayField('prayerRequests', index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addArrayField('prayerRequests')}
                className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add another request
              </button>
            </div>

            {/* Gratitude */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Star className="w-4 h-4 inline mr-2" />
                Gratitude
              </label>
              {(todayEntry.gratitude || ['']).map((gratitude, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={gratitude}
                    onChange={(e) => handleArrayFieldUpdate('gratitude', index, e.target.value)}
                    placeholder="What are you thankful for today?"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  {(todayEntry.gratitude?.length || 0) > 1 && (
                    <button
                      onClick={() => removeArrayField('gratitude', index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addArrayField('gratitude')}
                className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add another gratitude
              </button>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={saveTodayEntry}
              disabled={!todayEntry.scripture || !todayEntry.reflection}
              className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>Save Devotion</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default return for other views
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h2>
        <p className="text-gray-600 mb-4">This view is under development</p>
        <button
          onClick={() => setCurrentView('overview')}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
        >
          Back to Overview
        </button>
      </div>
    </div>
  );
}
