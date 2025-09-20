'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import InteractiveMap from '@/components/map/InteractiveMap'
import RecommendationEngine from '@/components/RecommendationEngine'
import QuickStartWizard from '@/components/QuickStartWizard'
import GoogleAuth from '@/components/GoogleAuth'
import ProfileDropdown from '@/components/ProfileDropdown'
import ChatInterface from '@/components/chat/ChatInterface'
import FilterPanel from '@/components/ui/FilterPanel'
import { useGeolocation } from '@/hooks/useGeolocation'
import { Course } from '@/lib/api'
import { type CourseRecommendation } from '@/types/map'
import mapboxgl from 'mapbox-gl'

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

interface FilterState {
  priceRange: [number, number]
  youthPrograms: boolean
  difficultyRange: [number, number]
  equipmentRental: boolean
}

export default function Home() {
  const { data: session } = useSession()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const { position: userLocation } = useGeolocation()


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
  // Sidebar is always visible now
  const [isQuickStartOpen, setIsQuickStartOpen] = useState(false)
  const [sidebarMode, setSidebarMode] = useState<'recommendations' | 'course-detail'>('recommendations')
  const mapRef = useRef<mapboxgl.Map | null>(null)

  // Filter panel state
  const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(false)
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    priceRange: [0, 200],
    youthPrograms: false,
    difficultyRange: [1, 5],
    equipmentRental: false
  })

  // Handle course selection from map
  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course)
    setSidebarMode('course-detail')
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

  // Remove toggle functionality - sidebar always visible

  // Go back to recommendations
  const backToRecommendations = () => {
    setSidebarMode('recommendations')
    setSelectedCourse(null)
  }

  // Handle filter changes
  const handleFiltersChange = (filters: FilterState) => {
    setActiveFilters(filters)
  }

  // Toggle filter panel
  const toggleFilterPanel = () => {
    setIsFilterPanelVisible(!isFilterPanelVisible)
  }

  // Handle chat recommendations
  const handleChatRecommendations = (recommendations: CourseRecommendation[]) => {
    console.log('Chat recommendations received:', recommendations)

    // If we have recommendations, highlight the first course on the map
    if (recommendations.length > 0 && mapRef.current) {
      const firstCourse = recommendations[0].course
      mapRef.current.flyTo({
        center: [firstCourse.lng, firstCourse.lat],
        zoom: 14,
        duration: 1500
      })

      // Auto-select the first recommended course
      setSelectedCourse(firstCourse)
      setSidebarMode('course-detail')
    }
  }

  // Handle course navigation from chat links
  const handleCourseNavigate = async (courseId: string) => {
    console.log('Navigating to course:', courseId)

    try {
      // Fetch the course details from the API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/courses/${courseId}`)
      if (response.ok) {
        const course = await response.json()

        // Center map on the course
        if (mapRef.current && course.lat && course.lng) {
          mapRef.current.flyTo({
            center: [course.lng, course.lat],
            zoom: 15,
            duration: 1500
          })

          // Select the course to show details
          setSelectedCourse(course)
          setSidebarMode('course-detail')
        }
      } else {
        console.error('Failed to fetch course details')
      }
    } catch (error) {
      console.error('Error navigating to course:', error)
    }
  }

  // Show landing page for unauthenticated users
  if (!session) {
    return (
      <main className="min-h-screen overflow-x-hidden">
        {/* Landing Page Header */}
        <div className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <img src="/logo.png" alt="EquiTee Logo" className="h-10 sm:h-12 object-contain" />
                <span className="mx-3 text-gray-400 hidden sm:inline">•</span>
                <span className="text-sm text-gray-600 hidden sm:inline">Democratizing Golf in South East Florida</span>
              </div>
              <GoogleAuth />
            </div>
          </div>
        </div>

        {/* Hero Section - Modern Tech Design */}
        <div
          className="relative min-h-screen flex items-center justify-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.3)), url('https://images.pexels.com/photos/5644647/pexels-photo-5644647.jpeg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
                Your South Florida
                <span className="block text-green-400">Golf Journey Starts Here</span>
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
                Breaking barriers in the <strong className="text-green-400">Golf Capital of the World</strong>. Find mentors and courses designed for youth with limited access to golf resources.
              </p>

              {/* Mobile-friendly CTA */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-gray-200 max-w-md mx-auto">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Start Your Journey</h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  Connect with Google to discover your personalized golf path
                </p>
                <div className="flex justify-center">
                  <GoogleAuth />
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/80 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Feature Cards Section */}
        <div className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Breaking Down Barriers
              </h3>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Golf shouldn&apos;t be exclusive. We&apos;re changing that in South Florida, one swing at a time.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 hover:shadow-xl hover:border-green-400 transition-all duration-500 transform hover:-translate-y-2 opacity-0 animate-fadeInUp [animation-delay:200ms]">
                <div className="text-4xl sm:text-5xl mb-4">🏌️‍♀️</div>
                <h4 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">Find Your Course</h4>
                <p className="text-gray-600 text-sm sm:text-base">Discover youth-friendly courses across Miami-Dade, Broward, and Palm Beach with beginner programs and affordable rates.</p>
              </div>

              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 hover:shadow-xl hover:border-green-400 transition-all duration-500 transform hover:-translate-y-2 opacity-0 animate-fadeInUp [animation-delay:400ms]">
                <div className="text-4xl sm:text-5xl mb-4">🎯</div>
                <h4 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">Personalized Guidance</h4>
                <p className="text-gray-600 text-sm sm:text-base">Get customized recommendations based on your location, experience level, and financial situation.</p>
              </div>

              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 hover:shadow-xl hover:border-green-400 transition-all duration-500 transform hover:-translate-y-2 sm:col-span-2 lg:col-span-1 opacity-0 animate-fadeInUp [animation-delay:600ms]">
                <div className="text-4xl sm:text-5xl mb-4">🌟</div>
                <h4 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">Access Resources</h4>
                <p className="text-gray-600 text-sm sm:text-base">Connect with mentors and scholarship opportunities.</p>
              </div>
            </div>
          </div>
        </div>

        {/* South Florida Focus Section - Modern Tech Design */}
        <div className="relative py-20 sm:py-32 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                The Golf Capital of the World
              </h3>
              <p className="text-lg sm:text-xl text-gray-700 mb-12 leading-relaxed">
                South Florida is home to over 400 golf courses, perfect weather year-round, and a thriving golf community.
              </p>

                But access barriers have kept many talented youth on the sidelines. <strong className="text-green-600">That changes now.</strong>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center bg-white rounded-xl p-6 shadow-lg border border-gray-200 opacity-0 animate-fadeInUp hover:scale-105 transition-transform duration-300 [animation-delay:200ms]">
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent mb-2">400+</div>
                  <p className="text-gray-700 text-sm sm:text-base">Golf Courses</p>
                </div>
                <div className="text-center bg-white rounded-xl p-6 shadow-lg border border-gray-200 opacity-0 animate-fadeInUp hover:scale-105 transition-transform duration-300 [animation-delay:400ms]">
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-2">365</div>
                  <p className="text-gray-700 text-sm sm:text-base">Days of Golf Weather</p>
                </div>
                <div className="text-center bg-white rounded-xl p-6 shadow-lg border border-gray-200 opacity-0 animate-fadeInUp hover:scale-105 transition-transform duration-300 [animation-delay:600ms]">
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">50+</div>
                  <p className="text-gray-700 text-sm sm:text-base">Youth Programs</p>
                </div>
                <div className="text-center bg-white rounded-xl p-6 shadow-lg border border-gray-200 opacity-0 animate-fadeInUp hover:scale-105 transition-transform duration-300 [animation-delay:800ms]">
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">Free</div>
                  <p className="text-gray-700 text-sm sm:text-base">For Everyone</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  Everything You Need to Succeed
                </h3>
                <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                  We believe every young person deserves the chance to experience golf. Here&apos;s how we make it happen.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="text-center group opacity-0 animate-fadeInUp [animation-delay:300ms]">
                  <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <span className="text-2xl sm:text-3xl">⛳</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-3 text-lg sm:text-xl">Youth Programs</h4>
                  <p className="text-gray-600 text-sm sm:text-base">Connect with PGA-certified instructors and youth academies offering free or low-cost lessons.</p>
                </div>

                <div className="text-center group opacity-0 animate-fadeInUp [animation-delay:500ms]">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <span className="text-2xl sm:text-3xl">👨‍🏫</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-3 text-lg sm:text-xl">Expert Mentors</h4>
                  <p className="text-gray-600 text-sm sm:text-base">Connect with volunteers, coaches, and professionals who want to share their love of the game.</p>
                </div>

                <div className="text-center group opacity-0 animate-fadeInUp [animation-delay:700ms]">
                  <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <span className="text-2xl sm:text-3xl">🗺️</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-3 text-lg sm:text-xl">Interactive Map</h4>
                  <p className="text-gray-600 text-sm sm:text-base">Explore nearby courses with 3D satellite views, pricing, and accessibility information.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-white border-t border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Ready to Tee Off?
              </h3>
              <p className="text-lg sm:text-xl text-gray-700 mb-8 leading-relaxed">
                Join our community of young golfers, mentors, and advocates working together to make golf accessible in South Florida.
              </p>

              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-gray-200 max-w-md mx-auto">
                <div className="flex justify-center">
                  <GoogleAuth />
                </div>
                <p className="text-gray-600 mt-4 text-sm text-center">
                  No equipment required • All skill levels welcome
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <img src="/logo.png" alt="EquiTee Logo" className="h-8 object-contain" />
              </div>
              <p className="text-gray-400 text-sm">
                Democratizing golf access across South Florida
              </p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Authenticated user view - show map interface
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100">
      {/* Map Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 relative z-30">
        <div className="w-full px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src="/logo.png" alt="EquiTee Logo" className="h-8 object-contain ml-2" />
              <span className="mx-3 text-gray-400">•</span>
              <span className="text-sm text-gray-600">Democratizing Golf in South East Florida</span>
            </div>

            <div className="flex items-center space-x-3">

              <ProfileDropdown
                userProfile={userProfile}
                onResetProfile={() => {
                  localStorage.removeItem('equitee-user-profile')
                  localStorage.removeItem('equitee-onboarding-completed')
                  setUserProfile(null)
                  setSidebarMode('recommendations')
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="h-[calc(100vh-80px)] flex">
        {/* Fixed Left Sidebar - Always Visible */}
        <div className="w-96 bg-white shadow-xl flex-shrink-0">
          {sidebarMode === 'recommendations' ? (
            <RecommendationEngine
              userProfile={userProfile}
              onActionClick={handleRecommendationAction}
              isVisible={true}
              onToggle={() => {}} // No-op since we don't collapse anymore
              isFixedSidebar={true}
              userLocation={userLocation || undefined}
              onCourseSelect={handleCourseSelect}
            />
          ) : (
            <div className="h-full flex flex-col">
              {/* Course Detail Header */}
              <div className="bg-gray-800 text-white p-6 flex-shrink-0">
                <button
                  onClick={backToRecommendations}
                  className="text-white hover:text-gray-200 text-sm flex items-center space-x-1"
                >
                  <span>←</span>
                  <span>Back to Recommendations</span>
                </button>

                {selectedCourse && (
                  <div className="mt-4">
                    <h2 className="text-xl font-bold">{selectedCourse.name}</h2>
                    <p className="text-gray-300 text-sm">{selectedCourse.address}</p>
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
              <div className="p-6 overflow-y-auto flex-1">
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


                    {/* Distance & Directions */}
                    <div>
                      <h3 className="font-semibold mb-3">Getting There</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-3">{selectedCourse.address}</p>
                        <button
                          onClick={() => {
                            const encodedAddress = encodeURIComponent(selectedCourse.address)
                            window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank')
                          }}
                          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          🗺️ Get Directions
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <InteractiveMap
            onCourseSelect={handleCourseSelect}
            selectedCourseId={selectedCourse?.id}
            mapRef={mapRef}
            userLocation={userLocation || undefined}
            filters={activeFilters}
          />

          {/* Chat Interface */}
          <ChatInterface
            onRecommendations={handleChatRecommendations}
            onCourseNavigate={handleCourseNavigate}
            userLocation={userLocation || undefined}
          />

          {/* Filter Panel */}
          <FilterPanel
            onFiltersChange={handleFiltersChange}
            isVisible={isFilterPanelVisible}
            onToggle={toggleFilterPanel}
          />
        </div>
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