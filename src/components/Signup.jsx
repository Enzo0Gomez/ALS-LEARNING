import { useState } from "react";
import { supabase } from "../lib/supabase";

const EDUCATION_LEVELS = [
    {
        label: "Basic Literacy",
        values: ["basic_literacy", "BasicLiteracy", "Basic Literacy"],
    },
    {
        label: "Elementary",
        values: ["elementary", "Elementary"],
    },
    {
        label: "Junior High School",
        values: [
            "junior_high_school",
            "JuniorHighSchool",
            "Junior High School",
        ],
    },
    {
        label: "Senior High School",
        values: [
            "senior_high_school",
            "SeniorHighSchool",
            "Senior High School",
        ],
    },
];

function Signup({ onLogin }) {
    const [formData, setFormData] = useState({
        lrn: "",
        name: "",
        email: "",
        username: "",
        educationLevel: "",
        password: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [needsEmailConfirmation, setNeedsEmailConfirmation] =
        useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        const selectedLevel = EDUCATION_LEVELS.find(
            (level) => level.label === formData.educationLevel
        );

        if (!selectedLevel) {
            setError("Please select your education level.");
            return;
        }

        setLoading(true);

        try {
            // Split the full name for the profiles table
            const nameParts = formData.name.trim().split(/\s+/);
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            // 1. Create the auth user through Supabase Authentication
            const signUpResult = await supabase.auth.signUp({
                email: formData.email.trim(),
                password: formData.password,
                options: {
                    data: {
                        username: formData.username.trim(),
                        lrn: formData.lrn.trim(),
                        role: "student",
                    },
                },
            });
            const data = signUpResult.data;
            const signUpError = signUpResult.error;

            if (signUpError) {
                throw signUpError;
            }

            if (!data.user) {
                throw new Error(
                    "Registration failed. Please try again."
                );
            }

            const userId = data.user.id;

            // 2. Create the student profile row
            const profileResult = await supabase
                .from("profiles")
                .insert({
                    id: userId,
                    first_name: firstName,
                    last_name: lastName,
                    role: "student",
                    username: formData.username.trim(),
                });
            const profileError = profileResult.error;

            if (profileError) {
                if (profileError.code === "23505") {
                    throw new Error(
                        "That username is already taken. Please choose another one."
                    );
                }
                throw new Error(
                    "Account created but we couldn't set up your student profile. Please contact your teacher."
                );
            }

            // 3. Create the students row (education level + LRN)
            // Try each known spelling of the enum value until one
            // matches the database definition (code 22P02 = invalid
            // enum input means we simply try the next candidate).
            let studentError = null;

            for (const levelValue of selectedLevel.values) {
                const studentResult = await supabase
                    .from("students")
                    .insert({
                        id: userId,
                        education_level: levelValue,
                        learner_id: formData.lrn.trim(),
                    });

                studentError = studentResult.error;

                if (!studentError) break;

                if (studentError.code === "22P02") continue;

                break;
            }

            if (studentError) {
                if (studentError.code === "23505") {
                    throw new Error(
                        "That Learner Reference Number (LRN) is already registered."
                    );
                }
                throw new Error(
                    "Account created but we couldn't save your learner information. Please contact your teacher."
                );
            }

            // If email confirmation is enabled, no session is returned
            setNeedsEmailConfirmation(!data.session);
            setSuccess(true);
        } catch (err) {
            console.error("Signup error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
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
                <div className="flex items-center justify-center w-full px-4 py-8 sm:px-6 sm:py-12 lg:w-1/2">
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

                        {success ? (

                            /* Success Panel */
                            <div className="p-8 text-center border rounded-xl border-border bg-surface">
                                <h3 className="text-xl font-bold text-ink">
                                    Account created!
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-ink-soft">
                                    {needsEmailConfirmation
                                        ? "Please check your email and click the verification link before logging in."
                                        : "Your student account has been created successfully."}
                                </p>

                                <button
                                    type="button"
                                    onClick={onLogin}
                                    className="w-full mt-6 rounded-xl bg-primary px-5 py-3.5 font-semibold text-white transition hover:bg-primary-hover"
                                >
                                    Go to Login
                                </button>
                            </div>

                        ) : (

                            <>
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

                                    {/* Email */}
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="block mb-2 text-sm font-semibold text-ink"
                                        >
                                            Email Address
                                        </label>

                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter your email address"
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

                                    {/* Education Level */}
                                    <div>
                                        <label
                                            htmlFor="educationLevel"
                                            className="block mb-2 text-sm font-semibold text-ink"
                                        >
                                            Education Level
                                        </label>

                                        <select
                                            id="educationLevel"
                                            name="educationLevel"
                                            value={formData.educationLevel}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-ink outline-none transition focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                                        >
                                            <option value="" disabled>
                                                Select your education level
                                            </option>
                                            {EDUCATION_LEVELS.map((level) => (
                                                <option
                                                    key={level.label}
                                                    value={level.label}
                                                >
                                                    {level.label}
                                                </option>
                                            ))}
                                        </select>
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
                                            placeholder="At least 6 characters"
                                            required
                                            minLength={6}
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
                                            minLength={6}
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
                                        disabled={loading}
                                        className="w-full rounded-xl bg-primary px-5 py-3.5 font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {loading
                                            ? "Creating account..."
                                            : "Create Student Account"}
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
                            </>

                        )}

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