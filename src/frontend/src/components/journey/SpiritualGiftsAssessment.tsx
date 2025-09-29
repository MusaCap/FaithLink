'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Star, 
  CheckCircle, 
  Circle, 
  Heart, 
  Users, 
  Mic, 
  BookOpen, 
  Users2,
  Building,
  Music,
  Paintbrush,
  Lightbulb,
  Shield,
  Gift,
  Save,
  RefreshCw
} from 'lucide-react';

interface SpiritualGift {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'serving' | 'teaching' | 'leadership' | 'creative';
}

interface AssessmentQuestion {
  id: string;
  question: string;
  giftIds: string[];
}

interface AssessmentResult {
  giftId: string;
  score: number;
  percentage: number;
}

const spiritualGifts: SpiritualGift[] = [
  {
    id: 'leadership',
    name: 'Leadership',
    description: 'The ability to influence and guide others toward common goals',
    icon: Users,
    category: 'leadership'
  },
  {
    id: 'teaching',
    name: 'Teaching',
    description: 'The ability to communicate biblical truths effectively',
    icon: BookOpen,
    category: 'teaching'
  },
  {
    id: 'serving',
    name: 'Serving/Helps',
    description: 'The desire and ability to assist others in practical ways',
    icon: Users2,
    category: 'serving'
  },
  {
    id: 'hospitality',
    name: 'Hospitality',
    description: 'The gift of making others feel welcomed and cared for',
    icon: Heart,
    category: 'serving'
  },
  {
    id: 'administration',
    name: 'Administration',
    description: 'The ability to organize and coordinate activities effectively',
    icon: Building,
    category: 'leadership'
  },
  {
    id: 'music',
    name: 'Music/Worship',
    description: 'The ability to lead others in worship through music',
    icon: Music,
    category: 'creative'
  },
  {
    id: 'creative',
    name: 'Creative Arts',
    description: 'The ability to express faith through various art forms',
    icon: Paintbrush,
    category: 'creative'
  },
  {
    id: 'encouragement',
    name: 'Encouragement',
    description: 'The ability to strengthen and support others in their faith',
    icon: Lightbulb,
    category: 'teaching'
  },
  {
    id: 'evangelism',
    name: 'Evangelism',
    description: 'The ability to share the gospel effectively with others',
    icon: Mic,
    category: 'teaching'
  },
  {
    id: 'intercession',
    name: 'Intercession/Prayer',
    description: 'The calling to pray consistently and effectively for others',
    icon: Shield,
    category: 'serving'
  }
];

const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: '1',
    question: 'I enjoy organizing events and coordinating details',
    giftIds: ['administration', 'leadership']
  },
  {
    id: '2',
    question: 'I find fulfillment in helping others with practical needs',
    giftIds: ['serving', 'hospitality']
  },
  {
    id: '3',
    question: 'I am comfortable speaking in front of groups',
    giftIds: ['teaching', 'leadership', 'evangelism']
  },
  {
    id: '4',
    question: 'I enjoy creating things that express my faith',
    giftIds: ['creative', 'music']
  },
  {
    id: '5',
    question: 'People often come to me for spiritual guidance',
    giftIds: ['teaching', 'encouragement', 'leadership']
  },
  {
    id: '6',
    question: 'I love making guests feel welcome in my home or church',
    giftIds: ['hospitality', 'serving']
  },
  {
    id: '7',
    question: 'I am passionate about sharing my faith with non-believers',
    giftIds: ['evangelism', 'teaching']
  },
  {
    id: '8',
    question: 'I often spend significant time in prayer for others',
    giftIds: ['intercession', 'encouragement']
  },
  {
    id: '9',
    question: 'I can easily see the steps needed to accomplish a goal',
    giftIds: ['administration', 'leadership']
  },
  {
    id: '10',
    question: 'I enjoy working behind the scenes to support ministry',
    giftIds: ['serving', 'administration']
  },
  {
    id: '11',
    question: 'Music and worship are deeply meaningful to me',
    giftIds: ['music', 'creative']
  },
  {
    id: '12',
    question: 'I can sense when someone needs encouragement',
    giftIds: ['encouragement', 'hospitality', 'intercession']
  },
  {
    id: '13',
    question: 'I enjoy studying and explaining biblical concepts',
    giftIds: ['teaching', 'evangelism']
  },
  {
    id: '14',
    question: 'I am comfortable making decisions for a group',
    giftIds: ['leadership', 'administration']
  },
  {
    id: '15',
    question: 'I find joy in the small, unnoticed acts of service',
    giftIds: ['serving', 'hospitality']
  }
];

export default function SpiritualGiftsAssessment() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'intro' | 'assessment' | 'results'>('intro');
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [saving, setSaving] = useState(false);

  const handleResponse = (questionId: string, score: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: score
    }));
  };

  const calculateResults = () => {
    const giftScores: Record<string, number> = {};
    
    // Initialize all gifts with 0 score
    spiritualGifts.forEach(gift => {
      giftScores[gift.id] = 0;
    });

    // Calculate scores based on responses
    assessmentQuestions.forEach(question => {
      const response = responses[question.id] || 0;
      question.giftIds.forEach(giftId => {
        giftScores[giftId] += response;
      });
    });

    // Convert to results with percentages
    const maxPossibleScore = Math.max(...Object.values(giftScores));
    const calculatedResults: AssessmentResult[] = Object.entries(giftScores)
      .map(([giftId, score]) => ({
        giftId,
        score,
        percentage: maxPossibleScore > 0 ? Math.round((score / maxPossibleScore) * 100) : 0
      }))
      .sort((a, b) => b.score - a.score);

    setResults(calculatedResults);
    setCurrentStep('results');
  };

  const saveResults = async () => {
    setSaving(true);
    try {
      // Here you would save to backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
      console.log('Spiritual gifts results saved:', results);
    } catch (error) {
      console.error('Failed to save results:', error);
    } finally {
      setSaving(false);
    }
  };

  const getGiftIcon = (giftId: string) => {
    const gift = spiritualGifts.find(g => g.id === giftId);
    const IconComponent = gift?.icon || Gift;
    return <IconComponent className="w-6 h-6" />;
  };

  const getGiftDetails = (giftId: string) => {
    return spiritualGifts.find(g => g.id === giftId);
  };

  const isComplete = Object.keys(responses).length === assessmentQuestions.length;

  if (currentStep === 'intro') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="w-8 h-8 text-primary-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Discover Your Spiritual Gifts
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            God has uniquely gifted each believer to serve His kingdom. This assessment will help you 
            identify your spiritual gifts and discover how you can best serve in ministry.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8 text-left">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">What You'll Discover</h3>
              <ul className="text-blue-800 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Your top spiritual gifts
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Ministry opportunities that fit you
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Ways to serve effectively
                </li>
              </ul>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">How It Works</h3>
              <ul className="text-green-800 space-y-2">
                <li className="flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  15 quick questions
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  Rate your agreement (1-5 scale)
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  Get personalized results
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => setCurrentStep('assessment')}
            className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 font-medium text-lg"
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 'assessment') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Spiritual Gifts Assessment</h1>
              <span className="text-sm text-gray-600">
                {Object.keys(responses).length} of {assessmentQuestions.length} completed
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(Object.keys(responses).length / assessmentQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-6">
            {assessmentQuestions.map((question, index) => (
              <div key={question.id} className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {index + 1}. {question.question}
                </h3>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Strongly Disagree</span>
                  <div className="flex space-x-3">
                    {[1, 2, 3, 4, 5].map(score => (
                      <button
                        key={score}
                        onClick={() => handleResponse(question.id, score)}
                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-medium transition-all ${
                          responses[question.id] === score
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-300 hover:border-primary-300 text-gray-600'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">Strongly Agree</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={calculateResults}
              disabled={!isComplete}
              className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Calculate Results</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Spiritual Gifts</h1>
          <p className="text-gray-600">Here are your top spiritual gifts based on the assessment</p>
        </div>

        <div className="space-y-4 mb-8">
          {results.slice(0, 5).map((result, index) => {
            const gift = getGiftDetails(result.giftId);
            if (!gift) return null;

            return (
              <div key={result.giftId} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mr-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-yellow-100 text-yellow-600' :
                    index === 1 ? 'bg-gray-100 text-gray-600' :
                    index === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {getGiftIcon(result.giftId)}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">{gift.name}</h3>
                    <span className="text-sm font-medium text-gray-600">{result.percentage}%</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{gift.description}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-500' :
                        index === 2 ? 'bg-orange-500' :
                        'bg-blue-500'
                      }`}
                      style={{ width: `${result.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">Next Steps</h3>
          <ul className="text-blue-800 space-y-2">
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Explore serving opportunities that match your gifts
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Connect with ministry leaders in your areas of strength
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Consider how to develop and use these gifts for God's glory
            </li>
          </ul>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setCurrentStep('intro')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Retake Assessment
          </button>
          <button
            onClick={saveResults}
            disabled={saving}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Results</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
