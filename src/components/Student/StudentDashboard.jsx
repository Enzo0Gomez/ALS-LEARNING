import { supabase } from "../../lib/supabase";
import DashboardLayout from "../DashboardLayout";

const SECTIONS = [
    { id: "dashboard", label: "Dashboard", emoji: "📊" },
];

function StudentDashboard({ user, onLogout }) {
    const handleLogout = async () => {
        await supabase.auth.signOut();
        onLogout();
    };

    return (
        <DashboardLayout
            portalLabel="Student Portal"
            userName={
                user
                    ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                    : ""
            }
            items={SECTIONS}
            activeSection="dashboard"
            onSectionChange={() => {}}
            onLogout={handleLogout}
        >
            {/* Header */}
            <div className="p-8 shadow rounded-2xl bg-surface">
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-secondary">
                    Student Portal
                </p>

                <h1 className="mt-2 text-3xl font-bold text-primary sm:text-4xl">
                    Dashboard
                </h1>

                <p className="max-w-2xl mt-3 text-ink-soft">
                    {user
                        ? `Welcome back, ${user.first_name || ""} ${user.last_name || ""}!`
                        : "Welcome back!"}
                </p>
            </div>

            {/* Quick Links */}
            <div className="grid gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-3">

                {/* Modules */}
                <button
                    type="button"
                    className="p-6 text-left transition shadow rounded-2xl bg-surface hover:-translate-y-1"
                >
                    <div className="flex items-center justify-center w-12 h-12 text-2xl rounded-xl bg-tint-blue">
                        📖
                    </div>

                    <h2 className="mt-5 text-lg font-bold text-ink">
                        My Modules
                    </h2>

                    <p className="mt-2 text-sm text-ink-soft">
                        Access your learning modules and materials.
                    </p>
                </button>

                {/* Quizzes */}
                <button
                    type="button"
                    className="p-6 text-left transition shadow rounded-2xl bg-surface hover:-translate-y-1"
                >
                    <div className="flex items-center justify-center w-12 h-12 text-2xl rounded-xl bg-tint-red">
                        📝
                    </div>

                    <h2 className="mt-5 text-lg font-bold text-ink">
                        Take Quizzes
                    </h2>

                    <p className="mt-2 text-sm text-ink-soft">
                        Answer quizzes and test your knowledge.
                    </p>
                </button>

                {/* Progress */}
                <button
                    type="button"
                    className="p-6 text-left transition shadow rounded-2xl bg-surface hover:-translate-y-1"
                >
                    <div className="flex items-center justify-center w-12 h-12 text-2xl rounded-xl bg-tint-green">
                        📈
                    </div>

                    <h2 className="mt-5 text-lg font-bold text-ink">
                        My Progress
                    </h2>

                    <p className="mt-2 text-sm text-ink-soft">
                        Track your learning progress and scores.
                    </p>
                </button>

            </div>
        </DashboardLayout>
    );
}

export default StudentDashboard;