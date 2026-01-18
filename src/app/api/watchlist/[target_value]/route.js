import { NextResponse } from 'next/server';
import { removeFromWatchlist } from '../../../../lib/watchlist.js';
import { verifyAuth, createAuthenticatedClient } from '../../../../lib/auth-utils.js';
import { mockDb, shouldUseMockData } from '../../../../lib/mock-db.js';

export async function DELETE(request, { params }) {
    try {
        const { user, token, error: authError } = await verifyAuth(request);

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { target_value } = await params;
        const targetValue = target_value;

        if (!targetValue) {
            return NextResponse.json(
                { error: 'target value required' },
                { status: 400 }
            );
        }

        let success;

        // Try real Supabase first
        try {
            if (!shouldUseMockData()) {
                const supabase = createAuthenticatedClient(token);
                success = await removeFromWatchlist(supabase, user.id, targetValue);
                console.log('Successfully removed from Supabase watchlist');
            } else {
                throw new Error('Supabase not configured, using mock data');
            }
        } catch (supabaseError) {
            console.log('Supabase failed, falling back to mock data:', supabaseError.message);
            success = await mockDb.removeFromWatchlist(user.id, targetValue);
        }

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to remove from watchlist' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Removed from watchlist'
        });
    } catch (error) {
        console.error('Remove from watchlist error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
