import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import Homepage from "./components/Homepage";
import Aboutpage from "./components/Aboutpage";
import Teacher from "./components/Teacher";
import Login from "./components/Login";
import Signup from "./components/Signup";

import AdminDashboard from "./components/Admin/AdminDashboard";
import TeacherDashboard from "./components/Teacher/TeacherDashboard";
import StudentDashboard from "./components/Student/StudentDashboard";
import { supabase } from "./lib/supabase";

const DASHBOARD_PAGES = [
    "admin-dashboard",
    "teacher-dashboard",
    "student-dashboard",
];

const ROLE_TO_PAGE = {
    admin: "admin-dashboard",
    teacher: "teacher-dashboard",
    student: "student-dashboard",
};

const DEFAULT_LANDING_SETTINGS = {
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

function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [restoringSession, setRestoringSession] = useState(true);
  const [landingSettings, setLandingSettings] = useState(DEFAULT_LANDING_SETTINGS);
  const [landingTeachers, setLandingTeachers] = useState([]);
  const [landingAnnouncements, setLandingAnnouncements] = useState([]);

  // Restore the logged-in session on page load / refresh so the
  // user's name and dashboard persist across reloads.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const { data } = await supabase.auth.getSession();
        const sessionUser = data?.session?.user;

        if (sessionUser) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, role")
            .eq("id", sessionUser.id)
            .single();

          if (!cancelled && profile) {
            setUser(profile);

            // If we're on a public page, send them to their dashboard
            setPage((currentPage) =>
              DASHBOARD_PAGES.includes(currentPage)
                ? currentPage
                : ROLE_TO_PAGE[profile.role] || currentPage
            );
          }
        }
      } catch (err) {
        console.error("Session restore error:", err);
      } finally {
        if (!cancelled) setRestoringSession(false);
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    async function loadLandingSettings() {
      const { data, error } = await supabase
        .from("site_settings")
        .select("hero_title, hero_description, primary_button_text, secondary_button_text")
        .eq("id", true)
        .single();
      if (!error && data) setLandingSettings(data);
    }
    loadLandingSettings();
    async function loadLandingTeachers() {
      const { data } = await supabase
        .from("site_teachers")
        .select("id, name, role, bio, quote, image_url, sort_order")
        .order("sort_order")
        .order("created_at");
      if (data) setLandingTeachers(data);
    }
    loadLandingTeachers();
    async function loadLandingAnnouncements() {
      const { data } = await supabase.from("announcements").select("id, title, description, image_url, pdf_url, created_at").eq("post_landing", true).order("created_at", { ascending: false });
      if (data) setLandingAnnouncements(data);
    }
    loadLandingAnnouncements();
  }, []);

  const handleAdminLogin = (profile) => {
    setUser(profile);
    setPage("admin-dashboard");
  };

  const handleTeacherLogin = (profile) => {
    setUser(profile);
    setPage("teacher-dashboard");
  };

  const handleStudentLogin = (profile) => {
    setUser(profile);
    setPage("student-dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setPage("login");
  };

  // Dashboards use their own fixed sidebar instead of the navbar
  const showNavbar = !DASHBOARD_PAGES.includes(page);

  if (restoringSession) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <p className="text-sm font-semibold text-ink-soft">
          Loading your session…
        </p>
      </div>
    );
  }

  return (
    <>
      {showNavbar && <Navbar onNavigate={setPage} />}

      {page === "home" && (
        <Homepage settings={landingSettings} announcements={landingAnnouncements} onNavigate={setPage} />
      )}

      {page === "about" && (
        <Aboutpage settings={landingSettings} />
      )}

      {page === "teacher" && (
        <Teacher settings={landingSettings} teachers={landingTeachers} />
      )}

      {page === "login" && (
        <Login
          onSignUp={() => setPage("signup")}
          onAdminLogin={handleAdminLogin}
          onTeacherLogin={handleTeacherLogin}
          onStudentLogin={handleStudentLogin}
        />
      )}

      {page === "signup" && (
        <Signup onLogin={() => setPage("login")} />
      )}

      {page === "admin-dashboard" && (
        <AdminDashboard
          user={user}
          onLogout={handleLogout}
          onSettingsSaved={setLandingSettings}
          onTeachersSaved={setLandingTeachers}
          onAnnouncementsSaved={setLandingAnnouncements}
        />
      )}

      {page === "teacher-dashboard" && (
        <TeacherDashboard user={user} onLogout={handleLogout} />
      )}

      {page === "student-dashboard" && (
        <StudentDashboard user={user} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;