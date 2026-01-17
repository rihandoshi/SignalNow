"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProfileCard } from "./components/profile-card"
import { Loader2, Plus, Settings } from "lucide-react"

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

  // Load Identity from LocalStorage (simulated persistence from Console)
  useEffect(() => {
    // For demo, we can also check if a "identity" query param exists or just use a default
    // In a real app, this would be in a Context or persistent store
    const storedIdentity = localStorage.getItem("signal_identity")
    if (storedIdentity) {
      setIdentity(storedIdentity)
      // Auto start matching if we have an identity
      if (profiles.length === 0) fetchMatches(storedIdentity)
    }
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
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceUser: source, targetUser: target })
      })
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
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 bg-black text-white rounded-2xl mx-auto flex items-center justify-center text-3xl font-bold shadow-xl">
            S
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">SignalNow</h1>
          <p className="text-gray-500">Connect to the high-signal network.</p>
          <a
            href="/console"
            className="block w-full py-3 px-6 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Configure Signal
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F3F4F6] flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold">S</div>
          <span className="font-semibold text-gray-900">SignalNow</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/console')}
            className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
          >
            {identity}
          </button>
          <div className="w-8 h-8 rounded-full bg-gray-200" />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-grow flex items-center justify-center p-4 relative">
        {/* Background Blobs for specific "vibe" */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

        {profiles.length > 0 ? (
          <ProfileCard
            profile={profiles[currentIndex]}
            onConnect={() => console.log("Connected!")}
            onDismiss={() => console.log("Dismissed")}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        ) : (
          <div className="text-center z-10">
            {analyzing ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-gray-400" size={32} />
                <p className="text-gray-500 animate-pulse">Triangulating signal with {TARGET_POOLS[0]}...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <p className="text-gray-500">No signals found.</p>
                <button onClick={() => fetchMatches(identity)} className="text-blue-600 hover:underline">Retry</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Docks (Visual only for now) */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/50 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-1 shadow-sm border border-white/20">
        {profiles.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? "bg-black w-4" : "bg-gray-400"}`}
          />
        ))}
        {analyzing && <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" />}
      </div>
    </main>
  )
}

