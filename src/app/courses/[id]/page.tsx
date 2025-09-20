export default function CourseDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-4">Course Details</h1>
          <p className="text-gray-600 mb-6">Course ID: {params.id}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Information</h2>
              <div className="space-y-2">
                <p><strong>Address:</strong> Loading...</p>
                <p><strong>Green Fees:</strong> Loading...</p>
                <p><strong>Youth Programs:</strong> Loading...</p>
                <p><strong>Equipment Rental:</strong> Loading...</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Map</h2>
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Map will load here</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}