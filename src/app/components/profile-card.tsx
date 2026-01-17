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
    <div className="relative w-full max-w-4xl mx-auto flex items-center justify-center p-4">
      {/* Navigation - Left */}
      {onPrev && (
        <button
          onClick={onPrev}
          className="absolute left-0 z-10 p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-md border border-gray-200 text-gray-500 hover:text-black hover:scale-110 transition-all -translate-x-full mr-4 hidden md:flex"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={profile.id}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
          className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row h-[400px]"
        >
          {/* LEFT SIDE: Identity (35%) */}
          <div className="w-full md:w-[35%] bg-gray-50 p-6 flex flex-col items-center justify-center border-r border-gray-100 relative overflow-hidden">
            {/* Background decoration - REMOVED per user request */}
            {/* <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" /> */}

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <div className="w-24 h-24 rounded-full bg-black text-white flex items-center justify-center text-4xl font-bold shadow-lg mb-4 ring-4 ring-white">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              {profile.isOnline && (
                <div className="absolute bottom-2 right-1 w-5 h-5 rounded-full bg-green-500 border-4 border-white" />
              )}
            </motion.div>

            <h2 className="text-xl font-bold text-gray-900 text-center mt-2">{profile.name}</h2>
            <p className="text-sm text-gray-500 text-center font-medium mb-6">{profile.role}</p>

            {/* Readiness Score - Linear Design */}
            <div className="w-full mt-6 px-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Readiness</span>
                <span className="text-sm font-bold text-gray-900">{profile.readinessScore}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${profile.readinessScore}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-black rounded-full"
                />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Intelligence (65%) */}
          <div className="w-full md:w-[65%] p-8 flex flex-col relative bg-white">
            {/* Badge */}
            <div className="flex justify-between items-start mb-6">
              <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border border-blue-100">
                {profile.matchReason}
              </div>
            </div>

            {/* Icebreaker */}
            <div className="flex-grow">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Suggested Icebreaker</p>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 relative group transition-colors hover:border-gray-200">
                <p className="text-sm text-gray-600 font-mono leading-relaxed">
                  {profile.icebreaker}
                </p>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Copy size={14} className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-50">
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                >
                  <X size={18} />
                </button>
              )}

              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-full font-medium text-sm hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all shadow-md hover:shadow-lg"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Connect"}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation - Right */}
      {onNext && (
        <button
          onClick={onNext}
          className="absolute right-0 z-10 p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-md border border-gray-200 text-gray-500 hover:text-black hover:scale-110 transition-all translate-x-full ml-4 hidden md:flex"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  )
}
