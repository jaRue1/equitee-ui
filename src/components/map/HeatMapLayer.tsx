'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

export interface DemographicData {
  zipCode: string
  medianIncome: number
  bounds: GeoJSON.Polygon
  accessibilityScore: number
}

interface HeatMapLayerProps {
  map: mapboxgl.Map | null
  demographicData: DemographicData[]
  visible: boolean
  onToggle: () => void
}

export default function HeatMapLayer({ map, demographicData, visible, onToggle }: HeatMapLayerProps) {
  const layerAddedRef = useRef(false)

  useEffect(() => {
    if (!map || !demographicData.length) return

    const addHeatMapLayers = () => {
      if (!map.isStyleLoaded()) return

      const sourceId = 'demographic-data'
      const layerId = 'demographic-layer'

      // Create GeoJSON from demographic data
      const geojsonData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: demographicData.map(data => ({
          type: 'Feature' as const,
          properties: {
            zipCode: data.zipCode,
            medianIncome: data.medianIncome,
            accessibilityScore: data.accessibilityScore
          },
          geometry: data.bounds
        }))
      }

      // Add source if it doesn't exist
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: 'geojson',
          data: geojsonData
        })
      }

    // Add layer if it doesn't exist
    if (!map.getLayer(layerId) && !layerAddedRef.current) {
      // Income-based color expression (red=low, green=high)
      const incomeColorExpression: mapboxgl.Expression = [
        'interpolate',
        ['linear'],
        ['get', 'medianIncome'],
        30000, '#dc2626',   // Low income - red
        45000, '#f59e0b',   // Lower-medium income - orange
        60000, '#eab308',   // Medium income - yellow
        75000, '#84cc16',   // Medium-high income - lime
        100000, '#22c55e',  // High income - green
        150000, '#16a34a'   // Very high income - dark green
      ]

      map.addLayer({
        id: layerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': incomeColorExpression,
          'fill-opacity': visible ? 0.6 : 0,
          'fill-outline-color': '#ffffff'
        }
      })

      // Add hover effect layer
      map.addLayer({
        id: `${layerId}-hover`,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': incomeColorExpression,
          'fill-opacity': 0.8
        },
        filter: ['==', 'zipCode', '']
      })

      layerAddedRef.current = true

      // Add hover interactions
      let hoveredZipCode: string | null = null

      map.on('mousemove', layerId, (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0]
          const zipCode = feature.properties?.zipCode
          const medianIncome = feature.properties?.medianIncome
          const accessibilityScore = feature.properties?.accessibilityScore

          if (hoveredZipCode !== zipCode) {
            // Update hover layer filter
            map.setFilter(`${layerId}-hover`, ['==', 'zipCode', zipCode])
            hoveredZipCode = zipCode

            // Create popup content
            const popupContent = `
              <div class="p-3 min-w-[180px]">
                <h4 class="font-semibold text-lg mb-2">Zip Code ${zipCode}</h4>
                <div class="space-y-1 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Median Income:</span>
                    <span class="font-medium">$${medianIncome?.toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Accessibility Score:</span>
                    <span class="font-medium">${accessibilityScore}/100</span>
                  </div>
                </div>
              </div>
            `

            // Show popup
            new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false
            })
              .setLngLat(e.lngLat)
              .setHTML(popupContent)
              .addTo(map)
          }
        }
      })

      map.on('mouseleave', layerId, () => {
        if (hoveredZipCode) {
          map.setFilter(`${layerId}-hover`, ['==', 'zipCode', ''])
          hoveredZipCode = null
        }

        // Remove popup
        const popups = document.getElementsByClassName('mapboxgl-popup')
        if (popups.length) {
          for (let i = 0; i < popups.length; i++) {
            const popup = popups[i] as HTMLElement
            if (popup.style.pointerEvents === 'none') {
              popup.remove()
            }
          }
        }
      })

      // Change cursor on hover
      map.on('mouseenter', layerId, () => {
        map.getCanvas().style.cursor = 'pointer'
      })

      map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = ''
      })
    }

    // Update layer opacity based on visibility
    if (map.getLayer(layerId)) {
      map.setPaintProperty(layerId, 'fill-opacity', visible ? 0.6 : 0)
    }
    }

    // Try to add layers immediately if map is loaded
    if (map.isStyleLoaded()) {
      addHeatMapLayers()
    } else {
      // Wait for map to load
      map.on('load', addHeatMapLayers)
    }

    return () => {
      // Cleanup on unmount
      const popups = document.getElementsByClassName('mapboxgl-popup')
      if (popups.length) {
        for (let i = 0; i < popups.length; i++) {
          (popups[i] as HTMLElement).remove()
        }
      }
      map.off('load', addHeatMapLayers)
    }
  }, [map, demographicData, visible])

  // This component doesn't render anything visible - it just manages map layers
  return null
}