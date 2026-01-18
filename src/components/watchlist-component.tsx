"use client";

import { useState } from 'react';
import { Loader2, Trash2, Plus, User, Building, GitBranch, Search } from 'lucide-react';

interface WatchlistItem {
    id: number;
    target_type: 'username' | 'org' | 'repo';
    target_value: string;
    is_active: boolean;
    created_at: string;
}

interface WatchlistComponentProps {
    watchlist: WatchlistItem[];
    onUpdate: () => void;
}

export function WatchlistComponent({ watchlist, onUpdate }: WatchlistComponentProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newItemType, setNewItemType] = useState<'username' | 'org' | 'repo'>('username');
    const [newItemValue, setNewItemValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getToken = () => localStorage.getItem('authToken');

    const addToWatchlist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemValue.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const token = getToken();
            if (!token) throw new Error("No auth token found");

            const res = await fetch('/api/watchlist', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    target_type: newItemType,
                    target_value: newItemValue.trim()
                })
            });

            const data = await res.json();
            if (data.success) {
                setNewItemValue('');
                setIsAdding(false);
                onUpdate();
            } else {
                setError(data.error || 'Failed to add item');
            }
        } catch (err: any) {
            setError(err.message);
            console.error('Failed to add to watchlist:', err);
        } finally {
            setLoading(false);
        }
    };

    const removeFromWatchlist = async (targetValue: string) => {
        try {
            const token = getToken();
            if (!token) throw new Error("No auth token found");

            const res = await fetch(`/api/watchlist/${encodeURIComponent(targetValue)}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (data.success) {
                onUpdate();
            } else {
                setError(data.error || 'Failed to remove item');
            }
        } catch (err: any) {
            setError(err.message);
            console.error('Failed to remove from watchlist:', err);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'username': return <User className="h-4 w-4" />;
            case 'org': return <Building className="h-4 w-4" />;
            case 'repo': return <GitBranch className="h-4 w-4" />;
            default: return <User className="h-4 w-4" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'username': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'org': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'repo': return 'bg-green-50 text-green-700 border-green-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="space-y-4">
            {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                    {error}
                </div>
            )}

            {/* Add Item Form */}
            {isAdding ? (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Add to Watchlist</h3>
                    <form onSubmit={addToWatchlist} className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                            {(['username', 'org', 'repo'] as const).map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setNewItemType(type)}
                                    className={`flex items-center justify-center space-x-1 p-2 rounded-lg border transition-all text-xs font-medium ${newItemType === type
                                            ? 'border-blue-300 bg-blue-100 text-blue-700'
                                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    {getTypeIcon(type)}
                                    <span className="capitalize">{type}</span>
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                value={newItemValue}
                                onChange={(e) => setNewItemValue(e.target.value)}
                                placeholder={newItemType === 'repo' ? "owner/repo" : `Enter ${newItemType} name`}
                                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                autoFocus
                            />
                        </div>
                        <div className="flex space-x-2">
                            <button
                                type="submit"
                                disabled={!newItemValue.trim() || loading}
                                className="flex-1 flex items-center justify-center space-x-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
                                <span>Add</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsAdding(false);
                                    setNewItemValue('');
                                    setError(null);
                                }}
                                className="px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-blue-200 rounded-lg text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                >
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <Plus className="h-3 w-3" />
                    </div>
                    <div className="text-sm">
                        <div className="font-medium">Add to watchlist</div>
                    </div>
                </button>
            )}

            {/* Watchlist Items */}
            <div className="space-y-2">
                {watchlist.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Search className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium text-sm">No items yet</p>
                        <p className="text-xs text-gray-400 mt-1">Add people to start tracking</p>
                    </div>
                ) : (
                    watchlist.map(item => (
                        <div key={item.id} className="group bg-white rounded-lg p-3 border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <img
                                        src={item.target_type === 'username' ? `https://github.com/${item.target_value}.png` : `https://ui-avatars.com/api/?name=${item.target_value}&background=f3f4f6&color=374151&size=32`}
                                        alt={item.target_value}
                                        className="w-8 h-8 rounded-full border border-gray-200"
                                        onError={(e) => {
                                            e.target.src = `https://ui-avatars.com/api/?name=${item.target_value}&background=f3f4f6&color=374151&size=32`
                                        }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <h3 className="text-sm font-medium text-gray-900 truncate" title={item.target_value}>
                                            {item.target_value}
                                        </h3>
                                        <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(item.target_type)}`}>
                                            {getTypeIcon(item.target_type)}
                                            <span className="capitalize">{item.target_type}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Added {new Date(item.created_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: new Date(item.created_at).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                                        })}
                                    </p>
                                </div>
                                <button
                                    onClick={() => removeFromWatchlist(item.target_value)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                                    title="Remove from watchlist"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}