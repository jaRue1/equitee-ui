# EquiTee Frontend Development Specification

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

## Phase 3: AI Journey Planner (Hours 3.5-5.5)

### Conversational Flow
**File:** `hooks/useChatState.ts`
```typescript
interface ChatResponse {
  botMessage: string;
  recommendations?: CourseRecommendation[];
  mapHighlights?: MapHighlight[];
  options?: string[];
  mode: 'onboarding' | 'ai_consultant';
}

// Phase 1: Onboarding Conversation flow (Branching Logic):
// 1. "Have you played golf before?" [Yes/No buttons]
// 2a. Yes: "What's your average score?" [Text input]
// 2b. No: "What's your budget for getting started?" [Select options]
// 3. Generate recommendations based on experience + location + budget
// 4. Show personalized journey plan with milestones
// 5. "Would you like to ask me questions about golf courses?" [Transition to AI mode]

// Phase 2: AI Golf Consultant (RAG System):
// - Free-text questions about courses, golf tips, local programs
// - Semantic search through vectorized course data and golf knowledge
// - Location-aware responses using user's GPS data
// - Fallback to basic recommendations if AI query fails
```

### Map Integration for Recommendations
**File:** `components/map/InteractiveMap.tsx`
```typescript
// Add recommendation highlighting:
// - Pulsing animation for recommended locations
// - Numbered markers (1, 2, 3) for progression order
// - Auto-pan to show all recommendations
// - Route visualization using Mapbox Directions API

const highlightRecommendations = (recommendations: CourseRecommendation[]) => {
  // Implementation for highlighting recommended courses
  // Add pulsing markers with progression numbers
  // Calculate bounds to show all recommendations
  // Draw routes from user location
};
```

### Route Visualization
**File:** `utils/mapHelpers.ts`
```typescript
interface RouteOptions {
  userLocation: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  transportMode: 'driving' | 'walking' | 'transit';
}

export const drawRoute = async (map: MapboxMap, options: RouteOptions) => {
  // Use Mapbox Directions API
  // Add route line to map
  // Show estimated travel time
  // Color-code by difficulty/cost
};
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

### AI Chat Integration (Stretch Goal)
**File:** `components/chat/AIConsultant.tsx`
```typescript
interface AIQueryRequest {
  question: string;
  userLocation: { lat: number; lng: number };
  conversationHistory: Message[];
}

interface AIQueryResponse {
  answer: string;
  sources: Course[];
  mapHighlights?: { lat: number; lng: number; courseId: string }[];
  followUpQuestions?: string[];
}

// Implementation requirements:
// - Text input for natural language questions
// - Loading states with "AI is thinking..." indicator
// - Display of source courses used in response
// - Map highlighting of mentioned courses
// - Suggested follow-up questions
// - Graceful fallback to basic search if AI fails

// Example interactions:
// User: "What's the best course for a beginner near Homestead?"
// AI: "Based on your location, I recommend Redland Golf & Country Club. It's a beginner-friendly course (2.5/5 difficulty) just 8 miles from Homestead with green fees starting at $45. They offer equipment rental and have an active youth program."

// User: "I have $100 budget, where can I play this weekend?"
// AI: "With a $100 budget, you have several great options near you: [lists 3 courses with pricing and weekend availability]"
```

**File:** `utils/aiClient.ts`
```typescript
export const aiClient = {
  async queryGolfConsultant(request: AIQueryRequest): Promise<AIQueryResponse> {
    // Send user question + location to RAG endpoint
    // Handle response and map highlighting
    // Extract course references for map integration
    return fetch('/api/ai/query', {
      method: 'POST',
      body: JSON.stringify(request)
    }).then(res => res.json());
  }
};
```

## API Integration Patterns

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
  ai: {
    query: (data: AIQueryRequest) => fetch(`${API_BASE}/api/ai/query`, {
      method: 'POST', 
      body: JSON.stringify(data)
    })
  },
  demographics: {
    getHeatmap: () => fetch(`${API_BASE}/api/demographics/heatmap`),
    getAccessibilityScore: (lat: number, lng: number) => 
      fetch(`${API_BASE}/api/demographics/accessibility-score/${lat}/${lng}`)
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
```

## Environment Variables
```env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.xxx
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

## Testing Strategy
- Unit tests for utility functions
- Integration tests for API calls
- E2E tests for critical user flows:
  - Location permission → map load → course selection
  - Chat flow → recommendations → map highlighting
  - Filter application → marker updates

## Performance Considerations
- Lazy load map components
- Debounce filter changes
- Cache API responses in localStorage
- Optimize Mapbox layer rendering
- Compress and optimize images