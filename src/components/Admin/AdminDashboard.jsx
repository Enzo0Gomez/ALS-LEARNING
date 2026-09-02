import { useState } from "react";
import { supabase } from "../../lib/supabase";
import DashboardLayout from "../DashboardLayout";
import AdminStats from "./AdminStats";
import AdminUsers from "./AdminUsers";
import AdminSubjects from "./AdminSubjects";
import AdminSettings from "./AdminSettings";

const SECTIONS = [
    { id: "dashboard", label: "Dashboard", emoji: "📊" },
    { id: "users", label: "Users", emoji: "👥" },
    { id: "subjects", label: "Subject", emoji: "📚" },
    { id: "settings", label: "Settings", emoji: "⚙️" },
];

function AdminDashboard({ user, onLogout }) {
    const [section, setSection] = useState("dashboard");

    const handleLogout = async () => {
        await supabase.auth.signOut();
        onLogout();
    };

    return (
        <DashboardLayout
            portalLabel="Admin Portal"
            userName={
                user
                    ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                    : ""
            }
            items={SECTIONS}
            activeSection={section}
            onSectionChange={setSection}
            onLogout={handleLogout}
        >
            {section === "dashboard" && <AdminStats user={user} />}
            {section === "users" && (
                <AdminUsers currentUserId={user?.id} />
            )}
            {section === "subjects" && <AdminSubjects user={user} />}
            {section === "settings" && <AdminSettings user={user} />}
        </DashboardLayout>
    );
}

export default AdminDashboard;
