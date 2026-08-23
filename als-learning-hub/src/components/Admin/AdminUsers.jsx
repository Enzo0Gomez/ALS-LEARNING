import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const ROLE_OPTIONS = [
    { value: "admin", label: "Admin" },
    { value: "teacher", label: "Teacher" },
    { value: "student", label: "Student" },
];

function AdminUsers({ currentUserId }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search & role filter
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    // Edit modal state
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({
        firstName: "",
        lastName: "",
        role: "student",
        password: "",
    });
    const [saving, setSaving] = useState(false);

    // Deactivate/activate in-flight row
    const [togglingId, setTogglingId] = useState(null);

    // Deactivate confirmation modal
    const [deactivatingUser, setDeactivatingUser] = useState(null);

    // Feedback messages
    const [actionError, setActionError] = useState("");
    const [actionSuccess, setActionSuccess] = useState("");

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        try {
            const result = await supabase
                .from("profiles")
                .select(
                    "id, first_name, last_name, role, username, is_active"
                )
                .order("created_at", { ascending: true });

            if (result.error) throw result.error;

            setUsers(result.data || []);
        } catch (err) {
            console.error("Users fetch error:", err);
            setActionError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function openEdit(u) {
        setActionError("");
        setActionSuccess("");
        setEditingUser(u);
        setEditForm({
            firstName: u.first_name || "",
            lastName: u.last_name || "",
            role: u.role || "student",
            password: "",
        });
    }

    function closeEdit() {
        setEditingUser(null);
        setEditForm({
            firstName: "",
            lastName: "",
            role: "student",
            password: "",
        });
    }

    async function saveEdit(e) {
        e.preventDefault();

        if (!editingUser) return;

        setSaving(true);
        setActionError("");
        setActionSuccess("");

        try {
            // 1. Update name + role in profiles
            const updateResult = await supabase
                .from("profiles")
                .update({
                    first_name: editForm.firstName.trim(),
                    last_name: editForm.lastName.trim(),
                    role: editForm.role,
                })
                .eq("id", editingUser.id);

            if (updateResult.error) throw updateResult.error;

            // 2. Optionally reset the password
            if (editForm.password) {
                if (editForm.password.length < 6) {
                    throw new Error(
                        "Password must be at least 6 characters."
                    );
                }

                const pwResult = await supabase.rpc(
                    "admin_set_user_password",
                    {
                        target_user_id: editingUser.id,
                        new_password: editForm.password,
                    }
                );

                if (pwResult.error) throw pwResult.error;
            }

            setActionSuccess(
                `Successfully updated ${
                    editForm.firstName
                } ${editForm.lastName}`.trim()
            );
            closeEdit();
            await loadUsers();
        } catch (err) {
            console.error("Save edit error:", err);
            setActionError(err.message);
        } finally {
            setSaving(false);
        }
    }

    function openDeactivate(u) {
        setActionError("");
        setActionSuccess("");
        setDeactivatingUser(u);
    }

    function closeDeactivate() {
        setDeactivatingUser(null);
    }

    async function confirmDeactivate() {
        if (!deactivatingUser) return;

        await toggleActive(deactivatingUser);
        setDeactivatingUser(null);
    }

    async function activateUser(u) {
        setTogglingId(u.id);
        setActionError("");
        setActionSuccess("");

        try {
            const result = await supabase.rpc("admin_set_user_active", {
                target_user_id: u.id,
                is_active: true,
            });

            if (result.error) throw result.error;

            setActionSuccess(
                `${
                    `${u.first_name} ${u.last_name}`.trim() || "User"
                } is now active again.`
            );
            await loadUsers();
        } catch (err) {
            console.error("Activate error:", err);
            setActionError(err.message);
        } finally {
            setTogglingId(null);
        }
    }

    async function toggleActive(u) {
        setTogglingId(u.id);
        setActionError("");
        setActionSuccess("");

        try {
            const result = await supabase.rpc("admin_set_user_active", {
                target_user_id: u.id,
                is_active: !u.is_active,
            });

            if (result.error) throw result.error;

            setActionSuccess(
                `${
                    `${u.first_name} ${u.last_name}`.trim() || "User"
                } is now ${u.is_active ? "deactivated" : "active"}.`
            );
            await loadUsers();
        } catch (err) {
            console.error("Toggle active error:", err);
            setActionError(err.message);
        } finally {
            setTogglingId(null);
        }
    }

    // Client-side search + role filter
    const filteredUsers = users.filter((u) => {
        const matchesRole =
            roleFilter === "all" || u.role === roleFilter;

        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
            !query ||
            `${u.first_name} ${u.last_name}`
                .toLowerCase()
                .includes(query) ||
            (u.username || "").toLowerCase().includes(query);

        return matchesRole && matchesSearch;
    });

    const deactivatedCount = users.filter(
        (u) => u.is_active === false
    ).length;

    const roleBadgeClass = {
        admin: "bg-tint-blue text-primary",
        teacher: "bg-tint-green text-ink",
        student: "bg-highlight-soft text-ink",
    };

    return (
        <>
            {/* Header */}
            <div className="p-8 shadow rounded-2xl bg-surface">
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-secondary">
                    Management
                </p>

                <h1 className="mt-2 text-3xl font-bold text-primary sm:text-4xl">
                    Users
                </h1>

                <p className="max-w-2xl mt-3 text-ink-soft">
                    Search, filter, edit, and manage all registered
                    accounts.
                </p>
            </div>

            {/* Action feedback */}
            {actionSuccess && (
                <div className="p-4 mt-6 border border-green-200 rounded-xl bg-green-50">
                    <p className="text-sm font-medium text-green-700">
                        {actionSuccess}
                    </p>
                </div>
            )}

            {actionError && !editingUser && (
                <div className="p-4 mt-6 border border-red-200 rounded-xl bg-red-50">
                    <p className="text-sm font-medium text-red-600">
                        {actionError}
                    </p>
                </div>
            )}

            {/* Deactivated accounts notice */}
            {deactivatedCount > 0 && (
                <div className="flex items-center justify-between p-4 mt-6 border rounded-xl border-border bg-bg-alt">
                    <p className="text-sm text-ink-soft">
                        <span className="font-semibold text-ink">
                            {deactivatedCount}
                        </span>{" "}
                        deactivated account(s). Use the{" "}
                        <span className="font-semibold text-ink">
                            ✅ Activate
                        </span>{" "}
                        button to restore their access.
                    </p>
                </div>
            )}

            {/* Search & Filter Toolbar */}
            <div className="flex flex-col gap-4 mt-8 sm:flex-row sm:items-center">
                {/* Search Bar */}
                <div className="relative flex-1">
                    <span
                        aria-hidden="true"
                        className="absolute -translate-y-1/2 left-4 top-1/2 text-ink-muted"
                    >
                        🔍
                    </span>

                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or username…"
                        className="w-full py-3 pr-4 text-sm transition border outline-none pl-11 rounded-xl border-border bg-surface text-ink placeholder:text-ink-muted focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                    />
                </div>

                {/* Role Filter */}
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-3 text-sm font-semibold transition border outline-none rounded-xl border-border bg-surface text-ink focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="mt-6 overflow-hidden shadow rounded-2xl bg-surface">
                {loading ? (
                    <p className="p-8 text-center text-ink-soft">
                        Loading users…
                    </p>
                ) : filteredUsers.length === 0 ? (
                    <p className="p-8 text-center text-ink-soft">
                        No users match your search or filter.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-bg-alt text-ink-soft">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">
                                        Name
                                    </th>
                                    <th className="px-6 py-4 font-semibold">
                                        User ID
                                    </th>
                                    <th className="px-6 py-4 font-semibold">
                                        Username
                                    </th>
                                    <th className="px-6 py-4 font-semibold">
                                        Role
                                    </th>
                                    <th className="px-6 py-4 font-semibold">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-border">
                                {filteredUsers.map((u) => {
                                    const isSelf = u.id === currentUserId;
                                    const isToggling =
                                        togglingId === u.id;
                                    const isDeactivated =
                                        u.is_active === false;

                                    return (
                                        <tr
                                            key={u.id}
                                            className={`transition hover:bg-bg-alt/50 ${
                                                isDeactivated ?
                                                    "opacity-70" :
                                                    ""
                                            }`}
                                        >
                                            <td className="px-6 py-4 font-medium text-ink">
                                                {u.first_name}{" "}
                                                {u.last_name}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    title={u.id}
                                                    className="font-mono text-xs text-ink-soft"
                                                >
                                                    {u.id ?
                                                        u.id.slice(0, 13) +
                                                        "…" :
                                                        "-"}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-ink-soft">
                                                {u.username || "-"}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-block px-3 py-1 text-xs font-semibold uppercase rounded-full ${
                                                        roleBadgeClass[
                                                            u.role
                                                        ] ||
                                                        "bg-bg-alt text-ink-soft"
                                                    }`}
                                                >
                                                    {u.role}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                {isDeactivated ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-tint-red text-accent">
                                                        <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                                                        Deactivated
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-tint-green text-ink">
                                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                                        Active
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    {/* Edit */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEdit(u)
                                                        }
                                                        className="px-3 py-2 text-xs font-semibold transition rounded-lg bg-tint-blue text-primary hover:bg-primary hover:text-white"
                                                    >
                                                        ✏️ Edit
                                                    </button>

                                                    {/* Deactivate / Activate */}
                                                    {isDeactivated ? (
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                isToggling
                                                            }
                                                            onClick={() =>
                                                                activateUser(
                                                                    u
                                                                )
                                                            }
                                                            className="px-3 py-2 text-xs font-semibold text-white transition bg-green-600 rounded-lg hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
                                                        >
                                                            {isToggling ?
                                                                "…" :
                                                                "✅ Activate"}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                isSelf ||
                                                                isToggling
                                                            }
                                                            title={
                                                                isSelf ?
                                                                    "You cannot deactivate your own account." :
                                                                    undefined
                                                            }
                                                            onClick={() =>
                                                                openDeactivate(
                                                                    u
                                                                )
                                                            }
                                                            className="px-3 py-2 text-xs font-semibold transition rounded-lg bg-tint-red text-accent hover:bg-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                                        >
                                                            🚫 Deactivate
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                    onClick={closeEdit}
                >
                    <div
                        className="w-full max-w-md shadow-xl rounded-2xl bg-surface"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <form onSubmit={saveEdit} className="p-6 space-y-5">

                            {/* Modal Header */}
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-ink">
                                    Edit User
                                </h2>

                                <button
                                    type="button"
                                    onClick={closeEdit}
                                    className="w-8 h-8 transition rounded-full text-ink-soft hover:bg-bg-alt hover:text-ink"
                                >
                                    ✕
                                </button>
                            </div>

                            <p className="text-sm text-ink-soft">
                                Editing{" "}
                                <span className="font-semibold text-ink">
                                    {editingUser.first_name}{" "}
                                    {editingUser.last_name}
                                </span>{" "}
                                ({editingUser.username || "no username"})
                            </p>

                            {/* First Name */}
                            <div>
                                <label
                                    htmlFor="editFirstName"
                                    className="block mb-2 text-sm font-semibold text-ink"
                                >
                                    First Name
                                </label>

                                <input
                                    id="editFirstName"
                                    type="text"
                                    value={editForm.firstName}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            firstName: e.target.value,
                                        })
                                    }
                                    required
                                    className="w-full px-4 py-3 text-sm transition border outline-none rounded-xl border-border bg-surface text-ink focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                                />
                            </div>

                            {/* Last Name */}
                            <div>
                                <label
                                    htmlFor="editLastName"
                                    className="block mb-2 text-sm font-semibold text-ink"
                                >
                                    Last Name
                                </label>

                                <input
                                    id="editLastName"
                                    type="text"
                                    value={editForm.lastName}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            lastName: e.target.value,
                                        })
                                    }
                                    required
                                    className="w-full px-4 py-3 text-sm transition border outline-none rounded-xl border-border bg-surface text-ink focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                                />
                            </div>

                            {/* Role */}
                            <div>
                                <label
                                    htmlFor="editRole"
                                    className="block mb-2 text-sm font-semibold text-ink"
                                >
                                    Role
                                </label>

                                <select
                                    id="editRole"
                                    value={editForm.role}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            role: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-3 text-sm transition border outline-none rounded-xl border-border bg-surface text-ink focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                                >
                                    {ROLE_OPTIONS.map((opt) => (
                                        <option
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* New Password */}
                            <div>
                                <label
                                    htmlFor="editPassword"
                                    className="block mb-2 text-sm font-semibold text-ink"
                                >
                                    New Password
                                </label>

                                <input
                                    id="editPassword"
                                    type="password"
                                    value={editForm.password}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            password: e.target.value,
                                        })
                                    }
                                    placeholder="Leave blank to keep current password"
                                    minLength={6}
                                    className="w-full px-4 py-3 text-sm transition border outline-none rounded-xl border-border bg-surface text-ink placeholder:text-ink-muted focus:border-highlight focus:ring-4 focus:ring-highlight-soft"
                                />

                                <p className="mt-2 text-xs text-ink-muted">
                                    Minimum 6 characters. Leave empty to
                                    keep the current password.
                                </p>
                            </div>

                            {/* Modal Error */}
                            {actionError && (
                                <div className="px-4 py-3 border border-red-200 rounded-xl bg-red-50">
                                    <p className="text-sm font-medium text-red-600">
                                        {actionError}
                                    </p>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeEdit}
                                    className="flex-1 px-5 py-3 text-sm font-semibold transition border rounded-xl border-border bg-surface text-ink hover:bg-bg-alt"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-5 py-3 text-sm font-semibold text-white transition rounded-xl bg-primary hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving
                                        ? "Saving…"
                                        : "Save Changes"}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* Deactivate Confirmation Modal */}
            {deactivatingUser && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                    onClick={closeDeactivate}
                >
                    <div
                        className="w-full max-w-sm shadow-xl rounded-2xl bg-surface"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 text-center">

                            {/* Warning Icon */}
                            <div className="flex items-center justify-center mx-auto text-2xl rounded-full w-14 h-14 bg-tint-red">
                                🚫
                            </div>

                            <h2 className="mt-4 text-lg font-bold text-ink">
                                Deactivate account?
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-ink-soft">
                                Are you sure you want to deactivate{" "}
                                <span className="font-semibold text-ink">
                                    {deactivatingUser.first_name}{" "}
                                    {deactivatingUser.last_name}
                                </span>
                                ? They will no longer be able to log in
                                until you activate their account again.
                            </p>

                            {/* Error */}
                            {actionError && (
                                <div className="px-4 py-3 mt-4 border border-red-200 rounded-xl bg-red-50">
                                    <p className="text-sm font-medium text-red-600">
                                        {actionError}
                                    </p>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeDeactivate}
                                    className="flex-1 px-5 py-3 text-sm font-semibold transition border rounded-xl border-border bg-surface text-ink hover:bg-bg-alt"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    disabled={togglingId !== null}
                                    onClick={confirmDeactivate}
                                    className="flex-1 px-5 py-3 text-sm font-semibold text-white transition rounded-xl bg-accent hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {togglingId !== null
                                        ? "Working…"
                                        : "Yes, Deactivate"}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default AdminUsers;