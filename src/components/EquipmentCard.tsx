'use client'

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

interface EquipmentCardProps {
  equipment: Equipment
  onClaim: (equipment: Equipment) => void
}

const typeEmojis = {
  driver: '🏌️',
  woods: '🌳',
  irons: '⚔️',
  wedges: '📐',
  putter: '⭕',
  bag: '🎒'
}

const conditionColors = {
  new: 'bg-green-100 text-green-800',
  excellent: 'bg-blue-100 text-blue-800',
  good: 'bg-yellow-100 text-yellow-800',
  fair: 'bg-orange-100 text-orange-800'
}

export default function EquipmentCard({ equipment, onClaim }: EquipmentCardProps) {
  const isAvailable = equipment.status === 'available'

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Image */}
      <div className="relative">
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          {equipment.images.length > 0 ? (
            <img
              src={equipment.images[0]}
              alt={equipment.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-6xl">{typeEmojis[equipment.equipmentType]}</div>
          )}
        </div>

        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            equipment.status === 'available' ? 'bg-green-100 text-green-800' :
            equipment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            equipment.status === 'donated' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {equipment.status}
          </span>
        </div>

        {/* Price Badge */}
        <div className="absolute top-2 right-2">
          <span className="bg-white bg-opacity-90 text-green-600 font-bold px-2 py-1 rounded text-lg">
            {equipment.price === 0 ? 'FREE' : `$${equipment.price}`}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {equipment.title}
          </h3>
          <span className={`px-2 py-1 rounded text-xs font-medium ${conditionColors[equipment.condition]}`}>
            {equipment.condition}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {equipment.description}
        </p>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Type:</span>
            <span className="font-medium capitalize">{equipment.equipmentType}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Age Range:</span>
            <span className="font-medium">{equipment.ageRange}</span>
          </div>

          {equipment.distance && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Distance:</span>
              <span className="font-medium">{equipment.distance}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Listed by:</span>
            <span className="font-medium">{equipment.userName}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onClaim(equipment)}
          disabled={!isAvailable}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            isAvailable
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {equipment.status === 'available' ? (equipment.price === 0 ? 'Claim' : 'Buy') :
           equipment.status === 'pending' ? 'Pending' :
           equipment.status === 'donated' ? 'Donated' : 'Sold'}
        </button>
      </div>
    </div>
  )
}