// Temporary mock database for development
let mockWatchlist = [
    {
        id: 1,
        user_id: '00000000-0000-0000-0000-000000000001',
        target_type: 'username',
        target_value: 'sapphire',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 2,
        user_id: '00000000-0000-0000-0000-000000000001',
        target_type: 'username',
        target_value: 'gvanrossum',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 3,
        user_id: '00000000-0000-0000-0000-000000000001',
        target_type: 'repo',
        target_value: 'facebook/react',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];
let mockAnalysisResults = [];

export const mockDb = {
    // Watchlist operations
    getWatchlist: async (userId) => {
        console.log('Mock DB: Getting watchlist for user:', userId);
        console.log('Mock DB: Current watchlist:', mockWatchlist);
        const userItems = mockWatchlist.filter(item => item.user_id === userId);
        console.log('Mock DB: User items:', userItems);
        return userItems;
    },

    addToWatchlist: async (userId, targetType, targetValue) => {
        const newItem = {
            id: Date.now(),
            user_id: userId,
            target_type: targetType,
            target_value: targetValue.toLowerCase(),
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Check for duplicates
        const exists = mockWatchlist.find(
            item => item.user_id === userId &&
                item.target_value === targetValue.toLowerCase() &&
                item.target_type === targetType
        );

        if (exists) {
            throw new Error('Item already exists in watchlist');
        }

        mockWatchlist.push(newItem);
        return newItem;
    },

    removeFromWatchlist: async (userId, targetValue) => {
        const initialLength = mockWatchlist.length;
        mockWatchlist = mockWatchlist.filter(
            item => !(item.user_id === userId && item.target_value === targetValue.toLowerCase())
        );
        return mockWatchlist.length < initialLength;
    },

    // Analysis operations
    analyzeWatchlist: async (userId) => {
        console.log('Mock DB: Analyzing watchlist for user:', userId);
        const userWatchlist = await mockDb.getWatchlist(userId);
        console.log('Mock DB: User watchlist:', userWatchlist);

        const results = userWatchlist.map(item => ({
            target: item.target_value,
            type: item.target_type,
            decision: ['ENGAGE', 'WAIT', 'IGNORE'][Math.floor(Math.random() * 3)],
            readiness_score: Math.floor(Math.random() * 100),
            readinessLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            reasoning: `Mock analysis for ${item.target_value}. This is a simulated analysis result for development purposes.`,
            bridge: `Shared interest in ${item.target_type === 'repo' ? 'repository development' : 'open source'}`,
            focus: ['JavaScript', 'React', 'Node.js', 'TypeScript'].slice(0, Math.floor(Math.random() * 4) + 1),
            icebreaker: `Hey! I noticed your work on ${item.target_value}. Really impressive stuff!`,
            nextStep: 'Send message now',
            trace: {
                researcher: { activity_summary: 'Mock research data' },
                strategist: { readiness_score: Math.floor(Math.random() * 100) },
                ghostwriter: 'Mock icebreaker generation'
            }
        }));

        console.log('Mock DB: Generated results:', results);
        return results;
    }
};

// Check if we should use mock data - only if Supabase is completely unavailable
export const shouldUseMockData = () => {
    // Only use mock data if Supabase URL is missing
    return !process.env.NEXT_PUBLIC_SUPABASE_URL;
};