import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const EMPTY_FORM = {
    name: "",
    education_level: "",
    description: "",
    materialTitle: "",
    materialFile: null,
};

const LEVEL_OPTIONS = [
    { value: "", label: "No level" },
    { value: "elementary", label: "Elementary" },
    { value: "junior_high_school", label: "Junior High School" },
    { value: "senior_high_school", label: "Senior High School" },
];

function getClassCode(subjectId) {
    return `ALS-${String(subjectId).padStart(4, "0")}`;
}

function getFileUrl(path) {
    if (!path) return "";

    const { data } = supabase.storage
        .from("learning-materials")
        .getPublicUrl(path);

    return data.publicUrl;
}

function AdminSubjects({ user }) {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);

    useEffect(() => {
        let cancelled = false;

        async function loadSubjects() {
            setLoading(true);
            setError("");

            try {
                const result = await supabase
                    .from("subjects")
                    .select(
                        "id, name, description, education_level, created_at, modules(id, title, pdf_url, created_at)"
                    )
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

    function openCreate() {
        setError("");
        setSuccess("");
        setEditingSubject(null);
        setForm(EMPTY_FORM);
        setShowForm(true);
    }

    function openEdit(subject) {
        setError("");
        setSuccess("");
        setEditingSubject(subject);
        setForm({
            name: subject.name || "",
            education_level: subject.education_level || "",
            description: subject.description || "",
            materialTitle: "",
            materialFile: null,
        });
        setShowForm(true);
    }

    function closeForm() {
        setShowForm(false);
        setEditingSubject(null);
        setForm(EMPTY_FORM);
    }

    async function saveSubject(e) {
        e.preventDefault();

        if (!form.name.trim()) {
            setError("Subject name is required.");
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        const payload = {
            name: form.name.trim(),
            description: form.description.trim() || null,
            education_level: form.education_level || null,
        };

        try {
            const result = editingSubject
                ? await supabase
                      .from("subjects")
                      .update(payload)
                      .eq("id", editingSubject.id)
                      .select("id")
                      .single()
                : await supabase.from("subjects").insert({
                      ...payload,
                      created_by: user?.id || null,
                  }).select("id").single();

            if (result.error) throw result.error;

            const subjectId = editingSubject?.id || result.data?.id;

            if (form.materialFile && subjectId) {
                const fileExt =
                    form.materialFile.name.split(".").pop() || "file";
                const cleanName = form.materialFile.name
                    .replace(/\.[^/.]+$/, "")
                    .replace(/[^a-z0-9]+/gi, "-")
                    .replace(/^-+|-+$/g, "")
                    .toLowerCase();
                const filePath = `subjects/${subjectId}/${Date.now()}-${cleanName}.${fileExt}`;

                const uploadResult = await supabase.storage
                    .from("learning-materials")
                    .upload(filePath, form.materialFile, {
                        upsert: false,
                    });

                if (uploadResult.error) throw uploadResult.error;

                const moduleResult = await supabase.from("modules").insert({
                    subject_id: subjectId,
                    title:
                        form.materialTitle.trim() ||
                        form.materialFile.name.replace(/\.[^/.]+$/, ""),
                    description: "Uploaded from Admin Subjects.",
                    pdf_url: getFileUrl(filePath),
                    status: "published",
                    module_order: 0,
                });

                if (moduleResult.error) throw moduleResult.error;
            }

            setSuccess(
                editingSubject
                    ? "Subject updated successfully."
                    : "Subject created successfully."
            );
            closeForm();

            const refreshed = await supabase
                .from("subjects")
                .select(
                    "id, name, description, education_level, created_at, modules(id, title, pdf_url, created_at)"
                )
                .order("name", { ascending: true });

            if (refreshed.error) throw refreshed.error;
            setSubjects(refreshed.data || []);
        } catch (err) {
            console.error("Save subject error:", err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function deleteSubject(subject) {
        const confirmed = window.confirm(
            `Delete ${subject.name}? Modules connected to this subject may prevent deletion.`
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            const result = await supabase
                .from("subjects")
                .delete()
                .eq("id", subject.id);

            if (result.error) throw result.error;

            setSubjects((current) =>
                current.filter((item) => item.id !== subject.id)
            );
            setSuccess("Subject deleted successfully.");
        } catch (err) {
            console.error("Delete subject error:", err);
            setError(err.message);
        }
    }

    return (
        <>
            {/* Header */}
            <div className="flex flex-col gap-5 p-8 shadow rounded-2xl bg-surface sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-bold uppercase tracking-[0.15em] text-secondary">
                        Management
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-primary sm:text-4xl">
                        Subjects
                    </h1>

                    <p className="max-w-2xl mt-3 text-ink-soft">
                        Create and organize ALS classes like a simple classroom stream.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreate}
                    className="px-5 py-3 text-sm font-semibold text-white transition rounded-xl bg-primary hover:bg-primary-hover"
                >
                    + Create Class
                </button>
            </div>

            {/* Success */}
            {success && (
                <div className="p-4 mt-6 border border-green-200 rounded-xl bg-green-50">
                    <p className="text-sm font-medium text-green-700">
                        {success}
                    </p>
                </div>
            )}

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
                        Use Create Class to add the first ALS subject.
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

                            {subject.modules?.length > 0 && (
                                <div className="mt-5 space-y-2">
                                    <p className="text-xs font-semibold uppercase text-ink-muted">
                                        Materials
                                    </p>
                                    {subject.modules.map((module) => (
                                        <a
                                            key={module.id}
                                            href={module.pdf_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block px-3 py-2 text-sm font-semibold transition rounded-lg bg-bg-alt text-primary hover:bg-tint-blue"
                                        >
                                            {module.title}
                                        </a>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-3 pt-5 mt-5 border-t border-border">
                                <div>
                                    <p className="text-xs font-semibold uppercase text-ink-muted">
                                        Class Code
                                    </p>
                                    <p className="mt-1 font-mono text-sm font-bold text-primary">
                                        {getClassCode(subject.id)}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openEdit(subject)}
                                        className="px-3 py-2 text-xs font-semibold transition rounded-lg bg-tint-blue text-primary hover:bg-primary hover:text-white"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => deleteSubject(subject)}
                                        className="px-3 py-2 text-xs font-semibold transition rounded-lg bg-tint-red text-accent hover:bg-accent hover:text-white"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                </div>
            )}

            {showForm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                    onClick={closeForm}
                >
                    <div
                        className="w-full max-w-lg shadow-xl rounded-2xl bg-surface"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <form onSubmit={saveSubject} className="p-6 space-y-5">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-ink">
                                    {editingSubject ? "Edit Class" : "Create Class"}
                                </h2>

                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="w-8 h-8 transition rounded-full text-ink-soft hover:bg-bg-alt hover:text-ink"
                                >
                                    x
                                </button>
                            </div>

                            <div>
                                <label
                                    htmlFor="subjectName"
                                    className="block mb-2 text-sm font-semibold text-ink"
                                >
                                    Subject Name
                                </label>
                                <input
                                    id="subjectName"
                                    type="text"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({ ...form, name: e.target.value })
                                    }
                                    placeholder="e.g. English Communication"
                                    className="w-full px-4 py-3 text-sm transition border outline-none rounded-xl border-border bg-surface text-ink placeholder:text-ink-muted focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="subjectLevel"
                                    className="block mb-2 text-sm font-semibold text-ink"
                                >
                                    Education Level
                                </label>
                                <select
                                    id="subjectLevel"
                                    value={form.education_level}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            education_level: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-3 text-sm transition border outline-none rounded-xl border-border bg-surface text-ink focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                                >
                                    {LEVEL_OPTIONS.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="subjectDescription"
                                    className="block mb-2 text-sm font-semibold text-ink"
                                >
                                    Description
                                </label>
                                <textarea
                                    id="subjectDescription"
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            description: e.target.value,
                                        })
                                    }
                                    rows={4}
                                    placeholder="Add class details, reminders, or learning goals."
                                    className="w-full px-4 py-3 text-sm transition border outline-none resize-none rounded-xl border-border bg-surface text-ink placeholder:text-ink-muted focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                                />
                            </div>

                            <div className="p-4 space-y-4 border rounded-xl border-border bg-bg-alt">
                                <div>
                                    <label
                                        htmlFor="materialTitle"
                                        className="block mb-2 text-sm font-semibold text-ink"
                                    >
                                        Material Title
                                    </label>
                                    <input
                                        id="materialTitle"
                                        type="text"
                                        value={form.materialTitle}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                materialTitle: e.target.value,
                                            })
                                        }
                                        placeholder="Optional title for uploaded file"
                                        className="w-full px-4 py-3 text-sm transition border outline-none rounded-xl border-border bg-surface text-ink placeholder:text-ink-muted focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="materialFile"
                                        className="block mb-2 text-sm font-semibold text-ink"
                                    >
                                        Upload PDF or Document
                                    </label>
                                    <input
                                        id="materialFile"
                                        type="file"
                                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                materialFile:
                                                    e.target.files?.[0] || null,
                                            })
                                        }
                                        className="w-full px-4 py-3 text-sm transition border outline-none rounded-xl border-border bg-surface text-ink file:mr-4 file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="flex-1 px-5 py-3 text-sm font-semibold transition border rounded-xl border-border bg-surface text-ink hover:bg-bg-alt"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-5 py-3 text-sm font-semibold text-white transition rounded-xl bg-primary hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving ? "Saving..." : "Save Class"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default AdminSubjects;
