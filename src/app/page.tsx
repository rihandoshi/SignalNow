import Link from "next/link";
import { ArrowRight, Github, Zap, Search, MessageSquare, Activity, CheckCircle, TrendingUp } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                                <Activity className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight">Signal Now</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/auth"
                                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/auth"
                                className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                            >
                                Get Started
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full mb-8">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-sm font-medium text-gray-600">v1.0 Now Live</span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-8 leading-tight">
                            Stop Cold Emailing. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">Start Connecting.</span>
                        </h1>

                        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                            Signal Now monitors GitHub activity to find the perfect moment to reach out.
                            We identify high-intent leads based on their real-time code contributions.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link
                                href="/auth"
                                className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                            >
                                <Github className="mr-2 h-5 w-5" />
                                Start Analyzing Free
                            </Link>
                            <Link
                                href="#how-it-works"
                                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center"
                            >
                                View Demo
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Grid */}
            <section id="how-it-works" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                                <Search className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Discovery</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Track organizations or repositories. We automatically find active contributors who align with your goals.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6">
                                <TrendingUp className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Signal Analysis</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Our AI analyzes commit history to detect "Momentum Shifts" and "Readiness Scores" for every lead.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-6">
                                <MessageSquare className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Ghostwriter</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Generate hyper-personalized outreach messages based on their specific recent code changes.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Ready to supercharge your outreach?</h2>
                    <Link
                        href="/auth"
                        className="inline-flex items-center px-8 py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
                    >
                        Get Started Now
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-gray-500 text-sm">
                    <div>© 2024 Signal Now. All rights reserved.</div>
                    <div className="flex space-x-6">
                        <a href="#" className="hover:text-gray-900">Privacy</a>
                        <a href="#" className="hover:text-gray-900">Terms</a>
                        <a href="#" className="hover:text-gray-900">Twitter</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
