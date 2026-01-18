# Frontend Setup Guide

## Authentication & Getting Started

### 1. First-Time Setup: Sign Up
When you visit the app (`http://localhost:3000`), you'll be automatically redirected to `/auth` if you're not logged in.

**To create an account:**
1. Click on the "Sign Up" tab
2. Enter your email address
3. Enter a password (at least 6 characters)
4. Enter your GitHub username (this is used to analyze GitHub profiles)
5. Click "Sign Up"
6. Check your email for a confirmation link and verify your account

**To log in:**
1. Enter your email
2. Enter your password
3. Click "Log In"
4. You'll be redirected to the dashboard

### 2. Alternative: GitHub OAuth
You can also sign in using GitHub OAuth by clicking "Sign in with GitHub". This will use your GitHub account for authentication.

---

## Using the Dashboard

### Add Items to Watchlist
1. Click the **+ Add to watchlist** button
2. Select the type: **Username**, **Org**, or **Repo**
3. Enter the target (e.g., "torvalds" for a user, "nodejs" for an org, "torvalds/linux" for a repo)
4. Click **Add**

### Analyze Individual Targets
In the "Results" section, enter a GitHub target (user, org, or repo) and click "Quick Analyze" to analyze a single target without adding it to your watchlist.

### Batch Analyze Your Watchlist
1. Click **Analyze All** button in the header
2. Wait for the analysis to complete (it analyzes all items in parallel)
3. Results will appear sorted by decision priority:
   - **ENGAGE** - High confidence, reach out now
   - **WAIT** - Good potential, but wait for better timing
   - **IGNORE** - Not a good fit
   - **NO_CHANGE** - Cached result, no new activity

### View Detailed Analysis
Click on any result card to see:
- **Readiness Score** (0-100)
- **Reasoning** - Why the AI made this decision
- **Bridge** - Shared interests/connections
- **Focus** - Key technologies/interests
- **Icebreaker** - Suggested message to open with
- **Next Step** - Recommended action

### Connect
Click **Connect** on any result to:
1. Copy the icebreaker message to your clipboard
2. Open the GitHub profile in a new tab
3. Ready to send a message!

---

## Troubleshooting

### "User from sub claim in JWT does not exist" Error
This means you haven't signed up with Supabase auth. You must create an account first via the `/auth` page.

### "Row-level security policy violated" Error
This typically means:
1. You're not properly authenticated
2. Try logging out and logging back in
3. Check that your browser is storing the auth token in localStorage

### "Watchlist is empty"
You need to add items to your watchlist first. Click **+ Add to watchlist** to add your first item.

### Analysis shows no results
1. Make sure the targets exist on GitHub
2. Make sure your GitHub username is set in your profile
3. If GitHub API rate limit is hit, you'll get fallback dummy data

---

## Requirements

- **Node.js** 18+ and npm
- **Supabase account** with auth configured
- **GitHub API token** (in backend .env.local)
- **Gemini API key** (in backend .env.local)

---

## Environment Variables Needed

Check your `.env.local` file has:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public anon key
- `SUPABASE_SERVICE_KEY` - Supabase service key (backend only)
- `GITHUB_TOKEN` - GitHub personal access token
- `GEMINI_API_KEY` - Google Gemini API key

---

## Testing the Frontend

### Quick Test Flow:
1. Go to `http://localhost:3000`
2. Sign up with an email/password
3. Add a GitHub username (e.g., "torvalds")
4. Add items to watchlist:
   - User: "linus" 
   - Org: "nodejs"
   - Repo: "torvalds/linux"
5. Click **Analyze All**
6. View results and click **Connect**

---

## Common Issues

### Auth Redirects to /auth
This is normal if you're not logged in. Sign up or log in to access the dashboard.

### Can't add items to watchlist
1. Make sure you're logged in (check for user session)
2. Check browser console for error messages
3. Ensure network tab shows successful 200 response from `/api/watchlist`

### Analysis returns errors
1. Check that targets exist on GitHub
2. If hitting GitHub API rate limit, dummy data will be returned
3. Check backend logs for more details

---

## Next Steps

Once basic functionality works:
1. Customize the UI as needed
2. Add more features (notifications, scheduling, etc.)
3. Deploy to production
4. Set up proper error tracking and monitoring
