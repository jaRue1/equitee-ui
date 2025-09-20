// API utility functions for EquiTee
import { getSession } from 'next-auth/react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Debug function to test API endpoints
export async function testAPIConnection(): Promise<{ baseUrl: string; workingEndpoints: string[]; failedEndpoints: string[] }> {
  const testEndpoints = [
    '/courses',
    '/equipment',
    '/map/config',
    '/demographics/heatmap',
    '/mentors',
    '/mentors/nearby',
    '/youth-programs',
    '/youth-programs/nearby',
    '/chat/start',
    '/chat/message',
    '/ai/query',
    '/auth/login',
    '/community/golf-groups'
  ]

  const workingEndpoints: string[] = []
  const failedEndpoints: string[] = []

  for (const endpoint of testEndpoints) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`)
      if (response.ok || response.status === 401) { // 401 means endpoint exists but needs auth
        workingEndpoints.push(endpoint)
      } else {
        failedEndpoints.push(`${endpoint} (${response.status})`)
      }
    } catch (error) {
      failedEndpoints.push(`${endpoint} (network error)`)
    }
  }

  return {
    baseUrl: API_BASE_URL,
    workingEndpoints,
    failedEndpoints
  }
}

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
    userName: apiEquipment.user_id ? `User ${apiEquipment.user_id.slice(0, 8)}` : 'Anonymous', // Handle null user_id
    userId: apiEquipment.user_id || 'anonymous',
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
      if (value !== undefined && value !== null) {
        if (typeof value === 'string' && value === '') return
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
      if (value !== undefined && value !== null) {
        if (typeof value === 'string' && value === '') return
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

// New API interfaces based on real database structure

// Accessibility Scores
interface ApiAccessibilityScore {
  id: string
  zip_code: string
  course_id: string
  accessibility_score: number
  distance_miles: number
  estimated_annual_cost: number
  transport_score: number
  computed_at: string
}

export interface AccessibilityScore {
  id: string
  zipCode: string
  courseId: string
  accessibilityScore: number
  distanceMiles: number
  estimatedAnnualCost: number
  transportScore: number
  computedAt: string
}

// Demographics
// Backend is already returning camelCase, so we need to match that
interface ApiDemographic {
  zipCode: string
  medianIncome: number
  population: number
  county: string
}

export interface Demographic {
  id: string
  zipCode: string
  medianIncome: number
  population: number
  county: string
}

// Mentors
interface ApiMentor {
  id: string
  user_id: string
  bio: string
  experience_years: number
  hourly_rate: number
  available: boolean
  specialties: string[]
  certifications: string[]
  location_radius: number
  contact_info: Record<string, any>
  created_at: string
  user?: {
    name: string
    email: string
    location_lat: number
    location_lng: number
  }
  distance_miles?: number
}

export interface Mentor {
  id: string
  userId: string
  bio: string
  experienceYears: number
  hourlyRate: number
  available: boolean
  specialties: string[]
  certifications: string[]
  locationRadius: number
  contactInfo: Record<string, any>
  userName?: string
  userEmail?: string
  userLocation?: { lat: number; lng: number }
  distanceMiles?: number
}

// Youth Programs
interface ApiYouthProgram {
  id: string
  name: string
  organization: string
  location_lat: number
  location_lng: number
  address: string
  age_min: number
  age_max: number
  cost_per_session: number
  schedule_days: string[]
  description: string
  equipment_provided: boolean
  transportation_available: boolean
  contact_info: Record<string, any>
  created_at: string
}

export interface YouthProgram {
  id: string
  name: string
  organization: string
  locationLat: number
  locationLng: number
  address?: string
  ageMin: number
  ageMax: number
  costPerSession: number
  scheduleDays?: string[]
  description: string
  equipmentProvided: boolean
  transportationAvailable: boolean
  contactInfo: Record<string, any>
}

// Chat System
interface ApiChatConversation {
  id: string
  user_id: string
  conversation_state: Record<string, any>
  current_step: string
  user_location: Record<string, any>
  mode: string
  created_at: string
  updated_at: string
}

interface ApiChatMessage {
  id: string
  conversation_id: string
  sender: string
  message: string
  message_type: string
  metadata: Record<string, any>
  created_at: string
}

export interface ChatConversation {
  id: string
  userId: string
  conversationState: Record<string, any>
  currentStep: string
  userLocation: Record<string, any>
  mode: string
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  sender: string
  message: string
  messageType: string
  metadata: Record<string, any>
  createdAt: string
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

// Transform functions for new data types
function transformAccessibilityScore(api: ApiAccessibilityScore): AccessibilityScore {
  return {
    id: api.id,
    zipCode: api.zip_code,
    courseId: api.course_id,
    accessibilityScore: api.accessibility_score,
    distanceMiles: api.distance_miles,
    estimatedAnnualCost: api.estimated_annual_cost,
    transportScore: api.transport_score,
    computedAt: api.computed_at
  }
}

function transformDemographic(api: ApiDemographic): Demographic {
  return {
    id: `demo_${api.zipCode}`, // Generate ID since backend doesn't provide it
    zipCode: api.zipCode,
    medianIncome: api.medianIncome,
    population: api.population,
    county: api.county
  }
}

function transformMentor(api: ApiMentor): Mentor {
  return {
    id: api.id,
    userId: api.user_id,
    bio: api.bio,
    experienceYears: api.experience_years,
    hourlyRate: api.hourly_rate,
    available: api.available,
    specialties: api.specialties,
    certifications: api.certifications,
    locationRadius: api.location_radius,
    contactInfo: api.contact_info,
    userName: api.user?.name,
    userEmail: api.user?.email,
    userLocation: api.user ? { lat: api.user.location_lat, lng: api.user.location_lng } : undefined,
    distanceMiles: api.distance_miles
  }
}

function transformYouthProgram(api: ApiYouthProgram): YouthProgram {
  return {
    id: api.id,
    name: api.name,
    organization: api.organization,
    locationLat: api.location_lat || 0,
    locationLng: api.location_lng || 0,
    address: api.address,
    ageMin: api.age_min || 5,
    ageMax: api.age_max || 18,
    costPerSession: api.cost_per_session || 0,
    scheduleDays: api.schedule_days || [],
    description: api.description || '',
    equipmentProvided: api.equipment_provided || false,
    transportationAvailable: api.transportation_available || false,
    contactInfo: api.contact_info || {}
  }
}

function transformChatConversation(api: ApiChatConversation): ChatConversation {
  return {
    id: api.id,
    userId: api.user_id,
    conversationState: api.conversation_state,
    currentStep: api.current_step,
    userLocation: api.user_location,
    mode: api.mode,
    createdAt: api.created_at,
    updatedAt: api.updated_at
  }
}

function transformChatMessage(api: ApiChatMessage): ChatMessage {
  return {
    id: api.id,
    conversationId: api.conversation_id,
    sender: api.sender,
    message: api.message,
    messageType: api.message_type,
    metadata: api.metadata,
    createdAt: api.created_at
  }
}

// NEW API FUNCTIONS

// Accessibility Scores - using correct backend endpoint
export async function fetchAccessibilityScore(lat: number, lng: number): Promise<number> {
  try {
    console.log('Fetching accessibility score for location:', lat, lng)
    const response = await fetch(`${API_BASE_URL}/demographics/accessibility-score/${lat}/${lng}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch accessibility score: ${response.status}`)
    }
    const result = await response.json()
    console.log('Accessibility score calculated:', result.score)
    return result.score || 0
  } catch (error) {
    console.error('Error fetching accessibility score:', error)
    return 0
  }
}

// Fetch demographics for specific zip code
export async function fetchDemographicsByZipCode(zipCode: string): Promise<Demographic | null> {
  try {
    console.log('Fetching demographics for zip code:', zipCode)
    const response = await fetch(`${API_BASE_URL}/demographics/zip/${zipCode}`)
    if (!response.ok) {
      if (response.status === 404) {
        console.log('No demographic data found for zip code:', zipCode)
        return null
      }
      throw new Error(`Failed to fetch demographics for zip: ${response.status}`)
    }
    const apiDemographic: ApiDemographic = await response.json()
    console.log('Demographics loaded for zip:', zipCode)
    return transformDemographic(apiDemographic)
  } catch (error) {
    console.error('Error fetching demographics by zip:', error)
    return null
  }
}

// Demographics - using correct backend endpoint
export async function fetchDemographics(): Promise<Demographic[]> {
  try {
    console.log('Fetching demographics from heatmap endpoint...')
    const response = await fetch(`${API_BASE_URL}/demographics/heatmap`)
    if (!response.ok) {
      throw new Error(`Failed to fetch demographics: ${response.status}`)
    }
    const apiDemographics: ApiDemographic[] = await response.json()
    console.log('Demographics loaded successfully:', apiDemographics.length, 'zip codes')
    console.log('📊 Raw API response sample:', apiDemographics.slice(0, 3))

    const transformed = apiDemographics.map(transformDemographic)
    console.log('📊 Transformed sample:', transformed.slice(0, 3))

    return transformed
  } catch (error) {
    console.error('Error fetching demographics:', error)
    return []
  }
}

// Mentors - using correct backend endpoints
export async function fetchMentors(location?: { lat: number; lng: number; radius?: number }): Promise<Mentor[]> {
  try {
    let endpoint = `${API_BASE_URL}/mentors`

    // If location provided, use nearby endpoint with parameters
    if (location) {
      const params = new URLSearchParams()
      params.append('lat', location.lat.toString())
      params.append('lng', location.lng.toString())
      if (location.radius) params.append('radius', location.radius.toString())
      endpoint = `${API_BASE_URL}/mentors/nearby?${params}`
    }

    console.log('Fetching mentors from:', endpoint)
    const response = await fetch(endpoint)
    if (!response.ok) {
      throw new Error(`Failed to fetch mentors: ${response.status}`)
    }
    const apiMentors: ApiMentor[] = await response.json()
    console.log('Mentors loaded successfully:', apiMentors.length, 'mentors')
    return apiMentors.map(transformMentor)
  } catch (error) {
    console.error('Error fetching mentors:', error)
    return []
  }
}

// Youth Programs - using correct backend endpoints
export async function fetchYouthPrograms(location?: { lat: number; lng: number; radius?: number }): Promise<YouthProgram[]> {
  try {
    let endpoint = `${API_BASE_URL}/youth-programs`

    // If location provided, use nearby endpoint with parameters
    if (location) {
      const params = new URLSearchParams()
      params.append('lat', location.lat.toString())
      params.append('lng', location.lng.toString())
      if (location.radius) params.append('radius', location.radius.toString())
      endpoint = `${API_BASE_URL}/youth-programs/nearby?${params}`
    }

    console.log('Fetching youth programs from:', endpoint)
    const response = await fetch(endpoint)
    if (!response.ok) {
      throw new Error(`Failed to fetch youth programs: ${response.status}`)
    }
    const apiPrograms: ApiYouthProgram[] = await response.json()
    console.log('Youth programs loaded successfully:', apiPrograms.length, 'programs')
    return apiPrograms.map(transformYouthProgram)
  } catch (error) {
    console.error('Error fetching youth programs:', error)
    return []
  }
}

// Chat System
export async function fetchChatConversations(): Promise<ChatConversation[]> {
  try {
    const headers = await getHeaders()
    const response = await fetch(`${API_BASE_URL}/conversations`, { headers })
    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.status}`)
    }
    const apiConversations: ApiChatConversation[] = await response.json()
    return apiConversations.map(transformChatConversation)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    throw error
  }
}

export async function fetchChatMessages(conversationId: string): Promise<ChatMessage[]> {
  try {
    const headers = await getHeaders()
    console.log('Fetching chat history for conversation:', conversationId)
    const response = await fetch(`${API_BASE_URL}/chat/conversation/${conversationId}/history`, { headers })
    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.status}`)
    }
    const apiMessages: ApiChatMessage[] = await response.json()
    console.log('Chat history loaded successfully:', apiMessages.length, 'messages')
    return apiMessages.map(transformChatMessage)
  } catch (error) {
    console.error('Error fetching messages:', error)
    throw error
  }
}

// AI Query function for open-ended questions
export async function sendAIQuery(
  query: string,
  userLocation?: { lat: number; lng: number }
): Promise<{ success: boolean; message: string; followUpQuestions?: string[]; courseCitations?: Course[] }> {
  try {
    const headers = await getHeaders()

    const response = await fetch(`${API_BASE_URL}/ai/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        userLocation: userLocation || { lat: 25.7617, lng: -80.1918 }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('AI query error response:', errorText)
      throw new Error(`Failed to query AI: ${response.status}`)
    }

    const result = await response.json()
    console.log('AI query successful:', result)

    // Post-process response to find course citations
    const courseCitations = await findCourseCitations(result.message)

    return {
      ...result,
      courseCitations
    }
  } catch (error) {
    console.error('Error in AI query:', error)
    throw error
  }
}

// Helper function to find course citations in AI response
async function findCourseCitations(aiMessage: string): Promise<Course[]> {
  try {
    // Get all courses from database
    const allCourses = await fetchCourses()

    // Look for course names mentioned in the AI response
    const citedCourses: Course[] = []

    // Common course name patterns to search for
    const courseNamePatterns = [
      /([A-Z][a-z]+ ?)+Golf ?(Course|Club|Links)/gi,
      /([A-Z][a-z]+ ?)+Country Club/gi,
      /(Red Reef|Osprey Point|Boca Raton)/gi
    ]

    for (const pattern of courseNamePatterns) {
      const matches = aiMessage.match(pattern)
      if (matches) {
        for (const match of matches) {
          // Find matching courses in our database (fuzzy matching)
          const matchingCourse = allCourses.find(course =>
            course.name.toLowerCase().includes(match.toLowerCase().replace(/golf course|golf club|country club/gi, '').trim()) ||
            match.toLowerCase().includes(course.name.toLowerCase().replace(/golf course|golf club|country club/gi, '').trim())
          )

          if (matchingCourse && !citedCourses.find(c => c.id === matchingCourse.id)) {
            citedCourses.push(matchingCourse)
          }
        }
      }
    }

    console.log(`Found ${citedCourses.length} course citations in AI response:`, citedCourses.map(c => c.name))
    return citedCourses

  } catch (error) {
    console.error('Error finding course citations:', error)
    return []
  }
}

export async function sendChatMessage(
  conversationId: string | null,
  message: string,
  userLocation?: { lat: number; lng: number }
): Promise<{ conversation: ChatConversation; message: ChatMessage; aiResponse?: ChatMessage }> {
  try {
    const headers = await getHeaders()

    // If no conversation ID, start a new conversation
    if (!conversationId) {
      console.log('Starting new chat conversation...')
      const startResponse = await fetch(`${API_BASE_URL}/chat/start`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userLocation: userLocation || { lat: 25.7617, lng: -80.1918 } // Default to Miami if no location
        })
      })

      if (!startResponse.ok) {
        const errorText = await startResponse.text()
        console.error('Chat start error response:', errorText)
        throw new Error(`Failed to start conversation: ${startResponse.status}`)
      }

      const result = await startResponse.json()
      console.log('New chat conversation started successfully:', result)

      // Transform the response to match expected structure
      const conversation: ChatConversation = {
        id: result.conversationId,
        userId: 'current-user', // We'll need to get this from session
        conversationState: {},
        currentStep: result.mode || 'chat',
        userLocation: userLocation || {},
        mode: result.mode || 'chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const welcomeMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        conversationId: result.conversationId,
        sender: 'assistant',
        message: result.message,
        messageType: 'text',
        metadata: result.options ? { options: result.options } : {},
        createdAt: new Date().toISOString()
      }

      // For new conversations, we need to send the first user message
      if (message.trim()) {
        // Send the user's message to the new conversation
        const messageResponse = await fetch(`${API_BASE_URL}/chat/message`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            conversationId: result.conversationId,
            message: message
          })
        })

        if (messageResponse.ok) {
          const messageResult = await messageResponse.json()
          const aiResponse: ChatMessage = {
            id: `msg_${Date.now() + 1}`,
            conversationId: result.conversationId,
            sender: 'assistant',
            message: messageResult.message,
            messageType: 'text',
            metadata: messageResult.recommendations ? { recommendations: messageResult.recommendations } : {},
            createdAt: new Date().toISOString()
          }

          return {
            conversation,
            message: welcomeMessage,
            aiResponse
          }
        }
      }

      return {
        conversation,
        message: welcomeMessage,
        aiResponse: undefined
      }
    } else {
      // Send message to existing conversation
      console.log('Sending message to existing conversation:', conversationId)
      const messageResponse = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          conversationId: conversationId,
          message
        })
      })

      if (!messageResponse.ok) {
        const errorText = await messageResponse.text()
        console.error('Chat message error response:', errorText)
        throw new Error(`Failed to send message: ${messageResponse.status}`)
      }

      const result = await messageResponse.json()
      console.log('Message sent successfully:', result)

      // Transform the response to match expected structure
      const conversation: ChatConversation = {
        id: conversationId,
        userId: 'current-user',
        conversationState: {},
        currentStep: 'chat',
        userLocation: userLocation || {},
        mode: 'chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        conversationId: conversationId,
        sender: 'user',
        message: message,
        messageType: 'text',
        metadata: {},
        createdAt: new Date().toISOString()
      }

      const aiResponse: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        conversationId: conversationId,
        sender: 'assistant',
        message: result.message,
        messageType: 'text',
        metadata: result.options ? { options: result.options } : {},
        createdAt: new Date().toISOString()
      }

      return {
        conversation,
        message: userMessage,
        aiResponse
      }
    }
  } catch (error) {
    console.error('Error in chat system:', error)
    throw error
  }
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