import { useState } from "react";
import { supabase } from "../../lib/supabase";
import DashboardLayout from "../DashboardLayout";
import AdminStats from "./AdminStats";
import AdminUsers from "./AdminUsers";
import AdminSubjects from "./AdminSubjects";
import AdminSettings from "./AdminSettings";
import AdminAnnouncements from "./AdminAnnouncements";
import { faChartPie, faUsers, faBookOpen, faGear, faBullhorn } from "@fortawesome/free-solid-svg-icons";

const SECTIONS = [
    { id: "dashboard", label: "Dashboard", icon: faChartPie },
    { id: "users", label: "Users", icon: faUsers },
    { id: "subjects", label: "Subject", icon: faBookOpen },
    { id: "settings", label: "Settings", icon: faGear },
    { id: "announcements", label: "Announcements", icon: faBullhorn },
];

function AdminDashboard({ user, onLogout, onSettingsSaved, onTeachersSaved, onAnnouncementsSaved }) {
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
            {section === "settings" && <AdminSettings user={user} onSettingsSaved={onSettingsSaved} onTeachersSaved={onTeachersSaved} />}
            {section === "announcements" && <AdminAnnouncements user={user} onAnnouncementsSaved={onAnnouncementsSaved} />}
        </DashboardLayout>
    );
}

export default AdminDashboard;
