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
          // Save identity to LocalStorage so Dashboard can pick it up
          localStorage.setItem("signal_identity", identity)
          if (interestVector) localStorage.setItem("signal_interest", interestVector)
          if (targetSector) localStorage.setItem("signal_sector", targetSector)

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
    <main className="min-h-screen flex items-center justify-center bg-white">
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
        <div ref={cardRef} className="w-full max-w-lg p-10 bg-white rounded-3xl shadow-2xl border border-gray-100">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-2xl mx-auto flex items-center justify-center text-2xl font-bold shadow-lg mb-4">
              S
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Configure Your Signal</h1>
            <p className="text-gray-500">Set up your network parameters</p>
          </div>

          <form onSubmit={handleInitialize} className="space-y-6">
            <div className="flex flex-col gap-3">
              <label htmlFor="identity" className="text-sm font-semibold text-gray-700">
                GitHub Username
              </label>
              <input
                id="identity"
                type="text"
                placeholder="Enter your username"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                required
                className="px-5 py-3.5 border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label htmlFor="interest" className="text-sm font-semibold text-gray-700">
                Interest Vector
              </label>
              <input
                id="interest"
                type="text"
                placeholder="e.g. Rust, Web3, GenAI"
                value={interestVector}
                onChange={(e) => setInterestVector(e.target.value)}
                required
                className="px-5 py-3.5 border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label htmlFor="sector" className="text-sm font-semibold text-gray-700">
                Target Sector
              </label>
              <input
                id="sector"
                type="text"
                placeholder="e.g. Vercel, Stripe, or specific repo"
                value={targetSector}
                onChange={(e) => setTargetSector(e.target.value)}
                required
                className="px-5 py-3.5 border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-8 px-6 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 hover:shadow-xl active:scale-95 transition-all duration-200"
            >
              Initialize Scan
            </button>
          </form>
        </div>
      ) : (
        <div className="progress-container w-full max-w-md px-8">
          <div className="space-y-5">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl mx-auto flex items-center justify-center text-xl font-bold shadow-lg mb-4">
                S
              </div>
              <p className="text-lg text-gray-700 font-medium">Initializing signal scan...</p>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-gray-900 to-gray-700 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="text-sm text-gray-500 text-center font-medium">{Math.floor(progress)}%</div>
          </div>
        </div>
      )}
    </main>
  )
}
