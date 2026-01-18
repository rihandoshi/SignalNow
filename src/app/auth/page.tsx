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
                            preferred_username: data.githubUsername
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
                router.push("/console");
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
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md p-6">
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Github className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Welcome to Signal Now
                        </h1>
                        <p className="text-gray-600">
                            {isSignUp ? "Create your account to start networking" : "Sign in to continue"}
                        </p>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-red-600 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {message && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                            <p className="text-green-600 text-sm font-medium">{message}</p>
                        </div>
                    )}

                    {/* GitHub OAuth Button */}
                    <button
                        onClick={handleGithubLogin}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center space-x-3 p-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all mb-6 font-medium shadow-sm"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Github className="h-5 w-5" />
                        )}
                        <span>Continue with GitHub</span>
                    </button>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500 font-medium">or</span>
                        </div>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    {...register("email")}
                                    type="email"
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder-gray-500"
                                    placeholder="Enter your email"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    {...register("password")}
                                    type="password"
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder-gray-500"
                                    placeholder="Enter your password"
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        {isSignUp && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    GitHub Username
                                </label>
                                <div className="relative">
                                    <Github className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <input
                                        {...register("githubUsername")}
                                        type="text"
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder-gray-500"
                                        placeholder="Your GitHub username"
                                    />
                                </div>
                                {errors.githubUsername && (
                                    <p className="mt-2 text-sm text-red-600">{errors.githubUsername.message}</p>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all font-medium shadow-sm"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <ChevronRight className="h-5 w-5" />
                            )}
                            <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                        </button>
                    </form>

                    {/* Toggle Sign Up/Sign In */}
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError(null);
                                setMessage(null);
                            }}
                            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            {isSignUp
                                ? "Already have an account? Sign in"
                                : "Don't have an account? Sign up"
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}