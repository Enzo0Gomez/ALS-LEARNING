function DashboardLayout({
    portalLabel,
    userName,
    items,
    activeSection,
    onSectionChange,
    onLogout,
    children,
}) {
    // Build initials for the avatar (e.g. "Juan Dela Cruz" -> "JD")
    const initials =
        (userName || "")
            .split(/\s+/)
            .filter(Boolean)
            .map((part) => part[0].toUpperCase())
            .slice(0, 2)
            .join("") || "?";

    return (
        <div className="min-h-screen bg-bg">

            {/* Fixed Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-40 flex flex-col w-64 text-white bg-primary">

                {/* Brand */}
                <div className="px-6 py-6 border-b border-white/10">
                    <p className="text-lg font-bold">
                        ALS Learning Hub
                    </p>

                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/60">
                        {portalLabel}
                    </p>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">

                    {items.map((item) => {
                        const isActive = item.id === activeSection;

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onSectionChange(item.id)}
                                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                    isActive
                                        ? "bg-white text-primary shadow"
                                        : "text-white/80 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                                <span
                                    aria-hidden="true"
                                    className="text-base"
                                >
                                    {item.emoji}
                                </span>

                                {item.label}
                            </button>
                        );
                    })}

                </nav>

                {/* User Info + Logout */}
                <div className="p-4 border-t border-white/10">

                    {/* Logged-in user identity */}
                    <div className="flex items-center gap-3 px-2 pb-4">
                        <div className="flex items-center justify-center w-10 h-10 text-sm font-bold rounded-full shrink-0 bg-white/20">
                            {initials}
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">
                                {userName || "Guest"}
                            </p>

                            <p className="flex items-center gap-1.5 text-xs text-white/60">
                                <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                Logged in
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onLogout}
                        className="flex items-center w-full gap-3 px-4 py-3 text-sm font-semibold transition rounded-xl text-white/80 hover:bg-red-500/20 hover:text-white"
                    >
                        <span
                            aria-hidden="true"
                            className="text-base"
                        >
                            🚪
                        </span>

                        Log out
                    </button>

                </div>

            </aside>

            {/* Content Area */}
            <div className="min-h-screen ml-64">
                <div className="px-8 py-10 mx-auto max-w-7xl">
                    {children}
                </div>
            </div>

        </div>
    );
}

export default DashboardLayout;