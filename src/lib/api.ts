// API utility functions for EquiTee
import { getSession } from 'next-auth/react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Helper function to get headers with authentication
async function getHeaders(): Promise<HeadersInit> {
  const session = await getSession()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`
  }

  return headers
}

// Course interfaces
interface ApiCourse {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  green_fee_min?: number
  green_fee_max?: number
  youth_programs: boolean
  difficulty_rating?: number
  equipment_rental: boolean
  contact_info?: Record<string, any>
  website?: string
  created_at: string
}

export interface Course {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  greenFeeMin: number
  greenFeeMax: number
  youthPrograms: boolean
  difficultyRating: number
  equipmentRental: boolean
  contactInfo?: Record<string, any>
  website?: string
}

// Equipment interfaces
interface ApiEquipment {
  id: string
  user_id: string
  title: string
  description?: string
  equipment_type: 'driver' | 'woods' | 'irons' | 'wedges' | 'putter' | 'bag'
  condition: 'new' | 'excellent' | 'good' | 'fair'
  age_range?: string
  price?: number
  images?: string[]
  status: 'available' | 'pending' | 'donated' | 'sold'
  location_lat?: number
  location_lng?: number
  created_at: string
}

export interface Equipment {
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
  userId: string
  locationLat?: number
  locationLng?: number
}

// Transform API course to UI course (snake_case -> camelCase)
function transformCourse(apiCourse: ApiCourse): Course {
  return {
    id: apiCourse.id,
    name: apiCourse.name,
    address: apiCourse.address,
    lat: apiCourse.lat,
    lng: apiCourse.lng,
    greenFeeMin: apiCourse.green_fee_min || 0,
    greenFeeMax: apiCourse.green_fee_max || 0,
    youthPrograms: apiCourse.youth_programs,
    difficultyRating: apiCourse.difficulty_rating || 0,
    equipmentRental: apiCourse.equipment_rental,
    contactInfo: apiCourse.contact_info,
    website: apiCourse.website
  }
}

// Transform API equipment to UI equipment (snake_case -> camelCase)
function transformEquipment(apiEquipment: ApiEquipment): Equipment {
  return {
    id: apiEquipment.id,
    title: apiEquipment.title,
    description: apiEquipment.description || '',
    equipmentType: apiEquipment.equipment_type,
    condition: apiEquipment.condition,
    ageRange: apiEquipment.age_range || '',
    price: apiEquipment.price || 0,
    images: apiEquipment.images || [],
    status: apiEquipment.status,
    userName: `User ${apiEquipment.user_id.slice(0, 8)}`, // Temporary - we'll need to fetch user names
    userId: apiEquipment.user_id,
    locationLat: apiEquipment.location_lat,
    locationLng: apiEquipment.location_lng,
    distance: '0.0 miles' // Temporary - we'll calculate this client-side
  }
}

// API Functions
export async function fetchCourses(): Promise<Course[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses`)
    if (!response.ok) {
      throw new Error(`Failed to fetch courses: ${response.status}`)
    }
    const apiCourses: ApiCourse[] = await response.json()
    return apiCourses.map(transformCourse)
  } catch (error) {
    console.error('Error fetching courses:', error)
    throw error
  }
}

export async function fetchCourse(id: string): Promise<Course> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch course: ${response.status}`)
    }
    const apiCourse: ApiCourse = await response.json()
    return transformCourse(apiCourse)
  } catch (error) {
    console.error('Error fetching course:', error)
    throw error
  }
}

export async function fetchEquipment(): Promise<Equipment[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/equipment`)
    if (!response.ok) {
      throw new Error(`Failed to fetch equipment: ${response.status}`)
    }
    const apiEquipment: ApiEquipment[] = await response.json()
    return apiEquipment.map(transformEquipment)
  } catch (error) {
    console.error('Error fetching equipment:', error)
    throw error
  }
}

export async function fetchEquipmentFiltered(filters: {
  equipment_type?: string
  condition?: string
  status?: string
  max_price?: number
  min_price?: number
}): Promise<Equipment[]> {
  try {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString())
      }
    })

    const response = await fetch(`${API_BASE_URL}/equipment?${params}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch equipment: ${response.status}`)
    }
    const apiEquipment: ApiEquipment[] = await response.json()
    return apiEquipment.map(transformEquipment)
  } catch (error) {
    console.error('Error fetching filtered equipment:', error)
    throw error
  }
}

export async function searchCourses(filters: {
  lat?: number
  lng?: number
  radius?: number
  price?: number
  youth_programs?: boolean
  equipment_rental?: boolean
  max_difficulty?: number
}): Promise<Course[]> {
  try {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString())
      }
    })

    const response = await fetch(`${API_BASE_URL}/courses?${params}`)
    if (!response.ok) {
      throw new Error(`Failed to search courses: ${response.status}`)
    }
    const apiCourses: ApiCourse[] = await response.json()
    return apiCourses.map(transformCourse)
  } catch (error) {
    console.error('Error searching courses:', error)
    throw error
  }
}

// Map configuration interface
export interface MapConfig {
  accessToken: string
  style: string
  center: {
    lat: number
    lng: number
  }
  zoom: number
  pitch: number
  bearing: number
}

export async function fetchMapConfig(): Promise<MapConfig> {
  try {
    const headers = await getHeaders()
    const response = await fetch(`${API_BASE_URL}/map/config`, {
      headers,
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch map config: ${response.status}`)
    }
    const mapConfig: MapConfig = await response.json()
    return mapConfig
  } catch (error) {
    console.error('Error fetching map config:', error)
    throw error
  }
}