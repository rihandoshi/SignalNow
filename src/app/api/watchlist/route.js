import { NextResponse } from 'next/server';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '../../../lib/watchlist.js';
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

        const supabase = createAuthenticatedClient(token);
        const watchlist = await getWatchlist(supabase, user.id);
        return NextResponse.json({
            success: true,
            data: watchlist
        });
    } catch (error) {
        console.error('Get watchlist error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const { user, token, error: authError } = await verifyAuth(request);

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { target_type, target_value } = await request.json();

        if (!target_type || !target_value) {
            return NextResponse.json(
                { error: 'target_type and target_value required' },
                { status: 400 }
            );
        }

        if (!['username', 'repo', 'org'].includes(target_type)) {
            return NextResponse.json(
                { error: 'target_type must be one of: username, repo, org' },
                { status: 400 }
            );
        }

        const supabase = createAuthenticatedClient(token);
        const item = await addToWatchlist(supabase, user.id, target_type, target_value);
        if (!item) {
            return NextResponse.json(
                { error: 'Failed to add to watchlist' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Add to watchlist error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
