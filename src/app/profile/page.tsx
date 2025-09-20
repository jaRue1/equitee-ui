'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface UserProfile {
  name: string
  email: string
  age: number
  golfExperience: 'never-played' | 'beginner' | 'intermediate'
  zipCode: string
  userType: 'youth' | 'parent' | 'sponsor' | 'mentor'
  goals: string[]
  hasEquipment: boolean
  interests: string[]
  completedSteps: string[]
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<UserProfile>>({})

  // Load profile from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('equitee-user-profile')
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile))
        setEditData(JSON.parse(savedProfile))
      } catch (error) {
        console.error('Error loading user profile:', error)
      }
    }
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/')
    }
  }, [session, status, router])

  const getUserTypeDisplay = (type: string) => {
    const types = {
      youth: '🏌️‍♂️ Learning Golf',
      parent: '👨‍👩‍👧‍👦 Parent/Guardian',
      sponsor: '💝 Community Sponsor',
      mentor: '👨‍🏫 Golf Mentor'
    }
    return types[type as keyof typeof types] || type
  }

  const getExperienceDisplay = (exp: string) => {
    const experiences = {
      'never-played': '🌱 New to Golf',
      'beginner': '🎯 Beginner',
      'intermediate': '⛳ Intermediate'
    }
    return experiences[exp as keyof typeof experiences] || exp
  }

  const handleSaveChanges = () => {
    if (userProfile && editData) {
      const updatedProfile = { ...userProfile, ...editData }
      setUserProfile(updatedProfile)
      localStorage.setItem('equitee-user-profile', JSON.stringify(updatedProfile))
      setIsEditing(false)
    }
  }

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      localStorage.removeItem('equitee-user-profile')
      signOut({ callbackUrl: '/' })
    }
  }

  const handleDeactivateAccount = () => {
    if (confirm('Are you sure you want to deactivate your account? You can reactivate it by signing in again.')) {
      localStorage.removeItem('equitee-user-profile')
      signOut({ callbackUrl: '/' })
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <span>←</span>
              <span>Back to Map</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Profile Settings</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-8 text-center">
              <img
                src={session.user?.image || ''}
                alt={session.user?.name || ''}
                className="w-24 h-24 rounded-full border-4 border-white mx-auto mb-4"
              />
              <h2 className="text-2xl font-bold">{session.user?.name}</h2>
              <p className="text-green-100">{session.user?.email}</p>
              {userProfile && (
                <div className="mt-4 flex justify-center space-x-4">
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                    {getUserTypeDisplay(userProfile.userType)}
                  </span>
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                    {getExperienceDisplay(userProfile.golfExperience)}
                  </span>
                </div>
              )}
            </div>

            {/* Profile Details */}
            <div className="p-8">
              {userProfile ? (
                <div className="space-y-6">
                  {/* Golf Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Golf Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Experience Level
                        </label>
                        {isEditing ? (
                          <select
                            value={editData.golfExperience || userProfile.golfExperience}
                            onChange={(e) => setEditData(prev => ({ ...prev, golfExperience: e.target.value as any }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="never-played">Never Played</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                          </select>
                        ) : (
                          <p className="text-gray-900">{getExperienceDisplay(userProfile.golfExperience)}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Age
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editData.age || userProfile.age}
                            onChange={(e) => setEditData(prev => ({ ...prev, age: Number(e.target.value) }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">{userProfile.age} years old</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Role
                        </label>
                        {isEditing ? (
                          <select
                            value={editData.userType || userProfile.userType}
                            onChange={(e) => setEditData(prev => ({ ...prev, userType: e.target.value as any }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="youth">Learning Golf</option>
                            <option value="parent">Parent/Guardian</option>
                            <option value="sponsor">Community Sponsor</option>
                            <option value="mentor">Golf Mentor</option>
                          </select>
                        ) : (
                          <p className="text-gray-900">{getUserTypeDisplay(userProfile.userType)}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.zipCode || userProfile.zipCode}
                            onChange={(e) => setEditData(prev => ({ ...prev, zipCode: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="ZIP Code"
                          />
                        ) : (
                          <p className="text-gray-900">{userProfile.zipCode}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t border-gray-200 pt-6">
                    {isEditing ? (
                      <div className="flex space-x-3">
                        <button
                          onClick={handleSaveChanges}
                          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false)
                            setEditData(userProfile)
                          }}
                          className="flex-1 border border-gray-300 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <button
                          onClick={() => setIsEditing(true)}
                          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          ✏️ Edit Profile
                        </button>

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={handleDeactivateAccount}
                            className="bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                          >
                            😴 Deactivate Account
                          </button>
                          <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                          >
                            🚪 Sign Out
                          </button>
                        </div>

                        <button
                          onClick={handleDeleteAccount}
                          className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          🗑️ Delete Account
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">👤</div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Profile Found</h3>
                  <p className="text-gray-500 mb-6">
                    Complete your golf profile to get personalized recommendations.
                  </p>
                  <button
                    onClick={() => router.push('/')}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Complete Profile
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Additional Stats Card */}
          {userProfile && (
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Your EquiTee Journey</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {userProfile.completedSteps?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Steps Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {userProfile.interests?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Interests</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {userProfile.goals?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Goals Set</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}