'use client'

interface MapLegendProps {
  heatMapVisible: boolean
  onHeatMapToggle: () => void
  className?: string
}

export default function MapLegend({ heatMapVisible, onHeatMapToggle, className = '' }: MapLegendProps) {
  const incomeRanges = [
    { color: '#dc2626', label: '$30k', range: 'Under $30k' },
    { color: '#f59e0b', label: '$45k', range: '$30k - $45k' },
    { color: '#eab308', label: '$60k', range: '$45k - $60k' },
    { color: '#84cc16', label: '$75k', range: '$60k - $75k' },
    { color: '#22c55e', label: '$100k', range: '$75k - $100k' },
    { color: '#16a34a', label: '$150k+', range: '$100k+' }
  ]

  const courseTypes = [
    { color: '#22c55e', icon: '⛳', label: 'Youth Programs', description: 'Courses with youth programs' },
    { color: '#3b82f6', icon: '🏌️', label: 'Golf Courses', description: 'Standard golf courses' },
    { color: '#a855f7', icon: '🎁', label: 'Equipment', description: 'Equipment available' },
    { color: '#f97316', icon: '👨‍🏫', label: 'Mentors', description: 'Mentorship programs' }
  ]

  return (
    <div className={`bg-white rounded-lg shadow-lg p-4 min-w-[250px] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-sm text-gray-900">Map Legend</h4>
        <div className="flex items-center text-xs text-gray-600">
          <span>🔄</span>
          <span className="ml-1">3D View Active</span>
        </div>
      </div>

      {/* Heat Map Toggle */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Income Heat Map</span>
          <button
            onClick={onHeatMapToggle}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              heatMapVisible ? 'bg-green-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                heatMapVisible ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Income Legend */}
        {heatMapVisible && (
          <div className="space-y-2 animate-in slide-in-from-top-1 duration-200">
            <p className="text-xs text-gray-600 mb-2">Median Household Income</p>
            <div className="grid grid-cols-3 gap-2">
              {incomeRanges.map((range, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: range.color }}
                  />
                  <span className="text-xs text-gray-700">{range.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Course Types Legend */}
      <div className="space-y-3">
        <h5 className="text-sm font-medium text-gray-700">Course Types</h5>
        <div className="space-y-2">
          {courseTypes.map((type, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                style={{ backgroundColor: type.color }}
              >
                {type.icon}
              </div>
              <div className="flex-1">
                <span className="text-sm text-gray-800">{type.label}</span>
                <p className="text-xs text-gray-600">{type.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Scale */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h5 className="text-sm font-medium text-gray-700 mb-3">Pricing Scale</h5>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Budget Friendly ($0-$50)</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Moderate ($50-$100)</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Premium ($100+)</span>
          </div>
        </div>
      </div>

      {/* Accessibility Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <span>ℹ️</span>
          <span>Click markers for course details</span>
        </div>
      </div>
    </div>
  )
}