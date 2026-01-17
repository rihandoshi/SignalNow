import { NextResponse } from 'next/server';
import { analyzeProfile } from '@/lib/agent';

export async function GET() {
    try {
        const result = await analyzeProfile("vercel");

        return NextResponse.json({
            status: "Target Acquired",
            data: result
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}