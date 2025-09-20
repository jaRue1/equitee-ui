'use client'

interface MapLegendProps {
  heatMapVisible: boolean
  onHeatMapToggle: () => void
  className?: string
}

export default function MapLegend({ heatMapVisible, onHeatMapToggle, className = '' }: MapLegendProps) {
  const incomeRanges = [
    { color: '#dc2626', label: 'Under $45k', range: 'Low Income' },
    { color: '#ea580c', label: '$45k-$65k', range: 'Lower-Mid Income' },
    { color: '#84cc16', label: '$65k-$85k', range: 'Mid Income' },
    { color: '#16a34a', label: '$85k+', range: 'High Income' }
  ]

  const coursePricing = [
    { color: '#22c55e', icon: '⛳', label: 'Low ($0-50)', description: 'Most affordable courses' },
    { color: '#eab308', icon: '⛳', label: 'Mid ($50-100)', description: 'Moderate pricing' },
    { color: '#dc2626', icon: '⛳', label: 'High ($100+)', description: 'Premium courses' }
  ]

  return (
    <div className={`bg-white rounded-lg shadow-lg p-3 ${className}`}>
      {/* Compact Horizontal Layout */}
      <div className="flex items-center space-x-4">
        {/* Heat Map Toggle - Now Working */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-gray-700">Income Map</span>
          <button
            onClick={onHeatMapToggle}
            className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
              heatMapVisible ? 'bg-green-600' : 'bg-gray-200'
            }`}
            title="Toggle income demographic map"
          >
            <span
              className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${
                heatMapVisible ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-xs text-green-600">✓ Real Data</span>
        </div>

        {/* Course Pricing - Horizontal Icons */}
        <div className="flex items-center space-x-3">
          {coursePricing.map((pricing, index) => (
            <div key={index} className="flex items-center space-x-1">
              <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs" style={{ backgroundColor: pricing.color }}>
                {pricing.icon}
              </div>
              <span className="text-xs text-gray-700">{pricing.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Income Legend - Show when heat map is active */}
      {heatMapVisible && (
        <div className="mt-3 pt-3 border-t border-gray-200 animate-in slide-in-from-top-1 duration-200">
          <div className="flex items-center space-x-4">
            <span className="text-xs text-gray-600">Median Income:</span>
            <div className="flex items-center space-x-3">
              {incomeRanges.slice(0, 6).map((range, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <div
                    className="w-3 h-3 rounded border border-white"
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