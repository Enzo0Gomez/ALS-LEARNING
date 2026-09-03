import { useState } from "react";
import { supabase } from "../../lib/supabase";
import DashboardLayout from "../DashboardLayout";
import StudentContent from "./StudentContent";
import { faChartPie, faBookOpen, faClipboardCheck, faChartLine, faBullhorn } from "@fortawesome/free-solid-svg-icons";

const SECTIONS = [
    { id: "dashboard", label: "Dashboard", icon: faChartPie },
    { id: "modules", label: "My Modules", icon: faBookOpen },
    { id: "quizzes", label: "Quizzes", icon: faClipboardCheck },
    { id: "progress", label: "My Progress", icon: faChartLine },
    { id: "announcements", label: "Announcements", icon: faBullhorn },
];

function StudentDashboard({ user, onLogout }) {
    const [section, setSection] = useState("dashboard");
    const handleLogout = async () => {
        await supabase.auth.signOut();
        onLogout();
    };
    return (
        <DashboardLayout
            portalLabel="Student Portal"
            userName={user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : ""}
            items={SECTIONS}
            activeSection={section}
            onSectionChange={setSection}
            onLogout={handleLogout}
        >
            <StudentContent user={user} section={section} onSectionChange={setSection} />
        </DashboardLayout>
    );
}

export default StudentDashboard;
