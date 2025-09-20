'use client'

import { useState, useRef, useEffect } from 'react'
import { type Message, type ChatState, type CourseRecommendation, type Course } from '@/types/chat'
import { sendChatMessage, sendAIQuery, ChatConversation } from '@/lib/api'

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
    mode: 'onboarding'
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

    // Start onboarding conversation if opening for first time
    if (!chatState.isOpen && chatState.messages.length === 0) {
      setTimeout(() => {
        addMessage({
          id: generateMessageId(),
          type: 'bot',
          content: 'Welcome to EquiTee! I\'m here to help you find the perfect golf courses and programs. Have you played golf before?',
          timestamp: new Date(),
          options: ['Yes', 'No']
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

  const simulateTyping = (callback: () => void, delay = 1000) => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      callback()
    }, delay)
  }

  const handleOptionClick = (option: string) => {
    // Add user message
    addMessage({
      id: generateMessageId(),
      type: 'user',
      content: option,
      timestamp: new Date()
    })

    // Handle onboarding flow
    simulateTyping(() => {
      handleOnboardingResponse(option)
    })
  }

  const handleOnboardingResponse = (userResponse: string) => {
    const lastBotMessage = chatState.messages.filter(m => m.type === 'bot').pop()

    if (lastBotMessage?.content.includes('Have you played golf before?')) {
      if (userResponse === 'Yes') {
        addMessage({
          id: generateMessageId(),
          type: 'bot',
          content: 'Great! What\'s your average score or skill level?',
          timestamp: new Date(),
          options: ['Beginner (100+)', 'Intermediate (85-100)', 'Advanced (70-85)', 'Pro (<70)']
        })
      } else {
        addMessage({
          id: generateMessageId(),
          type: 'bot',
          content: 'Perfect! What\'s your budget for getting started with golf?',
          timestamp: new Date(),
          options: ['Under $50', '$50-$100', '$100-$200', '$200+']
        })
      }
    } else if (lastBotMessage?.content.includes('average score') || lastBotMessage?.content.includes('budget')) {
      // Generate mock recommendations based on user input
      const mockRecommendations: CourseRecommendation[] = [
        {
          course: {
            id: '1',
            name: 'Beginner-Friendly Golf Club',
            address: '123 Golf St, Miami, FL',
            lat: 25.7617,
            lng: -80.1918,
            greenFeeMin: 35,
            greenFeeMax: 55,
            youthPrograms: true,
            difficultyRating: 2,
            equipmentRental: true
          },
          reason: 'Perfect for beginners with equipment rental and youth programs',
          priority: 1,
          estimatedCost: 45,
          travelTime: '15 min drive'
        }
      ]

      addMessage({
        id: generateMessageId(),
        type: 'bot',
        content: `Based on your preferences, I've found some great options for you! Check out these recommended courses on the map.`,
        timestamp: new Date(),
        recommendations: mockRecommendations,
        options: ['Tell me more', 'Find other courses', 'Switch to AI chat']
      })

      // Notify parent component about recommendations
      if (onRecommendations) {
        onRecommendations(mockRecommendations)
      }
    } else if (userResponse === 'Switch to AI chat') {
      setChatState(prev => ({ ...prev, mode: 'ai_consultant' }))
      addMessage({
        id: generateMessageId(),
        type: 'bot',
        content: 'Great! I\'m now in AI consultant mode. You can ask me any questions about golf courses, tips, or local programs. What would you like to know?',
        timestamp: new Date()
      })
    }
  }

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Add user message
    addMessage({
      id: generateMessageId(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    })

    const userQuestion = inputValue
    setInputValue('')
    setChatState(prev => ({ ...prev, loading: true }))
    setChatError(null)

    try {
      if (chatState.mode === 'ai_consultant') {
        // Use AI query endpoint for open-ended questions
        const response = await sendAIQuery(userQuestion, userLocation)

        if (response.success) {
          setChatState(prev => ({ ...prev, loading: false }))
          setRetryCount(0)

          addMessage({
            id: generateMessageId(),
            type: 'bot',
            content: response.message,
            timestamp: new Date(),
            courseCitations: response.courseCitations
          })

          // If there are course citations and onCourseSelect callback, prepare for navigation
          if (response.courseCitations && response.courseCitations.length > 0) {
            console.log('AI cited courses from database:', response.courseCitations.map(c => `${c.name} (${c.id})`))
          }
        } else {
          throw new Error('AI query failed')
        }
      } else {
        // Use chat endpoints for onboarding flow
        const response = await sendChatMessage(
          currentConversation?.id || null,
          userQuestion,
          userLocation
        )

        // Validate API response structure
        if (!response || !response.conversation) {
          throw new Error('Invalid response from server')
        }

        // Update conversation state
        setCurrentConversation(response.conversation)
        setChatState(prev => ({
          ...prev,
          conversationId: response.conversation.id,
          loading: false
        }))

        // Reset retry count on success
        setRetryCount(0)

        // Add AI response with validation
        if (response.aiResponse && response.aiResponse.content) {
          addMessage({
            id: generateMessageId(),
            type: 'bot',
            content: response.aiResponse.content,
            timestamp: new Date(),
            options: response.aiResponse.metadata?.options
          })

          // Extract and validate recommendations if available
          if (response.aiResponse.metadata?.recommendations && Array.isArray(response.aiResponse.metadata.recommendations)) {
            const validRecommendations = response.aiResponse.metadata.recommendations.filter(rec =>
              rec && rec.course && rec.course.id && typeof rec.course.lat === 'number' && typeof rec.course.lng === 'number'
            )
            if (validRecommendations.length > 0 && onRecommendations) {
              onRecommendations(validRecommendations)
            }
          }
        } else {
          // Handle case where AI response is missing or invalid
          addMessage({
            id: generateMessageId(),
            type: 'bot',
            content: 'I received your message but couldn\'t generate a proper response. Please try rephrasing your question.',
            timestamp: new Date()
          })
        }
      }
    } catch (error) {
      console.error('Error sending chat message:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setChatError(errorMessage)
      setChatState(prev => ({ ...prev, loading: false }))

      // Implement retry logic for network failures
      if (retryCount < 2 && (errorMessage.includes('network') || errorMessage.includes('fetch'))) {
        setRetryCount(prev => prev + 1)
        setTimeout(() => {
          // Auto-retry after delay
          setInputValue(userQuestion)
          setChatError('Retrying...')
        }, 2000 * (retryCount + 1)) // Exponential backoff
      } else {
        // Show user-friendly error message after max retries
        addMessage({
          id: generateMessageId(),
          type: 'bot',
          content: retryCount >= 2
            ? 'I\'m having persistent connection issues. Please check your internet connection and try again later.'
            : 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
          timestamp: new Date()
        })
      }
    }
  }

  const toggleMode = () => {
    setChatState(prev => ({
      ...prev,
      mode: prev.mode === 'onboarding' ? 'ai_consultant' : 'onboarding'
    }))

    addMessage({
      id: generateMessageId(),
      type: 'bot',
      content: chatState.mode === 'onboarding'
        ? 'Switched to AI consultant mode. Ask me anything about golf!'
        : 'Switched to onboarding mode. Let me help guide you step by step.',
      timestamp: new Date()
    })
  }

  const clearConversation = () => {
    const oldConversationId = chatState.conversationId
    setChatState(prev => ({
      ...prev,
      messages: [],
      conversationId: generateConversationId(),
      mode: 'onboarding',
      loading: false
    }))
    setCurrentConversation(null)
    setChatError(null)
    setRetryCount(0)

    // Clear localStorage
    if (oldConversationId) {
      localStorage.removeItem(`equitee-chat-${oldConversationId}`)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent, option: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleOptionClick(option)
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

      // Add the course link
      parts.push({
        type: 'course',
        name: match[1],
        id: match[2]
      })

      lastIndex = match.index + match[0].length
    }

    // Add any remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex)
      })
    }

    return parts
  }

  const handleCourseClick = (courseId: string, courseName: string) => {
    console.log(`Navigating to course: ${courseName} (${courseId})`)
    if (onCourseNavigate) {
      onCourseNavigate(courseId)
    }
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Chat Toggle Button */}
      <button
        onClick={toggleChat}
        className={`w-14 h-14 bg-green-600 hover:bg-green-700 rounded-full shadow-lg flex items-center justify-center text-white text-2xl transition-all ${
          chatState.isOpen ? 'rotate-12' : 'hover:scale-110'
        }`}
      >
        🏌️
      </button>

      {/* Chat Interface */}
      {chatState.isOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col animate-in slide-in-from-bottom-2 duration-300">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-green-50 rounded-t-lg">
            <div>
              <h3 className="font-semibold text-gray-900">EquiTee Assistant</h3>
              <p className="text-xs text-gray-600 capitalize">{chatState.mode.replace('_', ' ')} mode</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearConversation}
                className="text-xs bg-white px-2 py-1 rounded text-gray-600 hover:bg-gray-50"
                title="Clear conversation"
              >
                🗑️
              </button>
              <button
                onClick={toggleMode}
                className="text-xs bg-white px-2 py-1 rounded text-gray-600 hover:bg-gray-50"
                title="Toggle chat mode"
              >
                ⚙️
              </button>
              <button
                onClick={toggleChat}
                className="text-gray-400 hover:text-gray-600"
                title="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Error Display */}
          {chatError && (
            <div className="px-4 py-2 bg-red-50 border-b border-red-200">
              <div className="flex items-center justify-between">
                <p className="text-xs text-red-600">
                  {chatError}
                </p>
                <button
                  onClick={() => setChatError(null)}
                  className="text-red-400 hover:text-red-600 text-xs"
                  title="Dismiss error"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatState.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in-0 slide-in-from-bottom-1 duration-300`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-sm">
                    {parseMessageContent(message.content).map((part, partIndex) => {
                      if (part.type === 'text') {
                        // Split by newlines to handle line breaks
                        return part.content.split('\n').map((line, lineIndex, array) => (
                          <span key={`${partIndex}-${lineIndex}`}>
                            {line}
                            {lineIndex < array.length - 1 && <br />}
                          </span>
                        ))
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
                  {message.options && (
                    <div className="mt-2 space-y-1">
                      {message.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleOptionClick(option)}
                          onKeyDown={(e) => handleKeyDown(e, option)}
                          className="block w-full text-left text-xs bg-white text-gray-700 px-2 py-1 rounded hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors"
                          role="button"
                          tabIndex={0}
                          aria-label={`Select option: ${option}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
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

          {/* Input */}
          {chatState.mode === 'ai_consultant' && (
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
                  disabled={!inputValue.trim()}
                  className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  →
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}