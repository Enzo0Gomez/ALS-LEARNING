import { useState } from "react";
import { supabase } from "../lib/supabase";
import PasswordInput from "./PasswordInput";

function Login({
    onSignUp,
    onAdminLogin,
    onTeacherLogin,
    onStudentLogin,
}) {
    const [loginType, setLoginType] = useState("student");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            // 1. Login through Supabase Authentication
            const { data: authData, error: authError } =
                await supabase.auth.signInWithPassword({
                    email: username,
                    password: password,
                });

            if (authError) {
                if (
                    authError.message
                        ?.toLowerCase()
                        .includes("email not confirmed")
                ) {
                    throw new Error(
                        "Your email has not been verified yet. Please check your inbox for the verification link."
                    );
                }

                throw new Error("Invalid email or password.");
            }

            const user = authData.user;

            if (!user) {
                throw new Error("Unable to get user information.");
            }

            // 2. Get user's role from profiles
            const { data: profile, error: profileError } =
                await supabase
                    .from("profiles")
                    .select("id, first_name, last_name, role")
                    .eq("id", user.id)
                    .single();

            if (profileError || !profile) {
                throw new Error(
                    "Your account profile was not found."
                );
            }

            // 3. Check selected login type
            if (
                profile.role !== "admin" &&
                profile.role !== loginType
            ) {
                await supabase.auth.signOut();

                throw new Error(
                    `This account is registered as ${profile.role}. Please select "${profile.role}" to login.`
                );
            }

            // 4. Redirect according to actual role
            if (profile.role === "admin") {
                onAdminLogin(profile);
            } else if (profile.role === "teacher") {
                onTeacherLogin(profile);
            } else if (profile.role === "student") {
                onStudentLogin(profile);
            }
        } catch (error) {
            console.error("Login error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main id="login" className="min-h-screen bg-bg">
            <div className="flex min-h-screen">

                {/* Left Side */}
                <div className="flex-col justify-between hidden w-1/2 p-12 text-white bg-primary lg:flex">

                    <div className="max-w-lg">
                        <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-white/60">
                            Welcome back
                        </p>

                        <h1 className="text-5xl font-bold leading-tight">
                            Continue your learning journey.
                        </h1>

                        <p className="mt-6 text-lg leading-8 text-white/75">
                            Access your learning materials, modules, quizzes,
                            and track your progress through the ALS Learning Hub.
                        </p>
                    </div>

                    <p className="text-sm text-white/50">
                        © 2026 ALS Learning Hub
                    </p>
                </div>

                {/* Right Side */}
                <div className="flex items-center justify-center w-full px-4 py-8 sm:px-6 sm:py-12 lg:w-1/2">

                    <div className="w-full max-w-md">

                        {/* Header */}
                        <div className="mb-8 text-center lg:text-left">

                            <p className="text-2xl font-bold text-primary lg:hidden">
                                ALS Learning Hub
                            </p>

                            <h2 className="mt-6 text-3xl font-bold text-ink">
                                Welcome back
                            </h2>

                            <p className="mt-2 text-ink-soft">
                                Sign in to continue to your account.
                            </p>

                        </div>

                        {/* Account Type */}
                        <div className="mb-6">

                            <p className="mb-3 text-sm font-semibold text-ink">
                                Login as
                            </p>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setLoginType("teacher");
                                        setError("");
                                    }}
                                    className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                        loginType === "teacher"
                                            ? "border-primary bg-tint-blue text-primary"
                                            : "border-border bg-surface text-ink-soft hover:bg-bg"
                                    }`}
                                >
                                    Teacher
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setLoginType("student");
                                        setError("");
                                    }}
                                    className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                        loginType === "student"
                                            ? "border-primary bg-tint-blue text-primary"
                                            : "border-border bg-surface text-ink-soft hover:bg-bg"
                                    }`}
                                >
                                    Student
                                </button>

                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 mb-5 text-sm text-red-600 border border-red-200 rounded-xl bg-red-50">
                                {error}
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Email */}
                            <div>

                                <label
                                    htmlFor="username"
                                    className="block mb-2 text-sm font-semibold text-ink"
                                >
                                    Email
                                </label>

                                <input
                                    id="username"
                                    type="email"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    placeholder="Enter your email"
                                    required
                                    className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-ink outline-none transition placeholder:text-ink-muted focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                                />

                            </div>

                            {/* Password */}
                            <div>

                                <div className="flex items-center justify-between mb-2">

                                    <label
                                        htmlFor="password"
                                        className="text-sm font-semibold text-ink"
                                    >
                                        Password
                                    </label>

                                    <button
                                        type="button"
                                        className="text-xs font-semibold text-highlight hover:underline"
                                    >
                                        Forgot password?
                                    </button>

                                </div>

                                <PasswordInput
                                    id="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Enter your password"
                                    required
                                    className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-ink outline-none transition placeholder:text-ink-muted focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                                />

                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-primary px-5 py-3.5 font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? "Logging in..." : "Login"}
                            </button>

                        </form>

                        {/* Signup */}
                        <div className="mt-8 text-sm text-center text-ink-soft">

                            Don't have a student account yet?{" "}

                            <button
                                type="button"
                                onClick={onSignUp}
                                className="font-semibold text-primary hover:underline"
                            >
                                Sign up
                            </button>

                        </div>

                        {/* Teacher Notice */}
                        {loginType === "teacher" && (
                            <div className="p-4 mt-6 border rounded-xl border-border bg-bg-alt">

                                <p className="text-xs leading-5 text-ink-soft">
                                    Teacher accounts are created and managed
                                    by the ALS administrator. Student
                                    registration is available through the
                                    Sign Up page.
                                </p>

                            </div>
                        )}

                    </div>
                </div>
            </div>
        </main>
    );
}

export default Login;