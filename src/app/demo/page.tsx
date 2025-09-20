'use client'

import { useState } from 'react'
import LocationPermission from '@/components/onboarding/LocationPermission'
import ChatInterface from '@/components/chat/ChatInterface'
import InteractiveMap from '@/components/map/InteractiveMap'
import { useGeolocation } from '@/hooks/useGeolocation'
import { type CourseRecommendation } from '@/types/map'

export default function DemoPage() {
  const [locationSet, setLocationSet] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const { position, error, loading, requestLocation, clearLocation } = useGeolocation()

  const handleLocationSet = (location: { lat: number; lng: number }, zipCode?: string) => {
    console.log('Location set:', location, zipCode)
    setCurrentLocation(location)
    setLocationSet(true)
  }

  const handleChatRecommendations = (recommendations: CourseRecommendation[]) => {
    console.log('Chat recommendations:', recommendations)
  }

  const resetDemo = () => {
    clearLocation()
    setLocationSet(false)
    setCurrentLocation(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-6">EquiTee Components Demo</h1>

          {/* Location Status */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Location Status</h2>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              <p><strong>Error:</strong> {error || 'None'}</p>
              <p><strong>Position:</strong> {position ? `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}` : 'None'}</p>
              <p><strong>Location Set:</strong> {locationSet ? 'Yes' : 'No'}</p>
            </div>
            <div className="mt-4 space-x-2">
              <button
                onClick={requestLocation}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Request Location Again
              </button>
              <button
                onClick={resetDemo}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Reset Demo
              </button>
            </div>
          </div>

          {/* Location Permission Component */}
          {!locationSet && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Location Permission Component</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <LocationPermission onLocationSet={handleLocationSet} />
              </div>
            </div>
          )}

          {/* Success State */}
          {locationSet && currentLocation && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h2 className="text-lg font-semibold text-green-800 mb-2">✅ Location Successfully Set!</h2>
              <p className="text-green-700">
                Latitude: {currentLocation.lat.toFixed(6)}, Longitude: {currentLocation.lng.toFixed(6)}
              </p>
            </div>
          )}
        </div>

        {/* Interactive Map Demo */}
        <div className="bg-white rounded-xl shadow-lg p-8 relative">
          <h2 className="text-lg font-semibold mb-4">Interactive Map with User Location</h2>
          <p className="text-gray-600 mb-6">
            {currentLocation
              ? `Map showing your location at ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}. Look for the blue pulsing marker!`
              : 'Set your location above to see your position on the map with a "You are here" marker.'
            }
          </p>

          {/* Real Interactive Map */}
          <div className="h-96 rounded-lg relative overflow-hidden">
            <InteractiveMap
              userLocation={currentLocation || undefined}
              onCourseSelect={(course) => console.log('Course selected:', course)}
            />

            {/* Chat Interface */}
            <ChatInterface
              onRecommendations={handleChatRecommendations}
              userLocation={currentLocation || undefined}
            />
          </div>
        </div>
      </div>
    </div>
  )
}