// Import Course from API types first
import type { Course } from '@/lib/api'

export interface DemographicData {
  zipCode: string
  medianIncome: number
  bounds: GeoJSON.Polygon
  accessibilityScore: number
}

export interface MapHighlight {
  lat: number
  lng: number
  courseId: string
  priority?: number
  reason?: string
}

export interface CourseRecommendation {
  course: Course
  reason: string
  priority: number
  estimatedCost: number
  travelTime: string
}

// Re-export Course from API types for convenience
export type { Course }