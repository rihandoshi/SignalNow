import { NextResponse } from 'next/server';
import { verifyAuth, createAuthenticatedClient } from '../../../lib/auth-utils';

export async function POST(request) {
    try {
        const { user, token, error: authError } = await verifyAuth(request);

        if (authError || !user) {
            return NextResponse.json(
                { error: authError || 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { github_username, goal, repositories, organizations, people } = body;

        // Note: We use the authenticated user.id from verifyAuth, not from the body
        // This prevents users from updating other users' profiles

        if (!github_username) {
            return NextResponse.json(
                { error: 'github_username required' },
                { status: 400 }
            );
        }

        const supabase = createAuthenticatedClient(token);

        // Upsert user profile with all onboarding fields
        // Used 'upsert' to insert or update the record
        const { data, error } = await supabase
            .from('profiles')
            .upsert(
                {
                    id: user.id, // 'profiles' table uses 'id' as primary key usually, let's check schema/screenshot. 
                    // Screenshot shows 'id' as uuid. 
                    // In previous code (original), it used 'id: userId'. 
                    // In my 'user_profiles' attempt, I used 'user_id: user.id'.
                    // The schema.sql showed 'user_profiles' with 'user_id'.
                    // BUT the screenshot shows 'profiles' table. 
                    // Let's assume 'profiles' uses 'id' as the user references, or maybe it has 'id' AND 'user_id'?
                    // Screenshot shows: id (uuid), email (text), github_username (text), goal (text).
                    // It does NOT show 'user_id'. 
                    // So 'id' is likely the foreign key to auth.users OR it is the primary key and same as auth.users.id.
                    // Given it's Supabase 'profiles' pattern, 'id' is usually the user_id.

                    // id: user.id (Using 'id' as it maps to the auth.users id according to Supabase patterns and likely matches 'id' column in screenshot which is uuid)
                    id: user.id,
                    email: user.email,
                    github_username: github_username,
                    goal: goal
                    // updated_at removed as it might not distinguish in the screenshot or schema
                },
                { onConflict: 'id' }
            )
            .select();

        if (error) {
            console.error('Profile update error:', error);
            // If error is about missing columns, we might need to alert the user, but for now just return error.
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        // NOW, let's handle the Watchlist items (Repos, Orgs, People)
        // This is likely what is expected since there are no columns for them in user_profiles

        // Helper to add bulk to watchlist
        const addToWatchlist = async (items, type) => {
            if (!items) return;
            const targets = items.split(',').map(s => s.trim()).filter(s => s.length > 0);
            if (targets.length === 0) return;

            const toInsert = targets.map(t => ({
                user_id: user.id,
                target_type: type,
                target_value: t.toLowerCase() // normalize
            }));

            const { error } = await supabase.from('user_watchlist').upsert(
                toInsert,
                { onConflict: 'user_id, target_type, target_value', ignoreDuplicates: true }
            );

            if (error) console.error(`Error adding ${type} to watchlist:`, error);
        };

        await Promise.all([
            addToWatchlist(repositories, 'repo'),
            addToWatchlist(organizations, 'org'),
            addToWatchlist(people, 'username')
        ]);

        return NextResponse.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Onboard error:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + error.message },
            { status: 500 }
        );
    }
}
