'use client'

import { useState, useRef, useEffect } from 'react'
import { type Message, type ChatState, type CourseRecommendation } from '@/types/chat'
import { sendChatMessage, sendAIQuery, ChatConversation, type Course } from '@/lib/api'

interface ChatInterfaceProps {
  onRecommendations?: (recommendations: CourseRecommendation[]) => void
  onCourseSelect?: (course: Course) => void
  onCourseNavigate?: (courseId: string) => void
  userLocation?: { lat: number; lng: number }
  className?: string
}

export default function ChatInterface({ onRecommendations, onCourseNavigate, userLocation, className = '' }: ChatInterfaceProps) {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isOpen: false,
    conversationId: '',
    loading: false,
    mode: 'ai_consultant' // Always AI mode
  })
  const [chatError, setChatError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timeoutId)
  }, [chatState.messages])

  // Load saved messages from localStorage
  useEffect(() => {
    if (chatState.conversationId && chatState.messages.length === 0) {
      const savedMessages = localStorage.getItem(`equitee-chat-${chatState.conversationId}`)
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages)
          if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
            setChatState(prev => ({
              ...prev,
              messages: parsedMessages
            }))
          }
        } catch (error) {
          console.error('Failed to load saved messages:', error)
        }
      }
    }
  }, [chatState.conversationId])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (chatState.conversationId && chatState.messages.length > 0) {
      try {
        localStorage.setItem(
          `equitee-chat-${chatState.conversationId}`,
          JSON.stringify(chatState.messages)
        )
      } catch (error) {
        console.error('Failed to save messages:', error)
      }
    }
  }, [chatState.messages, chatState.conversationId])

  const toggleChat = () => {
    setChatState(prev => ({
      ...prev,
      isOpen: !prev.isOpen,
      conversationId: prev.conversationId || generateConversationId()
    }))

    // Start AI conversation if opening for first time
    if (!chatState.isOpen && chatState.messages.length === 0) {
      setTimeout(() => {
        addMessage({
          id: generateMessageId(),
          type: 'bot',
          content: 'Welcome to your AI Golf Assistant. Ask me about anything golf in Southwest Florida.',
          timestamp: new Date()
        })
      }, 500)
    }
  }

  const generateConversationId = () => {
    return 'conv_' + Math.random().toString(36).substring(2, 9)
  }

  const generateMessageId = () => {
    return 'msg_' + Math.random().toString(36).substring(2, 9)
  }

  const addMessage = (message: Message) => {
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }))
  }

  const simulateTyping = (callback: () => void) => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      callback()
    }, 800 + Math.random() * 700)
  }

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const message = inputValue.trim()
    if (!message || chatState.loading) return

    setInputValue('')
    setChatState(prev => ({ ...prev, loading: true }))
    setChatError(null)

    // Add user message immediately
    const userMessage: Message = {
      id: generateMessageId(),
      type: 'user',
      content: message,
      timestamp: new Date()
    }
    addMessage(userMessage)

    // Add a loading message from the bot immediately with variation
    const loadingMessageId = generateMessageId()
    const loadingMessages = [
      'Let me look into that for you...',
      'Searching for the best options...',
      'Finding what you need...',
      'Let me check that for you...',
      'Looking that up now...'
    ]
    const randomLoadingMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)]

    const loadingMessage: Message = {
      id: loadingMessageId,
      type: 'bot',
      content: randomLoadingMessage,
      timestamp: new Date()
    }
    addMessage(loadingMessage)
    setIsTyping(true)

    try {
      // Always use AI mode - send directly to AI
      console.log('Sending AI query:', message)
      const response = await sendAIQuery(message, userLocation)
      console.log('AI response received:', response)

      if (!response || typeof response.message !== 'string') {
        throw new Error('Invalid response from AI service')
      }

      // Remove the loading message and stop typing animation
      setIsTyping(false)
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.filter(m => m.id !== loadingMessageId)
      }))

      // Process response
      addMessage({
        id: generateMessageId(),
        type: 'bot',
        content: response.message,
        timestamp: new Date()
      })

      // If there are course recommendations, notify parent
      if (response.courseCitations && response.courseCitations.length > 0 && onRecommendations) {
        const recommendations = response.courseCitations.map(course => ({
          course,
          reason: 'Recommended based on your query',
          matchScore: 0.9,
          priority: 1,
          estimatedCost: course.greenFeeMin || 50,
          travelTime: '15 min'
        }))
        onRecommendations(recommendations)
      }

    } catch (error) {
      console.error('Error in AI query:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to get AI response'

      // Remove the loading message and stop typing animation on error
      setIsTyping(false)
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.filter(m => m.id !== loadingMessageId)
      }))

      setChatError(errorMessage)
      addMessage({
        id: generateMessageId(),
        type: 'bot',
        content: `I apologize, but I encountered an error: ${errorMessage}. Please try again.`,
        timestamp: new Date()
      })
    } finally {
      setChatState(prev => ({ ...prev, loading: false }))
      setIsTyping(false)
    }
  }

  const handleCourseClick = (courseId: string, courseName: string) => {
    console.log('Course clicked:', courseName, courseId)
    if (onCourseNavigate) {
      onCourseNavigate(courseId)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, option: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      // No option clicking in AI-only mode
    }
  }

  // Parse message content and convert course links to clickable elements
  const parseMessageContent = (content: string) => {
    // Regex to match [Course Name](course://course_id) format
    const courseRegex = /\[([^\]]+)\]\(course:\/\/([^)]+)\)/g
    const parts: Array<{ type: 'text'; content: string } | { type: 'course'; name: string; id: string }> = []
    let lastIndex = 0
    let match

    while ((match = courseRegex.exec(content)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index)
        })
      }

      // Add course link
      parts.push({
        type: 'course',
        name: match[1],
        id: match[2]
      })

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex)
      })
    }

    return parts.length > 0 ? parts : [{ type: 'text' as const, content }]
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {!chatState.isOpen ? (
        <button
          onClick={toggleChat}
          className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          title="Open chat assistant"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-2xl w-96 h-[500px] flex flex-col animate-in fade-in-0 slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">EquiTee Assistant</h3>
              <p className="text-xs text-green-100">AI-powered golf advisor</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleChat}
                className="text-white hover:text-gray-200 text-2xl"
                title="Close chat"
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                {chatError}
              </div>
            )}

            {chatState.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in-0 slide-in-from-bottom-2 duration-300`}
              >
                <div className={`max-w-[80%] ${message.type === 'user' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800'} p-3 rounded-lg`}>
                  <div className={`text-sm whitespace-pre-wrap break-words ${message.type === 'user' ? 'text-white' : 'text-gray-800'}`}>
                    {parseMessageContent(message.content).map((part, partIndex) => {
                      if (part.type === 'text') {
                        return <span key={partIndex}>{part.content}</span>
                      } else if (part.type === 'course') {
                        return (
                          <button
                            key={`${partIndex}-course`}
                            onClick={() => handleCourseClick(part.id, part.name)}
                            className="inline-flex items-center text-green-600 hover:text-green-700 underline font-medium transition-colors"
                            title={`Navigate to ${part.name}`}
                          >
                            📍 {part.name}
                          </button>
                        )
                      }
                      return null
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start animate-in fade-in-0 duration-300">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input - Always shown */}
          <form onSubmit={handleTextSubmit} className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me about golf courses..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || chatState.loading}
                className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                →
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}