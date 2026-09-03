import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AlertModal from "../AlertModal";
import { faGraduationCap, faChalkboardUser, faClipboardCheck, faBookOpen, faUsers, faBullhorn, faGear, faUserPlus } from "@fortawesome/free-solid-svg-icons";

function AdminStats({ user, onNavigate }) {
    const [reportText, setReportText] = useState("Track learner participation, quiz performance, and learning progress through the admin reports.");
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

    useEffect(() => {
        async function loadReportText() {
            const result = await supabase.from("site_settings").select("report_text").eq("id", true).single();
            if (!result.error && result.data?.report_text) setReportText(result.data.report_text);
        }
        loadReportText();
    }, []);

    const statCards = [
        {
            label: "Total Students",
            value: stats.students,
            icon: faGraduationCap,
            hint: "Students signed up",
        },
        {
            label: "Total Teachers",
            value: stats.teachers,
            icon: faChalkboardUser,
            hint: "Teachers registered",
        },
        {
            label: "Quiz Takers",
            value: stats.quizTakers,
            icon: faClipboardCheck,
            hint: "Students who took a quiz",
        },
        {
            label: "Modules Uploaded",
            value: stats.modulesUploaded,
            icon: faBookOpen,
            hint: "Uploaded to Google Drive",
        },
        {
            label: "Total Users",
            value: stats.totalUsers,
            icon: faUsers,
            hint: "All registered accounts",
        },
    ];

    return (
        <>
            <AlertModal type="error" message={error} onClose={() => setError("")} />
            {/* Header */}
            <div className="relative p-6 overflow-hidden shadow sm:p-8 rounded-2xl bg-surface">
                <div className="absolute top-0 left-0 w-2 h-full bg-secondary" aria-hidden="true" />
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
                <p className="max-w-2xl mt-3 text-sm text-ink-soft">{reportText}</p>
                <div className="flex flex-wrap gap-2 mt-6" aria-label="Admin quick actions">
                    <QuickAction icon={faUserPlus} label="Add user" onClick={() => onNavigate("users")} />
                    <QuickAction icon={faBookOpen} label="Manage subjects" onClick={() => onNavigate("subjects")} />
                    <QuickAction icon={faBullhorn} label="Post announcement" onClick={() => onNavigate("announcements")} />
                    <QuickAction icon={faGear} label="Open settings" onClick={() => onNavigate("settings")} />
                </div>
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
            <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2 xl:grid-cols-5">

                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className="admin-stat-card p-5 transition border shadow-sm rounded-2xl border-border bg-surface hover:-translate-y-0.5 hover:shadow-md"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold tracking-wide uppercase text-ink-soft">
                                {card.label}
                            </p>

                            <span
                                aria-hidden="true"
                                className="flex items-center justify-center w-10 h-10 text-lg rounded-xl bg-tint-blue text-primary"
                            >
                                <FontAwesomeIcon icon={card.icon} aria-hidden="true" />
                            </span>
                        </div>

                        <p className="mt-5 text-3xl font-bold text-primary">
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

function QuickAction({ icon, label, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-bg-alt px-3 py-2 text-sm font-semibold text-primary transition hover:border-highlight hover:bg-tint-blue"
        >
            <FontAwesomeIcon icon={icon} aria-hidden="true" />
            {label}
        </button>
    );
}

export default AdminStats;