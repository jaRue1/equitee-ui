export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-6xl font-bold text-center text-green-700 mb-8 hover:text-green-900 transition-colors">
          EquiTee
        </h1>
        <p className="text-2xl text-center text-blue-600 mb-12 font-medium">
          Democratizing Golf Access in South Florida
        </p>

        <div className="bg-white rounded-xl shadow-2xl p-10 border-l-8 border-green-500">
          <h2 className="text-3xl font-bold mb-6 text-purple-700">Interactive Map Coming Soon</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            This will display golf courses, equipment listings, and accessibility data across South Florida.
          </p>
          <button className="mt-6 bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all">
            Get Started
          </button>
        </div>
      </div>
    </main>
  )
}