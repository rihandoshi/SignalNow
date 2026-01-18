"use client";

import { WatchlistComponent } from '@/components/watchlist-component'; // Adjust import path if needed
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function WatchlistPage() {
    const router = useRouter();

    // Basic protected route check
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            // router.push('/auth');
        }
    }, []);

    return (
        <main className="min-h-screen bg-white">
            <header className="px-8 py-5 flex items-center border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <button
                    onClick={() => router.push('/')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-4"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-lg flex items-center justify-center font-bold text-sm">S</div>
                    <span className="font-semibold text-gray-900 text-lg">SignalNow Console</span>
                </div>
            </header>

            <div className="py-8">
                <WatchlistComponent />
            </div>
        </main>
    );
}
