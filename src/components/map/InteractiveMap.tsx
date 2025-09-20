'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { fetchCourses, fetchMapConfig, Course, MapConfig } from '@/lib/api'
import HeatMapLayer, { type DemographicData } from './HeatMapLayer'
import MapLegend from './MapLegend'

interface FilterState {
  priceRange: [number, number]
  youthPrograms: boolean
  difficultyRange: [number, number]
  equipmentRental: boolean
}

interface InteractiveMapProps {
  onCourseSelect?: (course: Course) => void
  selectedCourseId?: string
  mapRef?: React.MutableRefObject<mapboxgl.Map | null>
  userLocation?: { lat: number; lng: number }
  filters?: FilterState
}

export default function InteractiveMap({ onCourseSelect, selectedCourseId, mapRef, userLocation, filters }: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [coursesError, setCoursesError] = useState<string | null>(null)
  const [mapConfig, setMapConfig] = useState<MapConfig | null>(null)
  const [mapConfigError, setMapConfigError] = useState<string | null>(null)
  const [heatMapVisible, setHeatMapVisible] = useState(false)
  const [demographicData, setDemographicData] = useState<DemographicData[]>([])
  const userMarker = useRef<mapboxgl.Marker | null>(null)

  // Mock demographic data for South Florida (this would come from API in production)
  const mockDemographicData: DemographicData[] = [
    {
      zipCode: '33101',
      medianIncome: 85000,
      accessibilityScore: 85,
      bounds: {
        type: 'Polygon',
        coordinates: [[
          [-80.1918, 25.7617],
          [-80.1768, 25.7617],
          [-80.1768, 25.7767],
          [-80.1918, 25.7767],
          [-80.1918, 25.7617]
        ]]
      }
    },
    {
      zipCode: '33134',
      medianIncome: 65000,
      accessibilityScore: 72,
      bounds: {
        type: 'Polygon',
        coordinates: [[
          [-80.2418, 25.7417],
          [-80.2268, 25.7417],
          [-80.2268, 25.7567],
          [-80.2418, 25.7567],
          [-80.2418, 25.7417]
        ]]
      }
    },
    {
      zipCode: '33143',
      medianIncome: 45000,
      accessibilityScore: 58,
      bounds: {
        type: 'Polygon',
        coordinates: [[
          [-80.3118, 25.7017],
          [-80.2968, 25.7017],
          [-80.2968, 25.7167],
          [-80.3118, 25.7167],
          [-80.3118, 25.7017]
        ]]
      }
    }
  ]

  // Load map config from API
  useEffect(() => {
    async function loadMapConfig() {
      try {
        setMapConfigError(null)
        const config = await fetchMapConfig()
        setMapConfig(config)
      } catch (error) {
        console.error('Failed to load map config:', error)
        setMapConfigError('Failed to load map configuration. Please try again.')
      }
    }

    loadMapConfig()
  }, [])

  // Load courses from API
  useEffect(() => {
    async function loadCourses() {
      try {
        setCoursesLoading(true)
        setCoursesError(null)
        const coursesData = await fetchCourses()
        setCourses(coursesData)
      } catch (error) {
        console.error('Failed to load courses:', error)
        setCoursesError('Failed to load courses. Please try again.')
        // Fall back to empty array for now
        setCourses([])
      } finally {
        setCoursesLoading(false)
      }
    }

    loadCourses()
  }, [])

  // Load demographic data (mock data for now)
  useEffect(() => {
    setDemographicData(mockDemographicData)
  }, [])

  const handleHeatMapToggle = () => {
    setHeatMapVisible(prev => !prev)
  }

  // Add user location marker - only when both map and location are ready
  useEffect(() => {
    if (!map.current || !userLocation || !mapLoaded) return

    // Remove existing user marker
    if (userMarker.current) {
      userMarker.current.remove()
    }

    // Create custom user location marker element with inline styles
    const userMarkerElement = document.createElement('div')
    userMarkerElement.className = 'user-location-marker'

    // Add ping animation CSS if not already added
    if (!document.getElementById('user-marker-styles')) {
      const style = document.createElement('style')
      style.id = 'user-marker-styles'
      style.textContent = `
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.75; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `
      document.head.appendChild(style)
    }

    userMarkerElement.innerHTML = `
      <div style="position: relative;">
        <!-- Pulsing outer ring -->
        <div style="position: absolute; width: 32px; height: 32px; background-color: #60a5fa; border-radius: 50%; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.75;"></div>
        <!-- Solid inner circle -->
        <div style="position: relative; width: 32px; height: 32px; background-color: #2563eb; border-radius: 50%; border: 4px solid white; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); display: flex; align-items: center; justify-content: center;">
          <div style="width: 12px; height: 12px; background-color: white; border-radius: 50%;"></div>
        </div>
        <!-- Label -->
        <div style="position: absolute; top: 40px; left: 50%; transform: translateX(-50%); background-color: #2563eb; color: white; font-size: 12px; padding: 4px 8px; border-radius: 4px; white-space: nowrap;">
          You are here
        </div>
      </div>
    `
    // Create and add user marker
    userMarker.current = new mapboxgl.Marker(userMarkerElement)
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current)

    // No need to center map - it already starts at the right position and the slow zoom animation handles it

    return () => {
      if (userMarker.current) {
        userMarker.current.remove()
      }
    }
  }, [userLocation, mapLoaded])

  // Removed localStorage logic - no longer needed

  useEffect(() => {
    if (!mapContainer.current || !mapConfig) return

    // Initialize map with secure config from API
    mapboxgl.accessToken = mapConfig.accessToken

    // Start at zoomed out view over user location if available, otherwise world view
    const initialCenter: [number, number] = userLocation ? [userLocation.lng, userLocation.lat] : [0, 20]
    const initialZoom = userLocation ? 2 : 1.5

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapConfig.style,
      center: initialCenter,
      zoom: initialZoom,
      pitch: 0,
      bearing: 0,
      antialias: true // Smooth 3D rendering
    })

    map.current.on('load', () => {
      setMapLoaded(true)
      add3DBuildings()
    })

    // Share map reference with parent component
    if (mapRef) {
      mapRef.current = map.current
    }

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [mapConfig, userLocation])

  // Simple zoom animation to user location
  useEffect(() => {
    if (!map.current || !mapLoaded || !userLocation) return

    console.log('Starting simple zoom to user location...', userLocation)

    // Slowly zoom in to user location (map already starts at zoomed out view)
    setTimeout(() => {
      if (map.current) {
        map.current.easeTo({
          center: [userLocation.lng, userLocation.lat],
          zoom: 12,
          duration: 6000, // 6 seconds slow zoom
          essential: true,
          easing: t => t * (2 - t) // Smooth easing
        })

        // Finally: Add tilt after zoom completes
        setTimeout(() => {
          if (map.current) {
            map.current.easeTo({
              pitch: 45,
              duration: 2000,
              essential: true
            })
          }
        }, 5500)
      }
    }, 1000)
  }, [mapLoaded, userLocation])

  // Add course markers when both map and courses are loaded
  useEffect(() => {
    if (mapLoaded && !coursesLoading && courses.length > 0) {
      addCourseMarkers()
    }
  }, [mapLoaded, coursesLoading, courses, filters])

  // Handle selected course navigation
  useEffect(() => {
    if (selectedCourseId && map.current && courses.length > 0) {
      const selectedCourse = courses.find(course => course.id === selectedCourseId)
      if (selectedCourse) {
        map.current.flyTo({
          center: [selectedCourse.lng, selectedCourse.lat],
          zoom: 14,
          duration: 1500,
          essential: true
        })
      }
    }
  }, [selectedCourseId, courses])


  const add3DBuildings = () => {
    if (!map.current) return

    // Add 3D buildings layer
    map.current.addLayer({
      id: '3d-buildings',
      source: 'composite',
      'source-layer': 'building',
      filter: ['==', 'extrude', 'true'],
      type: 'fill-extrusion',
      minzoom: 12,
      paint: {
        'fill-extrusion-color': '#aaa',
        'fill-extrusion-height': [
          'interpolate',
          ['linear'],
          ['zoom'],
          12,
          0,
          15.05,
          ['get', 'height']
        ],
        'fill-extrusion-base': [
          'interpolate',
          ['linear'],
          ['zoom'],
          12,
          0,
          15.05,
          ['get', 'min_height']
        ],
        'fill-extrusion-opacity': 0.6
      }
    })
  }

  const addCourseMarkers = () => {
    if (!map.current) return

    // Remove existing markers and sources first
    const existingMarkers = document.querySelectorAll('.course-marker')
    existingMarkers.forEach(marker => marker.remove())

    if (map.current.getSource('courses')) {
      map.current.removeSource('courses')
    }

    // Store all markers to ensure only one can be active at a time
    const allMarkers: { marker: mapboxgl.Marker; popup: mapboxgl.Popup; element: HTMLElement; course: Course }[] = []

    // Function to clear all active states
    const clearAllActiveStates = () => {
      allMarkers.forEach(({ popup, element }) => {
        popup.remove() // Close all popups
        const markerDiv = element.querySelector('div')
        if (markerDiv) {
          markerDiv.classList.remove('ring-4', 'ring-white', 'ring-opacity-75', 'scale-125')
        }
      })
    }

    // Add course markers
    if (Array.isArray(courses)) {
      courses
        .filter((course) => {
          // Apply filters if they exist
          if (!filters) return true

          const avgPrice = (course.greenFeeMin + course.greenFeeMax) / 2

          // Price range filter
          if (avgPrice < filters.priceRange[0] || avgPrice > filters.priceRange[1]) {
            return false
          }

          // Difficulty range filter
          if (course.difficultyRating < filters.difficultyRange[0] || course.difficultyRating > filters.difficultyRange[1]) {
            return false
          }

          // Youth programs filter
          if (filters.youthPrograms && !course.youthPrograms) {
            return false
          }

          // Equipment rental filter
          if (filters.equipmentRental && !course.equipmentRental) {
            return false
          }

          return true
        })
        .forEach((course) => {
      // Create custom marker element with simple price-based color coding
      const markerElement = document.createElement('div')
      markerElement.className = 'course-marker'

      // Calculate price category for accessibility
      const avgPrice = (course.greenFeeMin + course.greenFeeMax) / 2
      let priceColor = 'bg-red-500' // Default: expensive/less accessible

      if (avgPrice <= 50) {
        priceColor = 'bg-green-500' // Affordable/most accessible
      } else if (avgPrice <= 100) {
        priceColor = 'bg-yellow-500' // Moderate pricing
      }

      markerElement.innerHTML = `
        <div class="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${priceColor} text-white">
          ⛳
        </div>
      `

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setHTML(`
        <div class="p-3 min-w-[200px]">
          <h3 class="font-semibold text-lg mb-1">${course.name}</h3>
          <p class="text-gray-600 text-sm mb-2">${course.address}</p>
          <div class="flex justify-between items-center mb-2">
            <span class="text-green-600 font-bold">$${course.greenFeeMin}-${course.greenFeeMax}</span>
            ${course.youthPrograms ? '<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Youth Programs</span>' : ''}
          </div>
          <div class="text-sm text-gray-500 mb-3">
            Difficulty: ${course.difficultyRating}/5 ⭐
          </div>
          <button class="w-full bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors" onclick="window.selectCourse('${course.id}')">
            View Details
          </button>
        </div>
      `)

      // Create marker
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([course.lng, course.lat])
        .addTo(map.current!)

      // Store marker info
      allMarkers.push({ marker, popup, element: markerElement, course })

      // Add click handler
      markerElement.addEventListener('click', () => {
        // First, clear all active states
        clearAllActiveStates()

        // Add active styling to current marker only
        const currentElement = markerElement.querySelector('div')
        if (currentElement) {
          currentElement.classList.add('ring-4', 'ring-white', 'ring-opacity-75', 'scale-125')
        }

        // Show popup for this marker only
        popup.setLngLat([course.lng, course.lat]).addTo(map.current!)

        // Center on the marker with moderate zoom
        map.current!.flyTo({
          center: [course.lng, course.lat],
          zoom: 12, // Moderate zoom level
          duration: 1500,
          essential: true
        })

        // Trigger course selection callback
        if (onCourseSelect) {
          onCourseSelect(course)
        }
      })

      // Handle popup close
      popup.on('close', () => {
        const currentElement = markerElement.querySelector('div')
        if (currentElement) {
          currentElement.classList.remove('ring-4', 'ring-white', 'ring-opacity-75', 'scale-125')
        }
      })
    })
    }

    // Global function for popup button clicks
    (window as any).selectCourse = (courseId: string) => {
      const course = Array.isArray(courses) ? courses.find(c => c.id === courseId) : null
      if (course && onCourseSelect) {
        onCourseSelect(course)
      }
    }

    // Add source and layer for clustering if needed
    if (Array.isArray(courses)) {
      map.current!.addSource('courses', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: courses.map(course => ({
            type: 'Feature',
            properties: course,
            geometry: {
              type: 'Point',
              coordinates: [course.lng, course.lat]
            }
          }))
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      })
    }
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg" />

      {(!mapLoaded || coursesLoading || !mapConfig) && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {!mapConfig ? 'Loading map configuration...' :
               !mapLoaded ? 'Initializing map...' : 'Loading courses...'}
            </p>
          </div>
        </div>
      )}

      {(coursesError || mapConfigError) && (
        <div className="absolute top-4 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <p className="text-sm">{coursesError || mapConfigError}</p>
        </div>
      )}

      {/* Heat Map Layer */}
      <HeatMapLayer
        map={map.current}
        demographicData={demographicData}
        visible={heatMapVisible}
        onToggle={handleHeatMapToggle}
      />

      {/* Map Legend - Top Left */}
      <MapLegend
        heatMapVisible={heatMapVisible}
        onHeatMapToggle={handleHeatMapToggle}
        className="absolute top-4 left-4"
      />

    </div>
  )
}