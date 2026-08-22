import { useState } from "react";

function Signup({ onLogin }) {
    const [formData, setFormData] = useState({
        lrn: "",
        name: "",
        username: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        setError("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        console.log(formData);

        // Supabase student registration will be connected here later.
    };

    return (
        <main className="min-h-screen bg-bg">
            <div className="flex min-h-screen">

                {/* Left Side */}
                <div className="flex-col justify-between hidden w-1/2 p-12 text-white bg-primary lg:flex">


                    <div className="max-w-lg">
                        <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-white/60">
                            Student Registration
                        </p>

                        <h1 className="text-5xl font-bold leading-tight">
                            Start your learning journey.
                        </h1>

                        <p className="mt-6 text-lg leading-8 text-white/75">
                            Create your student account and access learning
                            materials, modules, quizzes, and progress tracking.
                        </p>
                    </div>

                    <p className="text-sm text-white/50">
                        © 2026 ALS Learning Hub
                    </p>
                </div>

                {/* Right Side */}
                <div className="flex items-center justify-center w-full px-6 py-12 lg:w-1/2">
                    <div className="w-full max-w-md">

                        {/* Header */}
                        <div className="mb-8">
                            <p className="text-2xl font-bold text-primary lg:hidden">
                                ALS Learning Hub
                            </p>

                            <h2 className="mt-6 text-3xl font-bold text-ink">
                                Create student account
                            </h2>

                            <p className="mt-2 text-ink-soft">
                                Register using your learner information.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >

                            {/* LRN */}
                            <div>
                                <label
                                    htmlFor="lrn"
                                    className="block mb-2 text-sm font-semibold text-ink"
                                >
                                    Learner Reference Number (LRN)
                                </label>

                                <input
                                    id="lrn"
                                    name="lrn"
                                    type="text"
                                    value={formData.lrn}
                                    onChange={handleChange}
                                    placeholder="Enter your LRN"
                                    required
                                    className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-ink outline-none transition placeholder:text-ink-muted focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                                />
                            </div>

                            {/* Name */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block mb-2 text-sm font-semibold text-ink"
                                >
                                    Full Name
                                </label>

                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    required
                                    className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-ink outline-none transition placeholder:text-ink-muted focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                                />
                            </div>

                            {/* Username */}
                            <div>
                                <label
                                    htmlFor="username"
                                    className="block mb-2 text-sm font-semibold text-ink"
                                >
                                    Create Username
                                </label>

                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Create a username"
                                    required
                                    className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-ink outline-none transition placeholder:text-ink-muted focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block mb-2 text-sm font-semibold text-ink"
                                >
                                    Password
                                </label>

                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a password"
                                    required
                                    className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-ink outline-none transition placeholder:text-ink-muted focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                                />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block mb-2 text-sm font-semibold text-ink"
                                >
                                    Confirm Password
                                </label>

                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    required
                                    className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-ink outline-none transition placeholder:text-ink-muted focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="px-4 py-3 border rounded-xl border-accent/20 bg-tint-red">
                                    <p className="text-sm font-medium text-accent">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                className="w-full rounded-xl bg-primary px-5 py-3.5 font-semibold text-white transition hover:bg-primary-hover"
                            >
                                Create Student Account
                            </button>
                        </form>

                        {/* Login */}
                        <div className="mt-8 text-sm text-center text-ink-soft">
                            Already have an account?{" "}
                            <button
                                type="button"
                                onClick={onLogin}
                                className="font-semibold text-primary hover:underline"
                            >
                                Login
                            </button>
                        </div>

                        {/* Notice */}
                        <div className="p-4 mt-6 border rounded-xl border-border bg-bg-alt">
                            <p className="text-xs leading-5 text-ink-soft">
                                Student registration is intended for ALS learners.
                                Teacher accounts are managed by the ALS administrator.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}

export default Signup;