'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Sample course data - in real app this would come from API
const sampleCourses = [
  {
    id: '1',
    name: 'Doral Golf Resort',
    address: '4400 NW 87th Ave, Doral, FL',
    lat: 25.8156,
    lng: -80.3348,
    greenFeeMin: 45,
    greenFeeMax: 85,
    youthPrograms: true,
    difficultyRating: 3.5,
    equipmentRental: true
  },
  {
    id: '2',
    name: 'Crandon Golf Course',
    address: '6700 Crandon Blvd, Key Biscayne, FL',
    lat: 25.7085,
    lng: -80.1617,
    greenFeeMin: 35,
    greenFeeMax: 65,
    youthPrograms: true,
    difficultyRating: 2.8,
    equipmentRental: true
  },
  {
    id: '3',
    name: 'Fontainebleau Golf Course',
    address: '9603 Fontainebleau Blvd, Miami, FL',
    lat: 25.7753,
    lng: -80.3267,
    greenFeeMin: 25,
    greenFeeMax: 45,
    youthPrograms: false,
    difficultyRating: 2.5,
    equipmentRental: false
  },
  {
    id: '4',
    name: 'Palmetto Golf Course',
    address: '9300 SW 152nd St, Miami, FL',
    lat: 25.6789,
    lng: -80.3456,
    greenFeeMin: 30,
    greenFeeMax: 50,
    youthPrograms: true,
    difficultyRating: 3.0,
    equipmentRental: true
  }
]

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

interface InteractiveMapProps {
  onCourseSelect?: (course: Course) => void
  selectedCourseId?: string
  mapRef?: React.MutableRefObject<mapboxgl.Map | null>
}

export default function InteractiveMap({ onCourseSelect, selectedCourseId, mapRef }: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!mapContainer.current) return

    // Initialize map
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-80.2911, 25.7617], // Miami center
      zoom: 10
    })

    map.current.on('load', () => {
      setMapLoaded(true)
      addCourseMarkers()
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
  }, [])

  const addCourseMarkers = () => {
    if (!map.current) return

    // Add course markers
    sampleCourses.forEach((course) => {
      // Create custom marker element
      const markerElement = document.createElement('div')
      markerElement.className = 'course-marker'
      markerElement.innerHTML = `
        <div class="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${
          course.youthPrograms
            ? 'bg-green-500 text-white'
            : 'bg-gray-400 text-white'
        }">
          ⛳
        </div>
      `

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false
      }).setHTML(`
        <div class="p-3 min-w-[200px]">
          <h3 class="font-semibold text-lg mb-1">${course.name}</h3>
          <p class="text-gray-600 text-sm mb-2">${course.address}</p>
          <div class="flex justify-between items-center mb-2">
            <span class="text-green-600 font-bold">$${course.greenFeeMin}-${course.greenFeeMax}</span>
            ${course.youthPrograms ? '<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Youth Programs</span>' : ''}
          </div>
          <div class="text-sm text-gray-500">
            Difficulty: ${course.difficultyRating}/5 ⭐
          </div>
        </div>
      `)

      // Create marker
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([course.lng, course.lat])
        .setPopup(popup)
        .addTo(map.current!)

      // Add click handler
      markerElement.addEventListener('click', () => {
        if (onCourseSelect) {
          onCourseSelect(course)
        }
      })
    })

    // Add source and layer for clustering if needed
    map.current!.addSource('courses', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: sampleCourses.map(course => ({
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

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg" />

      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map controls */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-sm">Youth Programs</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
            <span className="text-sm">Adults Only</span>
          </div>
        </div>
      </div>

      {/* Accessibility info */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
        <h4 className="font-semibold text-sm mb-2">Accessibility Gap Analysis</h4>
        <p className="text-xs text-gray-600">
          Green markers indicate courses with youth programs.
          Gaps in coverage show underserved areas.
        </p>
      </div>
    </div>
  )
}