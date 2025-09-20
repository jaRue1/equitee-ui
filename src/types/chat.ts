// Import types from map first
import type { CourseRecommendation, MapHighlight } from '@/types/map'

export interface Message {
  id: string
  type: 'bot' | 'user'
  content: string
  timestamp: Date
  options?: string[]
  recommendations?: CourseRecommendation[]
}

export interface ChatState {
  messages: Message[]
  isOpen: boolean
  conversationId: string
  loading: boolean
  mode: 'onboarding' | 'ai_consultant'
}

export interface ChatResponse {
  botMessage: string
  recommendations?: CourseRecommendation[]
  mapHighlights?: MapHighlight[]
  options?: string[]
  mode: 'onboarding' | 'ai_consultant'
}

// Re-export types from map for convenience
export type { CourseRecommendation, MapHighlight }