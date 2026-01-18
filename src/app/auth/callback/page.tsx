"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Auth callback error:', error);
                    router.push('/auth?error=callback_failed');
                    return;
                }

                if (data.session) {
                    // Store token for API calls
                    localStorage.setItem('authToken', data.session.access_token);

                    // Check if user has completed onboarding
                    const userMetadata = data.session.user.user_metadata;
                    const githubUsername = userMetadata?.user_name || userMetadata?.preferred_username;

                    if (githubUsername) {
                        // User has GitHub username, redirect to dashboard
                        router.push('/');
                    } else {
                        // Need to complete onboarding
                        router.push('/console');
                    }
                } else {
                    // No session, redirect to auth
                    router.push('/auth');
                }
            } catch (error) {
                console.error('Auth callback error:', error);
                router.push('/auth?error=callback_failed');
            }
        };

        handleAuthCallback();
    }, [router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-white">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Completing sign in...
                </h2>
                <p className="text-gray-500">
                    Please wait while we set up your account.
                </p>
            </div>
        </div>
    );
}