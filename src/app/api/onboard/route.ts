import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";

const onboardingSchema = z.object({
    github_username: z.string().min(1, "GitHub username is required"),
    goal: z.string().min(1, "Goal is required"),
    userId: z.string().uuid("Invalid user ID"),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate request body
        const result = onboardingSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Validation failed", details: result.error.errors },
                { status: 400 }
            );
        }

        const { github_username, goal, userId } = result.data;

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing Supabase credentials");
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { error } = await supabase
            .from("profiles")
            .upsert({
                id: userId,
                github_username,
                goal,
            });

        if (error) {
            console.error("Supabase error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Onboarding error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({ message: "Onboarding API ready" });
}
