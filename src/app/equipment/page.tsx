export default function EquipmentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Equipment Marketplace</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Junior Golf Set</h3>
            <p className="text-gray-600 mb-4">Complete set for ages 8-12</p>
            <div className="flex justify-between items-center">
              <span className="text-green-600 font-bold">$75</span>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Claim
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}