# Supabase Configuration Fix

## Current Issue
Your app is currently using mock data because the Supabase service key is incorrect.

## What's Wrong
In your `.env.local` file:
```
SUPABASE_SERVICE_KEY=sb_publishable_PGgEKOK4QhnoLsVyogysmA_kA7u8F8z
```

This is a **publishable key**, not a service key.

## How to Fix

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `zkkeuebyipqknmszsasu`

2. **Get the Service Key**
   - Go to Settings → API
   - Copy the **service_role** key (not the anon/public key)
   - It should start with `eyJ...` and be much longer

3. **Update .env.local**
   ```
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Restart the Development Server**
   ```bash
   npm run dev
   ```

## Current Workaround
The app is currently using mock data that works locally for development. This allows you to:
- ✅ Add/remove watchlist items
- ✅ Test the analysis functionality
- ✅ Demo the complete user experience

## Database Schema
When you fix Supabase, make sure these tables exist:
- `user_watchlist`
- `tracked_profiles` 
- `analysis_history`

Run the SQL from `supabase-schema.sql` in your Supabase SQL editor.

## Testing
Once fixed, the app will:
- Store data permanently in Supabase
- Work across browser sessions
- Support multiple users
- Enable real-time updates