function AdminSettings({ user }) {
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