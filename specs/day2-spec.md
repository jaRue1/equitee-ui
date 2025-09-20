# EquiTee Frontend Development Specification - Final

## Project Structure
```
src/
├── components/
│   ├── map/
│   │   ├── InteractiveMap.tsx
│   │   ├── HeatMapLayer.tsx
│   │   ├── CourseMarker.tsx
│   │   └── MapLegend.tsx
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── AIGolfAgent.tsx
│   │   ├── MessageBubble.tsx
│   │   └── QuickReply.tsx
│   ├── onboarding/
│   │   ├── LocationPermission.tsx
│   │   └── OnboardingWizard.tsx
│   └── ui/
│       ├── FilterPanel.tsx
│       └── CourseDrawer.tsx
├── hooks/
│   ├── useGeolocation.ts
│   ├── useMapbox.ts
│   └── useChatState.ts
├── types/
│   ├── api.ts
│   ├── map.ts
│   └── chat.ts
└── utils/
    ├── mapHelpers.ts
    └── apiClient.ts
```

## Phase 1: Core Infrastructure (Hours 0-1.5)

### GPS Location Implementation
**File:** `hooks/useGeolocation.ts`
```typescript
interface LocationState {
  position: { lat: number; lng: number } | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = () => {
  // Implementation details:
  // - Request location permission on component mount
  // - Store lat/lng in localStorage for persistence
  // - Fallback to zip code input if permission denied
  // - Return current position, error state, loading state
}
```

**File:** `components/onboarding/LocationPermission.tsx`
- Replace zip code input field
- Show location request button with explanatory text
- Display fallback zip code input if GPS fails
- Store location in global state (Context or Zustand)

### Mapbox Heat Map Foundation
**File:** `components/map/HeatMapLayer.tsx`
```typescript
interface HeatMapLayerProps {
  demographicData: DemographicData[];
  visible: boolean;
  onToggle: () => void;
}

// Implementation requirements:
// - Accept demographic data as props
// - Create Mapbox choropleth source and layer
// - Income-based color scaling (red=low, green=high)
// - Smooth toggle animations
// - Hover popups with zip code + income data
```

**File:** `components/map/MapLegend.tsx`
- Color scale legend for income levels
- Toggle button for heat map visibility
- Course pricing legend (green/yellow/red markers)

### Chat Interface Component
**File:** `components/chat/ChatInterface.tsx`
```typescript
interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  options?: string[];
  recommendations?: CourseRecommendation[];
}

interface ChatState {
  messages: Message[];
  isOpen: boolean;
  conversationId: string;
  loading: boolean;
  mode: 'onboarding' | 'ai_consultant';
}

// Implementation requirements:
// - Fixed position bottom-right
// - Golf flag icon trigger
// - Message history with smooth animations
// - Quick reply buttons for yes/no responses (onboarding mode)
// - Free-text input for AI questions (consultant mode)
// - Mode toggle between structured onboarding and AI chat
// - Typing indicators
```

## Phase 2: Heat Map Implementation (Hours 1.5-3.5)

### Mapbox Choropleth Implementation
**File:** `components/map/InteractiveMap.tsx`
```typescript
// Add to existing map component:
// - GeoJSON source with South Florida zip code boundaries
// - Fill layer with expression-based styling
// - Income quartile color mapping
// - Hover state management
// - Integration with course markers

const incomeColorExpression = [
  'interpolate',
  ['linear'],
  ['get', 'medianIncome'],
  30000, '#ff0000',  // Low income - red
  60000, '#ffff00',  // Medium income - yellow  
  100000, '#00ff00'  // High income - green
];
```

### Course Pricing Overlays
**File:** `components/map/CourseMarker.tsx`
```typescript
interface CourseMarkerProps {
  course: Course;
  accessibilityScore: number;
  onClick: (course: Course) => void;
}

// Implementation requirements:
// - Color-coded pricing badges
// - Accessibility score integration
// - Popup with course details
// - Highlighting animation for AI recommendations
```

### Filter System
**File:** `components/ui/FilterPanel.tsx`
```typescript
interface FilterState {
  priceRange: [number, number];
  youthPrograms: boolean;
  difficultyRange: [number, number];
  equipmentRental: boolean;
}

// Implementation requirements:
// - Price range slider
// - Checkbox filters for amenities
// - Real-time map marker updates
// - Clear all filters button
```

## Phase 3: AI Community Golf Agent (Hours 3.5-5.5)

### AI Golf Agent Component
**File:** `components/chat/AIGolfAgent.tsx`
```typescript
import { useChat } from 'ai/react';

interface AgentMessage extends Message {
  toolInvocations?: {
    toolName: string;
    toolCallId: string;
    args: any;
    result?: any;
  }[];
  mapHighlights?: {
    courseId: string;
    lat: number;
    lng: number;
    type: 'course' | 'program' | 'mentor';
  }[];
}

interface UserProfile {
  experienceLevel?: string;
  budget?: number;
  age?: number;
  hasEquipment?: boolean;
  hasTransportation?: boolean;
}

export const AIGolfAgent: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/ai/chat',
    body: {
      userLocation,
      userProfile
    },
    onFinish: (message) => {
      // Handle map highlighting for mentioned courses/programs
      if (message.mapHighlights) {
        handleMapHighlights(message.mapHighlights);
      }
      
      // Update user profile based on conversation
      updateProfileFromConversation(message);
    }
  });

  const handleMapHighlights = (highlights: AgentMessage['mapHighlights']) => {
    // Send highlights to parent map component
    highlights?.forEach(highlight => {
      // Trigger map to highlight specific locations
      // Different styling for courses vs programs vs mentors
      window.dispatchEvent(new CustomEvent('highlightMapLocation', {
        detail: highlight
      }));
    });
  };

  const updateProfileFromConversation = (message: any) => {
    // Extract profile information from AI agent interactions
    // Update local state to improve future recommendations
  };

  return (
    <div className="ai-golf-agent">
      <div className="messages-container">
        {messages.map((message) => (
          <AgentMessageBubble 
            key={message.id} 
            message={message as AgentMessage}
            onJoinGroup={handleJoinGroup}
            onContactMentor={handleContactMentor}
          />
        ))}
      </div>
      
      {isLoading && (
        <div className="thinking-indicator">
          <span>AI is analyzing your request...</span>
          <div className="tool-calls">
            {/* Show which tools are being called in real-time */}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="input-form">
        <input
          value={input}
          placeholder="Ask me anything about golf in South Florida..."
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
      
      <div className="suggested-questions">
        {getSuggestedQuestions(userProfile).map(question => (
          <button 
            key={question}
            onClick={() => handleInputChange({ target: { value: question } } as any)}
            className="suggestion-chip"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};
```

### Agent Message Display Components
**File:** `components/chat/AgentMessageBubble.tsx`
```typescript
const AgentMessageBubble: React.FC<{
  message: AgentMessage;
  onJoinGroup: (groupId: string) => void;
  onContactMentor: (mentorId: string) => void;
}> = ({ message, onJoinGroup, onContactMentor }) => {
  return (
    <div className={`message ${message.role}`}>
      <div className="content">{message.content}</div>
      
      {/* Show tool usage */}
      {message.toolInvocations && (
        <div className="tool-results">
          {message.toolInvocations.map((tool, index) => (
            <ToolResultDisplay 
              key={`${tool.toolCallId}-${index}`}
              toolName={tool.toolName}
              result={tool.result}
              onJoinGroup={onJoinGroup}
              onContactMentor={onContactMentor}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ToolResultDisplay: React.FC<{
  toolName: string;
  result: any;
  onJoinGroup: (groupId: string) => void;
  onContactMentor: (mentorId: string) => void;
}> = ({ toolName, result, onJoinGroup, onContactMentor }) => {
  switch (toolName) {
    case 'findPlayingPartners':
      return (
        <div className="playing-partners-results">
          <h4>Available Golf Groups:</h4>
          {result.map((group: any) => (
            <div key={group.id} className="group-card">
              <span>{group.course.name} - {group.date} at {group.time}</span>
              <span>{group.members}/{group.maxMembers} players</span>
              <button onClick={() => onJoinGroup(group.id)}>
                Join Group
              </button>
            </div>
          ))}
        </div>
      );
      
    case 'findMentorsInArea':
      return (
        <div className="mentors-results">
          <h4>Available Mentors:</h4>
          {result.map((mentor: any) => (
            <div key={mentor.id} className="mentor-card">
              <span>{mentor.name} - ${mentor.hourlyRate}/hour</span>
              <span>{mentor.experience} years experience</span>
              <button onClick={() => onContactMentor(mentor.id)}>
                Contact Mentor
              </button>
            </div>
          ))}
        </div>
      );
      
    case 'searchCourses':
      return (
        <div className="courses-results">
          <h4>Recommended Courses:</h4>
          {result.map((course: any) => (
            <div key={course.id} className="course-card">
              <span>{course.name}</span>
              <span>${course.greenFeeMin}-${course.greenFeeMax}</span>
              <span>Difficulty: {course.difficultyRating}/5</span>
            </div>
          ))}
        </div>
      );
      
    default:
      return <div className="tool-result">{JSON.stringify(result, null, 2)}</div>;
  }
};

const getSuggestedQuestions = (profile: UserProfile): string[] => {
  const baseQuestions = [
    "Find me beginner golf groups this weekend",
    "What equipment do I need to get started?",
    "Connect me with a golf mentor in my area"
  ];
  
  if (!profile.experienceLevel) {
    return [
      "I'm new to golf, where should I start?",
      "Find youth golf programs near me",
      ...baseQuestions
    ];
  }
  
  return baseQuestions;
};
```

### Map Integration for Agent Highlights
**File:** `components/map/InteractiveMap.tsx` (Map highlighting integration)
```typescript
// Add to existing map component:

useEffect(() => {
  const handleAgentHighlight = (event: CustomEvent) => {
    const { courseId, lat, lng, type } = event.detail;
    
    // Create different marker styles for different types
    const markerColor = {
      course: '#10B981', // green
      program: '#3B82F6', // blue  
      mentor: '#8B5CF6'   // purple
    }[type];
    
    // Add pulsing highlight marker
    const highlightMarker = new mapboxgl.Marker({
      color: markerColor,
      scale: 1.5
    })
    .setLngLat([lng, lat])
    .addTo(mapRef.current);
    
    // Add popup with context
    const popup = new mapboxgl.Popup()
      .setHTML(`<div>Recommended by AI Golf Coach</div>`)
      .addTo(mapRef.current);
    
    highlightMarker.setPopup(popup);
    
    // Auto-focus on highlighted area
    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: 12,
      duration: 1000
    });
    
    // Remove highlight after 10 seconds
    setTimeout(() => {
      highlightMarker.remove();
      popup.remove();
    }, 10000);
  };
  
  window.addEventListener('highlightMapLocation', handleAgentHighlight);
  
  return () => {
    window.removeEventListener('highlightMapLocation', handleAgentHighlight);
  };
}, []);
```

## Phase 4: Polish & Integration (Hours 5.5-7)

### Mobile Responsiveness
**Responsive Design Checklist:**
- Map takes full viewport on mobile
- Chat interface scales appropriately
- Filter panel becomes slide-out drawer
- Touch-friendly marker interactions
- Readable text at all screen sizes

### UI Polish
**Animation Requirements:**
- Smooth map transitions
- Loading states for all async operations
- Hover effects on interactive elements
- Message bubble animations in chat
- Course marker selection feedback

### API Route for Vercel AI SDK
**File:** `pages/api/ai/chat.ts` (or `app/api/ai/chat/route.ts` for App Router)
```typescript
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { messages, userLocation, userProfile } = await req.json();

  const result = await streamText({
    model: openai('gpt-4'),
    system: `You are a Golf Community Coach for South Florida. Help users create learning paths and connect with the golf community. Always use tools to get real data.`,
    messages,
    tools: {
      searchCourses: tool({
        description: 'Find golf courses based on criteria',
        parameters: z.object({
          location: z.object({ lat: z.number(), lng: z.number() }),
          budget: z.number().optional(),
          difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
          radius: z.number().default(25)
        }),
        execute: async (params) => {
          // Call your backend API
          const response = await fetch(`${process.env.API_URL}/api/courses/search`, {
            method: 'POST',
            body: JSON.stringify(params)
          });
          return response.json();
        }
      }),
      
      findPlayingPartners: tool({
        description: 'Find other golfers to play with',
        parameters: z.object({
          courseId: z.string(),
          date: z.string(),
          skillLevel: z.string()
        }),
        execute: async (params) => {
          const response = await fetch(`${process.env.API_URL}/api/community/playing-partners`, {
            method: 'POST',
            body: JSON.stringify(params)
          });
          return response.json();
        }
      }),
      
      findYouthPrograms: tool({
        description: 'Find youth golf programs',
        parameters: z.object({
          location: z.object({ lat: z.number(), lng: z.number() }),
          ageRange: z.array(z.number()),
          budget: z.number()
        }),
        execute: async (params) => {
          const response = await fetch(`${process.env.API_URL}/api/community/youth-programs`, {
            method: 'POST',
            body: JSON.stringify(params)
          });
          return response.json();
        }
      }),
      
      getAccessibilityScore: tool({
        description: 'Get golf accessibility score for location',
        parameters: z.object({
          lat: z.number(),
          lng: z.number()
        }),
        execute: async (params) => {
          const response = await fetch(`${process.env.API_URL}/api/demographics/accessibility-score/${params.lat}/${params.lng}`);
          return response.json();
        }
      }),
      
      findMentorsInArea: tool({
        description: 'Find golf mentors nearby',
        parameters: z.object({
          location: z.object({ lat: z.number(), lng: z.number() }),
          budget: z.number(),
          experienceLevel: z.string()
        }),
        execute: async (params) => {
          const response = await fetch(`${process.env.API_URL}/api/community/mentors`, {
            method: 'POST',
            body: JSON.stringify(params)
          });
          return response.json();
        }
      })
    },
    maxToolRoundtrips: 3,
  });

  return result.toAIStreamResponse();
}
```

## API Integration

### API Client Setup
**File:** `utils/apiClient.ts`
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = {
  chat: {
    start: () => fetch(`${API_BASE}/api/chat/start`),
    respond: (data: ChatRequest) => fetch(`${API_BASE}/api/chat/respond`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  demographics: {
    getHeatmap: () => fetch(`${API_BASE}/api/demographics/heatmap`),
    getAccessibilityScore: (lat: number, lng: number) => 
      fetch(`${API_BASE}/api/demographics/accessibility-score/${lat}/${lng}`)
  },
  community: {
    joinGroup: (groupId: string) => fetch(`${API_BASE}/api/community/groups/${groupId}/join`, {
      method: 'POST'
    }),
    contactMentor: (mentorId: string, message: string) => fetch(`${API_BASE}/api/community/mentors/${mentorId}/contact`, {
      method: 'POST',
      body: JSON.stringify({ message })
    })
  }
};
```

## TypeScript Interfaces

**File:** `types/api.ts`
```typescript
export interface Course {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  greenFeeMin: number;
  greenFeeMax: number;
  youthPrograms: boolean;
  difficultyRating: number;
  equipmentRental: boolean;
}

export interface DemographicData {
  zipCode: string;
  medianIncome: number;
  bounds: GeoJSON.Polygon;
  accessibilityScore: number;
}

export interface CourseRecommendation {
  course: Course;
  reason: string;
  priority: number;
  estimatedCost: number;
  travelTime: string;
}

export interface GolfGroup {
  id: string;
  courseId: string;
  courseName: string;
  date: string;
  time: string;
  members: number;
  maxMembers: number;
  skillLevel: string;
  description: string;
}

export interface Mentor {
  id: string;
  name: string;
  experience: string;
  hourlyRate: number;
  specialties: string[];
  bio: string;
}
```

## Environment Variables
```env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.xxx
NEXT_PUBLIC_API_URL=http://localhost:3001
OPENAI_API_KEY=sk-xxx
API_URL=http://localhost:3001
```

## Performance Considerations
- Lazy load map components
- Debounce filter changes
- Cache API responses in localStorage
- Optimize Mapbox layer rendering
- Compress and optimize images
- Use Vercel AI SDK streaming for better UX