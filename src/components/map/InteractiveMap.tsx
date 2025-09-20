'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { fetchCourses, fetchMapConfig, fetchDemographics, fetchMentors, fetchYouthPrograms, testAPIConnection, Course, MapConfig, Demographic, Mentor, YouthProgram } from '@/lib/api'
// HeatMapLayer removed - using real zip code boundaries instead
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
  const [heatMapVisible, setHeatMapVisible] = useState(true) // Start with zip codes visible
  const userMarker = useRef<mapboxgl.Marker | null>(null)

  // Tooltip state for hover information
  const [tooltip, setTooltip] = useState<{
    visible: boolean
    x: number
    y: number
    zipCode: string
    income: number
    recommendations: string[]
  } | null>(null)

  // Load real demographic data from API
  const [realDemographics, setRealDemographics] = useState<Demographic[]>([])
  const [demographicsLoading, setDemographicsLoading] = useState(true)
  const [demographicsError, setDemographicsError] = useState<string | null>(null)
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [youthPrograms, setYouthPrograms] = useState<YouthProgram[]>([])
  const [mentorsLoading, setMentorsLoading] = useState(true)
  const [youthProgramsLoading, setYouthProgramsLoading] = useState(true)

  // Helper function to get income color with more dramatic contrasts
  const getIncomeColor = (medianIncome: number): string => {
    if (medianIncome < 45000) return '#dc2626' // Red - Under $45k (low income)
    if (medianIncome < 65000) return '#ea580c' // Orange - $45k-$65k (lower-mid income)
    if (medianIncome < 85000) return '#84cc16' // Light green - $65k-$85k (mid income)
    return '#16a34a' // Dark green - $85k+ (high income)
  }

  // Get course recommendations based on income level
  const getCourseRecommendations = (medianIncome: number): string[] => {
    if (medianIncome < 45000) {
      return [
        'Public courses ($20-40)',
        'Municipal golf courses',
        'Beginner-friendly options',
        'Group lesson packages'
      ]
    } else if (medianIncome < 65000) {
      return [
        'Semi-private courses ($40-70)',
        'Weekend specials',
        'Local club memberships',
        'Intermediate courses'
      ]
    } else if (medianIncome < 85000) {
      return [
        'Private club day passes ($70-120)',
        'Premium public courses',
        'Golf lesson packages',
        'Tournament-quality courses'
      ]
    } else {
      return [
        'Exclusive private clubs ($120+)',
        'Championship courses',
        'Premium instruction',
        'Luxury golf experiences'
      ]
    }
  }

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

  // Test API connection and load real demographic data
  useEffect(() => {
    async function loadDemographics() {
      try {
        setDemographicsLoading(true)
        setDemographicsError(null)

        // Debug: Test API connection
        console.log('🔍 Testing API endpoints...')
        const apiTest = await testAPIConnection()
        console.log('📍 API Base URL:', apiTest.baseUrl)
        console.log('✅ Working endpoints:', apiTest.workingEndpoints)
        console.log('❌ Failed endpoints:', apiTest.failedEndpoints)

        const demographics = await fetchDemographics()
        setRealDemographics(demographics)

        // Log successful data load with better validation
        console.log('✅ Real demographics loaded successfully!')
        console.log('📊 Sample data:', demographics.slice(0, 5))

        // Calculate income range with validation
        const validIncomes = demographics
          .filter(d => d && typeof d.medianIncome === 'number' && !isNaN(d.medianIncome))
          .map(d => d.medianIncome)

        if (validIncomes.length > 0) {
          console.log('💰 Income range:',
            `$${Math.min(...validIncomes).toLocaleString()} - $${Math.max(...validIncomes).toLocaleString()}`
          )
        } else {
          console.warn('⚠️ No valid income data found in demographics')
        }

        // Zip code boundaries will be loaded separately
      } catch (error) {
        console.error('Error loading demographics:', error)
        setDemographicsError(error instanceof Error ? error.message : 'Failed to load demographics')
      } finally {
        setDemographicsLoading(false)
      }
    }

    loadDemographics()
  }, [])

  // Load mentors and youth programs
  useEffect(() => {
    async function loadMentorsAndPrograms() {
      try {
        setMentorsLoading(true)
        setYouthProgramsLoading(true)

        const [mentorsData, youthProgramsData] = await Promise.all([
          fetchMentors(userLocation),
          fetchYouthPrograms(userLocation)
        ])

        setMentors(mentorsData)
        setYouthPrograms(youthProgramsData)
      } catch (error) {
        console.error('Error loading mentors/youth programs:', error)
      } finally {
        setMentorsLoading(false)
        setYouthProgramsLoading(false)
      }
    }

    loadMentorsAndPrograms()
  }, [userLocation])

  // Load zip code boundaries and apply demographic colors
  useEffect(() => {
    if (!map.current || !mapLoaded || !realDemographics.length) return

    const loadZipCodeBoundaries = async () => {
      try {
        console.log('🗺️ Loading zip code boundaries...')

        // Load the filtered GeoJSON with only our database zip codes
        const response = await fetch('/equitee-zipcodes.geojson')
        if (!response.ok) {
          throw new Error(`Failed to load zip codes: ${response.status}`)
        }

        const geoData = await response.json()
        console.log(`✅ Loaded ${geoData.features.length} zip code boundaries`)

        // Debug: Check what zip codes are in the GeoJSON
        const geoZipCodes = geoData.features.map((f: any) => f.properties.ZCTA5CE10).slice(0, 10)
        console.log('🗺️ First 10 GeoJSON zip codes:', geoZipCodes)

        // Debug: Check what zip codes are in demographics
        console.log('📊 Raw demographics data:', realDemographics.slice(0, 3))
        console.log('📊 Demographics data type check:', realDemographics[0])

        const demoZipCodes = realDemographics.map(d => d?.zipCode || 'undefined').slice(0, 10)
        console.log('📊 First 10 demographics zip codes:', demoZipCodes)

        // Cross-check: which GeoJSON zip codes have demographic data
        const matchingZips = geoZipCodes.filter((geoZip: string) =>
          realDemographics.some(demo => demo?.zipCode === geoZip)
        )
        console.log(`🔍 ${matchingZips.length} out of ${geoZipCodes.length} GeoJSON zip codes have demographic data`)
        console.log('🔍 Matching zips:', matchingZips)

        // Check if source already exists and remove it
        if (map.current!.getSource('zip-boundaries')) {
          console.log('🔄 Removing existing zip-boundaries source')
          if (map.current!.getLayer('zip-fill')) map.current!.removeLayer('zip-fill')
          if (map.current!.getLayer('zip-hover')) map.current!.removeLayer('zip-hover')
          if (map.current!.getLayer('zip-stroke')) map.current!.removeLayer('zip-stroke')
          map.current!.removeSource('zip-boundaries')
        }

        // Add GeoJSON source
        map.current!.addSource('zip-boundaries', {
          type: 'geojson',
          data: geoData
        })

        // Create a lookup map for colors instead of complex expression
        const zipColorMap: { [key: string]: string } = {}

        // Add validation and create color mapping
        const validDemographics = realDemographics.filter(demo =>
          demo && demo.zipCode && typeof demo.medianIncome === 'number' && !isNaN(demo.medianIncome)
        )

        console.log(`🔍 Filtered ${validDemographics.length} valid demographics from ${realDemographics.length} total`)

        if (validDemographics.length === 0) {
          console.warn('⚠️ No valid demographic data found! Using fallback colors.')
        }

        validDemographics.forEach(demo => {
          const color = getIncomeColor(demo.medianIncome)
          zipColorMap[demo.zipCode] = color
          console.log(`🎨 Mapping ${demo.zipCode} (income: $${demo.medianIncome.toLocaleString()}) → ${color}`)
        })

        console.log('🎨 Created color map for', validDemographics.length, 'valid demographics')

        // Create simple case-based color expression with proper structure
        let colorExpression: any

        if (validDemographics.length > 0) {
          colorExpression = ['case']

          // Add each zip code mapping as individual case
          validDemographics.forEach(demo => {
            colorExpression.push(['==', ['get', 'ZCTA5CE10'], demo.zipCode])
            colorExpression.push(zipColorMap[demo.zipCode])
          })

          // Default color for unmapped zip codes
          colorExpression.push('#e5e7eb')
        } else {
          // Fallback to simple color if no data
          colorExpression = '#22c55e'
        }

        console.log('📋 Color expression type:', Array.isArray(colorExpression) ? 'array' : 'string')
        console.log('📋 Color expression length:', Array.isArray(colorExpression) ? colorExpression.length : 'N/A')

        // Add fill layer with demographic-based colors
        try {
          map.current!.addLayer({
            id: 'zip-fill',
            type: 'fill',
            source: 'zip-boundaries',
            paint: {
              'fill-color': colorExpression,
              'fill-opacity': 0.6
            },
            layout: {
              'visibility': heatMapVisible ? 'visible' : 'none'
            }
          })
          console.log('✅ Successfully added zip-fill layer')
        } catch (error) {
          console.error('❌ Error adding zip-fill layer:', error)
          console.log('🔍 Color expression that failed:', colorExpression)

          // Fallback: Add layer with simple color
          map.current!.addLayer({
            id: 'zip-fill',
            type: 'fill',
            source: 'zip-boundaries',
            paint: {
              'fill-color': '#22c55e', // Simple green color as fallback
              'fill-opacity': 0.6
            },
            layout: {
              'visibility': heatMapVisible ? 'visible' : 'none'
            }
          })
          console.log('✅ Added fallback zip-fill layer with simple color')
        }

        // Add hover layer
        map.current!.addLayer({
          id: 'zip-hover',
          type: 'fill',
          source: 'zip-boundaries',
          paint: {
            'fill-color': '#2563eb', // Blue hover color
            'fill-opacity': 0.7
          },
          filter: ['==', 'ZCTA5CE10', ''],
          layout: {
            'visibility': heatMapVisible ? 'visible' : 'none'
          }
        })

        // Add stroke/border layer
        map.current!.addLayer({
          id: 'zip-stroke',
          type: 'line',
          source: 'zip-boundaries',
          paint: {
            'line-color': '#ffffff',
            'line-width': 1,
            'line-opacity': 0.8
          },
          layout: {
            'visibility': heatMapVisible ? 'visible' : 'none'
          }
        })

        console.log('✅ Zip code boundaries added to map with demographic colors')

      } catch (error) {
        console.error('❌ Error loading zip code boundaries:', error)
      }
    }

    loadZipCodeBoundaries()
  }, [mapLoaded, realDemographics, heatMapVisible])

  // Add hover interactions for zip code boundaries
  useEffect(() => {
    if (!map.current || !mapLoaded || !realDemographics.length) return

    const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0]
        const zipCode = feature.properties?.ZCTA5CE10
        const demo = realDemographics.find(d => d.zipCode === zipCode)

        // Update hover filter
        map.current!.setFilter('zip-hover', ['==', 'ZCTA5CE10', zipCode])

        // Update cursor
        map.current!.getCanvas().style.cursor = 'pointer'

        // Show tooltip with demographic info and recommendations
        if (demo) {
          const recommendations = getCourseRecommendations(demo.medianIncome)
          setTooltip({
            visible: true,
            x: e.point.x,
            y: e.point.y,
            zipCode: zipCode,
            income: demo.medianIncome,
            recommendations: recommendations
          })
          console.log(`🎯 Hover: ${zipCode} | Income: $${demo.medianIncome.toLocaleString()} | Color: ${getIncomeColor(demo.medianIncome)}`)
        } else {
          setTooltip({
            visible: true,
            x: e.point.x,
            y: e.point.y,
            zipCode: zipCode,
            income: 0,
            recommendations: ['No demographic data available']
          })
          console.log(`🎯 Hover: ${zipCode} | No demographic data`)
        }
      }
    }

    const handleMouseLeave = () => {
      map.current!.setFilter('zip-hover', ['==', 'ZCTA5CE10', ''])
      map.current!.getCanvas().style.cursor = ''
      setTooltip(null) // Hide tooltip
    }

    map.current.on('mousemove', 'zip-fill', handleMouseMove)
    map.current.on('mouseleave', 'zip-fill', handleMouseLeave)

    return () => {
      map.current?.off('mousemove', 'zip-fill', handleMouseMove)
      map.current?.off('mouseleave', 'zip-fill', handleMouseLeave)
    }
  }, [mapLoaded, realDemographics])

  const handleHeatMapToggle = () => {
    setHeatMapVisible(prev => !prev)
  }

  // Update zip code layer visibility when heatMapVisible changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    const visibility = heatMapVisible ? 'visible' : 'none'

    try {
      // Check if layers exist before trying to update them
      if (map.current.getLayer('zip-fill')) {
        map.current.setLayoutProperty('zip-fill', 'visibility', visibility)
      }
      if (map.current.getLayer('zip-hover')) {
        map.current.setLayoutProperty('zip-hover', 'visibility', visibility)
      }
      if (map.current.getLayer('zip-stroke')) {
        map.current.setLayoutProperty('zip-stroke', 'visibility', visibility)
      }
    } catch (error) {
      console.warn('Error updating layer visibility:', error)
    }
  }, [heatMapVisible, mapLoaded])

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

      {/* Zip code boundaries are now handled directly in the map */}

      {/* Map Legend - Top Left */}
      <MapLegend
        heatMapVisible={heatMapVisible}
        onHeatMapToggle={handleHeatMapToggle}
        className="absolute top-4 left-4"
      />

      {/* Hover Tooltip for Zip Code Demographics */}
      {tooltip && tooltip.visible && (
        <div
          className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-4 pointer-events-none z-50 min-w-[280px] animate-in fade-in-0 duration-200"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="space-y-3">
            {/* Zip Code Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Zip Code {tooltip.zipCode}</h3>
              <div
                className="w-4 h-4 rounded-full border border-white"
                style={{ backgroundColor: getIncomeColor(tooltip.income) }}
              />
            </div>

            {/* Income Information */}
            {tooltip.income > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Median Income:</span>
                  <span className="font-semibold text-green-600">
                    ${tooltip.income.toLocaleString()}
                  </span>
                </div>

                {/* Income Category */}
                <div className="text-xs text-gray-500">
                  {tooltip.income < 45000 && "Low Income Area"}
                  {tooltip.income >= 45000 && tooltip.income < 65000 && "Lower-Mid Income Area"}
                  {tooltip.income >= 65000 && tooltip.income < 85000 && "Mid Income Area"}
                  {tooltip.income >= 85000 && "High Income Area"}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No demographic data available</div>
            )}

            {/* Course Recommendations */}
            <div className="border-t border-gray-200 pt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recommended Golf Options:</h4>
              <ul className="space-y-1">
                {tooltip.recommendations.map((rec, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}