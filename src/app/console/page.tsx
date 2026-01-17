"use client"

import type React from "react"

import { useState, useRef } from "react"

export default function ConfigurePage() {
  const [identity, setIdentity] = useState("")
  const [interestVector, setInterestVector] = useState("")
  const [targetSector, setTargetSector] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleInitialize = async (e: React.FormEvent) => {
    e.preventDefault()

    // Fade out card
    if (cardRef.current) {
      cardRef.current.style.animation = "fadeOutDown 0.6s ease-out forwards"
    }

    // Start scanning
    setIsScanning(true)
    setProgress(0)

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          // Redirect after completion
          setTimeout(() => {
            window.location.href = "/"
          }, 300)
          return 100
        }
        return prev + Math.random() * 30
      })
    }, 200)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <style>{`
        @keyframes fadeOutDown {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(40px);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .progress-container {
          animation: slideInUp 0.4s ease-out forwards;
        }
      `}</style>

      {!isScanning ? (
        <div ref={cardRef} className="w-full max-w-md p-8 bg-white rounded-lg shadow-sm border border-gray-100">
          <h1 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Configure Signal Parameters</h1>

          <form onSubmit={handleInitialize} className="space-y-6">
            {/* Identity Field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="identity" className="text-sm font-medium text-gray-700">
                Identity
              </label>
              <input
                id="identity"
                type="text"
                placeholder="Your GitHub Username"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                required
                className="px-4 py-2.5 border border-gray-200 rounded-md bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Interest Vector Field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="interest" className="text-sm font-medium text-gray-700">
                Interest Vector
              </label>
              <input
                id="interest"
                type="text"
                placeholder="e.g. Rust, Web3, GenAI"
                value={interestVector}
                onChange={(e) => setInterestVector(e.target.value)}
                required
                className="px-4 py-2.5 border border-gray-200 rounded-md bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Target Sector Field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="sector" className="text-sm font-medium text-gray-700">
                Target Sector
              </label>
              <input
                id="sector"
                type="text"
                placeholder="e.g. Vercel, Stripe, or specific repo"
                value={targetSector}
                onChange={(e) => setTargetSector(e.target.value)}
                required
                className="px-4 py-2.5 border border-gray-200 rounded-md bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Initialize Button */}
            <button
              type="submit"
              className="w-full mt-8 px-4 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-900 active:bg-black transition-colors duration-200"
            >
              INITIALIZE SCAN
            </button>
          </form>
        </div>
      ) : (
        <div className="progress-container w-full max-w-md px-8">
          <div className="space-y-3">
            <div className="text-sm text-gray-600 text-center font-medium">Scanning Signal Parameters...</div>
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-black rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 text-center">{Math.floor(progress)}%</div>
          </div>
        </div>
      )}
    </main>
  )
}
