'use client'

import { useState, useEffect } from 'react'
import { fetchCourses, fetchMentors, fetchYouthPrograms, fetchEquipment, type Course, type Mentor, type YouthProgram, type Equipment } from '@/lib/api'
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

interface RecommendationEngineProps {
  userProfile?: UserProfile | null
  onActionClick?: (recommendation: any) => void
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
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [youthPrograms, setYouthPrograms] = useState<YouthProgram[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [mentorsLoading, setMentorsLoading] = useState(true)
  const [programsLoading, setProgramsLoading] = useState(true)
  const [equipmentLoading, setEquipmentLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
  const [selectedProgram, setSelectedProgram] = useState<YouthProgram | null>(null)
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

  // Load mentors from API - NO LOCATION FILTERING
  useEffect(() => {
    async function loadMentors() {
      try {
        setMentorsLoading(true)
        const mentorsData = await fetchMentors() // No location filtering
        setMentors(mentorsData)
      } catch (error) {
        console.error('Failed to load mentors:', error)
        setMentors([])
      } finally {
        setMentorsLoading(false)
      }
    }

    loadMentors()
  }, [])

  // Load youth programs from API - NO LOCATION FILTERING
  useEffect(() => {
    async function loadPrograms() {
      try {
        setProgramsLoading(true)
        const programsData = await fetchYouthPrograms() // No location filtering
        setYouthPrograms(programsData)
      } catch (error) {
        console.error('Failed to load youth programs:', error)
        setYouthPrograms([])
      } finally {
        setProgramsLoading(false)
      }
    }

    loadPrograms()
  }, [])

  // Load equipment from API
  useEffect(() => {
    async function loadEquipment() {
      try {
        setEquipmentLoading(true)
        const equipmentData = await fetchEquipment()
        setEquipment(equipmentData)
      } catch (error) {
        console.error('Failed to load equipment:', error)
        setEquipment([])
      } finally {
        setEquipmentLoading(false)
      }
    }

    loadEquipment()
  }, [])

  // Fixed sidebar view (left panel)
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
                onClick={() => {
                  setActiveFilter(filter.key as FilterType)
                  setSelectedMentor(null)
                  setSelectedProgram(null)
                }}
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
          {!userLocation ? (
            // Location required message
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
          ) : (
            <>
              {/* MENTORS TAB */}
              {activeFilter === 'mentors' && (
                <>
                  {selectedMentor ? (
                    // Mentor detail view
                    <div className="space-y-4">
                      <button
                        onClick={() => setSelectedMentor(null)}
                        className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
                      >
                        <span>←</span>
                        <span>Back to all mentors</span>
                      </button>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-bold text-lg">{selectedMentor.userName || 'Golf Instructor'}</h3>
                        <p className="text-gray-600 text-sm mt-1">{selectedMentor.contactInfo?.title}</p>

                        {selectedMentor.contactInfo?.facility && (
                          <p className="text-gray-500 text-sm mt-1">📍 {selectedMentor.contactInfo.facility}</p>
                        )}

                        <p className="text-gray-700 text-sm mt-3">{selectedMentor.bio}</p>

                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Experience:</span>
                            <span className="text-sm font-medium">{selectedMentor.experienceYears} years</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Hourly Rate:</span>
                            <span className="text-sm font-medium">${selectedMentor.hourlyRate}/hour</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Availability:</span>
                            <span className="text-sm font-medium">{selectedMentor.available ? '✅ Available' : '❌ Not Available'}</span>
                          </div>
                          {selectedMentor.distanceMiles !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Distance:</span>
                              <span className="text-sm font-medium">{selectedMentor.distanceMiles.toFixed(1)} miles</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-2">Specialties:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedMentor.specialties.map((specialty, idx) => (
                              <span key={idx} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-2">Certifications:</p>
                          <div className="space-y-1">
                            {selectedMentor.certifications.map((cert, idx) => (
                              <div key={idx} className="text-xs text-gray-700">• {cert}</div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-6 space-y-2">
                          {selectedMentor.contactInfo?.phone && (
                            <a href={`tel:${selectedMentor.contactInfo.phone}`} className="block w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm text-center">
                              📞 Call {selectedMentor.contactInfo.phone}
                            </a>
                          )}
                          {selectedMentor.userEmail && (
                            <a href={`mailto:${selectedMentor.userEmail}`} className="block w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm text-center">
                              ✉️ Email Instructor
                            </a>
                          )}
                          {selectedMentor.contactInfo?.website && (
                            <a href={selectedMentor.contactInfo.website} target="_blank" rel="noopener noreferrer" className="block w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50 text-sm text-center">
                              🌐 Visit Website
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Mentor list view
                    <>
                      <h4 className="font-semibold text-sm mb-3">Golf Mentors & Instructors</h4>
                      {mentorsLoading ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
                          <p className="text-xs text-gray-500">Loading mentors...</p>
                        </div>
                      ) : mentors.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-xs text-gray-500">No mentors found in your area</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {mentors
                            .sort((a, b) => a.hourlyRate - b.hourlyRate) // Sort by price: cheapest to most expensive
                            .map((mentor) => (
                              <div
                                key={mentor.id}
                                onClick={() => setSelectedMentor(mentor)}
                                className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50 hover:border-green-300 transition-all duration-200 hover:shadow-md"
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="text-lg">👨‍🏫</div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-sm">{mentor.userName || 'Golf Instructor'}</h5>
                                    <p className="text-xs text-gray-500">{mentor.contactInfo?.facility || mentor.contactInfo?.title || 'Professional Instructor'}</p>

                                    <div className="flex items-center justify-between mt-2">
                                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                                        {mentor.distanceMiles !== undefined && (
                                          <span>📍 {mentor.distanceMiles.toFixed(1)} mi</span>
                                        )}
                                        <span>💰 ${mentor.hourlyRate}/hr</span>
                                      </div>

                                      {mentor.available && (
                                        <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                                          Available
                                        </span>
                                      )}
                                    </div>

                                    <div className="mt-2">
                                      <p className="text-xs text-gray-600 line-clamp-2">{mentor.bio}</p>
                                    </div>

                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {mentor.specialties.slice(0, 3).map((specialty, idx) => (
                                        <span key={idx} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                                          {specialty}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* YOUTH PROGRAMS TAB */}
              {activeFilter === 'programs' && (
                <>
                  {selectedProgram ? (
                    // Program detail view
                    <div className="space-y-4">
                      <button
                        onClick={() => setSelectedProgram(null)}
                        className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
                      >
                        <span>←</span>
                        <span>Back to all programs</span>
                      </button>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-bold text-lg">{selectedProgram.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{selectedProgram.organization}</p>

                        {/* Highlight First Tee programs */}
                        {selectedProgram.name.toLowerCase().includes('first tee') && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                            <p className="text-green-800 text-sm font-medium">🌟 FREE Program - High Value!</p>
                            <p className="text-green-700 text-xs mt-1">First Tee provides free golf instruction and life skills education for youth</p>
                          </div>
                        )}

                        <p className="text-gray-700 text-sm mt-3">{selectedProgram.description}</p>

                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Age Range:</span>
                            <span className="text-sm font-medium">{selectedProgram.ageMin}-{selectedProgram.ageMax} years</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Cost:</span>
                            <span className="text-sm font-medium">
                              {selectedProgram.costPerSession === 0 ? '🎉 FREE' : `$${selectedProgram.costPerSession}/session`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Equipment:</span>
                            <span className="text-sm font-medium">
                              {selectedProgram.equipmentProvided ? '✅ Provided' : '❌ Bring Your Own'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Transportation:</span>
                            <span className="text-sm font-medium">
                              {selectedProgram.transportationAvailable ? '✅ Available' : '❌ Not Available'}
                            </span>
                          </div>
                        </div>

                        {selectedProgram.scheduleDays && selectedProgram.scheduleDays.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-600 mb-2">Schedule:</p>
                            <div className="flex flex-wrap gap-1">
                              {selectedProgram.scheduleDays.map((day, idx) => (
                                <span key={idx} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                                  {day}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedProgram.address && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-600 mb-2">Location:</p>
                            <p className="text-sm text-gray-700">{selectedProgram.address}</p>
                          </div>
                        )}

                        <div className="mt-6 space-y-2">
                          {selectedProgram.contactInfo?.phone && (
                            <a href={`tel:${selectedProgram.contactInfo.phone}`} className="block w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm text-center">
                              📞 Call {selectedProgram.contactInfo.phone}
                            </a>
                          )}
                          {selectedProgram.contactInfo?.website && (
                            <a
                              href={selectedProgram.contactInfo.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm"
                            >
                              🌐 Visit Website
                            </a>
                          )}
                          <button className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50 text-sm">
                            🗺️ Get Directions
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Program list view
                    <>
                      <h4 className="font-semibold text-sm mb-3">Youth Golf Programs</h4>
                      {programsLoading ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
                          <p className="text-xs text-gray-500">Loading youth programs...</p>
                        </div>
                      ) : youthPrograms.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-xs text-gray-500">No youth programs found in your area</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Sort programs: First Tee Miami at top, then other First Tee, then free, then rest */}
                          {youthPrograms
                            .sort((a, b) => {
                              // First Tee Miami always first
                              const aIsFirstTeeMiami = a.name.toLowerCase() === 'first tee miami'
                              const bIsFirstTeeMiami = b.name.toLowerCase() === 'first tee miami'
                              if (aIsFirstTeeMiami && !bIsFirstTeeMiami) return -1
                              if (!aIsFirstTeeMiami && bIsFirstTeeMiami) return 1

                              // Then other First Tee programs
                              const aIsFirstTee = a.name.toLowerCase().includes('first tee')
                              const bIsFirstTee = b.name.toLowerCase().includes('first tee')
                              if (aIsFirstTee && !bIsFirstTee) return -1
                              if (!aIsFirstTee && bIsFirstTee) return 1

                              // Then free programs
                              if (a.costPerSession === 0 && b.costPerSession !== 0) return -1
                              if (a.costPerSession !== 0 && b.costPerSession === 0) return 1
                              return 0
                            })
                            .map((program) => {
                              const isFirstTee = program.name.toLowerCase().includes('first tee')
                              const isFree = program.costPerSession === 0

                              return (
                                <div
                                  key={program.id}
                                  onClick={() => setSelectedProgram(program)}
                                  className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                    isFirstTee ? 'border-green-300 bg-green-50 hover:bg-green-100' :
                                    isFree ? 'border-blue-300 bg-blue-50 hover:bg-blue-100' :
                                    'border-gray-200 hover:bg-gray-50 hover:border-green-300'
                                  }`}
                                >
                                  <div className="flex items-start space-x-3">
                                    <div className="text-lg">
                                      {isFirstTee ? '🌟' : isFree ? '🎁' : '👨‍🏫'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-medium text-sm">
                                        {program.name}
                                        {isFirstTee && <span className="ml-2 text-green-600 text-xs font-bold">FREE!</span>}
                                      </h5>
                                      <p className="text-xs text-gray-500">{program.organization}</p>

                                      <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                                          <span>👦 {program.ageMin}-{program.ageMax} yrs</span>
                                          <span>💰 {program.costPerSession === 0 ? 'FREE' : `$${program.costPerSession}`}</span>
                                        </div>
                                      </div>

                                      <div className="mt-2">
                                        <p className="text-xs text-gray-600 line-clamp-2">{program.description}</p>
                                      </div>

                                      <div className="flex items-center space-x-2 mt-2">
                                        {program.equipmentProvided && (
                                          <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded">
                                            Equipment Included
                                          </span>
                                        )}
                                        {program.transportationAvailable && (
                                          <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded">
                                            Transport Available
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* COURSES TAB */}
              {(activeFilter === 'courses' || activeFilter === 'all') && (
                <>
                  <h4 className="font-semibold text-sm mb-3">
                    {activeFilter === 'all' ? 'Recommended Courses Near You' : 'Recommended Courses'}
                  </h4>
                  {coursesLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
                      <p className="text-xs text-gray-500">Loading courses...</p>
                    </div>
                  ) : courses.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-xs text-gray-500">No courses found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
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
                        .slice(0, activeFilter === 'all' ? 5 : undefined)
                        .map((course) => (
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
                </>
              )}

              {/* EQUIPMENT TAB */}
              {activeFilter === 'equipment' && (
                <>
                  <h4 className="font-semibold text-sm mb-3">Equipment For Sale/Donation</h4>
                  {equipmentLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
                      <p className="text-xs text-gray-500">Loading equipment...</p>
                    </div>
                  ) : equipment.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-xs text-gray-500">No equipment available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {equipment
                        .filter(item => item.status === 'available')
                        .slice(0, 20) // Show first 20 items
                        .map((item) => (
                          <div
                            key={item.id}
                            className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 hover:border-green-300 transition-all duration-200 hover:shadow-md"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="text-lg">
                                {item.equipmentType === 'driver' ? '🏌️' :
                                 item.equipmentType === 'putter' ? '⛳' :
                                 item.equipmentType === 'irons' ? '🏌️' :
                                 item.equipmentType === 'bag' ? '🎒' : '🏌️'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-sm">{item.title}</h5>
                                <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                                    <span>💰 ${item.price}</span>
                                    <span className={`px-2 py-0.5 rounded text-xs ${
                                      item.condition === 'new' ? 'bg-green-100 text-green-700' :
                                      item.condition === 'excellent' ? 'bg-blue-100 text-blue-700' :
                                      item.condition === 'good' ? 'bg-gray-100 text-gray-700' :
                                      'bg-yellow-100 text-yellow-700'
                                    }`}>
                                      {item.condition}
                                    </span>
                                  </div>
                                  <span className="text-xs text-green-600">
                                    {item.price === 0 ? 'FREE' : 'Available'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}


              {/* Show sample resources in "All" view */}
              {activeFilter === 'all' && mentors.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-sm mb-3">Featured Mentors</h4>
                  <div className="space-y-3">
                    {mentors.slice(0, 2).map((mentor) => (
                      <div
                        key={mentor.id}
                        onClick={() => {
                          setActiveFilter('mentors')
                          setSelectedMentor(mentor)
                        }}
                        className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50 hover:border-green-300 transition-all duration-200 hover:shadow-md"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="text-lg">👨‍🏫</div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm">{mentor.userName || 'Golf Instructor'}</h5>
                            <p className="text-xs text-gray-500">💰 ${mentor.hourlyRate}/hr</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeFilter === 'all' && youthPrograms.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-sm mb-3">Featured Youth Programs</h4>
                  <div className="space-y-3">
                    {youthPrograms
                      .filter(p => p.name.toLowerCase().includes('first tee') || p.costPerSession === 0)
                      .slice(0, 2)
                      .map((program) => (
                        <div
                          key={program.id}
                          onClick={() => {
                            setActiveFilter('programs')
                            setSelectedProgram(program)
                          }}
                          className="border border-green-300 bg-green-50 rounded-lg p-3 cursor-pointer hover:bg-green-100 transition-all duration-200 hover:shadow-md"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="text-lg">🌟</div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-sm">
                                {program.name}
                                {program.costPerSession === 0 && <span className="ml-2 text-green-600 text-xs font-bold">FREE!</span>}
                              </h5>
                              <p className="text-xs text-gray-500">{program.organization}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  // Floating sidebar view (not used in current implementation but keeping for compatibility)
  return null
}