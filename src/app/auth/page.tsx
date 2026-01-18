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
                const { error } = await supabase.auth.signUp({
                    email: data.email,
                    password: data.password,
                });
                if (error) throw error;
                setMessage("Check your email for the confirmation link!");
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email: data.email,
                    password: data.password,
                });
                if (error) throw error;
                router.push("/");
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
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-black">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800"
            >
                <div className="p-8">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {isSignUp ? "Create an account" : "Welcome back"}
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {isSignUp
                                ? "Enter your email to get started"
                                : "Please enter your details to sign in"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <input
                                    {...register("email")}
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-10 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-blue-500"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <input
                                    {...register("password")}
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-10 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-blue-500"
                                />
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-500">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="rounded-lg bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20"
                            >
                                {error}
                            </motion.div>
                        )}

                        {message && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="rounded-lg bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/20"
                            >
                                {message}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 dark:focus:ring-offset-zinc-900"
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    {isSignUp ? "Sign Up" : "Sign In"}
                                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200 dark:border-zinc-700" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500 dark:bg-zinc-900">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleGithubLogin}
                        disabled={isLoading}
                        className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700 dark:focus:ring-zinc-700 dark:focus:ring-offset-zinc-900"
                    >
                        <Github className="mr-2 h-4 w-4" />
                        GitHub
                    </button>

                    <div className="mt-8 text-center text-sm">
                        <p className="text-gray-600 dark:text-gray-400">
                            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                            <button
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setError(null);
                                    setMessage(null);
                                }}
                                className="font-medium text-blue-600 hover:text-blue-500 hover:underline dark:text-blue-400"
                            >
                                {isSignUp ? "Sign in" : "Sign up"}
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
