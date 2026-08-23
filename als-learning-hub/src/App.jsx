import { useState } from "react";

import Navbar from "./components/Navbar";
import Homepage from "./components/Homepage";
import Aboutpage from "./components/Aboutpage";
import Teacher from "./components/Teacher";
import Login from "./components/Login";
import Signup from "./components/Signup";

import AdminDashboard from "./components/Admin/AdminDashboard";
import TeacherDashboard from "./components/Teacher/TeacherDashboard";
import StudentDashboard from "./components/Student/StudentDashboard";

function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);

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

  return (
    <>
      <Navbar onNavigate={setPage} />

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
        <AdminDashboard user={user} />
      )}

      {page === "teacher-dashboard" && (
        <TeacherDashboard user={user} />
      )}

      {page === "student-dashboard" && (
        <StudentDashboard user={user} />
      )}
    </>
  );
}

export default App;