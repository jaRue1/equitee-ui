'use client'

import { useState } from 'react'
import { useGeolocation } from '@/hooks/useGeolocation'

interface LocationPermissionProps {
  onLocationSet: (location: { lat: number; lng: number }, zipCode?: string) => void
  className?: string
}

export default function LocationPermission({ onLocationSet, className = '' }: LocationPermissionProps) {
  const { position, error, loading, requestLocation, setLocationFromZipCode } = useGeolocation()
  const [showZipInput, setShowZipInput] = useState(false)
  const [zipCode, setZipCode] = useState('')
  const [zipLoading, setZipLoading] = useState(false)

  const handleRequestLocation = () => {
    requestLocation()
  }

  const handleZipSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (zipCode.length === 5) {
      setZipLoading(true)
      await setLocationFromZipCode(zipCode)
      setZipLoading(false)
    }
  }

  // If we have a position, call the callback
  if (position && !loading) {
    const savedZipCode = localStorage.getItem('userZipCode')
    onLocationSet(position, savedZipCode || undefined)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Find Golf Courses Near You
          </h3>
          <p className="text-gray-600 text-sm">
            We&apos;ll use your location to show nearby golf courses and personalized recommendations.
            Your location data is stored securely and only used to improve your experience.
          </p>
        </div>

        {!showZipInput && !error && (
          <button
            onClick={handleRequestLocation}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Getting your location...
              </span>
            ) : (
              'Allow Location Access'
            )}
          </button>
        )}

        {(error || showZipInput) && (
          <div className="space-y-3">
            {error && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-orange-800 text-sm">{error}</p>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-3">
                Enter your zip code to find courses in your area:
              </p>

              <form onSubmit={handleZipSubmit} className="flex gap-2">
                <input
                  type="text"
                  pattern="[0-9]{5}"
                  maxLength={5}
                  placeholder="12345"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-center"
                  required
                />
                <button
                  type="submit"
                  disabled={zipCode.length !== 5 || zipLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {zipLoading ? (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    'Go'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {!showZipInput && !error && !loading && (
          <button
            onClick={() => setShowZipInput(true)}
            className="w-full mt-3 text-gray-600 hover:text-gray-800 text-sm py-2 transition-colors"
          >
            Or enter your zip code instead
          </button>
        )}
      </div>
    </div>
  )
}