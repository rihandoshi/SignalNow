# Signal Now - Smart GitHub Networking

A hackathon project that analyzes GitHub activity to find the perfect moment to connect with developers, maintainers, and teams.

## 🚀 Features Implemented

### ✅ Complete Authentication System
- Email/password signup and login
- GitHub OAuth integration
- Secure JWT token management
- Protected routes and API endpoints

### ✅ User Onboarding
- GitHub username collection
- Networking goal setting
- Watchlist initialization (people, orgs, repos)
- Smooth progress animation

### ✅ Smart Watchlist Management
- Add/remove GitHub users, organizations, and repositories
- Clean, intuitive UI with type indicators
- Real-time updates and error handling

### ✅ AI-Powered Analysis Engine
- 3-agent analysis pipeline (Researcher → Strategist → Ghostwriter)
- Readiness scoring (0-100) based on:
  - Recent activity timing (40%)
  - Tech stack overlap (30%) 
  - Development momentum (30%)
- Decision recommendations: ENGAGE / WAIT / IGNORE
- Personalized icebreaker message generation

### ✅ Interactive Dashboard
- Real-time analysis results display
- Detailed person cards with full analysis breakdown
- Status indicators and readiness scores
- Copy-to-clipboard functionality for messages
- Responsive design with smooth animations

### ✅ Comprehensive API
- `/api/watchlist` - CRUD operations for tracking targets
- `/api/analyze` - Single target analysis
- `/api/analyze-watchlist` - Batch analysis of all targets
- `/api/onboard` - User profile setup
- Full authentication and error handling

## 🛠 Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Radix UI components
- **Animations**: Framer Motion
- **Backend**: Next.js API routes (serverless)
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth (JWT + GitHub OAuth)
- **AI**: Google Gemini 2.5 Flash Lite
- **Icons**: Lucide React

## 🎯 How It Works

1. **Add Targets**: Users add GitHub usernames, organizations, or repositories to their watchlist
2. **AI Analysis**: 3-agent system analyzes activity patterns, tech overlap, and timing
3. **Smart Recommendations**: Get readiness scores, connection strategies, and personalized messages
4. **Perfect Timing**: Know exactly when someone is most receptive to networking

## 🏃‍♂️ Quick Start

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Copy `.env.local.example` to `.env.local` and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_service_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Database Setup**
   Run the SQL schema in `supabase-schema.sql` in your Supabase dashboard

4. **Start Development**
   ```bash
   npm run dev
   ```

5. **Visit** `http://localhost:3000`

## 📱 User Flow

1. **Landing** → Welcome page with feature overview
2. **Auth** → Sign up/login with email or GitHub OAuth  
3. **Onboarding** → Set networking goals and initial watchlist
4. **Dashboard** → Manage watchlist and view analysis results
5. **Analysis** → Click "Analyze All" to get AI recommendations
6. **Connect** → Use suggested messages and timing to reach out

## 🎨 Design System

- **Colors**: Gray-based palette with accent colors for status
- **Typography**: Geist Sans for UI, Geist Mono for code
- **Components**: Consistent rounded corners, subtle shadows
- **Animations**: Smooth transitions and micro-interactions
- **Responsive**: Mobile-first design with breakpoints

## 🔒 Security Features

- Row-level security (RLS) in Supabase
- JWT token validation on all API routes
- Input sanitization and validation
- Protected routes with auth checks
- Secure environment variable handling

## 📊 Analysis Pipeline

### Agent 1: Researcher
- Extracts GitHub activity signals
- Identifies tech stack and patterns
- Returns structured activity data

### Agent 2: Strategist  
- Calculates readiness score
- Finds connection bridges
- Determines optimal timing

### Agent 3: Ghostwriter
- Generates casual, human messages
- Avoids corporate language
- Creates personalized icebreakers

## 🚀 Deployment Ready

- Serverless architecture (Vercel/Netlify compatible)
- Environment-based configuration
- Production-ready error handling
- Optimized build process

## 🎯 Hackathon Highlights

- **Complete MVP** in record time
- **Real AI integration** with multi-agent system
- **Production-quality** code and architecture
- **Smooth UX** with polished animations
- **Scalable design** for future features

---

Built with ❤️ for the hackathon community. Ready to network smarter!