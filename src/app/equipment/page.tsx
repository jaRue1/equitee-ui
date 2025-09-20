'use client'

import { useState } from 'react'
import EquipmentCard from '@/components/EquipmentCard'

interface Equipment {
  id: string
  title: string
  description: string
  equipmentType: 'driver' | 'woods' | 'irons' | 'wedges' | 'putter' | 'bag'
  condition: 'new' | 'excellent' | 'good' | 'fair'
  ageRange: string
  price: number
  images: string[]
  status: 'available' | 'pending' | 'donated' | 'sold'
  distance?: string
  userName: string
}

// Sample equipment data
const sampleEquipment: Equipment[] = [
  {
    id: '1',
    title: 'Junior Golf Set - Complete Starter Kit',
    description: 'Perfect starter set for young golfers. Includes driver, 7-iron, wedge, putter, and bag.',
    equipmentType: 'bag',
    condition: 'good',
    ageRange: '8-12 years',
    price: 75,
    images: [],
    status: 'available',
    distance: '2.3 miles',
    userName: 'Maria Rodriguez'
  },
  {
    id: '2',
    title: 'Callaway Big Bertha Driver',
    description: 'Excellent condition driver, great for intermediate players. Only used for one season.',
    equipmentType: 'driver',
    condition: 'excellent',
    ageRange: 'Teen/Adult',
    price: 120,
    images: [],
    status: 'available',
    distance: '1.8 miles',
    userName: 'Coach Johnson'
  },
  {
    id: '3',
    title: 'Youth Putter - TaylorMade',
    description: 'Free youth putter for beginners. Perfect size for kids learning to putt.',
    equipmentType: 'putter',
    condition: 'good',
    ageRange: '6-10 years',
    price: 0,
    images: [],
    status: 'available',
    distance: '0.9 miles',
    userName: 'Golf Academy Miami'
  },
  {
    id: '4',
    title: 'Iron Set - Beginner Friendly',
    description: 'Set of 5 irons (6,7,8,9,PW) perfect for learning. Forgiving clubs for new players.',
    equipmentType: 'irons',
    condition: 'fair',
    ageRange: '12+ years',
    price: 45,
    images: [],
    status: 'pending',
    distance: '3.1 miles',
    userName: 'David Smith'
  },
  {
    id: '5',
    title: 'Pink Junior Golf Bag',
    description: 'Lightweight golf bag designed for young female golfers. Includes stand and shoulder strap.',
    equipmentType: 'bag',
    condition: 'excellent',
    ageRange: '8-14 years',
    price: 35,
    images: [],
    status: 'available',
    distance: '4.2 miles',
    userName: 'Sarah Wilson'
  },
  {
    id: '6',
    title: 'Sand Wedge - Cleveland',
    description: 'Great wedge for practicing bunker shots and short game. Recently donated by local pro.',
    equipmentType: 'wedges',
    condition: 'excellent',
    ageRange: 'All ages',
    price: 0,
    images: [],
    status: 'available',
    distance: '1.5 miles',
    userName: 'Doral Golf Academy'
  }
]

export default function EquipmentPage() {
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedCondition, setSelectedCondition] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<string>('all')

  const filteredEquipment = sampleEquipment.filter(item => {
    if (selectedType !== 'all' && item.equipmentType !== selectedType) return false
    if (selectedCondition !== 'all' && item.condition !== selectedCondition) return false
    if (priceRange !== 'all') {
      if (priceRange === 'free' && item.price !== 0) return false
      if (priceRange === 'under-50' && (item.price === 0 || item.price >= 50)) return false
      if (priceRange === '50-100' && (item.price < 50 || item.price > 100)) return false
      if (priceRange === 'over-100' && item.price <= 100) return false
    }
    return true
  })

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

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {filteredEquipment.length} items found
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>🎯</span>
            <span>Showing equipment within 5 miles</span>
          </div>
        </div>

        {/* Equipment Grid */}
        {filteredEquipment.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map((equipment) => (
              <EquipmentCard
                key={equipment.id}
                equipment={equipment}
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