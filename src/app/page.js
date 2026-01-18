"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Settings, RefreshCw, Users, Target, TrendingUp, Github, Calendar, Zap, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare, ExternalLink, Activity } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"
import { WatchlistComponent } from "@/components/watchlist-component"
import { supabase } from "@/lib/supabase-client"
import { motion, AnimatePresence } from "framer-motion"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [watchlist, setWatchlist] = useState([])
  const [analysisResults, setAnalysisResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [showWatchlist, setShowWatchlist] = useState(false)
  const [lastAnalysis, setLastAnalysis] = useState(null)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)

  // Check Supabase Session
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        if (session.access_token) {
          localStorage.setItem('authToken', session.access_token);
        }

        // Verify onboarding status
        const { data: profile } = await supabase
          .from('profiles')
          .select('goal')
          .eq('id', session.user.id)
          .single()

        if (!profile || !profile.goal) {
          console.log('User not onboarded, redirecting to console')
          router.push('/console')
          return
        }

        setUser(session.user)
        fetchWatchlist()
      } else {
        router.push('/auth')
      }
    }
    checkUser()
  }, [])

  // Auto-refresh every hour
  useEffect(() => {
    if (!autoRefreshEnabled || analysisResults.length === 0) return

    const interval = setInterval(() => {
      console.log('Auto-refreshing analysis...')
      analyzeWatchlist(true) // silent refresh
    }, 60 * 60 * 1000) // 1 hour

    return () => clearInterval(interval)
  }, [autoRefreshEnabled, analysisResults.length])

  const fetchWatchlist = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      const res = await fetch('/api/watchlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setWatchlist(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch watchlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeWatchlist = async (silent = false) => {
    if (!silent) setAnalyzing(true)
    try {
      const token = localStorage.getItem('authToken')
      console.log('Analyzing watchlist with token:', token ? 'present' : 'missing')

      const res = await fetch('/api/analyze-watchlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      console.log('Analysis response:', data)

      if (data.success) {
        console.log('Setting analysis results:', data.results)
        setAnalysisResults(data.results)
        setLastAnalysis(new Date())
        if (!silent) {
          console.log(`Analyzed ${data.results.length} targets`)
        }
      } else {
        console.error('Analysis failed:', data.error)
      }
    } catch (error) {
      console.error('Failed to analyze watchlist:', error)
    } finally {
      if (!silent) setAnalyzing(false)
    }
  }

  const handleConnect = async (person) => {
    try {
      console.log('Connecting with:', person.target)

      const token = localStorage.getItem('authToken')
      await fetch('/api/engagement', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target: person.target,
          action: 'connect',
          message: person.icebreaker
        })
      }).catch(err => console.log('Engagement tracking not implemented yet'))

      if (person.icebreaker) {
        await navigator.clipboard.writeText(person.icebreaker)
      }

      const githubUrl = person.type === 'username'
        ? `https://github.com/${person.target}`
        : person.type === 'org'
          ? `https://github.com/${person.target}`
          : `https://github.com/${person.target}`

      window.open(githubUrl, '_blank')
      alert(`Message copied to clipboard! Opening ${person.target}'s GitHub profile.`)

    } catch (error) {
      console.error('Failed to connect:', error)
      alert('Failed to connect. Please try again.')
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Signal Now</h1>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{watchlist.length} tracked</span>
                </div>
                {lastAnalysis && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Last updated {lastAnalysis.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefreshEnabled}
                  onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="autoRefresh" className="text-sm text-gray-600">
                  Auto-refresh hourly
                </label>
              </div>
              <button
                onClick={() => setShowWatchlist(!showWatchlist)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors border font-medium ${showWatchlist
                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <Target className="h-4 w-4" />
                <span>Watchlist</span>
              </button>
              <button
                onClick={() => analyzeWatchlist()}
                disabled={analyzing || watchlist.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {analyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="font-medium">{analyzing ? 'Analyzing...' : 'Analyze All'}</span>
              </button>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Watchlist Sidebar */}
          <div className={`transition-all duration-300 ${showWatchlist ? 'w-80' : 'w-0 overflow-hidden'}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Watchlist</h2>
                <Target className="h-5 w-5 text-gray-400" />
              </div>
              <WatchlistComponent
                watchlist={watchlist}
                onUpdate={fetchWatchlist}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {analysisResults.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                <div className="text-center max-w-md mx-auto">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Find Connections?</h2>
                  <p className="text-gray-600 mb-8">
                    Add people to your watchlist and let our AI analyze the perfect moment to reach out.
                  </p>
                  {watchlist.length > 0 ? (
                    <button
                      onClick={() => analyzeWatchlist()}
                      disabled={analyzing}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm font-medium"
                    >
                      {analyzing ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Zap className="h-5 w-5" />
                      )}
                      <span>Analyze Watchlist</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowWatchlist(true)}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Add People to Track</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Analysis Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Analysis Results</h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{analysisResults.length} profiles analyzed</span>
                      <span>•</span>
                      <span>{analysisResults.filter(r => r.decision === 'ENGAGE').length} ready to engage</span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {['ENGAGE', 'WAIT', 'IGNORE', 'NO_CHANGE'].map(status => {
                      const count = analysisResults.filter(r => r.decision === status).length
                      return (
                        <div key={status} className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">{count}</div>
                          <div className="text-sm text-gray-500 capitalize">{status.replace('_', ' ')}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AnimatePresence>
                    {analysisResults.map((result, index) => (
                      <motion.div
                        key={result.target}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <ProfileCard
                          person={result}
                          onConnect={() => handleConnect(result)}
                          onViewDetails={() => setSelectedPerson(result)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Person Detail Modal */}
      <AnimatePresence>
        {selectedPerson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPerson(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <PersonDetailModal
                person={selectedPerson}
                onClose={() => setSelectedPerson(null)}
                onConnect={() => handleConnect(selectedPerson)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Professional Profile Card Component
function ProfileCard({ person, onConnect, onViewDetails }) {
  // Check if this result has an error
  if (person.error) {
    return (
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <img
              src={`https://github.com/${person.target}.png`}
              alt={person.target}
              className="w-16 h-16 rounded-full border-2 border-gray-200"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${person.target}&background=f3f4f6&color=374151&size=64`
              }}
            />
            <div>
              <h3 className="text-xl font-bold text-gray-900">{person.target}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Github className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500 capitalize">{person.type}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-4">
          <div className="flex items-start space-x-3">
            <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-900">Analysis Failed</h4>
              <p className="text-sm text-red-700 mt-1">{person.error}</p>
              <p className="text-xs text-red-600 mt-2">
                💡 Tip: Make sure your GitHub username is set in your profile settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (decision) => {
    switch (decision) {
      case 'ENGAGE': return 'text-green-600 bg-green-50 border-green-200'
      case 'WAIT': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'IGNORE': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (decision) => {
    switch (decision) {
      case 'ENGAGE': return <CheckCircle className="h-4 w-4" />
      case 'WAIT': return <Clock className="h-4 w-4" />
      case 'IGNORE': return <XCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <img
            src={`https://github.com/${person.target}.png`}
            alt={person.target}
            className="w-16 h-16 rounded-full border-2 border-gray-200"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${person.target}&background=f3f4f6&color=374151&size=64`
            }}
          />
          <div>
            <h3 className="text-xl font-bold text-gray-900">{person.target}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <Github className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500 capitalize">{person.type}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${getScoreColor(person.readiness_score)}`}>
            {person.readiness_score}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            Readiness Score
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border font-medium ${getStatusColor(person.decision)}`}>
          {getStatusIcon(person.decision)}
          <span>{person.decision}</span>
        </div>
      </div>

      {/* Connection Bridge */}
      {person.bridge && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
            Connection Point
          </div>
          <p className="text-blue-800 font-medium">{person.bridge}</p>
        </div>
      )}

      {/* Focus Areas */}
      {(() => {
        // Normalize focus to array (it might be a string from the LLM)
        const focusAreas = Array.isArray(person?.focus)
          ? person.focus
          : (typeof person?.focus === 'string' ? person.focus.split(',').map(s => s.trim()) : []);

        if (focusAreas.length === 0) return null;

        return (
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Focus Areas
            </div>
            <div className="flex flex-wrap gap-2">
              {focusAreas.slice(0, 4).map((tech, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded font-medium">
                  {tech}
                </span>
              ))}
              {focusAreas.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-sm rounded">
                  +{focusAreas.length - 4} more
                </span>
              )}
            </div>
          </div>
        );
      })()}

      {/* Reasoning */}
      <div className="mb-6">
        <p className="text-gray-700 leading-relaxed line-clamp-3">{person.reasoning}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={onViewDetails}
          className="flex-1 flex items-center justify-center space-x-2 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          <ExternalLink className="h-4 w-4" />
          <span>View Details</span>
        </button>
        <button
          onClick={onConnect}
          className="flex-1 flex items-center justify-center space-x-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Connect</span>
        </button>
      </div>
    </div>
  )
}

// Detailed Person Modal
function PersonDetailModal({ person, onClose, onConnect }) {
  const [copied, setCopied] = useState(false)

  // Access nested trace data safely
  const researcher = person.trace?.researcher || {}
  const strategist = person.trace?.strategist || {}

  const handleCopyMessage = () => {
    if (person.icebreaker) {
      navigator.clipboard.writeText(person.icebreaker)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex flex-col h-[85vh]">
      {/* Premium Header with Blur */}
      <div className="relative overflow-hidden bg-gray-900 text-white p-8 flex-shrink-0">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <svg width="200" height="200" viewBox="0 0 100 100" fill="white">
            <path d="M50 0 L100 100 L0 100 Z" />
          </svg>
        </div>

        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={`https://github.com/${person.target}.png`}
                alt={person.target}
                className="w-24 h-24 rounded-2xl border-4 border-white/10 shadow-2xl"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${person.target}&background=374151&color=fff&size=96`
                }}
              />
              <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-bold border-2 border-gray-900 ${person.decision === 'ENGAGE' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                }`}>
                {person.decision}
              </div>
            </div>

            <div>
              <h2 className="text-4xl font-bold mb-2 tracking-tight">{person.target}</h2>
              <div className="flex items-center space-x-4 text-gray-300">
                <div className="flex items-center space-x-2">
                  <Github className="h-5 w-5" />
                  <span className="capitalize font-medium">{person.type}</span>
                </div>
                <span>•</span>
                <span className={`px-2 py-0.5 rounded text-sm font-medium ${researcher.activity_pattern === 'highly_active' ? 'bg-green-500/20 text-green-300' : 'bg-gray-700 text-gray-300'
                  }`}>
                  {researcher.activity_pattern ? researcher.activity_pattern.replace('_', ' ') : 'Unknown Activity'}
                </span>
                <a
                  href={`https://github.com/${person.target}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors ml-4"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all backdrop-blur-sm"
          >
            <XCircle className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Main Content Info */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN - STRATEGY */}
          <div className="lg:col-span-2 space-y-8">

            {/* 1. THE HOOK (Strategist) */}
            {strategist.the_hook && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center">
                  <span className="mr-2">⚡</span> The Technical Hook
                </h3>
                <p className="text-2xl font-medium text-gray-900 leading-snug">
                  "{strategist.the_hook}"
                </p>
                <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                  {strategist.bridge && (
                    <div className="flex items-center">
                      <span className="font-semibold mr-2 text-gray-700">Bridge:</span> {strategist.bridge}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. RESEARCHER INSIGHTS */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-gray-100 p-2 rounded-lg mr-3">🔍</span> Researcher Intel
              </h3>

              {researcher.recent_activity_summary && (
                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Recent Cycle</h4>
                  <p className="text-gray-700 italic border-l-2 border-gray-300 pl-4">
                    {researcher.recent_activity_summary}
                  </p>
                </div>
              )}

              {researcher.notable_signals && researcher.notable_signals.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Observable Signals</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {researcher.notable_signals.map((signal, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>{signal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. FOCUS AREAS */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Tech Context</h3>
              {(() => {
                const focusAreas = Array.isArray(person?.focus)
                  ? person.focus
                  : (typeof person?.focus === 'string' ? person.focus.split(',').map(s => s.trim()) : []);

                return (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {focusAreas.map((tech, i) => (
                      <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md font-medium text-sm border border-gray-200">
                        {tech}
                      </span>
                    ))}
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-4 text-sm">
                {strategist.timing_analysis && (
                  <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                    <span className="block font-semibold text-yellow-800 mb-1">Timing Analysis</span>
                    <span className="text-yellow-900 opacity-90">{strategist.timing_analysis}</span>
                  </div>
                )}
                {strategist.momentum_shift && (
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <span className="block font-semibold text-purple-800 mb-1">Momentum Shift?</span>
                    <span className="text-purple-900 opacity-90 capitalize">{strategist.momentum_shift}</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN - ACTION */}
          <div className="space-y-6">

            {/* SCORE CARD */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50 pointer-events-none"></div>
              <div className="relative z-10">
                <div className="text-5xl font-black text-gray-900 mb-1">{person.readiness_score}</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Readiness Score</div>

                <div className={`inline-flex items-center px-4 py-2 rounded-full font-bold text-sm ${person.readiness_score >= 70 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                  {person.readinessLevel ? person.readinessLevel.toUpperCase() : 'MEDIUM'} INTENT
                </div>
              </div>
            </div>

            {/* ICEBREAKER CARD */}
            {person.icebreaker && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-1 shadow-lg transform transition-transform hover:scale-[1.02]">
                <div className="bg-gray-900 rounded-xl p-5 h-full flex flex-col">
                  <h3 className="text-white font-bold flex items-center justify-between mb-4">
                    <span>Draft Message</span>
                    <span className="text-xs font-normal text-gray-400 bg-gray-800 px-2 py-1 rounded">Ghostwriter v1</span>
                  </h3>

                  <div className="bg-gray-800/50 rounded-lg p-4 mb-4 font-mono text-sm text-gray-200 leading-relaxed border border-gray-700">
                    "{person.icebreaker}"
                  </div>

                  <button
                    onClick={handleCopyMessage}
                    className="w-full mt-auto py-3 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <div className="h-4 w-4">📋</div>}
                    <span>{copied ? "Copied to Clipboard" : "Copy to Clipboard"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* REASONING */}
            <div className="bg-gray-100 rounded-2xl p-6">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">AI Reasoning</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {person.reasoning}
              </p>
            </div>

            {/* TRACE DROPDOWN */}
            <div className="mt-4">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-500 uppercase tracking-widest transition-colors">
                  <span>View Raw Trace Data</span>
                  <span className="group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-2 p-4 bg-gray-900 rounded-xl overflow-x-auto">
                  <pre className="text-xs text-green-400 font-mono leading-relaxed">
                    {JSON.stringify(person.trace || {}, null, 2)}
                  </pre>
                </div>
              </details>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}