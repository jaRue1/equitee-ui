'use client'

import { useState, useEffect } from 'react'

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
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 200],
    youthPrograms: false,
    difficultyRange: [1, 5],
    equipmentRental: false
  })

  // Notify parent of filter changes
  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const updateFilters = (updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }))
  }

  const clearAllFilters = () => {
    setFilters({
      priceRange: [0, 200],
      youthPrograms: false,
      difficultyRange: [1, 5],
      equipmentRental: false
    })
  }

  return (
    <>
      {/* Filter Panel */}
      <div className={`
        fixed right-4 top-20 bottom-20 w-80 bg-white rounded-2xl shadow-2xl z-40 overflow-hidden
        transform transition-all duration-500 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}>
        {/* Header */}
        <div className="bg-gray-800 text-white p-6 rounded-t-2xl">
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
        <div className="p-6 h-full overflow-y-auto pb-24">

          {/* Price Range Slider */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
            </label>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Min Price</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={filters.priceRange[0]}
                  onChange={(e) => updateFilters({
                    priceRange: [parseInt(e.target.value), filters.priceRange[1]]
                  })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Max Price</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={filters.priceRange[1]}
                  onChange={(e) => updateFilters({
                    priceRange: [filters.priceRange[0], parseInt(e.target.value)]
                  })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>

          {/* Difficulty Range */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Difficulty Level: {filters.difficultyRange[0]} - {filters.difficultyRange[1]} ⭐
            </label>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Min Difficulty</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={filters.difficultyRange[0]}
                  onChange={(e) => updateFilters({
                    difficultyRange: [parseInt(e.target.value), filters.difficultyRange[1]]
                  })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Max Difficulty</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={filters.difficultyRange[1]}
                  onChange={(e) => updateFilters({
                    difficultyRange: [filters.difficultyRange[0], parseInt(e.target.value)]
                  })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>

          {/* Amenity Checkboxes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Amenities</label>
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

          {/* Active Filters Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                ${filters.priceRange[0]}-${filters.priceRange[1]}
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {filters.difficultyRange[0]}-{filters.difficultyRange[1]} ⭐
              </span>
              {filters.youthPrograms && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  Youth Programs
                </span>
              )}
              {filters.equipmentRental && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                  Equipment Rental
                </span>
              )}
            </div>
          </div>

          {/* Clear All Filters Button */}
          <button
            onClick={clearAllFilters}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Clear All Filters
          </button>
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

      {/* Custom slider styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #059669;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #059669;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </>
  )
}