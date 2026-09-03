function StudentOverview({
    user,
    loading,
    totalProgress,
    completedModules,
    modules,
    attempts,
    todoItems,
    announcements,
    onTodoClick,
}) {
    return (
        <section className="min-w-0 p-4 shadow student-panel rounded-2xl bg-surface sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-secondary sm:text-sm">Student Portal</p>
            <h1 className="mt-2 text-2xl font-bold wrap-break-word text-primary sm:text-3xl">Dashboard</h1>
            <p className="mt-3 leading-6 text-ink-soft">
                Welcome back, {user?.first_name || "Learner"}. Here's your learning overview.
            </p>

            <div className="mt-6 sm:mt-8">
                {loading ? (
                    <p className="p-8 text-center text-ink-soft">Loading...</p>
                ) : (
                    <>
                        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
                            <SummaryCard label="Total progress" value={`${totalProgress.toFixed(1)}%`} />
                            <SummaryCard label="Modules completed" value={`${completedModules}/${modules.length}`} />
                            <SummaryCard label="Quiz attempts" value={attempts.length} />
                        </div>

                        <div className="grid gap-4 mt-6 lg:mt-8 lg:grid-cols-2 lg:gap-6">
                            <section className="p-4 border rounded-xl border-border sm:p-5">
                                <h2 className="text-lg font-bold text-ink">To-do list</h2>
                                {todoItems.length === 0 ? (
                                    <p className="mt-4 text-sm text-ink-soft">You are all caught up.</p>
                                ) : (
                                    <ul className="mt-4 space-y-3">
                                        {todoItems.map((item) => (
                                            <li key={item.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => onTodoClick(item)}
                                                    className="flex w-full gap-3 text-sm text-left min-h-11 text-ink hover:text-primary"
                                                >
                                                    <span className="w-2 h-2 mt-1 rounded-full shrink-0 bg-secondary" />
                                                    <span className="wrap-break-word">{item.label}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>

                            <section className="p-4 border rounded-xl border-border sm:p-5">
                                <h2 className="text-lg font-bold text-ink">Announcements</h2>
                                {announcements.length === 0 ? (
                                    <p className="mt-4 text-sm text-ink-soft">No announcements yet.</p>
                                ) : (
                                    <div className="mt-4 space-y-3">
                                        {announcements.slice(0, 3).map((item) => (
                                            <button
                                                type="button"
                                                key={item.id}
                                                onClick={() => onTodoClick({ type: "announcement" })}
                                                className="block w-full p-3 text-left rounded-lg min-h-11 bg-bg-alt hover:bg-tint-blue"
                                            >
                                                <p className="font-semibold wrap-break-word text-ink">{item.title}</p>
                                                <p className="mt-1 text-xs line-clamp-2 text-ink-soft">{item.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}

function SummaryCard({ label, value }) {
    return (
        <div className="min-w-0 p-4 border rounded-xl border-border bg-bg-alt sm:p-5">
            <p className="text-xs font-semibold uppercase wrap-break-word text-ink-muted">{label}</p>
            <p className="mt-2 text-2xl font-bold text-primary sm:text-3xl">{value}</p>
        </div>
    );
}

export default StudentOverview;
