import { NextResponse } from 'next/server';
import { getWatchlist } from '../../../lib/watchlist.js';
import { analyzeProfile } from '../../../lib/agent.js';
import { verifyAuth, createAuthenticatedClient } from '../../../lib/auth-utils.js';

export async function GET(request) {
    try {
        const { user, token, error: authError } = await verifyAuth(request);

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user's watchlist
        const supabase = createAuthenticatedClient(token);
        const watchlist = await getWatchlist(supabase, user.id);

        if (watchlist.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'Watchlist is empty',
                results: []
            });
        }

        // Analyze each target in parallel
        const analysisPromises = watchlist.map(item =>
            analyzeProfile(user.id, item.target_value)
                .then(result => ({
                    target: item.target_value,
                    type: item.target_type,
                    ...result
                }))
                .catch(error => ({
                    target: item.target_value,
                    type: item.target_type,
                    error: error.message,
                    timestamp: new Date().toISOString()
                }))
        );

        const results = await Promise.all(analysisPromises);

        // Sort by decision priority: ENGAGE > WAIT > IGNORE > NO_CHANGE
        const decisionPriority = { 'ENGAGE': 0, 'WAIT': 1, 'IGNORE': 2, 'NO_CHANGE': 3 };
        const sorted = results.sort((a, b) => {
            const aPriority = decisionPriority[a.decision] ?? 99;
            const bPriority = decisionPriority[b.decision] ?? 99;
            return aPriority - bPriority;
        });

        return NextResponse.json({
            success: true,
            count: results.length,
            results: sorted
        });
    } catch (error) {
        console.error('Batch analysis error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
