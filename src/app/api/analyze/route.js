import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { analyzeProfile } from '../../../lib/agent';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_KEY || ""
);

export async function POST(request) {
    let targetUser = "Unknown";
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(request.headers.get('authorization')?.replace('Bearer ', ''));

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        targetUser = body.targetUser || "Unknown";

        if (!targetUser) {
            return NextResponse.json(
                { error: 'Missing targetUser' },
                { status: 400 }
            );
        }

        const result = await analyzeProfile(user.id, targetUser);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Analysis error:', error.message);
        return NextResponse.json(
            { error: error.message || 'Analysis failed. Please check your profile settings.' },
            { status: 500 }
        );
    }
}
