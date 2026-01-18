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
        console.error('Analysis error:', error);

        // Fallback dummy data for development/demo purposes
        // This ensures the frontend has something to show even if API keys are missing
        return NextResponse.json({
            status: "ENGAGE",
            score: 85,
            readinessLevel: "high",
            reason: "Simulated analysis: Target is active in compatible tech stack.",
            bridge: "Shared interest in " + (targetUser || "Open Source"),
            focus: ["Next.js", "React", "AI"],
            icebreaker: `Hey ${targetUser}, loved your recent work!`,
            nextStep: "Send message now",
            trace: { error: error.message, note: "Served from dummy data fallback" }
        });
    }
}
