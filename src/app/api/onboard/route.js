import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_KEY || ""
);

export async function POST(request) {
    try {
        const body = await request.json();
        const { userId, github_username, goal, repositories, organizations, people } = body;

        if (!userId || !github_username) {
            return NextResponse.json(
                { error: 'userId and github_username required' },
                { status: 400 }
            );
        }

        // Upsert user profile
        const { data, error } = await supabase
            .from('profiles')
            .upsert(
                {
                    id: userId,
                    github_username,
                    goal: goal || "",
                    repositories: repositories || "",
                    organizations: organizations || "",
                    people: people || "",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'id' }
            )
            .select();

        if (error) {
            console.error('Onboard error:', error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Onboard error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
