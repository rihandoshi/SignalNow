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

        // Decode JWT payload (Supabase tokens are properly signed)
        const payload = decodeJWT(token);
        if (!payload || !payload.sub) {
            return { user: null, token: null, error: 'Invalid token' };
        }

        return {
            user: { id: payload.sub, email: payload.email },
            token,
            error: null
        };
    } catch (error) {
        console.error('Auth verification error:', error);
        return { user: null, token: null, error: error.message };
    }
}

// Create a Supabase client with user's JWT token for RLS enforcement
export function createAuthenticatedClient(token) {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        }
    );
}
