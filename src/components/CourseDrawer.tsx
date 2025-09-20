'use client'

import { useState } from 'react'

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

interface CourseDrawerProps {
  course: Course | null
  isOpen: boolean
  onClose: () => void
}

export default function CourseDrawer({ course, isOpen, onClose }: CourseDrawerProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'programs' | 'contact'>('info')

  if (!course) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`
        fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className={`bg-green-600 text-white p-4 transform transition-all duration-500 ${
          isOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
        }`}>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{course.name}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl transform hover:scale-110 transition-transform"
            >
              ×
            </button>
          </div>
          <p className="text-green-100 text-sm mt-1">{course.address}</p>
        </div>

        {/* Tabs */}
        <div className={`border-b border-gray-200 transform transition-all duration-700 delay-100 ${
          isOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
        }`}>
          <div className="flex">
            {[
              { id: 'info', label: 'Info' },
              { id: 'programs', label: 'Programs' },
              { id: 'contact', label: 'Contact' }
            ].map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-all duration-300 transform hover:scale-105 ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className={`p-4 overflow-y-auto h-full pb-20 transform transition-all duration-700 delay-200 ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Pricing */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Pricing</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    ${course.greenFeeMin} - ${course.greenFeeMax}
                  </div>
                  <p className="text-gray-600 text-sm">Green fees (18 holes)</p>
                </div>
              </div>

              {/* Course Details */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Course Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Difficulty Rating</span>
                    <div className="flex items-center">
                      <span className="font-medium">{course.difficultyRating}</span>
                      <span className="text-yellow-400 ml-1">⭐</span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Equipment Rental</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      course.equipmentRental
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {course.equipmentRental ? 'Available' : 'Not Available'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Youth Programs</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      course.youthPrograms
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {course.youthPrograms ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Amenities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Pro Shop', available: true },
                    { name: 'Restaurant', available: true },
                    { name: 'Driving Range', available: true },
                    { name: 'Putting Green', available: true },
                    { name: 'Cart Rental', available: true },
                    { name: 'Lessons', available: course.youthPrograms }
                  ].map((amenity) => (
                    <div key={amenity.name} className="flex items-center space-x-2">
                      <span className={`text-sm ${
                        amenity.available ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {amenity.available ? '✓' : '✗'}
                      </span>
                      <span className="text-sm">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Distance Calculator */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Distance</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    📍 Distance calculation available after location permission
                  </p>
                  <button className="mt-2 text-blue-600 text-sm font-medium hover:underline">
                    Enable Location Services
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'programs' && (
            <div className="space-y-6">
              {course.youthPrograms ? (
                <>
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Youth Programs</h3>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Junior Golf Academy</h4>
                        <p className="text-gray-600 text-sm mb-2">
                          Ages 8-16. Learn the fundamentals of golf with certified instructors.
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-green-600 font-bold">$40/session</span>
                          <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                            Enroll
                          </button>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Summer Golf Camp</h4>
                        <p className="text-gray-600 text-sm mb-2">
                          Full-day program including lessons, course play, and lunch.
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-green-600 font-bold">$120/day</span>
                          <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                            Learn More
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Scholarships</h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800 text-sm">
                        💡 Financial assistance available for qualifying families.
                      </p>
                      <button className="mt-2 text-yellow-700 font-medium text-sm hover:underline">
                        Apply for Scholarship
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">⛳</div>
                  <h3 className="font-semibold text-lg mb-2">No Youth Programs</h3>
                  <p className="text-gray-600">
                    This course doesn't currently offer youth programs.
                  </p>
                  <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Suggest Youth Program
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">(305) 555-0123</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">info@{course.name.toLowerCase().replace(/\s+/g, '')}.com</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Website</p>
                    <a href="#" className="text-blue-600 font-medium hover:underline">
                      Visit Website
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Hours</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>6:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday - Sunday</span>
                    <span>5:30 AM - 8:30 PM</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Directions</h3>
                <p className="text-gray-600 text-sm mb-3">{course.address}</p>
                <div className="space-y-2">
                  <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    Get Directions
                  </button>
                  <button className="w-full border border-gray-300 py-2 rounded hover:bg-gray-50">
                    View on Map
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Bar */}
        <div className={`absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 transform transition-all duration-700 delay-300 ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}>
          <div className="flex space-x-3">
            <button className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium transform hover:scale-105 transition-transform">
              Book Tee Time
            </button>
            <button className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 font-medium transform hover:scale-105 transition-transform">
              Save Course
            </button>
          </div>
        </div>
      </div>
    </>
  )
}