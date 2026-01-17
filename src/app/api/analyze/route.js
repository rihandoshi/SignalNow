import { NextResponse } from 'next/server';
import { analyzeProfile } from '../../../lib/agent';

export async function POST(request) {
    let targetUser = "Unknown";
    try {
        const body = await request.json();
        targetUser = body.targetUser || "Unknown";
        const { sourceUser } = body;

        if (!sourceUser || !targetUser) {
            return NextResponse.json(
                { error: 'Missing sourceUser or targetUser' },
                { status: 400 }
            );
        }

        const result = await analyzeProfile(sourceUser, targetUser);
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
