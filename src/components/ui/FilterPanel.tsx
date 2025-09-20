'use client'

import { useState, useEffect } from 'react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

interface FilterState {
  priceRange: [number, number]
  youthPrograms: boolean
  difficultyRange: [number, number]
  equipmentRental: boolean
}

interface FilterPanelProps {
  onFiltersChange: (filters: FilterState) => void
  isVisible: boolean
  onToggle: () => void
}

export default function FilterPanel({ onFiltersChange, isVisible, onToggle }: FilterPanelProps) {
  const initialFilters: FilterState = {
    priceRange: [0, 200],
    youthPrograms: false,
    difficultyRange: [1, 5],
    equipmentRental: false
  }

  const [filters, setFilters] = useState<FilterState>(initialFilters)

  // Notify parent of filter changes
  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const updateFilters = (updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }))
  }

  const clearAllFilters = () => {
    setFilters(initialFilters)
  }

  // Check if filters have changed from initial state
  const hasFiltersChanged = () => {
    return (
      filters.priceRange[0] !== initialFilters.priceRange[0] ||
      filters.priceRange[1] !== initialFilters.priceRange[1] ||
      filters.difficultyRange[0] !== initialFilters.difficultyRange[0] ||
      filters.difficultyRange[1] !== initialFilters.difficultyRange[1] ||
      filters.youthPrograms !== initialFilters.youthPrograms ||
      filters.equipmentRental !== initialFilters.equipmentRental
    )
  }

  return (
    <>
      {/* Filter Panel */}
      <div className={`
        fixed right-4 top-20 w-80 bg-white rounded-2xl shadow-2xl z-40
        transform transition-all duration-500 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}>
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold mb-1">Filters</h2>
              <p className="text-gray-300 text-sm">Customize your search</p>
            </div>
            <button
              onClick={onToggle}
              className="text-white hover:text-gray-200 text-xl transform hover:scale-110 transition-transform"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">

            {/* Price Range Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
              </label>
              <Slider
                range
                min={0}
                max={200}
                step={10}
                value={filters.priceRange}
                onChange={(value) => updateFilters({ priceRange: value as [number, number] })}
                trackStyle={[{ backgroundColor: '#059669' }]}
                handleStyle={[
                  { borderColor: '#059669', backgroundColor: '#059669' },
                  { borderColor: '#059669', backgroundColor: '#059669' }
                ]}
                railStyle={{ backgroundColor: '#e5e7eb' }}
              />
            </div>

            {/* Difficulty Range Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Difficulty: {filters.difficultyRange[0]} - {filters.difficultyRange[1]} ⭐
              </label>
              <Slider
                range
                min={1}
                max={5}
                step={1}
                value={filters.difficultyRange}
                onChange={(value) => updateFilters({ difficultyRange: value as [number, number] })}
                trackStyle={[{ backgroundColor: '#059669' }]}
                handleStyle={[
                  { borderColor: '#059669', backgroundColor: '#059669' },
                  { borderColor: '#059669', backgroundColor: '#059669' }
                ]}
                railStyle={{ backgroundColor: '#e5e7eb' }}
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.youthPrograms}
                  onChange={(e) => updateFilters({ youthPrograms: e.target.checked })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-3"
                />
                <span className="text-sm text-gray-700">Youth Programs</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.equipmentRental}
                  onChange={(e) => updateFilters({ equipmentRental: e.target.checked })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-3"
                />
                <span className="text-sm text-gray-700">Equipment Rental</span>
              </label>
            </div>

          </div>

          {/* Clear All Filters Button - Always visible, disabled when no changes */}
          <div className="border-t border-gray-200 pt-4 mt-6">
            <button
              onClick={clearAllFilters}
              disabled={!hasFiltersChanged()}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                hasFiltersChanged()
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>

      {/* Toggle Button (when panel is hidden) */}
      {!isVisible && (
        <button
          onClick={onToggle}
          className="fixed right-4 top-32 bg-white text-gray-700 px-4 py-2 rounded-lg shadow-lg hover:shadow-xl border border-gray-300 transition-all z-30 flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm font-medium">Filters</span>
        </button>
      )}

    </>
  )
}