import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

function TeacherStudents() {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadStudents() {
            const result = await supabase
                .from("profiles")
                .select("id, first_name, last_name, username, is_active, students(learner_id)")
                .eq("role", "student")
                .order("last_name", { ascending: true });
            if (result.error) {
                setError(result.error.message);
            } else {
                setStudents(result.data || []);
            }
            setLoading(false);
        }
        loadStudents();
    }, []);

    const filteredStudents = students.filter((student) => {
        const learner = Array.isArray(student.students) ? student.students[0] : student.students;
        const query = search.trim().toLowerCase();
        return !query || `${student.first_name} ${student.last_name} ${student.username || ""} ${learner?.learner_id || ""}`.toLowerCase().includes(query);
    });

    return (
        <>
            <div className="p-8 shadow rounded-2xl bg-surface">
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-secondary">Learners</p>
                <h1 className="mt-2 text-3xl font-bold text-primary sm:text-4xl">Students</h1>
                <p className="mt-3 text-ink-soft">View your learners and their account information.</p>
            </div>

            {error && <p className="p-4 mt-6 text-sm font-medium text-red-600 border border-red-200 rounded-xl bg-red-50">Failed to load students: {error}</p>}

            <div className="p-6 mt-8 shadow rounded-2xl bg-surface">
                <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name, username, or learner ID..."
                    aria-label="Search students"
                    className="w-full px-4 py-3 text-sm border outline-none rounded-xl border-border bg-surface text-ink placeholder:text-ink-muted focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                />
                <div className="mt-5 overflow-x-auto border rounded-xl border-border">
                    {loading ? <p className="p-8 text-center text-ink-soft">Loading students...</p> : filteredStudents.length === 0 ? <p className="p-8 text-center text-ink-soft">No students found.</p> : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-bg-alt text-ink-muted">
                                <tr>
                                    <th className="px-5 py-4">Student</th>
                                    <th className="px-5 py-4">Username</th>
                                    <th className="px-5 py-4">Learner ID</th>
                                    <th className="px-5 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredStudents.map((student) => {
                                    const learner = Array.isArray(student.students) ? student.students[0] : student.students;
                                    return (
                                        <tr key={student.id} className="text-ink">
                                            <td className="px-5 py-4 font-semibold">{student.first_name} {student.last_name}</td>
                                            <td className="px-5 py-4 text-ink-soft">{student.username || "-"}</td>
                                            <td className="px-5 py-4 font-mono text-xs text-ink-soft">{learner?.learner_id || "-"}</td>
                                            <td className="px-5 py-4">{student.is_active === false ? "Deactivated" : "Active"}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
}

export default TeacherStudents;
