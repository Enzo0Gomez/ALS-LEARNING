import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const EMPTY_FORM = {
    title: "",
    description: "",
    forTeacher: true,
    forStudent: true,
    postLanding: true,
    imageFile: null,
    pdfFile: null,
};

function getFileUrl(path) {
    return supabase.storage.from("learning-materials").getPublicUrl(path).data.publicUrl;
}

function formatDate(value) {
    return new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function AdminAnnouncements({ user, onAnnouncementsSaved }) {
    const [announcements, setAnnouncements] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [search, setSearch] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function loadAnnouncements() {
        const result = await supabase.from("announcements").select("id, title, description, image_url, pdf_url, for_teacher, for_student, post_landing, created_at").order("created_at", { ascending: false });
        if (result.error) {
            console.error("Announcements fetch error:", result.error);
            return;
        }
        // Data fetched from Supabase initializes the table after mount.
        // oxlint-disable-next-line react(set-state-in-effect)
        // Remote data initializes the announcement list after mount.
        // oxlint-disable-next-line react(set-state-in-effect)
        setAnnouncements(result.data || []);
    }

    useEffect(() => {
        loadAnnouncements();
    }, []);

    async function saveAnnouncement(event) {
        event.preventDefault();
        if (!form.title.trim() || !form.description.trim()) {
            setError("Title and description are required.");
            return;
        }
        if (!form.forTeacher && !form.forStudent) {
            setError("Select at least one audience.");
            return;
        }
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const announcementResult = await supabase.from("announcements").insert({
                title: form.title.trim(),
                description: form.description.trim(),
                for_teacher: form.forTeacher,
                for_student: form.forStudent,
                post_landing: form.postLanding,
                created_by: user?.id || null,
            }).select("id").single();
            if (announcementResult.error) throw announcementResult.error;

            const announcementId = announcementResult.data.id;
            const uploads = [
                [form.imageFile, "image_url", "image"],
                [form.pdfFile, "pdf_url", "pdf"],
            ];
            const media = {};
            for (const [file, field, folder] of uploads) {
                if (!file) continue;
                const extension = file.name.split(".").pop() || "bin";
                const path = `announcements/${announcementId}/${folder}-${Date.now()}.${extension}`;
                const upload = await supabase.storage.from("learning-materials").upload(path, file, { upsert: false });
                if (upload.error) throw upload.error;
                media[field] = getFileUrl(path);
            }
            if (Object.keys(media).length > 0) {
                const update = await supabase.from("announcements").update(media).eq("id", announcementId);
                if (update.error) throw update.error;
            }
            setForm(EMPTY_FORM);
            setSuccess("Announcement posted successfully.");
            await loadAnnouncements();
            const latest = await supabase.from("announcements").select("id, title, description, image_url, pdf_url, for_teacher, for_student, post_landing, created_at").order("created_at", { ascending: false });
            onAnnouncementsSaved?.(latest.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function deleteAnnouncement(id) {
        if (!window.confirm("Delete this announcement?")) return;
        const result = await supabase.from("announcements").delete().eq("id", id);
        if (result.error) setError(result.error.message);
        else {
            const next = announcements.filter((item) => item.id !== id);
            setAnnouncements(next);
            onAnnouncementsSaved?.(next);
            setSuccess("Announcement deleted.");
        }
    }

    const loading = announcements === null;
    const loadedAnnouncements = announcements || [];
    const filtered = loadedAnnouncements.filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(search.toLowerCase()));

    return (
        <>
            <div className="flex flex-col gap-4 p-5 shadow sm:flex-row sm:items-center sm:justify-between sm:p-8 rounded-2xl bg-surface">
                <div><p className="text-sm font-bold uppercase tracking-[0.15em] text-secondary">Communication</p><h1 className="mt-2 text-3xl font-bold text-primary">Announcements</h1><p className="mt-3 text-ink-soft">Create announcements for teachers, students, and the public landing page.</p></div>
            </div>
            {error && <p className="p-4 mt-6 text-sm font-medium text-red-600 border border-red-200 rounded-xl bg-red-50">{error}</p>}
            {success && <p className="p-4 mt-6 text-sm font-medium text-green-700 border border-green-200 rounded-xl bg-green-50">{success}</p>}

            <form onSubmit={saveAnnouncement} className="p-5 mt-6 shadow sm:p-8 rounded-2xl bg-surface">
                <h2 className="text-xl font-bold text-ink">New announcement</h2>
                <div className="grid gap-5 mt-5">
                    <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Announcement title" className="w-full px-4 py-3 text-sm border outline-none rounded-xl border-border bg-surface text-ink focus:border-highlight" />
                    <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Write the announcement description..." className="w-full px-4 py-3 text-sm border outline-none resize-none rounded-xl border-border bg-surface text-ink focus:border-highlight" />
                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="flex items-center gap-3 p-3 border rounded-xl border-border"><input type="checkbox" checked={form.forTeacher} onChange={(e) => setForm({ ...form, forTeacher: e.target.checked })} /> Teachers</label>
                        <label className="flex items-center gap-3 p-3 border rounded-xl border-border"><input type="checkbox" checked={form.forStudent} onChange={(e) => setForm({ ...form, forStudent: e.target.checked })} /> Students</label>
                    </div>
                    <label className="flex items-center gap-3 p-3 border rounded-xl border-border"><input type="checkbox" checked={form.postLanding} onChange={(e) => setForm({ ...form, postLanding: e.target.checked })} /> Publish on landing page</label>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="text-sm font-semibold text-ink">Picture (optional)<input type="file" accept="image/*" onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] || null })} className="w-full mt-2 text-xs border rounded-lg border-border bg-surface file:mr-3 file:border-0 file:bg-primary file:px-3 file:py-2 file:font-semibold file:text-white" /></label>
                        <label className="text-sm font-semibold text-ink">PDF (optional)<input type="file" accept="application/pdf,.pdf" onChange={(e) => setForm({ ...form, pdfFile: e.target.files?.[0] || null })} className="w-full mt-2 text-xs border rounded-lg border-border bg-surface file:mr-3 file:border-0 file:bg-primary file:px-3 file:py-2 file:font-semibold file:text-white" /></label>
                    </div>
                    <button type="submit" disabled={saving} className="w-full px-5 py-3 text-sm font-semibold text-white rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-60 sm:w-fit">{saving ? "Posting..." : "Post announcement"}</button>
                </div>
            </form>

            <div className="p-5 mt-6 shadow sm:p-8 rounded-2xl bg-surface">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-xl font-bold text-ink">Posted announcements</h2><input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search announcements..." className="w-full px-4 py-3 text-sm border rounded-xl border-border sm:max-w-xs" /></div>
                <div className="mt-5 overflow-x-auto border rounded-xl border-border">{loading ? <p className="p-6 text-center text-ink-soft">Loading announcements...</p> : filtered.length === 0 ? <p className="p-6 text-center text-ink-soft">No announcements found.</p> : <table className="w-full min-w-180 text-sm text-left"><thead className="text-xs uppercase bg-bg-alt text-ink-muted"><tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">Audience</th><th className="px-4 py-3">Landing</th><th className="px-4 py-3">Posted</th><th className="px-4 py-3">Action</th></tr></thead><tbody className="divide-y divide-border">{filtered.map((item) => <tr key={item.id}><td className="px-4 py-3 font-semibold">{item.title}<p className="mt-1 font-normal text-ink-soft">{item.description}</p><div className="flex gap-2 mt-2">{item.image_url && <a className="text-xs text-primary hover:underline" href={item.image_url} target="_blank" rel="noreferrer">Picture</a>}{item.pdf_url && <a className="text-xs text-primary hover:underline" href={item.pdf_url} target="_blank" rel="noreferrer">PDF</a>}</div></td><td className="px-4 py-3">{[item.for_teacher && "Teacher", item.for_student && "Student"].filter(Boolean).join(", ")}</td><td className="px-4 py-3">{item.post_landing ? "Published" : "Hidden"}</td><td className="px-4 py-3 whitespace-nowrap text-ink-soft">{formatDate(item.created_at)}</td><td className="px-4 py-3"><button type="button" onClick={() => deleteAnnouncement(item.id)} className="px-3 py-2 text-xs font-semibold rounded-lg bg-tint-red text-accent hover:bg-accent hover:text-white">Delete</button></td></tr>)}</tbody></table>}</div>
            </div>
        </>
    );
}

export default AdminAnnouncements;
