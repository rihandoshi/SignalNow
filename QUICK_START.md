# Quick Start Checklist ✅

## For Your Friend - Getting Signal-Now Working

### Step 1: Understand the Fix (5 min)
- [ ] Read `FRONTEND_FIXES.md` - explains what was wrong and how it's fixed
- [ ] Read `CODE_CHANGES.md` - see exact code changes if interested
- [ ] Understand: You need REAL Supabase account, not fake demo user

### Step 2: Start the Server (2 min)
```bash
cd d:\Rihan\Hackathons\Devfest\signal-now
npm install  # if first time
npm run dev
```
- [ ] Server starts on http://localhost:3000
- [ ] No build errors in console

### Step 3: Create Account (3 min)
```
1. Go to http://localhost:3000
2. You'll be redirected to http://localhost:3000/auth
3. Click "Sign Up"
4. Enter:
   - Email: anything@example.com
   - Password: anything123 (6+ chars)
   - GitHub Username: torvalds (or your real GitHub username)
5. Click Sign Up
6. Check email for verification link
7. Verify your account
```
- [ ] Account created in Supabase
- [ ] Email verified

### Step 4: Log In (1 min)
```
1. Back on /auth page
2. Enter your email and password
3. Click Log In
4. Should redirect to dashboard
```
- [ ] Successfully logged in
- [ ] Redirected to dashboard at /

### Step 5: Test Basic Features (5 min)

**Add to Watchlist:**
```
1. Click "+ Add to watchlist"
2. Select "Username"
3. Enter "torvalds"
4. Click "Add"
5. Item should appear in list
```
- [ ] Successfully added "torvalds" to watchlist

**Add an Organization:**
```
1. Click "+ Add to watchlist"
2. Select "Org"
3. Enter "nodejs"
4. Click "Add"
```
- [ ] Successfully added "nodejs" org to watchlist

**Add a Repository:**
```
1. Click "+ Add to watchlist"
2. Select "Repo"
3. Enter "torvalds/linux"
4. Click "Add"
```
- [ ] Successfully added "torvalds/linux" repo to watchlist

**Analyze Items:**
```
1. Click "Analyze All" button (top right)
2. Wait for analysis...
3. Should show results for all 3 items
```
- [ ] Analysis completes without errors
- [ ] Shows results for all watchlist items
- [ ] Results sorted by decision (ENGAGE > WAIT > IGNORE)

### Step 6: Test Full Features (5 min)

**Delete an Item:**
```
1. Hover over "torvalds" item
2. Click trash icon
3. Item should be removed
```
- [ ] Successfully deleted item from watchlist

**Quick Analyze:**
```
1. Go to "Results" section
2. Enter "gvanrossum" in the input
3. Click "Quick Analyze"
4. Should show analysis for that user
```
- [ ] Can analyze targets without adding to watchlist

**Connect/Open Profile:**
```
1. Click "Connect" on any analysis result
2. Icebreaker message copied to clipboard
3. GitHub profile opens in new tab
```
- [ ] Message copied
- [ ] GitHub profile opened
- [ ] Can send the message via GitHub

### Step 7: Check Error Handling (2 min)

**What happens if:**
- [ ] Try to analyze without logging in → Get 401 error
- [ ] Try to add item without logging in → Get 401 error
- [ ] Analyze empty watchlist → Shows "Watchlist is empty"
- [ ] Analyze non-existent user → Shows analysis with note

---

## Troubleshooting

### Problem: "User from sub claim in JWT does not exist"
```
❌ You haven't signed up with real Supabase account
✅ Go to /auth, sign up with email/password
✅ Verify your email
✅ Log back in
```

### Problem: "Row-level security policy violated"
```
❌ Authentication token is invalid or missing
✅ Log out (click user menu) → Log in again
✅ Refresh the page
✅ Check browser console for token in localStorage
```

### Problem: "Watchlist is empty"
```
❌ You haven't added any items yet
✅ Click "+ Add to watchlist"
✅ Add at least one GitHub username, org, or repo
```

### Problem: Analysis returns no results
```
❌ Targets might not exist on GitHub
✅ Try with "torvalds", "nodejs", "python"
❌ GitHub API might be rate-limited
✅ Wait a bit and try again
```

### Problem: Server won't start
```
❌ Port 3000 already in use
✅ Kill the process: 
   Get-Process -Name node | Stop-Process -Force
✅ Try again: npm run dev

❌ Not in correct directory
✅ cd d:\Rihan\Hackathons\Devfest\signal-now
✅ Then: npm run dev

❌ Dependencies missing
✅ npm install
✅ npm run dev
```

### Problem: Can't verify email
```
✅ Check spam folder
✅ Wait a few seconds
✅ Go back and try logging in (email might auto-verify)
```

---

## What Each File Does

### Frontend Components:
- **src/app/page.js** - Main dashboard (watchlist + analysis results)
- **src/components/watchlist-component.tsx** - Watchlist management UI
- **src/app/auth/page.tsx** - Sign up / Log in form

### Backend:
- **src/app/api/watchlist/route.js** - Manage watchlist (GET/POST)
- **src/app/api/watchlist/[id]/route.js** - Delete from watchlist
- **src/app/api/analyze/route.js** - Analyze single target
- **src/app/api/analyze-watchlist/route.js** - Batch analyze all items
- **src/lib/auth-utils.js** - JWT token verification ✅ FIXED
- **src/lib/agent.js** - AI analysis pipeline
- **src/lib/watchlist.js** - Watchlist database queries

### Documentation:
- **FRONTEND_FIXES.md** - What was wrong and how it's fixed (READ THIS)
- **CODE_CHANGES.md** - Detailed code changes
- **FRONTEND_SETUP.md** - How to use the app
- **API_DOCUMENTATION.txt** - API endpoints for reference

---

## What's Working Now ✅

```
✅ Real Supabase authentication
✅ Add/remove/view watchlist items (username, org, repo)
✅ Single-target analysis
✅ Batch analysis of watchlist
✅ User data isolation (RLS works correctly)
✅ Proper error messages
✅ All 5 API endpoints working
✅ GitHub OAuth login
✅ Auto-refresh hourly
✅ Results sorted by decision priority
```

---

## What's NOT Included (Beyond Scope)

These are handled by the backend (already done):
- Supabase database schema ✅ Done
- GitHub API integration ✅ Done
- Gemini AI analysis ✅ Done
- JWT token generation ✅ Done

---

## Next Steps (If You Have Time)

1. **Deploy to Production**
   - Push to GitHub
   - Connect to Vercel
   - Add production Supabase keys
   - Done!

2. **Add Features**
   - Email notifications
   - Scheduled analysis
   - Export results
   - Dark mode
   - etc.

3. **Customize**
   - Change colors/logo
   - Add more information
   - Modify analysis criteria
   - etc.

---

## Support

**If stuck:**
1. Check the relevant `.md` file above
2. Read the error message carefully
3. Check browser console (F12) for more details
4. Check server logs for backend errors
5. Ask in Discord/Slack

**Most Common Issues:**
- Need to sign up first (authentication)
- Need to add items to watchlist first (empty error)
- Need to verify email (if signup fails)

---

## Summary

1. **Start server** → npm run dev
2. **Sign up** → http://localhost:3000/auth
3. **Add items** → Click "+ Add to watchlist"
4. **Analyze** → Click "Analyze All"
5. **Connect** → Click "Connect" on results

Everything should work now! 🎉

---

**Made by:** Rihan (Fixed by: AI)
**Status:** ✅ All bugs fixed, ready to use
**Last Updated:** January 18, 2026
