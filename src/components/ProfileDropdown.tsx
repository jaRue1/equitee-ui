'use client'

import { useState, useRef, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
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

interface ProfileDropdownProps {
  userProfile?: UserProfile | null
  onResetProfile: () => void
}

export default function ProfileDropdown({ userProfile, onResetProfile }: ProfileDropdownProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!session) return null

  const getUserTypeDisplay = (type: string) => {
    const types = {
      youth: '🏌️‍♂️ Golfer',
      parent: '👨‍👩‍👧‍👦 Parent',
      sponsor: '💝 Sponsor',
      mentor: '👨‍🏫 Mentor'
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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
      >
        <img
          src={session.user?.image || ''}
          alt={session.user?.name || ''}
          className="w-8 h-8 rounded-full"
        />
        <div className="text-left hidden md:block">
          <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
          {userProfile && (
            <p className="text-xs text-gray-600">{getUserTypeDisplay(userProfile.userType)}</p>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-t-lg">
            <div className="flex items-center space-x-3">
              <img
                src={session.user?.image || ''}
                alt={session.user?.name || ''}
                className="w-12 h-12 rounded-full border-2 border-white"
              />
              <div>
                <h3 className="font-semibold">{session.user?.name}</h3>
                <p className="text-green-100 text-sm">{session.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          {userProfile && (
            <div className="p-4 border-b border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Golf Profile</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Role:</span>
                  <span className="font-medium">{getUserTypeDisplay(userProfile.userType)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience:</span>
                  <span className="font-medium">{getExperienceDisplay(userProfile.golfExperience)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="p-2">
            <button
              onClick={() => {
                router.push('/profile')
                setIsOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              View Profile
            </button>

            <button
              onClick={() => {
                onResetProfile()
                setIsOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Reset Profile
            </button>

            <hr className="my-2" />

            <button
              onClick={() => signOut()}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}