# SignalNow

SignalNow is an intelligent networking tool that analyzes GitHub activity to help you find the right people to connect with at the perfect time.

## Project Structure

- `src/`: Source code for the Next.js application.
- `database/`: SQL schemas and migration scripts for Supabase.

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm
- Supabase account and project

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

### Database Setup

The database schema definitions are located in the `database/` directory.

1. Go to your Supabase SQL Editor.
2. Run the content of `database/final_schema.sql`. This file contains the complete, up-to-date schema for the application, including:
   - `profiles` table for user data.
   - `tracked_profiles` table for analysis results (with trace data support).
   - `user_watchlist` and `analysis_history` tables.


## Running the Application

To start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing and Verification

### Onboarding Flow
1. Sign up with a new email or GitHub account.
2. You should be automatically redirected to `/console` to complete your profile (set a goal, etc.).
3. After initialization, you will be redirected to the Dashboard.

### Dashboard Protection
- Try to access `/` without logging in. You should be redirected to `/auth`.
- Try to access `/` with a logged-in user who hasn't completed onboarding. You should be redirected to `/console`.

### Analysis Pipeline
1. Add a GitHub username to your watchlist.
2. Click "Analyze" on the dashboard.
3. Once analysis is complete, click "View Details" on the profile card.
4. Verify that:
   - "Draft Message" (Icebreaker) is displayed.
   - "AI Reasoning" is displayed.
   - "Analysis Trace" section at the bottom can be expanded to show the full JSON output.
   - This data persists even after refreshing the page (served from `last_trace` column).

## Features

- **Smart Watchlist**: Track GitHub users and Organizations.
- **AI Analysis**: Uses Gemini to analyze activity patterns, readiness, and generate cold outreach messages.
- **Strict Onboarding**: Ensures all users define their goals before using the platform.
- **Trace Persistence**: Saves full analysis context for debugging and review.
