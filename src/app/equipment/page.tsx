'use client'

import { useState, useEffect } from 'react'
import EquipmentCard from '@/components/EquipmentCard'
import { fetchEquipmentFiltered, Equipment } from '@/lib/api'

export default function EquipmentPage() {
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedCondition, setSelectedCondition] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<string>('all')
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load equipment from API with filters
  useEffect(() => {
    async function loadEquipment() {
      try {
        setLoading(true)
        setError(null)

        const filters: any = {}

        if (selectedType !== 'all') {
          filters.equipment_type = selectedType
        }

        if (selectedCondition !== 'all') {
          filters.condition = selectedCondition
        }

        if (priceRange !== 'all') {
          if (priceRange === 'free') {
            filters.max_price = 0
          } else if (priceRange === 'under-50') {
            filters.min_price = 1
            filters.max_price = 49
          } else if (priceRange === '50-100') {
            filters.min_price = 50
            filters.max_price = 100
          } else if (priceRange === 'over-100') {
            filters.min_price = 101
          }
        }

        const equipmentData = await fetchEquipmentFiltered(filters)
        setEquipment(equipmentData)
      } catch (error) {
        console.error('Failed to load equipment:', error)
        setError('Failed to load equipment. Please try again.')
        setEquipment([])
      } finally {
        setLoading(false)
      }
    }

    loadEquipment()
  }, [selectedType, selectedCondition, priceRange])

  const handleClaim = (equipment: Equipment) => {
    alert(`Claiming: ${equipment.title}`)
    // In real app, this would open a claim/purchase modal
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Equipment Marketplace</h1>
              <p className="text-gray-600 mt-1">Find affordable golf equipment in your area</p>
            </div>
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
              List Equipment
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Equipment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="all">All Types</option>
                <option value="driver">Driver</option>
                <option value="woods">Woods</option>
                <option value="irons">Irons</option>
                <option value="wedges">Wedges</option>
                <option value="putter">Putter</option>
                <option value="bag">Golf Bag</option>
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="all">All Conditions</option>
                <option value="new">New</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="all">All Prices</option>
                <option value="free">Free</option>
                <option value="under-50">Under $50</option>
                <option value="50-100">$50 - $100</option>
                <option value="over-100">Over $100</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="distance">Distance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading equipment...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results Header */}
        {!loading && !error && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {equipment.length} items found
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>🎯</span>
              <span>Showing equipment within 5 miles</span>
            </div>
          </div>
        )}

        {/* Equipment Grid */}
        {!loading && !error && (
          equipment.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {equipment.map((equipmentItem) => (
                <EquipmentCard
                  key={equipmentItem.id}
                  equipment={equipmentItem}
                  onClaim={handleClaim}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🏌️</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No equipment found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or check back later for new listings.</p>
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                List Your Equipment
              </button>
            </div>
          )
        )}

        {/* Call to Action */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-12">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-green-800 mb-2">Have equipment to donate or sell?</h3>
            <p className="text-green-700 mb-4">
              Help other young golfers by sharing equipment you no longer use.
            </p>
            <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-semibold">
              List Your Equipment
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}