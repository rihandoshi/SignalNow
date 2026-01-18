import { NextResponse } from 'next/server';
import { removeFromWatchlist } from '../../../../lib/watchlist.js';
import { verifyAuth, createAuthenticatedClient } from '../../../../lib/auth-utils.js';

export async function DELETE(request, { params }) {
    try {
        const { user, token, error: authError } = await verifyAuth(request);

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Await params to get the target_value
        const { target_value } = await params;
        const targetValue = target_value;

        if (!targetValue) {
            return NextResponse.json(
                { error: 'target value required' },
                { status: 400 }
            );
        }

        const supabase = createAuthenticatedClient(token);
        const success = await removeFromWatchlist(supabase, user.id, targetValue);

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
