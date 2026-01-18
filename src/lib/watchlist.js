// Watchlist functions now accept a Supabase client with authenticated context

export async function getWatchlist(supabase, userId) {
    try {
        const { data, error } = await supabase
            .from('user_watchlist')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Watchlist fetch error:', error);
        return [];
    }
}

export async function addToWatchlist(supabase, userId, targetType, targetValue) {
    try {
        console.log('Adding to watchlist:', { userId, targetType, targetValue });

        const { data, error } = await supabase
            .from('user_watchlist')
            .insert({
                user_id: userId,
                target_type: targetType,
                target_value: targetValue.toLowerCase()
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase error details:', error);
            throw error;
        }

        console.log('Successfully added to watchlist:', data);
        return data;
    } catch (error) {
        console.error('Add to watchlist error:', error);
        throw error; // Re-throw to get better error info
    }
}

export async function removeFromWatchlist(supabase, userId, targetValue) {
    try {
        const { error } = await supabase
            .from('user_watchlist')
            .delete()
            .eq('user_id', userId)
            .eq('target_value', targetValue.toLowerCase());

        if (error) {
            console.error('Remove from watchlist error:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Remove from watchlist error:', error);
        return false;
    }
}

export async function toggleWatchlist(supabase, userId, targetValue, isActive) {
    try {
        const { error } = await supabase
            .from('user_watchlist')
            .update({ is_active: isActive })
            .eq('user_id', userId)
            .eq('target_value', targetValue.toLowerCase());

        if (error) {
            console.error('Toggle watchlist error:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Toggle watchlist error:', error);
        return false;
    }
}

export async function bulkAddToWatchlist(supabase, userId, targets) {
    try {
        const formattedTargets = targets.map(t => ({
            user_id: userId,
            target_type: t.target_type,
            target_value: t.target_value.toLowerCase()
        }));

        const { error } = await supabase
            .from('user_watchlist')
            .insert(formattedTargets);

        if (error) {
            console.error('Bulk add error:', error);
            return 0;
        }

        return targets.length;
    } catch (error) {
        console.error('Bulk add error:', error);
        return 0;
    }
}
