"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Lock, Mail, ChevronRight, Github } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const authSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    githubUsername: z.string().optional().or(z.literal('')),
}).refine((data) => {
    // If it's a signup (we can't easily check isSignUp state here in pure zod without passing it, 
    // but we can check if it's empty when we need it in the component or just make it optional and validate manually/conditionally)
    // For simplicity, let's keep it optional in schema and validate in onSubmit if isSignUp is true.
    return true;
});

type AuthFormData = z.infer<typeof authSchema>;

export default function AuthPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AuthFormData>({
        resolver: zodResolver(authSchema),
    });

    const onSubmit = async (data: AuthFormData) => {
        setIsLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isSignUp) {
                if (!data.githubUsername) {
                    throw new Error("GitHub Username is required for sign up");
                }
                const { error } = await supabase.auth.signUp({
                    email: data.email,
                    password: data.password,
                    options: {
                        data: {
                            user_name: data.githubUsername,
                            preferred_username: data.githubUsername // Compatibility
                        }
                    }
                });
                if (error) throw error;
                setMessage("Check your email for the confirmation link!");
            } else {
                const { data: { session }, error } = await supabase.auth.signInWithPassword({
                    email: data.email,
                    password: data.password,
                });
                if (error) throw error;
                if (session?.access_token) {
                    localStorage.setItem('authToken', session.access_token);
                }
                router.push("/console"); // Redirect to onboarding/console
                router.refresh();
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGithubLogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "github",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (e: any) {
            setError(e.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-white">
            <style>{`
        @keyframes fadeOutDown {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(40px);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg p-10 bg-white rounded-3xl shadow-2xl border border-gray-100"
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-2xl mx-auto flex items-center justify-center text-2xl font-bold shadow-lg mb-4">
                        S
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {isSignUp ? "Create Account" : "Welcome Back"}
                    </h1>
                    <p className="text-gray-500">
                        {isSignUp
                            ? "Join the high-signal network"
                            : "Sign in to access your dashboard"}
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label
                            htmlFor="email"
                            className="text-sm font-semibold text-gray-700"
                        >
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                {...register("email")}
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                className="w-full pl-12 pr-5 py-3.5 border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-xs text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    {isSignUp && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="githubUsername"
                                    className="text-sm font-semibold text-gray-700"
                                >
                                    GitHub Username
                                </label>
                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                                    Required for analysis
                                </span>
                            </div>

                            <div className="relative">
                                <Github className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                <input
                                    {...register("githubUsername")}
                                    id="githubUsername"
                                    type="text"
                                    placeholder="your-github-handle"
                                    className="w-full pl-12 pr-5 py-3.5 border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className="text-sm font-semibold text-gray-700"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                {...register("password")}
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="w-full pl-12 pr-5 py-3.5 border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
                            />
                        </div>
                        {errors.password && (
                            <p className="text-xs text-red-500">{errors.password.message}</p>
                        )}
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100"
                        >
                            {error}
                        </motion.div>
                    )}

                    {message && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="rounded-xl bg-green-50 p-4 text-sm text-green-600 border border-green-100"
                        >
                            {message}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 hover:shadow-xl active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:hover:shadow-none disabled:active:scale-100"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                {isSignUp ? "Sign Up" : "Sign In"}
                                <ChevronRight className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-100" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-4 text-gray-400 font-medium">
                            Or continue with
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleGithubLogin}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-200 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                >
                    <Github className="h-5 w-5" />
                    GitHub
                </button>

                <div className="mt-8 text-center text-sm">
                    <p className="text-gray-500">
                        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError(null);
                                setMessage(null);
                            }}
                            className="font-semibold text-gray-900 hover:underline"
                        >
                            {isSignUp ? "Sign in" : "Sign up"}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
