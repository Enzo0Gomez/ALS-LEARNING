import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const EMPTY_FORM = {
    name: "",
    education_level: "",
    description: "",
    materialTitle: "",
    materialFile: null,
};

const EMPTY_QUIZ_FORM = {
    moduleId: null,
    title: "",
    timeLimit: "",
    passingScore: "",
    maxAttempts: "",
    questions: [
        { text: "", points: 1, imageFile: null, choices: ["", "", "", ""], correctChoice: 0 },
    ],
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

function formatDate(value) {
    if (!value) return "-";
    return new Intl.DateTimeFormat("en-PH", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

async function fetchSubjects() {
    const result = await supabase
        .from("subjects")
        .select(
            "id, name, description, education_level, created_at, modules(id, title, pdf_url, created_at, uploaded_by, uploader:profiles!modules_uploaded_by_fkey(first_name, last_name), quizzes(id, title, status, time_limit_minutes, passing_score, max_attempts, created_at, created_by_profile, creator:profiles!quizzes_created_by_profile_fkey(first_name, last_name), quiz_questions(id, image_url)))"
        )
        .order("name", { ascending: true });

    if (result.error) throw result.error;
    return result.data || [];
}

function AdminSubjects({ user, role = "admin" }) {
    const isAdmin = role === "admin";
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [quizForm, setQuizForm] = useState(EMPTY_QUIZ_FORM);
    const [savingQuiz, setSavingQuiz] = useState(false);
    const [viewingSubject, setViewingSubject] = useState(null);
    const [contentSearch, setContentSearch] = useState("");
    const [uploaderFilter, setUploaderFilter] = useState("all");
    const [quizFilter, setQuizFilter] = useState("all");
    const [quizAttempts, setQuizAttempts] = useState([]);
    const [attemptsLoading, setAttemptsLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function loadSubjects() {
            setLoading(true);
            setError("");

            try {
                const data = await fetchSubjects();
                if (!cancelled) setSubjects(data);
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

    async function openView(subject) {
        setViewingSubject(subject);
        setContentSearch("");
        setUploaderFilter("all");
        setQuizFilter("all");
        setAttemptsLoading(true);

        try {
            const quizIds = (subject.modules || [])
                .flatMap((module) => module.quizzes || [])
                .map((quiz) => quiz.id);
            if (quizIds.length === 0) {
                setQuizAttempts([]);
                return;
            }

            const attemptsResult = await supabase
                .from("quiz_attempts")
                .select("id, quiz_id, student_id, score, total_points, percentage, passed, started_at, completed_at")
                .in("quiz_id", quizIds)
                .order("percentage", { ascending: false, nullsFirst: false });
            if (attemptsResult.error) throw attemptsResult.error;

            const studentIds = [...new Set((attemptsResult.data || []).map((attempt) => attempt.student_id))];
            const profilesResult = studentIds.length
                ? await supabase.from("profiles").select("id, first_name, last_name").in("id", studentIds)
                : { data: [], error: null };
            if (profilesResult.error) throw profilesResult.error;

            const profiles = new Map((profilesResult.data || []).map((profile) => [profile.id, profile]));
            const ranks = new Map();
            const rankedAttempts = (attemptsResult.data || []).map((attempt) => {
                const quizRank = ranks.get(attempt.quiz_id) || 0;
                ranks.set(attempt.quiz_id, quizRank + 1);
                return { ...attempt, rank: quizRank + 1, profile: profiles.get(attempt.student_id) };
            });
            setQuizAttempts(rankedAttempts);
        } catch (err) {
            console.error("Quiz attempts fetch error:", err);
            setError(err.message);
            setQuizAttempts([]);
        } finally {
            setAttemptsLoading(false);
        }
    }

    function openUploadModule(subject) {
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

    function closeView() {
        setViewingSubject(null);
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
            const result = editingSubject && isAdmin
                ? await supabase
                      .from("subjects")
                      .update(payload)
                      .eq("id", editingSubject.id)
                      .select("id")
                      .single()
                                : !editingSubject
                                        ? await supabase.from("subjects").insert({
                      ...payload,
                      created_by: user?.id || null,
                                    }).select("id").single()
                                        : { error: null, data: { id: editingSubject.id } };

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
                    teacher_id: role === "teacher" ? user?.id || null : null,
                    uploaded_by: user?.id || null,
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

            setSubjects(await fetchSubjects());
        } catch (err) {
            console.error("Save subject error:", err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    function openQuizForm(module) {
        setError("");
        setSuccess("");
        setQuizForm({ ...EMPTY_QUIZ_FORM, moduleId: module.id });
    }

    function closeQuizForm() {
        setQuizForm(EMPTY_QUIZ_FORM);
    }

    async function saveQuiz(e) {
        e.preventDefault();

        if (!quizForm.title.trim()) {
            setError("Quiz title is required.");
            return;
        }

        if (quizForm.questions.some((question) =>
            !question.text.trim() || question.choices.some((choice) => !choice.trim())
        )) {
            setError("Complete every question and choice before saving.");
            return;
        }

        setSavingQuiz(true);
        setError("");
        setSuccess("");

        try {
            const result = await supabase.from("quizzes").insert({
                module_id: quizForm.moduleId,
                title: quizForm.title.trim(),
                status: "published",
                time_limit_minutes: quizForm.timeLimit
                    ? Number(quizForm.timeLimit)
                    : null,
                passing_score: quizForm.passingScore
                    ? Number(quizForm.passingScore)
                    : null,
                max_attempts: quizForm.maxAttempts
                    ? Number(quizForm.maxAttempts)
                    : null,
                created_by_profile: user?.id || null,
                created_by: role === "teacher" ? user?.id || null : null,
            }).select("id").single();

            if (result.error) throw result.error;

            const quizId = result.data?.id;
            if (!quizId) throw new Error("Quiz was created without an id.");

            for (const [questionIndex, question] of quizForm.questions.entries()) {
                let imageUrl = null;
                if (question.imageFile) {
                    const imageExt = question.imageFile.name.split(".").pop() || "jpg";
                    const imagePath = `quizzes/${quizId}/question-${questionIndex + 1}-${Date.now()}.${imageExt}`;
                    const imageUpload = await supabase.storage
                        .from("learning-materials")
                        .upload(imagePath, question.imageFile, { upsert: false });
                    if (imageUpload.error) throw imageUpload.error;
                    imageUrl = getFileUrl(imagePath);
                }

                const questionResult = await supabase
                    .from("quiz_questions")
                    .insert({
                        quiz_id: quizId,
                        question: question.text.trim(),
                        question_type: "multiple_choice",
                        image_url: imageUrl,
                        points: Number(question.points) || 1,
                        question_order: questionIndex,
                    })
                    .select("id")
                    .single();

                if (questionResult.error) throw questionResult.error;

                const choicesResult = await supabase.from("quiz_choices").insert(
                    question.choices.map((choice, choiceIndex) => ({
                        question_id: questionResult.data.id,
                        choice_text: choice.trim(),
                        is_correct: choiceIndex === question.correctChoice,
                        choice_order: choiceIndex,
                    }))
                );

                if (choicesResult.error) throw choicesResult.error;
            }

            closeQuizForm();
            setSuccess("Quiz created successfully.");
            setSubjects(await fetchSubjects());
        } catch (err) {
            console.error("Save quiz error:", err);
            setError(err.message);
        } finally {
            setSavingQuiz(false);
        }
    }

    function updateQuestion(questionIndex, changes) {
        setQuizForm((current) => ({
            ...current,
            questions: current.questions.map((question, index) =>
                index === questionIndex ? { ...question, ...changes } : question
            ),
        }));
    }

    function updateChoice(questionIndex, choiceIndex, value) {
        const question = quizForm.questions[questionIndex];
        updateQuestion(questionIndex, {
            choices: question.choices.map((choice, index) =>
                index === choiceIndex ? value : choice
            ),
        });
    }

    function addQuestion() {
        setQuizForm((current) => ({
            ...current,
            questions: [
                ...current.questions,
                { text: "", points: 1, imageFile: null, choices: ["", "", "", ""], correctChoice: 0 },
            ],
        }));
    }

    function removeQuestion(questionIndex) {
        setQuizForm((current) => ({
            ...current,
            questions: current.questions.filter((_, index) => index !== questionIndex),
        }));
    }

    function addChoice(questionIndex) {
        const question = quizForm.questions[questionIndex];
        updateQuestion(questionIndex, { choices: [...question.choices, ""] });
    }

    function removeChoice(questionIndex, choiceIndex) {
        const question = quizForm.questions[questionIndex];
        if (question.choices.length <= 2) return;
        updateQuestion(questionIndex, {
            choices: question.choices.filter((_, index) => index !== choiceIndex),
            correctChoice: question.correctChoice === choiceIndex
                ? 0
                : question.correctChoice > choiceIndex
                    ? question.correctChoice - 1
                    : question.correctChoice,
        });
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

    const uploaderOptions = viewingSubject
        ? [...new Map(
              (viewingSubject.modules || []).map((module) => {
                  const uploader = module.uploader;
                  const name = uploader
                      ? `${uploader.first_name || ""} ${uploader.last_name || ""}`.trim()
                      : "Unknown uploader";
                  return [name, name];
              })
          ).values()]
        : [];

    const filteredModules = (viewingSubject?.modules || []).filter((module) => {
        const uploader = module.uploader;
        const uploaderName = uploader
            ? `${uploader.first_name || ""} ${uploader.last_name || ""}`.trim()
            : "Unknown uploader";
        const quiz = module.quizzes?.[0];
        const searchMatch = `${module.title} ${uploaderName} ${quiz?.title || ""}`
            .toLowerCase()
            .includes(contentSearch.toLowerCase());
        const uploaderMatch =
            uploaderFilter === "all" || uploaderName === uploaderFilter;
        const quizMatch =
            quizFilter === "all" ||
            (quizFilter === "with-quiz" && Boolean(quiz)) ||
            (quizFilter === "without-quiz" && !quiz) ||
            (quiz && quiz.status === quizFilter);

        return searchMatch && uploaderMatch && quizMatch;
    });

    const rankedAttempts = quizAttempts.filter((attempt) => {
        const quiz = (viewingSubject?.modules || [])
            .flatMap((module) => module.quizzes || [])
            .find((item) => item.id === attempt.quiz_id);
        return quiz && `${quiz.title} ${attempt.profile?.first_name || ""} ${attempt.profile?.last_name || ""}`
            .toLowerCase()
            .includes(contentSearch.toLowerCase());
    });

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

                {isAdmin && <button
                    type="button"
                    onClick={openCreate}
                    className="px-5 py-3 text-sm font-semibold text-white transition rounded-xl bg-primary hover:bg-primary-hover"
                >
                    + Create Class
                </button>}
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

                            <div className="flex items-center justify-between gap-3 mt-5">
                                <p className="text-sm text-ink-soft">
                                    {subject.modules?.length || 0} module(s) uploaded
                                </p>
                                <button
                                    type="button"
                                    onClick={() => openView(subject)}
                                    className="px-3 py-2 text-xs font-semibold transition rounded-lg bg-tint-blue text-primary hover:bg-primary hover:text-white"
                                >
                                    View
                                </button>
                            </div>

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
                                    {isAdmin && <button
                                        type="button"
                                        onClick={() => openEdit(subject)}
                                        className="px-3 py-2 text-xs font-semibold transition rounded-lg bg-tint-blue text-primary hover:bg-primary hover:text-white"
                                    >
                                        Edit
                                    </button>}
                                    {isAdmin && <button
                                        type="button"
                                        onClick={() => deleteSubject(subject)}
                                        className="px-3 py-2 text-xs font-semibold transition rounded-lg bg-tint-red text-accent hover:bg-accent hover:text-white"
                                    >
                                        Delete
                                    </button>}
                                </div>
                            </div>
                        </div>
                    ))}

                </div>
            )}

            {viewingSubject && (
                <div
                    className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50"
                    onClick={closeView}
                >
                    <div
                        className="w-full max-h-[calc(100vh-2rem)] max-w-6xl overflow-y-auto shadow-xl rounded-2xl bg-surface"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col gap-4 p-6 border-b border-border sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase text-secondary">
                                    Content details
                                </p>
                                <h2 className="mt-1 text-2xl font-bold text-ink">
                                    {viewingSubject.name}
                                </h2>
                                <p className="mt-1 text-sm text-ink-soft">
                                    {filteredModules.length} of {viewingSubject.modules?.length || 0} modules shown
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeView}
                                className="self-end w-8 h-8 transition rounded-full text-ink-soft hover:bg-bg-alt hover:text-ink sm:self-auto"
                                aria-label="Close content details"
                            >
                                x
                            </button>
                            <button
                                type="button"
                                onClick={() => openUploadModule(viewingSubject)}
                                className="px-4 py-2 text-xs font-semibold text-white rounded-lg bg-primary hover:bg-primary-hover"
                            >
                                + Upload module
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 p-6 border-b border-border bg-bg-alt md:grid-cols-4">
                            <input
                                type="search"
                                value={contentSearch}
                                onChange={(e) => setContentSearch(e.target.value)}
                                placeholder="Search module or quiz..."
                                aria-label="Search module or quiz"
                                className="w-full px-4 py-3 text-sm transition border outline-none rounded-xl border-border bg-surface text-ink placeholder:text-ink-muted focus:border-highlight focus:ring-4 focus:ring-highlight-soft md:col-span-2"
                            />
                            <select
                                value={uploaderFilter}
                                onChange={(e) => setUploaderFilter(e.target.value)}
                                aria-label="Filter by uploader"
                                className="w-full px-3 py-3 text-sm border outline-none rounded-xl border-border bg-surface text-ink focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                            >
                                <option value="all">All uploaders</option>
                                {uploaderOptions.map((name) => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                            <select
                                value={quizFilter}
                                onChange={(e) => setQuizFilter(e.target.value)}
                                aria-label="Filter by quiz status"
                                className="w-full px-3 py-3 text-sm border outline-none rounded-xl border-border bg-surface text-ink focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                            >
                                <option value="all">All quiz records</option>
                                <option value="with-quiz">With quiz</option>
                                <option value="without-quiz">No quiz set</option>
                                <option value="published">Published quiz</option>
                                <option value="draft">Draft quiz</option>
                            </select>
                        </div>

                        <div className="p-6">
                            {filteredModules.length === 0 ? (
                                <div className="p-8 text-center border rounded-xl border-border text-ink-soft">
                                    No content matches the selected filters.
                                </div>
                            ) : (
                                <div className="overflow-x-auto border rounded-xl border-border">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs uppercase bg-bg-alt text-ink-muted">
                                            <tr>
                                                <th className="px-3 py-3">Module / PDF</th>
                                                <th className="px-3 py-3">Uploaded by</th>
                                                <th className="px-3 py-3">Uploaded at</th>
                                                <th className="px-3 py-3">Quiz</th>
                                                <th className="px-3 py-3">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {filteredModules.map((module) => {
                                                const quiz = module.quizzes?.[0];
                                                const uploader = module.uploader;
                                                const creator = quiz?.creator;
                                                const uploaderName = uploader
                                                    ? `${uploader.first_name || ""} ${uploader.last_name || ""}`.trim()
                                                    : "Unknown uploader";
                                                const creatorName = creator
                                                    ? `${creator.first_name || ""} ${creator.last_name || ""}`.trim()
                                                    : "-";
                                                return (
                                                    <tr key={module.id} className="align-top text-ink">
                                                        <td className="px-3 py-3 min-w-48">
                                                            {module.pdf_url ? (
                                                                <a href={module.pdf_url} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">
                                                                    {module.title}
                                                                </a>
                                                            ) : <span className="font-semibold">{module.title}</span>}
                                                        </td>
                                                        <td className="px-3 py-3 whitespace-nowrap">{uploaderName}</td>
                                                        <td className="px-3 py-3 whitespace-nowrap text-ink-soft">{formatDate(module.created_at)}</td>
                                                        <td className="px-3 py-3 min-w-52">
                                                            {quiz ? (
                                                                <div>
                                                                    <p className="font-semibold">{quiz.title}</p>
                                                                    <p className="mt-1 text-xs text-ink-soft">
                                                                        {quiz.status || "draft"} · {quiz.quiz_questions?.length || 0} questions
                                                                        {quiz.max_attempts ? ` · ${quiz.max_attempts} attempts` : ""}
                                                                    </p>
                                                                    <p className="text-xs text-ink-muted">By {creatorName} · {formatDate(quiz.created_at)}</p>
                                                                </div>
                                                            ) : <span className="text-ink-muted">No quiz set</span>}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            <button type="button" onClick={() => openQuizForm(module)} className="px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap bg-tint-blue text-primary hover:bg-primary hover:text-white">
                                                                {quiz ? "Add quiz" : "Set quiz"}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="mt-8">
                                <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-ink">Quiz results and rankings</h3>
                                        <p className="mt-1 text-sm text-ink-soft">
                                            {new Set(quizAttempts.map((attempt) => attempt.student_id)).size} student(s) took a quiz · {quizAttempts.length} total attempt(s)
                                        </p>
                                    </div>
                                    <p className="text-xs text-ink-muted">Rank is calculated per quiz by percentage.</p>
                                </div>

                                {attemptsLoading ? (
                                    <div className="p-6 text-center border rounded-xl border-border text-ink-soft">Loading quiz results...</div>
                                ) : rankedAttempts.length === 0 ? (
                                    <div className="p-6 text-center border rounded-xl border-border text-ink-soft">No quiz attempts yet.</div>
                                ) : (
                                    <div className="overflow-x-auto border rounded-xl border-border">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs uppercase bg-bg-alt text-ink-muted">
                                                <tr>
                                                    <th className="px-3 py-3">Rank</th>
                                                    <th className="px-3 py-3">Student</th>
                                                    <th className="px-3 py-3">Quiz</th>
                                                    <th className="px-3 py-3">Score</th>
                                                    <th className="px-3 py-3">Percentage</th>
                                                    <th className="px-3 py-3">Result</th>
                                                    <th className="px-3 py-3">Taken at</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {rankedAttempts.map((attempt) => {
                                                    const studentName = attempt.profile
                                                        ? `${attempt.profile.first_name || ""} ${attempt.profile.last_name || ""}`.trim()
                                                        : "Unknown student";
                                                    const quiz = (viewingSubject.modules || [])
                                                        .flatMap((module) => module.quizzes || [])
                                                        .find((item) => item.id === attempt.quiz_id);
                                                    return (
                                                        <tr key={attempt.id} className="text-ink">
                                                            <td className="px-3 py-3 font-bold text-primary">#{attempt.rank}</td>
                                                            <td className="px-3 py-3 font-semibold whitespace-nowrap">{studentName}</td>
                                                            <td className="px-3 py-3">{quiz?.title || "Unknown quiz"}</td>
                                                            <td className="px-3 py-3 whitespace-nowrap">{attempt.score ?? 0} / {attempt.total_points ?? 0}</td>
                                                            <td className="px-3 py-3 font-semibold whitespace-nowrap">{attempt.percentage == null ? "-" : `${Number(attempt.percentage).toFixed(1)}%`}</td>
                                                            <td className="px-3 py-3">
                                                                <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${attempt.passed ? "bg-tint-green text-secondary" : "bg-tint-red text-accent"}`}>
                                                                    {attempt.passed ? "Passed" : "Failed"}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-3 whitespace-nowrap text-ink-soft">{formatDate(attempt.completed_at || attempt.started_at)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showForm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                    onClick={closeForm}
                >
                    <div
                        className="w-full max-h-[calc(100vh-2rem)] max-w-lg overflow-y-auto shadow-xl rounded-2xl bg-surface"
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

            {quizForm.moduleId && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                    onClick={closeQuizForm}
                >
                    <div
                        className="w-full max-h-[calc(100vh-2rem)] max-w-lg overflow-y-auto shadow-xl rounded-2xl bg-surface"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <form onSubmit={saveQuiz} className="p-6 space-y-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase text-secondary">
                                        Quiz management
                                    </p>
                                    <h2 className="mt-1 text-lg font-bold text-ink">
                                        Set a quiz
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeQuizForm}
                                    className="w-8 h-8 transition rounded-full text-ink-soft hover:bg-bg-alt hover:text-ink"
                                >
                                    x
                                </button>
                            </div>

                            <div>
                                <label htmlFor="quizTitle" className="block mb-2 text-sm font-semibold text-ink">
                                    Quiz title
                                </label>
                                <input
                                    id="quizTitle"
                                    type="text"
                                    value={quizForm.title}
                                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                                    placeholder="e.g. Module 1 Assessment"
                                    className="w-full px-4 py-3 text-sm transition border outline-none rounded-xl border-border bg-surface text-ink placeholder:text-ink-muted focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                    <label htmlFor="quizTimeLimit" className="block mb-2 text-sm font-semibold text-ink">
                                        Time (minutes)
                                    </label>
                                    <input
                                        id="quizTimeLimit"
                                        type="number"
                                        min="1"
                                        value={quizForm.timeLimit}
                                        onChange={(e) => setQuizForm({ ...quizForm, timeLimit: e.target.value })}
                                        className="w-full px-3 py-3 text-sm border outline-none rounded-xl border-border bg-surface text-ink focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="quizPassingScore" className="block mb-2 text-sm font-semibold text-ink">
                                        Passing score (%)
                                    </label>
                                    <input
                                        id="quizPassingScore"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={quizForm.passingScore}
                                        onChange={(e) => setQuizForm({ ...quizForm, passingScore: e.target.value })}
                                        className="w-full px-3 py-3 text-sm border outline-none rounded-xl border-border bg-surface text-ink focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="quizMaxAttempts" className="block mb-2 text-sm font-semibold text-ink">
                                        Max attempts
                                    </label>
                                    <input
                                        id="quizMaxAttempts"
                                        type="number"
                                        min="1"
                                        value={quizForm.maxAttempts}
                                        onChange={(e) => setQuizForm({ ...quizForm, maxAttempts: e.target.value })}
                                        className="w-full px-3 py-3 text-sm border outline-none rounded-xl border-border bg-surface text-ink focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 space-y-5 border-t border-border">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h3 className="font-bold text-ink">Questions</h3>
                                        <p className="mt-1 text-xs text-ink-soft">
                                            Add multiple-choice questions and select the correct answer.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addQuestion}
                                        className="px-3 py-2 text-xs font-semibold rounded-lg bg-tint-blue text-primary hover:bg-primary hover:text-white"
                                    >
                                        + Add question
                                    </button>
                                </div>

                                {quizForm.questions.map((question, questionIndex) => (
                                    <div key={questionIndex} className="p-4 space-y-4 border rounded-xl border-border bg-bg-alt">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-sm font-bold text-ink">Question {questionIndex + 1}</p>
                                            {quizForm.questions.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeQuestion(questionIndex)}
                                                    className="text-xs font-semibold text-accent hover:underline"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <textarea
                                            value={question.text}
                                            onChange={(e) => updateQuestion(questionIndex, { text: e.target.value })}
                                            placeholder="Write the question..."
                                            rows={2}
                                            className="w-full px-3 py-3 text-sm transition border outline-none resize-none rounded-xl border-border bg-surface text-ink placeholder:text-ink-muted focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                                        />
                                        <div>
                                            <label htmlFor={`question-image-${questionIndex}`} className="block mb-2 text-xs font-semibold text-ink-soft">
                                                Add image to this question (optional)
                                            </label>
                                            <input
                                                id={`question-image-${questionIndex}`}
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => updateQuestion(questionIndex, { imageFile: e.target.files?.[0] || null })}
                                                className="w-full px-3 py-2 text-xs border rounded-lg outline-none border-border bg-surface text-ink file:mr-3 file:border-0 file:bg-primary file:px-3 file:py-2 file:font-semibold file:text-white"
                                            />
                                            {question.imageFile && (
                                                <p className="mt-1 text-xs text-ink-muted">{question.imageFile.name}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <label className="text-xs font-semibold text-ink-soft" htmlFor={`points-${questionIndex}`}>
                                                Points
                                            </label>
                                            <input
                                                id={`points-${questionIndex}`}
                                                type="number"
                                                min="1"
                                                value={question.points}
                                                onChange={(e) => updateQuestion(questionIndex, { points: e.target.value })}
                                                className="w-20 px-3 py-2 text-sm border rounded-lg outline-none border-border bg-surface text-ink focus:border-highlight"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            {question.choices.map((choice, choiceIndex) => (
                                                <div key={choiceIndex} className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name={`correct-${questionIndex}`}
                                                        checked={question.correctChoice === choiceIndex}
                                                        onChange={() => updateQuestion(questionIndex, { correctChoice: choiceIndex })}
                                                        aria-label={`Correct answer for choice ${choiceIndex + 1}`}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={choice}
                                                        onChange={(e) => updateChoice(questionIndex, choiceIndex, e.target.value)}
                                                        placeholder={`Choice ${choiceIndex + 1}`}
                                                        className="flex-1 px-3 py-2 text-sm border rounded-lg outline-none border-border bg-surface text-ink placeholder:text-ink-muted focus:border-highlight"
                                                    />
                                                    {question.choices.length > 2 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeChoice(questionIndex, choiceIndex)}
                                                            className="px-2 text-sm text-ink-muted hover:text-accent"
                                                            aria-label={`Remove choice ${choiceIndex + 1}`}
                                                        >
                                                            x
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => addChoice(questionIndex)}
                                                className="text-xs font-semibold text-primary hover:underline"
                                            >
                                                + Add choice
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeQuizForm}
                                    className="flex-1 px-5 py-3 text-sm font-semibold transition border rounded-xl border-border bg-surface text-ink hover:bg-bg-alt"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingQuiz}
                                    className="flex-1 px-5 py-3 text-sm font-semibold text-white transition rounded-xl bg-primary hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {savingQuiz ? "Saving..." : "Save quiz"}
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
