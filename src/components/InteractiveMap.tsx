'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { fetchCourses, fetchMapConfig, Course, MapConfig } from '@/lib/api'

interface InteractiveMapProps {
  onCourseSelect?: (course: Course) => void
  selectedCourseId?: string
  mapRef?: React.MutableRefObject<mapboxgl.Map | null>
}

export default function InteractiveMap({ onCourseSelect, selectedCourseId, mapRef }: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [coursesError, setCoursesError] = useState<string | null>(null)
  const [mapConfig, setMapConfig] = useState<MapConfig | null>(null)
  const [mapConfigError, setMapConfigError] = useState<string | null>(null)

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

  useEffect(() => {
    if (!mapContainer.current || !mapConfig) return

    // Initialize map with secure config from API
    mapboxgl.accessToken = mapConfig.accessToken

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapConfig.style,
      center: [mapConfig.center.lng, mapConfig.center.lat],
      zoom: mapConfig.zoom,
      pitch: mapConfig.pitch,
      bearing: mapConfig.bearing,
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
  }, [mapConfig])

  // Add course markers when both map and courses are loaded
  useEffect(() => {
    if (mapLoaded && !coursesLoading && courses.length > 0) {
      addCourseMarkers()
    }
  }, [mapLoaded, coursesLoading, courses])

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
      courses.forEach((course) => {
      // Create custom marker element
      const markerElement = document.createElement('div')
      markerElement.className = 'course-marker'
      markerElement.innerHTML = `
        <div class="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${
          course.youthPrograms
            ? 'bg-green-500 text-white'
            : 'bg-blue-500 text-white'
        }">
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

      {/* Map Legend - Top Right */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 min-w-[200px]">
        <h4 className="font-semibold text-sm mb-3">Map Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">⛳</div>
            <span className="text-sm">Youth Programs</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">🏌️</div>
            <span className="text-sm">Golf Courses</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">🎁</div>
            <span className="text-sm">Equipment</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">👨‍🏫</div>
            <span className="text-sm">Mentors</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <span>🔄</span>
            <span>3D View Active</span>
          </div>
        </div>
      </div>

    </div>
  )
}