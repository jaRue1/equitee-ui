'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
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
  // Sidebar is always visible now
  const [isQuickStartOpen, setIsQuickStartOpen] = useState(false)
  const [sidebarMode, setSidebarMode] = useState<'recommendations' | 'course-detail'>('recommendations')
  const mapRef = useRef<mapboxgl.Map | null>(null)

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

  // Show landing page for unauthenticated users
  if (!session) {
    return (
      <main className="min-h-screen overflow-x-hidden">
        {/* Landing Page Header */}
        <div className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-green-700">EquiTee</h1>
                <p className="text-xs sm:text-sm text-gray-600">The Golf Capital Experience</p>
              </div>
              <GoogleAuth />
            </div>
          </div>
        </div>

        {/* Hero Section with Parallax Background */}
        <div
          className="relative min-h-screen flex items-center justify-center"
          style={{
            background: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.5)), url('https://images.pexels.com/photos/5644647/pexels-photo-5644647.jpeg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Your South Florida
                <span className="block text-green-400">Golf Journey Starts Here</span>
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
                Breaking barriers in the <strong>Golf Capital of the World</strong>. Find mentors, equipment, and courses designed for youth with limited access to golf resources.
              </p>

              {/* Mobile-friendly CTA */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20 max-w-md mx-auto">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Start Your Journey</h3>
                <p className="text-gray-200 mb-6 text-sm sm:text-base">
                  Connect with Google to discover your personalized golf path
                </p>
                <div className="flex justify-center">
                  <GoogleAuth />
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Feature Cards Section */}
        <div className="py-16 sm:py-20 bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
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
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-4xl sm:text-5xl mb-4">🏌️‍♀️</div>
                <h4 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">Find Your Course</h4>
                <p className="text-gray-600 text-sm sm:text-base">Discover youth-friendly courses across Miami-Dade, Broward, and Palm Beach with beginner programs and affordable rates.</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-4xl sm:text-5xl mb-4">🎯</div>
                <h4 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">Personalized Guidance</h4>
                <p className="text-gray-600 text-sm sm:text-base">Get customized recommendations based on your location, experience level, and financial situation.</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
                <div className="text-4xl sm:text-5xl mb-4">🌟</div>
                <h4 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">Access Resources</h4>
                <p className="text-gray-600 text-sm sm:text-base">Connect with free equipment programs, experienced mentors, and scholarship opportunities.</p>
              </div>
            </div>
          </div>
        </div>

        {/* South Florida Focus Section with Parallax */}
        <div
          className="relative py-20 sm:py-32"
          style={{
            background: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3)), url('https://images.pexels.com/photos/30147234/pexels-photo-30147234.jpeg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8">
                The Golf Capital of the World
              </h3>
              <p className="text-lg sm:text-xl text-gray-200 mb-12 leading-relaxed">
                South Florida is home to over 400 golf courses, perfect weather year-round, and a thriving golf community.
                But access barriers have kept many talented youth on the sidelines. <strong>That changes now.</strong>
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-green-400 mb-2">400+</div>
                  <p className="text-gray-200 text-sm sm:text-base">Golf Courses</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-blue-400 mb-2">365</div>
                  <p className="text-gray-200 text-sm sm:text-base">Days of Golf Weather</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-2">50+</div>
                  <p className="text-gray-200 text-sm sm:text-base">Youth Programs</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-purple-400 mb-2">Free</div>
                  <p className="text-gray-200 text-sm sm:text-base">For Everyone</p>
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

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center group">
                  <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl sm:text-3xl">⛳</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-3 text-lg sm:text-xl">Youth Programs</h4>
                  <p className="text-gray-600 text-sm sm:text-base">Connect with PGA-certified instructors and youth academies offering free or low-cost lessons.</p>
                </div>

                <div className="text-center group">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl sm:text-3xl">🎁</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-3 text-lg sm:text-xl">Free Equipment</h4>
                  <p className="text-gray-600 text-sm sm:text-base">Access donated clubs, balls, and gear through our partner network and equipment lending programs.</p>
                </div>

                <div className="text-center group">
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl sm:text-3xl">👨‍🏫</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-3 text-lg sm:text-xl">Expert Mentors</h4>
                  <p className="text-gray-600 text-sm sm:text-base">Connect with volunteers, coaches, and professionals who want to share their love of the game.</p>
                </div>

                <div className="text-center group">
                  <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
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
        <div className="py-16 sm:py-20 bg-gradient-to-br from-green-600 via-blue-600 to-emerald-600">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Tee Off?
              </h3>
              <p className="text-lg sm:text-xl text-green-100 mb-8 leading-relaxed">
                Join our community of young golfers, mentors, and advocates working together to make golf accessible in South Florida.
              </p>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20 max-w-md mx-auto">
                <div className="flex justify-center">
                  <GoogleAuth />
                </div>
                <p className="text-gray-200 mt-4 text-sm text-center">
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
              <h4 className="text-xl font-bold text-white mb-2">EquiTee</h4>
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
            <div>
              <h1 className="text-2xl font-bold text-green-700">EquiTee</h1>
              <p className="text-sm text-gray-600">Your Golf Journey Starts Here</p>
            </div>

            <div className="flex items-center space-x-3">
              {userProfile && (
                <>
                  <Link
                    href="/equipment"
                    className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Equipment
                  </Link>

                  <Link
                    href="/courses"
                    className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Courses
                  </Link>
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
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <InteractiveMap
            onCourseSelect={handleCourseSelect}
            selectedCourseId={selectedCourse?.id}
            mapRef={mapRef}
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