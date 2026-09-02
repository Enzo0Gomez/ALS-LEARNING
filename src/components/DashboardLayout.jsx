import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

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
            <aside className="fixed inset-y-0 left-0 z-40 flex w-20 flex-col text-white bg-primary lg:w-64">

                {/* Brand */}
                <div className="px-3 py-5 border-b border-white/10 lg:px-6 lg:py-6">
                    <p className="text-center text-sm font-bold lg:text-left lg:text-lg">
                        ALS Learning Hub
                    </p>

                    <p className="hidden mt-1 text-xs uppercase tracking-[0.2em] text-white/60 lg:block">
                        {portalLabel}
                    </p>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 px-2 py-5 space-y-1 overflow-y-auto lg:px-4 lg:py-6">

                    {items.map((item) => {
                        const isActive = item.id === activeSection;

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onSectionChange(item.id)}
                                title={item.label}
                                className={`flex w-full items-center justify-center gap-3 rounded-xl px-2 py-3 text-sm font-semibold transition lg:justify-start lg:px-4 ${
                                    isActive
                                        ? "bg-white text-primary shadow"
                                        : "text-white/80 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                                <span
                                    aria-hidden="true"
                                    className="text-base"
                                >
                                    <FontAwesomeIcon icon={item.icon} fixedWidth aria-hidden="true" />
                                </span>

                                <span className="hidden lg:inline">{item.label}</span>
                            </button>
                        );
                    })}

                </nav>

                {/* User Info + Logout */}
                <div className="p-2 border-t border-white/10 lg:p-4">

                    {/* Logged-in user identity */}
                    <div className="flex items-center justify-center gap-3 px-0 pb-3 lg:justify-start lg:px-2 lg:pb-4">
                        <div className="flex items-center justify-center w-10 h-10 text-sm font-bold rounded-full shrink-0 bg-white/20">
                            {initials}
                        </div>

                        <div className="hidden min-w-0 lg:block">
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
                        title="Log out"
                        className="flex items-center justify-center w-full gap-3 px-2 py-3 text-sm font-semibold transition rounded-xl text-white/80 hover:bg-red-500/20 hover:text-white lg:justify-start lg:px-4"
                    >
                        <span
                            aria-hidden="true"
                            className="text-base"
                        >
                            <FontAwesomeIcon icon={faRightFromBracket} fixedWidth aria-hidden="true" />
                        </span>

                        <span className="hidden lg:inline">Log out</span>
                    </button>

                </div>

            </aside>

            {/* Content Area */}
            <div className="min-h-screen ml-20 lg:ml-64">
                <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 sm:py-8 lg:px-8 lg:py-10">
                    {children}
                </div>
            </div>

        </div>
    );
}

export default DashboardLayout;