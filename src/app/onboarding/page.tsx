export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to EquiTee</h1>
        <p className="text-gray-600 text-center mb-8">
          Let's get you set up to find golf opportunities in your area.
        </p>

        <div className="space-y-4">
          <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700">
            I'm registering for myself
          </button>
          <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700">
            I'm registering for my child
          </button>
        </div>
      </div>
    </div>
  )
}