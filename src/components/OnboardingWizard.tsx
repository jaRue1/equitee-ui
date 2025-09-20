'use client'

import { useState } from 'react'

type UserType = 'parent' | 'youth' | 'mentor' | 'sponsor'
type GolfExperience = 'beginner' | 'intermediate' | 'advanced' | 'pro'

interface OnboardingData {
  registrationType: 'self' | 'child'
  userType: UserType
  name: string
  email: string
  phone: string
  age: number
  zipCode: string
  golfExperience: GolfExperience
  handicap?: number
}

export default function OnboardingWizard() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<Partial<OnboardingData>>({})

  const updateData = (newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }))
  }

  const nextStep = () => setStep(prev => prev + 1)
  const prevStep = () => setStep(prev => prev - 1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-green-800">Join EquiTee</h1>
            <span className="text-sm text-gray-500">Step {step} of 4</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <RegistrationTypeStep
            onNext={(type) => {
              updateData({ registrationType: type })
              nextStep()
            }}
          />
        )}

        {step === 2 && (
          <UserTypeStep
            registrationType={data.registrationType!}
            onNext={(userType) => {
              updateData({ userType })
              nextStep()
            }}
            onBack={prevStep}
          />
        )}

        {step === 3 && (
          <PersonalInfoStep
            data={data}
            onNext={(personalData) => {
              updateData(personalData)
              nextStep()
            }}
            onBack={prevStep}
          />
        )}

        {step === 4 && (
          <GolfInfoStep
            data={data}
            onComplete={(golfData) => {
              updateData(golfData)
              console.log('Final data:', { ...data, ...golfData })
              // Handle form submission
            }}
            onBack={prevStep}
          />
        )}
      </div>
    </div>
  )
}

function RegistrationTypeStep({ onNext }: { onNext: (type: 'self' | 'child') => void }) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-6">Who are you registering?</h2>
      <div className="space-y-4">
        <button
          onClick={() => onNext('self')}
          className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
        >
          I'm registering for myself
        </button>
        <button
          onClick={() => onNext('child')}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
        >
          I'm registering for my child
        </button>
      </div>
    </div>
  )
}

function UserTypeStep({
  registrationType,
  onNext,
  onBack
}: {
  registrationType: 'self' | 'child'
  onNext: (type: UserType) => void
  onBack: () => void
}) {
  const isChild = registrationType === 'child'

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">
        {isChild ? "What's your role?" : "How would you like to participate?"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {isChild ? (
          <>
            <button
              onClick={() => onNext('parent')}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
            >
              <h3 className="font-semibold text-lg mb-2">Parent/Guardian</h3>
              <p className="text-gray-600">I'm registering my child for golf programs</p>
            </button>
            <button
              onClick={() => onNext('sponsor')}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <h3 className="font-semibold text-lg mb-2">Sponsor</h3>
              <p className="text-gray-600">I want to support youth golf programs</p>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onNext('youth')}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
            >
              <h3 className="font-semibold text-lg mb-2">Youth Player</h3>
              <p className="text-gray-600">I want to learn and play golf</p>
            </button>
            <button
              onClick={() => onNext('mentor')}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <h3 className="font-semibold text-lg mb-2">Mentor</h3>
              <p className="text-gray-600">I want to teach and guide others</p>
            </button>
          </>
        )}
      </div>
      <button
        onClick={onBack}
        className="text-gray-600 hover:text-gray-800 font-medium"
      >
        ← Back
      </button>
    </div>
  )
}

function PersonalInfoStep({
  data,
  onNext,
  onBack
}: {
  data: Partial<OnboardingData>
  onNext: (data: Partial<OnboardingData>) => void
  onBack: () => void
}) {
  const [formData, setFormData] = useState({
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    age: data.age || '',
    zipCode: data.zipCode || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      age: Number(formData.age),
      zipCode: formData.zipCode
    })
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Personal Information</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {data.registrationType === 'child' ? "Child's Name" : "Full Name"}
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {data.registrationType === 'child' ? "Your Email" : "Email Address"}
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {data.registrationType === 'child' ? "Child's Age" : "Age"}
            </label>
            <input
              type="number"
              required
              min="1"
              max="100"
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
            <input
              type="text"
              required
              pattern="[0-9]{5}"
              value={formData.zipCode}
              onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Back
          </button>
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  )
}

function GolfInfoStep({
  data,
  onComplete,
  onBack
}: {
  data: Partial<OnboardingData>
  onComplete: (data: Partial<OnboardingData>) => void
  onBack: () => void
}) {
  const [formData, setFormData] = useState({
    golfExperience: data.golfExperience || 'beginner' as GolfExperience,
    handicap: data.handicap || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete({
      golfExperience: formData.golfExperience,
      handicap: formData.handicap ? Number(formData.handicap) : undefined
    })
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Golf Experience</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {data.registrationType === 'child' ? "Child's Golf Experience" : "Your Golf Experience"}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['beginner', 'intermediate', 'advanced', 'pro'] as GolfExperience[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, golfExperience: level }))}
                className={`p-4 border-2 rounded-lg transition-all capitalize ${
                  formData.golfExperience === level
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {(formData.golfExperience === 'intermediate' || formData.golfExperience === 'advanced' || formData.golfExperience === 'pro') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Handicap (optional)
            </label>
            <input
              type="number"
              min="0"
              max="54"
              value={formData.handicap}
              onChange={(e) => setFormData(prev => ({ ...prev, handicap: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your handicap"
            />
          </div>
        )}

        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Back
          </button>
          <button
            type="submit"
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Complete Registration
          </button>
        </div>
      </form>
    </div>
  )
}