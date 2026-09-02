import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const DEFAULT_SETTINGS = {
    hero_title: "Learn.\nGrow.\nAchieve.",
    hero_description: "Accessible learning materials designed to support every ALS learner on their journey toward achieving their goals.",
    primary_button_text: "Explore Learning Materials",
    secondary_button_text: "Learn About ALS",
    about_title: "Alternative Learning System",
    about_description: "The Alternative Learning System (ALS) is a parallel learning system of the Department of Education that provides a practical option for Filipinos who cannot access formal schooling.",
    teacher_name: "Ma’am Tan",
    teacher_role: "Elementary ALS Coordinator",
    teacher_bio: "Hello, I am Ma’am Tan, an Elementary ALS Coordinator with eight years of service in the Alternative Learning System.",
    teacher_quote: "Every learner deserves a supportive path back to education.",
    report_text: "Track learner participation, quiz performance, and learning progress through the admin reports.",
};

function AdminSettings({ user, onSettingsSaved, onTeachersSaved }) {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [teachers, setTeachers] = useState([]);
    const [teacherForm, setTeacherForm] = useState({ name: "", role: "", bio: "", quote: "", imageFile: null });
    const [savingTeacher, setSavingTeacher] = useState(false);

    useEffect(() => {
        async function loadSettings() {
            const result = await supabase
                .from("site_settings")
                .select("hero_title, hero_description, primary_button_text, secondary_button_text, about_title, about_description, teacher_name, teacher_role, teacher_bio, teacher_quote, report_text")
                .eq("id", true)
                .single();
            if (result.error) setError(result.error.message);
            if (result.data) setSettings(result.data);
            setLoading(false);
        }
        loadSettings();
        async function loadTeachers() {
            const result = await supabase.from("site_teachers").select("id, name, role, bio, quote, image_url, sort_order").order("sort_order").order("created_at");
            if (!result.error) setTeachers(result.data || []);
        }
        loadTeachers();
    }, []);

    async function addTeacher() {
        if (!teacherForm.name.trim() || !teacherForm.role.trim()) {
            setError("Teacher name and role are required.");
            return;
        }
        setSavingTeacher(true);
        setError("");
        try {
            let imageUrl = null;
            if (teacherForm.imageFile) {
                const extension = teacherForm.imageFile.name.split(".").pop() || "jpg";
                const path = `teachers/${Date.now()}-${teacherForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${extension}`;
                const upload = await supabase.storage.from("learning-materials").upload(path, teacherForm.imageFile, { upsert: false });
                if (upload.error) throw upload.error;
                imageUrl = supabase.storage.from("learning-materials").getPublicUrl(path).data.publicUrl;
            }
            const result = await supabase.from("site_teachers").insert({
                name: teacherForm.name.trim(), role: teacherForm.role.trim(), bio: teacherForm.bio.trim() || null,
                quote: teacherForm.quote.trim() || null, image_url: imageUrl, sort_order: teachers.length, created_by: user?.id || null,
            }).select("id, name, role, bio, quote, image_url, sort_order").single();
            if (result.error) throw result.error;
            const nextTeachers = [...teachers, result.data];
            setTeachers(nextTeachers);
            onTeachersSaved?.(nextTeachers);
            setTeacherForm({ name: "", role: "", bio: "", quote: "", imageFile: null });
            setMessage("Teacher added to the landing page.");
        } catch (err) {
            setError(err.message);
        } finally {
            setSavingTeacher(false);
        }
    }

    async function saveSettings(e) {
        e.preventDefault();
        setSaving(true);
        setMessage("");
        setError("");
        const result = await supabase
            .from("site_settings")
            .update({ ...settings, updated_by: user?.id || null, updated_at: new Date().toISOString() })
            .eq("id", true)
            .select("hero_title, hero_description, primary_button_text, secondary_button_text, about_title, about_description, teacher_name, teacher_role, teacher_bio, teacher_quote, report_text")
            .single();
        if (result.error) {
            setError(result.error.message);
        } else {
            setSettings(result.data);
            onSettingsSaved?.(result.data);
            setMessage("Landing page updated successfully.");
        }
        setSaving(false);
    }

    return (
        <>
            {/* Header */}
            <div className="p-8 shadow rounded-2xl bg-surface">
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-secondary">
                    Configuration
                </p>

                <h1 className="mt-2 text-3xl font-bold text-primary sm:text-4xl">
                    Settings
                </h1>

                <p className="max-w-2xl mt-3 text-ink-soft">
                    Manage your admin account and system preferences.
                </p>
            </div>

            {/* Account Info */}
            <div className="p-8 mt-8 shadow rounded-2xl bg-surface">
                <h2 className="text-xl font-bold text-ink">
                    Account Information
                </h2>

                <dl className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2">
                    <div>
                        <dt className="text-xs font-semibold tracking-wide uppercase text-ink-muted">
                            First Name
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-ink">
                            {user?.first_name || "-"}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-xs font-semibold tracking-wide uppercase text-ink-muted">
                            Last Name
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-ink">
                            {user?.last_name || "-"}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-xs font-semibold tracking-wide uppercase text-ink-muted">
                            Role
                        </dt>
                        <dd className="mt-1">
                            <span className="inline-block px-3 py-1 text-xs font-semibold uppercase rounded-full bg-tint-blue text-primary">
                                {user?.role || "admin"}
                            </span>
                        </dd>
                    </div>
                </dl>
            </div>

            <form onSubmit={saveSettings} className="p-5 mt-6 shadow sm:p-8 rounded-2xl bg-surface">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.15em] text-secondary">General</p>
                        <h2 className="mt-2 text-xl font-bold text-ink">Landing Page</h2>
                        <p className="mt-2 text-sm text-ink-soft">Edit the text shown on the public home page.</p>
                    </div>
                    <button type="submit" disabled={loading || saving} className="w-full px-5 py-3 text-sm font-semibold text-white transition rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-60 sm:w-auto">
                        {saving ? "Saving..." : "Save changes"}
                    </button>
                </div>

                {message && <p className="p-3 mt-5 text-sm font-medium text-green-700 border border-green-200 rounded-lg bg-green-50">{message}</p>}
                {error && <p className="p-3 mt-5 text-sm font-medium text-red-600 border border-red-200 rounded-lg bg-red-50">{error}</p>}

                <div className="grid gap-5 mt-6">
                    <div>
                        <label htmlFor="heroTitle" className="block mb-2 text-sm font-semibold text-ink">Hero title</label>
                        <textarea id="heroTitle" rows={3} value={settings.hero_title} onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })} className="w-full px-4 py-3 text-sm border outline-none resize-none rounded-xl border-border bg-surface text-ink focus:border-highlight focus:ring-4 focus:ring-highlight-soft" />
                    </div>
                    <div>
                        <label htmlFor="heroDescription" className="block mb-2 text-sm font-semibold text-ink">Hero description</label>
                        <textarea id="heroDescription" rows={3} value={settings.hero_description} onChange={(e) => setSettings({ ...settings, hero_description: e.target.value })} className="w-full px-4 py-3 text-sm border outline-none resize-none rounded-xl border-border bg-surface text-ink focus:border-highlight focus:ring-4 focus:ring-highlight-soft" />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                            <label htmlFor="primaryButtonText" className="block mb-2 text-sm font-semibold text-ink">Primary button label</label>
                            <input id="primaryButtonText" value={settings.primary_button_text} onChange={(e) => setSettings({ ...settings, primary_button_text: e.target.value })} className="w-full px-4 py-3 text-sm border outline-none rounded-xl border-border bg-surface text-ink focus:border-highlight focus:ring-4 focus:ring-highlight-soft" />
                        </div>
                        <div>
                            <label htmlFor="secondaryButtonText" className="block mb-2 text-sm font-semibold text-ink">Secondary button label</label>
                            <input id="secondaryButtonText" value={settings.secondary_button_text} onChange={(e) => setSettings({ ...settings, secondary_button_text: e.target.value })} className="w-full px-4 py-3 text-sm border outline-none rounded-xl border-border bg-surface text-ink focus:border-highlight focus:ring-4 focus:ring-highlight-soft" />
                        </div>
                    </div>

                    <div className="pt-6 mt-2 space-y-5 border-t border-border">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.15em] text-secondary">About tab</p>
                            <p className="mt-1 text-sm text-ink-soft">Edit the title and introduction shown on the public About page.</p>
                        </div>
                        <input aria-label="About title" value={settings.about_title} onChange={(e) => setSettings({ ...settings, about_title: e.target.value })} placeholder="About title" className="w-full px-4 py-3 text-sm border outline-none rounded-xl border-border bg-surface text-ink focus:border-highlight" />
                        <textarea aria-label="About description" rows={3} value={settings.about_description} onChange={(e) => setSettings({ ...settings, about_description: e.target.value })} placeholder="About description" className="w-full px-4 py-3 text-sm border outline-none resize-none rounded-xl border-border bg-surface text-ink focus:border-highlight" />
                    </div>

                    <div className="pt-6 space-y-5 border-t border-border">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.15em] text-secondary">Teacher tab</p>
                            <p className="mt-1 text-sm text-ink-soft">Edit the teacher profile shown on the public Teacher page.</p>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <input aria-label="Teacher name" value={settings.teacher_name} onChange={(e) => setSettings({ ...settings, teacher_name: e.target.value })} placeholder="Teacher name" className="w-full px-4 py-3 text-sm border outline-none rounded-xl border-border bg-surface text-ink focus:border-highlight" />
                            <input aria-label="Teacher role" value={settings.teacher_role} onChange={(e) => setSettings({ ...settings, teacher_role: e.target.value })} placeholder="Teacher role" className="w-full px-4 py-3 text-sm border outline-none rounded-xl border-border bg-surface text-ink focus:border-highlight" />
                        </div>
                        <textarea aria-label="Teacher bio" rows={3} value={settings.teacher_bio} onChange={(e) => setSettings({ ...settings, teacher_bio: e.target.value })} placeholder="Teacher bio" className="w-full px-4 py-3 text-sm border outline-none resize-none rounded-xl border-border bg-surface text-ink focus:border-highlight" />
                        <input aria-label="Teacher quote" value={settings.teacher_quote} onChange={(e) => setSettings({ ...settings, teacher_quote: e.target.value })} placeholder="Teacher quote" className="w-full px-4 py-3 text-sm border outline-none rounded-xl border-border bg-surface text-ink focus:border-highlight" />
                        <div className="pt-4 mt-2 space-y-4 border-t border-border">
                            <h3 className="font-semibold text-ink">Add another teacher</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <input required aria-label="New teacher name" value={teacherForm.name} onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })} placeholder="Teacher name" className="w-full px-4 py-3 text-sm border outline-none rounded-xl border-border bg-surface text-ink focus:border-highlight" />
                                <input required aria-label="New teacher role" value={teacherForm.role} onChange={(e) => setTeacherForm({ ...teacherForm, role: e.target.value })} placeholder="Teacher role" className="w-full px-4 py-3 text-sm border outline-none rounded-xl border-border bg-surface text-ink focus:border-highlight" />
                            </div>
                            <textarea aria-label="New teacher bio" rows={2} value={teacherForm.bio} onChange={(e) => setTeacherForm({ ...teacherForm, bio: e.target.value })} placeholder="Teacher bio" className="w-full px-4 py-3 text-sm border outline-none resize-none rounded-xl border-border bg-surface text-ink focus:border-highlight" />
                            <input aria-label="New teacher quote" value={teacherForm.quote} onChange={(e) => setTeacherForm({ ...teacherForm, quote: e.target.value })} placeholder="Teacher quote" className="w-full px-4 py-3 text-sm border outline-none rounded-xl border-border bg-surface text-ink focus:border-highlight" />
                            <input type="file" accept="image/*" aria-label="New teacher picture" onChange={(e) => setTeacherForm({ ...teacherForm, imageFile: e.target.files?.[0] || null })} className="w-full px-3 py-2 text-sm border rounded-xl border-border bg-surface text-ink file:mr-3 file:border-0 file:bg-primary file:px-3 file:py-2 file:font-semibold file:text-white" />
                            <button type="button" onClick={addTeacher} disabled={savingTeacher} className="w-full px-4 py-3 text-sm font-semibold text-white rounded-xl bg-secondary hover:bg-secondary-hover disabled:opacity-60 sm:w-auto">{savingTeacher ? "Adding..." : "+ Add teacher"}</button>
                            {teachers.length > 0 && <p className="text-xs text-ink-soft">{teachers.length} additional teacher(s) are published on the Teacher tab.</p>}
                        </div>
                    </div>

                    <div className="pt-6 space-y-5 border-t border-border">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.15em] text-secondary">Report</p>
                            <p className="mt-1 text-sm text-ink-soft">Edit the report summary shown in the admin reporting area.</p>
                        </div>
                        <textarea aria-label="Report summary" rows={3} value={settings.report_text} onChange={(e) => setSettings({ ...settings, report_text: e.target.value })} placeholder="Report summary" className="w-full px-4 py-3 text-sm border outline-none resize-none rounded-xl border-border bg-surface text-ink focus:border-highlight" />
                    </div>
                </div>
            </form>

            {/* Preferences (placeholders for future features) */}
            <div className="p-8 mt-6 shadow rounded-2xl bg-surface">
                <h2 className="text-xl font-bold text-ink">Preferences</h2>

                <div className="mt-6 space-y-4">
                    {[
                        {
                            label: "Email notifications",
                            hint: "Receive updates about new signups and uploads.",
                        },
                        {
                            label: "Weekly summary report",
                            hint: "Get a weekly digest of platform activity.",
                        },
                        {
                            label: "Auto-approve new modules",
                            hint: "Publish teacher modules without review.",
                        },
                    ].map((pref) => (
                        <div
                            key={pref.label}
                            className="flex items-center justify-between p-4 border rounded-xl border-border bg-bg-alt"
                        >
                            <div>
                                <p className="text-sm font-semibold text-ink">
                                    {pref.label}
                                </p>

                                <p className="mt-1 text-xs text-ink-soft">
                                    {pref.hint}
                                </p>
                            </div>

                            <span className="px-3 py-1 text-xs font-semibold uppercase border rounded-full bg-bg-alt text-ink-muted border-border">
                                Coming soon
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default AdminSettings;