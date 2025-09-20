'use client'

import { useState, useEffect } from 'react'
import { useGeolocation } from '@/hooks/useGeolocation'

interface QuickProfile {
  name: string
  email: string
  age: number
  golfExperience: 'never-played' | 'beginner' | 'intermediate'
  zipCode: string
  userType: 'youth' | 'parent' | 'sponsor' | 'mentor'
  goals: string[]
  hasEquipment: boolean
  interests: string[]
}

interface QuickStartWizardProps {
  onComplete: (profile: QuickProfile) => void
  onClose: () => void
  isOpen: boolean
}

interface QuickStartWizardProps {
  onComplete: (profile: QuickProfile) => void
  onClose: () => void
  isOpen: boolean
  googleUser?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  forced?: boolean // Cannot be closed
}

export default function QuickStartWizard({ onComplete, onClose, isOpen, googleUser, forced = false }: QuickStartWizardProps) {
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState<Partial<QuickProfile>>({
    // Pre-fill from Google Auth
    name: googleUser?.name || '',
    email: googleUser?.email || '',
    interests: [],
    goals: []
  })
  const { requestLocation, loading: locationLoading, error: locationError, position } = useGeolocation()

  // Update profile when googleUser changes
  useEffect(() => {
    console.log('Google user in QuickStartWizard:', googleUser)
    if (googleUser) {
      console.log('Updating profile with Google data:', {
        name: googleUser.name,
        email: googleUser.email
      })
      updateProfile({
        name: googleUser.name || '',
        email: googleUser.email || ''
      })
    }
  }, [googleUser])

  const updateProfile = (updates: Partial<QuickProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => setStep(prev => prev + 1)
  const prevStep = () => setStep(prev => prev - 1)

  const handleComplete = () => {
    console.log('Attempting to complete with profile:', profile)

    const requiredFields = {
      name: profile.name,
      email: profile.email,
      age: profile.age,
      golfExperience: profile.golfExperience,
      zipCode: profile.zipCode,
      userType: profile.userType
    }

    console.log('Required fields check:', requiredFields)

    const isValid = Object.values(requiredFields).every(field => field !== undefined && field !== null && field !== '')

    if (isValid) {
      const completeProfile: QuickProfile = {
        name: profile.name!,
        email: profile.email!,
        age: profile.age!,
        golfExperience: profile.golfExperience!,
        zipCode: profile.zipCode!,
        userType: profile.userType!,
        goals: profile.goals || [],
        hasEquipment: profile.hasEquipment || false,
        interests: profile.interests || []
      }
      console.log('Calling onComplete with:', completeProfile)
      onComplete(completeProfile)
    } else {
      console.log('Form validation failed')
      alert('Please fill in all required fields')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Progress Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              {googleUser?.image && (
                <img
                  src={googleUser.image}
                  alt={googleUser.name || ''}
                  className="w-10 h-10 rounded-full border-2 border-white"
                />
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Welcome {googleUser?.name?.split(' ')[0] || 'there'}</h2>
                <p className="text-gray-500 text-xs">Quick setup to get started</p>
              </div>
            </div>
            {!forced && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            )}
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Step {step} of 3</span>
              <span>{Math.round((step / 3) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-green-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
              <p className="text-gray-600 text-sm mb-6">
                We&apos;ve pre-filled some details from Google.
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-left text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profile.name || ''}
                    onChange={(e) => updateProfile({ name: e.target.value })}
                    className="w-full text-lg border-2 border-gray-200 rounded-xl py-3 px-4 focus:border-green-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-left text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profile.email || ''}
                    onChange={(e) => updateProfile({ email: e.target.value })}
                    className="w-full text-lg border-2 border-gray-200 rounded-xl py-3 px-4 focus:border-green-500 focus:outline-none transition-colors bg-gray-50"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">From your Google account</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <label className="text-center">
                  <input
                    type="radio"
                    name="age-range"
                    value="youth"
                    onChange={() => updateProfile({ age: 12 })}
                    className="sr-only"
                  />
                  <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    profile.age === 12 ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
                  }`}>
                    <div className="text-2xl mb-2">👶</div>
                    <div className="text-sm font-medium">Under 16</div>
                  </div>
                </label>

                <label className="text-center">
                  <input
                    type="radio"
                    name="age-range"
                    value="teen"
                    onChange={() => updateProfile({ age: 17 })}
                    className="sr-only"
                  />
                  <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    profile.age === 17 ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
                  }`}>
                    <div className="text-2xl mb-2">🧑</div>
                    <div className="text-sm font-medium">16-25</div>
                  </div>
                </label>

                <label className="text-center">
                  <input
                    type="radio"
                    name="age-range"
                    value="adult"
                    onChange={() => updateProfile({ age: 35 })}
                    className="sr-only"
                  />
                  <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    profile.age === 35 ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
                  }`}>
                    <div className="text-2xl mb-2">👨</div>
                    <div className="text-sm font-medium">25+</div>
                  </div>
                </label>
              </div>

              <button
                onClick={nextStep}
                disabled={!profile.name || !profile.age}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
              >
                Next: Golf Experience
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="text-center">
              <div className="text-6xl mb-6">🏌️</div>
              <h3 className="text-2xl font-bold mb-4">
                Hey {profile.name}! What&apos;s your golf experience?
              </h3>
              <p className="text-gray-600 mb-6">
                Be honest - we&apos;ll tailor everything to your level!
              </p>

              <div className="space-y-4 mb-8">
                {[
                  {
                    id: 'never-played',
                    emoji: '🌱',
                    title: 'Never played golf',
                    description: 'I&apos;m completely new to this!'
                  },
                  {
                    id: 'beginner',
                    emoji: '🎯',
                    title: 'Tried it a few times',
                    description: 'I&apos;ve swung a club but need help'
                  },
                  {
                    id: 'intermediate',
                    emoji: '⛳',
                    title: 'I play occasionally',
                    description: 'I know the basics but want to improve'
                  }
                ].map((option) => (
                  <label key={option.id} className="block">
                    <input
                      type="radio"
                      name="experience"
                      value={option.id}
                      onChange={() => updateProfile({ golfExperience: option.id as any })}
                      className="sr-only"
                    />
                    <div className={`border-2 rounded-xl p-6 cursor-pointer transition-all text-left ${
                      profile.golfExperience === option.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{option.emoji}</div>
                        <div>
                          <div className="font-semibold">{option.title}</div>
                          <div className="text-gray-600 text-sm">{option.description}</div>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={prevStep}
                  className="flex-1 border border-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    // Auto-set userType based on age and advance
                    let userType: 'youth' | 'parent' | 'sponsor' | 'mentor' = 'youth'
                    if (profile.age === 12) userType = 'youth'
                    else if (profile.age === 17) userType = 'youth'
                    else userType = 'parent' // Adults are likely parents looking for their children

                    updateProfile({ userType })
                    nextStep()
                  }}
                  disabled={!profile.golfExperience}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
                >
                  Almost Done!
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Location Access</h3>
              <p className="text-gray-600 text-sm mb-6">
                Allow location access to find nearby golf resources
              </p>

              {position ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 text-green-800">
                    <span className="text-lg">✓</span>
                    <span className="font-medium">Location detected!</span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    Ready to find golf courses near you
                  </p>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  {locationError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-sm">{locationError}</p>
                    </div>
                  )}

                  <button
                    onClick={requestLocation}
                    disabled={locationLoading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>📍</span>
                    <span>{locationLoading ? 'Requesting...' : 'Allow Location Access'}</span>
                  </button>

                  <div className="text-center">
                    <p className="text-gray-500 text-xs">or</p>
                    <input
                      type="text"
                      placeholder="Enter ZIP code"
                      value={profile.zipCode || ''}
                      onChange={(e) => updateProfile({ zipCode: e.target.value })}
                      className="w-32 mt-2 text-center text-sm border border-gray-300 rounded py-2 px-3 focus:border-green-500 focus:outline-none"
                      maxLength={5}
                      pattern="[0-9]{5}"
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={prevStep}
                  className="flex-1 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    // Use position coordinates to generate a fake zip code for now
                    if (position) {
                      updateProfile({ zipCode: '33101' }) // Default South Florida zip
                    }
                    handleComplete()
                  }}
                  disabled={!position && (!profile.zipCode || profile.zipCode.length !== 5)}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}