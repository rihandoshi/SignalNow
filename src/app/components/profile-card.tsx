"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Copy, X } from "lucide-react"

interface ProfileCardProps {
  profile: {
    id: number
    name: string
    role: string
    avatar: string
    isOnline: boolean
    matchReason: string
    readinessScore: number
    icebreaker: string
  }
  onDismiss: () => void
  onConnect: () => void
}

export function ProfileCard({ profile, onDismiss, onConnect }: ProfileCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(profile.icebreaker)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-full max-w-sm mx-auto"
    >
      <div
        className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100"
        style={{ aspectRatio: "3 / 4" }}
      >
        {/* Top Section: Avatar, Name, Role, Status */}
        <div className="p-6 flex flex-col items-center justify-center pt-8">
          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 mb-4 flex items-center justify-center text-2xl font-bold text-white">
            {profile.avatar}
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center">{profile.name}</h2>
          <p className="text-sm text-gray-600 text-center mt-1">{profile.role}</p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs font-medium text-gray-600">{profile.isOnline ? "Online" : "Offline"}</span>
          </div>
        </div>

        {/* Middle Section: Match Reason & Readiness Score */}
        <div className="px-6 py-4 border-t border-gray-100 border-b">
          {/* Match Reason */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Match Reason</p>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-700 font-medium italic">{profile.matchReason}</p>
            </div>
          </div>

          {/* Readiness Score */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Readiness Score</p>
            <div className="flex items-center justify-center gap-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-16 h-16" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#1f2937"
                    strokeWidth="3"
                    strokeDasharray={`${2.83 * profile.readinessScore} 283`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <span className="absolute text-lg font-bold text-gray-900">{profile.readinessScore}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Icebreaker Section */}
        <div className="px-6 py-4 flex-grow flex flex-col">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Icebreaker</p>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex-grow overflow-hidden">
            <p className="text-xs text-gray-700 font-medium leading-relaxed" style={{ fontFamily: "monospace" }}>
              {profile.icebreaker}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          {/* X Button */}
          <button
            onClick={onDismiss}
            className="w-12 h-12 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            aria-label="Dismiss"
          >
            <X size={20} />
          </button>

          {/* Connect Button */}
          <button
            onClick={() => {
              handleCopy()
              onConnect()
            }}
            className="flex-1 bg-black text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors py-2.5"
          >
            <Copy size={16} />
            {copied ? "Copied" : "Connect"}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
