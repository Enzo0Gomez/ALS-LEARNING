import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

function StudentContent({ user, section, onSectionChange }) {
    const [subjects, setSubjects] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [attempts, setAttempts] = useState([]);
    const [progressRows, setProgressRows] = useState([]);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [selectedModuleId, setSelectedModuleId] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadData = useCallback(async () => {
        setLoading(true);
        setError("");
        const [subjectsResult, announcementsResult, attemptsResult, progressResult] = await Promise.all([
            supabase.from("subjects").select("id, name, description, education_level, modules(id, title, description, pdf_url, created_at, quizzes(id, title, description, status, time_limit_minutes, passing_score, max_attempts, quiz_questions(id, question, points, question_order, image_url, quiz_choices(id, choice_text, choice_order))) )").order("name"),
            supabase.from("announcements").select("id, title, description, image_url, pdf_url, created_at").eq("for_student", true).order("created_at", { ascending: false }),
            supabase.from("quiz_attempts").select("id, quiz_id, score, total_points, percentage, passed, started_at, completed_at, quizzes(title)").eq("student_id", user?.id).order("completed_at", { ascending: false }),
            supabase.from("module_progress").select("id, module_id, progress_percentage, completed, updated_at").eq("student_id", user?.id),
        ]);
        if (subjectsResult.error) setError(subjectsResult.error.message);
        else setSubjects(subjectsResult.data || []);
        if (!announcementsResult.error) setAnnouncements(announcementsResult.data || []);
        if (!attemptsResult.error) setAttempts(attemptsResult.data || []);
        if (!progressResult.error) setProgressRows(progressResult.data || []);
        setLoading(false);
    }, [user?.id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (section !== "modules" || selectedModuleId == null) return;
        document.getElementById(`module-${selectedModuleId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [section, selectedModuleId]);

    const modules = subjects.flatMap((subject) => (subject.modules || []).map((module) => ({ ...module, subjectName: subject.name })));
    const quizzes = modules.flatMap((module) => (module.quizzes || []).filter((quiz) => quiz.status === "published").map((quiz) => ({ ...quiz, moduleTitle: module.title, subjectName: module.subjectName })));
    const progressByModule = new Map(progressRows.map((row) => [row.module_id, row]));
    const totalProgress = modules.length
        ? modules.reduce((total, module) => total + Number(progressByModule.get(module.id)?.progress_percentage || 0), 0) / modules.length
        : 0;
    const completedModules = modules.filter((module) => progressByModule.get(module.id)?.completed).length;
    const todoItems = [
        ...modules.filter((module) => !progressByModule.get(module.id)?.completed).slice(0, 3).map((module) => ({ id: `module-${module.id}`, label: `Continue module: ${module.title}`, type: "module", moduleId: module.id })),
        ...quizzes.filter((quiz) => !attempts.some((attempt) => attempt.quiz_id === quiz.id)).slice(0, 3).map((quiz) => ({ id: `quiz-${quiz.id}`, label: `Take quiz: ${quiz.title}`, type: "quiz", quiz })),
        ...announcements.slice(0, 2).map((item) => ({ id: `announcement-${item.id}`, label: `Read announcement: ${item.title}`, type: "announcement" })),
    ].slice(0, 5);

    async function completeModule(moduleId) {
        setSaving(true);
        setError("");
        try {
            const existing = progressByModule.get(moduleId);
            const progressData = { progress_percentage: 100, completed: true, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() };
            const result = existing
                ? await supabase.from("module_progress").update(progressData).eq("id", existing.id).eq("student_id", user.id)
                : await supabase.from("module_progress").insert({ ...progressData, module_id: moduleId, student_id: user.id, started_at: new Date().toISOString() });
            if (result.error) throw result.error;
            setSelectedModuleId(null);
            setMessage("Module completed.");
            await loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    function openTodo(item) {
        if (item.type === "module") {
            setSelectedModuleId(item.moduleId);
            onSectionChange("modules");
        } else if (item.type === "quiz") {
            startQuiz(item.quiz);
        } else {
            onSectionChange("announcements");
        }
    }

    function startQuiz(quiz) {
        const takenCount = attempts.filter((attempt) => attempt.quiz_id === quiz.id).length;
        if (quiz.max_attempts && takenCount >= Number(quiz.max_attempts)) {
            setError("You have reached the maximum attempts for this quiz.");
            return;
        }
        setActiveQuiz(quiz);
        setAnswers({});
        setError("");
        setMessage("");
    }

    async function submitQuiz(event) {
        event.preventDefault();
        if (!activeQuiz) return;
        const questions = [...(activeQuiz.quiz_questions || [])].sort((a, b) => a.question_order - b.question_order);
        if (questions.some((question) => !answers[question.id])) {
            setError("Please answer every question before submitting.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            const totalPoints = questions.reduce((total, question) => total + (Number(question.points) || 1), 0);
            let score = 0;
            const answerRows = questions.map((question) => {
                const selected = question.quiz_choices.find((choice) => choice.id === answers[question.id]);
                const correct = Boolean(selected?.is_correct);
                const points = correct ? (Number(question.points) || 1) : 0;
                score += points;
                return { question_id: question.id, selected_choice_id: selected.id, is_correct: correct, points_earned: points };
            });
            const percentage = totalPoints ? (score / totalPoints) * 100 : 0;
            const attemptResult = await supabase.from("quiz_attempts").insert({
                quiz_id: activeQuiz.id,
                student_id: user.id,
                score,
                total_points: totalPoints,
                percentage,
                passed: activeQuiz.passing_score == null || percentage >= Number(activeQuiz.passing_score),
                completed_at: new Date().toISOString(),
            }).select("id").single();
            if (attemptResult.error) throw attemptResult.error;
            const answersResult = await supabase.from("student_answers").insert(answerRows.map((answer) => ({ ...answer, attempt_id: attemptResult.data.id })));
            if (answersResult.error) throw answersResult.error;
            setMessage(`Quiz submitted. Your score is ${score}/${totalPoints} (${percentage.toFixed(1)}%).`);
            setActiveQuiz(null);
            await loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    if (activeQuiz) {
        const questions = [...(activeQuiz.quiz_questions || [])].sort((a, b) => a.question_order - b.question_order);
        return (
            <section className="p-5 shadow sm:p-8 rounded-2xl bg-surface">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div><p className="text-sm font-bold uppercase tracking-[0.15em] text-secondary">{activeQuiz.moduleTitle}</p><h1 className="mt-2 text-2xl font-bold text-primary">{activeQuiz.title}</h1><p className="mt-2 text-sm text-ink-soft">{questions.length} questions{activeQuiz.time_limit_minutes ? ` · ${activeQuiz.time_limit_minutes} minutes` : ""}</p></div>
                    <button type="button" onClick={() => setActiveQuiz(null)} className="px-3 py-2 text-xs font-semibold rounded-lg bg-bg-alt text-ink hover:bg-tint-blue">Close</button>
                </div>
                {error && <p className="p-3 mt-5 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">{error}</p>}
                <form onSubmit={submitQuiz} className="mt-8 space-y-6">
                    {questions.map((question, index) => <fieldset key={question.id} className="p-5 border rounded-xl border-border"><legend className="px-2 font-bold text-ink">Question {index + 1}</legend>{question.image_url && <img src={question.image_url} alt="Question illustration" className="max-h-64 mt-3 rounded-lg" />}<p className="mt-3 leading-7 text-ink">{question.question}</p><div className="mt-4 space-y-2">{[...(question.quiz_choices || [])].sort((a, b) => a.choice_order - b.choice_order).map((choice) => <label key={choice.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer border-border hover:bg-bg-alt"><input type="radio" name={`question-${question.id}`} value={choice.id} checked={answers[question.id] === choice.id} onChange={() => setAnswers({ ...answers, [question.id]: choice.id })} />{choice.choice_text}</label>)}</div></fieldset>)}
                    <button type="submit" disabled={saving} className="w-full px-5 py-3 font-semibold text-white rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-60">{saving ? "Submitting..." : "Submit quiz"}</button>
                </form>
            </section>
        );
    }

    if (section === "dashboard") return <ContentSection title="Dashboard" description={`Welcome back, ${user?.first_name || "Learner"}. Here's your learning overview.`}>{loading ? <Loading /> : <><div className="grid gap-4 sm:grid-cols-3"><SummaryCard label="Total progress" value={`${totalProgress.toFixed(1)}%`} /><SummaryCard label="Modules completed" value={`${completedModules}/${modules.length}`} /><SummaryCard label="Quiz attempts" value={attempts.length} /></div><div className="grid gap-6 mt-8 lg:grid-cols-2"><div className="p-5 border rounded-xl border-border"><h2 className="text-lg font-bold text-ink">To-do list</h2>{todoItems.length === 0 ? <p className="mt-4 text-sm text-ink-soft">You are all caught up.</p> : <ul className="mt-4 space-y-3">{todoItems.map((item) => <li key={item.id}><button type="button" onClick={() => openTodo(item)} className="flex w-full gap-3 text-sm text-left text-ink hover:text-primary"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-secondary" />{item.label}</button></li>)}</ul>}</div><div className="p-5 border rounded-xl border-border"><h2 className="text-lg font-bold text-ink">Announcements</h2>{announcements.length === 0 ? <p className="mt-4 text-sm text-ink-soft">No announcements yet.</p> : <div className="mt-4 space-y-3">{announcements.slice(0, 3).map((item) => <button type="button" key={item.id} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="block w-full p-3 text-left rounded-lg bg-bg-alt hover:bg-tint-blue"><p className="font-semibold text-ink">{item.title}</p><p className="mt-1 text-xs text-ink-soft line-clamp-2">{item.description}</p></button>)}</div>}</div></div></>}</ContentSection>;
    if (section === "modules") return <ContentSection title="My Modules" description="Access your published learning materials.">{message && <p className="p-3 mb-5 text-sm text-green-700 border border-green-200 rounded-lg bg-green-50">{message}</p>}{error && <p className="p-3 mb-5 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">{error}</p>}{loading ? <Loading /> : modules.length === 0 ? <Empty text="No modules available yet." /> : <div className="grid gap-5 md:grid-cols-2">{modules.map((module) => <article id={`module-${module.id}`} key={module.id} className={`p-5 border rounded-xl border-border ${selectedModuleId === module.id ? "ring-2 ring-secondary" : ""}`}><p className="text-xs font-semibold uppercase text-secondary">{module.subjectName}</p><h2 className="mt-2 text-lg font-bold text-ink">{module.title}</h2><p className="mt-2 text-sm text-ink-soft">{module.description || "No description provided."}</p><p className="mt-3 text-xs font-semibold text-secondary">Progress: {Number(progressByModule.get(module.id)?.progress_percentage || 0).toFixed(0)}%</p><div className="flex flex-wrap items-center gap-4 mt-4">{module.pdf_url && <a href={module.pdf_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary hover:underline">Open learning material</a>}{!progressByModule.get(module.id)?.completed && <button type="button" disabled={saving} onClick={() => completeModule(module.id)} className="px-3 py-2 text-sm font-semibold text-white rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-60">{saving ? "Saving..." : "Mark as complete"}</button>}</div></article>)}</div>}</ContentSection>;
    if (section === "quizzes") return <ContentSection title="Take Quizzes" description="Answer published quizzes and see your results.">{error && <p className="p-3 mb-5 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">{error}</p>}{loading ? <Loading /> : quizzes.length === 0 ? <Empty text="No quizzes available yet." /> : <div className="grid gap-5 md:grid-cols-2">{quizzes.map((quiz) => { const takenCount = attempts.filter((attempt) => attempt.quiz_id === quiz.id).length; const limitReached = quiz.max_attempts && takenCount >= Number(quiz.max_attempts); return <article key={quiz.id} className="p-5 border rounded-xl border-border"><p className="text-xs font-semibold uppercase text-secondary">{quiz.subjectName} · {quiz.moduleTitle}</p><h2 className="mt-2 text-lg font-bold text-ink">{quiz.title}</h2><p className="mt-2 text-sm text-ink-soft">{quiz.quiz_questions?.length || 0} questions{quiz.passing_score ? ` · Passing score ${quiz.passing_score}%` : ""}{quiz.max_attempts ? ` · ${takenCount}/${quiz.max_attempts} attempts used` : ""}</p><button type="button" disabled={limitReached} onClick={() => startQuiz(quiz)} className="w-full px-4 py-3 mt-4 text-sm font-semibold text-white rounded-xl bg-primary hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50">{limitReached ? "Attempt limit reached" : "Start quiz"}</button></article>; })}</div>}</ContentSection>;
    if (section === "announcements") return <ContentSection title="Announcements" description="Updates intended for ALS students.">{loading ? <Loading /> : announcements.length === 0 ? <Empty text="No announcements yet." /> : <div className="space-y-4">{announcements.map((item) => <article key={item.id} className="p-5 border rounded-xl border-border">{item.image_url && <img src={item.image_url} alt="" className="w-full max-h-64 rounded-lg object-cover" />}<h2 className="mt-3 text-lg font-bold text-ink">{item.title}</h2><p className="mt-2 leading-7 text-ink-soft">{item.description}</p>{item.pdf_url && <a href={item.pdf_url} target="_blank" rel="noreferrer" className="inline-block mt-3 text-sm font-semibold text-primary hover:underline">Open PDF</a>}</article>)}</div>}</ContentSection>;
    return <ContentSection title="My Progress" description="Review your quiz scores and learning activity.">{message && <p className="p-3 mb-5 text-sm text-green-700 border border-green-200 rounded-lg bg-green-50">{message}</p>}{attempts.length === 0 ? <Empty text="You have no quiz attempts yet." /> : <div className="overflow-x-auto border rounded-xl border-border"><table className="w-full min-w-180 text-sm text-left"><thead className="text-xs uppercase bg-bg-alt text-ink-muted"><tr><th className="px-4 py-3">Quiz</th><th className="px-4 py-3">Score</th><th className="px-4 py-3">Percentage</th><th className="px-4 py-3">Result</th><th className="px-4 py-3">Date</th></tr></thead><tbody className="divide-y divide-border">{attempts.map((attempt) => <tr key={attempt.id}><td className="px-4 py-3 font-semibold">{attempt.quizzes?.title || "Quiz"}</td><td className="px-4 py-3">{attempt.score} / {attempt.total_points}</td><td className="px-4 py-3">{attempt.percentage == null ? "-" : `${Number(attempt.percentage).toFixed(1)}%`}</td><td className="px-4 py-3">{attempt.passed ? "Passed" : "Failed"}</td><td className="px-4 py-3 whitespace-nowrap text-ink-soft">{attempt.completed_at ? new Date(attempt.completed_at).toLocaleString("en-PH") : "-"}</td></tr>)}</tbody></table></div>}</ContentSection>;
}

function ContentSection({ title, description, children }) { return <section className="p-5 shadow sm:p-8 rounded-2xl bg-surface"><p className="text-sm font-bold uppercase tracking-[0.15em] text-secondary">Student Portal</p><h1 className="mt-2 text-3xl font-bold text-primary">{title}</h1><p className="mt-3 text-ink-soft">{description}</p><div className="mt-8">{children}</div></section>; }
function Loading() { return <p className="p-8 text-center text-ink-soft">Loading...</p>; }
function Empty({ text }) { return <p className="p-8 text-center border rounded-xl border-border text-ink-soft">{text}</p>; }
function SummaryCard({ label, value }) { return <div className="p-5 border rounded-xl border-border bg-bg-alt"><p className="text-xs font-semibold uppercase text-ink-muted">{label}</p><p className="mt-2 text-3xl font-bold text-primary">{value}</p></div>; }

export default StudentContent;
