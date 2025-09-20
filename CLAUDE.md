# EquiTee Frontend - Claude Code Rules

## Development Rules for Claude Code

### ❌ NEVER DO
- **Do not run `npm run dev` or start development servers** - The user runs this locally
- **Do not run background processes** - All dev server management is handled by user
- **Do not kill existing processes** - User manages their own dev environment

### ✅ ALWAYS DO
- Run `npm run build` to test compilation
- Run `npm run lint` if available
- Run `npm run typecheck` if available
- Use file editing tools to make changes
- Test builds before marking tasks complete

### 📁 Project Structure
```
src/
├── components/
│   ├── map/
│   │   ├── InteractiveMap.tsx      # Main map with user location marker
│   │   ├── HeatMapLayer.tsx        # Income demographic overlay
│   │   └── MapLegend.tsx           # Heat map controls
│   ├── chat/
│   │   └── ChatInterface.tsx       # Golf conversation interface
│   ├── onboarding/
│   │   └── LocationPermission.tsx  # GPS location component
├── hooks/
│   └── useGeolocation.ts           # GPS location hook
├── types/
│   ├── map.ts                      # Map & recommendation types
│   └── chat.ts                     # Chat interface types
└── app/
    ├── demo/page.tsx               # Component testing page
    └── page.tsx                    # Main authenticated app
```

### 🔧 Key Components

#### Map System
- **InteractiveMap**: Main map with Mapbox, shows user location with pulsing blue marker
- **HeatMapLayer**: Toggleable demographic income visualization
- **User Location**: Clear "You are here" marker with pulsing animation

#### Location System
- **useGeolocation**: Auto GPS detection with zip code fallback
- **LocationPermission**: Clean permission UI component
- **Persistence**: Saves location in localStorage

#### Chat Interface
- **ChatInterface**: Golf conversation system with onboarding/AI modes
- **Mock Recommendations**: Generates fake course suggestions
- **Map Integration**: Chat recommendations highlight courses on map

### 🧪 Testing Pages
- `/demo` - Isolated component testing with real geolocation
- `/` - Full app integration (requires authentication)

### ⚠️ Important Notes
- All API calls currently use mock data
- Heat map uses mock South Florida demographic data
- Chat generates simulated recommendations
- User location marker auto-centers map on first location set
- Components follow existing code conventions and TypeScript patterns

### 🎯 Current Status
✅ Phase 1 Complete: GPS location, heat map foundation, chat interface
⚠️ Phase 2 Pending: Real demographic data integration
⚠️ Phase 3 Pending: AI agent with Vercel AI SDK (per updated spec)