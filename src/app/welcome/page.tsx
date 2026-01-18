"use client";

import { useRouter } from "next/navigation";
import { Github, Target, TrendingUp, Users, ArrowRight } from "lucide-react";

export default function WelcomePage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <Target className="h-8 w-8 text-gray-900" />
                            <h1 className="text-2xl font-bold text-gray-900">Signal Now</h1>
                        </div>
                        <button
                            onClick={() => router.push('/auth')}
                            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Find the Perfect Moment to
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Connect</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Signal Now analyzes GitHub activity to tell you exactly when developers, maintainers,
                        and teams are most receptive to networking opportunities.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => router.push('/auth')}
                            className="flex items-center space-x-2 px-8 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors text-lg font-semibold"
                        >
                            <Github className="h-5 w-5" />
                            <span>Sign in with GitHub</span>
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            <TrendingUp className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Analysis</h3>
                        <p className="text-gray-600">
                            Our AI analyzes recent commits, issues, and activity patterns to determine
                            the best time to reach out.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <Target className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Targeted Outreach</h3>
                        <p className="text-gray-600">
                            Get personalized icebreaker messages and connection strategies based on
                            shared interests and recent activity.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                            <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Track Anyone</h3>
                        <p className="text-gray-600">
                            Monitor individual developers, entire organizations, or specific repositories
                            for networking opportunities.
                        </p>
                    </div>
                </div>

                {/* How it Works */}
                <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                1
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Add Targets</h3>
                            <p className="text-gray-600 text-sm">
                                Add GitHub users, organizations, or repositories to your watchlist.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                2
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
                            <p className="text-gray-600 text-sm">
                                Our AI analyzes activity patterns, tech stack overlap, and timing.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                3
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Get Signals</h3>
                            <p className="text-gray-600 text-sm">
                                Receive readiness scores and personalized outreach recommendations.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                4
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Connect</h3>
                            <p className="text-gray-600 text-sm">
                                Use our suggested messages and timing to make meaningful connections.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center mt-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Ready to Network Smarter?
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                        Join developers who are already using Signal Now to build better professional
                        relationships in the open source community.
                    </p>
                    <button
                        onClick={() => router.push('/auth')}
                        className="flex items-center space-x-2 px-8 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors text-lg font-semibold mx-auto"
                    >
                        <Github className="h-5 w-5" />
                        <span>Get Started Free</span>
                        <ArrowRight className="h-5 w-5" />
                    </button>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center text-gray-500">
                        <p>&copy; 2026 Signal Now. Built for the hackathon community.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}