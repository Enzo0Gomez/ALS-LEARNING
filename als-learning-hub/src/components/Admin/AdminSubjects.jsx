import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

function AdminSubjects() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadSubjects() {
            setLoading(true);
            setError("");

            try {
                const result = await supabase
                    .from("subjects")
                    .select("id, name, description, education_level")
                    .order("name", { ascending: true });

                if (result.error) throw result.error;

                if (!cancelled) setSubjects(result.data || []);
            } catch (err) {
                console.error("Subjects fetch error:", err);
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadSubjects();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <>
            {/* Header */}
            <div className="p-8 shadow rounded-2xl bg-surface">
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-secondary">
                    Management
                </p>

                <h1 className="mt-2 text-3xl font-bold text-primary sm:text-4xl">
                    Subject
                </h1>

                <p className="max-w-2xl mt-3 text-ink-soft">
                    All subjects offered in the ALS Learning Hub.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 mt-6 border border-red-200 rounded-xl bg-red-50">
                    <p className="text-sm font-medium text-red-600">
                        Failed to load subjects: {error}
                    </p>
                </div>
            )}

            {/* Subjects Grid */}
            {loading ? (
                <div className="p-8 mt-8 text-center shadow rounded-2xl bg-surface text-ink-soft">
                    Loading subjects…
                </div>
            ) : subjects.length === 0 ? (
                <div className="p-8 mt-8 text-center shadow rounded-2xl bg-surface">
                    <p className="text-lg font-semibold text-ink">
                        No subjects yet
                    </p>

                    <p className="mt-2 text-sm text-ink-soft">
                        Subjects will appear here once teachers create them.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-3">

                    {subjects.map((subject) => (
                        <div
                            key={subject.id}
                            className="p-6 transition shadow rounded-2xl bg-surface hover:shadow-md"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <h2 className="text-lg font-bold text-ink">
                                    {subject.name}
                                </h2>

                                {subject.education_level && (
                                    <span className="inline-block px-3 py-1 text-xs font-semibold uppercase rounded-full bg-tint-blue text-primary">
                                        {subject.education_level}
                                    </span>
                                )}
                            </div>

                            <p className="mt-3 text-sm leading-6 text-ink-soft">
                                {subject.description ||
                                    "No description provided."}
                            </p>
                        </div>
                    ))}

                </div>
            )}
        </>
    );
}

export default AdminSubjects;