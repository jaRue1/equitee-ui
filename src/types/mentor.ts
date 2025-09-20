export interface Mentor {
  id: string
  user_id: string
  bio: string
  experience_years: number
  hourly_rate: number
  available: boolean
  specialties: string[]
  certifications: string[]
  location_radius: number
  contact_info: {
    phone?: string
    title?: string
    website?: string
    facility?: string
  }
  created_at: string
  user: {
    name: string
    email: string
    location_lat: number
    location_lng: number
  }
  distance_miles?: number
}

export interface YouthProgram {
  id: string
  name: string
  organization: string
  location_lat: number
  location_lng: number
  cost_per_session: number
  description: string
  equipment_provided: boolean
  transportation_available: boolean
  contact_info: {
    phone?: string
    website?: string
  }
  created_at: string
  distance_miles?: number
  age_range?: string
  schedule?: string
  is_free?: boolean
}