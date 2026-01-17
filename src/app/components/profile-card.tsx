"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Copy, X, ChevronLeft, ChevronRight, Check } from "lucide-react"

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
  onDismiss?: () => void
  onConnect: () => void
  onNext?: () => void
  onPrev?: () => void
}

export function ProfileCard({ profile, onDismiss, onConnect, onNext, onPrev }: ProfileCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(profile.icebreaker)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onConnect()
  }

  return (
    <div className="relative w-full max-w-5xl mx-auto flex items-center justify-center p-4">
      {onPrev && (
        <button
          onClick={onPrev}
          className="absolute left-0 z-10 p-3 rounded-full bg-white shadow-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:scale-110 hover:shadow-xl transition-all duration-200 -translate-x-16 hidden md:flex"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={profile.id}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
        >
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 md:gap-12">
              <div className="flex flex-col items-center md:items-start">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="relative"
                >
                  <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-gray-900 to-gray-700 text-white flex items-center justify-center text-5xl shadow-xl mb-4">
                    {profile.avatar}
                  </div>
                  {profile.isOnline && (
                    <div className="absolute bottom-4 right-0 w-5 h-5 rounded-full bg-green-500 border-4 border-white shadow-md" />
                  )}
                </motion.div>

                <h2 className="text-2xl font-bold text-gray-900 mt-4">{profile.name}</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">{profile.role}</p>

                <div className="mt-8 flex flex-col items-center">
                  <div className="relative w-28 h-28">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r="50"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        className="text-gray-100"
                      />
                      <motion.circle
                        initial={{ strokeDashoffset: 314 }}
                        animate={{ strokeDashoffset: 314 - (314 * profile.readinessScore) / 100 }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                        cx="56"
                        cy="56"
                        r="50"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray="314"
                        strokeLinecap="round"
                        className="text-gray-900"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-2xl font-bold text-gray-900">{profile.readinessScore}</span>
                      <span className="text-xs text-gray-500 mt-1">Score</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-full text-sm font-medium border border-gray-200 w-fit">
                  {profile.matchReason}
                </div>

                <div className="mt-6 flex-grow">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">
                    Suggested Message
                  </label>
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 relative group transition-all duration-200 hover:border-gray-300 hover:shadow-md">
                    <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {profile.icebreaker}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-8">
                  {onDismiss && (
                    <button
                      onClick={onDismiss}
                      className="px-5 py-2.5 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                    >
                      <X size={18} />
                    </button>
                  )}

                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 hover:shadow-xl active:scale-95 transition-all duration-200"
                  >
                    {copied ? (
                      <>
                        <Check size={18} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        <span>Copy Message</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {onNext && (
        <button
          onClick={onNext}
          className="absolute right-0 z-10 p-3 rounded-full bg-white shadow-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:scale-110 hover:shadow-xl transition-all duration-200 translate-x-16 hidden md:flex"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  )
}

