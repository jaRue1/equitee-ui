export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Golf Courses</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Doral Golf Resort</h3>
            <p className="text-gray-600 mb-4">4400 NW 87th Ave, Doral, FL</p>
            <div className="flex justify-between items-center mb-4">
              <span className="text-green-600 font-bold">$45-85</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                Youth Program
              </span>
            </div>
            <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}