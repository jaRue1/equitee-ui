'use client'

import { useState, useEffect } from 'react'

interface UserProfile {
  name?: string
  age?: number
  golfExperience: 'never-played' | 'beginner' | 'intermediate'
  location?: { lat: number; lng: number }
  zipCode?: string
  interests: string[]
  completedSteps: string[]
}

interface Recommendation {
  id: string
  type: 'course' | 'equipment' | 'program' | 'tip'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  actionText: string
  icon: string
  estimatedTime?: string
  price?: string
  distance?: string
  completed?: boolean
}

interface RecommendationEngineProps {
  userProfile?: UserProfile
  onActionClick: (recommendation: Recommendation) => void
  isVisible: boolean
  onToggle: () => void
}

export default function RecommendationEngine({
  userProfile,
  onActionClick,
  isVisible,
  onToggle
}: RecommendationEngineProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])

  // Generate personalized recommendations based on user profile
  useEffect(() => {
    if (!userProfile) {
      setRecommendations(getDefaultRecommendations())
      return
    }

    const personalized = generatePersonalizedRecommendations(userProfile)
    setRecommendations(personalized)
  }, [userProfile])

  const getDefaultRecommendations = (): Recommendation[] => [
    {
      id: 'quick-start',
      type: 'program',
      title: 'Take Our 2-Minute Golf Quiz',
      description: 'Get personalized recommendations instantly',
      priority: 'high',
      actionText: 'Start Quiz',
      icon: '🎯',
      estimatedTime: '2 min'
    },
    {
      id: 'explore-courses',
      type: 'course',
      title: 'Explore Beginner-Friendly Courses',
      description: 'Find welcoming courses with youth programs',
      priority: 'medium',
      actionText: 'Browse Courses',
      icon: '🏌️',
    },
    {
      id: 'free-equipment',
      type: 'equipment',
      title: 'Find Free Equipment',
      description: 'Get started without breaking the bank',
      priority: 'medium',
      actionText: 'View Free Gear',
      icon: '🎁',
    }
  ]

  const generatePersonalizedRecommendations = (profile: UserProfile): Recommendation[] => {
    const recs: Recommendation[] = []

    // Step 1: Equipment (if never played)
    if (profile.golfExperience === 'never-played') {
      recs.push({
        id: 'first-equipment',
        type: 'equipment',
        title: 'Get Your First Golf Set',
        description: 'Perfect starter set for absolute beginners',
        priority: 'high',
        actionText: 'Find Beginner Set',
        icon: '🏌️',
        price: 'Free - $75',
        distance: '1.2 miles'
      })
    }

    // Step 2: First lesson/course (Crandon Golf Course - beginner friendly)
    recs.push({
      id: 'first-lesson',
      type: 'course',
      title: profile.age && profile.age < 16 ? 'Join Junior Golf Academy' : 'Book Your First Lesson',
      description: profile.age && profile.age < 16
        ? 'Meet other young golfers and learn together at Crandon Golf Course'
        : 'Start with a professional instructor at our recommended course',
      priority: 'high',
      actionText: profile.age && profile.age < 16 ? 'Join Academy' : 'Book Lesson',
      icon: '🎓',
      price: profile.age && profile.age < 16 ? '$40/session' : '$65/hour',
      distance: '0.9 miles',
      location: { lat: 25.7085, lng: -80.1617 }, // Crandon Golf Course
      courseId: '2'
    })

    // Step 3: Practice facility (Fontainebleau Golf Course)
    recs.push({
      id: 'practice-range',
      type: 'course',
      title: 'Find a Practice Range',
      description: 'Perfect your swing at Fontainebleau driving range',
      priority: 'medium',
      actionText: 'Visit Range',
      icon: '🎯',
      price: '$15-25',
      distance: '1.5 miles',
      location: { lat: 25.7753, lng: -80.3267 }, // Fontainebleau Golf Course
      courseId: '3'
    })

    // Step 4: Beginner-friendly course (Palmetto Golf Course)
    if (profile.golfExperience !== 'never-played') {
      recs.push({
        id: 'beginner-course',
        type: 'course',
        title: 'Play Your First Round',
        description: 'Youth-friendly course perfect for beginners',
        priority: 'medium',
        actionText: 'Book Round',
        icon: '⛳',
        price: '$30-50',
        distance: '2.1 miles',
        location: { lat: 25.6789, lng: -80.3456 }, // Palmetto Golf Course
        courseId: '4'
      })
    }

    // Step 5: Golf tip
    recs.push({
      id: 'golf-tip',
      type: 'tip',
      title: 'Pro Tip: Grip Basics',
      description: 'Master the fundamentals before your first swing',
      priority: 'low',
      actionText: 'Watch Video',
      icon: '💡',
      estimatedTime: '3 min'
    })

    return recs
  }

  const progressPercentage = userProfile?.completedSteps?.length
    ? (userProfile.completedSteps.length / recommendations.length) * 100
    : 0

  return (
    <>
      {/* Floating Sidebar */}
      <div className={`
        fixed right-4 top-20 bottom-20 w-96 bg-white rounded-2xl shadow-2xl z-40
        transform transition-all duration-500 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}>
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold mb-1">
                {userProfile?.name ? `Hey ${userProfile.name}!` : 'Your Golf Journey'}
              </h2>
              <p className="text-green-100 text-sm">
                {userProfile?.golfExperience === 'never-played'
                  ? 'Let\'s get you started!'
                  : 'Your next steps await'}
              </p>
            </div>
            <button
              onClick={onToggle}
              className="text-white hover:text-gray-200 text-xl transform hover:scale-110 transition-transform"
            >
              {isVisible ? '→' : '←'}
            </button>
          </div>

          {/* Progress Bar */}
          {userProfile && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-700"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 h-full overflow-y-auto pb-20">
          {!userProfile ? (
            // Quick Start for new users
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🏌️</div>
              <h3 className="text-xl font-bold mb-2">New to Golf?</h3>
              <p className="text-gray-600 mb-6">
                Take our quick quiz to get personalized recommendations!
              </p>
              <button
                onClick={() => onActionClick(recommendations[0])}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
              >
                🎯 Start Your Golf Journey
              </button>
            </div>
          ) : (
            // Personalized recommendations
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">Recommended for You</h3>

              {recommendations.map((rec, index) => (
                <div
                  key={rec.id}
                  className={`
                    border rounded-xl p-4 transition-all duration-300 hover:shadow-lg transform hover:scale-102
                    ${rec.priority === 'high' ? 'border-green-200 bg-green-50' :
                      rec.priority === 'medium' ? 'border-blue-200 bg-blue-50' :
                      'border-gray-200 bg-gray-50'}
                    ${rec.completed ? 'opacity-60' : ''}
                  `}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{rec.icon}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-sm">{rec.title}</h4>
                        {rec.priority === 'high' && (
                          <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-xs mb-3">{rec.description}</p>

                      {/* Details */}
                      <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                        {rec.price && <span>💰 {rec.price}</span>}
                        {rec.distance && <span>📍 {rec.distance}</span>}
                        {rec.estimatedTime && <span>⏱️ {rec.estimatedTime}</span>}
                      </div>

                      <button
                        onClick={() => onActionClick(rec)}
                        disabled={rec.completed}
                        className={`
                          w-full py-2 px-4 rounded-lg text-sm font-medium transition-all
                          ${rec.completed
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : rec.priority === 'high'
                              ? 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105'
                              : 'bg-white border border-gray-300 hover:bg-gray-50 transform hover:scale-105'
                          }
                        `}
                      >
                        {rec.completed ? '✓ Completed' : rec.actionText}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-sm mb-3">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <button className="bg-white border border-gray-300 py-2 px-3 rounded-lg text-xs hover:bg-gray-50 transition-colors">
                📞 Contact Coach
              </button>
              <button className="bg-white border border-gray-300 py-2 px-3 rounded-lg text-xs hover:bg-gray-50 transition-colors">
                🗓️ Book Lesson
              </button>
              <button className="bg-white border border-gray-300 py-2 px-3 rounded-lg text-xs hover:bg-gray-50 transition-colors">
                🎁 Find Free Gear
              </button>
              <button className="bg-white border border-gray-300 py-2 px-3 rounded-lg text-xs hover:bg-gray-50 transition-colors">
                👥 Join Group
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Button (when sidebar is hidden) */}
      {!isVisible && (
        <button
          onClick={onToggle}
          className="fixed right-4 top-32 bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all z-30"
        >
          <span className="text-lg">🎯</span>
        </button>
      )}
    </>
  )
}