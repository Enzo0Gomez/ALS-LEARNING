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

function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [restoringSession, setRestoringSession] = useState(true);

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
        <Homepage />
      )}

      {page === "about" && (
        <Aboutpage />
      )}

      {page === "teacher" && (
        <Teacher />
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
        <AdminDashboard user={user} onLogout={handleLogout} />
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