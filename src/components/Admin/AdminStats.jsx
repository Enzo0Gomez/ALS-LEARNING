import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

function AdminStats({ user }) {
    const [stats, setStats] = useState({
        students: null,
        teachers: null,
        quizTakers: null,
        modulesUploaded: null,
        totalUsers: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadStats() {
            setLoading(true);
            setError("");

            try {
                // 1. Count registered students
                const studentsResult = await supabase
                    .from("students")
                    .select("id", { count: "exact", head: true });

                if (studentsResult.error) throw studentsResult.error;

                // 2. Count registered teachers
                const teachersResult = await supabase
                    .from("teachers")
                    .select("id", { count: "exact", head: true });

                if (teachersResult.error) throw teachersResult.error;

                // 3. Count distinct students who have taken a quiz
                const attemptsResult = await supabase
                    .from("quiz_attempts")
                    .select("student_id");

                if (attemptsResult.error) throw attemptsResult.error;

                const uniqueQuizTakers = new Set(
                    (attemptsResult.data || []).map(
                        (row) => row.student_id
                    )
                ).size;

                // 4. Count modules uploaded to Google Drive (pdf_url set)
                const modulesResult = await supabase
                    .from("modules")
                    .select("id", { count: "exact", head: true })
                    .not("pdf_url", "is", null);

                if (modulesResult.error) throw modulesResult.error;

                // 5. Count overall users (all profiles)
                const usersResult = await supabase
                    .from("profiles")
                    .select("id", { count: "exact", head: true });

                if (usersResult.error) throw usersResult.error;

                if (!cancelled) {
                    setStats({
                        students: studentsResult.count || 0,
                        teachers: teachersResult.count || 0,
                        quizTakers: uniqueQuizTakers,
                        modulesUploaded: modulesResult.count || 0,
                        totalUsers: usersResult.count || 0,
                    });
                }
            } catch (err) {
                console.error("Admin stats error:", err);
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadStats();

        return () => {
            cancelled = true;
        };
    }, []);

    const statCards = [
        {
            label: "Total Students",
            value: stats.students,
            emoji: "🎓",
            hint: "Students signed up",
        },
        {
            label: "Total Teachers",
            value: stats.teachers,
            emoji: "👩‍🏫",
            hint: "Teachers registered",
        },
        {
            label: "Quiz Takers",
            value: stats.quizTakers,
            emoji: "📝",
            hint: "Students who took a quiz",
        },
        {
            label: "Modules Uploaded",
            value: stats.modulesUploaded,
            emoji: "📚",
            hint: "Uploaded to Google Drive",
        },
        {
            label: "Total Users",
            value: stats.totalUsers,
            emoji: "👥",
            hint: "All registered accounts",
        },
    ];

    return (
        <>
            {/* Header */}
            <div className="p-8 shadow rounded-2xl bg-surface">
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-secondary">
                    Overview
                </p>

                <h1 className="mt-2 text-3xl font-bold text-primary sm:text-4xl">
                    Dashboard
                </h1>

                <p className="max-w-2xl mt-3 text-ink-soft">
                    {user
                        ? `Welcome back, ${user.first_name || "Admin"} ${user.last_name || ""}!`
                        : "Welcome back!"}
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 mt-6 border border-red-200 rounded-xl bg-red-50">
                    <p className="text-sm font-medium text-red-600">
                        Failed to load statistics: {error}
                    </p>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-3">

                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className="p-6 transition shadow rounded-2xl bg-surface hover:shadow-md"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold tracking-wide uppercase text-ink-soft">
                                {card.label}
                            </p>

                            <span
                                aria-hidden="true"
                                className="text-2xl"
                            >
                                {card.emoji}
                            </span>
                        </div>

                        <p className="mt-4 text-4xl font-bold text-primary">
                            {loading
                                ? "…"
                                : String(card.value ?? "-")}
                        </p>

                        <p className="mt-2 text-xs text-ink-muted">
                            {card.hint}
                        </p>
                    </div>
                ))}

            </div>
        </>
    );
}

export default AdminStats;