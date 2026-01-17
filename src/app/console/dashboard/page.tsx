"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { List, Grid3x3 } from "lucide-react"
import { ProfileCard } from "@/app/components/profile-card";

// Sample user data
const sampleUsers = [
  { id: 1, name: "Alex Johnson", email: "alex@nexus.dev", status: "Active", joined: "2024-01-15" },
  { id: 2, name: "Jordan Chen", email: "jordan@nexus.dev", status: "Active", joined: "2024-02-03" },
  { id: 3, name: "Morgan Lee", email: "morgan@nexus.dev", status: "Active", joined: "2024-02-18" },
  { id: 4, name: "Casey Williams", email: "casey@nexus.dev", status: "Inactive", joined: "2024-01-22" },
  { id: 5, name: "Riley Martinez", email: "riley@nexus.dev", status: "Active", joined: "2024-03-05" },
  { id: 6, name: "Taylor Brown", email: "taylor@nexus.dev", status: "Active", joined: "2024-03-12" },
]

// Sample profile data
const sampleProfiles = [
  {
    id: 1,
    name: "Sarah Mitchell",
    role: "Senior Engineer @ Vercel",
    avatar: "SM",
    isOnline: true,
    matchReason: "You both starred styled-components",
    readinessScore: 85,
    icebreaker:
      "const collaborate = () => {\n  const interests = ['typescript', 'design systems'];\n  return buildTogether(interests);\n};",
  },
  {
    id: 2,
    name: "Alex Chen",
    role: "DevOps @ Stripe",
    avatar: "AC",
    isOnline: true,
    matchReason: "Shared expertise in Web3 infrastructure",
    readinessScore: 92,
    icebreaker:
      "export async function startConversation() {\n  const synergy = await findCommonGround();\n  return synergy.potential;\n}",
  },
  {
    id: 3,
    name: "Jordan Lee",
    role: "AI/ML Researcher",
    avatar: "JL",
    isOnline: false,
    matchReason: "Both active contributors to GenAI OSS",
    readinessScore: 78,
    icebreaker: "function networkEffect(nodes) {\n  return nodes.map(connect)\n    .reduce(collaborate);\n}",
  },
]

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<"list" | "focus">("list")
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0)

  const handleDismiss = () => {
    setCurrentProfileIndex((prev) => (prev + 1) % sampleProfiles.length)
  }

  const handleConnect = () => {
    setCurrentProfileIndex((prev) => (prev + 1) % sampleProfiles.length)
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="px-8 py-6 flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900 tracking-tight">NEXUS</div>
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700">
            AJ
          </div>
        </div>
      </header>

      {/* Sub-Header Control Bar */}
      <div className="border-b border-gray-200 bg-white px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Signal Count */}
          <div className="text-sm font-medium text-gray-600">Found 12 Signals</div>

          {/* Right: View Toggle */}
          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-all ${
                viewMode === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <List size={18} />
              <span className="text-xs font-medium">List View</span>
            </button>
            <button
              onClick={() => setViewMode("focus")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-all ${
                viewMode === "focus" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Grid3x3 size={18} />
              <span className="text-xs font-medium">Focus View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-8 py-8">
        <AnimatePresence mode="wait">
          {viewMode === "list" ? (
            <motion.div
              key="list-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* List View: Data Table */}
              <div className="w-full overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 text-sm text-gray-900 font-medium">{user.name}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{user.email}</td>
                        <td className="py-4 px-4 text-sm">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.status === "Active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">{user.joined}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="focus-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center min-h-96"
            >
              <AnimatePresence mode="wait">
                <ProfileCard
                  key={sampleProfiles[currentProfileIndex].id}
                  profile={sampleProfiles[currentProfileIndex]}
                  onDismiss={handleDismiss}
                  onConnect={handleConnect}
                />
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
