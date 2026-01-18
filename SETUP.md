# Signal-Now Backend - Setup & API Guide

## 🚀 Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env.local`:
```
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
```

### 3. Deploy Database Schema
Copy contents of `supabase-schema.sql` → Supabase SQL Editor → Run

### 4. Start Server
```bash
npm run dev
```

Server runs at `http://localhost:3000`

---

## 📡 API Endpoints

All endpoints use `sourceUser` parameter to identify the GitHub user making the request.

### Watchlist Management

#### Get Watchlist
```
GET /api/watchlist?sourceUser=username
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "source_username": "alice-dev",
      "target_type": "username",
      "target_value": "torvalds",
      "is_active": true,
      "created_at": "2024-01-15T10:35:00.000Z"
    }
  ]
}
```

#### Add to Watchlist
```
POST /api/watchlist
```

**Request Body:**
```json
{
  "sourceUser": "alice-dev",
  "target_type": "username|repo|org",
  "target_value": "torvalds|facebook/react|kubernetes"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "source_username": "alice-dev",
    "target_type": "username",
    "target_value": "torvalds",
    "is_active": true,
    "created_at": "2024-01-15T10:35:00.000Z"
  }
}
```

#### Remove from Watchlist
```
DELETE /api/watchlist/torvalds?sourceUser=alice-dev
```

**Response:**
```json
{
  "success": true,
  "message": "Removed from watchlist"
}
```

### Analysis

#### Batch Analysis
```
GET /api/analyze-watchlist?sourceUser=alice-dev
```

**Response (Ranked by Decision):**
```json
{
  "success": true,
  "count": 3,
  "results": [
    {
      "target": "torvalds",
      "type": "username",
      "decision": "ENGAGE",
      "reasoning": "Recent kernel development with technical overlap",
      "timestamp": "2024-01-15T10:45:30.000Z"
    },
    {
      "target": "facebook/react",
      "type": "repo",
      "decision": "WAIT",
      "reasoning": "Active development but optimal timing unclear",
      "timestamp": "2024-01-15T10:45:35.000Z"
    },
    {
      "target": "kubernetes",
      "type": "org",
      "decision": "IGNORE",
      "reasoning": "Limited technical overlap with your goals",
      "timestamp": "2024-01-15T10:45:40.000Z"
    }
  ]
}
```

**Decision Types (Priority Order):**
- `ENGAGE` - Strong opportunity, reach out now
- `WAIT` - Potential opportunity, monitor activity
- `IGNORE` - Weak fit, skip outreach
- `NO_CHANGE` - Cached from previous analysis (no new activity)

---

## 🧪 Testing Examples

### Test 1: Add a Target
```bash
curl -X POST http://localhost:3000/api/watchlist \
  -H "Content-Type: application/json" \
  -d '{
    "sourceUser": "myusername",
    "target_type": "username",
    "target_value": "torvalds"
  }'
```

### Test 2: View Watchlist
```bash
curl "http://localhost:3000/api/watchlist?sourceUser=myusername"
```

### Test 3: Batch Analysis
```bash
curl "http://localhost:3000/api/analyze-watchlist?sourceUser=myusername"
```

### Test 4: Remove Target
```bash
curl -X DELETE "http://localhost:3000/api/watchlist/torvalds?sourceUser=myusername"
```

---

## 🏗️ Architecture

### How It Works

```
Client Request (sourceUser: "alice")
    ↓
Route Handler (e.g., /api/watchlist)
    ↓
Query Database (filtered by source_username)
    ↓
Return Results
```

### Watchlist Operations

1. **GET /api/watchlist**
   - Retrieves all active targets for a GitHub user
   - Filters by `source_username`
   - Ordered by creation date (newest first)

2. **POST /api/watchlist**
   - Adds new target (user/repo/org) to watch
   - Stores with `source_username`
   - Can add users, repositories, or organizations

3. **DELETE /api/watchlist/:id**
   - Removes target from watchlist
   - Only removes if matches `sourceUser`
   - Soft delete (sets `is_active = false` conceptually)

### Analysis Pipeline

1. **Fetch GitHub Activity**
   - Queries GitHub API for recent events
   - Gets activity for target and source user

2. **Analyze with 3-Agent Pipeline**
   - **Researcher**: Extract activity signals
   - **Strategist**: Calculate readiness score (0-100)
   - **Ghostwriter**: Generate outreach message

3. **Cache Results**
   - Hashes activity (first 10 events)
   - Same hash within 30 minutes = return cached result
   - Different hash = re-run analysis

4. **Return Ranked Results**
   - ENGAGE (70+) → High readiness, contact now
   - WAIT (50-70) → Moderate readiness, monitor
   - IGNORE (<50) → Low fit, skip
   - NO_CHANGE → No activity change, using cache

---

## 📊 Database Schema

### Tables

**user_watchlist** - Tracks what each user is watching
```
id            UUID (Primary Key)
source_username TEXT (who is watching)
target_type   ENUM (username, repo, org)
target_value  TEXT (what they're watching)
is_active     BOOLEAN (true/false)
created_at    TIMESTAMP
```

**tracked_profiles** - Analysis cache
```
id                     UUID (Primary Key)
source_username        TEXT
target_username        TEXT
last_activity_hash     TEXT (for caching)
last_readiness_score   INT (0-100)
last_decision          ENUM (ENGAGE, WAIT, IGNORE, NO_CHANGE)
last_checked_at        TIMESTAMP
```

**analysis_history** - Historical results
```
id                UUID (Primary Key)
source_username   TEXT
target_username   TEXT
readiness_score   INT
decision          ENUM
reasoning         TEXT
bridge            TEXT (connection point)
timestamp         TIMESTAMP
```

---

## 🔄 API Flow Examples

### Example 1: Add Multiple Targets and Analyze

```bash
# Step 1: Add first target
curl -X POST http://localhost:3000/api/watchlist \
  -H "Content-Type: application/json" \
  -d '{"sourceUser":"alice","target_type":"username","target_value":"torvalds"}'

# Step 2: Add second target
curl -X POST http://localhost:3000/api/watchlist \
  -H "Content-Type: application/json" \
  -d '{"sourceUser":"alice","target_type":"repo","target_value":"facebook/react"}'

# Step 3: Add third target
curl -X POST http://localhost:3000/api/watchlist \
  -H "Content-Type: application/json" \
  -d '{"sourceUser":"alice","target_type":"org","target_value":"kubernetes"}'

# Step 4: View all targets
curl "http://localhost:3000/api/watchlist?sourceUser=alice"

# Step 5: Analyze all at once
curl "http://localhost:3000/api/analyze-watchlist?sourceUser=alice"
```

### Example 2: Selective Removal

```bash
# View watchlist
curl "http://localhost:3000/api/watchlist?sourceUser=bob"

# Remove one target
curl -X DELETE "http://localhost:3000/api/watchlist/torvalds?sourceUser=bob"

# Verify removal
curl "http://localhost:3000/api/watchlist?sourceUser=bob"
```

---

## ⚙️ Configuration

### Environment Variables
```
GEMINI_API_KEY          Google Gemini API key for AI analysis
NEXT_PUBLIC_SUPABASE_URL Supabase project URL
SUPABASE_SERVICE_KEY    Supabase service role key
```

### Database
Run `supabase-schema.sql` in Supabase SQL Editor to set up tables.

### Dependencies
- `@supabase/supabase-js` - Database
- `@google/genai` - Gemini API
- `next` - Framework

---

## 📈 Performance

| Operation | Time | Notes |
|-----------|------|-------|
| Get Watchlist | <100ms | Indexed queries |
| Add Target | <200ms | Insert operation |
| Remove Target | <100ms | Delete operation |
| Single Analysis | 2-5s | LLM calls, cached if no changes |
| Batch Analysis (3 targets) | 5-15s | Parallel processing |

**Cache**: 30-minute TTL on activity hash
- Same activity = instant response
- Different activity = full analysis

---

## 🐛 Troubleshooting

### "Cannot find module"
```bash
npm install
```

### "sourceUser parameter required"
Add `?sourceUser=yourname` to GET/DELETE requests:
```bash
curl "http://localhost:3000/api/watchlist?sourceUser=alice"
```

### Empty watchlist
Add targets first with POST:
```bash
curl -X POST http://localhost:3000/api/watchlist \
  -d '{"sourceUser":"alice","target_type":"username","target_value":"torvalds"}'
```

### Analysis timeout
GitHub API has rate limits (60 requests/hour unauthenticated). Wait an hour.

### "Internal server error"
Check Supabase connection:
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
- Check Supabase logs in dashboard

---

## 🎯 File Structure

```
src/
├── app/api/
│   ├── watchlist/
│   │   ├── route.js          ← GET/POST watchlist
│   │   └── [id]/route.js     ← DELETE item
│   └── analyze-watchlist/route.js  ← Batch analysis
└── lib/
    ├── agent.js              ← Analysis pipeline
    └── watchlist.js          ← CRUD operations
```

---

## 🚀 Next Steps

### For Your Team
1. Your teammate: Implement auth endpoints
2. Your team: Build frontend UI using these endpoints
3. Optional: Add email verification, password reset, etc.

### Endpoints Your Teammate Should Add
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile

### Frontend Integration
Use the API endpoints above to build:
- Watchlist management UI
- Add/remove targets
- View analysis results
- Display decision rankings

---

## 💡 Tips

1. **Always include sourceUser** - Required for all endpoints
2. **Target types** - Use exactly: `username`, `repo`, or `org`
3. **Target values** - Lowercase recommended, case-insensitive query
4. **Batch analysis** - Returns sorted by decision priority
5. **Caching** - Same activity within 30 min returns instant result

---

## 📞 Support

### Common Issues
- No module errors → `npm install`
- Parameter errors → Check `sourceUser` in query/body
- Database errors → Verify Supabase connection

### Resources
- Supabase: https://supabase.com/docs
- GitHub API: https://docs.github.com/rest
- Gemini API: https://ai.google.dev

---

**Status**: Ready for testing ✅  
**Last Updated**: January 2026
