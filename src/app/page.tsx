'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import InteractiveMap from '@/components/InteractiveMap'
import RecommendationEngine from '@/components/RecommendationEngine'
import QuickStartWizard from '@/components/QuickStartWizard'
import GoogleAuth from '@/components/GoogleAuth'
import ProfileDropdown from '@/components/ProfileDropdown'
import mapboxgl from 'mapbox-gl'

interface Course {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  greenFeeMin: number
  greenFeeMax: number
  youthPrograms: boolean
  difficultyRating: number
  equipmentRental: boolean
}

interface UserProfile {
  name: string
  email: string
  age: number
  golfExperience: 'never-played' | 'beginner' | 'intermediate'
  zipCode: string
  userType: 'youth' | 'parent' | 'sponsor' | 'mentor'
  goals: string[]
  hasEquipment: boolean
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
  location?: { lat: number; lng: number }
  courseId?: string
}

export default function Home() {
  const { data: session } = useSession()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  // Load user profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('equitee-user-profile')
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile))
      } catch (error) {
        console.error('Error loading user profile:', error)
        localStorage.removeItem('equitee-user-profile')
      }
    }
  }, [])

  // Save user profile to localStorage whenever it changes
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('equitee-user-profile', JSON.stringify(userProfile))
    }
  }, [userProfile])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  const [isQuickStartOpen, setIsQuickStartOpen] = useState(false)
  const [sidebarMode, setSidebarMode] = useState<'recommendations' | 'course-detail'>('recommendations')
  const mapRef = useRef<mapboxgl.Map | null>(null)

  // Handle course selection from map
  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course)
    setSidebarMode('course-detail')
    setIsSidebarVisible(true)
  }

  // Handle recommendation clicks
  const handleRecommendationAction = (recommendation: Recommendation) => {
    if (recommendation.id === 'quick-start') {
      setIsQuickStartOpen(true)
      return
    }

    if (recommendation.type === 'course' && recommendation.location) {
      // Fly to location on map
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [recommendation.location.lng, recommendation.location.lat],
          zoom: 16, // Higher zoom level to match marker clicks
          duration: 1500
        })
      }
    }

    if (recommendation.type === 'equipment') {
      window.location.href = '/equipment'
    }

    // Mark as completed
    if (userProfile) {
      const updatedProfile = {
        ...userProfile,
        completedSteps: [...userProfile.completedSteps, recommendation.id]
      }
      setUserProfile(updatedProfile)
    }
  }

  // Handle quick start completion
  const handleQuickStartComplete = (profile: Omit<UserProfile, 'interests' | 'completedSteps'>) => {
    console.log('handleQuickStartComplete called with:', profile)
    const fullProfile: UserProfile = {
      ...profile,
      interests: [],
      completedSteps: []
    }
    console.log('Setting user profile to:', fullProfile)
    setUserProfile(fullProfile)
    setIsQuickStartOpen(false)
    setSidebarMode('recommendations')
    setIsSidebarVisible(true)

    // Mark onboarding as completed
    localStorage.setItem('equitee-onboarding-completed', 'true')
  }

  // Force onboarding for authenticated users without profile
  useEffect(() => {
    console.log('Session data:', session)
    const hasCompletedOnboarding = localStorage.getItem('equitee-onboarding-completed')

    if (session && !userProfile && !hasCompletedOnboarding) {
      console.log('Opening quick start for authenticated user without profile')
      setIsQuickStartOpen(true)
    }
  }, [session, userProfile])

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible)
  }

  // Go back to recommendations
  const backToRecommendations = () => {
    setSidebarMode('recommendations')
    setSelectedCourse(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100">
      {/* Streamlined Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 relative z-30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-2xl font-bold text-green-700">EquiTee</h1>
                <p className="text-sm text-gray-600">Your Golf Journey Starts Here</p>
              </div>

              {userProfile && (
                <div className="hidden md:flex items-center space-x-4 text-sm">
                  <span className="text-gray-600">Hey {userProfile.name}!</span>
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    {userProfile.golfExperience === 'never-played' ? '🌱 New Golfer' :
                     userProfile.golfExperience === 'beginner' ? '🎯 Beginner' : '⛳ Player'}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {!session ? (
                <GoogleAuth />
              ) : (
                <>
                  {userProfile && (
                    <>
                      <a
                        href="/equipment"
                        className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        Equipment
                      </a>

                      <a
                        href="/courses"
                        className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        Courses
                      </a>
                    </>
                  )}

                  <ProfileDropdown
                    userProfile={userProfile}
                    onResetProfile={() => {
                      localStorage.removeItem('equitee-user-profile')
                      localStorage.removeItem('equitee-onboarding-completed')
                      setUserProfile(null)
                      setSidebarMode('recommendations')
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-[calc(100vh-80px)] relative">
        <InteractiveMap
          onCourseSelect={handleCourseSelect}
          selectedCourseId={selectedCourse?.id}
          mapRef={mapRef}
        />

        {/* Unified Sidebar */}
        {sidebarMode === 'recommendations' ? (
          <RecommendationEngine
            userProfile={userProfile}
            onActionClick={handleRecommendationAction}
            isVisible={isSidebarVisible}
            onToggle={toggleSidebar}
          />
        ) : (
          <div className={`
            fixed right-4 top-20 bottom-20 w-96 bg-white rounded-2xl shadow-2xl z-40
            transform transition-all duration-500 ease-in-out
            ${isSidebarVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
          `}>
            {/* Course Detail Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <button
                  onClick={backToRecommendations}
                  className="text-white hover:text-gray-200 text-sm flex items-center space-x-1"
                >
                  <span>←</span>
                  <span>Back to Recommendations</span>
                </button>
                <button
                  onClick={toggleSidebar}
                  className="text-white hover:text-gray-200 text-xl"
                >
                  →
                </button>
              </div>

              {selectedCourse && (
                <div className="mt-4">
                  <h2 className="text-xl font-bold">{selectedCourse.name}</h2>
                  <p className="text-green-100 text-sm">{selectedCourse.address}</p>
                  <div className="flex items-center space-x-4 mt-3">
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                      ${selectedCourse.greenFeeMin}-${selectedCourse.greenFeeMax}
                    </span>
                    {selectedCourse.youthPrograms && (
                      <span className="bg-blue-400 px-3 py-1 rounded-full text-sm">
                        Youth Programs
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Course Detail Content */}
            <div className="p-4 overflow-y-auto h-full pb-20">
              {selectedCourse && (
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                      📞 Call Course
                    </button>
                    <button className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      🗓️ Book Tee Time
                    </button>
                  </div>

                  {/* Course Info */}
                  <div>
                    <h3 className="font-semibold mb-3">Course Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Difficulty</span>
                        <span>{selectedCourse.difficultyRating}/5 ⭐</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Equipment Rental</span>
                        <span>{selectedCourse.equipmentRental ? '✅ Available' : '❌ Not Available'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Youth Programs</span>
                        <span>{selectedCourse.youthPrograms ? '✅ Yes' : '❌ No'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Programs (if available) */}
                  {selectedCourse.youthPrograms && (
                    <div>
                      <h3 className="font-semibold mb-3">Youth Programs</h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Junior Golf Academy</h4>
                        <p className="text-gray-600 text-sm mb-3">
                          Perfect for young golfers to learn fundamentals and meet peers.
                        </p>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                          Learn More
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Distance & Directions */}
                  <div>
                    <h3 className="font-semibold mb-3">Getting There</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-3">{selectedCourse.address}</p>
                      <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                        🗺️ Get Directions
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Toggle Button (when sidebar is hidden) */}
        {!isSidebarVisible && (
          <button
            onClick={toggleSidebar}
            className="fixed right-4 top-32 bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all z-30"
          >
            <span className="text-lg">🎯</span>
          </button>
        )}
      </div>

      {/* Quick Start Wizard */}
      <QuickStartWizard
        isOpen={isQuickStartOpen}
        onClose={() => setIsQuickStartOpen(false)}
        onComplete={handleQuickStartComplete}
        googleUser={session?.user}
        forced={session && !userProfile ? true : false}
      />
    </main>
  )
}