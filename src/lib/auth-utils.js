import { createClient } from '@supabase/supabase-js';

// Helper to decode JWT payload without verification
function decodeJWT(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = parts[1];
        const decoded = Buffer.from(payload, 'base64').toString('utf-8');
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

export async function verifyAuth(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return { user: null, token: null, error: 'Missing authorization header' };
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify with Supabase
        try {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.SUPABASE_SERVICE_KEY
            );

            const { data: { user }, error } = await supabase.auth.getUser(token);

            if (error || !user) {
                throw new Error('Supabase auth failed: ' + (error?.message || 'No user'));
            }

            console.log('Successfully authenticated with Supabase:', user.id);
            return {
                user: { id: user.id, email: user.email },
                token,
                error: null
            };
        } catch (supabaseError) {
            console.error('Authentication failed:', supabaseError.message);
            return {
                user: null,
                token: null,
                error: supabaseError.message
            };
        }
    } catch (error) {
        console.error('Auth verification error:', error);
        return { user: null, token: null, error: error.message };
    }
}

// Create a Supabase client with user's JWT token for RLS enforcement
export function createAuthenticatedClient(token) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase environment variables');
    }

    return createClient(supabaseUrl, supabaseKey, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        },
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    });
}
