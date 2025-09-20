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
    <div className={`bg-white rounded-lg shadow-lg p-3 ${className}`}>
      {/* Compact Horizontal Layout */}
      <div className="flex items-center space-x-4">
        {/* Heat Map Toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-gray-700">Heat Map</span>
          <button
            onClick={onHeatMapToggle}
            className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
              heatMapVisible ? 'bg-green-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${
                heatMapVisible ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Course Types - Horizontal Icons */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">⛳</div>
            <span className="text-xs text-gray-700">Youth</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">🏌️</div>
            <span className="text-xs text-gray-700">Courses</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">🎁</div>
            <span className="text-xs text-gray-700">Equipment</span>
          </div>
        </div>
      </div>

      {/* Income Legend - Only show when heat map is active */}
      {heatMapVisible && (
        <div className="mt-3 pt-3 border-t border-gray-200 animate-in slide-in-from-top-1 duration-200">
          <div className="flex items-center space-x-4">
            <span className="text-xs text-gray-600">Income:</span>
            <div className="flex items-center space-x-3">
              {incomeRanges.slice(0, 4).map((range, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <div
                    className="w-2 h-2 rounded"
                    style={{ backgroundColor: range.color }}
                  />
                  <span className="text-xs text-gray-700">{range.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}