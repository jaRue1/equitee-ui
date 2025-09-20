'use client'

import { useState, useEffect } from 'react'
import { fetchCourses, type Course } from '@/lib/api'
import { useGeolocation } from '@/hooks/useGeolocation'

type FilterType = 'all' | 'courses' | 'programs' | 'equipment' | 'mentors'

interface UserProfile {
  name?: string
  age?: number
  golfExperience: 'never-played' | 'beginner' | 'intermediate'
  location?: { lat: number; lng: number }
  zipCode?: string
  interests: string[]
  completedSteps: string[]
}

// Removed Recommendation interface - no longer needed

interface RecommendationEngineProps {
  userProfile?: UserProfile | null
  onActionClick?: (recommendation: any) => void  // Keeping for compatibility but not used
  isVisible: boolean
  onToggle: () => void
  isFixedSidebar?: boolean
  userLocation?: { lat: number; lng: number }
  onCourseSelect?: (course: Course) => void
}

export default function RecommendationEngine({
  userProfile,
  onActionClick,
  isVisible,
  onToggle,
  isFixedSidebar = false,
  userLocation,
  onCourseSelect
}: RecommendationEngineProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const { requestLocation, loading: locationLoading, error: locationError } = useGeolocation()

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3959 // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Load courses from API
  useEffect(() => {
    async function loadCourses() {
      try {
        setCoursesLoading(true)
        const coursesData = await fetchCourses()
        setCourses(coursesData)
      } catch (error) {
        console.error('Failed to load courses:', error)
        setCourses([])
      } finally {
        setCoursesLoading(false)
      }
    }

    loadCourses()
  }, [])

  // No longer using dummy recommendations - only real course data

  if (isFixedSidebar) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 text-white p-6 flex-shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold mb-1">Golf Resources</h2>
              <p className="text-gray-300 text-sm">
                {userLocation ? 'Resources near your location' : 'Set your location to see nearby resources'}
              </p>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All', icon: '🎯' },
              { key: 'courses', label: 'Courses', icon: '⛳' },
              { key: 'programs', label: 'Programs', icon: '👨‍🏫' },
              { key: 'equipment', label: 'Equipment', icon: '🏌️' },
              { key: 'mentors', label: 'Mentors', icon: '👥' }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key as FilterType)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  activeFilter === filter.key
                    ? 'bg-white text-gray-800'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {filter.icon} {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">

          {/* Nearby Resources */}
          {userLocation ? (
            <div>
              <h4 className="font-semibold text-sm mb-3">
                {activeFilter === 'all' ? 'All Resources' :
                 activeFilter === 'courses' ? 'Golf Courses' :
                 activeFilter === 'programs' ? 'Youth Programs' :
                 activeFilter === 'equipment' ? 'Equipment Rentals' :
                 'Mentors'}
              </h4>

              {coursesLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
                  <p className="text-xs text-gray-500">Loading resources...</p>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-500">No resources found</p>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto">
                  {courses
                    .map(course => ({
                      ...course,
                      distance: calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        course.lat,
                        course.lng
                      )
                    }))
                    .sort((a, b) => a.distance - b.distance)
                    .filter(course => {
                      if (activeFilter === 'all') return true
                      if (activeFilter === 'courses') return true // All items are courses for now
                      if (activeFilter === 'programs') return course.youthPrograms
                      if (activeFilter === 'equipment') return course.equipmentRental
                      return false // mentors filter - placeholder for now
                    })
                    .map((course, index) => (
                      <div
                        key={course.id}
                        onClick={() => onCourseSelect?.(course)}
                        className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50 hover:border-green-300 transition-all duration-200 hover:shadow-md"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="text-lg">⛳</div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm truncate">{course.name}</h5>
                            <p className="text-xs text-gray-500 truncate">{course.address}</p>

                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span>📍 {course.distance.toFixed(1)} mi</span>
                                <span>💰 ${course.greenFeeMin}-${course.greenFeeMax}</span>
                              </div>

                              {course.youthPrograms && (
                                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                                  Youth
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center space-x-1">
                                <span className="text-xs text-gray-500">Difficulty:</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <span
                                      key={i}
                                      className={`text-xs ${
                                        i < course.difficultyRating ? 'text-yellow-400' : 'text-gray-300'
                                      }`}
                                    >
                                      ⭐
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {course.equipmentRental && (
                                <span className="text-xs text-green-600">🎁 Rentals</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-lg font-semibold mb-2">Location Required</h3>
              <p className="text-gray-600 text-sm mb-4">
                Allow location access to see nearby golf resources.
              </p>
              {locationError && (
                <p className="text-red-600 text-xs mb-4">{locationError}</p>
              )}
              <button
                onClick={requestLocation}
                disabled={locationLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
              >
                {locationLoading ? 'Requesting...' : '📍 Allow Location Access'}
              </button>
            </div>
          )}

        </div>
      </div>
    )
  }

  return (
    <>
      {/* Floating Sidebar - Left Side */}
      <div className={`
        fixed left-4 top-20 bottom-20 w-80 bg-white rounded-2xl shadow-2xl z-40 overflow-hidden
        transform transition-all duration-500 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
      `}>
        {/* Header */}
        <div className="bg-gray-800 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold mb-1">
                {userProfile?.name ? `Hey ${userProfile.name}!` : 'Your Golf Journey'}
              </h2>
              <p className="text-gray-300 text-sm">
                {userProfile?.golfExperience === 'never-played'
                  ? 'Let\'s get you started!'
                  : 'Your next steps await'}
              </p>
            </div>
            <button
              onClick={onToggle}
              className="text-white hover:text-gray-200 text-xl transform hover:scale-110 transition-transform"
            >
              {isVisible ? '←' : '→'}
            </button>
          </div>

        </div>

        {/* Content */}
        <div className="p-4 h-full overflow-y-auto pb-24 flex flex-col">
          {!userProfile ? (
            // Quick Start for new users
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🏌️</div>
              <h3 className="text-xl font-bold mb-2">New to Golf?</h3>
              <p className="text-gray-600 mb-6">
                Take our quick quiz to get personalized recommendations!
              </p>
              <button
                onClick={() => onActionClick?.({})}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
              >
                🎯 Start Your Golf Journey
              </button>
            </div>
          ) : (
            // Show message for existing users without recommendations
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⛳</div>
              <h3 className="text-lg font-semibold mb-2">Welcome back!</h3>
              <p className="text-gray-600 text-sm">
                Check out nearby golf courses below to plan your next round.
              </p>
            </div>
          )}

          {/* Filter Buttons */}
          {userLocation && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { key: 'all', label: 'All', icon: '🎯' },
                  { key: 'courses', label: 'Courses', icon: '⛳' },
                  { key: 'programs', label: 'Programs', icon: '👨‍🏫' },
                  { key: 'equipment', label: 'Equipment', icon: '🏌️' },
                  { key: 'mentors', label: 'Mentors', icon: '👥' }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key as FilterType)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      activeFilter === filter.key
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {filter.icon} {filter.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Nearby Resources */}
          {userLocation && (
            <div>
              <h4 className="font-semibold text-sm mb-3">
                {activeFilter === 'all' ? 'All Resources' :
                 activeFilter === 'courses' ? 'Golf Courses' :
                 activeFilter === 'programs' ? 'Youth Programs' :
                 activeFilter === 'equipment' ? 'Equipment Rentals' :
                 'Mentors'}
              </h4>

              {coursesLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
                  <p className="text-xs text-gray-500">Loading resources...</p>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-500">No resources found</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {courses
                    .map(course => ({
                      ...course,
                      distance: calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        course.lat,
                        course.lng
                      )
                    }))
                    .sort((a, b) => a.distance - b.distance)
                    .filter(course => {
                      if (activeFilter === 'all') return true
                      if (activeFilter === 'courses') return true // All items are courses for now
                      if (activeFilter === 'programs') return course.youthPrograms
                      if (activeFilter === 'equipment') return course.equipmentRental
                      return false // mentors filter - placeholder for now
                    })
                    .map((course, index) => (
                      <div
                        key={course.id}
                        onClick={() => onCourseSelect?.(course)}
                        className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50 hover:border-green-300 transition-all duration-200 hover:shadow-md"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="text-lg">⛳</div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm truncate">{course.name}</h5>
                            <p className="text-xs text-gray-500 truncate">{course.address}</p>

                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span>📍 {course.distance.toFixed(1)} mi</span>
                                <span>💰 ${course.greenFeeMin}-${course.greenFeeMax}</span>
                              </div>

                              {course.youthPrograms && (
                                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                                  Youth
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center space-x-1">
                                <span className="text-xs text-gray-500">Difficulty:</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <span
                                      key={i}
                                      className={`text-xs ${
                                        i < course.difficultyRating ? 'text-yellow-400' : 'text-gray-300'
                                      }`}
                                    >
                                      ⭐
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {course.equipmentRental && (
                                <span className="text-xs text-green-600">🎁 Rentals</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Toggle Button (when sidebar is hidden) */}
      {!isVisible && (
        <button
          onClick={onToggle}
          className="fixed left-4 top-32 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all z-30"
        >
          <span className="text-lg">🎯</span>
        </button>
      )}
    </>
  )
}