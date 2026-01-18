"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProfileCard } from "./components/profile-card"
import { Loader2, Plus, Settings } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"
import { supabase } from "@/lib/supabase-client"

// Mock Targets for the demo Carousel
const TARGET_POOLS = [
  "torvalds", // Linux Creator
  "shadcn",   // UI Wizard
  "leerob",   // Vercel VP
  "swyx",     // AI Engineer
]

export default function Dashboard() {
  const router = useRouter()
  const [identity, setIdentity] = useState("")
  const [profiles, setProfiles] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  // Check Supabase Session
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Ensure token is in localStorage for API calls
        if (session.access_token) {
          localStorage.setItem('authToken', session.access_token);
        }

        // Use metadata username or email as identity
        const idPromise = session.user.user_metadata?.user_name || session.user.user_metadata?.preferred_username || session.user.email
        setIdentity(idPromise)
        if (profiles.length === 0) fetchMatches(idPromise)
      } else {
        // Redirect to auth if not logged in
        router.push('/auth')
      }
    }
    checkUser()
  }, [])

  const fetchMatches = async (sourceUser) => {
    setLoading(true)
    setAnalyzing(true)

    try {
      // In a real app, we'd fetch a list. Here we cycle through our target pool
      // and analyze them one by one or in batch.
      // Let's analyze the first one to start showing something fast.
      const firstTarget = TARGET_POOLS[0]
      await analyzeOne(sourceUser, firstTarget)

      // Lazily analyze the rest in background or when requested? 
      // For smooth carousel, let's try to get at least 2.
    } catch (e) {
      console.error("Match error", e)
    } finally {
      setLoading(false)
      setAnalyzing(false)
    }
  }

  const analyzeOne = async (source, target) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ sourceUser: source, targetUser: target })
      })

      if (res.status === 401) {
        router.push('/auth');
        throw new Error("Unauthorized");
      }

      if (!res.ok) throw new Error("API Failed")
      const data = await res.json()

      // Transform API data to Card Props
      const newProfile = {
        id: Date.now() + Math.random(),
        name: target, // API might return full name, but fallback
        role: "Developer", // API might infer this
        avatar: "👨‍💻", // We could fetch GH avatar if we want
        isOnline: true,
        matchReason: data.bridge || "High Tech Overlap",
        readinessScore: data.score || 75,
        icebreaker: data.icebreaker || "Hey, saw your work on..."
      }

      setProfiles(prev => [...prev, newProfile])
    } catch (e) {
      console.error("Analysis failed for", target)
    }
  }

  const handleNext = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      // If at end, maybe fetch more or cycle?
      // For now, loop back
      setCurrentIndex(0)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    } else {
      setCurrentIndex(profiles.length - 1)
    }
  }

  if (!identity) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-white">
        <div className="text-center space-y-8 max-w-md" style={{ animation: 'fadeIn 0.6s ease-out' }}>
          <div
            className="w-20 h-20 bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-3xl mx-auto flex items-center justify-center text-4xl font-bold shadow-2xl"
            style={{ animation: 'float 3s ease-in-out infinite' }}
          >
            S
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">SignalNow</h1>
            <p className="text-gray-500 text-lg">Connect to the high-signal network.</p>
          </div>
          <a
            href="/auth"
            className="inline-block w-full py-4 px-8 bg-gray-900 text-white rounded-2xl font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            Get Started
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <header className="px-8 py-5 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-xl flex items-center justify-center font-bold text-lg">S</div>
          <span className="font-semibold text-gray-900 text-lg">SignalNow</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/console')}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <Settings size={16} />
            <span>{identity}</span>
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300" />
          <LogoutButton />
        </div>
      </header>

      <div className="flex-grow flex items-center justify-center p-8">
        {profiles.length > 0 ? (
          <ProfileCard
            profile={profiles[currentIndex]}
            onConnect={() => console.log("Connected!")}
            onDismiss={() => console.log("Dismissed")}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        ) : (
          <div className="text-center" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            {analyzing ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-gray-400" size={40} />
                <p className="text-gray-500 text-lg">Analyzing connections...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <p className="text-gray-500">No signals found.</p>
                <button
                  onClick={() => fetchMatches(identity)}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {profiles.length > 0 && (
        <div className="pb-8 flex justify-center">
          <div className="bg-gray-100 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
            {profiles.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? "bg-gray-900 w-8" : "bg-gray-400 w-2 hover:bg-gray-600"
                  }`}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
