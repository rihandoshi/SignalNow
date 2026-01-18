"use client";

import { useState, useEffect } from 'react';
import { Loader2, Trash2, Search, Plus, BarChart2 } from 'lucide-react';

interface WatchlistItem {
    id: number;
    target_type: 'username' | 'org' | 'repo';
    target_value: string;
    is_active: boolean;
    created_at: string;
}

interface AnalysisResult {
    target: string;
    type: string;
    decision: string;
    readiness_score: number;
    readinessLevel: string;
    reasoning: string;
    icebreaker: string | null;
}

export function WatchlistComponent() {
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [newItemType, setNewItemType] = useState<'username' | 'org' | 'repo'>('username');
    const [newItemValue, setNewItemValue] = useState('');
    const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchWatchlist();
    }, []);

    const getToken = () => localStorage.getItem('authToken');

    const fetchWatchlist = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getToken();
            if (!token) throw new Error("No auth token found");

            const res = await fetch('/api/watchlist', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) {
                throw new Error("Unauthorized - Please log in again");
            }

            const data = await res.json();
            if (data.data) {
                setWatchlist(data.data);
            } else {
                throw new Error(data.error || "Failed to fetch");
            }
        } catch (err: any) {
            setError(err.message);
            console.error('Failed to fetch watchlist:', err);
        } finally {
            setLoading(false);
        }
    };

    const addToWatchlist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemValue) return;

        try {
            const token = getToken();
            if (!token) throw new Error("No auth token found");

            const res = await fetch('/api/watchlist', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ target_type: newItemType, target_value: newItemValue })
            });
            const data = await res.json();
            if (data.success) {
                setNewItemValue('');
                fetchWatchlist(); // Refresh list
            } else {
                setError(data.error);
            }
        } catch (err: any) {
            setError(err.message);
            console.error('Failed to add to watchlist:', err);
        }
    };

    const removeFromWatchlist = async (targetValue: string) => {
        try {
            const token = getToken();
            if (!token) throw new Error("No auth token found");

            // Note: Using targetValue in URL as per fixed API
            const res = await fetch(`/api/watchlist/${encodeURIComponent(targetValue)}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                fetchWatchlist(); // Refresh list
            } else {
                setError(data.error);
            }
        } catch (err: any) {
            setError(err.message);
            console.error('Failed to remove from watchlist:', err);
        }
    };

    const analyzeWatchlist = async () => {
        setAnalyzing(true);
        setAnalysisResults([]);
        setError(null);
        try {
            const token = getToken();
            if (!token) throw new Error("No auth token found");

            const res = await fetch('/api/analyze-watchlist', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setAnalysisResults(data.results);
            } else {
                setError(data.error || data.message);
            }
        } catch (err: any) {
            setError(err.message);
            console.error('Failed to analyze watchlist:', err);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 space-y-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Your Watchlist</h2>
                    <p className="text-gray-500">Track and analyze high-signal developer activity.</p>
                </div>
                <button
                    onClick={analyzeWatchlist}
                    disabled={analyzing || watchlist.length === 0}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                    {analyzing ? <Loader2 className="animate-spin w-4 h-4" /> : <BarChart2 className="w-4 h-4" />}
                    Run Analysis
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-2">
                    <span>⚠️</span> {error}
                </div>
            )}

            {/* Add Item Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <form onSubmit={addToWatchlist} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-shrink-0">
                        <select
                            value={newItemType}
                            onChange={(e) => setNewItemType(e.target.value as any)}
                            className="w-full md:w-auto px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50 text-gray-700 font-medium"
                        >
                            <option value="username">User</option>
                            <option value="org">Organization</option>
                            <option value="repo">Repository</option>
                        </select>
                    </div>
                    <div className="flex-grow relative">
                        <input
                            type="text"
                            value={newItemValue}
                            onChange={(e) => setNewItemValue(e.target.value)}
                            placeholder={newItemType === 'repo' ? "owner/repo" : "username"}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 placeholder:text-gray-400"
                        />
                        <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                    </div>
                    <button
                        type="submit"
                        disabled={!newItemValue}
                        className="px-6 py-3 bg-gray-100 text-gray-900 font-semibold rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add
                    </button>
                </form>
            </div>

            {/* Watchlist Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin w-8 h-8 text-gray-300" />
                </div>
            ) : watchlist.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-500">Your watchlist is empty. Add a target to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {watchlist.map(item => (
                        <div key={item.id} className="group p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${item.target_type === 'username' ? 'bg-blue-50 text-blue-700' :
                                        item.target_type === 'org' ? 'bg-purple-50 text-purple-700' :
                                            'bg-orange-50 text-orange-700'
                                    }`}>
                                    {item.target_type}
                                </span>
                                <button
                                    onClick={() => removeFromWatchlist(item.target_value)}
                                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 truncate" title={item.target_value}>
                                {item.target_value}
                            </h3>
                            <p className="text-xs text-gray-400 mt-2">Added {new Date(item.created_at).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Analysis Results */}
            {analysisResults.length > 0 && (
                <div className="space-y-6 pt-6 border-t border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">Analysis Results</h3>
                    <div className="space-y-4">
                        {analysisResults.map((result, idx) => (
                            <div key={idx} className={`p-6 rounded-2xl border-l-4 shadow-sm bg-white ${result.decision === 'ENGAGE' ? 'border-l-green-500' :
                                    result.decision === 'WAIT' ? 'border-l-yellow-500' :
                                        'border-l-gray-300'
                                }`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900">{result.target}</h4>
                                        <span className="text-sm text-gray-500 capitalize">{result.type}</span>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${result.decision === 'ENGAGE' ? 'bg-green-100 text-green-700' :
                                            result.decision === 'WAIT' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                        }`}>
                                        {result.decision}
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <p className="text-gray-700">{result.reasoning}</p>
                                    {result.icebreaker && (
                                        <div className="p-3 bg-gray-50 rounded-lg mt-3 text-sm text-gray-600 italic border border-gray-100">
                                            "{result.icebreaker}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}
