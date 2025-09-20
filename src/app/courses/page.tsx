'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { fetchCourses, searchCourses, Course } from '@/lib/api'

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    youthPrograms: false,
    equipmentRental: false,
    maxPrice: '',
    maxDifficulty: ''
  })

  // Load courses from API
  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true)
        setError(null)

        // Build search filters
        const searchFilters: any = {}

        if (filters.youthPrograms) {
          searchFilters.youth_programs = true
        }

        if (filters.equipmentRental) {
          searchFilters.equipment_rental = true
        }

        if (filters.maxPrice) {
          searchFilters.price = parseInt(filters.maxPrice)
        }

        if (filters.maxDifficulty) {
          searchFilters.max_difficulty = parseFloat(filters.maxDifficulty)
        }

        // Use search if filters are applied, otherwise get all courses
        const coursesData = Object.keys(searchFilters).length > 0
          ? await searchCourses(searchFilters)
          : await fetchCourses()

        setCourses(coursesData)
      } catch (error) {
        console.error('Failed to load courses:', error)
        setError('Failed to load courses. Please try again.')
        setCourses([])
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [filters])

  const handleFilterChange = (filterName: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Golf Courses</h1>
              <p className="text-gray-600 mt-1">Discover golf courses across South Florida</p>
            </div>
            <Link
              href="/"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              View Map
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Youth Programs */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.youthPrograms}
                  onChange={(e) => handleFilterChange('youthPrograms', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Youth Programs</span>
              </label>
            </div>

            {/* Equipment Rental */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.equipmentRental}
                  onChange={(e) => handleFilterChange('equipmentRental', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Equipment Rental</span>
              </label>
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
              <input
                type="number"
                placeholder="e.g. 100"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            {/* Max Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Difficulty</label>
              <select
                value={filters.maxDifficulty}
                onChange={(e) => handleFilterChange('maxDifficulty', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">All Levels</option>
                <option value="2">Beginner (1-2)</option>
                <option value="3">Intermediate (1-3)</option>
                <option value="4">Advanced (1-4)</option>
                <option value="5">All Levels (1-5)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading courses...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results Header */}
        {!loading && !error && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {courses.length} courses found
            </h2>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && !error && (
          courses.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <h3 className="text-xl font-semibold mb-2">{course.name}</h3>
                  <p className="text-gray-600 mb-4">{course.address}</p>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-green-600 font-bold text-lg">
                        ${course.greenFeeMin}-${course.greenFeeMax}
                      </span>
                      {course.youthPrograms && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          Youth Programs
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Difficulty:</span>
                      <span className="font-medium">{course.difficultyRating}/5 ⭐</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Equipment Rental:</span>
                      <span className="font-medium">
                        {course.equipmentRental ? '✅ Available' : '❌ Not Available'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link
                      href={`/courses/${course.id}`}
                      className="block w-full bg-green-600 text-white py-2 px-4 rounded text-center hover:bg-green-700 transition-colors"
                    >
                      View Details
                    </Link>

                    {course.website && (
                      <a
                        href={course.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded text-center hover:bg-gray-200 transition-colors"
                      >
                        Visit Website
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🏌️</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No courses found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or check back later.</p>
              <button
                onClick={() => setFilters({ youthPrograms: false, equipmentRental: false, maxPrice: '', maxDifficulty: '' })}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Clear Filters
              </button>
            </div>
          )
        )}
      </div>
    </div>
  )
}