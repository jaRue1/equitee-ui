'use client'

import { useState, useEffect } from 'react'

interface LocationState {
  position: { lat: number; lng: number } | null
  error: string | null
  loading: boolean
}

export const useGeolocation = () => {
  const [locationState, setLocationState] = useState<LocationState>({
    position: null,
    error: null,
    loading: true
  })

  const requestLocation = () => {
    setLocationState(prev => ({ ...prev, loading: true, error: null }))

    if (!navigator.geolocation) {
      setLocationState({
        position: null,
        error: 'Geolocation is not supported by this browser',
        loading: false
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords
        const newPosition = { lat, lng }

        // Store location in localStorage for persistence
        localStorage.setItem('userLocation', JSON.stringify(newPosition))

        setLocationState({
          position: newPosition,
          error: null,
          loading: false
        })
      },
      (error) => {
        let errorMessage: string
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enter your zip code instead.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please enter your zip code.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again or enter your zip code.'
            break
          default:
            errorMessage = 'An unknown error occurred while retrieving location.'
            break
        }

        setLocationState({
          position: null,
          error: errorMessage,
          loading: false
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  const clearLocation = () => {
    localStorage.removeItem('userLocation')
    setLocationState({
      position: null,
      error: null,
      loading: false
    })
  }

  const setLocationFromZipCode = async (zipCode: string) => {
    try {
      setLocationState(prev => ({ ...prev, loading: true, error: null }))

      // For now, we'll use a simple geocoding approach
      // In production, you'd want to use a proper geocoding service
      const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`)

      if (!response.ok) {
        throw new Error('Invalid zip code')
      }

      const data = await response.json()
      const position = {
        lat: parseFloat(data.places[0].latitude),
        lng: parseFloat(data.places[0].longitude)
      }

      // Store location in localStorage for persistence
      localStorage.setItem('userLocation', JSON.stringify(position))
      localStorage.setItem('userZipCode', zipCode)

      setLocationState({
        position,
        error: null,
        loading: false
      })
    } catch (error) {
      setLocationState({
        position: null,
        error: 'Unable to find location for this zip code. Please try again.',
        loading: false
      })
    }
  }

  useEffect(() => {
    // Try to load saved location from localStorage on mount
    try {
      const savedLocation = localStorage.getItem('userLocation')
      if (savedLocation) {
        const position = JSON.parse(savedLocation)
        setLocationState({
          position,
          error: null,
          loading: false
        })
        return
      }
    } catch (error) {
      console.warn('Failed to load saved location:', error)
    }

    // If no saved location, request location permission
    requestLocation()
  }, [])

  return {
    ...locationState,
    requestLocation,
    clearLocation,
    setLocationFromZipCode
  }
}